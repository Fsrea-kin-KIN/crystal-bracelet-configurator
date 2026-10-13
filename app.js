let materials = [
  {
    id: 'bodhi', name: '白玉菩提根', price: 6, colors: ['#f4f1e8', '#c8bda8'],
    photos: [
      './assets/beads/white-bodhi.png',
      './assets/beads/white-bodhi-02.png',
      './assets/beads/white-bodhi-03.png',
      './assets/beads/white-bodhi-04.png',
      './assets/beads/white-bodhi-05.png'
    ],
    bead: 'radial-gradient(circle at 30% 24%, #fff 0 8%, #f0ede4 27%, #d7cfc1 61%, #a89c89 100%)',
    texture: 'radial-gradient(circle at 68% 66%, rgba(125,101,74,.12) 0 2%, transparent 8%), radial-gradient(circle at 35% 72%, rgba(108,85,61,.1) 0 1%, transparent 7%)'
  },
  {
    id: 'clear', name: '白水晶', price: 8, colors: ['#eef7f4', '#9baba6'],
    photos: [
      './assets/beads/white-crystal-01.png',
      './assets/beads/white-crystal-02.png',
      './assets/beads/white-crystal-03.png',
      './assets/beads/white-crystal-04.png',
      './assets/beads/white-crystal-05.png'
    ],
    bead: 'radial-gradient(circle at 30% 24%, #fff 0 7%, rgba(255,255,255,.84) 13%, rgba(221,235,231,.76) 37%, rgba(145,164,158,.72) 73%, #65756f 100%)',
    texture: 'linear-gradient(118deg, transparent 24%, rgba(255,255,255,.68) 38%, rgba(110,139,132,.16) 44%, transparent 53%), radial-gradient(ellipse at 68% 66%, rgba(255,255,255,.5), transparent 28%), radial-gradient(circle at 36% 72%, rgba(82,116,108,.24) 0 3%, transparent 14%)'
  },
  {
    id: 'moonstone', name: '冰种灰月光石', price: 14, colors: ['#eceee8', '#91a2b1'],
    photos: [
      './assets/beads/gray-moonstone.png',
      './assets/beads/gray-moonstone-02.png',
      './assets/beads/gray-moonstone-03.png',
      './assets/beads/gray-moonstone-04.png',
      './assets/beads/gray-moonstone-05.png'
    ],
    bead: 'radial-gradient(circle at 29% 23%, #fff 0 7%, #f2f1e9 18%, #c8d0d0 48%, #8797a4 78%, #596772 100%)',
    texture: 'radial-gradient(ellipse at 63% 36%, rgba(107,171,220,.58), transparent 31%), radial-gradient(ellipse at 39% 69%, rgba(246,194,218,.34), transparent 31%), linear-gradient(127deg, transparent 34%, rgba(255,255,255,.58) 45%, transparent 57%)'
  },
  {
    id: 'rose', name: '粉晶', price: 9, colors: ['#f4cfd5', '#bd7286'],
    photos: [
      './assets/beads/rose-quartz-01.png',
      './assets/beads/rose-quartz-02.png',
      './assets/beads/rose-quartz-03.png',
      './assets/beads/rose-quartz-04.png',
      './assets/beads/rose-quartz-05.png'
    ],
    bead: 'radial-gradient(circle at 30% 23%, #fff3f5 0 8%, #efc6ce 25%, #d79bab 54%, #aa6177 79%, #6e394d 100%)',
    texture: 'radial-gradient(ellipse at 69% 39%, rgba(255,242,245,.68), transparent 31%), linear-gradient(145deg, transparent 30%, rgba(119,55,77,.18) 43%, rgba(255,255,255,.35) 48%, transparent 56%), radial-gradient(circle at 31% 74%, rgba(255,255,255,.5) 0 3%, transparent 13%)'
  },
  {
    id: 'amethyst', name: '紫水晶', price: 11, colors: ['#bca7d0', '#604576'],
    photos: [
      './assets/beads/amethyst-01.png',
      './assets/beads/amethyst-02.png',
      './assets/beads/amethyst-03.png',
      './assets/beads/amethyst-04.png'
    ],
    bead: 'radial-gradient(circle at 29% 23%, #eee5f5 0 7%, #b69bca 27%, #7a5e94 56%, #4d3862 81%, #281d35 100%)',
    texture: 'conic-gradient(from 18deg at 52% 55%, rgba(236,218,248,.42), transparent 15%, rgba(57,33,76,.28) 31%, transparent 48%, rgba(255,255,255,.22) 64%, transparent 81%), linear-gradient(76deg, transparent 41%, rgba(255,255,255,.4) 46%, transparent 52%)'
  },
  {
    id: 'aquamarine', name: '海蓝宝', price: 14, colors: ['#b8dde0', '#4c8490'],
    photos: [
      './assets/beads/aquamarine-01.png',
      './assets/beads/aquamarine-02.png',
      './assets/beads/aquamarine-03.png',
      './assets/beads/aquamarine-04.png'
    ],
    bead: 'radial-gradient(circle at 29% 23%, #ebffff 0 7%, #b7dfe1 26%, #7fb9c0 54%, #487f8b 79%, #28515c 100%)',
    texture: 'linear-gradient(112deg, transparent 26%, rgba(225,255,255,.7) 38%, rgba(45,111,124,.19) 43%, transparent 49%), radial-gradient(ellipse at 68% 68%, rgba(255,255,255,.35), transparent 32%), radial-gradient(circle at 35% 65%, rgba(32,99,111,.2) 0 3%, transparent 15%)'
  },
  {
    id: 'lapis', name: '青金石', price: 12, colors: ['#3159bd', '#101d59'],
    photos: [
      './assets/beads/lapis-lazuli-01.png',
      './assets/beads/lapis-lazuli-02.png',
      './assets/beads/lapis-lazuli-03.png',
      './assets/beads/lapis-lazuli-04.png',
      './assets/beads/lapis-lazuli-05.png'
    ],
    bead: 'radial-gradient(circle at 29% 22%, #6d8cec 0 6%, #3159bd 25%, #173582 55%, #101d59 80%, #080d2d 100%)',
    texture: 'radial-gradient(circle at 34% 38%, rgba(226,190,87,.72) 0 1%, transparent 4%), radial-gradient(circle at 67% 61%, rgba(226,190,87,.58) 0 1%, transparent 4%), linear-gradient(128deg, transparent 31%, rgba(123,157,236,.35) 43%, transparent 53%)'
  },
  {
    id: 'obsidian', name: '乌金黑曜石', price: 6, colors: ['#596060', '#080a0b'],
    photos: [
      './assets/beads/black-obsidian.png',
      './assets/beads/black-obsidian-01.png'
    ],
    bead: 'radial-gradient(circle at 28% 22%, #899191 0 4%, #414748 17%, #1c2122 48%, #0a0d0e 78%, #020303 100%)',
    texture: 'radial-gradient(ellipse at 62% 58%, rgba(84,111,105,.36), transparent 32%), linear-gradient(130deg, transparent 35%, rgba(255,255,255,.17) 44%, transparent 52%), radial-gradient(circle at 32% 72%, rgba(255,255,255,.16) 0 2%, transparent 8%)'
  },
  {
    id: 'silver-obsidian', name: '银曜石', price: 9, colors: ['#a6acab', '#111516'],
    photos: [
      './assets/beads/silver-obsidian-01.png',
      './assets/beads/silver-obsidian-02.png',
      './assets/beads/silver-obsidian-03.png'
    ],
    bead: 'radial-gradient(circle at 28% 22%, #e1e5e4 0 4%, #899190 18%, #303536 48%, #111415 78%, #040505 100%)',
    texture: 'linear-gradient(132deg, transparent 23%, rgba(235,241,240,.62) 38%, rgba(114,129,127,.32) 46%, transparent 57%), radial-gradient(ellipse at 64% 62%, rgba(198,211,208,.3), transparent 33%)'
  },
  {
    id: 'gold-obsidian', name: '金曜石', price: 11, colors: ['#a8894e', '#100d09'],
    photos: [
      './assets/beads/gold-obsidian-01.png',
      './assets/beads/gold-obsidian-02.png',
      './assets/beads/gold-obsidian-03.png',
      './assets/beads/gold-obsidian-04.png',
      './assets/beads/gold-obsidian-05.png'
    ],
    bead: 'radial-gradient(circle at 28% 22%, #d7c493 0 4%, #725d35 18%, #292218 48%, #100d0a 78%, #030302 100%)',
    texture: 'linear-gradient(128deg, transparent 24%, rgba(225,190,108,.62) 38%, rgba(110,83,35,.35) 47%, transparent 58%), radial-gradient(ellipse at 66% 62%, rgba(203,165,80,.28), transparent 32%)'
  },
  {
    id: 'tiger', name: '金虎眼', price: 7, colors: ['#e8bc4d', '#6d3f18'],
    photos: [
      './assets/beads/gold-tiger-eye-01.png',
      './assets/beads/gold-tiger-eye-02.png',
      './assets/beads/gold-tiger-eye-03.png',
      './assets/beads/gold-tiger-eye-04.png',
      './assets/beads/gold-tiger-eye-05.png'
    ],
    bead: 'radial-gradient(circle at 28% 22%, #f5ca7f 0 6%, #ca8b43 25%, #8b572e 54%, #59361f 78%, #2c1a12 100%)',
    texture: 'linear-gradient(104deg, transparent 20%, rgba(57,29,13,.48) 31%, rgba(255,207,104,.8) 43%, rgba(91,49,20,.54) 55%, transparent 69%), linear-gradient(104deg, transparent 41%, rgba(255,237,176,.55) 47%, transparent 53%)'
  },
  {
    id: 'cinnabar', name: '朱砂', price: 10, colors: ['#c95143', '#661817'],
    photos: [
      './assets/beads/cinnabar-01.png',
      './assets/beads/cinnabar-02.png',
      './assets/beads/cinnabar-03.png'
    ],
    bead: 'radial-gradient(circle at 28% 22%, #ef9584 0 6%, #c84a3e 25%, #8e2928 55%, #5d171a 80%, #310d11 100%)',
    texture: 'radial-gradient(circle at 37% 42%, rgba(73,16,17,.45) 0 5%, transparent 12%), linear-gradient(132deg, transparent 32%, rgba(255,190,166,.38) 44%, transparent 53%)'
  },
  {
    id: 'citrine', name: '黄水晶', price: 16, colors: ['#f7dc8e', '#a76b22'],
    bead: 'radial-gradient(circle at 29% 22%, #fff7c5 0 7%, #f1d57c 25%, #d4a943 54%, #9f6826 79%, #654016 100%)',
    texture: 'linear-gradient(139deg, transparent 29%, rgba(255,250,206,.64) 41%, rgba(126,76,17,.2) 47%, transparent 54%), radial-gradient(ellipse at 68% 66%, rgba(255,235,148,.42), transparent 29%), radial-gradient(circle at 38% 69%, rgba(114,69,17,.24) 0 3%, transparent 12%)'
  },
  {
    id: 'rutilated', name: '金发晶', price: 18, colors: ['#ead9a4', '#8f641b'],
    photos: [
      './assets/beads/gold-rutilated-01.png',
      './assets/beads/gold-rutilated-02.png',
      './assets/beads/gold-rutilated-03.png'
    ],
    bead: 'radial-gradient(circle at 29% 22%, #fff9d9 0 7%, #ddc27c 26%, #b68b36 55%, #76521c 80%, #33210d 100%)',
    texture: 'repeating-linear-gradient(117deg, transparent 0 5px, rgba(255,239,167,.72) 6px 7px, transparent 8px 13px), radial-gradient(ellipse at 66% 65%, rgba(255,225,118,.35), transparent 30%)'
  },
  {
    id: 'sandal', name: '檀木', price: 4, colors: ['#ad7a56', '#4b2d20'],
    bead: 'radial-gradient(circle at 29% 23%, #c99a72 0 7%, #a66e4d 29%, #75472f 58%, #503023 81%, #2f1c16 100%)',
    texture: 'repeating-linear-gradient(106deg, transparent 0 5px, rgba(47,22,14,.28) 6px 7px, rgba(229,170,116,.2) 8px 10px), radial-gradient(ellipse at 63% 61%, transparent 0 25%, rgba(50,24,15,.28) 28% 31%, transparent 34%)'
  }
]

