import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSnippetRevisionContent } from '@/lib/github'
import { isAuthorizedUser } from '@/lib/config'
import { getSnippetContent } from '@/lib/github'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sha: string }> }
) {
  const { id, sha } = await params

  try {
    const session = await getServerSession(authOptions)
    const accessToken = session?.accessToken

    // Check if snippet exists and user has access
    const currentSnippet = await getSnippetContent(
      `${process.env.NEXT_PUBLIC_GITHUB_SNIPPETS_PATH || 'snippets'}/${id}`,
      accessToken
    )

    if (!currentSnippet) {
      return NextResponse.json({ error: 'Snippet not found' }, { status: 404 })
    }

    // Check access permission
    const isAuthorized = session?.user?.login && isAuthorizedUser(session.user.login)
    if (!currentSnippet.isPublic && !isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const snippet = await getSnippetRevisionContent(id, sha, accessToken)

    if (!snippet) {
      return NextResponse.json({ error: 'Revision not found' }, { status: 404 })
    }

    return NextResponse.json({ snippet })
  } catch (error) {
    console.error('Error fetching revision:', error)
    return NextResponse.json({ error: 'Failed to fetch revision' }, { status: 500 })
  }
}
