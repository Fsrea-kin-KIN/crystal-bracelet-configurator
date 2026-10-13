import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, extname, relative, resolve } from 'node:path'
import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { createStore } from './store.mjs'

const root = fileURLToPath(new URL('.', import.meta.url))
const port = Number(process.env.PORT || 4181)
const databasePath = process.env.BRACELET_DB_PATH || resolve(root, 'data', 'bracelet.db')
const uploadsPath = resolve(dirname(databasePath), 'uploads')
const store = createStore(databasePath, { seedMode: process.env.BRACELET_SEED_MODE || 'empty' })
const authDisabled = process.env.BRACELET_DISABLE_AUTH === '1'
const loginAttempts = new Map()
const sessionCookie = 'puguang_admin_session'
const browserSessionLifetime = 12 * 60 * 60 * 1000
const rememberedSessionLifetime = 30 * 24 * 60 * 60 * 1000
const baseDiyHtml = readFileSync(resolve(root, 'diy.html'), 'utf8')
const baseAppJs = readFileSync(resolve(root, 'app.js'), 'utf8')
const liveAppJs = baseAppJs
  .replace("  const craft = 39 + (state.beadSize === 10 ? 28 : state.beadSize === 6 ? 0 : 12)", "  const craft = Number(window.__CATALOG__?.settings?.craftPrices?.[state.beadSize] ?? (39 + (state.beadSize === 10 ? 28 : state.beadSize === 6 ? 0 : 12)))")

const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp'
}

function sendJson(response, status, value, headers = {}) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers })
  response.end(JSON.stringify(value))
}

function redirect(response, location) {
  response.writeHead(302, { Location: location, 'Cache-Control': 'no-store' })
  response.end()
}

function password(value) {
  const result = String(value ?? '')
  if (result.length < 8 || result.length > 128 || !result.trim()) throw new Error('密码需要 8 至 128 个字符')
  return result
}

const scryptAsync = (value, salt) => new Promise((resolvePromise, reject) => {
  scrypt(value, salt, 64, (error, result) => error ? reject(error) : resolvePromise(result))
})

