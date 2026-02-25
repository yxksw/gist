'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Snippet } from '@/lib/github'
import { SnippetEditor } from '@/components/snippet-editor'
import { isAuthorizedUser } from '@/lib/config'

export default function EditSnippetPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [snippet, setSnippet] = useState<Snippet | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const id = params.id as string

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/')
      return
    }

    if (!isAuthorizedUser(session.user.login)) {
      router.push('/')
      return
    }

    // Fetch snippet data
    const fetchSnippet = async () => {
      try {
        const response = await fetch(`/api/snippets/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch snippet')
        }

        setSnippet(data.snippet)
      } catch (err) {
        console.error(err)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSnippet()
  }, [session, status, router, id])

  if (isLoading || !snippet) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return <SnippetEditor snippet={snippet} mode="edit" />
}
