import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSnippetContent, updateSnippet, deleteSnippet } from '@/lib/github'
import { isAuthorizedUser } from '@/lib/config'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const accessToken = session?.accessToken
    
    const snippet = await getSnippetContent(`snippets/${id}`, accessToken)
    
    if (!snippet) {
      return NextResponse.json({ error: 'Snippet not found' }, { status: 404 })
    }

    if (!snippet.isPublic && (!session?.user?.login || !isAuthorizedUser(session.user.login))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    return NextResponse.json({ snippet })
  } catch (error) {
    console.error('Error fetching snippet:', error)
    return NextResponse.json({ error: 'Failed to fetch snippet' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.login || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAuthorizedUser(session.user.login)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, files, tags, isPublic } = body

    if (!title || !files || files.length === 0) {
      return NextResponse.json({ error: 'Title and at least one file are required' }, { status: 400 })
    }

    const snippet = await updateSnippet(
      id,
      {
        title,
        description: description || '',
        files,
        tags: tags || [],
        isPublic: isPublic !== false,
      },
      session.accessToken
    )

    if (!snippet) {
      return NextResponse.json({ error: 'Failed to update snippet' }, { status: 500 })
    }

    return NextResponse.json({ snippet })
  } catch (error) {
    console.error('Error updating snippet:', error)
    return NextResponse.json({ error: 'Failed to update snippet' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.login || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAuthorizedUser(session.user.login)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const success = await deleteSnippet(id, session.accessToken)

    if (!success) {
      return NextResponse.json({ error: 'Failed to delete snippet' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting snippet:', error)
    return NextResponse.json({ error: 'Failed to delete snippet' }, { status: 500 })
  }
}