const colorNames = { white: '月光白', pink: '柔雾粉', purple: '暮光紫', blue: '湖水蓝', gray: '月光灰', black: '曜石黑', gold: '暖金棕', red: '朱砂红' }
const colorSwatches = { white: '#e8e9e5', pink: '#e8a7b6', purple: '#8b78ad', blue: '#70a9b7', gray: '#8f9697', black: '#232629', gold: '#aa713d', red: '#a83731' }
const defaultEnergyNames = { calm: '安定平静', focus: '专注清晰', confidence: '自信表达', vitality: '活力行动', balance: '平衡陪伴' }
const defaultElementNames = { metal: '金', wood: '木', water: '水', fire: '火', earth: '土' }
const configuredEnergyOptions = window.__CATALOG__?.settings?.energyOptions
const configuredElementOptions = window.__CATALOG__?.settings?.elementOptions
const energyNames = Array.isArray(configuredEnergyOptions)
  ? Object.fromEntries(configuredEnergyOptions.filter((item) => item.active !== false).map((item) => [item.key, item.name]))
  : defaultEnergyNames
const elementNames = Array.isArray(configuredElementOptions)
  ? Object.fromEntries(configuredElementOptions.filter((item) => item.active !== false).map((item) => [item.key, item.name]))
  : defaultElementNames
const genericMaterialStyles = {
  white: ['#f6f7f3', '#aeb8b3'], pink: ['#f3c8d1', '#a96078'], purple: ['#c0add4', '#59416f'], blue: ['#b1d9df', '#397283'],
  gray: ['#d7dcda', '#667174'], black: ['#697070', '#080a0b'], gold: ['#e4bf74', '#6f421e'], red: ['#dd7768', '#681918']
}
const legacyColorKeys = {
  bodhi: 'white', clear: 'white', moonstone: 'gray', rose: 'pink', amethyst: 'purple', aquamarine: 'blue', lapis: 'blue',
  obsidian: 'black', 'silver-obsidian': 'black', 'gold-obsidian': 'gold', tiger: 'gold', cinnabar: 'red', citrine: 'gold', rutilated: 'gold', sandal: 'gold'
}
function fallbackMaterialStyle(colorKey = 'white') {
  const colors = genericMaterialStyles[colorKey] || genericMaterialStyles.white
  return {
    colors,
    bead: `radial-gradient(circle at 29% 23%, #fff 0 6%, ${colors[0]} 27%, ${colors[1]} 78%, #2d312f 100%)`,
    texture: 'linear-gradient(132deg, transparent 31%, rgba(255,255,255,.48) 43%, transparent 54%)'
  }
}
if (window.__CATALOG__?.materials) {
  const builtInMaterials = new Map(materials.map((item) => [item.id, item]))
  materials = window.__CATALOG__.materials.map((item) => {
    const builtIn = builtInMaterials.get(item.id)
    const colorKey = item.colorKey || legacyColorKeys[item.id] || 'white'
    return {
      ...fallbackMaterialStyle(colorKey), ...builtIn, ...item, colorKey,
      energyKey: item.energyKey || item.styleKey || 'balance',
      elementKey: item.elementKey || item.useKey || 'metal'
    }
  })
}
function isCatalogSelectable(item) { return Boolean(item) && item.active !== false && !item.deleted }
function catalogStock(item) {
  const value = Number(item?.stock)
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 999
}
const cords = {
  clear: { name: '透明白', color: '#d9d9d4' },
  pink: { name: '浅粉', color: '#d9899e' },
  red: { name: '酒红', color: '#9e2830' },
  gold: { name: '金棕', color: '#b88729' },
  green: { name: '墨绿', color: '#315f45' },
  blue: { name: '湖蓝', color: '#285a93' },
  black: { name: '黑色', color: '#202422' }
  ,gray: { name: '雾灰', color: '#737b7c' }
}
if (window.__CATALOG__?.cords) {
  Object.keys(cords).forEach((id) => delete cords[id])
  window.__CATALOG__.cords.forEach((item) => { cords[item.id] = { ...item, name: item.name, color: item.color } })
}
const colorRecipes = {
  white: ['bodhi', 'clear'],
  pink: ['rose'],
  purple: ['amethyst'],
  blue: ['aquamarine', 'lapis'],
  gray: ['moonstone'],
  black: ['obsidian', 'silver-obsidian'],
  gold: ['gold-obsidian', 'tiger', 'citrine', 'rutilated', 'sandal'],
  red: ['cinnabar']
}
if (window.__CATALOG__?.materials) {
  Object.keys(colorRecipes).forEach((key) => { colorRecipes[key] = [] })
  materials.filter(isCatalogSelectable).forEach((material) => { (colorRecipes[material.colorKey] ||= []).push(material.id) })
}

