// Memos Web Clipper — Options Page Logic
;(function () {
  'use strict'

  const baseUrlInput       = document.getElementById('base-url')
  const tokenInput         = document.getElementById('access-token')
  const btnToggleToken     = document.getElementById('btn-toggle-token')
  const btnTest            = document.getElementById('btn-test')
  const testResult         = document.getElementById('test-result')
  const defaultVisibility  = document.getElementById('default-visibility')
  const defaultTags        = document.getElementById('default-tags')
  const btnSave            = document.getElementById('btn-save')
  const saveStatus         = document.getElementById('save-status')

  // ── Load existing config ──
  chrome.storage.local.get(
    ['memosBaseUrl', 'memosToken', 'defaultVisibility', 'defaultTags'],
    (result) => {
      baseUrlInput.value      = result.memosBaseUrl || ''
      tokenInput.value        = result.memosToken || ''
      defaultVisibility.value = result.defaultVisibility || 'PRIVATE'
      defaultTags.value       = result.defaultTags || ''
    }
  )

  // ── Toggle token visibility ──
  btnToggleToken.addEventListener('click', () => {
    const isPassword = tokenInput.type === 'password'
    tokenInput.type = isPassword ? 'text' : 'password'
    btnToggleToken.textContent = isPassword ? '🙈' : '👁️'
  })

  // ── Test connection ──
  btnTest.addEventListener('click', async () => {
    const baseUrl = baseUrlInput.value.trim().replace(/\/+$/, '')
    const token = tokenInput.value.trim()

    if (!baseUrl) {
      showTestResult('error', '❌ 请输入 Memos 服务器地址')
      return
    }
    if (!token) {
      showTestResult('error', '❌ 请输入 Access Token')
      return
    }

    btnTest.disabled = true
    btnTest.textContent = '⏳ 测试中…'

    try {
      // Memos v0.28+ AuthService.GetCurrentUser
      const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        const user = data.user || data
        const username = user.username || user.nickname || user.displayName || ''
        showTestResult('success', `✅ 连接成功${username ? `，欢迎 ${username}` : ''}！`)
      } else if (res.status === 401) {
        showTestResult('error', '❌ Token 无效或已过期，请重新生成')
      } else {
        showTestResult('error', `❌ 服务器返回 HTTP ${res.status}`)
      }
    } catch (err) {
      showTestResult('error', `❌ 无法连接到服务器: ${err.message}`)
    } finally {
      btnTest.disabled = false
      btnTest.textContent = '🔗 测试连接'
    }
  })

  function showTestResult(type, message) {
    testResult.style.display = 'block'
    testResult.className = `test-result ${type}`
    testResult.textContent = message
  }

  // ── Save settings ──
  btnSave.addEventListener('click', () => {
    const data = {
      memosBaseUrl: baseUrlInput.value.trim().replace(/\/+$/, ''),
      memosToken: tokenInput.value.trim(),
      defaultVisibility: defaultVisibility.value,
      defaultTags: defaultTags.value.trim(),
    }

    if (!data.memosBaseUrl) {
      showSaveStatus('error', '❌ 请输入服务器地址')
      return
    }

    if (!data.memosToken) {
      showSaveStatus('error', '❌ 请输入 Access Token')
      return
    }

    chrome.storage.local.set(data, () => {
      showSaveStatus('success', '✅ 设置已保存')
      setTimeout(() => {
        saveStatus.style.display = 'none'
      }, 3000)
    })
  })

  function showSaveStatus(type, message) {
    saveStatus.style.display = 'inline'
    saveStatus.className = `save-status ${type}`
    saveStatus.textContent = message
  }
})()
