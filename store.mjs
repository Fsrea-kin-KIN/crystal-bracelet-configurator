import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
import { catalogSeed } from './catalog.mjs'

const tables = { materials: 'materials', accessories: 'accessories', cords: 'cords', inspirations: 'inspirations' }
const allowedStatuses = new Set(['new', 'contacted', 'confirmed', 'completed', 'cancelled'])
const allowedSubmissionStates = new Set(['saved', 'submitted', 'legacy', 'archived'])
const allowedQuoteStatuses = new Set(['estimated', 'needs_confirmation'])
const materialSizes = [6, 8, 10]
const entryImageKeys = ['diy', 'recommend', 'inspiration']
const allowedColorKeys = new Set(['white', 'pink', 'purple', 'blue', 'gray', 'black', 'gold', 'red'])
const materialEnergyDefaults = { bodhi: 'calm', clear: 'focus', moonstone: 'calm', rose: 'balance', amethyst: 'focus', aquamarine: 'calm', lapis: 'focus', obsidian: 'calm', 'silver-obsidian': 'focus', 'gold-obsidian': 'confidence', tiger: 'confidence', cinnabar: 'vitality', citrine: 'confidence', rutilated: 'vitality', sandal: 'calm' }
const materialElementDefaults = { bodhi: 'wood', clear: 'metal', moonstone: 'water', rose: 'earth', amethyst: 'fire', aquamarine: 'water', lapis: 'water', obsidian: 'water', 'silver-obsidian': 'metal', 'gold-obsidian': 'metal', tiger: 'earth', cinnabar: 'fire', citrine: 'earth', rutilated: 'metal', sandal: 'wood' }
const materialTypeDefaults = { bodhi: 'wood', sandal: 'wood' }
const elementByColor = { white: 'metal', gray: 'metal', gold: 'earth', pink: 'earth', blue: 'water', black: 'water', purple: 'fire', red: 'fire' }

function parseJson(value, fallback) {
  try { return JSON.parse(value) } catch { return fallback }
}

function text(value, label, max = 40) {
  const result = String(value ?? '').trim()
  if (!result) throw new Error(`${label}不可为空`)
  if (result.length > max) throw new Error(`${label}不能超过 ${max} 个字`)
  return result
}

function money(value, label = '价格') {
  const result = Number(value)
  if (!Number.isInteger(result) || result < 0 || result > 100000) throw new Error(`${label}必须是 0 至 100000 的整数`)
  return result
}

function stock(value, label = '库存') {
  const result = Number(value)
  if (!Number.isInteger(result) || result < 0 || result > 1_000_000) throw new Error(`${label}必须是 0 至 1000000 的整数`)
  return result
}

function normalizeEntryImages(value, fallback = {}) {
  const source = value === undefined ? fallback : value
  if (!source || typeof source !== 'object' || Array.isArray(source)) throw new Error('首页入口图片设置不正确')
  return Object.fromEntries(entryImageKeys.map((key) => {
    const image = String(source[key] || '')
    if (image && (image.length > 500 || (!image.startsWith('/uploads/') && !image.startsWith('./assets/')))) throw new Error('首页入口图片路径不正确')
    return [key, image]
  }))
}

