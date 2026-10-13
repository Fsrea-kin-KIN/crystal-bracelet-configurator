import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import test from 'node:test'

async function availablePort() {
  return await new Promise((resolve, reject) => {
    const probe = createServer()
    probe.once('error', reject)
    probe.listen(0, '127.0.0.1', () => {
      const port = probe.address().port
      probe.close(() => resolve(port))
    })
  })
}

async function startTestServer({ auth = false } = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'bracelet-test-'))
  const port = await availablePort()
  const child = spawn(process.execPath, ['server.mjs'], {
    cwd: import.meta.dirname,
    env: { ...process.env, PORT: String(port), BRACELET_DB_PATH: join(directory, 'test.db'), BRACELET_SEED_MODE: 'demo', BRACELET_DISABLE_AUTH: auth ? '0' : '1' },
    stdio: ['ignore', 'pipe', 'pipe']
  })
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('测试服务器启动超时')), 5000)
    child.once('error', reject)
    child.stdout.on('data', (chunk) => {
      if (chunk.toString().includes('Bracelet configurator')) {
        clearTimeout(timer)
        resolve()
      }
    })
  })
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: async () => {
      child.kill()
      await new Promise((resolve) => child.once('exit', resolve))
      rmSync(directory, { recursive: true, force: true })
    }
  }
}

test('商家后台首次设置密码后才允许访问', async () => {
  const server = await startTestServer({ auth: true })
  try {
    const blocked = await fetch(`${server.baseUrl}/api/admin/catalog`)
    assert.equal(blocked.status, 401)
    const adminPage = await fetch(`${server.baseUrl}/admin.html`, { redirect: 'manual' })
    assert.equal(adminPage.status, 302)
    assert.equal(adminPage.headers.get('location'), '/admin-login.html')

    const status = await (await fetch(`${server.baseUrl}/api/admin/auth/status`)).json()
    assert.equal(status.configured, false)
    const setupResponse = await fetch(`${server.baseUrl}/api/admin/auth/setup`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'test-pass-123', remember: true })
    })
    assert.equal(setupResponse.status, 201)
    assert.match(setupResponse.headers.get('set-cookie'), /Max-Age=2592000/)
    const cookie = setupResponse.headers.get('set-cookie').split(';')[0]
    const allowed = await fetch(`${server.baseUrl}/api/admin/catalog`, { headers: { Cookie: cookie } })
    assert.equal(allowed.status, 200)

    const logout = await fetch(`${server.baseUrl}/api/admin/auth/logout`, { method: 'POST', headers: { Cookie: cookie } })
    assert.equal(logout.status, 200)
    const wrong = await fetch(`${server.baseUrl}/api/admin/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'wrong-pass' })
    })
    assert.equal(wrong.status, 401)
    const login = await fetch(`${server.baseUrl}/api/admin/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: 'test-pass-123' })
    })
    assert.equal(login.status, 200)
    assert.match(login.headers.get('set-cookie'), /HttpOnly/)
    assert.doesNotMatch(login.headers.get('set-cookie'), /Max-Age=/)
  } finally {
    await server.close()
  }
})

test('商品目录来自数据库', async () => {
  const server = await startTestServer()
  try {
    const response = await fetch(`${server.baseUrl}/api/catalog`)
    const catalog = await response.json()
    assert.equal(response.status, 200)
    assert.equal(catalog.materials.length, 15)
    assert.deepEqual(catalog.materials.find((item) => item.id === 'rutilated')?.photos, [
      './assets/beads/gold-rutilated-01.png',
      './assets/beads/gold-rutilated-02.png',
      './assets/beads/gold-rutilated-03.png'
    ])
    assert.equal(catalog.materials.find((item) => item.id === 'amethyst')?.photos.length, 4)
    assert.equal(catalog.materials.find((item) => item.id === 'aquamarine')?.photos.length, 4)
    assert.equal(catalog.materials.find((item) => item.id === 'tiger')?.name, '金虎眼')
    assert.equal(catalog.materials.find((item) => item.id === 'tiger')?.photos.length, 5)
    assert.equal(catalog.materials.find((item) => item.id === 'cinnabar')?.photos.length, 3)
    assert.equal(catalog.materials.find((item) => item.id === 'lapis')?.photos.length, 5)
    assert.equal(catalog.materials.find((item) => item.id === 'obsidian')?.name, '乌金黑曜石')
    assert.equal(catalog.materials.find((item) => item.id === 'obsidian')?.photos.length, 2)
    assert.equal(catalog.materials.find((item) => item.id === 'silver-obsidian')?.photos.length, 3)
    assert.equal(catalog.materials.find((item) => item.id === 'gold-obsidian')?.photos.length, 5)
    assert.equal(catalog.cords.length, 8)
    assert.equal(catalog.settings.cordSpec, '72号玉线 · 0.8 mm')
  } finally {
    await server.close()
  }
})

