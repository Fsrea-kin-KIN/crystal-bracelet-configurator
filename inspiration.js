(function () {
  let catalog = null
  let selected = null

  const selectable = (item) => item && item.active !== false && !item.deleted
  const recipeTokens = (item) => Array.isArray(item.beads) ? item.beads.filter(Boolean) : []
  const startRecipe = (recipe) => {
    localStorage.setItem('puguang-start-recipe', JSON.stringify({ type: 'recipe', recipe, createdAt: Date.now() }))
    location.href = './diy.html'
  }

  function recipeIssue(recipe) {
    if (!recipeTokens(recipe).length) return '商家还没有为这款成品配置实际用料'
    return ''
  }

  function materialSummary(recipe) {
    if (recipe.materialNote) return recipe.materialNote
    const materialNames = new Map((catalog.materials || []).map((item) => [item.id, item.name]))
    const accessoryNames = new Map((catalog.accessories || []).map((item) => [`accessory:${item.id}`, item.name]))
    const counts = recipeTokens(recipe).reduce((result, token) => {
      result[token] = (result[token] || 0) + 1
      return result
    }, {})
    return Object.entries(counts).map(([token, count]) => `${materialNames.get(token) || accessoryNames.get(token) || token}×${count}`).join('、') || '未配置'
  }

  function openDetail(recipe) {
    selected = recipe
    document.getElementById('inspirationDetailPhoto').src = recipe.photos[0]
    document.getElementById('inspirationDetailPhoto').alt = `${recipe.name}成品图`
    document.getElementById('inspirationDetailName').textContent = recipe.name
    document.getElementById('inspirationDetailHint').textContent = recipe.hint || '商家提供的成品搭配'
    document.getElementById('inspirationDetailMaterials').textContent = materialSummary(recipe)
    const cord = (catalog.cords || []).find((item) => item.id === recipe.cordId)
    document.getElementById('inspirationDetailSpec').textContent = `${recipe.beadSize || 8} mm · ${recipeTokens(recipe).length || '未配置'} 位${cord ? ` · ${cord.name}` : ''}`
    const issue = recipeIssue(recipe)
    const useButton = document.getElementById('useInspiration')
    useButton.disabled = Boolean(issue)
    useButton.textContent = issue ? '暂时无法套用' : '用这款开始搭配'
    document.getElementById('inspirationWarning').textContent = issue
    document.getElementById('inspirationDialog').showModal()
  }

  function card(recipe) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'inspiration-card'
    const image = document.createElement('img')
    image.src = recipe.photos[0]
    image.alt = `${recipe.name}成品图`
    const copy = document.createElement('span')
    copy.className = 'inspiration-card-copy'
    const name = document.createElement('strong')
    name.textContent = recipe.name
    const detail = document.createElement('small')
    detail.textContent = recipe.hint || recipe.materialNote || '点击查看材料与搭配细节'
    const action = document.createElement('em')
    action.textContent = '查看这款 →'
    copy.append(name, detail, action)
    button.append(image, copy)
    button.addEventListener('click', () => openDetail(recipe))
    return button
  }

  function initialize(nextCatalog) {
    if (catalog) return
    catalog = nextCatalog
    const recipes = (catalog.inspirations || []).filter((item) => selectable(item)
      && item.displayArea === 'inspiration'
      && Array.isArray(item.photos) && item.photos[0])
    const gallery = document.getElementById('inspirationGallery')
    const empty = document.getElementById('inspirationEmpty')
    gallery.hidden = !recipes.length
    empty.hidden = Boolean(recipes.length)
    recipes.forEach((item) => gallery.appendChild(card(item)))
  }

  document.getElementById('closeInspiration').addEventListener('click', () => document.getElementById('inspirationDialog').close())
  document.getElementById('useInspiration').addEventListener('click', () => selected && startRecipe(selected))
  document.addEventListener('portal-catalog-ready', (event) => initialize(event.detail), { once: true })
  if (window.__PORTAL_CATALOG__) initialize(window.__PORTAL_CATALOG__)
})()