export function createStore(databasePath, options = {}) {
  const seedMode = options.seedMode || 'demo'
  mkdirSync(dirname(databasePath), { recursive: true })
  const db = new DatabaseSync(databasePath)
  const existingTables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((row) => row.name))
  const hadLegacyCatalog = existingTables.has('materials') && !existingTables.has('material_variants')
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value_json TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS admin_auth (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS admin_sessions (token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS materials (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, price INTEGER NOT NULL CHECK (price >= 0),
      photos_json TEXT NOT NULL DEFAULT '[]', color_key TEXT NOT NULL DEFAULT 'white',
      style_key TEXT NOT NULL DEFAULT 'clean', use_key TEXT NOT NULL DEFAULT 'daily',
      description TEXT NOT NULL DEFAULT '', facet_values_json TEXT NOT NULL DEFAULT '{}',
      stock INTEGER NOT NULL DEFAULT 999, active INTEGER NOT NULL DEFAULT 1,
      deleted INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS material_variants (
      material_id TEXT NOT NULL REFERENCES materials(id),
      bead_size INTEGER NOT NULL CHECK (bead_size IN (6, 8, 10)),
      price INTEGER NOT NULL CHECK (price >= 0),
      stock INTEGER NOT NULL DEFAULT 999 CHECK (stock >= 0),
      active INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (material_id, bead_size)
    );
    CREATE TABLE IF NOT EXISTS accessory_categories (
      id TEXT PRIMARY KEY, name TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS accessories (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
      price INTEGER NOT NULL CHECK (price >= 0), photos_json TEXT NOT NULL DEFAULT '[]',
      stock INTEGER NOT NULL DEFAULT 999, active INTEGER NOT NULL DEFAULT 1,
      deleted INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0,
      category_id TEXT NOT NULL DEFAULT 'accessories'
    );
    CREATE TABLE IF NOT EXISTS cords (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, color TEXT NOT NULL, price INTEGER NOT NULL DEFAULT 0,
      photos_json TEXT NOT NULL DEFAULT '[]', stock INTEGER NOT NULL DEFAULT 999,
      active INTEGER NOT NULL DEFAULT 1, deleted INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS inspirations (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, hint TEXT NOT NULL DEFAULT '', material_note TEXT NOT NULL DEFAULT '',
      display_area TEXT NOT NULL DEFAULT 'inspiration',
      style_key TEXT NOT NULL DEFAULT 'clean', use_key TEXT NOT NULL DEFAULT 'daily',
      beads_json TEXT NOT NULL DEFAULT '[]', bead_size INTEGER NOT NULL DEFAULT 8,
      cord_id TEXT NOT NULL DEFAULT '', photos_json TEXT NOT NULL DEFAULT '[]',
      active INTEGER NOT NULL DEFAULT 1, deleted INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS designs (
      id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL,
      wrist REAL NOT NULL, bead_size INTEGER NOT NULL, beads_json TEXT NOT NULL,
      accessory_id TEXT NOT NULL, cord_id TEXT NOT NULL, note TEXT NOT NULL DEFAULT '',
      reference_image TEXT NOT NULL DEFAULT '', total_price INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'new', submission_state TEXT NOT NULL DEFAULT 'saved',
      quote_status TEXT NOT NULL DEFAULT 'estimated', customer_name TEXT NOT NULL DEFAULT '',
      customer_contact TEXT NOT NULL DEFAULT '', quantity INTEGER NOT NULL DEFAULT 1,
      submitted_at TEXT NOT NULL DEFAULT '', internal_note TEXT NOT NULL DEFAULT ''
    );
  `)

  const materialColumns = new Set(db.prepare('PRAGMA table_info(materials)').all().map((column) => column.name))
  if (!materialColumns.has('color_key')) {
    db.exec("ALTER TABLE materials ADD COLUMN color_key TEXT NOT NULL DEFAULT 'white'")
    const updateColor = db.prepare('UPDATE materials SET color_key = ? WHERE id = ?')
    catalogSeed.materials.forEach((item) => updateColor.run(item.colorKey || 'white', item.id))
  }
  const accessoryColumns = new Set(db.prepare('PRAGMA table_info(accessories)').all().map((column) => column.name))
  if (!accessoryColumns.has('photos_json')) db.exec("ALTER TABLE accessories ADD COLUMN photos_json TEXT NOT NULL DEFAULT '[]'")
  if (!accessoryColumns.has('stock')) db.exec('ALTER TABLE accessories ADD COLUMN stock INTEGER NOT NULL DEFAULT 999')
  if (!accessoryColumns.has('deleted')) db.exec('ALTER TABLE accessories ADD COLUMN deleted INTEGER NOT NULL DEFAULT 0')
  if (!accessoryColumns.has('category_id')) db.exec("ALTER TABLE accessories ADD COLUMN category_id TEXT NOT NULL DEFAULT 'accessories'")
  const inspirationColumns = new Set(db.prepare('PRAGMA table_info(inspirations)').all().map((column) => column.name))
  if (!inspirationColumns.has('material_note')) db.exec("ALTER TABLE inspirations ADD COLUMN material_note TEXT NOT NULL DEFAULT ''")
  if (!inspirationColumns.has('display_area')) db.exec("ALTER TABLE inspirations ADD COLUMN display_area TEXT NOT NULL DEFAULT 'inspiration'")
  if (!inspirationColumns.has('bead_size')) db.exec('ALTER TABLE inspirations ADD COLUMN bead_size INTEGER NOT NULL DEFAULT 8')
  if (!inspirationColumns.has('cord_id')) db.exec("ALTER TABLE inspirations ADD COLUMN cord_id TEXT NOT NULL DEFAULT ''")
  const cordColumns = new Set(db.prepare('PRAGMA table_info(cords)').all().map((column) => column.name))
  if (!cordColumns.has('price')) db.exec('ALTER TABLE cords ADD COLUMN price INTEGER NOT NULL DEFAULT 0')
  if (!cordColumns.has('photos_json')) db.exec("ALTER TABLE cords ADD COLUMN photos_json TEXT NOT NULL DEFAULT '[]'")
  if (!cordColumns.has('stock')) db.exec('ALTER TABLE cords ADD COLUMN stock INTEGER NOT NULL DEFAULT 999')
  if (!cordColumns.has('deleted')) db.exec('ALTER TABLE cords ADD COLUMN deleted INTEGER NOT NULL DEFAULT 0')
  if (!materialColumns.has('stock')) db.exec('ALTER TABLE materials ADD COLUMN stock INTEGER NOT NULL DEFAULT 999')
  if (!materialColumns.has('deleted')) db.exec('ALTER TABLE materials ADD COLUMN deleted INTEGER NOT NULL DEFAULT 0')
  if (!materialColumns.has('description')) db.exec("ALTER TABLE materials ADD COLUMN description TEXT NOT NULL DEFAULT ''")
  if (!materialColumns.has('facet_values_json')) {
    db.exec("ALTER TABLE materials ADD COLUMN facet_values_json TEXT NOT NULL DEFAULT '{}'")
    const updateFacets = db.prepare('UPDATE materials SET facet_values_json = ? WHERE id = ?')
    db.prepare('SELECT id FROM materials').all().forEach((item) => updateFacets.run(JSON.stringify({ 'material-type': materialTypeDefaults[item.id] || 'crystal' }), item.id))
  }
  if (!materialColumns.has('style_key')) {
    db.exec("ALTER TABLE materials ADD COLUMN style_key TEXT NOT NULL DEFAULT 'clean'")
    const updateStyle = db.prepare('UPDATE materials SET style_key = ? WHERE id = ?')
        catalogSeed.materials.forEach((item) => updateStyle.run(materialEnergyDefaults[item.id] || 'balance', item.id))
  }
  if (!materialColumns.has('use_key')) {
    db.exec("ALTER TABLE materials ADD COLUMN use_key TEXT NOT NULL DEFAULT 'daily'")
    const updateUse = db.prepare('UPDATE materials SET use_key = ? WHERE id = ?')
    catalogSeed.materials.forEach((item) => updateUse.run(materialElementDefaults[item.id] || 'metal', item.id))
  }
  const designColumns = new Set(db.prepare('PRAGMA table_info(designs)').all().map((column) => column.name))
  if (!designColumns.has('reference_image')) db.exec("ALTER TABLE designs ADD COLUMN reference_image TEXT NOT NULL DEFAULT ''")
  if (!designColumns.has('submission_state')) db.exec("ALTER TABLE designs ADD COLUMN submission_state TEXT NOT NULL DEFAULT 'legacy'")
  if (!designColumns.has('quote_status')) db.exec("ALTER TABLE designs ADD COLUMN quote_status TEXT NOT NULL DEFAULT 'estimated'")
  if (!designColumns.has('customer_name')) db.exec("ALTER TABLE designs ADD COLUMN customer_name TEXT NOT NULL DEFAULT ''")
  if (!designColumns.has('customer_contact')) db.exec("ALTER TABLE designs ADD COLUMN customer_contact TEXT NOT NULL DEFAULT ''")
  if (!designColumns.has('quantity')) db.exec('ALTER TABLE designs ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1')
  if (!designColumns.has('submitted_at')) db.exec("ALTER TABLE designs ADD COLUMN submitted_at TEXT NOT NULL DEFAULT ''")
  if (!designColumns.has('internal_note')) db.exec("ALTER TABLE designs ADD COLUMN internal_note TEXT NOT NULL DEFAULT ''")

  db.prepare("INSERT OR IGNORE INTO accessory_categories (id, name, sort_order) VALUES ('accessories', '配件', 0)").run()

  if (db.prepare('SELECT COUNT(*) AS count FROM settings').get().count === 0) {
    db.exec('BEGIN')
    try {
      const insertSetting = db.prepare('INSERT INTO settings (key, value_json) VALUES (?, ?)')
      for (const [key, value] of Object.entries(catalogSeed.settings)) insertSetting.run(key, JSON.stringify(value))
      if (seedMode === 'demo') {
        const insertMaterial = db.prepare('INSERT INTO materials (id, name, price, photos_json, color_key, style_key, use_key, facet_values_json, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
        catalogSeed.materials.forEach((item, index) => insertMaterial.run(item.id, item.name, item.price, JSON.stringify(item.photos), item.colorKey || 'white', item.energyKey || materialEnergyDefaults[item.id] || 'balance', item.elementKey || materialElementDefaults[item.id] || 'metal', JSON.stringify(item.facetValues || { 'material-type': materialTypeDefaults[item.id] || 'crystal' }), index))
      }
      const insertAccessory = db.prepare('INSERT INTO accessories (id, name, description, price, photos_json, sort_order) VALUES (?, ?, ?, ?, ?, ?)')
      catalogSeed.accessories.forEach((item, index) => insertAccessory.run(item.id, item.name, item.description, item.price, JSON.stringify(item.photos || []), index))
      const insertCord = db.prepare('INSERT INTO cords (id, name, color, sort_order) VALUES (?, ?, ?, ?)')
      catalogSeed.cords.forEach((item, index) => insertCord.run(item.id, item.name, item.color, index))
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  }
  const insertMigratedVariant = db.prepare('INSERT OR IGNORE INTO material_variants (material_id, bead_size, price, stock, active) SELECT id, ?, price, stock, 1 FROM materials')
  materialSizes.forEach((size) => insertMigratedVariant.run(size))
  db.prepare("INSERT OR IGNORE INTO settings (key, value_json) VALUES ('catalogRevision', '1')").run()
  db.prepare("INSERT OR IGNORE INTO settings (key, value_json) VALUES ('variantMigrationPending', ?)").run(JSON.stringify(hadLegacyCatalog))
  db.prepare("INSERT OR IGNORE INTO settings (key, value_json) VALUES ('energyOptions', ?)").run(JSON.stringify(catalogSeed.settings.energyOptions))
  db.prepare("INSERT OR IGNORE INTO settings (key, value_json) VALUES ('elementOptions', ?)").run(JSON.stringify(catalogSeed.settings.elementOptions))
  db.prepare("INSERT OR IGNORE INTO settings (key, value_json) VALUES ('recommendationEnergyPrompt', ?)").run(JSON.stringify(catalogSeed.settings.recommendationEnergyPrompt))
  db.prepare("INSERT OR IGNORE INTO settings (key, value_json) VALUES ('recommendationElementPrompt', ?)").run(JSON.stringify(catalogSeed.settings.recommendationElementPrompt))
  db.prepare("INSERT OR IGNORE INTO settings (key, value_json) VALUES ('materialFacets', ?)").run(JSON.stringify(catalogSeed.settings.materialFacets))
  db.prepare("INSERT OR IGNORE INTO settings (key, value_json) VALUES ('entryImages', ?)").run(JSON.stringify(catalogSeed.settings.entryImages))

  const taxonomyVersion = Number(parseJson(db.prepare("SELECT value_json FROM settings WHERE key = 'explorationTaxonomyVersion'").get()?.value_json, 0))
  if (taxonomyVersion < 1) {
    const legacyEnergyMap = { clean: 'balance', gentle: 'balance', energy: 'vitality', natural: 'calm', cool: 'focus' }
    const legacyElementMap = { daily: 'metal', gift: 'earth', focus: 'water', statement: 'fire' }
    const updateMaterialTags = db.prepare('UPDATE materials SET style_key = ?, use_key = ? WHERE id = ?')
    const updateInspirationTags = db.prepare('UPDATE inspirations SET style_key = ?, use_key = ?, display_area = ? WHERE id = ?')
    db.exec('BEGIN')
    try {
      db.prepare('SELECT id, color_key FROM materials').all().forEach((item) => updateMaterialTags.run(
        materialEnergyDefaults[item.id] || 'balance',
        materialElementDefaults[item.id] || elementByColor[item.color_key] || 'metal',
        item.id
      ))
      db.prepare('SELECT id, style_key, use_key, display_area FROM inspirations').all().forEach((item) => updateInspirationTags.run(
        legacyEnergyMap[item.style_key] || 'balance',
        legacyElementMap[item.use_key] || 'metal',
        item.display_area === 'style' ? 'explore' : item.display_area,
        item.id
      ))
      const upsertSetting = db.prepare('INSERT INTO settings (key, value_json) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json')
      upsertSetting.run('energyOptions', JSON.stringify(catalogSeed.settings.energyOptions))
      upsertSetting.run('elementOptions', JSON.stringify(catalogSeed.settings.elementOptions))
      upsertSetting.run('explorationTaxonomyVersion', '1')
      db.prepare("DELETE FROM settings WHERE key IN ('styleOptions', 'useOptions')").run()
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  }

  const readSettings = () => Object.fromEntries(db.prepare('SELECT key, value_json FROM settings').all().map((row) => [row.key, parseJson(row.value_json, null)]))
  const optionKeys = (settingKey, fallback) => new Set((readSettings()[settingKey] || fallback).map((item) => item.key))
  const validEnergyKeys = () => optionKeys('energyOptions', catalogSeed.settings.energyOptions)
  const validElementKeys = () => optionKeys('elementOptions', catalogSeed.settings.elementOptions)
  const materialFacetDefinitions = () => readSettings().materialFacets || catalogSeed.settings.materialFacets
  const normalizeMaterialFacetValues = (value, facets = materialFacetDefinitions()) => {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
    return Object.fromEntries(facets.map((facet) => {
      const options = Array.isArray(facet.options) ? facet.options : []
      const requested = String(source[facet.key] || '')
      const selected = options.find((option) => option.key === requested) || options.find((option) => option.active !== false) || options[0]
      return [facet.key, selected?.key || '']
    }).filter(([, optionKey]) => optionKey))
  }
  const bumpRevision = () => db.prepare("UPDATE settings SET value_json = CAST(CAST(value_json AS INTEGER) + 1 AS TEXT) WHERE key = 'catalogRevision'").run()
  const materialVariants = (materialId) => Object.fromEntries(db.prepare('SELECT bead_size, price, stock, active FROM material_variants WHERE material_id = ? ORDER BY bead_size').all(materialId)
    .map((row) => [row.bead_size, { price: row.price, stock: row.stock, active: Boolean(row.active) }]))
  const normalizedVariants = (input, fallbackPrice, fallbackStock) => Object.fromEntries(materialSizes.map((size) => {
    const source = input?.[size] || input?.[String(size)] || {}
    return [size, {
      price: money(source.price ?? fallbackPrice, `${size}mm 价格`),
      stock: stock(source.stock ?? fallbackStock, `${size}mm 库存`),
      active: source.active === undefined ? true : Boolean(source.active)
    }]
  }))
  const getAdminPasswordHash = () => db.prepare("SELECT value FROM admin_auth WHERE key = 'password_hash'").get()?.value || null
  const setAdminPasswordHash = (value) => {
    if (typeof value !== 'string' || value.length > 500) throw new Error('密码数据不正确')
    db.prepare("INSERT INTO admin_auth (key, value) VALUES ('password_hash', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(value)
  }
  const createAdminSession = (tokenHash, expiresAt) => {
    db.prepare('DELETE FROM admin_sessions WHERE expires_at < ?').run(Date.now())
    db.prepare('INSERT INTO admin_sessions (token_hash, expires_at) VALUES (?, ?)').run(tokenHash, expiresAt)
  }
  const hasAdminSession = (tokenHash) => {
    const row = db.prepare('SELECT expires_at FROM admin_sessions WHERE token_hash = ?').get(tokenHash)
    if (!row || row.expires_at < Date.now()) {
      if (row) db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(tokenHash)
      return false
    }
    return true
  }
  const deleteAdminSession = (tokenHash) => db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(tokenHash)
  const clearAdminSessions = () => db.prepare('DELETE FROM admin_sessions').run()

  function getCatalog() {
    const settings = readSettings()
    const accessoryCategories = db.prepare('SELECT id, name FROM accessory_categories WHERE deleted = 0 ORDER BY sort_order, id').all()
    const materials = db.prepare('SELECT id, name, price, photos_json, color_key, style_key, use_key, description, facet_values_json, stock FROM materials WHERE active = 1 AND deleted = 0 ORDER BY sort_order, id').all()
      .map((row) => ({ id: row.id, name: row.name, price: row.price, stock: row.stock, colorKey: row.color_key, energyKey: row.style_key, elementKey: row.use_key, facetValues: parseJson(row.facet_values_json, {}), description: row.description, photos: parseJson(row.photos_json, []), variants: materialVariants(row.id) }))
    const accessories = db.prepare('SELECT id, name, description, price, photos_json, stock, category_id FROM accessories WHERE active = 1 AND deleted = 0 ORDER BY sort_order, id').all()
      .map((row) => ({ id: row.id, name: row.name, description: row.description, price: row.price, stock: row.stock, categoryId: row.category_id, photos: parseJson(row.photos_json, []) }))
  const cords = db.prepare('SELECT id, name, color, price, photos_json, stock FROM cords WHERE active = 1 AND deleted = 0 ORDER BY sort_order, id').all()
      .map((row) => ({ id: row.id, name: row.name, color: row.color, price: row.price, stock: row.stock, photos: parseJson(row.photos_json, []) }))
    const inspirations = db.prepare('SELECT id, name, hint, material_note, display_area, style_key, use_key, beads_json, bead_size, cord_id, photos_json FROM inspirations WHERE active = 1 AND deleted = 0 ORDER BY sort_order, id').all()
      .map((row) => ({ id: row.id, name: row.name, hint: row.hint, materialNote: row.material_note, displayArea: row.display_area, energyKey: row.style_key, elementKey: row.use_key, beads: parseJson(row.beads_json, []), beadSize: row.bead_size, cordId: row.cord_id, photos: parseJson(row.photos_json, []) }))
    return { settings, materials, accessoryCategories, accessories, cords, inspirations }
  }

  function getAdminCatalog() {
    return {
      settings: readSettings(),
      accessoryCategories: db.prepare('SELECT id, name, deleted FROM accessory_categories ORDER BY sort_order, id').all()
        .map((row) => ({ id: row.id, name: row.name, deleted: Boolean(row.deleted) })),
      materials: db.prepare('SELECT id, name, price, photos_json, color_key, style_key, use_key, description, facet_values_json, stock, active, deleted FROM materials ORDER BY sort_order, id').all()
        .map((row) => ({ id: row.id, name: row.name, price: row.price, stock: row.stock, colorKey: row.color_key, energyKey: row.style_key, elementKey: row.use_key, facetValues: parseJson(row.facet_values_json, {}), description: row.description, photos: parseJson(row.photos_json, []), variants: materialVariants(row.id), active: Boolean(row.active), deleted: Boolean(row.deleted) })),
      accessories: db.prepare('SELECT id, name, description, price, photos_json, stock, active, deleted, category_id FROM accessories ORDER BY sort_order, id').all()
        .map((row) => ({ id: row.id, name: row.name, description: row.description, price: row.price, stock: row.stock, categoryId: row.category_id, photos: parseJson(row.photos_json, []), active: Boolean(row.active), deleted: Boolean(row.deleted) })),
      cords: db.prepare('SELECT id, name, color, price, photos_json, stock, active, deleted FROM cords ORDER BY sort_order, id').all()
        .map((row) => ({ id: row.id, name: row.name, color: row.color, price: row.price, stock: row.stock, photos: parseJson(row.photos_json, []), active: Boolean(row.active), deleted: Boolean(row.deleted) }))
      , inspirations: db.prepare('SELECT id, name, hint, material_note, display_area, style_key, use_key, beads_json, bead_size, cord_id, photos_json, active, deleted, sort_order FROM inspirations ORDER BY sort_order, id').all()
        .map((row) => ({ id: row.id, name: row.name, hint: row.hint, materialNote: row.material_note, displayArea: row.display_area, energyKey: row.style_key, elementKey: row.use_key, beads: parseJson(row.beads_json, []), beadSize: row.bead_size, cordId: row.cord_id, photos: parseJson(row.photos_json, []), active: Boolean(row.active), deleted: Boolean(row.deleted), sortOrder: row.sort_order }))
    }
  }

  function updateCatalogItem(kind, id, input) {
    const table = tables[kind]
    if (!table) throw new Error('商品类型不受支持')
    const current = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id)
    if (!current) throw new Error('没有找到该商品')
    const active = input.active === undefined ? current.active : input.active ? 1 : 0
    const name = input.name === undefined ? current.name : text(input.name, '名称')
    const nextStock = input.stock === undefined ? current.stock : stock(input.stock)
    const sortOrder = input.sortOrder === undefined ? current.sort_order : Number(input.sortOrder)
    if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 1000000) throw new Error('排序值不正确')
    if (kind === 'inspirations') {
      const hint = input.hint === undefined ? current.hint : String(input.hint).trim().slice(0, 120)
      const materialNote = input.materialNote === undefined ? current.material_note : String(input.materialNote).trim().slice(0, 160)
      const displayArea = input.displayArea === undefined ? current.display_area : String(input.displayArea)
      const energyKey = input.energyKey === undefined && input.styleKey === undefined ? current.style_key : String(input.energyKey ?? input.styleKey)
      const elementKey = input.elementKey === undefined && input.useKey === undefined ? current.use_key : String(input.elementKey ?? input.useKey)
      const beads = input.beads === undefined ? parseJson(current.beads_json, []) : input.beads
      const beadSize = input.beadSize === undefined ? current.bead_size : Number(input.beadSize)
      const cordId = input.cordId === undefined ? current.cord_id : String(input.cordId || '')
      if (!validEnergyKeys().has(energyKey)) throw new Error('请选择有效的能量需求')
      if (!validElementKeys().has(elementKey)) throw new Error('请选择有效的五行归属')
      if (!['explore', 'inspiration'].includes(displayArea)) throw new Error('请选择有效的展示位置')
      if (!Array.isArray(beads) || beads.length > 30 || beads.some((bead) => typeof bead !== 'string' || bead.length > 100)) throw new Error('灵感搭配珠位不正确')
      if (![6, 8, 10].includes(beadSize)) throw new Error('请选择有效的珠径')
      if (cordId && !db.prepare('SELECT 1 FROM cords WHERE id = ? AND deleted = 0').get(cordId)) throw new Error('请选择有效的绳子')
      db.prepare('UPDATE inspirations SET name = ?, hint = ?, material_note = ?, display_area = ?, style_key = ?, use_key = ?, beads_json = ?, bead_size = ?, cord_id = ?, active = ?, sort_order = ? WHERE id = ?').run(name, hint, materialNote, displayArea, energyKey, elementKey, JSON.stringify(beads), beadSize, cordId, active, sortOrder, id)
    } else if (kind === 'materials') {
      const price = input.price === undefined ? current.price : money(input.price)
      const colorKey = input.colorKey === undefined ? current.color_key : String(input.colorKey)
      const energyKey = input.energyKey === undefined && input.styleKey === undefined ? current.style_key : String(input.energyKey ?? input.styleKey)
      const elementKey = input.elementKey === undefined && input.useKey === undefined ? current.use_key : String(input.elementKey ?? input.useKey)
      const facetValues = input.facetValues === undefined ? parseJson(current.facet_values_json, {}) : input.facetValues
      const description = input.description === undefined ? current.description : String(input.description).trim().slice(0, 120)
      if (!allowedColorKeys.has(colorKey)) throw new Error('请选择有效的珠材色系')
      if (!validEnergyKeys().has(energyKey)) throw new Error('请选择有效的能量需求')
      if (!validElementKeys().has(elementKey)) throw new Error('请选择有效的五行归属')
      const normalizedFacetValues = normalizeMaterialFacetValues(facetValues)
      const currentVariants = materialVariants(id)
      const variants = input.variants
        ? normalizedVariants(input.variants, price, nextStock)
        : input.price !== undefined || input.stock !== undefined
          ? normalizedVariants(null, price, nextStock)
          : Object.keys(currentVariants).length ? currentVariants : normalizedVariants(null, price, nextStock)
      db.exec('BEGIN')
      try {
      db.prepare('UPDATE materials SET name = ?, price = ?, color_key = ?, style_key = ?, use_key = ?, facet_values_json = ?, description = ?, stock = ?, active = ?, sort_order = ? WHERE id = ?').run(name, variants[8].price, colorKey, energyKey, elementKey, JSON.stringify(normalizedFacetValues), description, variants[8].stock, active, sortOrder, id)
        const updateVariant = db.prepare('INSERT INTO material_variants (material_id, bead_size, price, stock, active) VALUES (?, ?, ?, ?, ?) ON CONFLICT(material_id, bead_size) DO UPDATE SET price = excluded.price, stock = excluded.stock, active = excluded.active')
        materialSizes.forEach((size) => updateVariant.run(id, size, variants[size].price, variants[size].stock, variants[size].active ? 1 : 0))
        db.exec('COMMIT')
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    } else if (kind === 'accessories') {
      const price = input.price === undefined ? current.price : money(input.price)
      const description = input.description === undefined ? current.description : String(input.description).trim().slice(0, 60)
      const categoryId = input.categoryId === undefined ? current.category_id : String(input.categoryId)
      if (!db.prepare('SELECT 1 FROM accessory_categories WHERE id = ? AND deleted = 0').get(categoryId)) throw new Error('请选择有效的配件分类')
      db.prepare('UPDATE accessories SET name = ?, description = ?, price = ?, stock = ?, active = ?, category_id = ?, sort_order = ? WHERE id = ?').run(name, description, price, nextStock, active, categoryId, sortOrder, id)
    } else {
      const color = input.color === undefined ? current.color : String(input.color)
      const price = input.price === undefined ? current.price : money(input.price)
      if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error('绳色必须是有效颜色')
      db.prepare('UPDATE cords SET name = ?, color = ?, price = ?, stock = ?, active = ?, sort_order = ? WHERE id = ?').run(name, color, price, nextStock, active, sortOrder, id)
    }
    bumpRevision()
    return getAdminCatalog()[kind].find((item) => item.id === id)
  }

  function createCatalogItem(kind, input) {
    if (!tables[kind]) throw new Error('商品类型不受支持')
    const labels = { materials: '珠材', accessories: '配件', cords: '绳色', inspirations: '灵感款' }
    const name = text(input.name, `${labels[kind]}名称`)
    const prefix = { materials: 'material', accessories: 'accessory', cords: 'cord', inspirations: 'inspiration' }[kind]
    const id = `${prefix}-${randomUUID().slice(0, 12)}`
    const sortOrder = Number(db.prepare(`SELECT COALESCE(MAX(sort_order), -1) + 1 AS value FROM ${tables[kind]}`).get().value)
    const itemStock = stock(input.stock ?? 100)
    if (kind === 'inspirations') {
      const hint = String(input.hint ?? input.description ?? '').trim().slice(0, 120)
      const materialNote = String(input.materialNote ?? '').trim().slice(0, 160)
      const displayArea = String(input.displayArea || 'inspiration')
      const energyKey = String(input.energyKey || input.styleKey || 'balance')
      const elementKey = String(input.elementKey || input.useKey || 'metal')
      const beads = Array.isArray(input.beads) ? input.beads : []
      const beadSize = Number(input.beadSize || 8)
      const cordId = String(input.cordId || '')
      if (!validEnergyKeys().has(energyKey)) throw new Error('请选择有效的能量需求')
      if (!validElementKeys().has(elementKey)) throw new Error('请选择有效的五行归属')
      if (!['explore', 'inspiration'].includes(displayArea)) throw new Error('请选择有效的展示位置')
      if (beads.length > 30 || beads.some((bead) => typeof bead !== 'string' || bead.length > 100)) throw new Error('灵感搭配珠位不正确')
      if (![6, 8, 10].includes(beadSize)) throw new Error('请选择有效的珠径')
      if (cordId && !db.prepare('SELECT 1 FROM cords WHERE id = ? AND deleted = 0').get(cordId)) throw new Error('请选择有效的绳子')
      db.prepare('INSERT INTO inspirations (id, name, hint, material_note, display_area, style_key, use_key, beads_json, bead_size, cord_id, photos_json, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)')
        .run(id, name, hint, materialNote, displayArea, energyKey, elementKey, JSON.stringify(beads), beadSize, cordId, '[]', sortOrder)
    } else if (kind === 'materials') {
      const price = money(input.price)
      const colorKey = String(input.colorKey || 'white')
      const energyKey = String(input.energyKey || input.styleKey || 'balance')
      const elementKey = String(input.elementKey || input.useKey || elementByColor[colorKey] || 'metal')
      const facetValues = normalizeMaterialFacetValues(input.facetValues || {})
      const description = String(input.description ?? '').trim().slice(0, 120)
      if (!allowedColorKeys.has(colorKey)) throw new Error('请选择有效的珠材色系')
      if (!validEnergyKeys().has(energyKey)) throw new Error('请选择有效的能量需求')
      if (!validElementKeys().has(elementKey)) throw new Error('请选择有效的五行归属')
      const variants = normalizedVariants(input.variants, price, itemStock)
      db.exec('BEGIN')
      try {
        db.prepare('INSERT INTO materials (id, name, price, photos_json, color_key, style_key, use_key, facet_values_json, description, stock, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)')
          .run(id, name, variants[8].price, '[]', colorKey, energyKey, elementKey, JSON.stringify(facetValues), description, variants[8].stock, sortOrder)
        const insertVariant = db.prepare('INSERT INTO material_variants (material_id, bead_size, price, stock, active) VALUES (?, ?, ?, ?, ?)')
        materialSizes.forEach((size) => insertVariant.run(id, size, variants[size].price, variants[size].stock, variants[size].active ? 1 : 0))
        db.exec('COMMIT')
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    } else if (kind === 'accessories') {
      const price = money(input.price)
      const description = String(input.description ?? '').trim().slice(0, 60)
      const categoryId = String(input.categoryId || 'accessories')
      if (!db.prepare('SELECT 1 FROM accessory_categories WHERE id = ? AND deleted = 0').get(categoryId)) throw new Error('请选择有效的配件分类')
      db.prepare('INSERT INTO accessories (id, name, description, price, photos_json, stock, active, sort_order, category_id) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)')
        .run(id, name, description, price, '[]', itemStock, sortOrder, categoryId)
    } else {
      const color = String(input.color || '')
      const price = money(input.price ?? 0)
      if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error('绳色必须是有效颜色')
      db.prepare('INSERT INTO cords (id, name, color, price, photos_json, stock, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, 1, ?)')
        .run(id, name, color, price, '[]', itemStock, sortOrder)
    }
    bumpRevision()
    return getAdminCatalog()[kind].find((item) => item.id === id)
  }

  function addMaterialPhoto(id, photoPath) {
    return addCatalogPhoto('materials', id, photoPath)
  }

  function addCatalogPhoto(kind, id, photoPath) {
    if (!['materials', 'accessories', 'cords', 'inspirations'].includes(kind)) throw new Error('该商品不支持图片')
    const current = db.prepare(`SELECT photos_json FROM ${kind} WHERE id = ?`).get(id)
    if (!current) throw new Error('没有找到该商品')
    const photos = parseJson(current.photos_json, [])
    if (photos.length >= 8) throw new Error('每种商品最多上传 8 张图片')
    photos.push(photoPath)
    db.prepare(`UPDATE ${kind} SET photos_json = ? WHERE id = ?`).run(JSON.stringify(photos), id)
    bumpRevision()
    return getAdminCatalog()[kind].find((item) => item.id === id)
  }

  function replaceMaterialPhoto(id, index, photoPath) {
    return replaceCatalogPhoto('materials', id, index, photoPath)
  }

  function replaceCatalogPhoto(kind, id, index, photoPath) {
    if (!['materials', 'accessories', 'cords', 'inspirations'].includes(kind)) throw new Error('该商品不支持图片')
    const current = db.prepare(`SELECT photos_json FROM ${kind} WHERE id = ?`).get(id)
    if (!current) throw new Error('没有找到该商品')
    const photos = parseJson(current.photos_json, [])
    if (!Number.isInteger(index) || index < 0 || index >= photos.length) throw new Error('没有找到要替换的图片')
    const removedPhoto = photos[index]
    photos[index] = photoPath
    db.prepare(`UPDATE ${kind} SET photos_json = ? WHERE id = ?`).run(JSON.stringify(photos), id)
    bumpRevision()
    return { item: getAdminCatalog()[kind].find((item) => item.id === id), removedPhoto }
  }

  function removeMaterialPhoto(id, index) {
    return removeCatalogPhoto('materials', id, index)
  }

  function removeCatalogPhoto(kind, id, index) {
    if (!['materials', 'accessories', 'cords', 'inspirations'].includes(kind)) throw new Error('该商品不支持图片')
    const current = db.prepare(`SELECT photos_json FROM ${kind} WHERE id = ?`).get(id)
    if (!current) throw new Error('没有找到该商品')
    const photos = parseJson(current.photos_json, [])
    if (!Number.isInteger(index) || index < 0 || index >= photos.length) throw new Error('没有找到要删除的图片')
    const [removedPhoto] = photos.splice(index, 1)
    db.prepare(`UPDATE ${kind} SET photos_json = ? WHERE id = ?`).run(JSON.stringify(photos), id)
    bumpRevision()
    return { item: getAdminCatalog()[kind].find((item) => item.id === id), removedPhoto }
  }

  function deleteCatalogItem(kind, id) {
    const table = tables[kind]
    if (!table) throw new Error('商品类型不受支持')
    const result = db.prepare(`UPDATE ${table} SET active = 0, deleted = 1 WHERE id = ? AND deleted = 0`).run(id)
    if (!result.changes) throw new Error('没有找到该商品')
    bumpRevision()
    return { deleted: true, id }
  }

  function createAccessoryCategory(input) {
    const name = text(input?.name, '分类名称', 20)
    const duplicate = db.prepare('SELECT 1 FROM accessory_categories WHERE name = ? AND deleted = 0').get(name)
    if (duplicate) throw new Error('已经有同名分类')
    const id = `category-${randomUUID().slice(0, 12)}`
    const sortOrder = Number(db.prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 AS value FROM accessory_categories').get().value)
    db.prepare('INSERT INTO accessory_categories (id, name, sort_order) VALUES (?, ?, ?)').run(id, name, sortOrder)
    bumpRevision()
    return getAdminCatalog().accessoryCategories.find((item) => item.id === id)
  }

  function updateAccessoryCategory(id, input) {
    const current = db.prepare('SELECT * FROM accessory_categories WHERE id = ? AND deleted = 0').get(id)
    if (!current) throw new Error('没有找到该分类')
    const name = input?.name === undefined ? current.name : text(input.name, '分类名称', 20)
    const duplicate = db.prepare('SELECT 1 FROM accessory_categories WHERE name = ? AND id <> ? AND deleted = 0').get(name, id)
    if (duplicate) throw new Error('已经有同名分类')
    db.prepare('UPDATE accessory_categories SET name = ? WHERE id = ?').run(name, id)
    bumpRevision()
    return getAdminCatalog().accessoryCategories.find((item) => item.id === id)
  }

  function deleteAccessoryCategory(id) {
    if (id === 'accessories') throw new Error('默认“配件”分类不能删除，可以修改名称')
    const current = db.prepare('SELECT 1 FROM accessory_categories WHERE id = ? AND deleted = 0').get(id)
    if (!current) throw new Error('没有找到该分类')
    const itemCount = db.prepare('SELECT COUNT(*) AS count FROM accessories WHERE category_id = ? AND deleted = 0').get(id).count
    if (itemCount) throw new Error('请先删除或移动该分类中的商品')
    db.prepare('UPDATE accessory_categories SET deleted = 1 WHERE id = ?').run(id)
    bumpRevision()
    return { deleted: true, id }
  }

  function updateSettings(input) {
    const current = readSettings()
    const normalizeOptions = (value, label, fallback) => {
      const source = value === undefined ? (current[label] || fallback) : value
      if (!Array.isArray(source) || !source.length || source.length > 30) throw new Error(`${label === 'energyOptions' ? '能量需求' : '五行'}分类数量不正确`)
      const options = source.map((item) => ({
        key: String(item?.key || ''),
        name: text(item?.name, '分类名称', 12),
        active: item?.active !== false
      }))
      if (options.some((item) => !/^[a-z][a-z0-9-]{1,39}$/i.test(item.key))) throw new Error('分类编号不正确')
      if (new Set(options.map((item) => item.key)).size !== options.length) throw new Error('分类编号不能重复')
      if (!options.some((item) => item.active)) throw new Error(`${label === 'energyOptions' ? '能量需求' : '五行'}至少保留一个显示中的分类`)
      return options
    }
    const energyOptions = normalizeOptions(input.energyOptions, 'energyOptions', catalogSeed.settings.energyOptions)
    const elementOptions = normalizeOptions(input.elementOptions, 'elementOptions', catalogSeed.settings.elementOptions)
    const normalizeMaterialFacets = (value) => {
      const source = value === undefined ? (current.materialFacets || catalogSeed.settings.materialFacets) : value
      if (!Array.isArray(source) || source.length > 12) throw new Error('主珠分类方式数量不正确')
      const facets = source.map((facet) => {
        const options = Array.isArray(facet?.options) ? facet.options : []
        if (!options.length || options.length > 30) throw new Error('每种主珠分类需要 1 至 30 个选项')
        const normalizedOptions = options.map((option) => ({
          key: String(option?.key || ''),
          name: text(option?.name, '分类选项名称', 20),
          active: option?.active !== false
        }))
        if (normalizedOptions.some((option) => !/^[a-z][a-z0-9-]{1,39}$/i.test(option.key))) throw new Error('分类选项编号不正确')
        if (new Set(normalizedOptions.map((option) => option.key)).size !== normalizedOptions.length) throw new Error('同一分类的选项编号不能重复')
        if (!normalizedOptions.some((option) => option.active)) throw new Error('每种主珠分类至少保留一个显示中的选项')
        return {
          key: String(facet?.key || ''),
          name: text(facet?.name, '主珠分类名称', 20),
          active: facet?.active !== false,
          options: normalizedOptions
        }
      })
      if (facets.some((facet) => !/^[a-z][a-z0-9-]{1,39}$/i.test(facet.key) || ['color', 'element'].includes(facet.key))) throw new Error('主珠分类编号不正确')
      if (new Set(facets.map((facet) => facet.key)).size !== facets.length) throw new Error('主珠分类编号不能重复')
      return facets
    }
    const materialFacets = normalizeMaterialFacets(input.materialFacets)
    const energyKeys = new Set(energyOptions.map((item) => item.key))
    const elementKeys = new Set(elementOptions.map((item) => item.key))
    const missingEnergy = db.prepare('SELECT style_key FROM materials WHERE deleted = 0 AND style_key NOT IN (' + [...energyKeys].map(() => '?').join(',') + ') LIMIT 1').get(...energyKeys)
      || db.prepare('SELECT style_key FROM inspirations WHERE deleted = 0 AND style_key NOT IN (' + [...energyKeys].map(() => '?').join(',') + ') LIMIT 1').get(...energyKeys)
    const missingElement = db.prepare('SELECT use_key FROM materials WHERE deleted = 0 AND use_key NOT IN (' + [...elementKeys].map(() => '?').join(',') + ') LIMIT 1').get(...elementKeys)
      || db.prepare('SELECT use_key FROM inspirations WHERE deleted = 0 AND use_key NOT IN (' + [...elementKeys].map(() => '?').join(',') + ') LIMIT 1').get(...elementKeys)
    if (missingEnergy) throw new Error('该能量需求仍被商品使用，请先改为其他标签或将它停用')
    if (missingElement) throw new Error('该五行标签仍被商品使用，请先改为其他标签或将它停用')
    const brandName = input.brandName === undefined ? current.brandName : text(input.brandName, '店铺名称', 30)
    const source = input.craftPrices || current.craftPrices
    const craftPrices = { 6: money(source[6], '6mm 手工费'), 8: money(source[8], '8mm 手工费'), 10: money(source[10], '10mm 手工费') }
    const merchantContact = input.merchantContact === undefined ? String(current.merchantContact || '') : String(input.merchantContact).trim().slice(0, 120)
    const productionTime = input.productionTime === undefined ? String(current.productionTime || '') : String(input.productionTime).trim().slice(0, 80)
    const shippingNote = input.shippingNote === undefined ? String(current.shippingNote || '') : String(input.shippingNote).trim().slice(0, 120)
    const customNotice = input.customNotice === undefined ? String(current.customNotice || '') : String(input.customNotice).trim().slice(0, 300)
    const entryImages = normalizeEntryImages(input.entryImages, current.entryImages || catalogSeed.settings.entryImages)
    const recommendationEnergyPrompt = input.recommendationEnergyPrompt === undefined
      ? String(current.recommendationEnergyPrompt || catalogSeed.settings.recommendationEnergyPrompt)
      : text(input.recommendationEnergyPrompt, '能量提问文案', 80)
    const recommendationElementPrompt = input.recommendationElementPrompt === undefined
      ? String(current.recommendationElementPrompt || catalogSeed.settings.recommendationElementPrompt)
      : text(input.recommendationElementPrompt, '五行提问文案', 80)
    const variantMigrationPending = input.variantMigrationPending === undefined ? Boolean(current.variantMigrationPending) : Boolean(input.variantMigrationPending)
    const upsert = db.prepare('INSERT INTO settings (key, value_json) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json')
    upsert.run('brandName', JSON.stringify(brandName))
    upsert.run('craftPrices', JSON.stringify(craftPrices))
    upsert.run('merchantContact', JSON.stringify(merchantContact))
    upsert.run('productionTime', JSON.stringify(productionTime))
    upsert.run('shippingNote', JSON.stringify(shippingNote))
    upsert.run('customNotice', JSON.stringify(customNotice))
    upsert.run('entryImages', JSON.stringify(entryImages))
    upsert.run('recommendationEnergyPrompt', JSON.stringify(recommendationEnergyPrompt))
    upsert.run('recommendationElementPrompt', JSON.stringify(recommendationElementPrompt))
    upsert.run('energyOptions', JSON.stringify(energyOptions))
    upsert.run('elementOptions', JSON.stringify(elementOptions))
    upsert.run('materialFacets', JSON.stringify(materialFacets))
    upsert.run('variantMigrationPending', JSON.stringify(variantMigrationPending))
    const updateFacetValues = db.prepare('UPDATE materials SET facet_values_json = ? WHERE id = ?')
    db.prepare('SELECT id, facet_values_json FROM materials').all().forEach((material) => {
      updateFacetValues.run(JSON.stringify(normalizeMaterialFacetValues(parseJson(material.facet_values_json, {}), materialFacets)), material.id)
    })
    bumpRevision()
    return readSettings()
  }

  function createBackup() {
    return {
      format: 'puguang-bracelet-backup',
      version: 4,
      exportedAt: new Date().toISOString(),
      data: {
        settings: readSettings(),
        accessoryCategories: db.prepare('SELECT id, name, deleted, sort_order FROM accessory_categories ORDER BY sort_order, id').all()
          .map((row) => ({ id: row.id, name: row.name, deleted: Boolean(row.deleted), sortOrder: row.sort_order })),
        materials: db.prepare('SELECT id, name, price, photos_json, color_key, style_key, use_key, facet_values_json, description, stock, active, deleted, sort_order FROM materials ORDER BY sort_order, id').all()
          .map((row) => ({ id: row.id, name: row.name, price: row.price, photos: parseJson(row.photos_json, []), colorKey: row.color_key, energyKey: row.style_key, elementKey: row.use_key, facetValues: parseJson(row.facet_values_json, {}), description: row.description, stock: row.stock, variants: materialVariants(row.id), active: Boolean(row.active), deleted: Boolean(row.deleted), sortOrder: row.sort_order })),
        accessories: db.prepare('SELECT id, name, description, price, photos_json, stock, active, deleted, sort_order, category_id FROM accessories ORDER BY sort_order, id').all()
          .map((row) => ({ id: row.id, name: row.name, description: row.description, price: row.price, photos: parseJson(row.photos_json, []), stock: row.stock, categoryId: row.category_id, active: Boolean(row.active), deleted: Boolean(row.deleted), sortOrder: row.sort_order })),
        cords: db.prepare('SELECT id, name, color, price, photos_json, stock, active, deleted, sort_order FROM cords ORDER BY sort_order, id').all()
          .map((row) => ({ id: row.id, name: row.name, color: row.color, price: row.price, photos: parseJson(row.photos_json, []), stock: row.stock, active: Boolean(row.active), deleted: Boolean(row.deleted), sortOrder: row.sort_order })),
        inspirations: db.prepare('SELECT id, name, hint, material_note, display_area, style_key, use_key, beads_json, bead_size, cord_id, photos_json, active, deleted, sort_order FROM inspirations ORDER BY sort_order, id').all()
          .map((row) => ({ id: row.id, name: row.name, hint: row.hint, materialNote: row.material_note, displayArea: row.display_area, energyKey: row.style_key, elementKey: row.use_key, beads: parseJson(row.beads_json, []), beadSize: row.bead_size, cordId: row.cord_id, photos: parseJson(row.photos_json, []), active: Boolean(row.active), deleted: Boolean(row.deleted), sortOrder: row.sort_order })),
        designs: db.prepare('SELECT * FROM designs ORDER BY created_at').all().map(mapDesign)
      }
    }
  }

  function restoreBackup(backup) {
    if (!backup || backup.format !== 'puguang-bracelet-backup' || ![1, 2, 3, 4].includes(backup.version) || !backup.data) throw new Error('这不是有效的手串定制工具备份文件')
    const data = backup.data
    const array = (value, label, max) => {
      if (!Array.isArray(value) || value.length > max) throw new Error(`${label}数据不正确`)
      return value
    }
    const id = (value, label) => {
      const result = String(value ?? '')
      if (!/^[a-z0-9][a-z0-9-]{0,79}$/i.test(result)) throw new Error(`${label}编号不正确`)
      return result
    }
    const order = (value) => Number.isInteger(Number(value)) ? Number(value) : 0
    const unique = (items, label, key = 'id') => {
      const values = items.map((item) => item[key])
      if (new Set(values).size !== values.length) throw new Error(`${label}包含重复编号`)
    }
    if (!data.settings || typeof data.settings !== 'object' || Array.isArray(data.settings)) throw new Error('店铺设置数据不正确')
    const settings = { ...data.settings }
    settings.brandName = text(settings.brandName, '店铺名称', 30)
    const craftPrices = settings.craftPrices || {}
    settings.craftPrices = { 6: money(craftPrices[6], '6mm 手工费'), 8: money(craftPrices[8], '8mm 手工费'), 10: money(craftPrices[10], '10mm 手工费') }
    if (settings.cordSpec !== undefined) settings.cordSpec = text(settings.cordSpec, '绳子规格', 80)
    if (settings.merchantContact !== undefined) settings.merchantContact = String(settings.merchantContact).trim().slice(0, 120)
    if (settings.productionTime !== undefined) settings.productionTime = String(settings.productionTime).trim().slice(0, 80)
    if (settings.shippingNote !== undefined) settings.shippingNote = String(settings.shippingNote).trim().slice(0, 120)
    if (settings.customNotice !== undefined) settings.customNotice = String(settings.customNotice).trim().slice(0, 300)
    settings.entryImages = normalizeEntryImages(settings.entryImages, catalogSeed.settings.entryImages)
    settings.recommendationEnergyPrompt = settings.recommendationEnergyPrompt === undefined
      ? catalogSeed.settings.recommendationEnergyPrompt
      : text(settings.recommendationEnergyPrompt, '能量提问文案', 80)
    settings.recommendationElementPrompt = settings.recommendationElementPrompt === undefined
      ? catalogSeed.settings.recommendationElementPrompt
      : text(settings.recommendationElementPrompt, '五行提问文案', 80)
    const restoreOptions = (value, fallback, label) => array(value || fallback, label, 30).map((item) => ({
      key: id(item?.key, label).slice(0, 40),
      name: text(item?.name, `${label}名称`, 12),
      active: item?.active !== false
    }))
    const legacyTaxonomy = Number(backup.version || 0) < 4
    settings.energyOptions = restoreOptions(legacyTaxonomy ? catalogSeed.settings.energyOptions : (settings.energyOptions || settings.styleOptions), catalogSeed.settings.energyOptions, '能量需求分类')
    settings.elementOptions = restoreOptions(legacyTaxonomy ? catalogSeed.settings.elementOptions : (settings.elementOptions || settings.useOptions), catalogSeed.settings.elementOptions, '五行分类')
    settings.materialFacets = array(settings.materialFacets || catalogSeed.settings.materialFacets, '主珠分类方式', 12).map((facet) => ({
      key: id(facet?.key, '主珠分类方式').slice(0, 40),
      name: text(facet?.name, '主珠分类名称', 20),
      active: facet?.active !== false,
      options: array(facet?.options, '主珠分类选项', 30).map((option) => ({ key: id(option?.key, '主珠分类选项').slice(0, 40), name: text(option?.name, '主珠分类选项名称', 20), active: option?.active !== false }))
    }))
    unique(settings.energyOptions, '能量需求分类', 'key')
    unique(settings.elementOptions, '五行分类', 'key')
    unique(settings.materialFacets, '主珠分类方式', 'key')
    settings.materialFacets.forEach((facet) => unique(facet.options, `${facet.name}选项`, 'key'))
    const restoredEnergyKeys = new Set(settings.energyOptions.map((item) => item.key))
    const restoredElementKeys = new Set(settings.elementOptions.map((item) => item.key))
    settings.explorationTaxonomyVersion = 1
    delete settings.styleOptions
    delete settings.useOptions
    settings.variantMigrationPending = backup.version === 1 ? true : Boolean(settings.variantMigrationPending)
    delete settings.catalogRevision
    for (const [key, value] of Object.entries(settings)) {
      if (!/^[a-zA-Z][a-zA-Z0-9]{0,49}$/.test(key) || JSON.stringify(value).length > 100_000) throw new Error('店铺设置数据不正确')
    }

    const materials = array(data.materials, '珠材', 500).map((item) => {
      const photos = array(item?.photos, '珠材图片', 8).map((photo) => {
        const result = String(photo ?? '')
        if (!result || result.length > 500 || (!result.startsWith('/uploads/') && !result.startsWith('./assets/'))) throw new Error('珠材图片路径不正确')
        return result
      })
      const colorKey = String(item?.colorKey || '')
      if (!allowedColorKeys.has(colorKey)) throw new Error('珠材色系不正确')
      const energyKeyValue = String(item?.energyKey || '')
      const elementKeyValue = String(item?.elementKey || '')
      const energyKey = restoredEnergyKeys.has(energyKeyValue) ? energyKeyValue : (materialEnergyDefaults[String(item?.id || '')] || settings.energyOptions[0].key)
      const elementKey = restoredElementKeys.has(elementKeyValue) ? elementKeyValue : (materialElementDefaults[String(item?.id || '')] || elementByColor[colorKey] || settings.elementOptions[0].key)
      if (!restoredEnergyKeys.has(energyKey)) throw new Error('珠材能量需求不正确')
      if (!restoredElementKeys.has(elementKey)) throw new Error('珠材五行归属不正确')
      const price = money(item?.price)
      const itemStock = stock(item?.stock ?? 999)
      const variants = normalizedVariants(item?.variants, price, itemStock)
      const facetValues = normalizeMaterialFacetValues(item?.facetValues || {}, settings.materialFacets)
      return { id: id(item?.id, '珠材'), name: text(item?.name, '珠材名称'), price, photos, colorKey, energyKey, elementKey, facetValues, description: String(item?.description ?? '').trim().slice(0, 120), stock: itemStock, variants, active: item?.active ? 1 : 0, deleted: item?.deleted ? 1 : 0, sortOrder: order(item?.sortOrder) }
    })
    const accessoryCategories = array(data.accessoryCategories || [{ id: 'accessories', name: '配件', deleted: false, sortOrder: 0 }], '配件分类', 50).map((item) => ({
      id: id(item?.id, '配件分类'), name: text(item?.name, '分类名称', 20), deleted: item?.deleted ? 1 : 0, sortOrder: order(item?.sortOrder)
    }))
    if (!accessoryCategories.some((item) => item.id === 'accessories' && !item.deleted)) accessoryCategories.unshift({ id: 'accessories', name: '配件', deleted: 0, sortOrder: 0 })
    const categoryIds = new Set(accessoryCategories.filter((item) => !item.deleted).map((item) => item.id))
    const accessories = array(data.accessories, '配件', 200).map((item) => ({
      id: id(item?.id, '配件'), name: text(item?.name, '配件名称'), description: String(item?.description ?? '').trim().slice(0, 60),
      price: money(item?.price), photos: array(item?.photos || [], '配件图片', 8).map((photo) => {
        const result = String(photo ?? '')
        if (!result || result.length > 500 || (!result.startsWith('/uploads/') && !result.startsWith('./assets/'))) throw new Error('配件图片路径不正确')
        return result
      }), stock: stock(item?.stock ?? 999), categoryId: categoryIds.has(String(item?.categoryId || 'accessories')) ? String(item?.categoryId || 'accessories') : 'accessories', active: item?.active ? 1 : 0, deleted: item?.deleted ? 1 : 0, sortOrder: order(item?.sortOrder)
    }))
    const cords = array(data.cords, '绳色', 100).map((item) => {
      const color = String(item?.color || '')
      if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error('绳色数据不正确')
      const photos = array(item?.photos || [], '绳子图片', 8).map((photo) => {
        const result = String(photo ?? '')
        if (!result || result.length > 500 || (!result.startsWith('/uploads/') && !result.startsWith('./assets/'))) throw new Error('绳子图片路径不正确')
        return result
      })
      return { id: id(item?.id, '绳色'), name: text(item?.name, '绳色名称'), color, price: money(item?.price ?? 0), photos, stock: stock(item?.stock ?? 999), active: item?.active ? 1 : 0, deleted: item?.deleted ? 1 : 0, sortOrder: order(item?.sortOrder) }
    })
    const inspirations = array(data.inspirations || [], '灵感款', 200).map((item) => {
      const legacyEnergyMap = { clean: 'balance', gentle: 'balance', energy: 'vitality', natural: 'calm', cool: 'focus' }
      const legacyElementMap = { daily: 'metal', gift: 'earth', focus: 'water', statement: 'fire' }
      const energyKey = String(item?.energyKey || (legacyTaxonomy ? legacyEnergyMap[item?.styleKey] : '') || 'balance')
      const materialNote = String(item?.materialNote ?? '').trim().slice(0, 160)
      const rawDisplayArea = String(item?.displayArea || 'inspiration')
      const displayArea = rawDisplayArea === 'style' ? 'explore' : rawDisplayArea
      const elementKey = String(item?.elementKey || (legacyTaxonomy ? legacyElementMap[item?.useKey] : '') || 'metal')
      const beads = Array.isArray(item?.beads) ? item.beads.map((bead) => String(bead)).filter(Boolean) : []
      const beadSize = Number(item?.beadSize || 8)
      const cordId = String(item?.cordId || '')
      if (!restoredEnergyKeys.has(energyKey)) throw new Error('推荐款能量需求不正确')
      if (!restoredElementKeys.has(elementKey)) throw new Error('推荐款五行归属不正确')
      if (!['explore', 'inspiration'].includes(displayArea)) throw new Error('灵感款展示位置不正确')
      if (beads.length > 30 || beads.some((bead) => bead.length > 100)) throw new Error('灵感款珠位不正确')
      if (![6, 8, 10].includes(beadSize)) throw new Error('灵感款珠径不正确')
      const photos = array(item?.photos || [], '灵感款图片', 8).map((photo) => {
        const result = String(photo ?? '')
        if (!result || result.length > 500 || (!result.startsWith('/uploads/') && !result.startsWith('./assets/'))) throw new Error('灵感款图片路径不正确')
        return result
      })
      return { id: id(item?.id, '灵感款'), name: text(item?.name, '灵感款名称'), hint: String(item?.hint ?? '').trim().slice(0, 120), materialNote, displayArea, energyKey, elementKey, beads, beadSize, cordId, photos, active: item?.active ? 1 : 0, deleted: item?.deleted ? 1 : 0, sortOrder: order(item?.sortOrder) }
    })
    const designs = array(data.designs, '顾客方案', 10_000).map((item) => {
      const code = String(item?.code || '')
      const createdAt = String(item?.createdAt || '')
      const wrist = Number(item?.wrist)
      const beadSize = Number(item?.beadSize)
      const beads = array(item?.beads, '方案珠位', 30).map((bead) => {
        if (bead === null) return null
        const value = String(bead)
        if (value.startsWith('accessory:')) return `accessory:${id(value.slice('accessory:'.length), '配件珠位')}`
        return id(value, '珠位')
      })
      const accessory = id(item?.accessory, '配件')
      const cord = id(item?.cord, '绳色')
      const note = String(item?.note ?? '').trim()
      const referenceImage = String(item?.referenceImage || '')
      const totalPrice = Number(item?.totalPrice)
      const submissionState = allowedSubmissionStates.has(item?.submissionState) ? item.submissionState : 'legacy'
      const quoteStatus = allowedQuoteStatuses.has(item?.quoteStatus) ? item.quoteStatus : (beads.filter(Boolean).length < Math.round(wrist * 10 / beadSize) ? 'needs_confirmation' : 'estimated')
      const customerName = String(item?.customerName || '').trim().slice(0, 40)
      const customerContact = String(item?.customerContact || '').trim().slice(0, 120)
      const quantity = Math.max(1, Math.min(999, Number(item?.quantity) || 1))
      const submittedAt = String(item?.submittedAt || '')
      const internalNote = String(item?.internalNote || '').trim().slice(0, 300)
      if (!/^PG-\d{8}-[A-Z0-9]{6}$/i.test(code) || !createdAt || createdAt.length > 40 || Number.isNaN(Date.parse(createdAt))) throw new Error('顾客方案编号或日期不正确')
      if (!Number.isFinite(wrist) || wrist < 13 || wrist > 20 || ![6, 8, 10].includes(beadSize)) throw new Error('顾客方案尺寸不正确')
      if (note.length > 80 || (referenceImage && !/^\/uploads\/[a-f0-9-]+\.(?:png|jpg|webp)$/i.test(referenceImage)) || !Number.isInteger(totalPrice) || totalPrice < 0 || totalPrice > 10_000_000) throw new Error('顾客方案内容不正确')
      if (!allowedStatuses.has(item?.status)) throw new Error('顾客方案状态不正确')
      return { code, createdAt, wrist, beadSize, beads, accessory, cord, note, referenceImage, totalPrice, status: item.status, submissionState, quoteStatus, customerName, customerContact, quantity, submittedAt, internalNote }
    })
    unique(materials, '珠材')
    unique(accessoryCategories, '配件分类')
    unique(accessories, '配件')
    unique(cords, '绳色')
    unique(inspirations, '灵感款')
    unique(designs, '顾客方案', 'code')

    const nextRevision = Number(readSettings().catalogRevision || 0) + 1
    db.exec('BEGIN')
    try {
      db.exec('DELETE FROM designs; DELETE FROM material_variants; DELETE FROM materials; DELETE FROM accessories; DELETE FROM accessory_categories; DELETE FROM cords; DELETE FROM inspirations; DELETE FROM settings;')
      const insertSetting = db.prepare('INSERT INTO settings (key, value_json) VALUES (?, ?)')
      for (const [key, value] of Object.entries(settings)) insertSetting.run(key, JSON.stringify(value))
      insertSetting.run('catalogRevision', JSON.stringify(nextRevision))
      const insertMaterial = db.prepare('INSERT INTO materials (id, name, price, photos_json, color_key, style_key, use_key, facet_values_json, description, stock, active, deleted, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      const insertVariant = db.prepare('INSERT INTO material_variants (material_id, bead_size, price, stock, active) VALUES (?, ?, ?, ?, ?)')
      materials.forEach((item) => {
        insertMaterial.run(item.id, item.name, item.variants[8].price, JSON.stringify(item.photos), item.colorKey, item.energyKey, item.elementKey, JSON.stringify(item.facetValues), item.description, item.variants[8].stock, item.active, item.deleted, item.sortOrder)
        materialSizes.forEach((size) => insertVariant.run(item.id, size, item.variants[size].price, item.variants[size].stock, item.variants[size].active ? 1 : 0))
      })
      const insertAccessoryCategory = db.prepare('INSERT INTO accessory_categories (id, name, deleted, sort_order) VALUES (?, ?, ?, ?)')
      accessoryCategories.forEach((item) => insertAccessoryCategory.run(item.id, item.name, item.deleted, item.sortOrder))
      const insertAccessory = db.prepare('INSERT INTO accessories (id, name, description, price, photos_json, stock, active, deleted, sort_order, category_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      accessories.forEach((item) => insertAccessory.run(item.id, item.name, item.description, item.price, JSON.stringify(item.photos), item.stock, item.active, item.deleted, item.sortOrder, item.categoryId))
      const insertCord = db.prepare('INSERT INTO cords (id, name, color, price, photos_json, stock, active, deleted, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      cords.forEach((item) => insertCord.run(item.id, item.name, item.color, item.price, JSON.stringify(item.photos), item.stock, item.active, item.deleted, item.sortOrder))
      const insertInspiration = db.prepare('INSERT INTO inspirations (id, name, hint, material_note, display_area, style_key, use_key, beads_json, bead_size, cord_id, photos_json, active, deleted, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      inspirations.forEach((item) => insertInspiration.run(item.id, item.name, item.hint, item.materialNote, item.displayArea, item.energyKey, item.elementKey, JSON.stringify(item.beads), item.beadSize, item.cordId, JSON.stringify(item.photos), item.active, item.deleted, item.sortOrder))
      const insertDesign = db.prepare('INSERT INTO designs (code, created_at, wrist, bead_size, beads_json, accessory_id, cord_id, note, reference_image, total_price, status, submission_state, quote_status, customer_name, customer_contact, quantity, submitted_at, internal_note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      designs.forEach((item) => insertDesign.run(item.code, item.createdAt, item.wrist, item.beadSize, JSON.stringify(item.beads), item.accessory, item.cord, item.note, item.referenceImage, item.totalPrice, item.status, item.submissionState, item.quoteStatus, item.customerName, item.customerContact, item.quantity, item.submittedAt, item.internalNote))
      db.exec('COMMIT')
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
    return { restored: true, materials: materials.length, accessoryCategories: accessoryCategories.length, accessories: accessories.length, cords: cords.length, designs: designs.length }
  }

  function mapDesign(row) {
    return {
      code: row.code, createdAt: row.created_at, wrist: row.wrist, beadSize: row.bead_size,
      beads: parseJson(row.beads_json, []), accessory: row.accessory_id, cord: row.cord_id,
      note: row.note, referenceImage: row.reference_image || '', totalPrice: row.total_price, status: row.status,
      submissionState: row.submission_state || 'legacy', quoteStatus: row.quote_status || 'estimated',
      customerName: row.customer_name || '', customerContact: row.customer_contact || '',
      quantity: row.quantity || 1, submittedAt: row.submitted_at || '', internalNote: row.internal_note || ''
    }
  }

  function getDesign(code) {
    const row = db.prepare('SELECT * FROM designs WHERE code = ?').get(code)
    return row ? mapDesign(row) : null
  }

  function listDesigns() {
    return db.prepare("SELECT * FROM designs WHERE submission_state IN ('submitted', 'legacy', 'archived') ORDER BY COALESCE(NULLIF(submitted_at, ''), created_at) DESC LIMIT 100").all().map(mapDesign)
  }

  function updateDesignStatus(code, status) {
    if (!allowedStatuses.has(status)) throw new Error('方案状态不受支持')
    const result = db.prepare('UPDATE designs SET status = ? WHERE code = ?').run(status, code)
    if (!result.changes) throw new Error('没有找到该方案')
    return getDesign(code)
  }

  function submitDesign(code, input) {
    const design = getDesign(code)
    if (!design) throw new Error('没有找到该方案')
    if (design.submissionState === 'archived') throw new Error('该方案已归档，无法重新提交')
    const customerName = text(input.customerName, '称呼', 40)
    const customerContact = text(input.customerContact, '联系方式', 120)
    const quantity = Number(input.quantity)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) throw new Error('数量必须是 1 至 999 的整数')
    const catalog = getAdminCatalog()
    const materialMap = new Map(catalog.materials.map((item) => [item.id, item]))
    const accessoryMap = new Map(catalog.accessories.map((item) => [item.id, item]))
    const cord = catalog.cords.find((item) => item.id === design.cord)
    const materialCounts = new Map()
    const accessoryCounts = new Map()
    design.beads.filter(Boolean).forEach((value) => {
      if (String(value).startsWith('accessory:')) {
        const id = String(value).slice('accessory:'.length)
        accessoryCounts.set(id, (accessoryCounts.get(id) || 0) + 1)
      } else {
        materialCounts.set(value, (materialCounts.get(value) || 0) + 1)
      }
    })
    if (design.accessory && design.accessory !== 'none') accessoryCounts.set(design.accessory, (accessoryCounts.get(design.accessory) || 0) + 1)
    for (const [id, count] of materialCounts) {
      const material = materialMap.get(id)
      const variant = material?.variants?.[design.beadSize]
      if (!material || material.deleted || !material.active) throw new Error('方案中有珠材已下架，请更换后再提交')
      if (!variant?.active) throw new Error(`方案中有珠材不支持 ${design.beadSize}mm，请更换后再提交`)
      if (count * quantity > variant.stock) throw new Error(`方案中的 ${design.beadSize}mm 珠材库存不足，请减少数量或更换珠材`)
    }
    for (const [id, count] of accessoryCounts) {
      const accessory = accessoryMap.get(id)
      if (!accessory || accessory.deleted || !accessory.active) throw new Error('方案中有配件已下架，请更换后再提交')
      if (count * quantity > accessory.stock) throw new Error('方案中的配件库存不足，请减少数量或更换配件')
    }
    if (!cord || cord.deleted || !cord.active) throw new Error('所选绳子已下架，请更换后再提交')
    if (quantity > cord.stock) throw new Error('所选绳子库存不足，请减少数量或更换绳子')
    const submittedAt = new Date().toISOString()
    db.prepare("UPDATE designs SET submission_state = 'submitted', customer_name = ?, customer_contact = ?, quantity = ?, submitted_at = ?, status = 'new' WHERE code = ?")
      .run(customerName, customerContact, quantity, submittedAt, code)
    return getDesign(code)
  }

  function createDesign(input) {
    const catalog = getCatalog()
    const wrist = Number(input.wrist)
    const beadSize = Number(input.beadSize)
    const beads = Array.isArray(input.beads) ? input.beads : []
    const placedBeads = beads.filter(Boolean)
    const note = typeof input.note === 'string' ? input.note.trim() : ''
    const referenceImage = String(input.referenceImage || '')
    const materialMap = new Map(catalog.materials.map((item) => [item.id, item]))
    const accessoryMap = new Map(catalog.accessories.map((item) => [item.id, item]))
    const cordMap = new Map(catalog.cords.map((item) => [item.id, item]))
    if (!Number.isFinite(wrist) || wrist < 13 || wrist > 20) throw new Error('手围不在可选范围内')
    if (![6, 8, 10].includes(beadSize)) throw new Error('珠径不受支持')
    const maxBeads = Math.max(1, Math.round((wrist * 10) / beadSize))
    const accessoryPrefix = 'accessory:'
    const materialIds = placedBeads.filter((itemId) => !String(itemId).startsWith(accessoryPrefix))
    const accessoryIds = placedBeads
      .filter((itemId) => String(itemId).startsWith(accessoryPrefix))
      .map((itemId) => String(itemId).slice(accessoryPrefix.length))
    const legacyAccessory = input.accessory && input.accessory !== 'none' ? String(input.accessory) : null
    if (materialIds.length < 1) throw new Error('请先添加至少一颗珠子')
    if (beads.length > maxBeads || placedBeads.length > maxBeads) throw new Error(`当前尺寸最多可使用 ${maxBeads} 个珠位`)
    if (materialIds.some((itemId) => !materialMap.has(itemId))) throw new Error('方案中包含已下架的珠材')
    if (materialIds.some((itemId) => !materialMap.get(itemId).variants?.[beadSize]?.active)) throw new Error(`方案中包含不支持 ${beadSize}mm 的珠材`)
    if (accessoryIds.some((itemId) => !accessoryMap.has(itemId) || itemId === 'none')) throw new Error('方案中包含已下架的配件')
    if (legacyAccessory && !accessoryMap.has(legacyAccessory)) throw new Error('配件不存在或已下架')
    if (!legacyAccessory && input.accessory && input.accessory !== 'none') throw new Error('配件不存在或已下架')
    if (!cordMap.has(input.cord)) throw new Error('绳色不存在或已下架')
    const materialCounts = materialIds.reduce((result, itemId) => result.set(itemId, (result.get(itemId) || 0) + 1), new Map())
    const accessoryCounts = accessoryIds.reduce((result, itemId) => result.set(itemId, (result.get(itemId) || 0) + 1), new Map())
    if (legacyAccessory) accessoryCounts.set(legacyAccessory, (accessoryCounts.get(legacyAccessory) || 0) + 1)
    if ([...materialCounts].some(([itemId, count]) => count > materialMap.get(itemId).variants[beadSize].stock)) throw new Error(`方案中的 ${beadSize}mm 珠材库存不足`)
    if ([...accessoryCounts].some(([itemId, count]) => count > accessoryMap.get(itemId).stock)) throw new Error('方案中的配件库存不足')
    if (cordMap.get(input.cord).stock < 1) throw new Error('所选绳子库存不足')
    if (note.length > 80) throw new Error('备注不能超过 80 个字')
    if (referenceImage && !/^\/uploads\/[a-f0-9-]+\.(?:png|jpg|webp)$/i.test(referenceImage)) throw new Error('参考图片地址不正确')
    const totalPrice = materialIds.reduce((sum, itemId) => sum + materialMap.get(itemId).variants[beadSize].price, 0)
      + accessoryIds.reduce((sum, itemId) => sum + accessoryMap.get(itemId).price, 0)
      + (legacyAccessory ? accessoryMap.get(legacyAccessory).price : 0)
      + cordMap.get(input.cord).price
      + Number(catalog.settings.craftPrices?.[beadSize] ?? 0)
    const now = new Date()
    const date = now.toISOString().slice(0, 10).replaceAll('-', '')
    let code
    for (let attempt = 0; attempt < 5; attempt += 1) {
      code = `PG-${date}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
      if (!db.prepare('SELECT 1 FROM designs WHERE code = ?').get(code)) break
    }
    const quoteStatus = placedBeads.length === maxBeads ? 'estimated' : 'needs_confirmation'
    db.prepare(`INSERT INTO designs (code, created_at, wrist, bead_size, beads_json, accessory_id, cord_id, note, reference_image, total_price, submission_state, quote_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'saved', ?)`)
      .run(code, now.toISOString(), wrist, beadSize, JSON.stringify(beads), legacyAccessory || 'none', input.cord, note, referenceImage, totalPrice, quoteStatus)
    return getDesign(code)
  }

  return { addCatalogPhoto, addMaterialPhoto, clearAdminSessions, close: () => db.close(), createAccessoryCategory, createAdminSession, createBackup, createCatalogItem, createDesign, deleteAccessoryCategory, deleteAdminSession, deleteCatalogItem, getAdminCatalog, getAdminPasswordHash, getCatalog, getDesign, hasAdminSession, listDesigns, removeCatalogPhoto, removeMaterialPhoto, replaceCatalogPhoto, replaceMaterialPhoto, restoreBackup, setAdminPasswordHash, submitDesign, updateAccessoryCategory, updateCatalogItem, updateDesignStatus, updateSettings }
}
