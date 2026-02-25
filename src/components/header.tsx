'use client'

import { useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { isAuthorizedUser } from '@/lib/config'
import { useTheme } from '@/components/theme-provider'
import { useI18n } from '@/components/i18n-provider'
import { SearchModal } from '@/components/search-modal'
import { siteConfig } from '../../config'

export function Header() {
  const { data: session } = useSession()
  const { theme, toggleTheme } = useTheme()
  const { locale, setLocale, t } = useI18n()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const isAuthorized = session?.user?.login && isAuthorizedUser(session.user.login)

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'zh' : 'en')
  }

  return (
    <>
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-xl font-bold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300">
              {siteConfig.favicon.type === 'emoji' ? (
                <span className="text-xl sm:text-2xl">{siteConfig.favicon.value}</span>
              ) : siteConfig.favicon.type === 'svg' ? (
                <div dangerouslySetInnerHTML={{ __html: siteConfig.favicon.value }} className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <img src={siteConfig.favicon.value} alt="logo" className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
              <span className="hidden sm:inline">{t('siteName')}</span>
              <span className="sm:hidden">{t('siteName').slice(0, 4)}</span>
            </Link>
            
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
              title={t('search')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs">{t('search')}...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-xs rounded bg-gray-200 dark:bg-gray-700">⌘K</kbd>
            </button>
            
            {/* Language Toggle */}
            <button
              onClick={toggleLocale}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
              title={t('switchLanguage')}
            >
              {siteConfig.localeNames[locale]}
            </button>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={theme === 'light' ? t('switchToDark') : t('switchToLight')}
            >
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24">
                  <path fill="#ea580c" d="M21 11v-1h1V9h1V7h-3V6h-2V4h-1V1h-2v1h-1v1h-1v1h-2V3h-1V2H9V1H7v3H6v2H4v1H1v2h1v1h1v1h1v2H3v1H2v1H1v2h3v1h2v2h1v3h2v-1h1v-1h1v-1h2v1h1v1h1v1h2v-3h1v-2h2v-1h3v-2h-1v-1h-1v-1h-1v-2zm-2 2v1h1v1h1v1h-3v1h-1v1h-1v3h-1v-1h-1v-1h-1v-1h-2v1h-1v1H9v1H8v-3H7v-1H6v-1H3v-1h1v-1h1v-1h1v-2H5v-1H4V9H3V8h3V7h1V6h1V3h1v1h1v1h1v1h2V5h1V4h1V3h1v2h1v2h1v1h3v1h-1v1h-1v1h-1v2z"/>
                  <path fill="#ea580c" d="M16 10V9h-1V8h-1V7h-4v1H9v1H8v1H7v4h1v1h1v1h1v1h4v-1h1v-1h1v-1h1v-4zm-1 4h-1v1h-4v-1H9v-4h1V9h4v1h1z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className="sm:w-6 sm:h-6" viewBox="0 0 24 24">
                  <path fill="none" stroke="#0284c7" strokeDasharray="56" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 6c0 6.08 4.92 11 11 11c0.53 0 1.05 -0.04 1.56 -0.11c-1.61 2.47 -4.39 4.11 -7.56 4.11c-4.97 0 -9 -4.03 -9 -9c0 -3.17 1.64 -5.95 4.11 -7.56c-0.07 0.51 -0.11 1.03 -0.11 1.56Z">
                    <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="56;0"/>
                  </path>
                  <g fill="#0284c7">
                    <path d="M15.22 6.03l2.53 -1.94l-3.19 -0.09l-1.06 -3l-1.06 3l-3.19 0.09l2.53 1.94l-0.91 3.06l2.63 -1.81l2.63 1.81l-0.91 -3.06Z" opacity="0">
                      <animate fill="freeze" attributeName="opacity" begin="0.7s" dur="0.4s" to="1"/>
                    </path>
                    <path d="M19.61 12.25l1.64 -1.25l-2.06 -0.05l-0.69 -1.95l-0.69 1.95l-2.06 0.05l1.64 1.25l-0.59 1.98l1.7 -1.17l1.7 1.17l-0.59 -1.98Z" opacity="0">
                      <animate fill="freeze" attributeName="opacity" begin="1.1s" dur="0.4s" to="1"/>
                    </path>
                  </g>
                </svg>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={t('search')}
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {session ? (
              <>
                {isAuthorized && (
                  <Link
                    href="/new"
                    className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
                  >
                    <span className="sm:hidden">{t('newSnippetShort')}</span>
                    <span className="hidden sm:inline">{t('newSnippet')}</span>
                  </Link>
                )}
                <div className="flex items-center gap-2 sm:gap-3">
                  {session.user?.image && (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || ''} 
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-300 hidden md:inline">
                    {session.user?.login}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 whitespace-nowrap"
                  >
                    <span className="sm:hidden">{t('signOutShort')}</span>
                    <span className="hidden sm:inline">{t('signOut')}</span>
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => signIn('github')}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span className="hidden sm:inline">{t('signIn')}</span>
                <span className="sm:hidden">{t('signInShort')}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}
