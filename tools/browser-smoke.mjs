import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'node:net'

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const baseUrl = process.env.BRACELET_URL || 'http://127.0.0.1:4181'

async function availablePort() {
  return await new Promise((resolve, reject) => {
    const server = createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port
      server.close(() => resolve(port))
    })
  })
}

async function retry(action, attempts = 50) {
  let lastError
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try { return await action() } catch (error) {
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
  throw lastError
}

async function connect(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  let requestId = 0
  const pending = new Map()
  const events = new Map()
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (message.id) {
      const request = pending.get(message.id)
      if (!request) return
      pending.delete(message.id)
      if (message.error) request.reject(new Error(message.error.message))
      else request.resolve(message.result)
      return
    }
    const waiters = events.get(message.method) || []
    events.delete(message.method)
    waiters.forEach((resolve) => resolve(message.params))
  })
  return {
    close: () => socket.close(),
    send(method, params = {}) {
      requestId += 1
      return new Promise((resolve, reject) => {
        pending.set(requestId, { resolve, reject })
        socket.send(JSON.stringify({ id: requestId, method, params }))
      })
    },
    event(method) {
      return new Promise((resolve) => {
        const waiters = events.get(method) || []
        waiters.push(resolve)
        events.set(method, waiters)
      })
    }
  }
}

async function evaluate(client, expression) {
  const result = await client.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Browser evaluation failed')
  return result.result.value
}

async function navigate(client, url) {
  const loaded = client.event('Page.loadEventFired')
  await client.send('Page.navigate', { url })
  await loaded
}

async function reload(client) {
  const loaded = client.event('Page.loadEventFired')
  await client.send('Page.reload', { ignoreCache: true })
  await loaded
}

async function drag(client, from, to) {
  await client.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: from.x, y: from.y })
  await client.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: from.x, y: from.y, button: 'left', buttons: 1, clickCount: 1 })
  await client.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: to.x, y: to.y, button: 'left', buttons: 1 })
  await client.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: to.x, y: to.y, button: 'left', buttons: 0, clickCount: 1 })
}

const port = await availablePort()
const profile = mkdtempSync(join(tmpdir(), 'bracelet-browser-smoke-'))
const adminPort = await availablePort()
const adminData = mkdtempSync(join(tmpdir(), 'bracelet-admin-mobile-'))
const adminServer = spawn(process.execPath, ['server.mjs'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PORT: String(adminPort),
    BRACELET_DB_PATH: join(adminData, 'bracelet.db'),
    BRACELET_DISABLE_AUTH: '1',
    BRACELET_SEED_MODE: 'demo'
  },
  stdio: 'ignore'
})
const browser = spawn(edgePath, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  'about:blank'
], { stdio: 'ignore' })

