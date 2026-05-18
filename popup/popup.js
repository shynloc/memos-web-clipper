// Memos Web Clipper — Popup Logic
;(async function () {
  'use strict'

  // ── DOM refs ──
  const setupView     = document.getElementById('setup-view')
  const mainView      = document.getElementById('main-view')
  const btnOpenSettings = document.getElementById('btn-open-settings')
  const btnSettings   = document.getElementById('btn-settings')
  const pageTitle     = document.getElementById('page-title')
  const pageUrl       = document.getElementById('page-url')
  const modePage      = document.getElementById('mode-page')
  const modeSelection = document.getElementById('mode-selection')
  const contentEditor = document.getElementById('content-editor')
  const tagsInput     = document.getElementById('tags-input')
  const visibilitySelect = document.getElementById('visibility-select')
  const btnSave       = document.getElementById('btn-save')
  const statusBar     = document.getElementById('status-bar')
  const statusMessage = document.getElementById('status-message')

  // ── State ──
  let config = {}        // { baseUrl, token, defaultVisibility, defaultTags }
  let pageData = null    // { title, url, mainHtml, selectedText, selectedHtml, meta }
  let markdownFull = ''  // 整页 Markdown
  let markdownSel = ''   // 选中文本 Markdown
  let currentMode = 'page'
  let currentLang = 'auto'

  // ── Turndown 配置 ──
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    strongDelimiter: '**',
    linkStyle: 'inlined',
  })

  // 改进：保留表格（Turndown 默认会丢弃）
  turndownService.addRule('tableKeep', {
    filter: ['table'],
    replacement: function (content, node) {
      try {
        const rows = node.querySelectorAll('tr')
        if (!rows.length) return content

        const lines = []
        rows.forEach((row, i) => {
          const cells = row.querySelectorAll('td, th')
          const line = '| ' + Array.from(cells).map(c => c.textContent.trim().replace(/\|/g, '\\|')).join(' | ') + ' |'
          lines.push(line)
          if (i === 0) {
            lines.push('| ' + Array.from(cells).map(() => '---').join(' | ') + ' |')
          }
        })
        return '\n\n' + lines.join('\n') + '\n\n'
      } catch {
        return content
      }
    },
  })

  // 跳过噪音图片：data URI、SVG、追踪像素、小图标
  turndownService.addRule('skipNoisyImages', {
    filter: function (node) {
      if (node.nodeName !== 'IMG') return false
      const src = node.getAttribute('src') || ''
      // 跳过 data URI（内联 SVG、GIF 占位符等）
      if (src.startsWith('data:')) return true
      // 跳过 SVG 文件
      if (src.endsWith('.svg') || src.includes('.svg?')) return true
      // 跳过追踪像素和极小图片
      const w = node.getAttribute('width')
      const h = node.getAttribute('height')
      if ((w && parseInt(w) < 10) || (h && parseInt(h) < 10)) return true
      // 跳过无 src 的图片
      if (!src) return true
      return false
    },
    replacement: function () { return '' },
  })

  // 跳过空链接（没有文字的 <a> 标签，通常是图标按钮）
  turndownService.addRule('skipEmptyLinks', {
    filter: function (node) {
      if (node.nodeName !== 'A') return false
      const text = node.textContent.trim()
      const hasImg = node.querySelector('img')
      return !text && !hasImg
    },
    replacement: function () { return '' },
  })

  // ── Image upload to Memos ──

  async function fetchImageAsBlob(imageUrl) {
    try {
      const res = await fetch(imageUrl)
      if (!res.ok) return null
      return await res.blob()
    } catch {
      return null
    }
  }

  function getFilenameFromUrl(url) {
    try {
      const pathname = new URL(url).pathname
      const name = decodeURIComponent(pathname.split('/').pop() || 'image')
      if (!name.includes('.')) return name + '.png'
      return name.replace(/[^a-zA-Z0-9._-]/g, '_')
    } catch {
      return 'image.png'
    }
  }

  async function uploadImageToMemos(imageUrl) {
    const blob = await fetchImageAsBlob(imageUrl)
    if (!blob) return null

    const filename = getFilenameFromUrl(imageUrl)
    const formData = new FormData()
    formData.append('file', blob, filename)

    try {
      const res = await fetch(`${config.baseUrl}/api/v1/resources`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.token}`,
        },
        body: formData,
      })
      if (!res.ok) return null

      const resource = await res.json()
      const uid = resource.uid || resource.name?.split('/').pop() || ''
      const fname = resource.filename || filename
      return `${config.baseUrl}/o/r/${uid}/${fname}`
    } catch {
      return null
    }
  }

  async function processImagesInMarkdown(markdown, onProgress) {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
    const matches = []
    let m

    while ((m = imageRegex.exec(markdown)) !== null) {
      const url = m[2]
      // Skip data URLs, already-uploaded Memos URLs, and non-http
      if (url.startsWith('data:') || url.includes('/o/r/')) continue
      if (!url.startsWith('http://') && !url.startsWith('https://')) continue
      matches.push({ full: m[0], alt: m[1], url: m[2] })
    }

    if (matches.length === 0) return markdown

    let result = markdown
    let uploaded = 0

    for (const img of matches) {
      uploaded++
      if (onProgress) onProgress(uploaded, matches.length)

      const newUrl = await uploadImageToMemos(img.url)
      if (newUrl) {
        result = result.replace(img.full, `![${img.alt}](${newUrl})`)
      }
      // If upload fails, keep original URL
    }

    return result
  }

  // ── Init ──
  config = await loadConfig()

  if (!config.baseUrl || !config.token) {
    showSetup()
  } else {
    showMain()
    await extractPage()
  }

  // Set up language
  currentLang = getActualLanguage(config.uiLanguage || 'auto')
  applyTranslations(currentLang)

  // ── Event listeners ──
  btnOpenSettings.addEventListener('click', openOptions)
  btnSettings.addEventListener('click', openOptions)

  modePage.addEventListener('click', () => switchMode('page'))
  modeSelection.addEventListener('click', () => {
    if (!modeSelection.disabled) switchMode('selection')
  })

  btnSave.addEventListener('click', handleSave)

  // ── Functions ──

  function showSetup() {
    setupView.style.display = 'flex'
    mainView.style.display = 'none'
  }

  function showMain() {
    setupView.style.display = 'none'
    mainView.style.display = 'block'

    // 应用默认设置
    if (config.defaultVisibility) {
      visibilitySelect.value = config.defaultVisibility
    }
    if (config.defaultTags) {
      tagsInput.value = config.defaultTags
    }
  }

  function openOptions() {
    chrome.runtime.openOptionsPage()
  }

  async function loadConfig() {
    return new Promise(resolve => {
      chrome.storage.local.get(
        ['memosBaseUrl', 'memosToken', 'defaultVisibility', 'defaultTags', 'uiLanguage'],
        (result) => {
          resolve({
            baseUrl: (result.memosBaseUrl || '').replace(/\/+$/, ''),
            token: result.memosToken || '',
            defaultVisibility: result.defaultVisibility || 'PRIVATE',
            defaultTags: result.defaultTags || '',
            uiLanguage: result.uiLanguage || 'auto'
          })
        }
      )
    })
  }

  async function extractPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab?.id) {
        pageTitle.textContent = t('err_extract', currentLang)
        return
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/content.js'],
      })

      if (!results?.[0]?.result) {
        pageTitle.textContent = t('err_extract', currentLang)
        return
      }

      pageData = results[0].result
      pageTitle.textContent = pageData.title || '(无标题)'
      pageUrl.textContent = pageData.url || ''

      // 转换 Markdown
      markdownFull = htmlToMarkdown(pageData.mainHtml, pageData)

      if (pageData.selectedText) {
        modeSelection.disabled = false
        markdownSel = pageData.selectedHtml
          ? htmlToMarkdown(pageData.selectedHtml, pageData)
          : pageData.selectedText
      }

      // 填充编辑器
      switchMode('page')
    } catch (err) {
      pageTitle.textContent = t('err_extract', currentLang)
      pageUrl.textContent = err.message
      console.error('[clipper] extract error:', err)
    }
  }

  function htmlToMarkdown(html, data) {
    if (!html) return ''
    try {
      let md = turndownService.turndown(html)
      md = cleanMarkdown(md)
      return formatTemplate(md, data)
    } catch (err) {
      console.error('[clipper] turndown error:', err)
      return html
    }
  }

  /**
   * 清理 Markdown 输出：
   * - 移除连续 3+ 空行 → 2 空行
   * - 移除只含空格/tab的行
   * - 移除孤立的 Markdown 标记（如单独一行的 * 或 -）
   * - 清理行尾空格
   */
  function cleanMarkdown(md) {
    return md
      // 移除行尾空格
      .replace(/[ \t]+$/gm, '')
      // 连续 3+ 空行 → 最多 2 空行
      .replace(/\n{4,}/g, '\n\n\n')
      // 移除只含 markdown 标记的孤立行（如单独的 *, -, >, **）
      .replace(/^\s*[\*\-\>]{1,3}\s*$/gm, '')
      // 移除开头的连续空行
      .replace(/^\n+/, '')
      // 移除末尾的连续空行
      .replace(/\n+$/, '')
  }

  function formatTemplate(content, data) {
    const now = new Date()
    const datetime = now.toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })

    const lines = []
    if (data.title) lines.push(`# ${data.title}`)
    lines.push('')
    lines.push(`> ${t('template_source', currentLang)} [${data.title || data.url}](${data.url})`)
    lines.push(`> ${t('template_time', currentLang)} ${datetime}`)
    lines.push('')
    lines.push(content.trim())

    return lines.join('\n')
  }

  function switchMode(mode) {
    currentMode = mode
    modePage.classList.toggle('active', mode === 'page')
    modeSelection.classList.toggle('active', mode === 'selection')

    if (mode === 'page') {
      contentEditor.value = markdownFull
    } else {
      contentEditor.value = markdownSel || markdownFull
    }
  }

  async function handleSave() {
    let content = buildFinalContent()
    if (!content.trim()) {
      showStatus('error', t('err_empty', currentLang))
      return
    }

    // 禁用按钮，显示加载态
    btnSave.disabled = true
    btnSave.querySelector('.btn-text').style.display = 'none'
    btnSave.querySelector('.btn-loading').style.display = 'inline-flex'

    try {
      // 上传图片到 Memos
      content = await processImagesInMarkdown(content, (current, total) => {
        showStatus('info', `${t('info_uploading', currentLang)} (${current}/${total})...`)
      })

      const visibility = visibilitySelect.value
      const res = await fetch(`${config.baseUrl}/api/v1/memos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          visibility: visibility,
        }),
      })

      if (!res.ok) {
        const errBody = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status}: ${errBody.slice(0, 200)}`)
      }

      const memo = await res.json()
      showStatus('success', t('success_save', currentLang))

      // 移除自动打开新标签页逻辑

      // 2 秒后自动关闭 popup
      setTimeout(() => window.close(), 2000)
    } catch (err) {
      console.error('[clipper] save error:', err)
      showStatus('error', `${t('err_save', currentLang)}${err.message}`)
    } finally {
      btnSave.disabled = false
      btnSave.querySelector('.btn-text').style.display = 'inline-flex'
      btnSave.querySelector('.btn-loading').style.display = 'none'
    }
  }

  function buildFinalContent() {
    let content = contentEditor.value || ''

    // 追加标签
    const tags = tagsInput.value.trim()
    if (tags) {
      const tagList = tags.split(/[\s,]+/).filter(Boolean).map(t => {
        return t.startsWith('#') ? t : `#${t}`
      })
      if (tagList.length) {
        content = content.trimEnd() + '\n\n' + tagList.join(' ')
      }
    }

    // 确保 #web-clip 标签存在
    if (!content.includes('#web-clip')) {
      content = content.trimEnd() + ' #web-clip'
    }

    return content
  }

  function showStatus(type, message) {
    statusBar.style.display = 'block'
    statusBar.className = `status-bar ${type}`
    statusMessage.textContent = message

    if (type === 'error') {
      setTimeout(() => {
        statusBar.style.display = 'none'
      }, 5000)
    }
  }
})()
