'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { SnippetRevision } from '@/lib/github'
import { useI18n } from '@/components/i18n-provider'
import { useTheme } from '@/components/theme-provider'

export default function RevisionsPage() {
  const params = useParams()
  const { t } = useI18n()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const id = params.id as string
  const [revisions, setRevisions] = useState<SnippetRevision[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRevisions = async () => {
      try {
        const response = await fetch(`/api/snippets/${id}/revisions`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch revisions')
        }

        setRevisions(data.revisions)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRevisions()
  }, [id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getCommitMessage = (message: string) => {
    // Extract the actual message after the prefix
    const prefixes = ['Create snippet:', 'Update snippet:', 'Add file:', 'Update file:', 'Delete file:', 'Delete snippet:']
    for (const prefix of prefixes) {
      if (message.startsWith(prefix)) {
        return message.substring(prefix.length).trim()
      }
    }
    return message
  }

  const getCommitType = (message: string) => {
    if (message.includes('Create snippet')) return 'create'
    if (message.includes('Update snippet')) return 'update'
    if (message.includes('Add file')) return 'add'
    if (message.includes('Update file')) return 'update'
    if (message.includes('Delete file')) return 'delete'
    if (message.includes('Delete snippet')) return 'delete'
    return 'other'
  }

  const getCommitTypeLabel = (type: string) => {
    switch (type) {
      case 'create':
        return t('created') || '创建'
      case 'update':
        return t('updated') || '更新'
      case 'add':
        return t('added') || '添加'
      case 'delete':
        return t('deleted') || '删除'
      default:
        return t('modified') || '修改'
    }
  }

  const getCommitTypeColor = (type: string) => {
    switch (type) {
      case 'create':
        return isDark ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
      case 'update':
        return isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
      case 'add':
        return isDark ? 'bg-cyan-600 text-white' : 'bg-cyan-500 text-white'
      case 'delete':
        return isDark ? 'bg-red-600 text-white' : 'bg-red-500 text-white'
      default:
        return isDark ? 'bg-gray-600 text-white' : 'bg-gray-500 text-white'
    }
  }

  if (isLoading) {
    return (
      <div className={`max-w-4xl mx-auto px-4 py-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-20 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} />
          ))}
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Link
            href={`/snippet/${id}`}
            className={`text-sm flex items-center gap-1 ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('backToSnippet') || '返回片段'}
          </Link>
        </div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t('revisions') || '修订历史'}
        </h1>
        <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {t('revisionsCount', { count: revisions.length }) || `${revisions.length} 个修订版本`}
        </p>
      </div>

      {/* Revisions List */}
      <div className="space-y-4">
        {revisions.map((revision, index) => {
          const type = getCommitType(revision.message)
          const message = getCommitMessage(revision.message)

          return (
            <div
              key={revision.sha}
              className={`rounded-lg border p-4 transition-colors ${
                isDark
                  ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Commit SHA */}
                <div className={`text-xs font-mono px-2 py-1 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                  {revision.sha.substring(0, 7)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${getCommitTypeColor(type)}`}>
                      {getCommitTypeLabel(type)}
                    </span>
                    <span className={`text-sm truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {message}
                    </span>
                  </div>

                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>{revision.author.name}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(revision.author.date)}</span>
                  </div>

                  {revision.stats && (
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="text-green-500">
                        +{revision.stats.additions}
                      </span>
                      <span className="text-red-500">
                        -{revision.stats.deletions}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {index < revisions.length - 1 && (
                    <Link
                      href={`/snippet/${id}/revisions/${revision.sha}`}
                      className={`text-xs px-3 py-1.5 rounded transition-colors ${
                        isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {t('viewDiff') || '查看对比'}
                    </Link>
                  )}
                  <Link
                    href={`/snippet/${id}/revisions/${revision.sha}/view`}
                    className={`text-xs px-3 py-1.5 rounded transition-colors ${
                      isDark
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {t('view') || '查看'}
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {revisions.length === 0 && (
        <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{t('noRevisions') || '暂无修订历史'}</p>
        </div>
      )}
    </div>
  )
}