try {
  await retry(async () => {
    const response = await fetch(`http://127.0.0.1:${adminPort}/api/catalog`)
    if (!response.ok) throw new Error('Admin fixture server is not ready')
  })
  await retry(async () => {
    const response = await fetch(`http://127.0.0.1:${port}/json/version`)
    if (!response.ok) throw new Error('Browser is not ready')
  })
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(`${baseUrl}/diy.html`)}`, { method: 'PUT' })).json()
  const client = await connect(target.webSocketDebuggerUrl)
  try {
    await client.send('Page.enable')
    await client.send('Runtime.enable')
    await client.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
    await reload(client)

    const desktop = await evaluate(client, `(() => {
      const preview = document.querySelector('.preview-pane').getBoundingClientRect()
      const controls = document.querySelector('.control-pane').getBoundingClientRect()
      const saved = JSON.parse(localStorage.getItem('puguang-design'))
      return {
        viewport: [innerWidth, innerHeight],
        overflow: document.documentElement.scrollWidth - innerWidth,
        startsEmpty: saved.beads.filter(Boolean).length === 0,
        panelsOverlap: preview.right > controls.left + 1,
        brandMatchesCatalog: document.querySelector('.brand strong').textContent === window.__CATALOG__.settings.brandName && document.title.includes(window.__CATALOG__.settings.brandName),
        emptyPriceLabels: ['totalPrice', 'footerPrice', 'mobileFooterPrice'].map((id) => document.getElementById(id).previousElementSibling.textContent),
        emptyPriceValues: ['totalPrice', 'footerPrice', 'mobileFooterPrice'].map((id) => document.getElementById(id).textContent),
        expectedCraftPrice: '¥ ' + window.__CATALOG__.settings.craftPrices[8]
      }
    })()`)
    assert.deepEqual(desktop.viewport, [1440, 900])
    assert.ok(desktop.overflow <= 1, `Desktop overflowed by ${desktop.overflow}px`)
    assert.equal(desktop.startsEmpty, true)
    assert.equal(desktop.panelsOverlap, false)
    assert.equal(desktop.brandMatchesCatalog, true)
    assert.deepEqual(desktop.emptyPriceLabels, ['基础手工费', '基础手工费', '基础手工费'])
    assert.deepEqual(desktop.emptyPriceValues, [desktop.expectedCraftPrice, desktop.expectedCraftPrice, desktop.expectedCraftPrice])

    const materialDetail = await evaluate(client, `(() => {
      const before = JSON.parse(localStorage.getItem('puguang-design')).beads.filter(Boolean).length
      document.querySelector('.material-detail-button').click()
      const dialog = document.querySelector('#materialDetailDialog')
      const result = {
        open: dialog.open,
        name: document.querySelector('#materialDetailName').textContent,
        images: document.querySelectorAll('#materialDetailGallery img').length,
        variants: document.querySelectorAll('#materialDetailVariants .material-detail-variant').length,
        after: JSON.parse(localStorage.getItem('puguang-design')).beads.filter(Boolean).length
      }
      document.querySelector('#closeMaterialDetailDialog').click()
      return result
    })()`)
    assert.equal(materialDetail.open, true)
    assert.ok(materialDetail.name)
    assert.equal(materialDetail.variants, 3)
    assert.equal(materialDetail.after, 0, 'Opening material details unexpectedly added a bead')

    const filtering = await evaluate(client, `(() => {
      const before = [...document.querySelectorAll('#materialGrid .material-card')].map((item) => item.querySelector('strong')?.textContent).filter(Boolean)
      const facetButton = [...document.querySelectorAll('#materialFacetTabs button')].find((button) => button.textContent === '珠材分类')
      facetButton?.click()
      const optionButton = [...document.querySelectorAll('#materialFacetOptions button')].find((button) => !button.classList.contains('active'))
      optionButton?.click()
      const filtered = [...document.querySelectorAll('#materialGrid .material-card')].map((item) => item.querySelector('strong')?.textContent).filter(Boolean)
      const colorButton = [...document.querySelectorAll('#materialFacetTabs button')].find((button) => button.textContent === '颜色分类')
      colorButton?.click()
      return {
        facetVisible: Boolean(facetButton),
        optionVisible: Boolean(optionButton),
        beforeCount: before.length,
        filteredCount: filtered.length,
        filteredChanged: JSON.stringify(filtered) !== JSON.stringify(before),
        colorLabelsHidden: [...document.querySelectorAll('#materialFacetOptions .catalog-color-option')].every((button) => button.textContent.trim() === '')
      }
    })()`)
    assert.equal(filtering.facetVisible, true)
    assert.equal(filtering.optionVisible, true)
    assert.equal(filtering.filteredChanged, true)
    assert.equal(filtering.colorLabelsHidden, true)

    const addition = await evaluate(client, `(() => {
      const clickAvailableCard = (excludedName = '') => {
        const card = [...document.querySelectorAll('.material-card:not(:disabled)')]
          .find((item) => item.querySelector('strong')?.textContent !== excludedName)
        if (!card) return ''
        const name = card.querySelector('strong')?.textContent || ''
        card.click()
        return name
      }
      const firstName = clickAvailableCard()
      for (let index = 1; index < 4; index += 1) clickAvailableCard('')
      let secondName = clickAvailableCard(firstName)
      if (!secondName) {
        const nextColor = [...document.querySelectorAll('#materialFacetOptions .catalog-color-option')]
          .find((button) => !button.classList.contains('active'))
        nextColor?.click()
        secondName = clickAvailableCard(firstName)
      }
      const draft = JSON.parse(localStorage.getItem('puguang-design'))
      const used = draft.beads.filter(Boolean)
      return { used: used.length, distinct: new Set(used).size, firstName, secondName, timeOrigin: performance.timeOrigin }
    })()`)
    assert.equal(addition.used, 5)
    assert.ok(addition.distinct >= 2, 'Adding a second material replaced an earlier bead')

    const movePlan = await evaluate(client, `(() => {
      const draft = JSON.parse(localStorage.getItem('puguang-design'))
      const values = draft.beads
      const sourceIndex = values.findLastIndex(Boolean)
      const targetIndex = values.findIndex((value, index) => !value && index > sourceIndex)
      const source = document.querySelector('.bead[data-slot-index="' + sourceIndex + '"]').getBoundingClientRect()
      const root = document.querySelector('#bracelet').getBoundingClientRect()
      const total = Math.max(Math.round(draft.wrist * 10 / draft.beadSize), values.length)
      const angle = -Math.PI / 2 + targetIndex / total * Math.PI * 2
      return {
        sourceIndex,
        targetIndex,
        sourceValue: values[sourceIndex],
        from: { x: source.left + source.width / 2, y: source.top + source.height / 2 },
        to: { x: root.left + root.width * (50 + Math.cos(angle) * 34) / 100, y: root.top + root.height * (50 + Math.sin(angle) * 34) / 100 }
      }
    })()`)
    await drag(client, movePlan.from, movePlan.to)
    const moved = await evaluate(client, `JSON.parse(localStorage.getItem('puguang-design')).beads`)
    assert.equal(moved[movePlan.sourceIndex], null, 'Dragging to an empty slot did not clear the source slot')
    assert.equal(moved[movePlan.targetIndex], movePlan.sourceValue, 'Dragging to an empty slot did not keep the bead at the target')

    const swapPlan = await evaluate(client, `(() => {
      const draft = JSON.parse(localStorage.getItem('puguang-design'))
      const values = draft.beads
      const targetIndex = ${movePlan.targetIndex}
      const sourceIndex = values.findIndex((value) => value && value !== values[targetIndex])
      const source = document.querySelector('.bead[data-slot-index="' + sourceIndex + '"]').getBoundingClientRect()
      const target = document.querySelector('.bead[data-slot-index="' + targetIndex + '"]').getBoundingClientRect()
      return {
        sourceIndex,
        targetIndex,
        sourceValue: values[sourceIndex],
        targetValue: values[targetIndex],
        from: { x: source.left + source.width / 2, y: source.top + source.height / 2 },
        to: { x: target.left + target.width / 2, y: target.top + target.height / 2 }
      }
    })()`)
    await drag(client, swapPlan.from, swapPlan.to)
    const swapped = await evaluate(client, `JSON.parse(localStorage.getItem('puguang-design')).beads`)
    assert.equal(swapped[swapPlan.sourceIndex], swapPlan.targetValue, 'Dragging onto a bead did not move the target bead back to the source')
    assert.equal(swapped[swapPlan.targetIndex], swapPlan.sourceValue, 'Dragging onto a bead did not move the source bead to the target')

    await reload(client)
    const reopened = await evaluate(client, `(() => {
      const draft = JSON.parse(localStorage.getItem('puguang-design'))
      const history = JSON.parse(localStorage.getItem('puguang-design-history') || '[]')
      return {
        currentCount: draft.beads.filter(Boolean).length,
        historyCounts: history.map((entry) => (entry.design?.beads || []).filter(Boolean).length),
        timeOrigin: performance.timeOrigin,
        navigationType: performance.getEntriesByType('navigation')[0]?.type,
        readyState: document.readyState
      }
    })()`)
    console.log(JSON.stringify({ addition, move: { sourceIndex: movePlan.sourceIndex, targetIndex: movePlan.targetIndex }, swap: { sourceIndex: swapPlan.sourceIndex, targetIndex: swapPlan.targetIndex }, reopened }, null, 2))
    assert.notEqual(reopened.timeOrigin, addition.timeOrigin, 'The browser did not create a new document')
    assert.equal(reopened.currentCount, 0)
    assert.ok(reopened.historyCounts.includes(5), 'The unfinished design was not kept in history')

    const restoredHistory = await evaluate(client, `(async () => {
      document.querySelector('#historyButton').click()
      document.querySelector('#historyList .quiet-button').click()
      const restored = JSON.parse(localStorage.getItem('puguang-design'))
      document.querySelector('#generateButton').click()
      const shortageOpened = document.querySelector('#shortageDialog').open
      document.querySelector('#confirmIncompleteButton').click()
      for (let attempt = 0; attempt < 50 && !document.querySelector('#resultDialog').open; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      const resultLabels = [...document.querySelectorAll('#resultSummary dt')].map((item) => item.textContent)
      const productionNote = document.querySelector('#resultDialog .production-estimate-note')?.textContent || ''
      const savedText = localStorage.getItem('puguang-order-' + document.querySelector('#designCode').textContent) || ''
      document.querySelector('#submitMerchantButton').click()
      const submissionOpened = document.querySelector('#submissionDialog').open
      const submissionNote = document.querySelector('#submissionDialog .production-estimate-note')?.textContent || ''
      document.querySelector('#closeSubmissionDialog').click()
      return {
        restoredCount: restored.beads.filter(Boolean).length,
        shortageOpened,
        resultOpened: document.querySelector('#resultDialog').open,
        code: document.querySelector('#designCode').textContent,
        resultLabels,
        productionNote,
        savedText,
        submissionOpened,
        submissionNote
      }
    })()`)
    assert.equal(restoredHistory.restoredCount, 5)
    assert.equal(restoredHistory.shortageOpened, true)
    assert.equal(restoredHistory.resultOpened, true, 'A restored history design could not be saved again')
    assert.match(restoredHistory.code, /^PG-\d{8}-[A-F0-9]{6}$/)
    assert.ok(restoredHistory.resultLabels.includes('当前用料小计'))
    assert.ok(restoredHistory.resultLabels.includes('基础手工费'))
    assert.match(restoredHistory.productionNote, /珠位和价格为预估/)
    assert.match(restoredHistory.savedText, /制作确认：珠位和价格为预估/)
    assert.equal(restoredHistory.submissionOpened, true)
    assert.match(restoredHistory.submissionNote, /珠位和价格为预估/)

    await client.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
    await navigate(client, `${baseUrl}/diy.html`)
    const mobile = await evaluate(client, `(() => ({
      viewport: [innerWidth, innerHeight],
      overflow: document.documentElement.scrollWidth - innerWidth,
      braceletVisible: document.querySelector('#bracelet').getBoundingClientRect().height > 200,
      footerVisible: document.querySelector('.mobile-action-footer').getBoundingClientRect().bottom <= innerHeight + 1
    }))()`)
    assert.deepEqual(mobile.viewport, [390, 844])
    assert.ok(mobile.overflow <= 1, `Mobile overflowed by ${mobile.overflow}px`)
    assert.equal(mobile.braceletVisible, true)
    assert.equal(mobile.footerVisible, true)

    await client.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
    await navigate(client, `${baseUrl}/`)
    const entry = await retry(async () => {
      const value = await evaluate(client, `(() => ({
        overflow: document.documentElement.scrollWidth - innerWidth,
        choices: document.querySelectorAll('.entry-choice').length,
        visualsReady: [...document.querySelectorAll('.entry-choice')].every((choice) => choice.querySelectorAll('.choice-visuals img').length >= 3)
      }))()`)
      if (!value.visualsReady) throw new Error('Entry visuals are not ready')
      return value
    })
    assert.ok(entry.overflow <= 1, `Entry page overflowed by ${entry.overflow}px`)
    assert.equal(entry.choices, 3)
    assert.equal(entry.visualsReady, true)

    await navigate(client, `${baseUrl}/recommend.html`)
    const recommendation = await retry(async () => {
      const value = await evaluate(client, `(() => ({
        overflow: document.documentElement.scrollWidth - innerWidth,
        modes: document.querySelectorAll('.recommend-modes button').length,
        options: document.querySelectorAll('.recommend-options button').length,
        maxOptionHeight: Math.max(0, ...[...document.querySelectorAll('.recommend-options button')].map((button) => button.getBoundingClientRect().height)),
        materialCards: document.querySelectorAll('.material-result').length,
        instructionHeading: document.querySelectorAll('#recommendResultTitle').length,
        resultAreaVisible: !document.querySelector('#recommendResults').hidden
      }))()`)
      if (!value.options || !value.resultAreaVisible) throw new Error('Recommendation catalog is not ready')
      return value
    })
    assert.ok(recommendation.overflow <= 1, `Recommendation page overflowed by ${recommendation.overflow}px`)
    assert.equal(recommendation.modes, 2)
    assert.ok(recommendation.options > 0)
    assert.ok(recommendation.maxOptionHeight <= 34, `Recommendation filters are too tall: ${recommendation.maxOptionHeight}px`)
    assert.equal(recommendation.materialCards, 0, 'Recommendation page unexpectedly rendered individual bead cards')
    assert.equal(recommendation.instructionHeading, 0, 'Recommendation page unexpectedly rendered an instruction-style result heading')
    assert.equal(recommendation.resultAreaVisible, true)

    await client.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
    await navigate(client, `http://127.0.0.1:${adminPort}/admin.html`)
    const adminMobile = await retry(async () => {
      const value = await evaluate(client, `(() => {
        const inspectKind = (kind) => {
          document.querySelector('#productTypes [data-kind="' + kind + '"]').click()
          const wrap = document.querySelector('.table-wrap')
          const table = document.querySelector('#productTable')
          const row = table.querySelector('.product-row')
          if (!row) return { ready: false }
          const bounds = wrap.getBoundingClientRect()
          const targets = [row.querySelector('.product-thumb'), ...row.querySelectorAll('input, select, button')].filter(Boolean)
          const horizontallyReachable = targets.every((target) => {
            const rect = target.getBoundingClientRect()
            return rect.width > 0 && rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1
          })
          return {
            ready: true,
            tableOverflow: wrap.scrollWidth - wrap.clientWidth,
            tableFits: table.getBoundingClientRect().width <= wrap.clientWidth + 1,
            horizontallyReachable,
            variants: row.querySelectorAll('.variant-row').length,
            hasCategory: Boolean(row.querySelector('.item-color-key, .item-category')),
            hasStatus: Boolean(row.querySelector('.item-active')),
            hasPhoto: Boolean(row.querySelector('.manage-photos')),
            hasSave: Boolean(row.querySelector('.save-row')),
            hasDelete: Boolean(row.querySelector('.delete-product')),
            nameLabelVisible: getComputedStyle(row.querySelector('.product-name-field > span')).display !== 'none',
            sectionLabel: getComputedStyle(row.querySelector('.material-meta, .product-meta'), '::before').content
          }
        }
        return {
          viewport: [innerWidth, innerHeight],
          pageOverflow: document.documentElement.scrollWidth - innerWidth,
          headerHidden: getComputedStyle(document.querySelector('.product-head')).display === 'none',
          brandMatchesCatalog: document.querySelector('.admin-brand strong').textContent.includes(document.querySelector('#brandName').value) && document.title.includes(document.querySelector('#brandName').value),
          materials: inspectKind('materials'),
          accessories: inspectKind('accessories'),
          cords: inspectKind('cords')
        }
      })()`)
      if (!value.materials.ready || !value.accessories.ready || !value.cords.ready) throw new Error('Admin products are not ready')
      return value
    })
    assert.deepEqual(adminMobile.viewport, [390, 844])
    assert.ok(adminMobile.pageOverflow <= 1, `Admin product page overflowed by ${adminMobile.pageOverflow}px`)
    assert.equal(adminMobile.headerHidden, true)
    assert.equal(adminMobile.brandMatchesCatalog, true)
    for (const [kind, result] of Object.entries({ materials: adminMobile.materials, accessories: adminMobile.accessories, cords: adminMobile.cords })) {
      assert.ok(result.tableOverflow <= 1, `${kind} product cards still require horizontal scrolling`)
      assert.equal(result.tableFits, true, `${kind} product table exceeds its mobile container`)
      assert.equal(result.horizontallyReachable, true, `${kind} has editing controls outside the mobile card`)
      assert.equal(result.hasStatus, true)
      assert.equal(result.hasPhoto, true)
      assert.equal(result.hasSave, true)
      assert.equal(result.hasDelete, true)
      assert.equal(result.nameLabelVisible, true)
      assert.notEqual(result.sectionLabel, 'none')
    }
    assert.equal(adminMobile.materials.variants, 3)
    assert.equal(adminMobile.materials.hasCategory, true)
    assert.equal(adminMobile.accessories.hasCategory, true)

    await client.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
    await navigate(client, `http://127.0.0.1:${adminPort}/admin.html`)
    const adminDesktop = await retry(async () => {
      const value = await evaluate(client, `(() => {
        const table = document.querySelector('#productTable')
        const head = table.querySelector('.product-head')
        const row = table.querySelector('.product-row')
        return {
          ready: Boolean(row),
          pageOverflow: document.documentElement.scrollWidth - innerWidth,
          headerVisible: getComputedStyle(head).display === 'grid',
          headerColumns: getComputedStyle(head).gridTemplateColumns.split(' ').length,
          tableWidth: table.getBoundingClientRect().width
        }
      })()`)
      if (!value.ready) throw new Error('Desktop admin products are not ready')
      return value
    })
    assert.ok(adminDesktop.pageOverflow <= 1, `Desktop admin overflowed by ${adminDesktop.pageOverflow}px`)
    assert.equal(adminDesktop.headerVisible, true)
    assert.equal(adminDesktop.headerColumns, 5)
    assert.ok(adminDesktop.tableWidth >= 900, `Desktop product table became too narrow: ${adminDesktop.tableWidth}px`)

    await navigate(client, `${baseUrl}/admin-login.html`)
    const admin = await retry(async () => {
      const value = await evaluate(client, `(async () => {
        const panel = document.querySelector('.login-card, main, form')?.getBoundingClientRect()
        const catalog = await (await fetch('/api/catalog')).json()
        return {
          path: location.pathname,
          overflow: document.documentElement.scrollWidth - innerWidth,
          panelStartsInsideViewport: Boolean(panel && panel.left >= 0 && panel.right <= innerWidth && panel.top < innerHeight),
          brandMatchesCatalog: document.querySelector('.login-brand strong').textContent === catalog.settings.brandName && document.title.includes(catalog.settings.brandName)
        }
      })()`)
      if (!value.brandMatchesCatalog) throw new Error('Admin login brand is not ready')
      return value
    })
    assert.ok(admin.overflow <= 1, `Admin login overflowed by ${admin.overflow}px`)
    assert.equal(admin.panelStartsInsideViewport, true)
    assert.equal(admin.brandMatchesCatalog, true)
    console.log(JSON.stringify({ desktop, materialDetail, filtering, addition, move: { sourceIndex: movePlan.sourceIndex, targetIndex: movePlan.targetIndex }, swap: { sourceIndex: swapPlan.sourceIndex, targetIndex: swapPlan.targetIndex }, reopened, restoredHistory, mobile, entry, recommendation, adminMobile, adminDesktop, admin }, null, 2))
  } finally {
    client.close()
  }
} finally {
  if (browser.exitCode === null) {
    const exited = new Promise((resolve) => browser.once('exit', resolve))
    browser.kill()
    await exited
  }
  if (adminServer.exitCode === null) {
    const exited = new Promise((resolve) => adminServer.once('exit', resolve))
    adminServer.kill()
    await exited
  }
  rmSync(profile, { recursive: true, force: true, maxRetries: 8, retryDelay: 200 })
  rmSync(adminData, { recursive: true, force: true, maxRetries: 8, retryDelay: 200 })
}
