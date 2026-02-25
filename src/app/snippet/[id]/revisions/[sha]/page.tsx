'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { SnippetDiff } from '@/lib/github'
import { useI18n } from '@/components/i18n-provider'
import { useTheme } from '@/components/theme-provider'

export default function RevisionDiffPage() {
  const params = useParams()
  const { t } = useI18n()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const id = params.id as string
  const sha = params.sha as string

  const [diff, setDiff] = useState<SnippetDiff | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDiff = async () => {
      try {
        const response = await fetch(`/api/snippets/${id}/revisions/${sha}/diff`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch diff')
        }

        setDiff(data.diff)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDiff()
  }, [id, sha])

  const parsePatch = (patch: string) => {
    const lines: Array<{ type: 'context' | 'addition' | 'deletion'; content: string; lineNum?: number }> = []
    const patchLines = patch.split('\n')

    for (const line of patchLines) {
      if (line.startsWith('@@')) {
        // Hunk header
        lines.push({ type: 'context', content: line })
      } else if (line.startsWith('+')) {
        lines.push({ type: 'addition', content: line.substring(1) })
      } else if (line.startsWith('-')) {
        lines.push({ type: 'deletion', content: line.substring(1) })
      } else if (line.startsWith(' ')) {
        lines.push({ type: 'context', content: line.substring(1) })
      } else if (line === '\\ No newline at end of file') {
        lines.push({ type: 'context', content: line })
      }
    }

    return lines
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'added':
        return t('added') || '添加'
      case 'removed':
        return t('deleted') || '删除'
      case 'modified':
        return t('modified') || '修改'
      case 'renamed':
        return t('renamed') || '重命名'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'added':
        return isDark ? 'bg-green-600 text-white' : 'bg-green-500 text-white'
      case 'removed':
        return isDark ? 'bg-red-600 text-white' : 'bg-red-500 text-white'
      case 'modified':
        return isDark ? 'bg-yellow-600 text-white' : 'bg-yellow-500 text-white'
      case 'renamed':
        return isDark ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'
      default:
        return isDark ? 'bg-gray-600 text-white' : 'bg-gray-500 text-white'
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className={`h-8 w-1/3 rounded ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`} />
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

  if (!diff) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>{t('diffNotFound') || '对比数据未找到'}</p>
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
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t('viewDiff') || '查看对比'}
          </h1>
          <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <span className={`text-xs font-mono px-2 py-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              {diff.parentSha.substring(0, 7)}
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <span className={`text-xs font-mono px-2 py-1 rounded ${isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}>
              {diff.sha.substring(0, 7)}
            </span>
          </div>
        </div>
      </div>

      {/* Diff Files */}
      <div className="space-y-6">
        {diff.files.map((file, index) => (
          <div
            key={index}
            className={`rounded-lg border overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
          >
            {/* File Header */}
            <div className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(file.status)}`}>
                  {getStatusLabel(file.status)}
                </span>
                <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {file.filename}
                </span>
                {file.previousFilename && file.previousFilename !== file.filename && (
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    ← {file.previousFilename}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-green-500">+{file.additions}</span>
                <span className="text-red-500">-{file.deletions}</span>
              </div>
            </div>

            {/* Diff Content */}
            {file.patch && (
              <div className={`overflow-x-auto ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                <table className="w-full text-sm">
                  <tbody>
                    {parsePatch(file.patch).map((line, lineIndex) => (
                      <tr
                        key={lineIndex}
                        className={
                          line.type === 'addition'
                            ? isDark
                              ? 'bg-green-900/20'
                              : 'bg-green-50'
                            : line.type === 'deletion'
                            ? isDark
                              ? 'bg-red-900/20'
                              : 'bg-red-50'
                            : ''
                        }
                      >
                        <td
                          className={`px-2 py-0.5 text-right select-none w-12 ${
                            line.type === 'addition'
                              ? 'text-green-500'
                              : line.type === 'deletion'
                              ? 'text-red-500'
                              : isDark
                              ? 'text-gray-500'
                              : 'text-gray-400'
                          }`}
                        >
                          {line.type === 'context' && ' '}
                          {line.type === 'addition' && '+'}
                          {line.type === 'deletion' && '-'}
                        </td>
                        <td
                          className={`px-4 py-0.5 whitespace-pre font-mono ${
                            line.type === 'addition'
                              ? isDark
                                ? 'text-green-300'
                                : 'text-green-700'
                              : line.type === 'deletion'
                              ? isDark
                                ? 'text-red-300'
                                : 'text-red-700'
                              : isDark
                              ? 'text-gray-300'
                              : 'text-gray-700'
                          }`}
                        >
                          {line.content}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!file.patch && (
              <div className={`px-4 py-8 text-center text-sm ${isDark ? 'text-gray-400 bg-gray-900' : 'text-gray-500 bg-white'}`}>
                {file.status === 'added'
                  ? t('fileAddedNoContent') || '文件已添加（无内容显示）'
                  : file.status === 'removed'
                  ? t('fileDeletedNoContent') || '文件已删除'
                  : t('binaryFile') || '二进制文件'}
              </div>
            )}
          </div>
        ))}
      </div>

      {diff.files.length === 0 && (
        <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>{t('noChanges') || '没有变更'}</p>
        </div>
      )}
    </div>
  )
}
