'use client'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vs, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from '@/components/theme-provider'

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
  const { theme } = useTheme()
  const normalizedLanguage = languageMap[language.toLowerCase()] || language.toLowerCase()
  
  const isDark = theme === 'dark'
  const style = isDark ? vscDarkPlus : vs

  return (
    <div className={`rounded-lg overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className={`px-4 py-2 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
        <span className={`text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {normalizedLanguage}
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className={`text-xs flex items-center gap-1 ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </button>
      </div>
      <div className={isDark ? 'bg-[#1e1e1e]' : 'bg-white'}>
        <SyntaxHighlighter
          language={normalizedLanguage}
          style={style}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: '14px',
            background: 'transparent',
          }}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: isDark ? '#6e7681' : '#9ca3af',
            backgroundColor: isDark ? '#252526' : '#f8f9fa',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
