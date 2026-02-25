import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSnippet } from '@/lib/github'
import { isAuthorizedUser } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.login || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAuthorizedUser(session.user.login)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, language, code, tags, isPublic } = body

    if (!title || !code) {
      return NextResponse.json({ error: 'Title and code are required' }, { status: 400 })
    }

    const snippet = await createSnippet(
      {
        title,
        description: description || '',
        language: language || 'text',
        code,
        tags: tags || [],
        isPublic: isPublic !== false,
      },
      session.accessToken
    )

    if (!snippet) {
      return NextResponse.json({ error: 'Failed to create snippet' }, { status: 500 })
    }

    return NextResponse.json({ snippet })
  } catch (error) {
    console.error('Error creating snippet:', error)
    return NextResponse.json({ error: 'Failed to create snippet' }, { status: 500 })
  }
}
