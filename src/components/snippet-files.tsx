'use client'

import { useState } from 'react'
import { SnippetFile } from '@/lib/github'
import { CodeBlock } from './code-block'
import { useTheme } from './theme-provider'

interface SnippetFilesProps {
  files: SnippetFile[]
  preview?: boolean
}

export function SnippetFiles({ files, preview = false }: SnippetFilesProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeFile, setActiveFile] = useState(0)

  if (files.length === 0) {
    return null
  }

  if (files.length === 1) {
    const file = files[0]
    const displayCode = preview ? file.code.split('\n').slice(0, 10).join('\n') + (file.code.split('\n').length > 10 ? '\n...' : '') : file.code
    return (
      <div className="relative">
        <CodeBlock code={displayCode} language={file.language} />
        {preview && file.code.split('\n').length > 10 && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900 to-transparent flex items-end justify-center pb-2">
            <span className="text-sm text-white hover:underline cursor-pointer">View full snippet</span>
          </div>
        )}
      </div>
    )
  }

  // Multiple files - show tabs
  const activeFileData = files[activeFile]
  const displayCode = preview 
    ? activeFileData.code.split('\n').slice(0, 10).join('\n') + (activeFileData.code.split('\n').length > 10 ? '\n...' : '') 
    : activeFileData.code

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
      <div className="relative">
        <CodeBlock code={displayCode} language={activeFileData.language} />
        {preview && activeFileData.code.split('\n').length > 10 && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900 to-transparent flex items-end justify-center pb-2">
            <span className="text-sm text-white hover:underline cursor-pointer">View full snippet</span>
          </div>
        )}
      </div>
    </div>
  )
}
