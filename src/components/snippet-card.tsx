import Link from 'next/link'
import { Snippet } from '@/lib/github'
import { SnippetFiles } from './snippet-files'
import { useI18n } from './i18n-provider'

interface SnippetCardProps {
  snippet: Snippet
}

export function SnippetCard({ snippet }: SnippetCardProps) {
  const { t } = useI18n()
  const hasMoreFiles = snippet.files.length > 1

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link 
              href={`/snippet/${snippet.id}`}
              className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 break-words"
            >
              {snippet.title}
            </Link>
            {snippet.description && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{snippet.description}</p>
            )}
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
            {new Date(snippet.updatedAt).toLocaleDateString()}
          </span>
        </div>
        
        {/* File count and tags */}
        <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-3">
          {hasMoreFiles && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
              {snippet.files.length} {t('files').toLowerCase()}
            </span>
          )}
          {snippet.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {snippet.tags.length > 5 && (
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
              +{snippet.tags.length - 5}
            </span>
          )}
        </div>
      </div>
      
      <Link href={`/snippet/${snippet.id}`}>
        <SnippetFiles files={snippet.files} preview />
      </Link>
    </div>
  )
}
