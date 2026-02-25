'use client'

import { useState } from 'react'
import { SnippetFile } from '@/lib/github'
import { CodeBlock } from './code-block'
import { MarkdownRenderer } from './markdown-renderer'
import { CopyButton } from './copy-button'
import { useTheme } from './theme-provider'
import { useI18n } from './i18n-provider'
import { Translations } from '@/lib/i18n'

interface SnippetFilesProps {
  files: SnippetFile[]
  preview?: boolean
}

function isMarkdownFile(language: string, filename: string): boolean {
  return language === 'markdown' ||
    filename.toLowerCase().endsWith('.md') ||
    filename.toLowerCase().endsWith('.markdown')
}

interface FileContentProps {
  file: SnippetFile
  preview?: boolean
  isDark: boolean
  t: (key: keyof Translations, params?: Record<string, string | number>) => string
}

function FileContent({ file, preview, isDark, t }: FileContentProps) {
  const isMarkdown = isMarkdownFile(file.language, file.filename)

  if (isMarkdown) {
    // For markdown files, render as markdown
    const displayContent = preview
      ? file.code.split('\n').slice(0, 20).join('\n')
      : file.code

    return (
      <div>
        {/* Copy button for markdown */}
        <div className={`px-4 py-2 border-b flex items-center justify-between ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
          <span className={`text-xs font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            markdown
          </span>
          <CopyButton text={file.code} />
        </div>
        <div className={`p-4 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          <MarkdownRenderer content={displayContent} />
          {preview && file.code.split('\n').length > 20 && (
            <div className={`mt-4 pt-4 text-center border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <span className={`text-sm hover:underline cursor-pointer ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('viewFullSnippet')}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // For code files, use CodeBlock
  const displayCode = preview
    ? file.code.split('\n').slice(0, 10).join('\n') + (file.code.split('\n').length > 10 ? '\n...' : '')
    : file.code

  return (
    <div className="relative">
      <CodeBlock code={displayCode} language={file.language} />
      {preview && file.code.split('\n').length > 10 && (
        <div className={`absolute bottom-0 left-0 right-0 h-16 flex items-end justify-center pb-2 ${
          isDark ? 'bg-gradient-to-t from-gray-900 to-transparent' : 'bg-gradient-to-t from-gray-100 to-transparent'
        }`}>
          <span className={`text-sm hover:underline cursor-pointer ${isDark ? 'text-white' : 'text-gray-700'}`}>
            {t('viewFullSnippet')}
          </span>
        </div>
      )}
    </div>
  )
}

export function SnippetFiles({ files, preview = false }: SnippetFilesProps) {
  const { theme } = useTheme()
  const { t } = useI18n()
  const isDark = theme === 'dark'
  const [activeFile, setActiveFile] = useState(0)

  if (files.length === 0) {
    return null
  }

  if (files.length === 1) {
    const file = files[0]
    return (
      <div>
        <FileContent file={file} preview={preview} isDark={isDark} t={t} />
      </div>
    )
  }

  // Multiple files - show tabs
  const activeFileData = files[activeFile]

  return (
    <div className={`rounded-lg overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      {/* File tabs */}
      <div className={`flex overflow-x-auto border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'}`}>
        {files.map((file, index) => (
          <button
            key={file.filename}
            onClick={() => setActiveFile(index)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
              index === activeFile
                ? isDark
                  ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                  : 'bg-white text-gray-900 border-b-2 border-blue-500'
                : isDark
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            {file.filename}
          </button>
        ))}
      </div>

      {/* Active file content */}
      <FileContent file={activeFileData} preview={preview} isDark={isDark} t={t} />
    </div>
  )
}
