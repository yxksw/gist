// Site Configuration
// Modify this file to customize your site

export const siteConfig = {
  // Site basic info
  name: '异飨客の代码片段',
  title: '异飨客の代码片段 - 记录一些我收藏的代码片段',
  description: '一个静态部署，代码托管在Github的代码片段',
  
  // Favicon / Logo
  // Can be: emoji, SVG string, or URL to an image
  favicon: {
    type: 'emoji' as const, // 'emoji' | 'svg' | 'url'
    value: '📝', // Emoji character or SVG string or image URL
  },
  
  // Default language
  defaultLocale: 'zh' as const, // 'en' | 'zh'
  
  // Available languages
  locales: ['en', 'zh'] as const,
  
  // Language names for display
  localeNames: {
    en: 'English',
    zh: '中文',
  },
}

// Type definitions
export type Locale = typeof siteConfig.locales[number]