const historyStorageKey = 'puguang-design-history'
const accessoryTokenPrefix = 'accessory:'
function createHistoryId() { return `design-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }
const firstSelectableMaterial = materials.find(isCatalogSelectable)
const firstSelectableCord = Object.entries(cords).find(([, item]) => isCatalogSelectable(item) && catalogStock(item) > 0)?.[0]
  || Object.entries(cords).find(([, item]) => isCatalogSelectable(item))?.[0]

const defaultState = {
  version: 6,
  historyId: createHistoryId(),
  wrist: 16,
  beadSize: 8,
  color: firstSelectableMaterial?.colorKey || 'white',
  materialFacet: 'color',
  materialFacetValue: firstSelectableMaterial?.colorKey || 'white',
  exploreMode: 'energy',
  exploreSelection: '',
  accessory: 'none',
  accessoryPrice: 0,
  cord: firstSelectableCord || '',
  note: '',
  referenceImage: '',
  selectedIndex: 0,
  selectedMaterial: firstSelectableMaterial?.id || '',
  selectedAccessory: 'silver',
  accessoryCategory: 'accessories',
  beadCountOverride: null,
  beads: []
}

const previousDraft = loadState()
archiveDraftForNextVisit(previousDraft)
let state = { ...defaultState, historyId: createHistoryId(), beads: [] }
let toastTimer = null
let undoSnapshot = null
let editingBead = false
let draggingBead = null
let pendingDragAddition = null
let restoredHistoryBaseline = state.historyBaseline || null
let referenceImageSource = /^\/uploads\/[a-f0-9-]+\.(?:png|jpg|webp)$/i.test(String(state.referenceImage || '')) ? state.referenceImage : ''

function byId(id) { return document.getElementById(id) }
function renderReferenceImage() {
  const preview = byId('referenceImagePreview')
  const image = byId('referenceImagePreviewImage')
  const hasImage = Boolean(referenceImageSource)
  preview.hidden = !hasImage
  image.src = hasImage ? referenceImageSource : ''
  byId('referenceImageButton').textContent = hasImage ? '更换图片' : '选择图片'
}
function materialById(id) { return materials.find((item) => item.id === id) || materials[0] || null }
function unavailableMaterialsInDesign() {
  const unavailableIds = [...new Set(state.beads.filter((value) => {
    if (!value || String(value).startsWith(accessoryTokenPrefix)) return false
    return !isCatalogSelectable(materials.find((item) => item.id === value))
  }))]
  return unavailableIds.map((id) => materials.find((item) => item.id === id) || { id, name: '已删除珠材' })
}
const fallbackAccessories = [
  { id: 'silver', name: '银色星芒', price: 38 },
  { id: 'gold', name: '暖金圆牌', price: 48 }
]
function accessoryItems() {
  return (window.__CATALOG__?.accessories || fallbackAccessories).filter((item) => item.id !== 'none')
}
function accessoryCategoryItems() {
  const categories = window.__CATALOG__?.accessoryCategories
  return Array.isArray(categories) && categories.length ? categories.filter((item) => !item.deleted) : [{ id: 'accessories', name: '配件' }]
}
function selectableAccessoryItems() { return accessoryItems().filter(isCatalogSelectable) }
function accessoryById(id) {
  return accessoryItems().find((item) => item.id === id)
}
function materialVariant(material, size = state.beadSize) {
  const variant = material?.variants?.[size] || material?.variants?.[String(size)]
  return variant || { price: Number(material?.price || 0), stock: catalogStock(material), active: true }
}
function accessoryPhotos(accessory) { return Array.isArray(accessory?.photos) ? accessory.photos : [] }
function accessoryPhoto(accessory, index = 0) {
  const photos = accessoryPhotos(accessory)
  return photos.length ? photos[index % photos.length] : null
}
function accessoryToken(id) { return `${accessoryTokenPrefix}${id}` }
function accessoryIdFromToken(value) { return String(value).startsWith(accessoryTokenPrefix) ? String(value).slice(accessoryTokenPrefix.length) : null }
function isAccessoryToken(value) { return Boolean(accessoryById(accessoryIdFromToken(value))) }
function isMaterialId(value) { return materials.some((item) => item.id === value) }
function itemStock(value) {
  const accessory = accessoryById(accessoryIdFromToken(value))
  const material = materials.find((item) => item.id === value)
  return accessory ? catalogStock(accessory) : material ? catalogStock(materialVariant(material)) : 0
}
function itemUsage(value, beads = state.beads) { return beads.filter((item) => item === value).length }
function isItemSelectable(value) {
  const accessory = accessoryById(accessoryIdFromToken(value))
  const material = materials.find((item) => item.id === value)
  return accessory ? isCatalogSelectable(accessory) : Boolean(isCatalogSelectable(material) && materialVariant(material).active !== false)
}
function hasItemStock(value, amount = 1) { return isItemSelectable(value) && itemUsage(value) + amount <= itemStock(value) }
function stockIssueInDesign() {
  const counts = state.beads.filter(isPlacedItem).reduce((result, value) => result.set(value, (result.get(value) || 0) + 1), new Map())
  const unavailable = [...counts.keys()].filter((value) => {
    const accessory = accessoryById(accessoryIdFromToken(value))
    const material = materials.find((item) => item.id === value)
    return accessory ? !isCatalogSelectable(accessory) : !isCatalogSelectable(material) || materialVariant(material).active === false
  }).map(itemName)
  if (unavailable.length) return `${unavailable.join('、')}已下架，请更换后再生成`
  const exhausted = [...counts].filter(([value, count]) => count > itemStock(value)).map(([value]) => itemName(value))
  if (exhausted.length) return `${exhausted.join('、')}数量超过库存，请减少后再生成`
  const cord = cords[state.cord]
  if (!isCatalogSelectable(cord)) return '所选绳子已下架，请更换后再生成'
  if (catalogStock(cord) < 1) return '所选绳子库存不足，请更换后再生成'
  return ''
}
function itemName(value) {
  const accessory = accessoryById(accessoryIdFromToken(value))
  const material = materials.find((item) => item.id === value)
  return accessory?.name || material?.name || '已删除商品'
}
function selectItem(value) {
  const accessoryId = accessoryIdFromToken(value)
  if (accessoryId) state.selectedAccessory = accessoryId
  else state.selectedMaterial = value
}
function beadTotal() { return Math.max(1, Math.round((state.wrist * 10) / state.beadSize)) }
function isPlacedItem(value) { return isMaterialId(value) || isAccessoryToken(value) }
function placedBeadCount(beads = state.beads) { return beads.filter(isPlacedItem).length }
function occupiedSlotIndexes(beads = state.beads) {
  return beads.flatMap((value, slotIndex) => isPlacedItem(value) ? [slotIndex] : [])
}
function nextOccupiedSlot(fromIndex, beads = state.beads) {
  if (!placedBeadCount(beads)) return -1
  for (let offset = 1; offset <= beads.length; offset += 1) {
    const slotIndex = (fromIndex + offset + beads.length) % beads.length
    if (isPlacedItem(beads[slotIndex])) return slotIndex
  }
  return -1
}
function nextEmptySlot(fromIndex, beads = state.beads) {
  for (let offset = 1; offset <= beads.length; offset += 1) {
    const slotIndex = (fromIndex + offset + beads.length) % beads.length
    if (!isPlacedItem(beads[slotIndex])) return slotIndex
  }
  return -1
}
function remapSlotValues(values, targetLength) {
  const source = Array.isArray(values) ? values : []
  const entries = source.flatMap((value, slotIndex) => isPlacedItem(value) ? [{ value, slotIndex }] : [])
  if (!entries.length) return []
  const length = Math.max(entries.length, targetLength)
  if (source.length === length) return Array.from({ length }, (_, index) => isPlacedItem(source[index]) ? source[index] : null)
  const result = Array(length).fill(null)
  const sourceLength = Math.max(1, source.length)
  entries.forEach(({ value, slotIndex }) => {
    let targetIndex = Math.round(slotIndex / sourceLength * length) % length
    while (isPlacedItem(result[targetIndex])) targetIndex = (targetIndex + 1) % length
    result[targetIndex] = value
  })
  return result
}
function placeItemAroundAnchor(item, anchorIndex = state.selectedIndex, { replaceWhenSurrounded = false } = {}) {
  if (!state.beads.length) state.beads = Array(beadTotal()).fill(null)
  const length = state.beads.length
  if (!placedBeadCount()) {
    state.beads[0] = item
    return { slotIndex: 0, replaced: false, changed: true }
  }
  const anchor = Math.min(Math.max(0, Number(anchorIndex) || 0), length - 1)
  const clockwiseIndex = (anchor + 1) % length
  if (!isPlacedItem(state.beads[clockwiseIndex])) {
    state.beads[clockwiseIndex] = item
    return { slotIndex: clockwiseIndex, replaced: false, changed: true }
  }
  const counterclockwiseIndex = (anchor - 1 + length) % length
  if (!isPlacedItem(state.beads[counterclockwiseIndex])) {
    state.beads[counterclockwiseIndex] = item
    return { slotIndex: counterclockwiseIndex, replaced: false, changed: true }
  }
  if (replaceWhenSurrounded) {
    const changed = state.beads[anchor] !== item
    state.beads[anchor] = item
    return { slotIndex: anchor, replaced: true, changed }
  }
  const nextIndex = nextEmptySlot(anchor)
  if (nextIndex >= 0) {
    state.beads[nextIndex] = item
    return { slotIndex: nextIndex, replaced: false, changed: true }
  }
  return { slotIndex: anchor, replaced: false, changed: false, full: true }
}
function placeItemForCurrentContext(item) {
  const anchorIndex = pendingDragAddition?.anchorIndex ?? state.selectedIndex
  const replaceWhenSurrounded = editingBead || Boolean(pendingDragAddition)
  pendingDragAddition = null
  return placeItemAroundAnchor(item, anchorIndex, { replaceWhenSurrounded })
}
function materialPhotos(material) { return Array.isArray(material.photos) ? material.photos : material.photo ? [material.photo] : [] }
function materialPhoto(material, index = 0) {
  const photos = materialPhotos(material)
  const photoIndex = photos.length ? (index * 7 + Math.floor(index / 5) + material.id.length) % photos.length : 0
  return photos.length ? photos[photoIndex] : null
}

function materialFacetDefinitions() {
  const customFacets = Array.isArray(window.__CATALOG__?.settings?.materialFacets)
    ? window.__CATALOG__.settings.materialFacets
    : []
  return [
    {
      key: 'color',
      name: '颜色分类',
      type: 'color',
      options: Object.entries(colorNames).map(([key, name]) => ({ key, name, active: true }))
    },
    ...customFacets,
    {
      key: 'element',
      name: '五行分类',
      type: 'text',
      options: Object.entries(elementNames).map(([key, name]) => ({ key, name, active: true }))
    }
  ].filter((facet) => facet.active !== false).map((facet) => ({
    ...facet,
    options: (facet.options || []).filter((option) => option.active !== false && materials.some((material) => materialMatchesFacet(material, facet.key, option.key)))
  })).filter((facet) => facet.options.length)
}

function materialMatchesFacet(material, facetKey, optionKey) {
  if (facetKey === 'color') return material.colorKey === optionKey
  if (facetKey === 'element') return material.elementKey === optionKey
  return material.facetValues?.[facetKey] === optionKey
}

function activeMaterialFacet() {
  const facets = materialFacetDefinitions()
  let facet = facets.find((item) => item.key === state.materialFacet) || facets[0]
  if (!facet) return null
  let option = facet.options.find((item) => item.key === state.materialFacetValue) || facet.options[0]
  state.materialFacet = facet.key
  state.materialFacetValue = option?.key || ''
  if (facet.key === 'color' && option) state.color = option.key
  return { facet, option }
}

function categoryMaterials() {
  const active = activeMaterialFacet()
  if (!active?.option) return []
  return materials.filter((material) => isCatalogSelectable(material) && materialMatchesFacet(material, active.facet.key, active.option.key))
}

function renderMaterialFacetNavigation() {
  const tabs = byId('materialFacetTabs')
  const options = byId('materialFacetOptions')
  const active = activeMaterialFacet()
  tabs.innerHTML = ''
  options.innerHTML = ''
  if (!active) return

  materialFacetDefinitions().forEach((facet) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = facet.name
    button.classList.toggle('active', facet.key === active.facet.key)
    button.setAttribute('aria-pressed', String(facet.key === active.facet.key))
    button.addEventListener('click', () => {
      state.materialFacet = facet.key
      state.materialFacetValue = facet.options[0]?.key || ''
      renderAll()
    })
    tabs.appendChild(button)
  })

  active.facet.options.forEach((option) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.dataset.value = option.key
    button.className = active.facet.type === 'color' ? 'catalog-color-option' : 'catalog-text-option'
    button.classList.toggle('active', option.key === active.option.key)
    button.setAttribute('aria-label', option.name)
    button.title = option.name
    if (active.facet.type === 'color') {
      const swatch = document.createElement('span')
      swatch.style.setProperty('--swatch', colorSwatches[option.key] || '#d8dfdc')
      button.appendChild(swatch)
    } else button.textContent = option.name
    button.addEventListener('click', () => {
      state.materialFacetValue = option.key
      if (active.facet.key === 'color') state.color = option.key
      const first = materials.find((material) => materialMatchesFacet(material, active.facet.key, option.key))
      if (first) state.selectedMaterial = first.id
      renderAll()
    })
    options.appendChild(button)
  })
}

function resizeBeadsForTarget(previousTotal, nextTotal) {
  const existing = Array.isArray(state.beads) ? [...state.beads] : []
  if (!existing.length || previousTotal === nextTotal) return

  const nextLength = Math.min(
    nextTotal,
    Math.max(1, Math.round(existing.length * nextTotal / Math.max(1, previousTotal)))
  )
  const selectedRatio = existing.length > 1 ? state.selectedIndex / (existing.length - 1) : 0
  const accessories = existing
    .map((value, index) => ({ value, ratio: existing.length > 1 ? index / (existing.length - 1) : 0 }))
    .filter((item) => isAccessoryToken(item.value))
    .slice(0, nextLength)
  const materialIds = existing.filter(isMaterialId)
  const materialCount = Math.max(0, nextLength - accessories.length)
  const resizedMaterials = Array.from({ length: materialCount }, (_, index) => {
    const sourceIndex = Math.min(materialIds.length - 1, Math.floor(index * materialIds.length / Math.max(1, materialCount)))
    return materialIds[sourceIndex] || state.selectedMaterial
  })
  if (materialIds.length && materialCount) {
    const sourceCounts = materialIds.reduce((result, id) => result.set(id, (result.get(id) || 0) + 1), new Map())
    const minimum = materialCount >= sourceCounts.size ? 1 : 0
    const targets = [...sourceCounts].map(([id, count]) => {
      const raw = count * materialCount / materialIds.length
      return { id, raw, count: Math.max(minimum, Math.floor(raw)) }
    })
    let assigned = targets.reduce((sum, item) => sum + item.count, 0)
    while (assigned < materialCount) {
      const target = targets.reduce((best, item) => item.raw - item.count > best.raw - best.count ? item : best)
      target.count += 1
      assigned += 1
    }
    while (assigned > materialCount) {
      const candidates = targets.filter((item) => item.count > minimum)
      const target = candidates.reduce((best, item) => item.count - item.raw > best.count - best.raw ? item : best)
      target.count -= 1
      assigned -= 1
    }
    const desiredCounts = new Map(targets.map((item) => [item.id, item.count]))
    const actualCounts = resizedMaterials.reduce((result, id) => result.set(id, (result.get(id) || 0) + 1), new Map())
    targets.forEach(({ id, count }) => {
      while ((actualCounts.get(id) || 0) < count) {
        const sourcePositions = materialIds.flatMap((value, index) => value === id ? [index] : [])
        const sourceCenter = sourcePositions.reduce((sum, index) => sum + index, 0) / sourcePositions.length
        const targetPosition = Math.round((sourceCenter / Math.max(1, materialIds.length - 1)) * Math.max(0, materialCount - 1))
        const replaceIndex = resizedMaterials
          .map((value, index) => ({ value, index, distance: Math.abs(index - targetPosition) }))
          .filter((item) => (actualCounts.get(item.value) || 0) > (desiredCounts.get(item.value) || 0))
          .sort((a, b) => a.distance - b.distance)[0]?.index
        if (replaceIndex === undefined) break
        const replaced = resizedMaterials[replaceIndex]
        resizedMaterials[replaceIndex] = id
        actualCounts.set(replaced, actualCounts.get(replaced) - 1)
        actualCounts.set(id, (actualCounts.get(id) || 0) + 1)
      }
    })
  }
  state.beads = Array(nextTotal).fill(null)
  resizedMaterials.forEach((value, index) => { state.beads[index] = value })
  accessories.forEach((item) => {
    const target = Math.min(state.beads.length - 1, Math.round(item.ratio * Math.max(0, nextTotal - 1)))
    const empty = state.beads.findIndex((value, index) => index >= target && !isPlacedItem(value))
    state.beads[empty < 0 ? target : empty] = item.value
  })
  state.selectedIndex = Math.min(nextTotal - 1, Math.round(selectedRatio * Math.max(0, nextTotal - 1)))
  selectItem(state.beads[state.selectedIndex] || state.selectedMaterial)
  state.beadCountOverride = placedBeadCount()
}

const photoCache = new Map()
;[...materials.flatMap(materialPhotos), ...accessoryItems().flatMap(accessoryPhotos)].forEach((source) => {
  const image = new Image()
  image.src = source
  photoCache.set(source, image)
})

function styleMaterial(element, material, index = 0) {
  const rawSeed = index * 47 + material.id.length * 31
  const seed = rawSeed % 101
  const photo = materialPhoto(material, index)
  element.style.setProperty('--bead', material.bead)
  element.style.setProperty('--texture', material.texture)
  element.style.setProperty('--photo', photo ? `url("${photo}")` : 'none')
  element.dataset.photoVariant = photo || ''
  element.classList.toggle('has-photo', Boolean(photo))
  element.style.setProperty('--texture-turn', `${(seed % 72) - 36}deg`)
  element.style.setProperty('--texture-x', `${30 + (seed % 41)}%`)
  element.style.setProperty('--texture-y', `${25 + ((seed * 3) % 51)}%`)
  element.style.setProperty('--bead-turn', `${(seed % 9) - 4}deg`)
  element.style.setProperty('--bead-scale', `${0.97 + (seed % 7) * 0.01}`)
}

function normalizeBeads() {
  if (!cords[state.cord]) state.cord = Object.keys(cords)[0] || ''
  const existing = Array.isArray(state.beads) ? state.beads : []
  const count = placedBeadCount(existing)
  if (!count) {
    state.beads = []
    state.beadCountOverride = null
    state.selectedIndex = 0
    editingBead = false
    return
  }
  const targetLength = Math.max(beadTotal(), count)
  const previousLength = Math.max(1, existing.length)
  const previousSelection = Math.min(Math.max(0, Number(state.selectedIndex) || 0), previousLength - 1)
  state.beads = remapSlotValues(existing, targetLength)
  if (!isPlacedItem(state.beads[previousSelection]) || existing.length !== targetLength) {
    const mappedSelection = Math.round(previousSelection / previousLength * targetLength) % targetLength
    state.selectedIndex = isPlacedItem(state.beads[mappedSelection]) ? mappedSelection : nextOccupiedSlot(mappedSelection - 1)
  } else {
    state.selectedIndex = previousSelection
  }
  state.beadCountOverride = count
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('puguang-design') || 'null')
    if (![4, 5, defaultState.version].includes(saved?.version)) return { ...defaultState }
    const migrated = { ...defaultState, ...saved, version: defaultState.version }
    if (saved.version === 4 && saved.accessory && saved.accessory !== 'none' && accessoryById(saved.accessory)) {
      const max = Math.max(1, Math.round((Number(saved.wrist) * 10) / Number(saved.beadSize)))
      migrated.beads = Array.isArray(saved.beads) ? [...saved.beads] : []
      if (migrated.beads.length >= max) migrated.beads.pop()
      migrated.beads.push(accessoryToken(saved.accessory))
    }
    if ([4, 5].includes(saved.version) && Array.isArray(migrated.beads) && migrated.beads.length) {
      const count = placedBeadCount(migrated.beads)
      const capacity = Math.max(1, Math.round((Number(migrated.wrist) * 10) / Number(migrated.beadSize)))
      migrated.beads = [...migrated.beads, ...Array(Math.max(0, Math.max(capacity, count) - migrated.beads.length)).fill(null)]
    }
    migrated.version = defaultState.version
    migrated.accessory = 'none'
    migrated.accessoryPrice = 0
    return migrated
  } catch {
    return { ...defaultState }
  }
}

function loadHistory() {
  try {
    const entries = JSON.parse(localStorage.getItem(historyStorageKey) || '[]')
    const validEntries = Array.isArray(entries) ? entries.filter((entry) => entry?.id && entry?.design) : []
    const seen = new Set()
    const uniqueEntries = validEntries.filter((entry) => {
      const signature = historyDesignSignature(entry.design)
      if (seen.has(signature)) return false
      seen.add(signature)
      return true
    })
    if (uniqueEntries.length !== validEntries.length) {
      localStorage.setItem(historyStorageKey, JSON.stringify(uniqueEntries.slice(0, 12)))
    }
    return uniqueEntries
  } catch {
    return []
  }
}

function archiveDraftForNextVisit(draft) {
  const beads = Array.isArray(draft?.beads) ? draft.beads : []
  if (!placedBeadCount(beads)) return
  const signature = historyDesignSignature(draft)
  const entries = loadHistory()
  const existing = entries.find((entry) => historyDesignSignature(entry.design) === signature)
  if (existing) {
    existing.updatedAt = new Date().toISOString()
    existing.design = { ...draft, beads: [...beads] }
    localStorage.setItem(historyStorageKey, JSON.stringify(entries.slice(0, 12)))
    return
  }
  entries.unshift({
    id: draft.historyId || createHistoryId(),
    code: '',
    updatedAt: new Date().toISOString(),
    design: { ...draft, beads: [...beads] }
  })
  localStorage.setItem(historyStorageKey, JSON.stringify(entries.slice(0, 12)))
}

function historyDesignSignature(design) {
  return JSON.stringify({
    wrist: Number(design?.wrist) || defaultState.wrist,
    beadSize: Number(design?.beadSize) || defaultState.beadSize,
    beads: Array.isArray(design?.beads) ? design.beads.map((value) => value || null) : [],
    cord: String(design?.cord || defaultState.cord),
    note: String(design?.note || ''),
    referenceImage: String(design?.referenceImage || '')
  })
}

function saveHistorySnapshot(code = '') {
  if (!placedBeadCount()) return
  const signature = historyDesignSignature(state)
  const entries = loadHistory()
  if (restoredHistoryBaseline) {
    if (signature === restoredHistoryBaseline.signature) {
      if (code) {
        const source = entries.find((entry) => entry.id === restoredHistoryBaseline.sourceId)
        if (source) source.code = code
        localStorage.setItem(historyStorageKey, JSON.stringify(entries.slice(0, 12)))
      }
      return
    }
    restoredHistoryBaseline = null
    delete state.historyBaseline
  }
  if (!state.historyId) state.historyId = createHistoryId()
  const existingIndex = entries.findIndex((entry) => entry.id === state.historyId)
  const existing = existingIndex >= 0 ? entries[existingIndex] : null
  const duplicateIndex = entries.findIndex((entry, index) => index !== existingIndex && historyDesignSignature(entry.design) === signature)
  if (duplicateIndex >= 0) {
    if (code) entries[duplicateIndex].code = code
    if (existingIndex >= 0) entries.splice(existingIndex, 1)
    localStorage.setItem(historyStorageKey, JSON.stringify(entries.slice(0, 12)))
    return
  }
  const entry = {
    id: state.historyId,
    code: code || existing?.code || '',
    updatedAt: new Date().toISOString(),
    design: { ...state, beads: [...state.beads] }
  }
  if (existingIndex >= 0) entries.splice(existingIndex, 1)
  entries.unshift(entry)
  localStorage.setItem(historyStorageKey, JSON.stringify(entries.slice(0, 12)))
}

function historyMaterialSummary(design) {
  const counts = (Array.isArray(design?.beads) ? design.beads : [])
    .filter((value) => value && !String(value).startsWith(accessoryTokenPrefix))
    .reduce((result, id) => { result[id] = (result[id] || 0) + 1; return result }, {})
  const summary = Object.entries(counts).slice(0, 3).map(([id, count]) => {
    const material = materials.find((item) => item.id === id)
    return `${material?.name || '已下架珠材'}×${count}`
  })
  return summary.join('、') || '暂无主珠'
}

function createHistoryThumbnail(design) {
  const thumbnail = document.createElement('div')
  thumbnail.className = 'history-thumb'
  thumbnail.setAttribute('aria-hidden', 'true')

  const cord = document.createElement('span')
  cord.className = 'history-thumb-cord'
  cord.style.setProperty('--cord-color', cords[design?.cord]?.color || '#d9d9d4')
  thumbnail.appendChild(cord)

  const beads = Array.isArray(design?.beads) ? design.beads : []
  const estimatedTotal = Math.max(1, Math.round(((Number(design?.wrist) || 16) * 10) / (Number(design?.beadSize) || 8)))
  const slotCount = Math.max(1, beads.length, estimatedTotal)
  const radius = 34
  const beadSize = Math.max(8, Math.min(15, 68 * Math.sin(Math.PI / slotCount) * 1.08))
  thumbnail.style.setProperty('--history-thumb-bead-size', `${beadSize.toFixed(1)}px`)

  beads.forEach((value, index) => {
    if (!value) return
    const angle = -Math.PI / 2 + (index / slotCount) * Math.PI * 2
    const bead = document.createElement('span')
    bead.className = 'history-thumb-bead'
    bead.style.left = `${50 + Math.cos(angle) * radius}%`
    bead.style.top = `${50 + Math.sin(angle) * radius}%`

    const accessory = accessoryById(accessoryIdFromToken(value))
    const material = materials.find((item) => item.id === value)
    if (accessory) {
      const photo = accessoryPhoto(accessory, index)
      bead.classList.add('history-thumb-accessory')
      if (photo) {
        bead.classList.add('has-photo')
        bead.style.setProperty('--photo', `url("${photo}")`)
      } else {
        bead.classList.add(accessory.id === 'gold' ? 'history-thumb-gold' : 'history-thumb-silver')
        bead.textContent = accessory.id === 'gold' ? '✧' : '✦'
      }
    } else if (material) {
      styleMaterial(bead, material, index)
    } else {
      bead.classList.add('history-thumb-missing')
    }
    thumbnail.appendChild(bead)
  })

  return thumbnail
}

function renderHistoryList() {
  const list = byId('historyList')
  list.innerHTML = ''
  const entries = loadHistory()
  if (!entries.length) {
    const empty = document.createElement('div')
    empty.className = 'history-empty'
    empty.textContent = '还没有历史搭配'
    list.appendChild(empty)
    return
  }
  entries.forEach((entry) => {
    const row = document.createElement('div')
    row.className = 'history-item'
    const thumbnail = createHistoryThumbnail(entry.design)
    const copy = document.createElement('div')
    copy.className = 'history-item-copy'
    const title = document.createElement('strong')
    title.textContent = entry.code || historyMaterialSummary(entry.design)
    const meta = document.createElement('span')
    const updatedAt = new Date(entry.updatedAt)
    const beadCount = (entry.design.beads || []).filter(Boolean).length
    meta.textContent = `${Number(entry.design.wrist || 16).toFixed(1)} cm · ${entry.design.beadSize || 8} mm · ${beadCount} 颗 · ${Number.isNaN(updatedAt.getTime()) ? '' : updatedAt.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
    const detail = document.createElement('span')
    detail.textContent = historyMaterialSummary(entry.design)
    copy.append(title, meta, detail)
    const restoreButton = document.createElement('button')
    restoreButton.type = 'button'
    restoreButton.className = 'quiet-button'
    restoreButton.textContent = '重新搭配'
    restoreButton.addEventListener('click', () => {
      state = { ...defaultState, ...entry.design, historyId: createHistoryId(), beads: [...(entry.design.beads || [])] }
      referenceImageSource = /^\/uploads\/[a-f0-9-]+\.(?:png|jpg|webp)$/i.test(String(state.referenceImage || '')) ? state.referenceImage : ''
      restoredHistoryBaseline = { sourceId: entry.id, signature: historyDesignSignature(entry.design) }
      state.historyBaseline = restoredHistoryBaseline
      editingBead = false
      pendingDragAddition = null
      clearUndo()
      byId('historyDialog').close()
      renderAll()
      showStep('materials')
      showToast('已打开历史搭配，修改后才会另存')
    })
    const deleteButton = document.createElement('button')
    deleteButton.type = 'button'
    deleteButton.className = 'quiet-button history-delete-button'
    deleteButton.textContent = '删除'
    deleteButton.setAttribute('aria-label', `删除历史搭配：${title.textContent}`)
    deleteButton.addEventListener('click', () => {
      const remaining = loadHistory().filter((item) => item.id !== entry.id)
      localStorage.setItem(historyStorageKey, JSON.stringify(remaining))
      renderHistoryList()
    })
    const actions = document.createElement('div')
    actions.className = 'history-item-actions'
    actions.append(restoreButton, deleteButton)
    row.append(thumbnail, copy, actions)
    list.appendChild(row)
  })
}

