const statusLabels = { new: '待处理', contacted: '已联系', confirmed: '已确认', completed: '已完成', cancelled: '已取消' }
const colorLabels = { white: '月光白', pink: '柔雾粉', purple: '暮光紫', blue: '湖水蓝', gray: '月光灰', black: '曜石黑', gold: '暖金棕', red: '朱砂红' }
const energyLabels = { calm: '安定平静', focus: '专注清晰', confidence: '自信表达', vitality: '活力行动', balance: '平衡陪伴' }
const elementLabels = { metal: '金', wood: '木', water: '水', fire: '火', earth: '土' }
const state = { catalog: null, designs: [], kind: 'materials', accessoryCategoryFilter: 'all', view: 'products', newProductKind: null, photoProductKind: null, photoProductId: null, photoReplaceIndex: null, pendingPhoto: null, compositionProductId: null }
let toastTimer
let newMaterialImage = null

const byId = (id) => document.getElementById(id)
const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char])
function catalogOptions(type) {
  const configured = state.catalog?.settings?.[type === 'energy' ? 'energyOptions' : 'elementOptions']
  const fallback = Object.entries(type === 'energy' ? energyLabels : elementLabels).map(([key, name]) => ({ key, name, active: true }))
  return Array.isArray(configured) && configured.length ? configured : fallback
}
function categorySelectOptions(type, selected) {
  return catalogOptions(type).filter((item) => item.active !== false || item.key === selected)
    .map((item) => `<option value="${escapeHtml(item.key)}" ${item.key === selected ? 'selected' : ''}>${escapeHtml(item.name)}${item.active === false ? '（已停用）' : ''}</option>`).join('')
}

function toast(message) {
  const target = byId('adminToast')
  target.textContent = message
  target.classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => target.classList.remove('show'), 1800)
}

async function request(url, options) {
  const response = await fetch(url, options)
  const result = await response.json()
  if (response.status === 401) {
    location.replace('/admin-login.html')
    throw new Error('登录已失效，请重新登录')
  }
  if (!response.ok) throw new Error(result.error || '操作失败')
  return result
}

function productThumb(item, kind) {
  const photo = item.photos?.[0]
  if (photo) return `<span class="product-thumb"><img src="${escapeHtml(photo)}" alt="" /></span>`
  if (kind === 'cords') return `<span class="product-thumb" style="background:${escapeHtml(item.color)}">线</span>`
  return `<span class="product-thumb">${kind === 'accessories' ? '配' : kind === 'inspirations' ? '荐' : '珠'}</span>`
}

function materialVariantFields(item) {
  return `<div class="variant-editor">${[6, 8, 10].map((size) => {
    const variant = item.variants?.[size] || { price: item.price, stock: item.stock, active: true }
    return `<div class="variant-row" data-size="${size}">
      <label class="variant-active"><input type="checkbox" ${variant.active ? 'checked' : ''} /><span>${size} mm</span></label>
      <label><span>单价</span><input class="variant-price" type="number" min="0" max="100000" step="1" value="${variant.price}" /></label>
      <label><span>库存</span><input class="variant-stock" type="number" min="0" max="1000000" step="1" value="${variant.stock}" /></label>
    </div>`
  }).join('')}</div>`
}

function inspirationCompositionSummary(item) {
  const beadCount = Array.isArray(item.beads) ? item.beads.length : 0
  if (!beadCount) return '尚未配置可套用用料'
  const cord = (state.catalog?.cords || []).find((candidate) => candidate.id === item.cordId)
  return `${item.beadSize || 8} mm · ${beadCount} 位 · ${cord?.name || '未指定绳子'}`
}

function renderProducts() {
  const categories = (state.catalog?.accessoryCategories || []).filter((item) => !item.deleted)
  if (state.kind === 'accessories' && state.accessoryCategoryFilter !== 'all' && !categories.some((item) => item.id === state.accessoryCategoryFilter)) state.accessoryCategoryFilter = 'all'
  const items = (state.catalog?.[state.kind] || []).filter((item) => !item.deleted && (state.kind !== 'accessories' || state.accessoryCategoryFilter === 'all' || item.categoryId === state.accessoryCategoryFilter))
  const kindLabels = { materials: '珠材', accessories: '配件', cords: '绳色', inspirations: '展示内容' }
  byId('addMaterialButton').textContent = `新增${kindLabels[state.kind]}`
  const categoryBar = byId('accessoryCategoryBar')
  categoryBar.hidden = state.kind !== 'accessories'
  if (state.kind === 'accessories') {
    byId('accessoryCategoryFilters').innerHTML = [{ id: 'all', name: '全部配件' }, ...categories].map((category) => `<button type="button" class="${state.accessoryCategoryFilter === category.id ? 'active' : ''}" data-category-filter="${escapeHtml(category.id)}">${escapeHtml(category.name)}</button>`).join('')
    document.querySelectorAll('[data-category-filter]').forEach((button) => button.addEventListener('click', () => {
      state.accessoryCategoryFilter = button.dataset.categoryFilter
      renderProducts()
    }))
  }
  byId('variantMigrationNotice').hidden = state.kind !== 'materials' || !state.catalog?.settings?.variantMigrationPending
  byId('productTable').innerHTML = `
    <div class="product-head"><span>图片</span><span>名称</span><span>价格 / 库存 / 属性</span><span>上架</span><span>操作</span></div>
    ${items.length ? items.map((item, itemIndex) => `<div class="product-row" data-id="${item.id}">
      ${productThumb(item, state.kind)}
      <label class="product-name-field"><span>名称</span><input class="item-name" value="${escapeHtml(item.name)}" maxlength="40" aria-label="${escapeHtml(item.name)}名称" /></label>
      ${state.kind === 'materials'
        ? `<div class="material-meta" data-mobile-label="规格与分类">${materialVariantFields(item)}<div class="material-attributes"><select class="item-color-key" aria-label="${escapeHtml(item.name)}色系">${Object.entries(colorLabels).map(([value, label]) => `<option value="${value}" ${item.colorKey === value ? 'selected' : ''}>${label}</option>`).join('')}</select><select class="item-energy-key" aria-label="${escapeHtml(item.name)}能量需求">${categorySelectOptions('energy', item.energyKey)}</select><select class="item-element-key" aria-label="${escapeHtml(item.name)}五行归属">${categorySelectOptions('element', item.elementKey)}</select>${materialFacetSelects(item.facetValues || {})}<input class="item-description" maxlength="120" value="${escapeHtml(item.description || '')}" placeholder="简短说明（可选）" /></div></div>`
        : state.kind === 'inspirations'
        ? `<div class="product-meta inspiration-meta" data-mobile-label="展示信息"><select class="item-display-area" aria-label="${escapeHtml(item.name)}展示位置"><option value="explore" ${['explore', 'style'].includes(item.displayArea) ? 'selected' : ''}>帮我推荐</option><option value="inspiration" ${!['explore', 'style'].includes(item.displayArea) ? 'selected' : ''}>从灵感开始</option></select><select class="item-energy-key" aria-label="${escapeHtml(item.name)}能量需求">${categorySelectOptions('energy', item.energyKey)}</select><select class="item-element-key" aria-label="${escapeHtml(item.name)}五行归属">${categorySelectOptions('element', item.elementKey)}</select><input class="item-description" maxlength="120" value="${escapeHtml(item.hint || '')}" placeholder="一句话说明（可选）" /><input class="item-material-note" maxlength="160" value="${escapeHtml(item.materialNote || '')}" placeholder="材料说明，例如：8mm 白水晶、粉晶" /><small class="composition-summary">${escapeHtml(inspirationCompositionSummary(item))}</small></div>`
        : state.kind === 'cords'
        ? `<div class="product-meta" data-mobile-label="价格、库存与颜色"><input class="item-price" type="number" min="0" max="100000" step="1" value="${item.price}" aria-label="${escapeHtml(item.name)}价格" /><input class="item-stock" type="number" min="0" max="1000000" step="1" value="${item.stock}" aria-label="${escapeHtml(item.name)}库存" /><input class="item-color" type="color" value="${escapeHtml(item.color)}" aria-label="${escapeHtml(item.name)}颜色" /></div>`
        : `<div class="product-meta ${state.kind === 'accessories' ? 'accessory-meta' : ''}" data-mobile-label="价格、库存与分类"><input class="item-price" type="number" min="0" max="100000" step="1" value="${item.price}" aria-label="${escapeHtml(item.name)}价格" /><input class="item-stock" type="number" min="0" max="1000000" step="1" value="${item.stock}" aria-label="${escapeHtml(item.name)}库存" />${state.kind === 'accessories' ? `<select class="item-category" aria-label="${escapeHtml(item.name)}分类">${categories.map((category) => `<option value="${escapeHtml(category.id)}" ${item.categoryId === category.id ? 'selected' : ''}>${escapeHtml(category.name)}</option>`).join('')}</select>` : '<span></span>'}</div>`}
      <label class="switch product-status"><input class="item-active" type="checkbox" ${item.active ? 'checked' : ''} /> <span>${item.active ? '已上架' : '已下架'}</span></label>
      <div class="product-row-actions">${state.kind === 'inspirations' ? `<button class="secondary-button move-inspiration-up" type="button" title="上移" aria-label="上移${escapeHtml(item.name)}" ${itemIndex === 0 ? 'disabled' : ''}>↑</button><button class="secondary-button move-inspiration-down" type="button" title="下移" aria-label="下移${escapeHtml(item.name)}" ${itemIndex === items.length - 1 ? 'disabled' : ''}>↓</button><button class="secondary-button manage-composition" type="button">用料</button>` : ''}<button class="secondary-button manage-photos" type="button">图片</button><button class="save-row" type="button">保存</button><button class="secondary-button delete-product" type="button">删除</button></div>
    </div>`).join('') : `<div class="catalog-empty">暂无${kindLabels[state.kind]}，点击右上角“新增${kindLabels[state.kind]}”开始添加</div>`}`

  document.querySelectorAll('.product-row').forEach((row) => {
    row.querySelector('.item-active').addEventListener('change', (event) => { event.target.nextElementSibling.textContent = event.target.checked ? '已上架' : '已下架' })
    row.querySelector('.save-row').addEventListener('click', () => saveProduct(row))
    row.querySelector('.manage-composition')?.addEventListener('click', () => openCompositionDialog(row.dataset.id))
    row.querySelector('.move-inspiration-up')?.addEventListener('click', () => moveInspiration(row.dataset.id, -1))
    row.querySelector('.move-inspiration-down')?.addEventListener('click', () => moveInspiration(row.dataset.id, 1))
    row.querySelector('.manage-photos')?.addEventListener('click', () => openPhotoDialog(state.kind, row.dataset.id))
    row.querySelector('.delete-product').addEventListener('click', () => deleteProduct(row))
  })
}

