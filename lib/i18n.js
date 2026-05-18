// Memos Web Clipper - i18n Dictionary and Helpers

const I18N_DICT = {
  en: {
    // Popup Setup
    'setup_title': 'Memos Web Clipper',
    'setup_desc': 'Clip web content to your Memos instance with one click',
    'setup_hint': 'First-time use requires configuring your Memos server address and access token',
    'setup_btn': '⚙️ Go to Settings',

    // Popup Main
    'header_title': 'Memos Clipper',
    'loading': 'Loading...',
    'mode_page': '📄 Full Page',
    'mode_selection': '✂️ Selection',
    'editor_placeholder': 'Clipped content will appear here...',
    'tags_placeholder': 'Add tags (separated by space)',
    'vis_private': '🔒 Private',
    'vis_protected': '👥 Protected',
    'vis_public': '🌐 Public',
    'btn_save': '💾 Save to Memos',
    'btn_saving': 'Saving...',
    'err_extract': 'Failed to extract content',
    'err_empty': '❌ Content is empty, cannot save',
    'err_save': '❌ Failed to save: ',
    'info_uploading': '⬆️ Uploading images',
    'success_save': '✅ Saved to Memos',
    'template_source': '📎 Source:',
    'template_time': '🕐 Clipped at:',

    // Options
    'opt_title': 'Memos Web Clipper',
    'opt_subtitle': 'Configure your Memos instance connection',
    'opt_server_label': 'Memos Server Address',
    'opt_server_ph': 'https://memos.example.com',
    'opt_server_hint': 'Your Memos instance URL, e.g., https://memos.jintao.co.uk',
    'opt_token_label': 'Access Token',
    'opt_token_ph': 'Get it from Memos Settings → My Account → Access Tokens',
    'opt_token_hint_pt1': 'In Memos dashboard:',
    'opt_token_hint_pt2': 'Settings',
    'opt_token_hint_pt3': 'My Account',
    'opt_token_hint_pt4': 'Access Tokens',
    'opt_token_hint_pt5': 'Create a new token',
    'opt_test_btn': '🔗 Test Connection',
    'opt_testing': '⏳ Testing...',
    'opt_test_ok': '✅ Connection successful',
    'opt_test_err': '❌ Invalid or expired token, please regenerate',
    'opt_test_fail': '❌ Connection failed',
    'opt_vis_label': 'Default Visibility',
    'opt_vis_private': '🔒 Private — Only visible to you',
    'opt_vis_protected': '👥 Protected — Visible to logged-in users',
    'opt_vis_public': '🌐 Public — Visible to everyone',
    'opt_tags_label': 'Default Tags',
    'opt_tags_ph': 'web-clip reading',
    'opt_tags_hint': 'Tags automatically added to every clip (space separated, no # needed)',
    'opt_lang_label': 'Language / 语言',
    'opt_lang_auto': 'Auto (System)',
    'opt_save_btn': '💾 Save Settings',
    'opt_save_ok': '✅ Settings saved',

    // Context Menu
    'menu_page': 'Clip Current Page to Memos',
    'menu_selection': 'Clip Selection to Memos',
  },
  zh: {
    // Popup Setup
    'setup_title': 'Memos Web Clipper',
    'setup_desc': '一键剪藏网页内容到你的 Memos 实例',
    'setup_hint': '首次使用需要配置 Memos 服务器地址和访问令牌',
    'setup_btn': '⚙️ 前往设置',

    // Popup Main
    'header_title': 'Memos Clipper',
    'loading': '加载中…',
    'mode_page': '📄 整页',
    'mode_selection': '✂️ 选中文本',
    'editor_placeholder': '剪藏内容将显示在这里…',
    'tags_placeholder': '添加标签（用空格分隔）',
    'vis_private': '🔒 私密',
    'vis_protected': '👥 受保护',
    'vis_public': '🌐 公开',
    'btn_save': '💾 保存到 Memos',
    'btn_saving': '保存中…',
    'err_extract': '提取失败',
    'err_empty': '❌ 内容为空，无法保存',
    'err_save': '❌ 保存失败: ',
    'info_uploading': '⬆️ 正在上传图片',
    'success_save': '✅ 已保存到 Memos',
    'template_source': '📎 来源:',
    'template_time': '🕐 剪藏时间:',

    // Options
    'opt_title': 'Memos Web Clipper',
    'opt_subtitle': '配置你的 Memos 实例连接',
    'opt_server_label': 'Memos 服务器地址',
    'opt_server_ph': 'https://memos.example.com',
    'opt_server_hint': '你的 Memos 实例 URL，例如 https://memos.jintao.co.uk',
    'opt_token_label': 'Access Token',
    'opt_token_ph': '从 Memos 设置 → 我的账号 → 访问令牌 获取',
    'opt_token_hint_pt1': '在 Memos 后台：',
    'opt_token_hint_pt2': '设置',
    'opt_token_hint_pt3': '我的账号',
    'opt_token_hint_pt4': '访问令牌',
    'opt_token_hint_pt5': '创建新的令牌',
    'opt_test_btn': '🔗 测试连接',
    'opt_testing': '⏳ 测试中…',
    'opt_test_ok': '✅ 连接成功',
    'opt_test_err': '❌ Token 无效或已过期，请重新生成',
    'opt_test_fail': '❌ 连接失败',
    'opt_vis_label': '默认可见性',
    'opt_vis_private': '🔒 私密 — 仅自己可见',
    'opt_vis_protected': '👥 受保护 — 登录用户可见',
    'opt_vis_public': '🌐 公开 — 所有人可见',
    'opt_tags_label': '默认标签',
    'opt_tags_ph': 'web-clip reading',
    'opt_tags_hint': '每次剪藏自动添加的标签（空格分隔，不需要 # 前缀）',
    'opt_lang_label': '语言 / Language',
    'opt_lang_auto': '自动 (跟随系统)',
    'opt_save_btn': '💾 保存设置',
    'opt_save_ok': '✅ 设置已保存',

    // Context Menu
    'menu_page': '剪藏当前页面到 Memos',
    'menu_selection': '剪藏选中文本到 Memos',
  }
}

/**
 * Determine actual language to use based on settings and browser
 */
function getActualLanguage(uiLangSetting) {
  if (uiLangSetting === 'en' || uiLangSetting === 'zh') {
    return uiLangSetting
  }
  // Auto detect
  const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase()
  if (browserLang.startsWith('zh')) return 'zh'
  return 'en'
}

/**
 * Get translation for a key
 */
function t(key, lang) {
  if (!I18N_DICT[lang]) return key
  return I18N_DICT[lang][key] || key
}

/**
 * Apply translations to DOM elements with data-i18n attributes
 */
function applyTranslations(lang) {
  document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en')
  
  const elements = document.querySelectorAll('[data-i18n]')
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n')
    const translated = t(key, lang)
    
    // Check if it's a placeholder
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      if (el.hasAttribute('placeholder')) {
        el.setAttribute('placeholder', translated)
      } else if (el.type === 'button') {
        el.value = translated
      }
    } else if (el.tagName === 'OPTION') {
      el.textContent = translated
    } else {
      // Preserve child elements (like icons) if they exist, or just replace text
      // We assume simple text content for most, except buttons with icons
      // For buttons with spans, we should apply data-i18n to the spans directly
      el.textContent = translated
    }
  })
}

// Export for module environments, but also accessible globally in extensions
if (typeof module !== 'undefined') {
  module.exports = { I18N_DICT, getActualLanguage, t, applyTranslations }
}
