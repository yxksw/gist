import Link from 'next/link'
import { Snippet } from '@/lib/github'
import { CodeBlock } from './code-block'

interface SnippetCardProps {
  snippet: Snippet
}

export function SnippetCard({ snippet }: SnippetCardProps) {
  const previewCode = snippet.code.split('\n').slice(0, 10).join('\n')
  const hasMoreLines = snippet.code.split('\n').length > 10

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <Link 
              href={`/snippet/${snippet.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600"
            >
              {snippet.title}
            </Link>
            {snippet.description && (
              <p className="text-sm text-gray-500 mt-1">{snippet.description}</p>
            )}
          </div>
          <span className="text-xs text-gray-400">
            {new Date(snippet.updatedAt).toLocaleDateString()}
          </span>
        </div>
        {snippet.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {snippet.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="relative">
        <CodeBlock code={previewCode + (hasMoreLines ? '\n...' : '')} language={snippet.language} />
        {hasMoreLines && (
          <Link
            href={`/snippet/${snippet.id}`}
            className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900 to-transparent flex items-end justify-center pb-2"
          >
            <span className="text-sm text-white hover:underline">View full snippet</span>
          </Link>
        )}
      </div>
    </div>
  )
}