function saveState() {
  saveHistorySnapshot()
  localStorage.setItem('puguang-design', JSON.stringify(state))
  byId('saveStatus').textContent = '保存中'
  clearTimeout(saveState.timer)
  saveState.timer = setTimeout(() => { byId('saveStatus').textContent = '已自动保存' }, 260)
}

function calculateItemCost() {
  const beadAndAccessoryCost = state.beads.reduce((sum, id) => {
    if (!isPlacedItem(id)) return sum
    const accessory = accessoryById(accessoryIdFromToken(id))
    return sum + (accessory?.price ?? materialVariant(materialById(id)).price)
  }, 0)
  return beadAndAccessoryCost + Number(cords[state.cord]?.price || 0)
}
const productionEstimateNote = '珠位和价格为预估，实际松紧、配件宽度与最终颗数由商家确认。'
function craftPrice() { return Number(window.__CATALOG__?.settings?.craftPrices?.[state.beadSize] ?? (39 + (state.beadSize === 10 ? 28 : state.beadSize === 6 ? 0 : 12))) }
function calculatePrice() { return calculateItemCost() + craftPrice() }
function isCompleteDesign() { return placedBeadCount() === beadTotal() }
function quoteLabel() {
  if (!placedBeadCount()) return '基础手工费'
  return isCompleteDesign() ? '预计总价' : '当前用料小计'
}
function quoteValue() {
  if (!placedBeadCount()) return `¥ ${craftPrice()}`
  return isCompleteDesign() ? `¥ ${calculatePrice()}` : `¥ ${calculateItemCost()}`
}

