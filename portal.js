(async function () {
  try {
    const response = await fetch('/api/catalog')
    if (!response.ok) return
    const catalog = await response.json()
    const brandName = catalog.settings?.brandName || '手链定制'
    document.querySelectorAll('[data-brand-name]').forEach((node) => { node.textContent = brandName })
    document.querySelectorAll('.portal-brand-mark').forEach((node) => { node.textContent = brandName.slice(0, 1) })
    document.title = document.title.replace('手链定制', `${brandName} · 手链定制`)
    window.__PORTAL_CATALOG__ = catalog
    document.dispatchEvent(new CustomEvent('portal-catalog-ready', { detail: catalog }))

    const choices = document.querySelectorAll('.entry-choice')
    if (!choices.length) return
    const photos = (catalog.materials || [])
      .filter((item) => item.active !== false && !item.deleted && Array.isArray(item.photos) && item.photos[0])
      .map((item) => ({ src: item.photos[0], name: item.name }))
    choices.forEach((choice, choiceIndex) => {
      const customImage = catalog.settings?.entryImages?.[choice.dataset.entryKey]
      if (!customImage && !photos.length) return
      const visual = document.createElement('span')
      visual.className = 'choice-visuals'
      visual.setAttribute('aria-hidden', 'true')
      if (customImage) {
        visual.classList.add('custom')
        const image = document.createElement('img')
        image.src = customImage
        image.alt = ''
        visual.appendChild(image)
      } else {
        for (let offset = 0; offset < Math.min(5, photos.length); offset += 1) {
          const photo = photos[(choiceIndex * 4 + offset) % photos.length]
          const image = document.createElement('img')
          image.src = photo.src
          image.alt = ''
          visual.appendChild(image)
        }
      }
      choice.prepend(visual)
    })
  } catch {
    // Pages remain usable with their empty states while the catalog is unavailable.
  }
})()
