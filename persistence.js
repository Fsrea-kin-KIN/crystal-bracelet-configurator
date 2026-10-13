(function () {
  const catalog = window.__CATALOG__ || { settings: {}, accessories: [], cords: [] }
  const brandName = catalog.settings.brandName || '手链定制'
  const productionEstimateNote = '珠位和价格为预估，实际松紧、配件宽度与最终颗数由商家确认。'
  document.title = `${brandName} · 手链定制`
  const brandText = document.querySelector('.brand strong')
  const brandMark = document.querySelector('.brand-mark')
  if (brandText) brandText.textContent = brandName
  if (brandMark) brandMark.textContent = brandName.slice(0, 1)

  const accessoryMap = new Map(catalog.accessories.map((item) => [item.id, item]))
  document.querySelectorAll('#accessoryOptions button').forEach((button) => {
    const item = accessoryMap.get(button.dataset.value)
    button.hidden = !item
    if (!item) return
    button.dataset.price = item.price
    button.querySelector('strong').textContent = item.name
    button.querySelector('small').textContent = item.price ? `+ ¥${item.price}` : item.description
  })
  const cordMap = new Map(catalog.cords.map((item) => [item.id, item]))
  document.querySelectorAll('#cordOptions button').forEach((button) => {
    const item = cordMap.get(button.dataset.value)
    button.hidden = !item
    if (!item) return
    button.querySelector('span').style.setProperty('--cord', item.color)
    button.querySelector('strong').textContent = item.name
  })

  const originalButton = document.getElementById('generateButton')
  const saveButton = originalButton
  let lastSavedText = ''
  let lastSavedDesign = null

  const merchantFields = [
    { resultRow: 'merchantContactRow', resultValue: 'resultMerchantContact', previewRow: 'previewMerchantContactRow', previewValue: 'previewMerchantContact', value: catalog.settings.merchantContact },
    { resultRow: 'productionTimeRow', resultValue: 'resultProductionTime', previewRow: 'previewProductionTimeRow', previewValue: 'previewProductionTime', value: catalog.settings.productionTime },
    { resultRow: 'shippingNoteRow', resultValue: 'resultShippingNote', previewRow: 'previewShippingNoteRow', previewValue: 'previewShippingNote', value: catalog.settings.shippingNote },
    { resultRow: 'customNoticeRow', resultValue: 'resultCustomNotice', previewRow: 'previewCustomNoticeRow', previewValue: 'previewCustomNotice', value: catalog.settings.customNotice }
  ]
  let hasMerchantInfo = false
  merchantFields.forEach((field) => {
    const visible = Boolean(String(field.value || '').trim())
    document.getElementById(field.resultRow).hidden = !visible
    document.getElementById(field.previewRow).hidden = !visible
    if (visible) {
      document.getElementById(field.resultValue).textContent = field.value
      document.getElementById(field.previewValue).textContent = field.value
      hasMerchantInfo = true
    }
  })
  document.getElementById('merchantResultInfo').hidden = !hasMerchantInfo
  document.getElementById('merchantServiceInfo').hidden = !hasMerchantInfo

  function savedText(saved) {
    const counts = saved.beads.filter((id) => id && !String(id).startsWith('accessory:')).reduce((result, id) => { result[id] = (result[id] || 0) + 1; return result }, {})
    const accessoryCounts = saved.beads.filter((id) => String(id).startsWith('accessory:')).reduce((result, value) => {
      const id = String(value).slice(10)
      result[id] = (result[id] || 0) + 1
      return result
    }, {})
    const materialNames = new Map(catalog.materials.map((item) => [item.id, item.name]))
    const materialSummary = Object.entries(counts).map(([id, count]) => `${materialNames.get(id) || id}×${count}`).join('、')
    const accessoryNames = new Map(catalog.accessories.map((item) => [item.id, item.name]))
    const inlineAccessories = Object.entries(accessoryCounts).map(([id, count]) => `${accessoryNames.get(id) || id}×${count}`)
    if (saved.accessory && saved.accessory !== 'none') inlineAccessories.push(accessoryNames.get(saved.accessory) || saved.accessory)
    const accessory = inlineAccessories.join('、') || '无'
    const cord = catalog.cords.find((item) => item.id === saved.cord)?.name || saved.cord
    const shareUrl = new URL(location.href)
    shareUrl.search = ''
    shareUrl.hash = ''
    shareUrl.searchParams.set('design', saved.code)
    const savedCraftPrice = Number(catalog.settings.craftPrices?.[saved.beadSize] || 0)
    const quote = saved.quoteStatus === 'needs_confirmation'
      ? `类型：灵感方案（未填满）\n当前用料小计：¥${Math.max(0, saved.totalPrice - savedCraftPrice)}\n基础手工费：¥${savedCraftPrice}（完整后计入预计总价）`
      : `类型：完整方案\n预计价格：¥${saved.totalPrice}`
    const merchantInfo = [catalog.settings.merchantContact, catalog.settings.productionTime, catalog.settings.shippingNote].filter(Boolean).join(' · ')
    const customNotice = String(catalog.settings.customNotice || '').trim()
    return `${brandName}定制方案\n编号：${saved.code}\n${quote}\n手围：${saved.wrist.toFixed(1)} cm\n珠径：${saved.beadSize} mm\n用料：${materialSummary}\n配件：${accessory}\n绳线：${catalog.settings.cordSpec || '72号玉线 · 0.8 mm'} · ${cord}\n制作确认：${productionEstimateNote}\n备注：${saved.note || '无'}\n参考图片：${saved.referenceImage ? '已附' : '无'}${merchantInfo ? `\n商家信息：${merchantInfo}` : ''}${customNotice ? `\n定制须知：${customNotice}` : ''}\n打开链接：${shareUrl.toString()}`
  }

  async function submitDesign() {
    const draft = JSON.parse(localStorage.getItem('puguang-design') || 'null')
    const beads = Array.isArray(draft?.beads) ? draft.beads.filter((id) => id) : []
    if (!beads.length) { window.showToast?.('请先添加至少一颗珠子'); return }
    const originalLabel = saveButton.textContent
    saveButton.disabled = true
    saveButton.textContent = '正在保存'
    try {
      const response = await fetch('/api/designs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wrist: draft.wrist, beadSize: draft.beadSize, beads: draft.beads, accessory: draft.accessory, cord: draft.cord, note: draft.note, referenceImage: window.referenceImageForSubmission?.() || draft.referenceImage || '' })
      })
      const saved = await response.json()
      if (!response.ok) throw new Error(saved.error || '方案保存失败')
      window.openResult()
      const localCode = document.getElementById('designCode').textContent
      document.getElementById('designCode').textContent = saved.code
      lastSavedDesign = saved
      const merchantButton = document.getElementById('submitMerchantButton')
      merchantButton.disabled = false
      merchantButton.textContent = '提交给商家'
      window.markReferenceImageSaved?.(saved.referenceImage)
      window.markCurrentHistorySaved?.(saved.code)
      const summaryValues = document.querySelectorAll('#resultSummary dd')
      const accessoryCounts = saved.beads.filter((value) => String(value).startsWith('accessory:')).reduce((result, value) => {
        const id = String(value).slice(10)
        result[id] = (result[id] || 0) + 1
        return result
      }, {})
      const accessory = Object.entries(accessoryCounts).map(([id, count]) => {
        const name = catalog.accessories.find((item) => item.id === id)?.name || id
        return `${name} × ${count}`
      }).join('、') || '无'
      const cord = catalog.cords.find((item) => item.id === saved.cord)?.name || saved.cord
      if (summaryValues[1]) summaryValues[1].textContent = accessory
      if (summaryValues[2]) summaryValues[2].textContent = `${catalog.settings.cordSpec || '72号玉线 · 0.8 mm'} · ${cord}`
      const resultPriceValue = document.getElementById('resultPriceValue')
      const resultCraftPriceValue = document.getElementById('resultCraftPriceValue')
      const savedCraftPrice = Number(catalog.settings.craftPrices?.[saved.beadSize] || 0)
      if (resultPriceValue) resultPriceValue.textContent = saved.quoteStatus === 'needs_confirmation'
        ? `¥ ${Math.max(0, saved.totalPrice - savedCraftPrice)}`
        : `¥ ${saved.totalPrice}`
      if (resultCraftPriceValue) resultCraftPriceValue.textContent = `¥ ${savedCraftPrice}`
      localStorage.removeItem(`puguang-order-${localCode}`)
      lastSavedText = savedText(saved)
      localStorage.setItem(`puguang-order-${saved.code}`, lastSavedText)
      window.drawExportCanvas()
    } catch (error) { window.showToast?.(error.message || '方案保存失败，请稍后重试') }
    finally { saveButton.disabled = false; saveButton.textContent = originalLabel }
  }

  const submissionDialog = document.getElementById('submissionDialog')
  const submissionForm = document.getElementById('submissionForm')
  document.getElementById('submitMerchantButton').addEventListener('click', () => {
    if (!lastSavedDesign) { window.showToast?.('请先保存当前方案'); return }
    submissionDialog.showModal()
  })
  const closeSubmission = () => submissionDialog.close()
  document.getElementById('closeSubmissionDialog').addEventListener('click', closeSubmission)
  document.getElementById('cancelSubmission').addEventListener('click', closeSubmission)
  submissionForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (!lastSavedDesign) return
    const button = event.submitter
    const originalLabel = button.textContent
    button.disabled = true
    button.textContent = '正在提交'
    try {
      const response = await fetch(`/api/designs/${encodeURIComponent(lastSavedDesign.code)}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: document.getElementById('customerName').value,
          customerContact: document.getElementById('customerContact').value,
          quantity: Number(document.getElementById('customerQuantity').value)
        })
      })
      const submitted = await response.json()
      if (!response.ok) throw new Error(submitted.error || '提交失败')
      lastSavedDesign = submitted
      closeSubmission()
      const merchantButton = document.getElementById('submitMerchantButton')
      merchantButton.disabled = true
      merchantButton.textContent = '已提交给商家'
      window.showToast?.('已提交给商家，请等待商家联系')
    } catch (error) {
      window.showToast?.(error.message || '提交失败，请稍后重试')
    } finally {
      button.disabled = false
      button.textContent = originalLabel
    }
  })

  const originalCopy = document.getElementById('copyButton')
  const copyButton = originalCopy.cloneNode(true)
  originalCopy.replaceWith(copyButton)
  copyButton.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(lastSavedText); window.showToast?.('方案已复制，含分享链接') }
    catch { window.showToast?.('复制失败，请保存方案图') }
  })
  window.persistDesign = submitDesign

  const sharedCode = new URLSearchParams(location.search).get('design')
  if (/^PG-\d{8}-[A-F0-9]{6}$/i.test(sharedCode || '')) {
    fetch(`/api/designs/${encodeURIComponent(sharedCode)}`)
      .then(async (response) => {
        const saved = await response.json()
        if (!response.ok) throw new Error(saved.error || '分享方案不存在')
        window.loadSavedDesign?.(saved)
      })
      .catch(() => window.showToast?.('分享方案不存在或已失效'))
  }
})()
