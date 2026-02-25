'use client'

import { useMemo, ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useTheme } from './theme-provider'

interface MarkdownRendererProps {
  content: string
}

interface ComponentProps {
  children?: ReactNode
  className?: string
  href?: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const components = useMemo(() => ({
          h1: ({ children }: ComponentProps) => <h1 className="text-3xl font-bold mb-4 mt-6">{children}</h1>,
          h2: ({ children }: ComponentProps) => <h2 className="text-2xl font-bold mb-3 mt-5">{children}</h2>,
          h3: ({ children }: ComponentProps) => <h3 className="text-xl font-bold mb-2 mt-4">{children}</h3>,
          p: ({ children }: ComponentProps) => <p className="mb-4 leading-relaxed">{children}</p>,
          ul: ({ children }: ComponentProps) => <ul className="list-disc pl-6 mb-4">{children}</ul>,
          ol: ({ children }: ComponentProps) => <ol className="list-decimal pl-6 mb-4">{children}</ol>,
          li: ({ children }: ComponentProps) => <li className="mb-1">{children}</li>,
          code: ({ children, className }: ComponentProps) => {
            const isInline = !className
            return isInline ? (
              <code className={`px-1.5 py-0.5 rounded text-sm font-mono ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
                {children}
              </code>
            ) : (
              <pre className={`p-4 rounded-lg overflow-x-auto mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <code className="text-sm font-mono">{children}</code>
              </pre>
            )
          },
          blockquote: ({ children }: ComponentProps) => (
            <blockquote className={`border-l-4 pl-4 italic my-4 ${isDark ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-600'}`}>
              {children}
            </blockquote>
          ),
          a: ({ children, href }: ComponentProps) => (
            <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          hr: () => <hr className={`my-6 ${isDark ? 'border-gray-700' : 'border-gray-300'}`} />,
          table: ({ children }: ComponentProps) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }: ComponentProps) => <thead className={isDark ? 'bg-gray-800' : 'bg-gray-100'}>{children}</thead>,
          th: ({ children }: ComponentProps) => (
            <th className={`border px-4 py-2 text-left font-semibold ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
              {children}
            </th>
          ),
          td: ({ children }: ComponentProps) => (
            <td className={`border px-4 py-2 ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
              {children}
            </td>
          ),
        }), [isDark])

  return (
    <div className={`markdown-body prose max-w-none ${isDark ? 'prose-invert' : ''}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