test('顾客的三种开始方式使用独立页面', async () => {
  const server = await startTestServer()
  try {
    const home = await (await fetch(server.baseUrl)).text()
    const diy = await (await fetch(`${server.baseUrl}/diy.html`)).text()
    const recommend = await (await fetch(`${server.baseUrl}/recommend.html`)).text()
    const inspiration = await (await fetch(`${server.baseUrl}/inspiration.html`)).text()
    assert.match(home, /href="\.\/diy\.html"/)
    assert.match(home, /href="\.\/recommend\.html"/)
    assert.match(home, /href="\.\/inspiration\.html"/)
    assert.doesNotMatch(home, /id="bracelet"/)
    assert.match(diy, /id="bracelet"/)
    assert.match(diy, /window\.__CATALOG__=/)
    assert.match(recommend, /src="\.\/recommend\.js/)
    assert.match(inspiration, /id="inspirationGallery"/)
  } finally {
    await server.close()
  }
})

test('一键使用说明页可访问且启动入口不会改变顾客页', async () => {
  const server = await startTestServer()
  try {
    const guide = await fetch(`${server.baseUrl}/guide.html`)
    const guideCss = await fetch(`${server.baseUrl}/guide.css`)
    assert.equal(guide.status, 200)
    assert.equal(guideCss.status, 200)
    const guideText = await guide.text()
    assert.match(guideText, /开始使用/)
    assert.match(guideText, /打开商家后台/)
  } finally {
    await server.close()
  }
})

test('方案图按圆周珠位计算贴合尺寸且后台提供产品缩略图', async () => {
  const server = await startTestServer()
  try {
    const appScript = await (await fetch(`${server.baseUrl}/app.js`)).text()
    const adminScript = await (await fetch(`${server.baseUrl}/admin.js`)).text()
    assert.match(appScript, /radius \* Math\.sin\(Math\.PI \/ slotCount\)/)
    assert.match(appScript, /function buildCatalogOptionButtons\(\)/)
    assert.match(appScript, /function accessoryPhoto\(accessory, index = 0\)/)
    assert.match(appScript, /function createHistoryThumbnail\(design\)/)
    assert.match(appScript, /row\.append\(thumbnail, copy, actions\)/)
    assert.match(appScript, /referenceImageForSubmission/)
    assert.match(adminScript, /function designThumbnail\(design\)/)
    assert.match(adminScript, /--design-cord:/)
    assert.match(adminScript, /design-reference/)
    assert.match(adminScript, /design-identity/)
  } finally {
    await server.close()
  }
})

test('商品上下架不会删除顾客草稿且旧方案仍可识别下架珠材', async () => {
  const server = await startTestServer()
  try {
    const adminCatalog = await (await fetch(`${server.baseUrl}/api/admin/catalog`)).json()
    const clear = adminCatalog.materials.find((item) => item.id === 'clear')
    const updateResponse = await fetch(`${server.baseUrl}/api/admin/materials/clear`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...clear, active: false })
    })
    assert.equal(updateResponse.status, 200)

    const activeCatalog = await (await fetch(`${server.baseUrl}/api/catalog`)).json()
    assert.equal(activeCatalog.materials.some((item) => item.id === 'clear'), false)

    const customerHtml = await (await fetch(`${server.baseUrl}/diy.html`)).text()
    assert.doesNotMatch(customerHtml, /localStorage\.removeItem\(['"]puguang-design['"]\)/)
    const catalogJson = customerHtml.match(/window\.__CATALOG__=(.*?);if\(localStorage/)[1]
    const embeddedCatalog = JSON.parse(catalogJson)
    assert.equal(embeddedCatalog.materials.find((item) => item.id === 'clear').active, false)
  } finally {
    await server.close()
  }
})

test('商家新增珠材并上传图片后会进入顾客目录', async () => {
  const server = await startTestServer()
  try {
    const createResponse = await fetch(`${server.baseUrl}/api/admin/materials`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '测试新珠', price: 12, colorKey: 'pink' })
    })
    const created = await createResponse.json()
    assert.equal(createResponse.status, 201)
    assert.equal(created.colorKey, 'pink')

    const onePixelPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
    const uploadResponse = await fetch(`${server.baseUrl}/api/admin/materials/${created.id}/photos`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: onePixelPng })
    })
    const uploaded = await uploadResponse.json()
    assert.equal(uploadResponse.status, 201)
    assert.match(uploaded.photos[0], /^\/uploads\/[a-f0-9-]+\.png$/)

    const imageResponse = await fetch(`${server.baseUrl}${uploaded.photos[0]}`)
    assert.equal(imageResponse.status, 200)
    assert.equal(imageResponse.headers.get('content-type'), 'image/png')
    const catalog = await (await fetch(`${server.baseUrl}/api/catalog`)).json()
    assert.deepEqual(catalog.materials.find((item) => item.id === created.id), {
      id: created.id, name: '测试新珠', price: 12, stock: 100, colorKey: 'pink', energyKey: 'balance', elementKey: 'earth', facetValues: { 'material-type': 'crystal' }, description: '', photos: uploaded.photos,
      variants: {
        6: { price: 12, stock: 100, active: true },
        8: { price: 12, stock: 100, active: true },
        10: { price: 12, stock: 100, active: true }
      }
    })
  } finally {
    await server.close()
  }
})

