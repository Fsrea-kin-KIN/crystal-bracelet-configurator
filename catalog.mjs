export const catalogSeed = {
  settings: {
    brandName: '手链定制',
    cordSpec: '72号玉线 · 0.8 mm',
    craftPrices: { 6: 39, 8: 51, 10: 67 },
    entryImages: { diy: '', recommend: '', inspiration: '' },
    recommendationEnergyPrompt: '你此刻更想靠近哪种状态？',
    recommendationElementPrompt: '你想从哪个五行方向寻找搭配？',
    materialFacets: [
      {
        key: 'material-type', name: '珠材分类', active: true,
        options: [
          { key: 'crystal', name: '水晶', active: true },
          { key: 'agate', name: '玛瑙', active: true },
          { key: 'jade', name: '玉石', active: true },
          { key: 'amber', name: '琥珀', active: true },
          { key: 'wood', name: '木质', active: true },
          { key: 'other', name: '其他', active: true }
        ]
      }
    ],
    energyOptions: [
      { key: 'calm', name: '安定平静', active: true },
      { key: 'focus', name: '专注清晰', active: true },
      { key: 'confidence', name: '自信表达', active: true },
      { key: 'vitality', name: '活力行动', active: true },
      { key: 'balance', name: '平衡陪伴', active: true }
    ],
    elementOptions: [
      { key: 'metal', name: '金', active: true },
      { key: 'wood', name: '木', active: true },
      { key: 'water', name: '水', active: true },
      { key: 'fire', name: '火', active: true },
      { key: 'earth', name: '土', active: true }
    ],
    explorationTaxonomyVersion: 1
  },
  materials: [
    { id: 'bodhi', name: '白玉菩提根', price: 6, colorKey: 'white', photos: ['./assets/beads/white-bodhi.png', './assets/beads/white-bodhi-02.png', './assets/beads/white-bodhi-03.png', './assets/beads/white-bodhi-04.png', './assets/beads/white-bodhi-05.png'] },
    { id: 'clear', name: '白水晶', price: 8, colorKey: 'white', photos: ['./assets/beads/white-crystal-01.png', './assets/beads/white-crystal-02.png', './assets/beads/white-crystal-03.png', './assets/beads/white-crystal-04.png', './assets/beads/white-crystal-05.png'] },
    { id: 'moonstone', name: '冰种灰月光石', price: 14, colorKey: 'gray', photos: ['./assets/beads/gray-moonstone.png', './assets/beads/gray-moonstone-02.png', './assets/beads/gray-moonstone-03.png', './assets/beads/gray-moonstone-04.png', './assets/beads/gray-moonstone-05.png'] },
    { id: 'rose', name: '粉晶', price: 9, colorKey: 'pink', photos: ['./assets/beads/rose-quartz-01.png', './assets/beads/rose-quartz-02.png', './assets/beads/rose-quartz-03.png', './assets/beads/rose-quartz-04.png', './assets/beads/rose-quartz-05.png'] },
    { id: 'amethyst', name: '紫水晶', price: 11, colorKey: 'purple', photos: ['./assets/beads/amethyst-01.png', './assets/beads/amethyst-02.png', './assets/beads/amethyst-03.png', './assets/beads/amethyst-04.png'] },
    { id: 'aquamarine', name: '海蓝宝', price: 14, colorKey: 'blue', photos: ['./assets/beads/aquamarine-01.png', './assets/beads/aquamarine-02.png', './assets/beads/aquamarine-03.png', './assets/beads/aquamarine-04.png'] },
    { id: 'lapis', name: '青金石', price: 12, colorKey: 'blue', photos: ['./assets/beads/lapis-lazuli-01.png', './assets/beads/lapis-lazuli-02.png', './assets/beads/lapis-lazuli-03.png', './assets/beads/lapis-lazuli-04.png', './assets/beads/lapis-lazuli-05.png'] },
    { id: 'obsidian', name: '乌金黑曜石', price: 6, colorKey: 'black', photos: ['./assets/beads/black-obsidian.png', './assets/beads/black-obsidian-01.png'] },
    { id: 'silver-obsidian', name: '银曜石', price: 9, colorKey: 'black', photos: ['./assets/beads/silver-obsidian-01.png', './assets/beads/silver-obsidian-02.png', './assets/beads/silver-obsidian-03.png'] },
    { id: 'gold-obsidian', name: '金曜石', price: 11, colorKey: 'gold', photos: ['./assets/beads/gold-obsidian-01.png', './assets/beads/gold-obsidian-02.png', './assets/beads/gold-obsidian-03.png', './assets/beads/gold-obsidian-04.png', './assets/beads/gold-obsidian-05.png'] },
    { id: 'tiger', name: '金虎眼', price: 7, colorKey: 'gold', photos: ['./assets/beads/gold-tiger-eye-01.png', './assets/beads/gold-tiger-eye-02.png', './assets/beads/gold-tiger-eye-03.png', './assets/beads/gold-tiger-eye-04.png', './assets/beads/gold-tiger-eye-05.png'] },
    { id: 'cinnabar', name: '朱砂', price: 10, colorKey: 'red', photos: ['./assets/beads/cinnabar-01.png', './assets/beads/cinnabar-02.png', './assets/beads/cinnabar-03.png'] },
    { id: 'citrine', name: '黄水晶', price: 16, colorKey: 'gold', photos: [] },
    { id: 'rutilated', name: '金发晶', price: 18, colorKey: 'gold', photos: ['./assets/beads/gold-rutilated-01.png', './assets/beads/gold-rutilated-02.png', './assets/beads/gold-rutilated-03.png'] },
    { id: 'sandal', name: '檀木', price: 4, colorKey: 'gold', photos: [] }
  ],
  accessories: [
    { id: 'none', name: '不添加', description: '简洁耐看', price: 0 },
    { id: 'silver', name: '银色星芒', description: '银色配件', price: 38 },
    { id: 'gold', name: '暖金圆牌', description: '暖金配件', price: 48 }
  ],
  cords: [
    { id: 'clear', name: '透明白', color: '#d9d9d4' },
    { id: 'pink', name: '浅粉', color: '#d9899e' },
    { id: 'red', name: '酒红', color: '#9e2830' },
    { id: 'gold', name: '金棕', color: '#b88729' },
    { id: 'green', name: '墨绿', color: '#315f45' },
    { id: 'blue', name: '湖蓝', color: '#285a93' },
    { id: 'black', name: '黑色', color: '#202422' },
    { id: 'gray', name: '雾灰', color: '#737b7c' }
  ]
}
