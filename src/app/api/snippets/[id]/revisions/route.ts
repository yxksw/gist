import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSnippetRevisions, getSnippetContent } from '@/lib/github'
import { isAuthorizedUser } from '@/lib/config'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    const accessToken = session?.accessToken

    // Check if snippet exists and user has access
    const snippet = await getSnippetContent(
      `${process.env.NEXT_PUBLIC_GITHUB_SNIPPETS_PATH || 'snippets'}/${id}`,
      accessToken
    )

    if (!snippet) {
      return NextResponse.json({ error: 'Snippet not found' }, { status: 404 })
    }

    // Check access permission
    const isAuthorized = session?.user?.login && isAuthorizedUser(session.user.login)
    if (!snippet.isPublic && !isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const revisions = await getSnippetRevisions(id, accessToken)

    return NextResponse.json({ revisions })
  } catch (error) {
    console.error('Error fetching revisions:', error)
    return NextResponse.json({ error: 'Failed to fetch revisions' }, { status: 500 })
  }
}
