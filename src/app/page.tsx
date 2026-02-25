'use client'

import { useEffect, useState } from 'react'
import { Snippet } from '@/lib/github'
import { SnippetCard } from '@/components/snippet-card'

export default function HomePage() {
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSnippets()
  }, [])

  const fetchSnippets = async () => {
    try {
      const response = await fetch('/api/snippets')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch snippets')
      }

      setSnippets(data.snippets)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-32 bg-gray-200 rounded mt-4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    )
  }

  if (snippets.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No snippets yet</h2>
          <p className="text-gray-500">Sign in and create your first code snippet!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Snippets</h1>
        <p className="text-gray-500 mt-1">{snippets.length} snippet{snippets.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="space-y-6">
        {snippets.map((snippet) => (
          <SnippetCard key={snippet.id} snippet={snippet} />
        ))}
      </div>
    </div>
  )
}
