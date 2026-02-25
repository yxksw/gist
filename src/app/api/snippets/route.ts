import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { listSnippets } from '@/lib/github'
import { isAuthorizedUser } from '@/lib/config'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const accessToken = session?.accessToken
    
    const snippets = await listSnippets(accessToken)
    
    const filteredSnippets = session?.user?.login && isAuthorizedUser(session.user.login)
      ? snippets
      : snippets.filter(s => s.isPublic)
    
    return NextResponse.json({ snippets: filteredSnippets })
  } catch (error) {
    console.error('Error fetching snippets:', error)
    return NextResponse.json({ error: 'Failed to fetch snippets' }, { status: 500 })
  }
}
