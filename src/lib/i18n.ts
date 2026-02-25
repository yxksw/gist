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
    copied: 'Copied!',

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

    // Search
    search: 'Search',
    searchPlaceholder: 'Search snippets...',
    noSearchResults: 'No results found',
    searchHint: 'Type to search snippets',
    searchPoweredBy: 'Powered by Pagefind',
    navigate: 'navigate',
    select: 'select',
    loading: 'Loading...',

    // Pagination
    previous: 'Previous',
    next: 'Next',

    // 404
    pageNotFound: 'Page Not Found',
    pageNotFoundDesc: 'Sorry, the page you are looking for does not exist or has been removed.',
    backToHome: 'Back to Home',

    // Revisions
    revisions: 'Revisions',
    revisionsCount: '{count} revisions',
    backToSnippet: 'Back to Snippet',
    backToRevisions: 'Back to Revisions',
    viewDiff: 'View Diff',
    view: 'View',
    noRevisions: 'No revisions yet',
    added: 'Added',
    deleted: 'Deleted',
    modified: 'Modified',
    revisionNotFound: 'Revision not found',
    historicalVersion: 'Historical Version',
    viewCurrentVersion: 'View Current Version',
    diffNotFound: 'Diff not found',
    renamed: 'Renamed',
    fileAddedNoContent: 'File added (no content to display)',
    fileDeletedNoContent: 'File deleted',
    binaryFile: 'Binary file',
    noChanges: 'No changes',
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
    copied: '已复制!',

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

    // Search
    search: '搜索',
    searchPlaceholder: '搜索代码片段...',
    noSearchResults: '未找到结果',
    searchHint: '输入关键词搜索',
    searchPoweredBy: '由 Pagefind 驱动',
    navigate: '导航',
    select: '选择',
    loading: '加载中...',

    // Pagination
    previous: '上一页',
    next: '下一页',

    // 404
    pageNotFound: '页面未找到',
    pageNotFoundDesc: '抱歉，您访问的页面不存在或已被移除。',
    backToHome: '返回首页',

    // Revisions
    revisions: '修订历史',
    revisionsCount: '{count} 个修订版本',
    backToSnippet: '返回片段',
    backToRevisions: '返回修订历史',
    viewDiff: '查看对比',
    view: '查看',
    noRevisions: '暂无修订历史',
    added: '添加',
    deleted: '删除',
    modified: '修改',
    revisionNotFound: '修订版本未找到',
    historicalVersion: '历史版本',
    viewCurrentVersion: '查看当前版本',
    diffNotFound: '对比数据未找到',
    renamed: '重命名',
    fileAddedNoContent: '文件已添加（无内容显示）',
    fileDeletedNoContent: '文件已删除',
    binaryFile: '二进制文件',
    noChanges: '没有变更',
  },
}

export type Translations = typeof translations.en

export function getTranslations(locale: Locale): Translations {
  return translations[locale] || translations[siteConfig.defaultLocale]
}