async function moveInspiration(id, direction) {
  const items = (state.catalog?.inspirations || []).filter((item) => !item.deleted)
  const currentIndex = items.findIndex((item) => item.id === id)
  const targetIndex = currentIndex + direction
  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= items.length) return
  const current = items[currentIndex]
  const target = items[targetIndex]
  try {
    await Promise.all([
      request(`/api/admin/inspirations/${encodeURIComponent(current.id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: target.sortOrder }) }),
      request(`/api/admin/inspirations/${encodeURIComponent(target.id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sortOrder: current.sortOrder }) })
    ])
    await loadCatalog()
  } catch (error) { toast(error.message) }
}

async function saveProduct(row) {
  const button = row.querySelector('.save-row')
  const payload = { name: row.querySelector('.item-name').value, active: row.querySelector('.item-active').checked }
  if (state.kind === 'materials') {
    payload.colorKey = row.querySelector('.item-color-key').value
    payload.energyKey = row.querySelector('.item-energy-key').value
    payload.elementKey = row.querySelector('.item-element-key').value
    payload.facetValues = facetValuesFrom(row, '.item-facet-value')
    payload.description = row.querySelector('.item-description').value
    payload.variants = Object.fromEntries([...row.querySelectorAll('.variant-row')].map((variantRow) => [variantRow.dataset.size, {
      active: variantRow.querySelector('.variant-active input').checked,
      price: Number(variantRow.querySelector('.variant-price').value),
      stock: Number(variantRow.querySelector('.variant-stock').value)
    }]))
  } else if (state.kind === 'inspirations') {
    payload.displayArea = row.querySelector('.item-display-area').value
    payload.energyKey = row.querySelector('.item-energy-key').value
    payload.elementKey = row.querySelector('.item-element-key').value
    payload.hint = row.querySelector('.item-description').value
    payload.materialNote = row.querySelector('.item-material-note').value
  } else {
    payload.stock = Number(row.querySelector('.item-stock').value)
    payload.price = Number(row.querySelector('.item-price').value)
    if (state.kind === 'cords') payload.color = row.querySelector('.item-color').value
    if (state.kind === 'accessories') payload.categoryId = row.querySelector('.item-category').value
  }
  button.disabled = true
  try {
    await request(`/api/admin/${state.kind}/${encodeURIComponent(row.dataset.id)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    })
    await loadCatalog()
    toast('商品已保存，顾客页面将使用新数据')
  } catch (error) { toast(error.message) }
  finally { button.disabled = false }
}

async function deleteProduct(row) {
  const item = (state.catalog?.[state.kind] || []).find((candidate) => candidate.id === row.dataset.id)
  if (!item || !window.confirm(`确定删除“${item.name}”吗？旧方案中的记录仍会保留。`)) return
  const button = row.querySelector('.delete-product')
  button.disabled = true
  try {
    await request(`/api/admin/${state.kind}/${encodeURIComponent(row.dataset.id)}`, { method: 'DELETE' })
    await loadCatalog()
    toast('商品已删除，旧方案不受影响')
  } catch (error) { toast(error.message) }
  finally { button.disabled = false }
}

function imageData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(reader.result))
    reader.addEventListener('error', () => reject(new Error('图片读取失败')))
    reader.readAsDataURL(file)
  })
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image), { once: true })
    image.addEventListener('error', () => reject(new Error('图片无法识别，请更换后重试')), { once: true })
    image.src = source
  })
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)] || 0
}

function percentile(values, ratio) {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))] || 0
}

function colorDistance(data, offset, background) {
  const red = data[offset] - background[0]
  const green = data[offset + 1] - background[1]
  const blue = data[offset + 2] - background[2]
  return Math.sqrt(red * red * .3 + green * green * .59 + blue * blue * .11)
}

async function processProductImage(file) {
  const original = await imageData(file)
  const source = await loadImage(original)
  const maxWorkingSize = 1000
  const scale = Math.min(1, maxWorkingSize / Math.max(source.naturalWidth, source.naturalHeight))
  const width = Math.max(1, Math.round(source.naturalWidth * scale))
  const height = Math.max(1, Math.round(source.naturalHeight * scale))
  const working = document.createElement('canvas')
  working.width = width
  working.height = height
  const context = working.getContext('2d', { willReadFrequently: true })
  context.drawImage(source, 0, 0, width, height)
  const pixels = context.getImageData(0, 0, width, height)
  const data = pixels.data
  const borderOffsets = []
  const step = Math.max(1, Math.floor(Math.min(width, height) / 120))
  const addOffset = (x, y) => borderOffsets.push((y * width + x) * 4)
  for (let x = 0; x < width; x += step) { addOffset(x, 0); addOffset(x, height - 1) }
  for (let y = step; y < height - 1; y += step) { addOffset(0, y); addOffset(width - 1, y) }
  const opaqueBorder = borderOffsets.filter((offset) => data[offset + 3] > 24)
  const background = opaqueBorder.length
    ? [median(opaqueBorder.map((offset) => data[offset])), median(opaqueBorder.map((offset) => data[offset + 1])), median(opaqueBorder.map((offset) => data[offset + 2]))]
    : [255, 255, 255]
  const borderDistances = opaqueBorder.map((offset) => colorDistance(data, offset, background))
  const threshold = Math.max(26, Math.min(82, percentile(borderDistances, .9) + 20))
  const total = width * height
  const backgroundMask = new Uint8Array(total)
  const queue = new Int32Array(total)
  let queueStart = 0
  let queueEnd = 0
  const isBackground = (index) => {
    const offset = index * 4
    return data[offset + 3] < 24 || colorDistance(data, offset, background) <= threshold
  }
  const enqueue = (index) => {
    if (backgroundMask[index] || !isBackground(index)) return
    backgroundMask[index] = 1
    queue[queueEnd++] = index
  }
  for (let x = 0; x < width; x += 1) { enqueue(x); enqueue((height - 1) * width + x) }
  for (let y = 1; y < height - 1; y += 1) { enqueue(y * width); enqueue(y * width + width - 1) }
  while (queueStart < queueEnd) {
    const index = queue[queueStart++]
    const x = index % width
    const y = Math.floor(index / width)
    if (x > 0) enqueue(index - 1)
    if (x + 1 < width) enqueue(index + 1)
    if (y > 0) enqueue(index - width)
    if (y + 1 < height) enqueue(index + width)
  }

  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1
  let foregroundCount = 0
  for (let index = 0; index < total; index += 1) {
    if (backgroundMask[index] || data[index * 4 + 3] < 24) continue
    const x = index % width
    const y = Math.floor(index / width)
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
    foregroundCount += 1
  }
  const foregroundRatio = foregroundCount / total
  const boxRatio = maxX >= minX ? ((maxX - minX + 1) * (maxY - minY + 1)) / total : 1
  const autoApplied = foregroundRatio >= .006 && foregroundRatio <= .9 && boxRatio <= .94 && queueEnd / total >= .06
  if (!autoApplied) {
    return { file, original, processed: original, autoApplied: false, message: '背景较复杂，已默认保留原图' }
  }

  for (let index = 0; index < total; index += 1) {
    const offset = index * 4
    if (backgroundMask[index]) {
      data[offset + 3] = 0
      continue
    }
    const x = index % width
    const y = Math.floor(index / width)
    const touchesBackground = (x > 0 && backgroundMask[index - 1])
      || (x + 1 < width && backgroundMask[index + 1])
      || (y > 0 && backgroundMask[index - width])
      || (y + 1 < height && backgroundMask[index + width])
    if (touchesBackground) {
      const edgeStrength = Math.max(0, Math.min(1, (colorDistance(data, offset, background) - threshold + 8) / 24))
      data[offset + 3] = Math.round(data[offset + 3] * edgeStrength)
    }
  }
  context.putImageData(pixels, 0, 0)

  const objectWidth = maxX - minX + 1
  const objectHeight = maxY - minY + 1
  const outputSize = 720
  const padding = 58
  const outputScale = Math.min((outputSize - padding * 2) / objectWidth, (outputSize - padding * 2) / objectHeight)
  const drawWidth = objectWidth * outputScale
  const drawHeight = objectHeight * outputScale
  const output = document.createElement('canvas')
  output.width = outputSize
  output.height = outputSize
  const outputContext = output.getContext('2d')
  outputContext.imageSmoothingEnabled = true
  outputContext.imageSmoothingQuality = 'high'
  outputContext.drawImage(working, minX, minY, objectWidth, objectHeight, (outputSize - drawWidth) / 2, (outputSize - drawHeight) / 2, drawWidth, drawHeight)
  const removedPercent = Math.round(queueEnd / total * 100)
  return { file, original, processed: output.toDataURL('image/png'), autoApplied: true, message: '已去除约 ' + removedPercent + '% 背景并居中' }
}

window.processProductImageForTest = processProductImage

function chosenImageData(result, useProcessed) {
  return useProcessed && result?.autoApplied ? result.processed : result.original
}

function renderNewMaterialImage() {
  const preview = byId('uploadPreview')
  const choice = byId('newMaterialProcessChoice')
  if (!newMaterialImage) {
    preview.className = 'upload-preview'
    preview.innerHTML = '<span>选择图片后可预览</span>'
    choice.hidden = true
    return
  }
  const checkbox = byId('newMaterialAutoProcess')
  checkbox.disabled = !newMaterialImage.autoApplied
  if (!newMaterialImage.autoApplied) checkbox.checked = false
  preview.className = 'upload-preview' + (checkbox.checked && newMaterialImage.autoApplied ? ' processed' : '')
  preview.innerHTML = '<img src="' + chosenImageData(newMaterialImage, checkbox.checked) + '" alt="待上传珠子预览" />'
  byId('newMaterialProcessStatus').textContent = newMaterialImage.message
  choice.hidden = false
}

function closeMaterialDialog() {
  byId('materialDialog').close()
  byId('materialForm').reset()
  newMaterialImage = null
  renderNewMaterialImage()
}

byId('addMaterialButton').addEventListener('click', () => {
  if (state.kind === 'materials') byId('materialDialog').showModal()
  else openSimpleProductDialog(state.kind)
})
byId('closeMaterialDialog').addEventListener('click', closeMaterialDialog)
byId('cancelMaterialButton').addEventListener('click', closeMaterialDialog)
byId('newMaterialPhoto').addEventListener('change', async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) { event.target.value = ''; toast('单张图片不能超过 5 MB'); return }
  const preview = byId('uploadPreview')
  preview.className = 'upload-preview processing'
  preview.innerHTML = '<span>正在自动去背景并居中...</span>'
  byId('newMaterialProcessChoice').hidden = true
  try {
    newMaterialImage = await processProductImage(file)
    renderNewMaterialImage()
  } catch (error) {
    newMaterialImage = null
    event.target.value = ''
    renderNewMaterialImage()
    toast(error.message || '图片处理失败')
  }
})
byId('newMaterialAutoProcess').addEventListener('change', renderNewMaterialImage)
byId('materialForm').addEventListener('submit', async (event) => {
  event.preventDefault()
  const file = byId('newMaterialPhoto').files?.[0]
  const button = event.submitter
  if (!file) { toast('请选择一张珠子图片'); return }
  if (!newMaterialImage || newMaterialImage.file !== file) { toast('请等待图片处理完成'); return }
  button.disabled = true
  try {
    const material = await request('/api/admin/materials', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: byId('newMaterialName').value,
        price: Number(byId('newMaterialPrice8').value),
        stock: Number(byId('newMaterialStock8').value),
        colorKey: byId('newMaterialColor').value,
        energyKey: byId('newMaterialEnergy').value,
        elementKey: byId('newMaterialElement').value,
        facetValues: facetValuesFrom(byId('newMaterialFacetFields'), '.new-material-facet-value'),
        description: byId('newMaterialDescription').value,
        variants: Object.fromEntries([6, 8, 10].map((size) => [size, {
          active: byId(`newMaterialActive${size}`).checked,
          price: Number(byId(`newMaterialPrice${size}`).value),
          stock: Number(byId(`newMaterialStock${size}`).value)
        }]))
      })
    })
    await request(`/api/admin/materials/${encodeURIComponent(material.id)}/photos`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: chosenImageData(newMaterialImage, byId('newMaterialAutoProcess').checked) })
    })
    state.kind = 'materials'
    document.querySelectorAll('#productTypes button').forEach((item) => item.classList.toggle('active', item.dataset.kind === 'materials'))
    await loadCatalog()
    closeMaterialDialog()
    toast('珠材已添加，可在顾客页面使用')
  } catch (error) { toast(error.message) }
  finally { button.disabled = false }
})

function closeSimpleProductDialog() {
  byId('simpleProductDialog').close()
  byId('simpleProductForm').reset()
  state.newProductKind = null
}

function openSimpleProductDialog(kind) {
  const isCord = kind === 'cords'
  const isInspiration = kind === 'inspirations'
  state.newProductKind = kind
  byId('simpleProductTitle').textContent = isCord ? '新增绳色' : isInspiration ? '新增推荐款' : '新增配件'
  byId('newSimpleName').placeholder = isCord ? '例如：浅紫' : isInspiration ? '例如：通透日常' : '例如：银色隔片'
  byId('newSimplePriceField').hidden = isInspiration
  byId('newSimplePrice').disabled = isInspiration
  byId('newSimplePriceLabel').textContent = isCord ? '每条手串绳子价格（元）' : '单个价格（元）'
  byId('newSimpleStockLabel').textContent = isCord ? '库存数量（可制作条数）' : '库存数量（个）'
  byId('newSimpleDescriptionField').hidden = isCord
  byId('newSimpleDescription').disabled = isCord
  byId('newSimpleDescription').placeholder = isInspiration ? '例如：白水晶与粉晶，清透柔和' : '例如：银色配件'
  byId('newSimpleColorField').hidden = !isCord
  byId('newSimpleColor').disabled = !isCord
  byId('newSimpleCategoryField').hidden = isCord || isInspiration
  byId('newSimpleEnergyField').hidden = !isInspiration
  byId('newSimpleElementField').hidden = !isInspiration
  byId('newSimpleMaterialField').hidden = !isInspiration
  byId('newSimpleAreaField').hidden = !isInspiration
  byId('newSimpleStock').disabled = isInspiration
  byId('newSimpleCategory').innerHTML = (state.catalog?.accessoryCategories || []).filter((item) => !item.deleted).map((category) => `<option value="${escapeHtml(category.id)}">${escapeHtml(category.name)}</option>`).join('')
  byId('simpleProductDialog').showModal()
}

byId('closeSimpleProductDialog').addEventListener('click', closeSimpleProductDialog)
byId('cancelSimpleProduct').addEventListener('click', closeSimpleProductDialog)
byId('simpleProductForm').addEventListener('submit', async (event) => {
  event.preventDefault()
  const kind = state.newProductKind
  const button = event.submitter
  const payload = kind === 'cords'
    ? { name: byId('newSimpleName').value, color: byId('newSimpleColor').value, price: Number(byId('newSimplePrice').value), stock: Number(byId('newSimpleStock').value) }
    : kind === 'inspirations'
      ? { name: byId('newSimpleName').value, hint: byId('newSimpleDescription').value, materialNote: byId('newSimpleMaterial').value, displayArea: byId('newSimpleArea').value, energyKey: byId('newSimpleEnergy').value, elementKey: byId('newSimpleElement').value, beads: [], beadSize: 8, cordId: '' }
      : { name: byId('newSimpleName').value, price: Number(byId('newSimplePrice').value), stock: Number(byId('newSimpleStock').value), description: byId('newSimpleDescription').value, categoryId: byId('newSimpleCategory').value }
  button.disabled = true
  try {
    await request(`/api/admin/${kind}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    })
    await loadCatalog()
    closeSimpleProductDialog()
  } catch (error) { toast(error.message) }
  finally { button.disabled = false }
})

