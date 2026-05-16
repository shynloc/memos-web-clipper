// Memos Web Clipper — Content Script
// 注入到当前页面，提取页面信息和选中文本

(function () {
  'use strict'

  /**
   * 获取用户选中的文本（纯文本 + HTML）
   */
  function getSelection() {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      return { text: '', html: '' }
    }
    const range = sel.getRangeAt(0)
    const fragment = range.cloneContents()
    const wrapper = document.createElement('div')
    wrapper.appendChild(fragment)
    // 清理选中内容中的垃圾
    cleanNode(wrapper)
    return {
      text: sel.toString().trim(),
      html: wrapper.innerHTML,
    }
  }

  /**
   * 智能提取页面正文区域
   * 优先级：<article> > <main> > [role="main"] > 最大文本密度 div
   */
  function extractMainContent() {
    const candidates = [
      'article',
      '[role="article"]',
      'main',
      '[role="main"]',
      '.post-content',
      '.article-content',
      '.article-body',
      '.entry-content',
      '.post-body',
      '.blog-post',
      '.markdown-body',
      '.prose',
      '.content-body',
      '#article-content',
      '#post-content',
    ]

    for (const selector of candidates) {
      const el = document.querySelector(selector)
      if (el && el.innerText.trim().length > 100) {
        const clone = el.cloneNode(true)
        cleanNode(clone)
        return clone.innerHTML
      }
    }

    // Fallback: 找文本密度最大的容器
    return extractByTextDensity()
  }

  /**
   * 按文本密度找最佳内容容器
   */
  function extractByTextDensity() {
    const containers = document.querySelectorAll('div, section')
    let best = null
    let bestScore = 0

    for (const el of containers) {
      const text = el.innerText || ''
      const textLen = text.trim().length
      if (textLen < 200 || textLen > 50000) continue

      const htmlLen = el.innerHTML.length || 1
      const density = textLen / htmlLen
      const score = textLen * density

      if (score > bestScore) {
        bestScore = score
        best = el
      }
    }

    if (best) {
      const clone = best.cloneNode(true)
      cleanNode(clone)
      return clone.innerHTML
    }

    // 最终 fallback：body
    const clone = document.body.cloneNode(true)
    cleanNode(clone)
    return clone.innerHTML
  }

  /**
   * 深度清理 DOM 节点：移除所有非内容元素
   */
  function cleanNode(node) {
    // ── 第 1 步：移除绝对不需要的标签 ──
    const unwantedSelectors = [
      // 脚本/样式
      'script', 'style', 'noscript', 'link[rel="stylesheet"]',
      // 嵌入/媒体噪音
      'iframe', 'object', 'embed', 'applet',
      // SVG 图标（所有 SVG 一律移除，真正的内容图片用 <img>）
      'svg',
      // 交互元素
      'form', 'button', 'input', 'select', 'textarea', 'label',
      // 导航/布局
      'nav', 'header', 'footer', 'aside', 'menu', 'menuitem',
      // ARIA 角色
      '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
      '[role="complementary"]', '[role="search"]', '[role="menu"]',
      '[role="menubar"]', '[role="toolbar"]', '[role="dialog"]',
      '[role="alert"]', '[role="tooltip"]',
      // 常见噪音 class
      '.sidebar', '.side-bar', '.nav', '.navbar', '.navigation',
      '.menu', '.dropdown', '.breadcrumb', '.breadcrumbs',
      '.ad', '.ads', '.advertisement', '.adsbygoogle',
      '.comment', '.comments', '.comment-form', '.respond',
      '.social', '.share', '.sharing', '.social-share',
      '.related', '.related-posts', '.recommended',
      '.widget', '.widgets',
      '.cookie', '.cookie-banner', '.cookie-consent',
      '.popup', '.modal', '.overlay',
      '.toolbar', '.toolbox', '.tool-bar',
      '.toc', '.table-of-contents',
      '.author-bio', '.author-info',
      '.tags', '.tag-list', '.categories',
      '.pagination', '.pager', '.page-nav',
      '.newsletter', '.subscribe', '.signup',
      '.footer-content', '.site-footer',
      '.header-content', '.site-header',
    ]

    for (const sel of unwantedSelectors) {
      try {
        node.querySelectorAll(sel).forEach(el => el.remove())
      } catch { /* 忽略无效选择器 */ }
    }

    // ── 第 2 步：移除带有 data: URI 的图片（通常是内联 SVG/图标） ──
    node.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src') || ''
      // 移除 data URI 图片（通常是小图标、占位符）
      if (src.startsWith('data:image/svg') || src.startsWith('data:image/gif')) {
        img.remove()
        return
      }
      // 移除没有 src 的图片
      if (!src && !img.getAttribute('data-src') && !img.getAttribute('data-lazy-src')) {
        img.remove()
        return
      }
      // 尝试用 data-src / data-lazy-src 替换懒加载图片
      if (!src || src.includes('placeholder') || src.includes('data:image/gif')) {
        const lazySrc = img.getAttribute('data-src') ||
                        img.getAttribute('data-lazy-src') ||
                        img.getAttribute('data-original')
        if (lazySrc) {
          img.setAttribute('src', lazySrc)
        }
      }
    })

    // ── 第 3 步：移除空的行内容器和装饰性 span ──
    node.querySelectorAll('span, div, section').forEach(el => {
      // 如果元素没有文本也没有 img，移除
      if (!el.querySelector('img') && !el.textContent.trim()) {
        el.remove()
      }
    })

    // ── 第 4 步：清理属性，只保留语义相关的 ──
    node.querySelectorAll('*').forEach(el => {
      // 保留的属性白名单
      const keep = ['href', 'src', 'alt', 'title', 'colspan', 'rowspan', 'data-src']
      const attrs = Array.from(el.attributes || [])
      for (const attr of attrs) {
        if (!keep.includes(attr.name)) {
          el.removeAttribute(attr.name)
        }
      }
    })
  }

  /**
   * 提取页面 meta 信息
   */
  function getPageMeta() {
    const getMeta = (name) => {
      const el = document.querySelector(
        `meta[name="${name}"], meta[property="${name}"], meta[property="og:${name}"]`
      )
      return el ? el.getAttribute('content') || '' : ''
    }

    return {
      description: getMeta('description') || getMeta('og:description'),
      author: getMeta('author') || getMeta('article:author'),
      siteName: getMeta('og:site_name') || window.location.hostname,
      image: getMeta('og:image') || getMeta('twitter:image'),
      publishedTime: getMeta('article:published_time') || getMeta('date'),
    }
  }

  // 执行并返回结果
  const selection = getSelection()
  const mainHtml = extractMainContent()
  const meta = getPageMeta()

  return {
    title: document.title || '',
    url: window.location.href,
    mainHtml: mainHtml,
    selectedText: selection.text,
    selectedHtml: selection.html,
    meta: meta,
  }
})()
