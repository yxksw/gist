'use client'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeBlockProps {
  code: string
  language: string
  showLineNumbers?: boolean
}

const languageMap: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  jsx: 'javascript',
  py: 'python',
  rb: 'ruby',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  md: 'markdown',
}

export function CodeBlock({ code, language, showLineNumbers = true }: CodeBlockProps) {
  const normalizedLanguage = languageMap[language.toLowerCase()] || language.toLowerCase()

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium uppercase">
          {normalizedLanguage}
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </button>
      </div>
      <SyntaxHighlighter
        language={normalizedLanguage}
        style={vscDarkPlus}
        showLineNumbers={showLineNumbers}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: '14px',
        }}
        lineNumberStyle={{
          minWidth: '3em',
          paddingRight: '1em',
          color: '#6e7681',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
