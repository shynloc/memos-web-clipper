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
  const uiLanguageInput    = document.getElementById('ui-language')

  let currentLang = 'auto'

  // ── Load existing config ──
  chrome.storage.local.get(
    ['memosBaseUrl', 'memosToken', 'defaultVisibility', 'defaultTags', 'uiLanguage'],
    (result) => {
      baseUrlInput.value      = result.memosBaseUrl || ''
      tokenInput.value        = result.memosToken || ''
      defaultVisibility.value = result.defaultVisibility || 'PRIVATE'
      defaultTags.value       = result.defaultTags || ''
      
      if (result.uiLanguage) {
        uiLanguageInput.value = result.uiLanguage
        currentLang = getActualLanguage(result.uiLanguage)
      } else {
        currentLang = getActualLanguage('auto')
      }
      
      applyTranslations(currentLang)
    }
  )

  // ── Language selection ──
  uiLanguageInput.addEventListener('change', () => {
    currentLang = getActualLanguage(uiLanguageInput.value)
    applyTranslations(currentLang)
  })

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
      showTestResult('error', t('opt_test_fail', currentLang))
      return
    }
    if (!token) {
      showTestResult('error', t('opt_test_fail', currentLang))
      return
    }

    btnTest.disabled = true
    btnTest.textContent = t('opt_testing', currentLang)

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
        showTestResult('success', `${t('opt_test_ok', currentLang)}${username ? ` (${username})` : ''}`)
      } else if (res.status === 401) {
        showTestResult('error', t('opt_test_err', currentLang))
      } else {
        showTestResult('error', `${t('opt_test_fail', currentLang)} (HTTP ${res.status})`)
      }
    } catch (err) {
      showTestResult('error', `${t('opt_test_fail', currentLang)}: ${err.message}`)
    } finally {
      btnTest.disabled = false
      btnTest.textContent = t('opt_test_btn', currentLang).replace('🔗 ', '') // icon is outside in HTML, but here we replace all text content. Let's just use original icon + translation
      btnTest.innerHTML = `🔗 <span data-i18n="opt_test_btn">${t('opt_test_btn', currentLang)}</span>`
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
      uiLanguage: uiLanguageInput.value,
    }

    if (!data.memosBaseUrl || !data.memosToken) {
      showSaveStatus('error', '❌ Error')
      return
    }

    chrome.storage.local.set(data, () => {
      showSaveStatus('success', t('opt_save_ok', currentLang))
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