function renderBracelet() {
  normalizeBeads()
  const root = byId('bracelet')
  root.innerHTML = ''
  const cordRing = document.createElement('span')
  cordRing.className = 'cord-ring'
  cordRing.style.setProperty('--cord-color', cords[state.cord]?.color || '#d9d9d4')
  root.appendChild(cordRing)
  const slotCount = Math.max(beadTotal(), state.beads.length)
  const mobile = window.innerWidth <= 560
  const radiusX = mobile ? 34.5 : 34
  const radiusY = radiusX
  const slotCenters = Array.from({ length: slotCount }, (_, index) => {
    const angle = -Math.PI / 2 + (index / slotCount) * Math.PI * 2
    return {
      x: root.clientWidth * (50 + Math.cos(angle) * radiusX) / 100,
      y: root.clientHeight * (50 + Math.sin(angle) * radiusY) / 100
    }
  })
  const minimumSpacing = slotCenters.reduce((smallest, center, index) => {
    const next = slotCenters[(index + 1) % slotCenters.length]
    return Math.min(smallest, Math.hypot(next.x - center.x, next.y - center.y))
  }, Infinity)
  // Match each bead to the actual neighboring slot distance so adjacent beads
  // visually meet instead of looking like separate floating points.
  const fittedBeadSize = Math.max(18, Math.min(mobile ? 44 : 60, minimumSpacing * 1.12))
  root.style.setProperty('--bead-size', `${fittedBeadSize.toFixed(1)}px`)

  function nearestSlotIndex(clientX, clientY) {
    const bounds = root.getBoundingClientRect()
    const pointX = clientX - bounds.left
    const pointY = clientY - bounds.top
    return slotCenters.reduce((nearest, center, candidateIndex) => {
      const distance = Math.hypot(pointX - center.x, pointY - center.y)
      return distance < nearest.distance ? { index: candidateIndex, distance } : nearest
    }, { index: 0, distance: Infinity }).index
  }

  function showDropTarget(targetIndex, sourceBead) {
    root.querySelectorAll('.bead').forEach((candidate) => {
      candidate.classList.toggle('drop-target', candidate !== sourceBead && Number(candidate.dataset.slotIndex) === targetIndex)
    })
    let marker = root.querySelector('.drop-slot-marker')
    if (targetIndex >= 0 && targetIndex < slotCount && targetIndex !== draggingBead?.sourceIndex) {
      if (!marker) { marker = document.createElement('span'); marker.className = 'drop-slot-marker'; root.appendChild(marker) }
      marker.style.left = `${50 + Math.cos(-Math.PI / 2 + (targetIndex / slotCount) * Math.PI * 2) * radiusX}%`
      marker.style.top = `${50 + Math.sin(-Math.PI / 2 + (targetIndex / slotCount) * Math.PI * 2) * radiusY}%`
      marker.hidden = isPlacedItem(state.beads[targetIndex])
    } else if (marker) marker.hidden = true
  }

  state.beads.forEach((itemId, index) => {
    if (!isPlacedItem(itemId)) return
    const angle = -Math.PI / 2 + (index / slotCount) * Math.PI * 2
    const bead = document.createElement('button')
    const accessoryId = accessoryIdFromToken(itemId)
    const accessory = accessoryById(accessoryId)
    const material = accessory ? null : materialById(itemId)
    bead.type = 'button'
    bead.dataset.slotIndex = String(index)
    bead.className = accessory
      ? `bead accessory-bead accessory-${accessory.id}${editingBead && index === state.selectedIndex ? ' selected' : ''}`
      : `bead material-${material.id}${editingBead && index === state.selectedIndex ? ' selected' : ''}`
    bead.style.left = `${50 + Math.cos(angle) * radiusX}%`
    bead.style.top = `${50 + Math.sin(angle) * radiusY}%`
    if (accessory) {
      const photo = accessoryPhoto(accessory, index)
      bead.textContent = photo ? '' : accessory.id === 'silver' ? '✦' : '✧'
      bead.classList.toggle('has-photo', Boolean(photo))
      bead.style.setProperty('--photo', photo ? `url("${photo}")` : 'none')
    } else {
      styleMaterial(bead, material, index)
    }
    bead.title = `${String(index + 1).padStart(2, '0')} · ${accessory?.name || material.name}`
    bead.setAttribute('aria-label', bead.title)
    let pointerStart = null
    let didDrag = false
    bead.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return
      pointerStart = { x: event.clientX, y: event.clientY }
      didDrag = false
      draggingBead = { bead, sourceIndex: index, pointerId: event.pointerId }
      bead.setPointerCapture?.(event.pointerId)
    })
    bead.addEventListener('pointermove', (event) => {
      if (!draggingBead || draggingBead.bead !== bead || !pointerStart) return
      const distance = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y)
      if (distance < 6) return
      didDrag = true
      bead.classList.add('dragging')
      const bounds = root.getBoundingClientRect()
      bead.style.left = `${((event.clientX - bounds.left) / bounds.width) * 100}%`
      bead.style.top = `${((event.clientY - bounds.top) / bounds.height) * 100}%`
      draggingBead.targetIndex = nearestSlotIndex(event.clientX, event.clientY)
      showDropTarget(draggingBead.targetIndex, bead)
    })
    bead.addEventListener('pointerup', (event) => {
      if (!draggingBead || draggingBead.bead !== bead) return
      if (didDrag) {
        const targetIndex = draggingBead.targetIndex ?? nearestSlotIndex(event.clientX, event.clientY)
        const moved = targetIndex !== index
        if (moved) {
          const previous = createUndoSnapshot()
          const targetItem = state.beads[targetIndex]
          state.beads[targetIndex] = state.beads[index]
          state.beads[index] = isPlacedItem(targetItem) ? targetItem : null
          undoSnapshot = previous
          state.selectedIndex = targetIndex
          selectItem(state.beads[targetIndex])
          pendingDragAddition = {
            anchorIndex: targetIndex
          }
        } else {
          state.selectedIndex = index
          selectItem(state.beads[index])
          pendingDragAddition = null
        }
        // Dragging chooses where the next item should be added; it does not enter replace mode.
        editingBead = false
        renderAll()
      }
      bead.classList.remove('dragging')
      showDropTarget(-1, bead)
      draggingBead = null
      pointerStart = null
    })
    bead.addEventListener('pointercancel', () => {
      showDropTarget(-1, bead)
      draggingBead = null
      pointerStart = null
      bead.classList.remove('dragging')
      renderAll()
    })
    bead.addEventListener('click', () => {
      if (didDrag) { didDrag = false; return }
      pendingDragAddition = null
      state.selectedIndex = index
      selectItem(state.beads[index])
      editingBead = true
      renderAll()
    })
    root.appendChild(bead)
  })

}

function renderMaterials() {
  const grid = byId('materialGrid')
  grid.innerHTML = ''
  renderMaterialFacetNavigation()
  const visibleMaterials = categoryMaterials()
  if (!visibleMaterials.length) grid.innerHTML = '<div class="empty-catalog">商家尚未上传珠材</div>'
  visibleMaterials.forEach((material) => {
    const wrapper = document.createElement('div')
    wrapper.className = 'material-card-wrap'
    const button = document.createElement('button')
    button.type = 'button'
    const used = itemUsage(material.id)
    const variant = materialVariant(material)
    const available = catalogStock(variant)
    const unavailableSize = variant.active === false
    const outOfStock = unavailableSize || used >= available
    button.className = `material-card${state.selectedMaterial === material.id ? ' active' : ''}${outOfStock ? ' out-of-stock' : ''}`
    button.disabled = outOfStock
    const orb = document.createElement('span')
    orb.className = `material-orb material-${material.id}`
    styleMaterial(orb, material)
    const copy = document.createElement('span')
    copy.innerHTML = `<strong>${material.name}</strong><small class="material-price">${unavailableSize ? '该珠径暂不出售' : `¥${variant.price} / 颗`}</small><small>${unavailableSize ? `${state.beadSize} mm 不可选` : outOfStock ? '库存已用完' : `可用 ${available - used} 颗 · ${state.beadSize} mm`}</small>`
    button.append(orb, copy)
    button.addEventListener('click', () => {
      if (!hasItemStock(material.id)) { showToast('这款珠子的库存已用完'); return }
      const previous = createUndoSnapshot()
      state.selectedMaterial = material.id
      const placement = placeItemForCurrentContext(material.id)
      if (placement.changed) undoSnapshot = previous
      state.selectedIndex = placement.slotIndex
      editingBead = false
      state.beadCountOverride = placedBeadCount()
      renderAll()
      if (placement.full) showToast('珠位已满，请先删除一颗珠子')
    })
    const detailButton = document.createElement('button')
    detailButton.type = 'button'
    detailButton.className = 'material-detail-button'
    detailButton.textContent = 'i'
    detailButton.title = '查看' + material.name + '图片与规格'
    detailButton.setAttribute('aria-label', '查看' + material.name + '图片与规格')
    detailButton.addEventListener('click', () => openMaterialDetail(material))
    wrapper.append(button, detailButton)
    grid.appendChild(wrapper)
  })

  const counts = state.beads.filter(isMaterialId).reduce((result, id) => {
    result[id] = (result[id] || 0) + 1
    return result
  }, {})
  const rows = Object.entries(counts)
  byId('inventoryCount').textContent = `${rows.length} 种材料`
  byId('materialList').innerHTML = rows.map(([id, count]) => {
    const material = materialById(id)
    const thumbnail = materialPhotos(material)[0]
    return `<div class="material-row"><span class="tiny-orb material-${material.id}${thumbnail ? ' has-photo' : ''}" style="--bead:${material.bead};--texture:${material.texture};--photo:${thumbnail ? `url(&quot;${thumbnail}&quot;)` : 'none'}"></span><strong>${material.name}</strong><span>${count} 颗</span><strong class="material-total">¥${materialVariant(material).price * count}</strong></div>`
  }).join('')
}

