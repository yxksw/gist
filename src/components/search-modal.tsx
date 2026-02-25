'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from './i18n-provider'
import { useTheme } from './theme-provider'

interface SearchResult {
  url: string
  title: string
  excerpt: string
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

// Pagefind type definition
type PagefindAPI = {
  search: (query: string) => Promise<{
    results: Array<{
      id: string
      data: () => Promise<{
        url: string
        meta: { title?: string }
        excerpt: string
      }>
    }>
  }>
}

declare global {
  interface Window {
    pagefind?: PagefindAPI
  }
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { t } = useI18n()
  const { theme } = useTheme()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pagefindLoaded, setPagefindLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const isDark = theme === 'dark'

  // Load pagefind
  useEffect(() => {
    if (typeof window === 'undefined') return

    const loadPagefind = async () => {
      if (!window.pagefind) {
        try {
          // Dynamically load pagefind script
          const script = document.createElement('script')
          script.src = '/pagefind/pagefind.js'
          script.type = 'text/javascript'
          script.async = true
          
          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve()
            script.onerror = () => reject()
            document.head.appendChild(script)
          })
          
          setPagefindLoaded(true)
        } catch (err) {
          console.error('Failed to load pagefind:', err)
        }
      } else {
        setPagefindLoaded(true)
      }
    }

    loadPagefind()
  }, [])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
      // Open search on Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Search function
  const performSearch = useCallback(async () => {
    if (!query.trim() || !window.pagefind) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const search = await window.pagefind.search(query)
      
      const searchResults = await Promise.all(
        search.results.slice(0, 10).map(async (result) => {
          const data = await result.data()
          return {
            url: data.url,
            title: data.meta?.title || data.url,
            excerpt: data.excerpt,
          }
        })
      )
      
      setResults(searchResults)
    } catch (err) {
      console.error('Search error:', err)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [query])

  useEffect(() => {
    if (!pagefindLoaded) return

    const timeoutId = setTimeout(performSearch, 300)
    return () => clearTimeout(timeoutId)
  }, [query, pagefindLoaded, performSearch])

  const handleResultClick = (url: string) => {
    router.push(url)
    onClose()
    setQuery('')
    setResults([])
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-2xl mx-4 rounded-lg shadow-2xl overflow-hidden ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Search input */}
        <div className={`flex items-center gap-3 px-4 py-3 border-b ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <svg className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className={`flex-1 bg-transparent outline-none text-base ${
              isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
            }`}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <kbd className={`hidden sm:inline-block px-2 py-1 text-xs rounded ${
            isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
          }`}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className={`max-h-96 overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {!pagefindLoaded ? (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <p>{t('loading')}</p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${
                isDark ? 'border-blue-500' : 'border-blue-600'
              }`} />
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y dark:divide-gray-700">
              {results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleResultClick(result.url)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    isDark ? 'text-gray-200' : 'text-gray-900'
                  }`}
                >
                  <h3 className="font-medium text-sm mb-1">{result.title}</h3>
                  <p 
                    className={`text-xs line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                    dangerouslySetInnerHTML={{ __html: result.excerpt }}
                  />
                </button>
              ))}
            </div>
          ) : query ? (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <p>{t('noSearchResults')}</p>
            </div>
          ) : (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <p>{t('searchHint')}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between px-4 py-2 text-xs border-t ${
          isDark ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'
        }`}>
          <span>{t('searchPoweredBy')}</span>
          <div className="flex items-center gap-2">
            <span>↑↓ {t('navigate')}</span>
            <span>↵ {t('select')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