test('商家可以更换并恢复首页入口图片', async () => {
  const server = await startTestServer()
  try {
    const onePixelPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
    const uploadResponse = await fetch(`${server.baseUrl}/api/admin/settings/entry-images/recommend`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: onePixelPng })
    })
    const entryImages = await uploadResponse.json()
    assert.equal(uploadResponse.status, 201)
    assert.match(entryImages.recommend, /^\/uploads\/[a-f0-9-]+\.png$/)
    const uploadedPath = entryImages.recommend
    const customerCatalog = await (await fetch(`${server.baseUrl}/api/catalog`)).json()
    assert.equal(customerCatalog.settings.entryImages.recommend, uploadedPath)
    assert.equal((await fetch(`${server.baseUrl}${uploadedPath}`)).status, 200)

    const removeResponse = await fetch(`${server.baseUrl}/api/admin/settings/entry-images/recommend`, { method: 'DELETE' })
    assert.equal(removeResponse.status, 200)
    assert.equal((await removeResponse.json()).recommend, '')
    assert.equal((await fetch(`${server.baseUrl}${uploadedPath}`)).status, 404)
  } finally {
    await server.close()
  }
})

test('商家可以新增配件和绳色，并替换或删除珠材图片', async () => {
  const server = await startTestServer()
  try {
    const accessoryResponse = await fetch(`${server.baseUrl}/api/admin/accessories`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '测试隔片', description: '测试配件', price: 7 })
    })
    const cordResponse = await fetch(`${server.baseUrl}/api/admin/cords`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '测试紫', color: '#8877aa' })
    })
    assert.equal(accessoryResponse.status, 201)
    const accessory = await accessoryResponse.json()
    assert.equal(accessory.name, '测试隔片')
    assert.equal(cordResponse.status, 201)
    const cord = await cordResponse.json()
    assert.equal(cord.color, '#8877aa')
    const material = await (await fetch(`${server.baseUrl}/api/admin/materials`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '图片管理珠', price: 9, colorKey: 'white' })
    })).json()
    const onePixelPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
    const accessoryUpload = await fetch(`${server.baseUrl}/api/admin/accessories/${accessory.id}/photos`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: onePixelPng })
    })
    const accessoryWithPhoto = await accessoryUpload.json()
    assert.equal(accessoryUpload.status, 201)
    assert.match(accessoryWithPhoto.photos[0], /^\/uploads\/[a-f0-9-]+\.png$/)
    const customerCatalog = await (await fetch(`${server.baseUrl}/api/catalog`)).json()
    assert.deepEqual(customerCatalog.accessories.find((item) => item.id === accessory.id).photos, accessoryWithPhoto.photos)
    assert.equal(customerCatalog.cords.find((item) => item.id === cord.id).name, '测试紫')
    const added = await (await fetch(`${server.baseUrl}/api/admin/materials/${material.id}/photos`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: onePixelPng })
    })).json()
    const firstPath = added.photos[0]
    const replacedResponse = await fetch(`${server.baseUrl}/api/admin/materials/${material.id}/photos/0`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: onePixelPng })
    })
    const replaced = await replacedResponse.json()
    assert.equal(replacedResponse.status, 200)
    assert.notEqual(replaced.photos[0], firstPath)
    assert.equal((await fetch(`${server.baseUrl}${firstPath}`)).status, 404)
    const deleteResponse = await fetch(`${server.baseUrl}/api/admin/materials/${material.id}/photos/0`, { method: 'DELETE' })
    assert.equal(deleteResponse.status, 200)
    assert.deepEqual((await deleteResponse.json()).photos, [])
    assert.equal((await fetch(`${server.baseUrl}${replaced.photos[0]}`)).status, 404)
  } finally {
    await server.close()
  }
})