function currentCompositionProduct() {
  return (state.catalog?.inspirations || []).find((item) => item.id === state.compositionProductId)
}

function compositionOptionGroups(selectedValue = '') {
  const materials = (state.catalog?.materials || []).filter((item) => !item.deleted)
  const accessories = (state.catalog?.accessories || []).filter((item) => !item.deleted)
  const hasSelected = materials.some((item) => item.id === selectedValue) || accessories.some((item) => `accessory:${item.id}` === selectedValue)
  const missingOption = selectedValue && !hasSelected ? `<option value="${escapeHtml(selectedValue)}" selected>已删除商品（保留原记录）</option>` : ''
  return `${missingOption}<optgroup label="主珠">${materials.map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === selectedValue ? 'selected' : ''}>${escapeHtml(item.name)}${item.active ? '' : '（已下架）'}</option>`).join('')}</optgroup><optgroup label="配件">${accessories.map((item) => {
    const value = `accessory:${item.id}`
    return `<option value="${escapeHtml(value)}" ${value === selectedValue ? 'selected' : ''}>${escapeHtml(item.name)}${item.active ? '' : '（已下架）'}</option>`
  }).join('')}</optgroup>`
}

function updateCompositionCount() {
  const total = [...byId('compositionRows').querySelectorAll('.composition-quantity')].reduce((sum, input) => sum + Math.max(0, Number(input.value) || 0), 0)
  byId('compositionCount').textContent = `${total} / 30 位`
  byId('compositionCount').classList.toggle('over-limit', total > 30)
}

function addCompositionRow(value = '', quantity = 1) {
  const row = document.createElement('div')
  row.className = 'composition-row'
  const firstValue = value || (state.catalog?.materials || []).find((item) => !item.deleted)?.id || `accessory:${(state.catalog?.accessories || []).find((item) => !item.deleted)?.id || ''}`
  row.innerHTML = `<label><span>用料</span><select class="composition-item">${compositionOptionGroups(firstValue)}</select></label><label><span>数量</span><input class="composition-quantity" type="number" min="1" max="30" step="1" value="${Math.max(1, Math.min(30, Number(quantity) || 1))}" /></label><button class="secondary-button remove-composition-row" type="button" aria-label="删除这项用料">删除</button>`
  row.querySelector('.remove-composition-row').addEventListener('click', () => { row.remove(); updateCompositionCount() })
  row.querySelector('.composition-quantity').addEventListener('input', updateCompositionCount)
  byId('compositionRows').appendChild(row)
  updateCompositionCount()
}

function groupedCompositionItems(beads) {
  const rows = []
  ;(Array.isArray(beads) ? beads : []).forEach((value) => {
    const existing = rows.find((row) => row.value === value)
    if (existing) existing.quantity += 1
    else rows.push({ value, quantity: 1 })
  })
  return rows
}

function openCompositionDialog(productId) {
  state.compositionProductId = productId
  const product = currentCompositionProduct()
  if (!product) return
  byId('compositionTitle').textContent = `${product.name} · 实际用料`
  byId('compositionBeadSize').value = String(product.beadSize || 8)
  const cords = (state.catalog?.cords || []).filter((item) => !item.deleted)
  const hasSavedCord = cords.some((item) => item.id === product.cordId)
  byId('compositionCord').innerHTML = `<option value="">不指定绳子</option>${product.cordId && !hasSavedCord ? `<option value="${escapeHtml(product.cordId)}" selected>已删除绳子（保留原记录）</option>` : ''}${cords.map((item) => `<option value="${escapeHtml(item.id)}" ${item.id === product.cordId ? 'selected' : ''}>${escapeHtml(item.name)}${item.active ? '' : '（已下架）'}</option>`).join('')}`
  byId('compositionRows').innerHTML = ''
  groupedCompositionItems(product.beads).forEach((row) => addCompositionRow(row.value, row.quantity))
  updateCompositionCount()
  byId('compositionDialog').showModal()
}

function closeCompositionDialog() {
  byId('compositionDialog').close()
  byId('compositionRows').innerHTML = ''
  state.compositionProductId = null
}

byId('closeCompositionDialog').addEventListener('click', closeCompositionDialog)
byId('cancelCompositionDialog').addEventListener('click', closeCompositionDialog)
byId('addCompositionItem').addEventListener('click', () => addCompositionRow())
byId('compositionForm').addEventListener('submit', async (event) => {
  event.preventDefault()
  const product = currentCompositionProduct()
  if (!product) return
  const beads = [...byId('compositionRows').querySelectorAll('.composition-row')].flatMap((row) => {
    const value = row.querySelector('.composition-item').value
    const quantity = Math.max(1, Number(row.querySelector('.composition-quantity').value) || 1)
    return Array(quantity).fill(value)
  }).filter(Boolean)
  if (beads.length > 30) { toast('推荐搭配最多配置 30 个珠位'); return }
  const button = event.submitter
  button.disabled = true
  try {
    await request(`/api/admin/inspirations/${encodeURIComponent(product.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ beads, beadSize: Number(byId('compositionBeadSize').value), cordId: byId('compositionCord').value })
    })
    await loadCatalog()
    closeCompositionDialog()
    toast('推荐款用料已保存')
  } catch (error) { toast(error.message) }
  finally { button.disabled = false }
})