function renderControls() {
  const plannedBeadCount = beadTotal()
  byId('wristSize').value = state.wrist
  byId('wristOutput').textContent = `${Number(state.wrist).toFixed(1)} cm`
  byId('previewWrist').textContent = `${Number(state.wrist).toFixed(1)} cm`
  const usedCount = placedBeadCount()
  byId('centerStyle').textContent = usedCount ? '当前搭配' : '点击主珠开始搭配'
  byId('centerSize').textContent = usedCount ? `${Number(state.wrist).toFixed(1)} cm` : '也可先新增一颗珠子'
  byId('selectedPosition').textContent = editingBead && isPlacedItem(state.beads[state.selectedIndex]) ? `${String(state.selectedIndex + 1).padStart(2, '0')} / ${plannedBeadCount}` : `— / ${plannedBeadCount}`
  byId('noteInput').value = state.note
  byId('noteCount').textContent = state.note.length
  renderReferenceImage()
  const hasSelection = editingBead && isPlacedItem(state.beads[state.selectedIndex])
  byId('selectedBeadTools').hidden = !hasSelection
  const selectedItem = hasSelection ? state.beads[state.selectedIndex] : null
  byId('duplicateBeadButton').disabled = !hasSelection || usedCount >= plannedBeadCount || !hasItemStock(selectedItem)
  byId('deleteBeadButton').disabled = !hasSelection
  byId('undoButton').disabled = !undoSnapshot
  const beadEditHint = byId('beadEditHint')
  beadEditHint.classList.toggle('active', hasSelection)
  beadEditHint.textContent = !usedCount
    ? '添加珠子后，可点击手串上的任意珠子进行调整'
    : hasSelection
      ? `已选中第 ${state.selectedIndex + 1} 位，可用右上角 + / − 增加或删除`
      : '点击手串上的任意珠子，可增加或删除；拖动可调整位置'

  document.querySelectorAll('#beadSizeOptions button').forEach((button) => button.classList.toggle('active', Number(button.dataset.value) === state.beadSize))
  byId('applyAllButton').disabled = !isMaterialId(state.selectedMaterial)
  const accessoryCounts = state.beads.reduce((result, value) => {
    const id = accessoryIdFromToken(value)
    if (id) result[id] = (result[id] || 0) + 1
    return result
  }, {})
  document.querySelectorAll('#accessoryOptions button').forEach((button) => {
    const count = accessoryCounts[button.dataset.value] || 0
    const item = accessoryById(button.dataset.value)
    const outOfStock = button.dataset.value !== 'none' && count >= catalogStock(item)
    button.classList.toggle('active', button.dataset.value === 'none' ? !Object.keys(accessoryCounts).length : count > 0)
    button.classList.toggle('out-of-stock', outOfStock)
    button.disabled = outOfStock
    button.dataset.count = count ? String(count) : ''
  })
  const accessoryHint = byId('accessoryHint')
  if (accessoryHint) {
    const count = Object.values(accessoryCounts).reduce((sum, value) => sum + value, 0)
    accessoryHint.textContent = count ? `已添加 ${count} 个，可继续添加或点手串删除` : '点击可连续添加并占用珠位'
  }
  document.querySelectorAll('#cordOptions button').forEach((button) => {
    const item = cords[button.dataset.value]
    const outOfStock = catalogStock(item) < 1
    button.classList.toggle('active', button.dataset.value === state.cord)
    button.classList.toggle('out-of-stock', outOfStock)
    button.disabled = outOfStock
  })
  const materialHint = byId('materialHint')
  if (materialHint) {
    const anchorIndex = pendingDragAddition?.anchorIndex ?? state.selectedIndex
    materialHint.textContent = usedCount
      ? `下一颗优先放在第 ${anchorIndex + 1} 颗的顺时针旁边`
      : '点击任意珠材开始搭配'
  }

  const overCapacity = usedCount > plannedBeadCount
  const unavailableMaterials = unavailableMaterialsInDesign()
  const unavailableNames = unavailableMaterials.map((item) => item.name)
  const stockIssue = stockIssueInDesign()
  ;['generateButton', 'mobileGenerateButton'].forEach((id) => {
    const button = byId(id)
    button.disabled = overCapacity
    button.classList.toggle('catalog-blocked', !overCapacity && (unavailableNames.length > 0 || Boolean(stockIssue)))
    button.setAttribute('aria-disabled', String(overCapacity || unavailableNames.length > 0 || Boolean(stockIssue)))
    button.title = overCapacity
      ? `已超出 ${usedCount - plannedBeadCount} 个珠位，请先删除`
      : unavailableNames.length
        ? `${unavailableNames.join('、')}已下架，请更换后再生成`
        : stockIssue
  })
}

function renderPrice() {
  const capacity = beadTotal()
  const beadCount = byId('beadCount')
  const usedCount = placedBeadCount()
  beadCount.textContent = usedCount > capacity
    ? `${usedCount} / ${capacity} 位（超出 ${usedCount - capacity}）`
    : `${usedCount} / ${capacity} 位`
  beadCount.classList.toggle('over', usedCount > capacity)
  const complete = isCompleteDesign()
  const displayValue = !usedCount ? craftPrice() : complete ? calculatePrice() : calculateItemCost()
  const noteText = usedCount && !complete ? `另计基础手工费 ¥${craftPrice()}` : ''
  ;['totalPrice', 'footerPrice', 'mobileFooterPrice'].forEach((id) => {
    const label = byId(id)?.previousElementSibling
    if (label) label.textContent = quoteLabel()
    byId(id).textContent = `¥ ${displayValue}`
    const note = byId(`${id}Note`)
    note.hidden = !noteText
    note.textContent = noteText
  })
}

function renderAll() {
  renderBracelet()
  renderMaterials()
  renderControls()
  renderPrice()
  saveState()
}

window.loadSavedDesign = function (saved) {
  const savedBeads = Array.isArray(saved?.beads) ? saved.beads : []
  const beadIds = savedBeads.filter((id) => isMaterialId(id) || isAccessoryToken(id))
  const accessory = String(saved?.accessory || 'none')
  const accessoryItem = window.__CATALOG__?.accessories?.find((item) => item.id === accessory)
  if (accessory !== 'none' && accessoryItem && !beadIds.includes(accessoryToken(accessory))) {
    if (beadIds.length >= Math.max(1, Math.round(((Number(saved?.wrist) || defaultState.wrist) * 10) / (Number(saved?.beadSize) || defaultState.beadSize)))) beadIds.pop()
    beadIds.push(accessoryToken(accessory))
  }
  const firstMaterial = beadIds.find(isMaterialId)
  const savedCapacity = Math.max(1, Math.round(((Number(saved?.wrist) || defaultState.wrist) * 10) / (Number(saved?.beadSize) || defaultState.beadSize)))
  state = { ...defaultState, historyId: createHistoryId(), wrist: Number(saved?.wrist) || defaultState.wrist, beadSize: Number(saved?.beadSize) || defaultState.beadSize, beads: Array.isArray(saved?.beads) ? [...saved.beads] : Array(savedCapacity).fill(null), accessory: 'none', accessoryPrice: 0, cord: String(saved?.cord || defaultState.cord), note: typeof saved?.note === 'string' ? saved.note : '', referenceImage: typeof saved?.referenceImage === 'string' ? saved.referenceImage : '', selectedIndex: 0, selectedMaterial: firstMaterial || defaultState.selectedMaterial, beadCountOverride: beadIds.length || null }
  referenceImageSource = /^\/uploads\/[a-f0-9-]+\.(?:png|jpg|webp)$/i.test(state.referenceImage) ? state.referenceImage : ''
  restoredHistoryBaseline = null
  delete state.historyBaseline
  editingBead = false
  clearUndo()
  renderAll()
  showStep('materials')
  showToast('已打开分享方案，可继续修改')
}

function showStep(step) {
  document.querySelectorAll('.step-tab').forEach((tab) => {
    const active = tab.dataset.step === step
    tab.classList.toggle('active', active)
    tab.setAttribute('aria-selected', String(active))
  })
  document.querySelectorAll('.step-panel').forEach((panel) => {
    const active = panel.dataset.panel === step
    panel.classList.toggle('active', active)
    panel.setAttribute('aria-hidden', String(!active))
  })
  const labels = { materials: '主珠', accessories: '配件', cord: '绳子', note: '备注' }
  byId('drawerSectionName').textContent = labels[step] || '选材'
  byId('drawerSectionEyebrow').textContent = '自由搭配'
}

function showToast(message) {
  const toast = byId('toast')
  toast.textContent = message
  toast.classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1800)
}

function openMaterialDetail(material) {
  const dialog = byId('materialDetailDialog')
  byId('materialDetailName').textContent = material.name
  byId('materialDetailDescription').textContent = material.description || '商家暂未填写这款珠材的说明。'
  const tags = byId('materialDetailTags')
  tags.innerHTML = ''
  ;[energyNames[material.energyKey], elementNames[material.elementKey], colorNames[material.colorKey]].filter(Boolean).forEach((label) => {
    const tag = document.createElement('span')
    tag.textContent = label
    tags.appendChild(tag)
  })
  byId('materialDetailSuggestion').textContent = material.description
    ? '可与相近色或对比色珠材组合，具体以商家实物与搭配建议为准。'
    : '可作为整串基础色，也可以用一两颗作视觉重点。'
  const gallery = byId('materialDetailGallery')
  gallery.innerHTML = ''
  const photos = materialPhotos(material).slice(0, 8)
  if (!photos.length) {
    const empty = document.createElement('div')
    empty.className = 'material-detail-empty'
    empty.textContent = '商家暂未上传实物图片'
    gallery.appendChild(empty)
  } else {
    photos.forEach((photo, index) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.title = '查看第 ' + (index + 1) + ' 张图片'
      const image = document.createElement('img')
      image.src = photo
      image.alt = material.name + '第 ' + (index + 1) + ' 张实物图'
      button.appendChild(image)
      button.addEventListener('click', () => {
        const firstImage = gallery.querySelector('img')
        if (!firstImage || firstImage === image) return
        const source = firstImage.src
        const alt = firstImage.alt
        firstImage.src = image.src
        firstImage.alt = image.alt
        image.src = source
        image.alt = alt
      })
      gallery.appendChild(button)
    })
  }
  const variants = byId('materialDetailVariants')
  variants.innerHTML = ''
  ;[6, 8, 10].forEach((size) => {
    const variant = materialVariant(material, size)
    const available = isCatalogSelectable(material) && variant.active !== false
    const row = document.createElement('div')
    row.className = 'material-detail-variant' + (available ? '' : ' unavailable')
    const title = document.createElement('strong')
    title.textContent = size + ' mm'
    const detail = document.createElement('span')
    detail.textContent = available ? '¥' + variant.price + ' / 颗 · 库存 ' + catalogStock(variant) : '暂不出售'
    row.append(title, detail)
    variants.appendChild(row)
  })
  dialog.showModal()
}

function clearUndo() {
  undoSnapshot = null
}

function createUndoSnapshot() {
  return {
    beads: [...state.beads],
    beadSize: state.beadSize,
    cord: state.cord,
    selectedIndex: state.selectedIndex,
    selectedMaterial: state.selectedMaterial,
    selectedAccessory: state.selectedAccessory,
    beadCountOverride: state.beadCountOverride,
    editingBead
  }
}

function removeBeadAt(index) {
  if (index < 0 || index >= state.beads.length) return
  undoSnapshot = createUndoSnapshot()
  state.beads[index] = null
  state.beadCountOverride = placedBeadCount()
  const hasNextBead = placedBeadCount() > 0
  state.selectedIndex = hasNextBead ? nextOccupiedSlot(index) : 0
  selectItem(hasNextBead ? state.beads[state.selectedIndex] : state.selectedMaterial)
  editingBead = hasNextBead
  renderAll()
}

function makeCode() {
  const now = new Date()
  const date = String(now.getFullYear()).slice(-2) + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0')
  const seed = state.beads.join('').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) + Math.round(state.wrist * 10) + state.note.length
  return `PG-${date}-${String(seed % 10000).padStart(4, '0')}`
}

