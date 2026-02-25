import { siteConfig, Locale } from '../../config'

// Translation dictionary
export const translations = {
  en: {
    // Common
    siteName: siteConfig.name,
    siteTitle: siteConfig.title,
    siteDescription: siteConfig.description,
    
    // Header
    newSnippet: 'New Snippet',
    newSnippetShort: '+ New',
    signIn: 'Sign in with GitHub',
    signInShort: 'Login',
    signOut: 'Sign out',
    signOutShort: 'Logout',
    
    // Home
    allSnippets: 'All Snippets',
    noSnippets: 'No snippets yet',
    noSnippetsDesc: 'Sign in and create your first code snippet!',
    snippetCount: '{count} snippet(s)',
    
    // Snippet detail
    created: 'Created',
    updated: 'Updated',
    files: 'Files',
    public: 'Public',
    private: 'Private',
    download: 'Download',
    edit: 'Edit',
    viewFullSnippet: 'View full snippet',
    copy: 'Copy',
    
    // Editor
    newSnippetTitle: 'New Snippet',
    editSnippetTitle: 'Edit Snippet',
    title: 'Title',
    titleRequired: 'Title *',
    description: 'Description',
    language: 'Language',
    tags: 'Tags (comma separated)',
    code: 'Code',
    codeRequired: 'Code *',
    filename: 'Filename',
    filenameRequired: 'Filename *',
    addFile: '+ Add File',
    filesCount: 'Files ({count})',
    removeFile: 'Remove this file',
    createSnippet: 'Create Snippet',
    saveChanges: 'Save Changes',
    delete: 'Delete',
    cancel: 'Cancel',
    publicLabel: 'Public (visible to everyone)',
    saving: 'Saving...',
    
    // Errors
    errorTitleRequired: 'Title is required',
    errorFileRequired: 'At least one file with filename and code is required',
    errorDeleteConfirm: 'Are you sure you want to delete this snippet?',
    
    // Theme
    switchToDark: 'Switch to dark mode',
    switchToLight: 'Switch to light mode',
    
    // Language
    switchLanguage: 'Switch language',
  },
  zh: {
    // Common
    siteName: siteConfig.name,
    siteTitle: `${siteConfig.name} - 代码片段管理器`,
    siteDescription: '一个基于 GitHub 的自托管代码片段管理器',
    
    // Header
    newSnippet: '新建片段',
    newSnippetShort: '+ 新建',
    signIn: '使用 GitHub 登录',
    signInShort: '登录',
    signOut: '退出登录',
    signOutShort: '退出',
    
    // Home
    allSnippets: '所有片段',
    noSnippets: '暂无代码片段',
    noSnippetsDesc: '登录并创建你的第一个代码片段！',
    snippetCount: '{count} 个片段',
    
    // Snippet detail
    created: '创建于',
    updated: '更新于',
    files: '文件',
    public: '公开',
    private: '私有',
    download: '下载',
    edit: '编辑',
    viewFullSnippet: '查看完整片段',
    copy: '复制',
    
    // Editor
    newSnippetTitle: '新建片段',
    editSnippetTitle: '编辑片段',
    title: '标题',
    titleRequired: '标题 *',
    description: '描述',
    language: '语言',
    tags: '标签（用逗号分隔）',
    code: '代码',
    codeRequired: '代码 *',
    filename: '文件名',
    filenameRequired: '文件名 *',
    addFile: '+ 添加文件',
    filesCount: '文件 ({count})',
    removeFile: '删除此文件',
    createSnippet: '创建片段',
    saveChanges: '保存更改',
    delete: '删除',
    cancel: '取消',
    publicLabel: '公开（所有人可见）',
    saving: '保存中...',
    
    // Errors
    errorTitleRequired: '标题不能为空',
    errorFileRequired: '至少需要一个包含文件名和代码的文件',
    errorDeleteConfirm: '确定要删除此代码片段吗？',
    
    // Theme
    switchToDark: '切换到深色模式',
    switchToLight: '切换到浅色模式',
    
    // Language
    switchLanguage: '切换语言',
  },
}

export type Translations = typeof translations.en

export function getTranslations(locale: Locale): Translations {
  return translations[locale] || translations[siteConfig.defaultLocale]
}

export function t(key: keyof Translations, locale: Locale, params?: Record<string, string | number>): string {
  const translations = getTranslations(locale)
  let value = translations[key] || key
  
  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      value = value.replace(`{${paramKey}}`, String(paramValue))
    })
  }
  
  return value
}
