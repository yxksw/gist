'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Snippet } from '@/lib/github'
import { SnippetFiles } from '@/components/snippet-files'
import { useI18n } from '@/components/i18n-provider'
import { useTheme } from '@/components/theme-provider'

export default function RevisionViewPage() {
  const params = useParams()
  const { t } = useI18n()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const id = params.id as string
  const sha = params.sha as string

  const [snippet, setSnippet] = useState<Snippet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRevision = async () => {
      try {
        const response = await fetch(`/api/snippets/${id}/revisions/${sha}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch revision')
        }

        setSnippet(data.snippet)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRevision()
  }, [id, sha])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className={`h-8 w-1/3 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} />
          <div className={`h-4 w-1/2 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} />
          <div className={`h-64 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className={`rounded-lg p-4 ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700'}`}>
          {error}
        </div>
      </div>
    )
  }

  if (!snippet) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>{t('revisionNotFound') || '修订版本未找到'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Link
            href={`/snippet/${id}/revisions`}
            className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('backToRevisions') || '返回修订历史'}
          </Link>
        </div>

        <div className={`rounded-lg border p-4 mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-mono px-2 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              {sha.substring(0, 7)}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}>
              {t('historicalVersion') || '历史版本'}
            </span>
          </div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {snippet.title}
          </h1>
          {snippet.description && (
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {snippet.description}
            </p>
          )}
          <div className={`flex flex-wrap items-center gap-4 mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(snippet.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              {snippet.tags.join(', ') || '-'}
            </span>
          </div>
        </div>

        {/* View Current Version */}
        <div className="mb-6">
          <Link
            href={`/snippet/${id}`}
            className={`inline-flex items-center gap-2 text-sm ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            {t('viewCurrentVersion') || '查看当前版本'}
          </Link>
        </div>
      </div>

      {/* Files */}
      <div>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('files')}
        </h2>
        <SnippetFiles files={snippet.files} />
      </div>
    </div>
  )
}
