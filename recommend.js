(function () {
  let catalog = null
  let mode = 'energy'
  let selection = ''

  const namesFor = (kind) => {
    const configured = kind === 'element' ? catalog?.settings?.elementOptions : catalog?.settings?.energyOptions
    return (Array.isArray(configured) ? configured : []).filter((item) => item.active !== false)
  }

  const selectable = (item) => item && item.active !== false && !item.deleted
  const starter = (payload) => {
    localStorage.setItem('puguang-start-recipe', JSON.stringify({ ...payload, createdAt: Date.now() }))
    location.href = './diy.html'
  }

  function renderOptions() {
    const options = namesFor(mode)
    if (!options.some((option) => option.key === selection)) selection = options[0]?.key || ''
    const prompt = document.getElementById('recommendPrompt')
    prompt.textContent = mode === 'element'
      ? (catalog.settings?.recommendationElementPrompt || '你想从哪个五行方向寻找搭配？')
      : (catalog.settings?.recommendationEnergyPrompt || '你此刻更想靠近哪种状态？')
    const root = document.getElementById('recommendOptions')
    root.innerHTML = ''
    options.forEach((option) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = option.name
      button.classList.toggle('active', selection === option.key)
      button.addEventListener('click', () => {
        selection = option.key
        renderOptions()
        renderResults(option.name)
      })
      root.appendChild(button)
    })
    const selected = options.find((option) => option.key === selection)
    if (selected) renderResults(selected.name)
    else document.getElementById('recommendResults').hidden = true
  }

  function recipeCard(recipe) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'recipe-card'
    const image = document.createElement('img')
    image.src = recipe.photos[0]
    image.alt = `${recipe.name}成品图`
    const copy = document.createElement('span')
    copy.className = 'recipe-card-copy'
    const name = document.createElement('strong')
    name.textContent = recipe.name
    const detail = document.createElement('small')
    detail.textContent = recipe.hint || '商家推荐搭配'
    const materials = document.createElement('span')
    materials.className = 'recipe-materials'
    materials.textContent = recipe.materialNote || '点击查看并套用这款搭配'
    const action = document.createElement('em')
    action.textContent = '用这款开始搭配 →'
    copy.append(name, detail, materials, action)
    button.append(image, copy)
    button.addEventListener('click', () => starter({ type: 'recipe', recipe }))
    return button
  }

  function renderResults() {
    const recipes = (catalog.inspirations || []).filter((item) => selectable(item)
      && item.displayArea === 'explore'
      && (mode === 'element' ? item.elementKey : item.energyKey) === selection
      && Array.isArray(item.photos) && item.photos[0])
    const results = document.getElementById('recommendResults')
    results.hidden = false
    const recipeRoot = document.getElementById('recipeResults')
    recipeRoot.innerHTML = ''
    if (!recipes.length) {
      const empty = document.createElement('div')
      empty.className = 'empty-state'
      empty.innerHTML = '<strong>暂时没有这一类成品</strong><span>商家可以在后台上传成品图并填写说明与用料。</span>'
      recipeRoot.appendChild(empty)
    } else recipes.forEach((item) => recipeRoot.appendChild(recipeCard(item)))
  }

  function initialize(nextCatalog) {
    if (catalog) return
    catalog = nextCatalog
    document.querySelectorAll('[data-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        mode = button.dataset.mode
        selection = ''
        document.querySelectorAll('[data-mode]').forEach((item) => {
          const active = item === button
          item.classList.toggle('active', active)
          item.setAttribute('aria-selected', String(active))
        })
        renderOptions()
      })
    })
    renderOptions()
  }

  document.addEventListener('portal-catalog-ready', (event) => initialize(event.detail), { once: true })
  if (window.__PORTAL_CATALOG__) initialize(window.__PORTAL_CATALOG__)
})()
