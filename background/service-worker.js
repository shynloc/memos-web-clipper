// Memos Web Clipper — Service Worker (Background)
// 处理右键菜单和快捷键

// ── Context Menu ──

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'clip-selection',
    title: '剪藏选中文本到 Memos',
    contexts: ['selection'],
  })

  chrome.contextMenus.create({
    id: 'clip-page',
    title: '剪藏此页面到 Memos',
    contexts: ['page'],
  })
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return

  if (info.menuItemId === 'clip-selection' || info.menuItemId === 'clip-page') {
    // 打开 popup — MV3 中 contextMenu 无法直接打开 popup，
    // 改为注入内容脚本提取并直接保存
    try {
      const config = await loadConfig()
      if (!config.baseUrl || !config.token) {
        // 未配置：打开设置页
        chrome.runtime.openOptionsPage()
        return
      }

      // 提取页面内容
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/content.js'],
      })

      if (!results?.[0]?.result) return

      const pageData = results[0].result
      let content = ''

      if (info.menuItemId === 'clip-selection' && info.selectionText) {
        content = buildQuickClip(info.selectionText, pageData)
      } else {
        // 整页模式：用 popup 处理更好，这里做简易版
        content = buildQuickClip(null, pageData)
      }

      // 直接保存到 Memos
      const res = await fetch(`${config.baseUrl}/api/v1/memos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          visibility: config.defaultVisibility || 'PRIVATE',
        }),
      })

      if (res.ok) {
        const memo = await res.json()
        // Auto-open the created memo in a new tab
        const memoUid = memo.uid || memo.name?.replace('memos/', '') || ''
        if (memoUid) {
          chrome.tabs.create({ url: `${config.baseUrl}/m/${memoUid}`, active: false })
        }
        // Notify user
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: showNotification,
          args: ['✅ 已保存到 Memos'],
        })
      } else {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: showNotification,
          args: [`❌ 保存失败 (HTTP ${res.status})`],
        })
      }
    } catch (err) {
      console.error('[clipper] context menu error:', err)
    }
  }
})

// ── Helpers ──

function loadConfig() {
  return new Promise(resolve => {
    chrome.storage.local.get(
      ['memosBaseUrl', 'memosToken', 'defaultVisibility', 'defaultTags'],
      (result) => {
        resolve({
          baseUrl: (result.memosBaseUrl || '').replace(/\/+$/, ''),
          token: result.memosToken || '',
          defaultVisibility: result.defaultVisibility || 'PRIVATE',
          defaultTags: result.defaultTags || '',
        })
      }
    )
  })
}

function buildQuickClip(selectedText, pageData) {
  const now = new Date()
  const datetime = now.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })

  const lines = []

  if (selectedText) {
    // 选中文本模式：引用格式
    lines.push(`> ${selectedText.replace(/\n/g, '\n> ')}`)
    lines.push('')
    lines.push(`— [${pageData.title || pageData.url}](${pageData.url})`)
    lines.push(`🕐 ${datetime}`)
  } else {
    // 整页模式
    lines.push(`# ${pageData.title || '(无标题)'}`)
    lines.push('')
    lines.push(`> 📎 来源: [${pageData.title || pageData.url}](${pageData.url})`)
    lines.push(`> 🕐 剪藏时间: ${datetime}`)
    lines.push('')
    if (pageData.meta?.description) {
      lines.push(pageData.meta.description)
    }
  }

  lines.push('')
  lines.push('#web-clip')

  return lines.join('\n')
}

/**
 * 注入到页面中的通知函数（在页面 context 执行）
 */
function showNotification(message) {
  const el = document.createElement('div')
  el.textContent = message
  Object.assign(el.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: '2147483647',
    padding: '12px 20px',
    borderRadius: '8px',
    background: message.startsWith('✅')
      ? 'linear-gradient(135deg, #065f46, #064e3b)'
      : 'linear-gradient(135deg, #7f1d1d, #991b1b)',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    transition: 'all 0.3s ease',
    opacity: '0',
    transform: 'translateY(-10px)',
  })
  document.body.appendChild(el)

  // Animate in
  requestAnimationFrame(() => {
    el.style.opacity = '1'
    el.style.transform = 'translateY(0)'
  })

  // Auto-remove
  setTimeout(() => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(-10px)'
    setTimeout(() => el.remove(), 300)
  }, 2500)
}