test('后台备份会包含上传图片并可恢复', async () => {
  const server = await startTestServer()
  try {
    const created = await (await fetch(`${server.baseUrl}/api/admin/materials`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '备份图片珠', price: 12, colorKey: 'blue' })
    })).json()
    const onePixelPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
    await fetch(`${server.baseUrl}/api/admin/materials/${created.id}/photos`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: onePixelPng })
    })
    const accessory = await (await fetch(`${server.baseUrl}/api/admin/accessories`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: '备份配件', description: '', price: 6 })
    })).json()
    await fetch(`${server.baseUrl}/api/admin/accessories/${accessory.id}/photos`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: onePixelPng })
    })
    await fetch(`${server.baseUrl}/api/admin/settings/entry-images/recommend`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: onePixelPng })
    })
    const designResponse = await fetch(`${server.baseUrl}/api/designs`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wrist: 16, beadSize: 8, beads: ['bodhi'], accessory: 'none', cord: 'clear', note: '带参考图', referenceImage: onePixelPng })
    })
    const design = await designResponse.json()
    assert.equal(designResponse.status, 201)
    assert.match(design.referenceImage, /^\/uploads\/[a-f0-9-]+\.png$/)
    const submitResponse = await fetch(`${server.baseUrl}/api/designs/${design.code}/submit`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName: '备份顾客', customerContact: 'wx-backup', quantity: 1 })
    })
    assert.equal(submitResponse.status, 200)

    const backupResponse = await fetch(`${server.baseUrl}/api/admin/backup`)
    const backup = await backupResponse.json()
    const photo = backup.data.materials.find((item) => item.id === created.id).photos[0]
    const accessoryPhoto = backup.data.accessories.find((item) => item.id === accessory.id).photos[0]
    const designPhoto = backup.data.designs.find((item) => item.code === design.code).referenceImage
    const entryPhoto = backup.data.settings.entryImages.recommend
    assert.equal(backupResponse.status, 200)
    assert.match(photo.data, /^data:image\/png;base64,/)
    assert.match(accessoryPhoto.data, /^data:image\/png;base64,/)
    assert.match(designPhoto.data, /^data:image\/png;base64,/)
    assert.match(entryPhoto.data, /^data:image\/png;base64,/)

    const restoreResponse = await fetch(`${server.baseUrl}/api/admin/backup/restore`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(backup)
    })
    const restored = await restoreResponse.json()
    assert.equal(restoreResponse.status, 200)
    assert.equal(restored.restored, true)
    const catalog = await (await fetch(`${server.baseUrl}/api/admin/catalog`)).json()
    const restoredPhoto = catalog.materials.find((item) => item.id === created.id).photos[0]
    const restoredAccessoryPhoto = catalog.accessories.find((item) => item.id === accessory.id).photos[0]
    const restoredDesign = (await (await fetch(`${server.baseUrl}/api/admin/designs`)).json()).find((item) => item.code === design.code)
    const restoredEntryPhoto = catalog.settings.entryImages.recommend
    assert.match(restoredPhoto, /^\/uploads\/[a-f0-9-]+\.png$/)
    assert.equal((await fetch(`${server.baseUrl}${restoredPhoto}`)).status, 200)
    assert.match(restoredAccessoryPhoto, /^\/uploads\/[a-f0-9-]+\.png$/)
    assert.equal((await fetch(`${server.baseUrl}${restoredAccessoryPhoto}`)).status, 200)
    assert.match(restoredDesign.referenceImage, /^\/uploads\/[a-f0-9-]+\.png$/)
    assert.equal((await fetch(`${server.baseUrl}${restoredDesign.referenceImage}`)).status, 200)
    assert.match(restoredEntryPhoto, /^\/uploads\/[a-f0-9-]+\.png$/)
    assert.equal((await fetch(`${server.baseUrl}${restoredEntryPhoto}`)).status, 200)
  } finally {
    await server.close()
  }
})

