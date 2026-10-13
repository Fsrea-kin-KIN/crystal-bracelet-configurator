const form = document.getElementById('loginForm')
const passwordInput = document.getElementById('password')
const confirmField = document.getElementById('confirmField')
const confirmInput = document.getElementById('confirmPassword')
const errorTarget = document.getElementById('loginError')
const button = document.getElementById('loginButton')
let setupMode = false

function showError(message) {
  errorTarget.textContent = message
}

async function readResponse(response) {
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || '操作失败')
  return result
}

async function applyBrand() {
  try {
    const response = await fetch('/api/catalog')
    if (!response.ok) return
    const catalog = await response.json()
    const brandName = catalog.settings?.brandName || '手链定制'
    document.title = `${brandName} · 商家后台登录`
    document.querySelector('.login-brand span').textContent = brandName.slice(0, 1)
    document.querySelector('.login-brand strong').textContent = brandName
  } catch {}
}

async function initialize() {
  await applyBrand()
  try {
    const status = await readResponse(await fetch('/api/admin/auth/status'))
    if (status.authenticated) { location.replace('/admin.html'); return }
    setupMode = !status.configured
    if (setupMode) {
      document.getElementById('loginEyebrow').textContent = '首次使用'
      document.getElementById('loginTitle').textContent = '设置后台密码'
      document.getElementById('loginCopy').textContent = '用于保护商品、图片和顾客方案。请设置至少 8 个字符的密码。'
      document.getElementById('passwordLabel').textContent = '设置密码'
      passwordInput.autocomplete = 'new-password'
      confirmField.hidden = false
      confirmInput.disabled = false
      confirmInput.required = true
      button.textContent = '设置并进入后台'
    }
  } catch (error) { showError(error.message) }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  showError('')
  if (setupMode && passwordInput.value !== confirmInput.value) { showError('两次输入的密码不一致'); return }
  button.disabled = true
  try {
    const endpoint = setupMode ? '/api/admin/auth/setup' : '/api/admin/auth/login'
    await readResponse(await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: passwordInput.value, remember: document.getElementById('rememberLogin').checked })
    }))
    location.replace('/admin.html')
  } catch (error) { showError(error.message) }
  finally { button.disabled = false }
})

initialize()