function currentPhotoProduct() {
  return (state.catalog?.[state.photoProductKind] || []).find((item) => item.id === state.photoProductId)
}

function renderAccessoryCategoryList() {
  const list = byId('accessoryCategoryList')
  const categories = (state.catalog?.accessoryCategories || []).filter((item) => !item.deleted)
  const counts = (state.catalog?.accessories || []).filter((item) => !item.deleted).reduce((result, item) => result.set(item.categoryId, (result.get(item.categoryId) || 0) + 1), new Map())
  list.innerHTML = categories.map((category) => `<div class="category-manage-row" data-category-id="${escapeHtml(category.id)}"><input class="category-name" value="${escapeHtml(category.name)}" maxlength="20" aria-label="${escapeHtml(category.name)}分类名称" /><button class="secondary-button save-category" type="button">保存</button><button class="secondary-button delete-category" type="button" ${category.id === 'accessories' || counts.get(category.id) ? 'disabled' : ''}>删除</button></div>`).join('')
  list.querySelectorAll('.save-category').forEach((button) => button.addEventListener('click', async () => {
    const row = button.closest('.category-manage-row')
    button.disabled = true
    try { await request(`/api/admin/accessory-categories/${encodeURIComponent(row.dataset.categoryId)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: row.querySelector('.category-name').value }) }); await loadCatalog(); renderAccessoryCategoryList(); toast('分类已保存') } catch (error) { toast(error.message) } finally { button.disabled = false }
  }))
  list.querySelectorAll('.delete-category:not(:disabled)').forEach((button) => button.addEventListener('click', async () => {
    const row = button.closest('.category-manage-row')
    if (!confirm('确定删除这个空分类吗？')) return
    try { await request(`/api/admin/accessory-categories/${encodeURIComponent(row.dataset.categoryId)}`, { method: 'DELETE' }); await loadCatalog(); renderAccessoryCategoryList(); toast('分类已删除') } catch (error) { toast(error.message) }
  }))
}

byId('manageAccessoryCategories').addEventListener('click', () => { renderAccessoryCategoryList(); byId('accessoryCategoryDialog').showModal() })
byId('closeAccessoryCategoryDialog').addEventListener('click', () => byId('accessoryCategoryDialog').close())
byId('finishAccessoryCategories').addEventListener('click', () => byId('accessoryCategoryDialog').close())
byId('accessoryCategoryForm').addEventListener('submit', async (event) => {
  event.preventDefault()
  const button = event.submitter
  button.disabled = true
  try { await request('/api/admin/accessory-categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: byId('newAccessoryCategoryName').value }) }); byId('newAccessoryCategoryName').value = ''; await loadCatalog(); renderAccessoryCategoryList(); toast('分类已新增') } catch (error) { toast(error.message) } finally { button.disabled = false }
})

function resetPhotoProcess() {
  state.pendingPhoto = null
  byId('photoProcessPanel').hidden = true
  byId('photoProcessOriginal').removeAttribute('src')
  byId('photoProcessResult').removeAttribute('src')
  byId('photoFile').value = ''
}

function renderPhotoProcess() {
  const pending = state.pendingPhoto
  if (!pending) { resetPhotoProcess(); return }
  byId('photoProcessOriginal').src = pending.image.original
  byId('photoProcessResult').src = pending.image.processed
  byId('photoProcessStatus').textContent = pending.image.message
  const checkbox = byId('photoAutoProcess')
  checkbox.checked = pending.image.autoApplied
  checkbox.disabled = !pending.image.autoApplied
  byId('photoProcessPanel').hidden = false
}

function renderPhotoDialog() {
  const product = currentPhotoProduct()
  if (!product) return
  const typeLabel = state.photoProductKind === 'accessories' ? '配件' : state.photoProductKind === 'cords' ? '绳子' : state.photoProductKind === 'inspirations' ? '推荐款' : '珠材'
  byId('photoDialogTitle').textContent = product.name
  byId('photoDialog').querySelector('.dialog-heading small').textContent = `${typeLabel}图片`
  byId('photoDialog').querySelector('.photo-dialog-copy').textContent = `第一张图片会作为${typeLabel}封面，每种商品最多 8 张。`
  byId('photoGrid').innerHTML = product.photos.length ? product.photos.map((photo, index) => `
    <div class="photo-card">
      <img src="${escapeHtml(photo)}" alt="${escapeHtml(product.name)}图片 ${index + 1}" />
      <div class="photo-card-actions"><button class="replace-photo" type="button" data-index="${index}">替换</button><button class="delete-photo" type="button" data-index="${index}">删除</button></div>
    </div>`).join('') : '<div class="photo-empty">还没有图片</div>'
  byId('addPhotoButton').disabled = product.photos.length >= 8
  byId('addPhotoButton').textContent = product.photos.length >= 8 ? '已满 8 张' : '添加图片'
  document.querySelectorAll('.replace-photo').forEach((button) => button.addEventListener('click', () => {
    resetPhotoProcess()
    state.photoReplaceIndex = Number(button.dataset.index)
    byId('photoFile').value = ''
    byId('photoFile').click()
  }))
  document.querySelectorAll('.delete-photo').forEach((button) => button.addEventListener('click', async () => {
    if (!confirm('删除这张商品图片？')) return
    try {
      await request(`/api/admin/${state.photoProductKind}/${encodeURIComponent(product.id)}/photos/${button.dataset.index}`, { method: 'DELETE' })
      await loadCatalog()
      renderPhotoDialog()
    } catch (error) { toast(error.message) }
  }))
}

function openPhotoDialog(kind, productId) {
  state.photoProductKind = kind
  state.photoProductId = productId
  state.photoReplaceIndex = null
  resetPhotoProcess()
  renderPhotoDialog()
  byId('photoDialog').showModal()
}

function closePhotoDialog() {
  resetPhotoProcess()
  byId('photoDialog').close()
  state.photoProductKind = null
  state.photoProductId = null
  state.photoReplaceIndex = null
}

byId('closePhotoDialog').addEventListener('click', closePhotoDialog)
byId('finishPhotoButton').addEventListener('click', closePhotoDialog)
byId('addPhotoButton').addEventListener('click', () => {
  resetPhotoProcess()
  state.photoReplaceIndex = null
  byId('photoFile').value = ''
  byId('photoFile').click()
})
byId('photoFile').addEventListener('change', async (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) { event.target.value = ''; toast('单张图片不能超过 5 MB'); return }
  const productKind = state.photoProductKind
  const productId = state.photoProductId
  const replaceIndex = state.photoReplaceIndex
  byId('addPhotoButton').disabled = true
  byId('photoProcessPanel').hidden = false
  byId('photoProcessStatus').textContent = '正在自动去背景并居中...'
  try {
    const image = await processProductImage(file)
    state.pendingPhoto = { image, productKind, productId, replaceIndex }
    renderPhotoProcess()
  } catch (error) {
    resetPhotoProcess()
    byId('addPhotoButton').disabled = (currentPhotoProduct()?.photos.length || 0) >= 8
    toast(error.message || '图片处理失败')
  }
})

byId('cancelPhotoProcess').addEventListener('click', () => {
  resetPhotoProcess()
  state.photoReplaceIndex = null
  byId('addPhotoButton').disabled = (currentPhotoProduct()?.photos.length || 0) >= 8
})

byId('confirmPhotoProcess').addEventListener('click', async () => {
  const pending = state.pendingPhoto
  if (!pending) return
  const button = byId('confirmPhotoProcess')
  button.disabled = true
  try {
    const suffix = pending.replaceIndex === null ? '' : `/${pending.replaceIndex}`
    await request(`/api/admin/${pending.productKind}/${encodeURIComponent(pending.productId)}/photos${suffix}`, {
      method: pending.replaceIndex === null ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: chosenImageData(pending.image, byId('photoAutoProcess').checked) })
    })
    resetPhotoProcess()
    state.photoReplaceIndex = null
    await loadCatalog()
    renderPhotoDialog()
  } catch (error) {
    toast(error.message)
  } finally {
    button.disabled = false
    byId('addPhotoButton').disabled = (currentPhotoProduct()?.photos.length || 0) >= 8
  }
})

function materialSummary(design) {
  const names = new Map((state.catalog?.materials || []).map((item) => [item.id, item.name]))
  const accessories = new Map((state.catalog?.accessories || []).map((item) => [item.id, item.name]))
  const counts = design.beads.reduce((result, value) => {
    if (!value) return result
    const key = String(value).startsWith('accessory:') ? value : `material:${value}`
    result[key] = (result[key] || 0) + 1
    return result
  }, {})
  return Object.entries(counts).map(([key, count]) => {
    if (key.startsWith('accessory:')) return `${accessories.get(key.slice(10)) || key.slice(10)} × ${count}`
    const id = key.slice(9)
    return `${names.get(id) || id} × ${count}`
  }).join('、')
}

function designThumbnail(design) {
  const materialMap = new Map((state.catalog?.materials || []).map((item) => [item.id, item]))
  const cordColor = (state.catalog?.cords || []).find((item) => item.id === design.cord)?.color || '#cfd4d0'
  const slotCount = Math.max(1, design.beads.length)
  const ringRadius = 29
  const beadSize = Math.max(6, Math.min(14, ringRadius * Math.sin(Math.PI / slotCount) * 2.08))
  const beads = design.beads.map((token, index) => {
    if (!token) return ''
    const angle = -Math.PI / 2 + index / slotCount * Math.PI * 2
    const x = 50 + Math.cos(angle) * 35
    const y = 50 + Math.sin(angle) * 35
    const style = `left:${x.toFixed(2)}%;top:${y.toFixed(2)}%;width:${beadSize.toFixed(1)}px;height:${beadSize.toFixed(1)}px`
    if (String(token).startsWith('accessory:')) {
      const accessoryId = String(token).slice('accessory:'.length)
      const accessory = (state.catalog?.accessories || []).find((item) => item.id === accessoryId)
      const photo = accessory?.photos?.[index % Math.max(1, accessory.photos.length)] || accessory?.photos?.[0]
      const tone = accessoryId === 'gold' ? 'gold' : 'silver'
      return `<span class="design-thumb-bead accessory ${tone}" style="${style}" aria-hidden="true">${photo ? `<img src="${escapeHtml(photo)}" alt="" />` : '✦'}</span>`
    }
    const material = materialMap.get(token)
    const photo = material?.photos?.[index % Math.max(1, material.photos.length)] || material?.photos?.[0]
    const colorKey = material?.colorKey || 'gray'
    return `<span class="design-thumb-bead color-${escapeHtml(colorKey)}" style="${style}" aria-hidden="true">${photo ? `<img src="${escapeHtml(photo)}" alt="" />` : ''}</span>`
  }).join('')
  return `<div class="design-thumb" style="--design-cord:${escapeHtml(cordColor)}" role="img" aria-label="${escapeHtml(design.code)} 手串缩略图"><span class="design-thumb-cord"></span>${beads}</div>`
}

function renderDesigns() {
  const query = byId('designSearch').value.trim().toLowerCase()
  const status = byId('statusFilter').value
  const rows = state.designs.filter((item) => {
    const searchable = [item.code, item.customerName, item.customerContact, materialSummary(item), item.createdAt].join(' ').toLowerCase()
    return (!query || searchable.includes(query)) && (status === 'all' || item.status === status)
  })
  byId('newCount').textContent = state.designs.filter((item) => item.submissionState === 'submitted' && item.status === 'new').length
  byId('designList').innerHTML = rows.length ? rows.map((item) => `
    <article class="design-card" data-code="${item.code}">
      <div class="design-identity">${designThumbnail(item)}<div><div class="design-code">${item.code}</div><div class="design-date">${new Date(item.submittedAt || item.createdAt).toLocaleString('zh-CN')}</div><span class="design-source ${item.submissionState}">${item.submissionState === 'legacy' ? '旧版方案' : item.submissionState === 'archived' ? '已归档' : '顾客已提交'}</span></div></div>
      <div class="design-details">
        <span><strong>${item.quoteStatus === 'needs_confirmation' ? '需人工报价' : `预计 ¥${item.totalPrice}`}</strong> · 手围 ${item.wrist.toFixed(1)} cm · ${item.beadSize} mm · ${item.beads.filter(Boolean).length} 位</span>
        ${item.customerName || item.customerContact ? `<span>顾客：<strong>${escapeHtml(item.customerName || '未填写')}</strong> · ${escapeHtml(item.customerContact || '无联系方式')} · ${item.quantity || 1} 条</span>` : '<span>旧版方案未收集顾客信息</span>'}
        <span>${escapeHtml(materialSummary(item))}</span><span>备注：${escapeHtml(item.note || '无')}</span>${item.referenceImage ? `<a class="design-reference" href="${escapeHtml(item.referenceImage)}" target="_blank" rel="noopener"><img src="${escapeHtml(item.referenceImage)}" alt="${escapeHtml(item.code)} 的顾客参考图" /><span>查看参考图</span></a>` : ''}
      </div>
      <label class="design-status"><span>处理状态</span><select aria-label="${item.code}处理状态">${Object.entries(statusLabels).map(([value, label]) => `<option value="${value}" ${item.status === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
    </article>`).join('') : '<div class="empty-state">暂无符合条件的顾客方案</div>'

  document.querySelectorAll('.design-card select').forEach((select) => select.addEventListener('change', async () => {
    try {
      await request(`/api/admin/designs/${select.closest('.design-card').dataset.code}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: select.value })
      })
      await loadDesigns()
      toast('处理状态已更新')
    } catch (error) { toast(error.message) }
  }))
}

function appendFilterOptionRow(root, option, locked = false) {
  const row = document.createElement('div')
  row.className = 'filter-setting-row'
  row.dataset.key = option.key
  row.innerHTML = `<input class="filter-option-name" maxlength="12" value="${escapeHtml(option.name)}" aria-label="分类名称" ${locked ? 'readonly' : ''} /><label><input class="filter-option-active" type="checkbox" ${option.active !== false ? 'checked' : ''} ${locked ? 'disabled' : ''} /> ${locked ? '固定分类' : '顾客端显示'}</label>${locked ? '' : '<button class="secondary-button filter-option-delete" type="button">删除</button>'}`
  row.querySelector('.filter-option-delete')?.addEventListener('click', () => row.remove())
  root.appendChild(row)
}

function renderFilterOptions(type) {
  const root = byId(type === 'energy' ? 'energyOptionList' : 'elementOptionList')
  root.innerHTML = ''
  catalogOptions(type).forEach((option) => appendFilterOptionRow(root, option, type === 'element'))
}

function filterOptionsFromForm(type) {
  const root = byId(type === 'energy' ? 'energyOptionList' : 'elementOptionList')
  return [...root.querySelectorAll('.filter-setting-row')].map((row) => ({
    key: row.dataset.key,
    name: row.querySelector('.filter-option-name').value,
    active: row.querySelector('.filter-option-active').checked
  }))
}

function addFilterOption(type) {
  const root = byId(type === 'energy' ? 'energyOptionList' : 'elementOptionList')
  const key = `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  appendFilterOptionRow(root, { key, name: type === 'energy' ? '新能量需求' : '新五行标签', active: true })
  root.lastElementChild.querySelector('.filter-option-name').select()
}

function createSettingKey(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function appendMaterialFacetOption(root, option = {}) {
  const row = document.createElement('div')
  row.className = 'material-facet-option-row'
  row.dataset.key = option.key || createSettingKey('option')
  row.innerHTML = `<input class="material-facet-option-name" maxlength="20" value="${escapeHtml(option.name || '新选项')}" aria-label="分类选项名称" /><label><input class="material-facet-option-active" type="checkbox" ${option.active !== false ? 'checked' : ''} /> 显示</label><button class="secondary-button material-facet-option-delete" type="button">删除</button>`
  row.querySelector('.material-facet-option-delete').addEventListener('click', () => row.remove())
  root.appendChild(row)
}

function appendMaterialFacet(facet = {}) {
  const root = byId('materialFacetList')
  const panel = document.createElement('section')
  panel.className = 'material-facet-editor'
  panel.dataset.key = facet.key || createSettingKey('facet')
  panel.innerHTML = `<div class="material-facet-editor-heading"><input class="material-facet-name" maxlength="20" value="${escapeHtml(facet.name || '新分类')}" aria-label="主珠分类名称" /><label><input class="material-facet-active" type="checkbox" ${facet.active !== false ? 'checked' : ''} /> 显示</label><button class="secondary-button material-facet-delete" type="button">删除分类</button></div><div class="material-facet-option-list"></div><button class="secondary-button add-material-facet-option" type="button">新增选项</button>`
  const optionRoot = panel.querySelector('.material-facet-option-list')
  ;(facet.options || [{ name: '新选项', active: true }]).forEach((option) => appendMaterialFacetOption(optionRoot, option))
  panel.querySelector('.add-material-facet-option').addEventListener('click', () => appendMaterialFacetOption(optionRoot))
  panel.querySelector('.material-facet-delete').addEventListener('click', () => panel.remove())
  root.appendChild(panel)
}

function renderMaterialFacets() {
  byId('materialFacetList').innerHTML = ''
  ;(state.catalog?.settings?.materialFacets || []).forEach(appendMaterialFacet)
}

function materialFacetsFromForm() {
  return [...byId('materialFacetList').querySelectorAll('.material-facet-editor')].map((panel) => ({
    key: panel.dataset.key,
    name: panel.querySelector('.material-facet-name').value,
    active: panel.querySelector('.material-facet-active').checked,
    options: [...panel.querySelectorAll('.material-facet-option-row')].map((row) => ({
      key: row.dataset.key,
      name: row.querySelector('.material-facet-option-name').value,
      active: row.querySelector('.material-facet-option-active').checked
    }))
  }))
}

function materialFacetSelects(values = {}, className = 'item-facet-value') {
  return (state.catalog?.settings?.materialFacets || []).map((facet) => {
    const options = (facet.options || []).filter((option) => option.active !== false || option.key === values[facet.key])
    return `<label class="material-facet-field"><span>${escapeHtml(facet.name)}</span><select class="${className}" data-facet-key="${escapeHtml(facet.key)}">${options.map((option) => `<option value="${escapeHtml(option.key)}" ${values[facet.key] === option.key ? 'selected' : ''}>${escapeHtml(option.name)}${option.active === false ? '（已停用）' : ''}</option>`).join('')}</select></label>`
  }).join('')
}

function facetValuesFrom(root, selector) {
  return Object.fromEntries([...root.querySelectorAll(selector)].map((select) => [select.dataset.facetKey, select.value]))
}

function renderNewMaterialFacetFields() {
  byId('newMaterialFacetFields').innerHTML = materialFacetSelects({}, 'new-material-facet-value')
}

function renderSettings() {
  const settings = state.catalog?.settings || {}
  const brandName = settings.brandName || '手链定制'
  document.title = `${brandName} · 商家后台`
  document.querySelector('.admin-brand span').textContent = brandName.slice(0, 1)
  document.querySelector('.admin-brand strong').textContent = `${brandName} · 商家后台`
  byId('brandName').value = settings.brandName || ''
  byId('merchantContact').value = settings.merchantContact || ''
  byId('productionTime').value = settings.productionTime || ''
  byId('shippingNote').value = settings.shippingNote || ''
  byId('customNotice').value = settings.customNotice || ''
  byId('recommendationEnergyPrompt').value = settings.recommendationEnergyPrompt || '你此刻更想靠近哪种状态？'
  byId('recommendationElementPrompt').value = settings.recommendationElementPrompt || '你想从哪个五行方向寻找搭配？'
  byId('craft6').value = settings.craftPrices?.[6] ?? 0
  byId('craft8').value = settings.craftPrices?.[8] ?? 0
  byId('craft10').value = settings.craftPrices?.[10] ?? 0
  renderEntryImages()
  renderFilterOptions('energy')
  renderFilterOptions('element')
  renderMaterialFacets()
  byId('newMaterialEnergy').innerHTML = categorySelectOptions('energy', '')
  byId('newMaterialElement').innerHTML = categorySelectOptions('element', '')
  byId('newSimpleEnergy').innerHTML = categorySelectOptions('energy', '')
  byId('newSimpleElement').innerHTML = categorySelectOptions('element', '')
  renderNewMaterialFacetFields()
}

function renderEntryImages() {
  const images = state.catalog?.settings?.entryImages || {}
  document.querySelectorAll('.entry-image-editor').forEach((editor) => {
    const image = images[editor.dataset.entryKey] || ''
    const preview = editor.querySelector('.entry-image-preview')
    preview.innerHTML = image ? `<img src="${escapeHtml(image)}" alt="" />` : '<span>自动使用珠材图</span>'
    editor.querySelector('.remove-entry-image').disabled = !image
  })
}

async function loadCatalog() {
  state.catalog = await request('/api/admin/catalog')
  renderProducts()
  renderSettings()
  maybeShowOnboarding()
}

function closeOnboarding() {
  if (byId('dontShowOnboarding').checked) localStorage.setItem('puguang-admin-onboarding-dismissed', '1')
  byId('onboardingDialog').close()
}

function maybeShowOnboarding() {
  const hasActiveMaterials = (state.catalog?.materials || []).some((item) => item.active)
  if (hasActiveMaterials || localStorage.getItem('puguang-admin-onboarding-dismissed') === '1') return
  const dialog = byId('onboardingDialog')
  if (dialog && !dialog.open) dialog.showModal()
}

async function loadDesigns() {
  state.designs = await request('/api/admin/designs')
  renderDesigns()
}

function showView(view) {
  state.view = view
  document.querySelectorAll('.nav-button').forEach((button) => button.classList.toggle('active', button.dataset.view === view))
  document.querySelectorAll('.view').forEach((panel) => panel.classList.toggle('active', panel.dataset.viewPanel === view))
  if (view === 'designs') loadDesigns().catch((error) => toast(error.message))
}

document.querySelectorAll('.nav-button').forEach((button) => button.addEventListener('click', () => showView(button.dataset.view)))
document.querySelectorAll('#productTypes button').forEach((button) => button.addEventListener('click', () => {
  state.kind = button.dataset.kind
  if (state.kind !== 'accessories') state.accessoryCategoryFilter = 'all'
  document.querySelectorAll('#productTypes button').forEach((item) => item.classList.toggle('active', item === button))
  renderProducts()
}))
byId('reloadCatalog').addEventListener('click', () => loadCatalog().then(() => toast('商品已刷新')).catch((error) => toast(error.message)))
byId('reloadDesigns').addEventListener('click', () => loadDesigns().then(() => toast('方案已刷新')).catch((error) => toast(error.message)))
byId('confirmVariantMigration').addEventListener('click', async () => {
  const button = byId('confirmVariantMigration')
  button.disabled = true
  try {
    await request('/api/admin/settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ variantMigrationPending: false })
    })
    await loadCatalog()
  } catch (error) { toast(error.message) }
  finally { button.disabled = false }
})
byId('designSearch').addEventListener('input', renderDesigns)
byId('statusFilter').addEventListener('change', renderDesigns)
byId('addEnergyOption').addEventListener('click', () => addFilterOption('energy'))
byId('addMaterialFacet').addEventListener('click', () => appendMaterialFacet())
document.querySelectorAll('.entry-image-editor').forEach((editor) => {
  const input = editor.querySelector('.entry-image-file')
  editor.querySelector('.choose-entry-image').addEventListener('click', () => input.click())
  input.addEventListener('change', async () => {
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast('单张图片不能超过 5 MB'); return }
    const button = editor.querySelector('.choose-entry-image')
    button.disabled = true
    try {
      const entryImages = await request(`/api/admin/settings/entry-images/${editor.dataset.entryKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: await imageData(file) })
      })
      state.catalog.settings.entryImages = entryImages
      renderEntryImages()
      toast('首页入口图片已更新')
    } catch (error) { toast(error.message) }
    finally { button.disabled = false }
  })
  editor.querySelector('.remove-entry-image').addEventListener('click', async (event) => {
    const button = event.currentTarget
    button.disabled = true
    try {
      const entryImages = await request(`/api/admin/settings/entry-images/${editor.dataset.entryKey}`, { method: 'DELETE' })
      state.catalog.settings.entryImages = entryImages
      renderEntryImages()
      toast('已恢复自动图片')
    } catch (error) { toast(error.message) }
    finally { button.disabled = false }
  })
})
byId('settingsForm').addEventListener('submit', async (event) => {
  event.preventDefault()
  const button = event.submitter
  button.disabled = true
  try {
    await request('/api/admin/settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brandName: byId('brandName').value,
        merchantContact: byId('merchantContact').value,
        productionTime: byId('productionTime').value,
        shippingNote: byId('shippingNote').value,
        customNotice: byId('customNotice').value,
        recommendationEnergyPrompt: byId('recommendationEnergyPrompt').value,
        recommendationElementPrompt: byId('recommendationElementPrompt').value,
        craftPrices: { 6: Number(byId('craft6').value), 8: Number(byId('craft8').value), 10: Number(byId('craft10').value) },
        energyOptions: filterOptionsFromForm('energy'),
        elementOptions: filterOptionsFromForm('element'),
        materialFacets: materialFacetsFromForm()
      })
    })
    await loadCatalog()
    toast('店铺设置已保存')
  } catch (error) { toast(error.message) }
  finally { button.disabled = false }
})

byId('exportBackup').addEventListener('click', async () => {
  const button = byId('exportBackup')
  button.disabled = true
  try {
    const backup = await request('/api/admin/backup')
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `手串定制工具备份-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(link.href)
    toast('备份已导出')
  } catch (error) { toast(error.message) }
  finally { button.disabled = false }
})

byId('chooseBackup').addEventListener('click', () => byId('backupFile').click())
byId('backupFile').addEventListener('change', async (event) => {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  if (file.size > 100 * 1024 * 1024) { toast('备份文件不能超过 100 MB'); return }
  let backup
  try { backup = JSON.parse(await file.text()) } catch { toast('备份文件内容无法识别'); return }
  if (!confirm('导入后会覆盖当前店铺设置、商品和顾客方案。确定继续吗？')) return
  const button = byId('chooseBackup')
  button.disabled = true
  try {
    const result = await request('/api/admin/backup/restore', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(backup)
    })
    await Promise.all([loadCatalog(), loadDesigns()])
    toast(`恢复完成：${result.materials} 种珠材，${result.designs} 个方案`)
  } catch (error) { toast(error.message) }
  finally { button.disabled = false }
})

byId('logoutButton').addEventListener('click', async () => {
  try { await fetch('/api/admin/auth/logout', { method: 'POST' }) } finally { location.replace('/admin-login.html') }
})

byId('passwordForm').addEventListener('submit', async (event) => {
  event.preventDefault()
  const currentPassword = byId('currentPassword').value
  const newPassword = byId('newPassword').value
  if (newPassword !== byId('confirmNewPassword').value) { toast('两次输入的新密码不一致'); return }
  const button = event.submitter
  button.disabled = true
  try {
    await request('/api/admin/auth/change', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword })
    })
    byId('passwordForm').reset()
    toast('后台密码已修改')
  } catch (error) { toast(error.message) }
  finally { button.disabled = false }
})

byId('closeOnboarding').addEventListener('click', closeOnboarding)
byId('skipOnboarding').addEventListener('click', closeOnboarding)
document.querySelectorAll('[data-onboarding-view]').forEach((button) => button.addEventListener('click', () => {
  closeOnboarding()
  showView(button.dataset.onboardingView)
}))
byId('onboardingDialog').querySelector('[data-onboarding-material]').addEventListener('click', () => {
  closeOnboarding()
  byId('materialDialog').showModal()
})
byId('onboardingDialog').addEventListener('click', (event) => {
  if (event.target === byId('onboardingDialog')) closeOnboarding()
})
byId('onboardingDialog').addEventListener('close', () => { byId('dontShowOnboarding').checked = false })

Promise.all([loadCatalog(), loadDesigns()]).catch((error) => toast(error.message))
