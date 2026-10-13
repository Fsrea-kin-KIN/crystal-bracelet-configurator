import { randomBytes, scrypt } from 'node:crypto'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { emitKeypressEvents } from 'node:readline'
import { fileURLToPath } from 'node:url'

const defaultDatabasePath = process.env.BRACELET_DB_PATH || resolve(import.meta.dirname, 'data', 'bracelet.db')

function readHidden(prompt) {
  if (!process.stdin.isTTY) throw new Error('请双击“重置商家后台密码.cmd”运行')
  return new Promise((resolveInput) => {
    let value = ''
    process.stdout.write(prompt)
    emitKeypressEvents(process.stdin)
    process.stdin.setRawMode(true)
    const onKeypress = (character, key) => {
      if (key?.ctrl && key.name === 'c') {
        process.stdin.setRawMode(false)
        process.stdin.off('keypress', onKeypress)
        process.stdout.write('\n')
        process.exit(1)
      }
      if (key?.name === 'return') {
        process.stdin.setRawMode(false)
        process.stdin.off('keypress', onKeypress)
        process.stdout.write('\n')
        resolveInput(value)
        return
      }
      if (key?.name === 'backspace') {
        if (value) { value = value.slice(0, -1); process.stdout.write('\b \b') }
        return
      }
      if (!key?.ctrl && !key?.meta && character) {
        value += character
        process.stdout.write('*')
      }
    }
    process.stdin.on('keypress', onKeypress)
  })
}

function hashPassword(value, salt) {
  return new Promise((resolveHash, reject) => {
    scrypt(value, salt, 64, (error, result) => error ? reject(error) : resolveHash(result))
  })
}

async function main() {
  if (!existsSync(defaultDatabasePath)) throw new Error('还没有找到商家数据，请先启动一次工具')
  console.log('重置商家后台密码')
  console.log('新密码至少需要 8 个字符。输入时只显示星号。\n')
  const first = await readHidden('请输入新密码：')
  if (first.length < 8 || first.length > 128 || !first.trim()) throw new Error('密码需要 8 至 128 个字符')
  const second = await readHidden('请再次输入：')
  if (first !== second) throw new Error('两次输入的密码不一致')
  await resetAdminPassword(defaultDatabasePath, first)
  console.log('\n密码已重置。请使用新密码登录商家后台。')
}

export async function resetAdminPassword(databasePath, newPassword) {
  if (String(newPassword).length < 8 || String(newPassword).length > 128 || !String(newPassword).trim()) throw new Error('密码需要 8 至 128 个字符')
  const salt = randomBytes(16)
  const hash = await hashPassword(String(newPassword), salt)
  const stored = `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`
  const db = new DatabaseSync(databasePath)
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS admin_auth (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS admin_sessions (token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);
    `)
    db.exec('BEGIN')
    db.prepare("INSERT INTO admin_auth (key, value) VALUES ('password_hash', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(stored)
    db.prepare('DELETE FROM admin_sessions').run()
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  } finally {
    db.close()
  }
  return stored
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main().catch((error) => {
    console.error(`\n重置失败：${error.message}`)
    process.exitCode = 1
  })
}