async function hashPassword(value) {
  const salt = randomBytes(16)
  const hash = await scryptAsync(value, salt)
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`
}

async function verifyPassword(value, stored) {
  const [, saltHex, hashHex] = String(stored || '').split('$')
  if (!saltHex || !hashHex) return false
  const expected = Buffer.from(hashHex, 'hex')
  const actual = await scryptAsync(String(value ?? ''), Buffer.from(saltHex, 'hex'))
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function cookies(request) {
  return Object.fromEntries(String(request.headers.cookie || '').split(';').map((entry) => entry.trim()).filter(Boolean).map((entry) => {
    const index = entry.indexOf('=')
    return index < 0 ? [entry, ''] : [entry.slice(0, index), decodeURIComponent(entry.slice(index + 1))]
  }))
}

function authenticated(request) {
  if (authDisabled) return true
  const token = cookies(request)[sessionCookie]
  return Boolean(token && store.hasAdminSession(createHash('sha256').update(token).digest('hex')))
}

function createSessionCookie(remember = false) {
  const token = randomBytes(32).toString('hex')
  const lifetime = remember ? rememberedSessionLifetime : browserSessionLifetime
  store.createAdminSession(createHash('sha256').update(token).digest('hex'), Date.now() + lifetime)
  const persistence = remember ? `; Max-Age=${Math.floor(lifetime / 1000)}` : ''
  return `${sessionCookie}=${token}; HttpOnly; SameSite=Strict; Path=/${persistence}`
}

function clearSession(request) {
  const token = cookies(request)[sessionCookie]
  if (token) store.deleteAdminSession(createHash('sha256').update(token).digest('hex'))
  return `${sessionCookie}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`
}

function loginAttemptKey(request) {
  return request.socket.remoteAddress || 'local'
}

function canAttemptLogin(request) {
  const key = loginAttemptKey(request)
  const current = loginAttempts.get(key)
  if (!current || current.resetAt < Date.now()) {
    loginAttempts.delete(key)
    return true
  }
  return current.count < 5
}

function recordFailedLogin(request) {
  const key = loginAttemptKey(request)
  const current = loginAttempts.get(key)
  loginAttempts.set(key, current && current.resetAt > Date.now()
    ? { count: current.count + 1, resetAt: current.resetAt }
    : { count: 1, resetAt: Date.now() + 10 * 60 * 1000 })
}

async function readJson(request, maxBytes = 100_000) {
  let body = ''
  for await (const chunk of request) {
    body += chunk
    if (body.length > maxBytes) throw new Error('请求内容过大')
  }
  try { return JSON.parse(body || '{}') } catch { throw new Error('请求内容格式不正确') }
}

function saveUploadedImage(input) {
  const match = String(input?.data || '').match(/^data:image\/(png|jpeg|webp);base64,([a-z0-9+/=]+)$/i)
  if (!match) throw new Error('仅支持 JPG、PNG 或 WebP 图片')
  const buffer = Buffer.from(match[2], 'base64')
  if (!buffer.length || buffer.length > 5 * 1024 * 1024) throw new Error('单张图片不能超过 5 MB')
  const valid = match[1].toLowerCase() === 'png'
    ? buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    : match[1].toLowerCase() === 'jpeg'
      ? buffer[0] === 0xff && buffer[1] === 0xd8 && buffer.at(-2) === 0xff && buffer.at(-1) === 0xd9
      : buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  if (!valid) throw new Error('图片文件内容无效')
  mkdirSync(uploadsPath, { recursive: true })
  const extension = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase()
  const filename = `${randomUUID()}.${extension}`
  writeFileSync(resolve(uploadsPath, filename), buffer, { flag: 'wx' })
  return `/uploads/${filename}`
}

function removeUploadedImage(photoPath) {
  const match = String(photoPath || '').match(/^\/uploads\/([a-f0-9-]+\.(?:png|jpg|webp))$/i)
  if (!match) return
  const file = resolve(uploadsPath, match[1])
  if (existsSync(file)) unlinkSync(file)
}

function backupWithImages() {
  const backup = store.createBackup()
  const includeImage = (photoPath) => {
    let file
    if (photoPath.startsWith('/uploads/')) file = resolve(uploadsPath, photoPath.slice('/uploads/'.length))
    else if (photoPath.startsWith('./assets/')) file = resolve(root, photoPath.slice(2))
    if (!file || !existsSync(file) || !statSync(file).isFile()) return { path: photoPath }
    const extension = extname(file).toLowerCase()
    const mime = extension === '.jpg' || extension === '.jpeg' ? 'jpeg' : extension.slice(1)
    if (!['png', 'jpeg', 'webp'].includes(mime)) return { path: photoPath }
    return { path: photoPath, data: `data:image/${mime};base64,${readFileSync(file).toString('base64')}` }
  }
  const includeImages = (item) => ({
    ...item,
    photos: item.photos.map(includeImage)
  })
  backup.data.materials = backup.data.materials.map(includeImages)
  backup.data.accessories = backup.data.accessories.map(includeImages)
  backup.data.cords = backup.data.cords.map(includeImages)
  backup.data.inspirations = (backup.data.inspirations || []).map(includeImages)
  backup.data.settings = {
    ...backup.data.settings,
    entryImages: Object.fromEntries(Object.entries(backup.data.settings.entryImages || {}).map(([key, photoPath]) => [key, includeImage(String(photoPath || ''))]))
  }
  backup.data.designs = backup.data.designs.map((item) => ({ ...item, referenceImage: item.referenceImage ? includeImage(item.referenceImage) : '' }))
  return backup
}

function prepareBackupForRestore(backup, savedPhotos) {
  if (!backup?.data || !Array.isArray(backup.data.materials)) return backup
  const restoreImage = (photo) => {
    if (typeof photo === 'string') return photo
    if (photo?.data) {
      const saved = saveUploadedImage({ data: photo.data })
      savedPhotos.push(saved)
      return saved
    }
    return String(photo?.path || '')
  }
  const restoreImages = (item) => ({
    ...item,
    photos: Array.isArray(item?.photos) ? item.photos.map(restoreImage) : item?.photos
  })
  return {
    ...backup,
    data: {
      ...backup.data,
      materials: backup.data.materials.map(restoreImages),
      accessories: Array.isArray(backup.data.accessories) ? backup.data.accessories.map(restoreImages) : backup.data.accessories,
      cords: Array.isArray(backup.data.cords) ? backup.data.cords.map(restoreImages) : backup.data.cords,
      inspirations: Array.isArray(backup.data.inspirations) ? backup.data.inspirations.map(restoreImages) : backup.data.inspirations,
      settings: {
        ...backup.data.settings,
        entryImages: Object.fromEntries(Object.entries(backup.data.settings?.entryImages || {}).map(([key, photo]) => [key, restoreImage(photo)]))
      },
      designs: Array.isArray(backup.data.designs) ? backup.data.designs.map((item) => ({ ...item, referenceImage: item.referenceImage ? restoreImage(item.referenceImage) : '' })) : backup.data.designs
    }
  }
}

function customerDiyHtml() {
  const catalog = store.getCatalog()
  const completeCatalog = store.getAdminCatalog()
  catalog.materials = completeCatalog.materials
  catalog.accessories = completeCatalog.accessories
  catalog.cords = completeCatalog.cords
  const serialized = JSON.stringify(catalog).replaceAll('<', '\\u003c')
  const revision = JSON.stringify(String(catalog.settings.catalogRevision || 1))
  const bootstrap = `<script>window.__CATALOG__=${serialized};if(localStorage.getItem('puguang-catalog-revision')!==${revision}){localStorage.setItem('puguang-catalog-revision',${revision})}</script>`
  return baseDiyHtml.replace(/<script src="\.\/app\.js(?:\?v=[^"]+)?"><\/script>/, (scriptTag) => `${bootstrap}\n    ${scriptTag}\n    <script src="./persistence.js?v=5"></script>`)
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', 'http://localhost')
  try {
    if (url.pathname === '/api/admin/auth/status' && request.method === 'GET') {
      return sendJson(response, 200, { configured: Boolean(store.getAdminPasswordHash()), authenticated: authenticated(request) })
    }
    if (url.pathname === '/api/admin/auth/setup' && request.method === 'POST') {
      if (store.getAdminPasswordHash()) return sendJson(response, 409, { error: '后台密码已经设置，请直接登录' })
      const input = await readJson(request)
      store.setAdminPasswordHash(await hashPassword(password(input.password)))
      return sendJson(response, 201, { authenticated: true }, { 'Set-Cookie': createSessionCookie(Boolean(input.remember)) })
    }
    if (url.pathname === '/api/admin/auth/login' && request.method === 'POST') {
      const stored = store.getAdminPasswordHash()
      if (!stored) return sendJson(response, 409, { error: '请先设置后台密码' })
      if (!canAttemptLogin(request)) return sendJson(response, 429, { error: '密码尝试次数过多，请 10 分钟后再试' })
      const input = await readJson(request)
      if (!await verifyPassword(input.password, stored)) {
        recordFailedLogin(request)
        return sendJson(response, 401, { error: '密码不正确' })
      }
      loginAttempts.delete(loginAttemptKey(request))
      return sendJson(response, 200, { authenticated: true }, { 'Set-Cookie': createSessionCookie(Boolean(input.remember)) })
    }
    if (url.pathname === '/api/admin/auth/logout' && request.method === 'POST') {
      return sendJson(response, 200, { authenticated: false }, { 'Set-Cookie': clearSession(request) })
    }
    if (url.pathname === '/api/admin/auth/change' && request.method === 'POST') {
      if (!authenticated(request)) return sendJson(response, 401, { error: '请先登录商家后台' })
      const input = await readJson(request)
      const stored = store.getAdminPasswordHash()
      if (!stored || !await verifyPassword(input.currentPassword, stored)) return sendJson(response, 400, { error: '当前密码不正确' })
      store.setAdminPasswordHash(await hashPassword(password(input.newPassword)))
      store.clearAdminSessions()
      return sendJson(response, 200, { authenticated: true }, { 'Set-Cookie': createSessionCookie(true) })
    }
    if (url.pathname.startsWith('/api/admin/') && !authenticated(request)) return sendJson(response, 401, { error: '请先登录商家后台' })
    if (url.pathname === '/admin.html' && !authenticated(request)) return redirect(response, '/admin-login.html')
    if (url.pathname === '/admin-login.html' && authenticated(request)) return redirect(response, '/admin.html')

    if (url.pathname === '/api/catalog' && request.method === 'GET') return sendJson(response, 200, store.getCatalog())
    if (url.pathname === '/api/designs' && request.method === 'POST') {
      const input = await readJson(request, 7_500_000)
      let uploadedReference = ''
      if (String(input.referenceImage || '').startsWith('data:')) {
        uploadedReference = saveUploadedImage({ data: input.referenceImage })
        input.referenceImage = uploadedReference
      } else if (input.referenceImage) {
        const match = String(input.referenceImage).match(/^\/uploads\/([a-f0-9-]+\.(?:png|jpg|webp))$/i)
        if (!match || !existsSync(resolve(uploadsPath, match[1]))) throw new Error('参考图片不存在，请重新选择')
      }
      try {
        return sendJson(response, 201, store.createDesign(input))
      } catch (error) {
        if (uploadedReference) removeUploadedImage(uploadedReference)
        throw error
      }
    }
    const designMatch = url.pathname.match(/^\/api\/designs\/([A-Z0-9-]+)$/i)
    if (designMatch && request.method === 'GET') return sendJson(response, store.getDesign(designMatch[1]) ? 200 : 404, store.getDesign(designMatch[1]) || { error: '没有找到该方案' })
    const submitDesignMatch = url.pathname.match(/^\/api\/designs\/([A-Z0-9-]+)\/submit$/i)
    if (submitDesignMatch && request.method === 'POST') return sendJson(response, 200, store.submitDesign(submitDesignMatch[1], await readJson(request)))

    if (url.pathname === '/api/admin/catalog' && request.method === 'GET') return sendJson(response, 200, store.getAdminCatalog())
    if (url.pathname === '/api/admin/designs' && request.method === 'GET') return sendJson(response, 200, store.listDesigns())
    if (url.pathname === '/api/admin/backup' && request.method === 'GET') return sendJson(response, 200, backupWithImages())
    if (url.pathname === '/api/admin/backup/restore' && request.method === 'POST') {
      const savedPhotos = []
      try {
        const backup = prepareBackupForRestore(await readJson(request, 100_000_000), savedPhotos)
        return sendJson(response, 200, store.restoreBackup(backup))
      } catch (error) {
        savedPhotos.forEach((photoPath) => {
          const file = resolve(uploadsPath, photoPath.slice('/uploads/'.length))
          if (existsSync(file)) unlinkSync(file)
        })
        throw error
      }
    }
    if (url.pathname === '/api/admin/settings' && request.method === 'PATCH') return sendJson(response, 200, store.updateSettings(await readJson(request)))
    const entryImageMatch = url.pathname.match(/^\/api\/admin\/settings\/entry-images\/(diy|recommend|inspiration)$/)
    if (entryImageMatch && request.method === 'POST') {
      const key = entryImageMatch[1]
      const current = store.getAdminCatalog().settings.entryImages || {}
      const photoPath = saveUploadedImage(await readJson(request, 7_500_000))
      try {
        const settings = store.updateSettings({ entryImages: { ...current, [key]: photoPath } })
        removeUploadedImage(current[key])
        return sendJson(response, 201, settings.entryImages)
      } catch (error) {
        removeUploadedImage(photoPath)
        throw error
      }
    }
    if (entryImageMatch && request.method === 'DELETE') {
      const key = entryImageMatch[1]
      const current = store.getAdminCatalog().settings.entryImages || {}
      const settings = store.updateSettings({ entryImages: { ...current, [key]: '' } })
      removeUploadedImage(current[key])
      return sendJson(response, 200, settings.entryImages)
    }
    if (url.pathname === '/api/admin/accessory-categories' && request.method === 'POST') return sendJson(response, 201, store.createAccessoryCategory(await readJson(request)))
    const categoryMatch = url.pathname.match(/^\/api\/admin\/accessory-categories\/([a-z0-9-]+)$/i)
    if (categoryMatch && request.method === 'PATCH') return sendJson(response, 200, store.updateAccessoryCategory(categoryMatch[1], await readJson(request)))
    if (categoryMatch && request.method === 'DELETE') return sendJson(response, 200, store.deleteAccessoryCategory(categoryMatch[1]))
    const createItemMatch = url.pathname.match(/^\/api\/admin\/(materials|accessories|cords|inspirations)$/i)
    if (createItemMatch && request.method === 'POST') return sendJson(response, 201, store.createCatalogItem(createItemMatch[1], await readJson(request)))
    const photoMatch = url.pathname.match(/^\/api\/admin\/(materials|accessories|cords|inspirations)\/([a-z0-9-]+)\/photos$/i)
    if (photoMatch && request.method === 'POST') {
      const photoPath = saveUploadedImage(await readJson(request, 7_500_000))
      try {
        return sendJson(response, 201, store.addCatalogPhoto(photoMatch[1], photoMatch[2], photoPath))
      } catch (error) {
        removeUploadedImage(photoPath)
        throw error
      }
    }
    const photoItemMatch = url.pathname.match(/^\/api\/admin\/(materials|accessories|cords|inspirations)\/([a-z0-9-]+)\/photos\/(\d+)$/i)
    if (photoItemMatch && request.method === 'PUT') {
      const photoPath = saveUploadedImage(await readJson(request, 7_500_000))
      try {
        const result = store.replaceCatalogPhoto(photoItemMatch[1], photoItemMatch[2], Number(photoItemMatch[3]), photoPath)
        removeUploadedImage(result.removedPhoto)
        return sendJson(response, 200, result.item)
      } catch (error) {
        removeUploadedImage(photoPath)
        throw error
      }
    }
    if (photoItemMatch && request.method === 'DELETE') {
      const result = store.removeCatalogPhoto(photoItemMatch[1], photoItemMatch[2], Number(photoItemMatch[3]))
      removeUploadedImage(result.removedPhoto)
      return sendJson(response, 200, result.item)
    }
    const itemMatch = url.pathname.match(/^\/api\/admin\/(materials|accessories|cords|inspirations)\/([a-z0-9-]+)$/i)
    if (itemMatch && request.method === 'PATCH') return sendJson(response, 200, store.updateCatalogItem(itemMatch[1], itemMatch[2], await readJson(request)))
    if (itemMatch && request.method === 'DELETE') return sendJson(response, 200, store.deleteCatalogItem(itemMatch[1], itemMatch[2]))
    const adminDesignMatch = url.pathname.match(/^\/api\/admin\/designs\/([A-Z0-9-]+)$/i)
    if (adminDesignMatch && request.method === 'PATCH') return sendJson(response, 200, store.updateDesignStatus(adminDesignMatch[1], (await readJson(request)).status))
    if (url.pathname.startsWith('/api/')) return sendJson(response, 404, { error: '接口不存在' })

    const requested = url.pathname === '/' ? 'index.html' : url.pathname.slice(1)
    if (requested === 'diy.html') {
      response.writeHead(200, { 'Content-Type': types['.html'], 'Cache-Control': 'no-store' })
      response.end(customerDiyHtml())
      return
    }
    if (requested === 'app.js') {
      response.writeHead(200, { 'Content-Type': types['.js'], 'Cache-Control': 'no-store' })
      response.end(liveAppJs)
      return
    }
    const uploadMatch = requested.match(/^uploads\/([a-f0-9-]+\.(?:png|jpg|webp))$/i)
    if (uploadMatch) {
      const file = resolve(uploadsPath, uploadMatch[1])
      if (!existsSync(file) || !statSync(file).isFile()) return response.writeHead(404).end('Not found')
      response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000, immutable' })
      createReadStream(file).pipe(response)
      return
    }
    const file = resolve(root, requested)
    const relativePath = relative(root, file)
    if (relativePath.startsWith('..') || relativePath.includes(':') || !existsSync(file) || !statSync(file).isFile()) {
      response.writeHead(404).end('Not found')
      return
    }
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' })
    createReadStream(file).pipe(response)
  } catch (error) {
    sendJson(response, 400, { error: error.message || '请求失败' })
  }
})

server.listen(port, '127.0.0.1', () => console.log(`Bracelet configurator: http://127.0.0.1:${port}`))
function shutdown() { server.close(() => { store.close(); process.exit(0) }) }
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