test('顾客方案保存后可以重新读取，价格由服务端计算', async () => {
  const server = await startTestServer()
  try {
    const response = await fetch(`${server.baseUrl}/api/designs`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wrist: 16, beadSize: 8, beads: ['bodhi', 'moonstone'], accessory: 'silver', cord: 'gray', note: '测试方案', totalPrice: 1 })
    })
    const created = await response.json()
    assert.equal(response.status, 201)
    assert.equal(created.totalPrice, 109)
    assert.match(created.code, /^PG-\d{8}-[A-F0-9]{6}$/)
    const savedResponse = await fetch(`${server.baseUrl}/api/designs/${created.code}`)
    const saved = await savedResponse.json()
    assert.equal(savedResponse.status, 200)
    assert.deepEqual(saved.beads, ['bodhi', 'moonstone'])
    assert.equal(saved.cord, 'gray')
    assert.equal(saved.referenceImage, '')
  } finally {
    await server.close()
  }
})

test('多个配件按珠位保存且分别计价', async () => {
  const server = await startTestServer()
  try {
    const response = await fetch(`${server.baseUrl}/api/designs`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wrist: 16,
        beadSize: 8,
        beads: ['bodhi', 'accessory:silver', 'rose', 'accessory:gold'],
        accessory: 'none',
        cord: 'clear',
        note: ''
      })
    })
    const created = await response.json()
    assert.equal(response.status, 201)
    assert.equal(created.totalPrice, 152)
    assert.deepEqual(created.beads, ['bodhi', 'accessory:silver', 'rose', 'accessory:gold'])
  } finally {
    await server.close()
  }
})

test('空珠位布局会原样保存且不参与计价', async () => {
  const server = await startTestServer()
  try {
    const slots = ['bodhi', null, null, 'rose', ...Array(16).fill(null)]
    const response = await fetch(`${server.baseUrl}/api/designs`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wrist: 16, beadSize: 8, beads: slots, accessory: 'none', cord: 'clear', note: '' })
    })
    const created = await response.json()
    assert.equal(response.status, 201)
    assert.equal(created.totalPrice, 66)
    assert.deepEqual(created.beads, slots)
  } finally {
    await server.close()
  }
})

test('空手串不能提交为顾客方案', async () => {
  const server = await startTestServer()
  try {
    const response = await fetch(`${server.baseUrl}/api/designs`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wrist: 16, beadSize: 8, beads: [], accessory: 'none', cord: 'clear', note: '' })
    })
    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), { error: '请先添加至少一颗珠子' })
  } finally {
    await server.close()
  }
})
