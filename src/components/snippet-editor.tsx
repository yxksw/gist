'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Snippet, SnippetFile } from '@/lib/github'
import { detectLanguage } from '@/lib/utils'

interface SnippetEditorProps {
  snippet?: Snippet
  mode: 'create' | 'edit'
}

const languages = [
  'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp',
  'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala',
  'html', 'css', 'scss', 'sass', 'less', 'stylus', 'pug',
  'sql', 'bash', 'powershell',
  'json', 'yaml', 'xml', 'markdown', 'text', 'vue'
]

export function SnippetEditor({ snippet, mode }: SnippetEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(snippet?.title || '')
  const [description, setDescription] = useState(snippet?.description || '')
  const [files, setFiles] = useState<SnippetFile[]>(snippet?.files || [{ filename: '', language: 'javascript', code: '' }])
  const [tags, setTags] = useState(snippet?.tags.join(', ') || '')
  const [isPublic, setIsPublic] = useState(snippet?.isPublic ?? true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeFileIndex, setActiveFileIndex] = useState(0)

  const addFile = () => {
    setFiles([...files, { filename: '', language: 'javascript', code: '' }])
    setActiveFileIndex(files.length)
  }

  const removeFile = (index: number) => {
    if (files.length <= 1) {
      setError('At least one file is required')
      return
    }
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    if (activeFileIndex >= index && activeFileIndex > 0) {
      setActiveFileIndex(activeFileIndex - 1)
    }
  }

  const updateFile = (index: number, updates: Partial<SnippetFile>) => {
    const newFiles = [...files]
    newFiles[index] = { ...newFiles[index], ...updates }
    
    // Auto-detect language when filename changes
    if (updates.filename !== undefined) {
      newFiles[index].language = detectLanguage(newFiles[index].filename)
    }
    
    setFiles(newFiles)
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    // Validate files
    const validFiles = files.filter(f => f.filename.trim() && f.code.trim())
    if (validFiles.length === 0) {
      setError('At least one file with filename and code is required')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const url = mode === 'create' 
        ? '/api/snippets/new' 
        : `/api/snippets/${snippet?.id}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          files: validFiles,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          isPublic,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save snippet')
      }

      router.push(`/snippet/${data.snippet.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!snippet || !confirm('Are you sure you want to delete this snippet?')) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/snippets/${snippet.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete snippet')
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
        {mode === 'create' ? 'New Snippet' : 'Edit Snippet'}
      </h1>

      {error && (
        <div className="mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm sm:text-base">
          {error}
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
            placeholder="Snippet title..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
            placeholder="Brief description..."
          />
        </div>

        {/* Files Section */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-3 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Files ({files.length})
            </span>
            <button
              onClick={addFile}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
            >
              + Add File
            </button>
          </div>

          {/* File Tabs */}
          {files.length > 1 && (
            <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
              {files.map((file, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFileIndex(index)}
                  className={`px-3 sm:px-4 py-2 text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                    index === activeFileIndex
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-b-2 border-blue-500'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {file.filename || `File ${index + 1}`}
                  {files.length > 1 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(index)
                      }}
                      className="text-gray-400 hover:text-red-500 cursor-pointer"
                    >
                      ×
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Active File Editor */}
          <div className="p-3 sm:p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Filename *
                </label>
                <input
                  type="text"
                  value={files[activeFileIndex]?.filename || ''}
                  onChange={(e) => updateFile(activeFileIndex, { filename: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  placeholder="example.js"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Language
                </label>
                <select
                  value={files[activeFileIndex]?.language || 'javascript'}
                  onChange={(e) => updateFile(activeFileIndex, { language: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Code *
              </label>
              <textarea
                value={files[activeFileIndex]?.code || ''}
                onChange={(e) => updateFile(activeFileIndex, { code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-xs sm:text-sm"
                rows={12}
                placeholder="// Your code here..."
              />
            </div>
            {files.length > 1 && (
              <div className="flex justify-end">
                <button
                  onClick={() => removeFile(activeFileIndex)}
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remove this file
                </button>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm sm:text-base"
            placeholder="react, hooks, tutorial"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 bg-white dark:bg-gray-800"
          />
          <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
            Public (visible to everyone)
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            {isLoading ? 'Saving...' : mode === 'create' ? 'Create Snippet' : 'Save Changes'}
          </button>

          {mode === 'edit' && (
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
            >
              Delete
            </button>
          )}

          <button
            onClick={() => router.back()}
            className="px-4 sm:px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