function drawExportCanvas() {
  const canvas = byId('exportCanvas')
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#f3f5f2'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#ffffff'
  ctx.beginPath(); ctx.arc(360, 330, 255, 0, Math.PI * 2); ctx.fill()

  const radius = 205
  const slotCount = Math.max(1, beadTotal())
  const beadRadius = Math.max(18, Math.min(42, radius * Math.sin(Math.PI / slotCount) * 1.04))
  ctx.strokeStyle = cords[state.cord]?.color || '#d9d9d4'
  ctx.lineWidth = 8
  ctx.beginPath(); ctx.arc(360, 330, radius, 0, Math.PI * 2); ctx.stroke()
  state.beads.forEach((id, index) => {
    if (!isPlacedItem(id)) return
    const angle = -Math.PI / 2 + (index / slotCount) * Math.PI * 2
    const x = 360 + Math.cos(angle) * radius
    const y = 330 + Math.sin(angle) * radius
    const accessory = accessoryById(accessoryIdFromToken(id))
    if (accessory) {
      const photo = accessoryPhoto(accessory, index)
      const image = photo ? photoCache.get(photo) : null
      if (image?.complete && image.naturalWidth) {
        ctx.save()
        ctx.shadowColor = 'rgba(25,32,28,.24)'; ctx.shadowBlur = 7; ctx.shadowOffsetY = 3
        ctx.beginPath(); ctx.arc(x, y, beadRadius, 0, Math.PI * 2); ctx.clip()
        ctx.drawImage(image, x - beadRadius, y - beadRadius, beadRadius * 2, beadRadius * 2)
        ctx.restore()
        return
      }
      ctx.save()
      ctx.shadowColor = 'rgba(25,32,28,.28)'; ctx.shadowBlur = 7; ctx.shadowOffsetY = 3
      ctx.fillStyle = accessory.id === 'gold' ? '#d3ae64' : '#dfe4e2'
      ctx.beginPath(); ctx.arc(x, y, beadRadius, 0, Math.PI * 2); ctx.fill()
      ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke()
      ctx.fillStyle = accessory.id === 'gold' ? '#fff' : '#555f5a'
      ctx.font = `${Math.round(beadRadius)}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(accessory.id === 'gold' ? '✧' : '✦', x, y + 1)
      ctx.restore()
      return
    }
    const material = materialById(id)
    const photo = materialPhoto(material, index)
    const image = photo ? photoCache.get(photo) : null
    if (image?.complete && image.naturalWidth) {
      ctx.save()
      ctx.shadowColor = 'rgba(25,32,28,.24)'; ctx.shadowBlur = 7; ctx.shadowOffsetY = 3
      ctx.beginPath(); ctx.arc(x, y, beadRadius, 0, Math.PI * 2); ctx.clip()
      ctx.drawImage(image, x - beadRadius, y - beadRadius, beadRadius * 2, beadRadius * 2)
      ctx.restore()
      return
    }
    const gradient = ctx.createRadialGradient(x - beadRadius * .35, y - beadRadius * .35, 2, x, y, beadRadius)
    gradient.addColorStop(0, '#ffffff')
    gradient.addColorStop(.25, material.colors[0])
    gradient.addColorStop(1, material.colors[1])
    ctx.fillStyle = gradient
    ctx.shadowColor = 'rgba(25,32,28,.24)'; ctx.shadowBlur = 7; ctx.shadowOffsetY = 3
    ctx.beginPath(); ctx.arc(x, y, beadRadius, 0, Math.PI * 2); ctx.fill()
  })
  ctx.shadowColor = 'transparent'
  ctx.fillStyle = '#57605b'; ctx.font = '22px Microsoft YaHei'; ctx.textAlign = 'center'; ctx.fillText('当前搭配', 360, 318)
  ctx.fillStyle = '#202522'; ctx.font = '600 31px Microsoft YaHei'; ctx.fillText(`${state.wrist.toFixed(1)} cm`, 360, 360)
  ctx.fillStyle = '#236b55'; ctx.font = '600 18px Microsoft YaHei'; ctx.fillText(byId('designCode').textContent, 360, 635)
  const brandName = window.__CATALOG__?.settings?.brandName || '手链定制'
  ctx.fillStyle = '#7b837e'; ctx.font = '16px Microsoft YaHei'; ctx.fillText(isCompleteDesign() ? `${brandName} · 预计 ¥${calculatePrice()}` : `${brandName} · 灵感方案，价格需确认`, 360, 668)
}

function configurationText(code = byId('designCode').textContent) {
  const materialSummary = Object.entries(state.beads.filter(isMaterialId).reduce((result, id) => { result[id] = (result[id] || 0) + 1; return result }, {}))
    .map(([id, count]) => `${materialById(id).name}×${count}`).join('、')
  const accessoryName = Object.entries(state.beads.reduce((result, value) => {
    const id = accessoryIdFromToken(value)
    if (id) result[id] = (result[id] || 0) + 1
    return result
  }, {})).map(([id, count]) => `${accessoryById(id)?.name || id}×${count}`).join('、') || '无'
  const cordName = cords[state.cord]?.name || '未配置'
  const brandName = window.__CATALOG__?.settings?.brandName || '手链定制'
  return `${brandName}定制方案\n编号：${code}\n类型：${isCompleteDesign() ? '完整方案' : '灵感方案（未填满，价格需商家确认）'}\n手围：${state.wrist.toFixed(1)} cm\n珠径：${state.beadSize} mm\n用料：${materialSummary || '无'}\n配件：${accessoryName}\n绳线：72号玉线 0.8 mm · ${cordName}\n${isCompleteDesign() ? `预计价格：¥${calculatePrice()}` : `当前用料小计：¥${calculateItemCost()}\n基础手工费：¥${craftPrice()}（完整后计入预计总价）`}\n制作确认：${productionEstimateNote}\n备注：${state.note || '无'}\n参考图片：${referenceImageSource ? '已附' : '无'}`
}

function openResult() {
  const code = makeCode()
  saveHistorySnapshot(code)
  byId('designCode').textContent = code
  const accessoryName = Object.entries(state.beads.reduce((result, value) => {
    const id = accessoryIdFromToken(value)
    if (id) result[id] = (result[id] || 0) + 1
    return result
  }, {})).map(([id, count]) => `${accessoryById(id)?.name || id} × ${count}`).join('、') || '不添加'
  const cordName = cords[state.cord]?.name || '未配置'
  byId('resultType').textContent = isCompleteDesign() ? '完整搭配 · 可提交给商家' : '灵感方案 · 尚未填满'
  const quoteRows = isCompleteDesign()
    ? `<dt>预计总价</dt><dd id="resultPriceValue">¥ ${calculatePrice()}</dd>`
    : `<dt>当前用料小计</dt><dd id="resultPriceValue">¥ ${calculateItemCost()}</dd><dt>基础手工费</dt><dd id="resultCraftPriceValue">¥ ${craftPrice()}</dd>`
  byId('resultSummary').innerHTML = `<dt>手围 / 珠径</dt><dd>${state.wrist.toFixed(1)} cm / ${state.beadSize} mm</dd><dt>金属配件</dt><dd>${accessoryName}</dd><dt>绳线</dt><dd>72号玉线 · ${cordName}</dd><dt>参考图片</dt><dd>${referenceImageSource ? '已附' : '未添加'}</dd>${quoteRows}`
  drawExportCanvas()
  localStorage.setItem(`puguang-order-${code}`, configurationText(code))
  byId('resultDialog').showModal()
}

function requestResult() {
  if (!placedBeadCount()) {
    showToast('请先添加至少一颗珠子')
    return
  }
  const unavailableMaterials = unavailableMaterialsInDesign()
  if (unavailableMaterials.length) {
    showToast(`方案中的${unavailableMaterials.map((item) => item.name).join('、')}已下架，请更换后再生成`)
    return
  }
  const inventoryIssue = stockIssueInDesign()
  if (inventoryIssue) {
    showToast(inventoryIssue)
    return
  }
  const difference = placedBeadCount() - beadTotal()
  if (difference > 0) {
    showToast(`已超出 ${difference} 个珠位，请先删除`)
    return
  }
  if (difference < 0) {
    const missing = Math.abs(difference)
    byId('shortageMessage').textContent = `当前还缺少 ${missing} 颗珠子。可以保存为灵感方案继续分享，但不会显示确定价格；商家需要补齐后才能给出正式报价。`
    byId('shortageDialog').showModal()
    return
  }
  if (typeof window.persistDesign === 'function') window.persistDesign()
  else openResult()
}

document.querySelectorAll('.step-tab').forEach((tab) => tab.addEventListener('click', () => showStep(tab.dataset.step)))

byId('historyButton').addEventListener('click', () => {
  renderHistoryList()
  byId('historyDialog').showModal()
})
byId('closeMaterialDetailDialog').addEventListener('click', () => byId('materialDetailDialog').close())

const mobileSheetQuery = window.matchMedia('(max-width: 760px)')
const drawerContent = byId('drawerContent')
let drawerDragStart = null
let drawerDragged = false

function setMobileSheet(open, returnFocus = true) {
  const isMobile = mobileSheetQuery.matches
  if (isMobile) {
    document.body.classList.remove('drawer-open')
    byId('drawerToggleButton').setAttribute('aria-expanded', 'false')
    drawerContent.removeAttribute('inert')
    drawerContent.removeAttribute('aria-hidden')
    return
  }
  const shouldOpen = isMobile && open
  document.body.classList.toggle('drawer-open', shouldOpen)
  byId('drawerToggleButton').setAttribute('aria-expanded', String(shouldOpen))
  drawerContent.toggleAttribute('inert', isMobile && !shouldOpen)
  if (isMobile && !shouldOpen) drawerContent.setAttribute('aria-hidden', 'true')
  else drawerContent.removeAttribute('aria-hidden')
  if (shouldOpen) byId('drawerCloseButton').focus()
  else if (returnFocus && isMobile) byId('drawerToggleButton').focus()
}

byId('drawerToggleButton').addEventListener('click', () => {
  if (drawerDragged) { drawerDragged = false; return }
  setMobileSheet(!document.body.classList.contains('drawer-open'))
})
byId('drawerCloseButton').addEventListener('click', () => setMobileSheet(false))
byId('drawerBackdrop').addEventListener('click', () => setMobileSheet(false))
byId('mobileGenerateButton').addEventListener('click', () => {
  setMobileSheet(false, false)
  byId('generateButton').click()
})
byId('drawerToggleButton').addEventListener('pointerdown', (event) => {
  if (!mobileSheetQuery.matches || event.button !== 0) return
  drawerDragStart = event.clientY
  drawerDragged = false
  event.currentTarget.setPointerCapture(event.pointerId)
})
byId('drawerToggleButton').addEventListener('pointerup', (event) => {
  if (drawerDragStart === null) return
  const distance = event.clientY - drawerDragStart
  drawerDragStart = null
  if (Math.abs(distance) < 32) return
  drawerDragged = true
  setMobileSheet(distance < 0)
})
byId('drawerToggleButton').addEventListener('pointercancel', () => { drawerDragStart = null })
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && document.body.classList.contains('drawer-open')) setMobileSheet(false)
})
mobileSheetQuery.addEventListener('change', () => setMobileSheet(false, false))
setMobileSheet(false, false)

byId('wristSize').addEventListener('input', (event) => {
  clearUndo()
  pendingDragAddition = null
  editingBead = false
  state.wrist = Number(event.target.value)
  renderAll()
})
byId('noteInput').addEventListener('input', (event) => { state.note = event.target.value; byId('noteCount').textContent = state.note.length; saveState() })
byId('referenceImageButton').addEventListener('click', () => {
  byId('referenceImageInput').value = ''
  byId('referenceImageInput').click()
})
byId('referenceImageInput').addEventListener('change', (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    showToast('仅支持 JPG、PNG 或 WebP 图片')
    event.target.value = ''
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('参考图片不能超过 5 MB')
    event.target.value = ''
    return
  }
  const reader = new FileReader()
  reader.addEventListener('load', () => {
    referenceImageSource = String(reader.result || '')
    renderReferenceImage()
  })
  reader.addEventListener('error', () => showToast('图片读取失败，请重新选择'))
  reader.readAsDataURL(file)
})
byId('removeReferenceImageButton').addEventListener('click', () => {
  referenceImageSource = ''
  state.referenceImage = ''
  byId('referenceImageInput').value = ''
  renderReferenceImage()
  saveState()
})

document.querySelectorAll('#beadSizeOptions button').forEach((button) => button.addEventListener('click', () => {
  clearUndo()
  pendingDragAddition = null
  editingBead = false
  state.beadSize = Number(button.dataset.value)
  renderAll()
}))
function renderAccessoryCategories() {
  const categoryOptions = byId('accessoryCategoryOptions')
  const categories = accessoryCategoryItems()
  if (!categories.some((item) => item.id === state.accessoryCategory)) state.accessoryCategory = categories[0]?.id || 'accessories'
  categoryOptions.innerHTML = ''
  categories.forEach((category) => {
    const count = selectableAccessoryItems().filter((item) => (item.categoryId || 'accessories') === category.id).length
    const button = document.createElement('button')
    button.type = 'button'
    button.dataset.accessoryCategory = category.id
    button.classList.toggle('active', state.accessoryCategory === category.id)
    button.hidden = !count
    button.textContent = category.name
    button.addEventListener('click', () => {
      state.accessoryCategory = category.id
      renderAccessoryCategories()
      renderAccessoryOptions()
      renderControls()
    })
    categoryOptions.appendChild(button)
  })
}

function renderAccessoryOptions() {
  const accessoryOptions = byId('accessoryOptions')
  accessoryOptions.innerHTML = ''
  const noAccessory = { id: 'none', name: '不添加', price: 0, description: '清除手串上的全部配件' }
  const visible = selectableAccessoryItems().filter((item) => (item.categoryId || 'accessories') === state.accessoryCategory)
  ;[...(state.accessoryCategory === 'accessories' ? [noAccessory] : []), ...visible].forEach((item) => {
    const button = document.createElement('button')
    const isNone = item.id === 'none'
    const icon = document.createElement('span')
    icon.className = `accessory-icon ${isNone ? 'none' : item.id}`
    const photo = accessoryPhotos(item)[0]
    if (photo) {
      icon.classList.add('has-photo')
      icon.style.backgroundImage = `url("${photo}")`
    } else icon.textContent = isNone ? '—' : item.id === 'gold' ? '✧' : '✦'
    const copy = document.createElement('span')
    const name = document.createElement('strong')
    name.textContent = item.name
    const detail = document.createElement('small')
    detail.textContent = isNone
      ? item.description
      : `${item.price ? `+ ¥${item.price} · ` : ''}库存 ${catalogStock(item)} 个`
    copy.append(name, detail)
    button.type = 'button'
    button.dataset.value = item.id
    button.dataset.price = String(item.price || 0)
    button.append(icon, copy)
    accessoryOptions.appendChild(button)
  })
}

function buildCatalogOptionButtons() {
  renderAccessoryCategories()
  renderAccessoryOptions()
  const cordOptions = byId('cordOptions')
  cordOptions.innerHTML = ''
  Object.entries(cords).filter(([, item]) => isCatalogSelectable(item)).forEach(([id, item]) => {
    const button = document.createElement('button')
    const swatch = document.createElement('span')
    swatch.className = 'cord-swatch'
    swatch.style.setProperty('--cord', item.color)
    const photo = Array.isArray(item.photos) ? item.photos[0] : ''
    if (photo) {
      swatch.classList.add('has-photo')
      swatch.style.backgroundImage = `url("${photo}")`
    }
    const copy = document.createElement('span')
    copy.className = 'cord-copy'
    const name = document.createElement('strong')
    name.textContent = item.name
    const detail = document.createElement('small')
    detail.textContent = `${item.price ? `+ ¥${item.price} · ` : ''}${catalogStock(item) ? `库存 ${catalogStock(item)} 条` : '库存不足'}`
    copy.append(name, detail)
    button.type = 'button'
    button.dataset.value = id
    button.append(swatch, copy)
    cordOptions.appendChild(button)
  })
}

buildCatalogOptionButtons()
byId('accessoryOptions').addEventListener('click', (event) => {
  const button = event.target.closest('button')
  if (!button) return
  const id = button.dataset.value
  if (id === 'none') {
    const previous = createUndoSnapshot()
    const hadAccessories = state.beads.some(isAccessoryToken)
    editingBead = false
    state.beads = state.beads.map((value) => isAccessoryToken(value) ? null : value)
    if (hadAccessories) undoSnapshot = previous
    state.beadCountOverride = placedBeadCount()
    renderAll()
    return
  }
  if (!accessoryById(id)) return
  if (!hasItemStock(accessoryToken(id))) { showToast('这个配件的库存已用完'); return }
  const previous = createUndoSnapshot()
  const placement = placeItemForCurrentContext(accessoryToken(id))
  editingBead = false
  if (placement.changed) undoSnapshot = previous
  state.selectedIndex = placement.slotIndex
  state.selectedAccessory = id
  state.beadCountOverride = placedBeadCount()
  renderAll()
  if (placement.full) showToast('珠位已满，请先删除一颗珠子')
})
document.querySelectorAll('#cordOptions button').forEach((button) => button.addEventListener('click', () => {
  const cord = cords[button.dataset.value]
  if (!isCatalogSelectable(cord) || catalogStock(cord) < 1) { showToast('这款绳子的库存不足'); return }
  state.cord = button.dataset.value
  renderAll()
}))

byId('applyAllButton').addEventListener('click', () => {
  const material = materials.find((item) => item.id === state.selectedMaterial)
  if (!isCatalogSelectable(material) || catalogStock(material) < beadTotal()) {
    showToast(`这款珠子库存不足，整圈需要 ${beadTotal()} 颗`)
    return
  }
  const previous = createUndoSnapshot()
  pendingDragAddition = null
  editingBead = false
  state.beads = Array.from({ length: beadTotal() }, () => state.selectedMaterial)
  state.selectedIndex = state.beads.length - 1
  state.beadCountOverride = placedBeadCount()
  undoSnapshot = previous
  renderAll()
})
byId('duplicateBeadButton').addEventListener('click', () => {
  if (!editingBead || !isPlacedItem(state.beads[state.selectedIndex])) return
  if (!hasItemStock(state.beads[state.selectedIndex])) { showToast('所选商品的库存已用完'); return }
  const previous = createUndoSnapshot()
  const selectedItem = state.beads[state.selectedIndex]
  const placement = placeItemAroundAnchor(selectedItem, state.selectedIndex, { replaceWhenSurrounded: false })
  if (placement.changed) undoSnapshot = previous
  state.selectedIndex = placement.slotIndex
  state.beadCountOverride = placedBeadCount()
  selectItem(selectedItem)
  editingBead = true
  renderAll()
  if (placement.full) showToast('珠位已满，请先删除一颗珠子')
})
byId('deleteBeadButton').addEventListener('click', () => {
  if (!editingBead || !isPlacedItem(state.beads[state.selectedIndex])) return
  removeBeadAt(state.selectedIndex)
})
byId('undoButton').addEventListener('click', () => {
  if (!undoSnapshot) return
  state.beads = [...undoSnapshot.beads]
  state.beadSize = undoSnapshot.beadSize || state.beadSize
  state.cord = undoSnapshot.cord || state.cord
  state.selectedIndex = undoSnapshot.selectedIndex
  state.selectedMaterial = undoSnapshot.selectedMaterial
  state.selectedAccessory = undoSnapshot.selectedAccessory || state.selectedAccessory
  state.beadCountOverride = undoSnapshot.beadCountOverride
  editingBead = Boolean(undoSnapshot.editingBead)
  undoSnapshot = null
  pendingDragAddition = null
  renderAll()
  showToast('已撤销上一步操作')
})
byId('generateButton').addEventListener('click', requestResult)
byId('continueEditingButton').addEventListener('click', () => byId('shortageDialog').close())
byId('confirmIncompleteButton').addEventListener('click', () => {
  byId('shortageDialog').close()
  if (typeof window.persistDesign === 'function') window.persistDesign()
  else openResult()
})
byId('resetButton').addEventListener('click', () => { state = { ...defaultState, historyId: createHistoryId(), beads: [] }; referenceImageSource = ''; byId('referenceImageInput').value = ''; undoSnapshot = null; editingBead = false; pendingDragAddition = null; restoredHistoryBaseline = null; renderAll(); showStep('materials'); showToast('已恢复初始设计，原搭配可在历史中找回') })
byId('copyButton').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(configurationText()); showToast('方案已复制') }
  catch { showToast('复制失败，请保存方案图') }
})
byId('downloadButton').addEventListener('click', () => {
  const link = document.createElement('a')
  link.download = `${byId('designCode').textContent}-手链方案.png`
  link.href = byId('exportCanvas').toDataURL('image/png')
  link.click()
  showToast('方案图已保存')
})

window.addEventListener('resize', () => renderBracelet())
window.markCurrentHistorySaved = (code) => saveHistorySnapshot(code)
window.referenceImageForSubmission = () => referenceImageSource
window.markReferenceImageSaved = (path) => {
  referenceImageSource = String(path || '')
  state.referenceImage = referenceImageSource
  renderReferenceImage()
  saveState()
}
function applyPendingStarter() {
  const raw = localStorage.getItem('puguang-start-recipe')
  if (!raw) return ''
  localStorage.removeItem('puguang-start-recipe')
  try {
    const pending = JSON.parse(raw)
    if (pending?.type === 'material' && isMaterialId(pending.materialId)) {
      state.selectedMaterial = pending.materialId
      state.color = materialById(pending.materialId)?.colorKey || state.color
      state.materialFacet = 'color'
      state.materialFacetValue = state.color
      state.beads = [pending.materialId]
      state.selectedIndex = 0
      state.beadCountOverride = 1
      editingBead = true
      return '已把推荐珠材放到手串上，可以继续搭配'
    }
    if (pending?.type === 'recipe' && pending.recipe) {
      const recipe = pending.recipe
      const beadSize = [6, 8, 10].includes(Number(recipe.beadSize)) ? Number(recipe.beadSize) : state.beadSize
      state.beadSize = beadSize
      const capacity = beadTotal()
      const tokens = (Array.isArray(recipe.beads) ? recipe.beads : [])
        .filter((value) => isMaterialId(value) || isAccessoryToken(value))
        .slice(0, capacity)
      if (!tokens.length) return ''
      state.beads = [...tokens, ...Array(Math.max(0, capacity - tokens.length)).fill(null)]
      if (recipe.cordId && cords[recipe.cordId] && isCatalogSelectable(cords[recipe.cordId])) state.cord = recipe.cordId
      state.selectedIndex = tokens.length - 1
      state.selectedMaterial = tokens.find(isMaterialId) || state.selectedMaterial
      const selectedAccessory = tokens.map(accessoryIdFromToken).find(Boolean)
      if (selectedAccessory) state.selectedAccessory = selectedAccessory
      state.beadCountOverride = tokens.length
      editingBead = true
      return `已套用“${recipe.name || '灵感搭配'}”，可以继续修改`
    }
  } catch {
    return ''
  }
  return ''
}

const pendingStarterMessage = applyPendingStarter()
normalizeBeads()
showStep('materials')
renderAll()
if (pendingStarterMessage) showToast(pendingStarterMessage)
