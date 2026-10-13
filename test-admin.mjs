import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { createStore } from './store.mjs'
import { resetAdminPassword } from './reset-admin-password.mjs'

test('商家可以修改价格、上下架商品和店铺设置', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bracelet-admin-'))
  const store = createStore(join(directory, 'test.db'))
  try {
    store.updateCatalogItem('materials', 'moonstone', { name: '灰月光石', price: 18, active: true })
    store.updateCatalogItem('materials', 'rose', { active: false })
    store.updateCatalogItem('materials', 'bodhi', { active: false })
    store.updateCatalogItem('accessories', 'none', { active: false })
    store.updateCatalogItem('cords', 'clear', { active: false })
    store.updateSettings({
      brandName: '测试手作店',
      craftPrices: { 6: 40, 8: 60, 10: 80 },
      entryImages: { diy: '/uploads/diy.png', recommend: '/uploads/recommend.png', inspiration: '' },
      recommendationEnergyPrompt: '今天想获得怎样的陪伴？',
      recommendationElementPrompt: '想看看哪个五行方向？'
    })
    const admin = store.getAdminCatalog()
    assert.equal(admin.materials.find((item) => item.id === 'moonstone').price, 18)
    assert.equal(admin.materials.find((item) => item.id === 'rose').active, false)
    assert.equal(admin.materials.find((item) => item.id === 'bodhi').active, false)
    assert.equal(admin.accessories.find((item) => item.id === 'none').active, false)
    assert.equal(admin.cords.find((item) => item.id === 'clear').active, false)
    assert.equal(admin.settings.brandName, '测试手作店')
    assert.equal(admin.settings.entryImages.recommend, '/uploads/recommend.png')
    assert.equal(admin.settings.recommendationEnergyPrompt, '今天想获得怎样的陪伴？')
    assert.equal(admin.settings.recommendationElementPrompt, '想看看哪个五行方向？')
    assert.equal(store.getCatalog().materials.some((item) => item.id === 'rose'), false)
    assert.equal(store.getCatalog().materials.some((item) => item.id === 'bodhi'), false)
    assert.equal(store.getCatalog().accessories.some((item) => item.id === 'none'), false)
    assert.equal(store.getCatalog().cords.some((item) => item.id === 'clear'), false)
  } finally {
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

test('商家可以新增配件、绳色并管理珠材图片', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bracelet-catalog-manage-'))
  const store = createStore(join(directory, 'test.db'))
  try {
    const accessory = store.createCatalogItem('accessories', { name: '银色隔片', description: '小号', price: 6 })
    const cord = store.createCatalogItem('cords', { name: '浅紫', color: '#aa99cc' })
    const material = store.createCatalogItem('materials', { name: '新珠材', price: 12, colorKey: 'pink' })
    const withPhoto = store.addMaterialPhoto(material.id, '/uploads/first.png')
    const replaced = store.replaceMaterialPhoto(material.id, 0, '/uploads/second.png')
    const removed = store.removeMaterialPhoto(material.id, 0)
    const accessoryWithPhoto = store.addCatalogPhoto('accessories', accessory.id, '/uploads/accessory.png')
    assert.equal(accessory.name, '银色隔片')
    assert.equal(accessory.price, 6)
    assert.equal(accessory.stock, 100)
    assert.deepEqual(accessoryWithPhoto.photos, ['/uploads/accessory.png'])
    assert.equal(cord.name, '浅紫')
    assert.equal(cord.color, '#aa99cc')
    assert.equal(cord.stock, 100)
    assert.deepEqual(withPhoto.photos, ['/uploads/first.png'])
    assert.equal(replaced.removedPhoto, '/uploads/first.png')
    assert.deepEqual(replaced.item.photos, ['/uploads/second.png'])
    assert.equal(removed.removedPhoto, '/uploads/second.png')
    assert.deepEqual(removed.item.photos, [])
  } finally {
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

test('推荐内容可以绑定实际珠材、配件、珠径和绳子', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bracelet-inspiration-composition-'))
  const store = createStore(join(directory, 'test.db'))
  try {
    const alternateCord = store.createCatalogItem('cords', { name: '测试绳', color: '#667788', price: 2, stock: 10 })
    const inspiration = store.createCatalogItem('inspirations', {
      name: '清透通勤',
      hint: '可继续修改',
      displayArea: 'inspiration',
      energyKey: 'balance',
      elementKey: 'metal',
      beads: ['bodhi', 'bodhi', 'accessory:silver'],
      beadSize: 10,
      cordId: 'clear'
    })
    assert.deepEqual(inspiration.beads, ['bodhi', 'bodhi', 'accessory:silver'])
    assert.equal(inspiration.beadSize, 10)
    assert.equal(inspiration.cordId, 'clear')

    const updated = store.updateCatalogItem('inspirations', inspiration.id, {
      beads: ['rose', 'accessory:gold'],
      beadSize: 6,
      cordId: alternateCord.id
    })
    assert.deepEqual(updated.beads, ['rose', 'accessory:gold'])
    assert.equal(updated.beadSize, 6)
    assert.equal(updated.cordId, alternateCord.id)

    const publicItem = store.getCatalog().inspirations.find((item) => item.id === inspiration.id)
    assert.deepEqual(publicItem.beads, ['rose', 'accessory:gold'])
    assert.equal(publicItem.beadSize, 6)
    assert.equal(publicItem.cordId, alternateCord.id)
    const backupItem = store.createBackup().data.inspirations.find((item) => item.id === inspiration.id)
    assert.equal(backupItem.beadSize, 6)
    assert.equal(backupItem.cordId, alternateCord.id)
  } finally {
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

test('推荐内容可以调整展示顺序', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bracelet-inspiration-order-'))
  const store = createStore(join(directory, 'test.db'))
  try {
    const first = store.createCatalogItem('inspirations', { name: '第一款' })
    const second = store.createCatalogItem('inspirations', { name: '第二款' })
    assert.deepEqual(store.getCatalog().inspirations.map((item) => item.name), ['第一款', '第二款'])
    store.updateCatalogItem('inspirations', first.id, { sortOrder: second.sortOrder })
    store.updateCatalogItem('inspirations', second.id, { sortOrder: first.sortOrder })
    assert.deepEqual(store.getCatalog().inspirations.map((item) => item.name), ['第二款', '第一款'])
  } finally {
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

test('商家可以自定义能量分类且不能误删正在使用的分类', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bracelet-filter-options-'))
  const store = createStore(join(directory, 'test.db'))
  try {
    const settings = store.getAdminCatalog().settings
    const energyOptions = [...settings.energyOptions, { key: 'steady-energy', name: '沉稳陪伴', active: true }]
    store.updateSettings({ energyOptions })
    const material = store.createCatalogItem('materials', { name: '分类测试珠', price: 5, colorKey: 'gold', energyKey: 'steady-energy', elementKey: 'earth' })
    const inspiration = store.createCatalogItem('inspirations', { name: '分类测试推荐', energyKey: 'steady-energy', elementKey: 'earth' })
    assert.equal(material.energyKey, 'steady-energy')
    assert.equal(inspiration.elementKey, 'earth')
    assert.equal(store.getCatalog().settings.energyOptions.find((item) => item.key === 'steady-energy').name, '沉稳陪伴')
    assert.throws(() => store.updateSettings({ energyOptions: settings.energyOptions }), /仍被商品使用/)
    const renamed = energyOptions.map((item) => item.key === 'steady-energy' ? { ...item, name: '安稳陪伴', active: false } : item)
    store.updateSettings({ energyOptions: renamed })
    assert.deepEqual(store.getCatalog().settings.energyOptions.find((item) => item.key === 'steady-energy'), { key: 'steady-energy', name: '安稳陪伴', active: false })
  } finally {
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

test('商家可以自定义配件分类并把商品移动到分类中', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bracelet-accessory-categories-'))
  const store = createStore(join(directory, 'test.db'))
  try {
    const category = store.createAccessoryCategory({ name: '吊坠' })
    const accessory = store.createCatalogItem('accessories', { name: '月亮吊坠', description: '占用一个珠位', price: 28, stock: 12, categoryId: category.id })
    assert.equal(accessory.categoryId, category.id)
    assert.equal(store.getCatalog().accessoryCategories.find((item) => item.id === category.id).name, '吊坠')
    assert.equal(store.getCatalog().accessories.find((item) => item.id === accessory.id).categoryId, category.id)
    assert.throws(() => store.deleteAccessoryCategory(category.id), /先删除或移动/)
    store.updateCatalogItem('accessories', accessory.id, { categoryId: 'accessories' })
    store.updateAccessoryCategory(category.id, { name: '挂件' })
    assert.equal(store.getAdminCatalog().accessoryCategories.find((item) => item.id === category.id).name, '挂件')
    store.deleteAccessoryCategory(category.id)
    assert.equal(store.getCatalog().accessoryCategories.some((item) => item.id === category.id), false)
    assert.throws(() => store.deleteAccessoryCategory('accessories'), /不能删除/)
    const backup = store.createBackup()
    assert.equal(backup.version, 4)
    assert.ok(backup.data.accessoryCategories.some((item) => item.id === 'accessories'))
  } finally {
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

test('商家可以新增主珠分类方式并为珠材归类', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bracelet-material-facets-'))
  const store = createStore(join(directory, 'test.db'))
  try {
    const settings = store.getAdminCatalog().settings
    const materialFacets = [
      ...settings.materialFacets,
      {
        key: 'origin',
        name: '产地分类',
        active: true,
        options: [
          { key: 'domestic', name: '国内', active: true },
          { key: 'imported', name: '进口', active: true }
        ]
      }
    ]
    store.updateSettings({ materialFacets })
    store.updateCatalogItem('materials', 'clear', {
      facetValues: { 'material-type': 'crystal', origin: 'imported' }
    })

    const catalog = store.getCatalog()
    assert.equal(catalog.settings.materialFacets.find((item) => item.key === 'origin').name, '产地分类')
    assert.deepEqual(catalog.materials.find((item) => item.id === 'clear').facetValues, {
      'material-type': 'crystal',
      origin: 'imported'
    })

    const backup = store.createBackup()
    store.updateCatalogItem('materials', 'clear', {
      facetValues: { 'material-type': 'crystal', origin: 'domestic' }
    })
    store.restoreBackup(backup)
    assert.equal(store.getCatalog().materials.find((item) => item.id === 'clear').facetValues.origin, 'imported')
  } finally {
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

test('库存、绳子价格和商品软删除会约束新方案但保留旧方案', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bracelet-stock-'))
  const store = createStore(join(directory, 'test.db'))
  try {
    store.updateCatalogItem('materials', 'bodhi', { stock: 1 })
    store.updateCatalogItem('cords', 'clear', { price: 15, stock: 2 })
    const catalog = store.getCatalog()
    const material = catalog.materials.find((item) => item.id === 'bodhi')
    const craft = Number(catalog.settings.craftPrices[8])
    const design = store.createDesign({ wrist: 16, beadSize: 8, beads: ['bodhi'], accessory: 'none', cord: 'clear', note: '' })
    assert.equal(design.totalPrice, material.price + 15 + craft)
    assert.throws(
      () => store.createDesign({ wrist: 16, beadSize: 8, beads: ['bodhi', 'bodhi'], accessory: 'none', cord: 'clear', note: '' }),
      /珠材库存不足/
    )
    store.deleteCatalogItem('materials', 'bodhi')
    assert.equal(store.getCatalog().materials.some((item) => item.id === 'bodhi'), false)
    assert.equal(store.getAdminCatalog().materials.find((item) => item.id === 'bodhi').deleted, true)
    assert.deepEqual(store.getDesign(design.code).beads, ['bodhi'])
    assert.throws(
      () => store.createDesign({ wrist: 16, beadSize: 8, beads: ['bodhi'], accessory: 'none', cord: 'clear', note: '' }),
      /已下架/
    )
  } finally {
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

test('不同珠径使用各自的价格、库存和在售状态', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bracelet-variants-'))
  const store = createStore(join(directory, 'test.db'))
  try {
    store.updateCatalogItem('materials', 'bodhi', {
      variants: {
        6: { price: 3, stock: 1, active: true },
        8: { price: 8, stock: 2, active: true },
        10: { price: 15, stock: 9, active: false }
      }
    })
    const catalog = store.getCatalog()
    const craft = catalog.settings.craftPrices
    assert.equal(store.createDesign({ wrist: 16, beadSize: 6, beads: ['bodhi'], accessory: 'none', cord: 'clear', note: '' }).totalPrice, 3 + craft[6])
    assert.equal(store.createDesign({ wrist: 16, beadSize: 8, beads: ['bodhi'], accessory: 'none', cord: 'clear', note: '' }).totalPrice, 8 + craft[8])
    assert.throws(
      () => store.createDesign({ wrist: 16, beadSize: 6, beads: ['bodhi', 'bodhi'], accessory: 'none', cord: 'clear', note: '' }),
      /6mm 珠材库存不足/
    )
    assert.throws(
      () => store.createDesign({ wrist: 16, beadSize: 10, beads: ['bodhi'], accessory: 'none', cord: 'clear', note: '' }),
      /不支持 10mm/
    )
  } finally {
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

test('完整方案和灵感方案分别标记报价状态且保存不会进入商家列表', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bracelet-submission-'))
  const store = createStore(join(directory, 'test.db'))
  try {
    const incomplete = store.createDesign({ wrist: 16, beadSize: 8, beads: ['bodhi'], accessory: 'none', cord: 'clear', note: '' })
    const complete = store.createDesign({ wrist: 16, beadSize: 8, beads: Array(20).fill('bodhi'), accessory: 'none', cord: 'clear', note: '' })
    assert.equal(incomplete.quoteStatus, 'needs_confirmation')
    assert.equal(complete.quoteStatus, 'estimated')
    assert.equal(store.listDesigns().length, 0)
    const submitted = store.submitDesign(incomplete.code, { customerName: '小林', customerContact: 'wx-lin', quantity: 1 })
    assert.equal(submitted.submissionState, 'submitted')
    assert.equal(store.listDesigns().length, 1)
  } finally {
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

test('提交前会再次检查当前库存和在售状态', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bracelet-submit-check-'))
  const store = createStore(join(directory, 'test.db'))
  try {
    const design = store.createDesign({ wrist: 16, beadSize: 8, beads: ['bodhi'], accessory: 'none', cord: 'clear', note: '' })
    store.updateCatalogItem('materials', 'bodhi', { active: false })
    assert.throws(
      () => store.submitDesign(design.code, { customerName: '小林', customerContact: 'wx-lin', quantity: 1 }),
      /珠材已下架/
    )
    assert.equal(store.getDesign(design.code).submissionState, 'saved')
  } finally {
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

test('商家可以查看顾客方案并更新处理状态', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bracelet-designs-'))
  const store = createStore(join(directory, 'test.db'))
  try {
    const design = store.createDesign({ wrist: 16, beadSize: 8, beads: ['bodhi'], accessory: 'none', cord: 'clear', note: '请尽快联系' })
    assert.equal(store.listDesigns().length, 0)
    store.submitDesign(design.code, { customerName: '测试顾客', customerContact: 'wx-test', quantity: 2 })
    assert.equal(store.listDesigns().length, 1)
    assert.equal(store.listDesigns()[0].status, 'new')
    assert.equal(store.listDesigns()[0].customerName, '测试顾客')
    assert.equal(store.listDesigns()[0].quantity, 2)
    assert.equal(store.updateDesignStatus(design.code, 'contacted').status, 'contacted')
  } finally {
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

test('保持登录状态会跨服务重启保存且不进入业务备份', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bracelet-session-'))
  const database = join(directory, 'test.db')
  const tokenHash = 'a'.repeat(64)
  let store = createStore(database)
  try {
    store.createAdminSession(tokenHash, Date.now() + 60_000)
    assert.equal(store.hasAdminSession(tokenHash), true)
    assert.doesNotMatch(JSON.stringify(store.createBackup()), new RegExp(tokenHash))
    store.close()
    store = createStore(database)
    assert.equal(store.hasAdminSession(tokenHash), true)
    store.deleteAdminSession(tokenHash)
    assert.equal(store.hasAdminSession(tokenHash), false)
  } finally {
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

test('本机重置密码会清除旧会话且保留业务数据', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'bracelet-password-reset-'))
  const database = join(directory, 'test.db')
  let store = createStore(database)
  try {
    store.setAdminPasswordHash('old-password-hash')
    store.createAdminSession('b'.repeat(64), Date.now() + 60_000)
    const materialCount = store.getAdminCatalog().materials.length
    store.close()
    await resetAdminPassword(database, 'new-pass-123')
    store = createStore(database)
    assert.match(store.getAdminPasswordHash(), /^scrypt\$/)
    assert.notEqual(store.getAdminPasswordHash(), 'old-password-hash')
    assert.equal(store.hasAdminSession('b'.repeat(64)), false)
    assert.equal(store.getAdminCatalog().materials.length, materialCount)
  } finally {
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

test('空白商家版本不预置珠材但保留基础配置', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bracelet-empty-'))
  const store = createStore(join(directory, 'test.db'), { seedMode: 'empty' })
  try {
    const catalog = store.getCatalog()
    assert.equal(catalog.materials.length, 0)
    assert.ok(catalog.accessories.length > 0)
    assert.ok(catalog.cords.length > 0)
    const created = store.createCatalogItem('materials', { name: '商家珠材', price: 15, colorKey: 'blue' })
    assert.equal(created.name, '商家珠材')
    assert.equal(created.colorKey, 'blue')
  } finally {
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

test('完整备份可以覆盖恢复商品、设置和顾客方案', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bracelet-backup-'))
  const store = createStore(join(directory, 'test.db'))
  try {
    store.updateSettings({ brandName: '备份测试店', craftPrices: { 6: 10, 8: 20, 10: 30 } })
    store.updateCatalogItem('materials', 'rose', { active: false, price: 99 })
    const design = store.createDesign({ wrist: 16, beadSize: 8, beads: ['bodhi', 'accessory:silver'], accessory: 'none', cord: 'clear', note: '备份方案', referenceImage: '/uploads/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png' })
    store.updateDesignStatus(design.code, 'confirmed')
    const backup = store.createBackup()
    store.setAdminPasswordHash('scrypt$private-password-data')
    assert.doesNotMatch(JSON.stringify(store.createBackup()), /private-password-data/)

    store.updateSettings({ brandName: '已被修改', craftPrices: { 6: 1, 8: 1, 10: 1 } })
    store.updateCatalogItem('materials', 'rose', { active: true, price: 1 })
    const result = store.restoreBackup(backup)

    assert.equal(result.restored, true)
    assert.equal(store.getAdminCatalog().settings.brandName, '备份测试店')
    assert.equal(store.getAdminCatalog().materials.find((item) => item.id === 'rose').active, false)
    assert.equal(store.getAdminCatalog().materials.find((item) => item.id === 'rose').price, 99)
    assert.equal(store.getDesign(design.code).status, 'confirmed')
    assert.equal(store.getDesign(design.code).referenceImage, '/uploads/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.png')
  } finally {
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})

test('旧版备份会把统一价格库存迁移到三种珠径', () => {
  const directory = mkdtempSync(join(tmpdir(), 'bracelet-v1-backup-'))
  const store = createStore(join(directory, 'test.db'))
  try {
    const backup = store.createBackup()
    backup.version = 1
    backup.data.materials.forEach((item) => { delete item.variants })
    const target = backup.data.materials.find((item) => item.id === 'bodhi')
    target.price = 23
    target.stock = 7
    store.restoreBackup(backup)
    const restored = store.getAdminCatalog()
    const material = restored.materials.find((item) => item.id === 'bodhi')
    assert.deepEqual(material.variants, {
      6: { price: 23, stock: 7, active: true },
      8: { price: 23, stock: 7, active: true },
      10: { price: 23, stock: 7, active: true }
    })
    assert.equal(restored.settings.variantMigrationPending, true)
  } finally {
    store.close()
    rmSync(directory, { recursive: true, force: true })
  }
})
