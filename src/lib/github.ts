import { Octokit } from '@octokit/rest'
import matter from 'gray-matter'
import { config } from './config'

export interface Snippet {
  id: string
  title: string
  description: string
  language: string
  code: string
  filename: string
  createdAt: string
  updatedAt: string
  tags: string[]
  isPublic: boolean
}

export interface SnippetFrontmatter {
  title: string
  description?: string
  language?: string
  createdAt: string
  updatedAt: string
  tags?: string[]
  isPublic?: boolean
}

function getOctokit(accessToken: string) {
  return new Octokit({ auth: accessToken })
}

export async function listSnippets(accessToken?: string): Promise<Snippet[]> {
  const octokit = accessToken ? getOctokit(accessToken) : new Octokit()
  const { owner, repo, branch, snippetsPath } = config.github

  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: snippetsPath,
      ref: branch,
    })

    if (!Array.isArray(response.data)) {
      return []
    }

    const snippets: Snippet[] = []
    
    for (const file of response.data) {
      if (file.type === 'file' && file.name.endsWith('.md')) {
        const content = await getSnippetContent(file.path, accessToken)
        if (content) {
          snippets.push(content)
        }
      }
    }

    return snippets.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  } catch (error) {
    console.error('Error listing snippets:', error)
    return []
  }
}

export async function getSnippetContent(
  path: string, 
  accessToken?: string
): Promise<Snippet | null> {
  const octokit = accessToken ? getOctokit(accessToken) : new Octokit()
  const { owner, repo, branch } = config.github

  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    })

    if (Array.isArray(response.data) || response.data.type !== 'file') {
      return null
    }

    const content = Buffer.from(response.data.content, 'base64').toString('utf-8')
    const { data, content: code } = matter(content)
    
    const filename = response.data.name
    const id = filename.replace('.md', '')

    return {
      id,
      title: data.title || id,
      description: data.description || '',
      language: data.language || 'text',
      code: code.trim(),
      filename,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      tags: data.tags || [],
      isPublic: data.isPublic !== false,
    }
  } catch (error) {
    console.error('Error getting snippet content:', error)
    return null
  }
}

export async function createSnippet(
  snippet: Omit<Snippet, 'id' | 'filename' | 'createdAt' | 'updatedAt'>,
  accessToken: string
): Promise<Snippet | null> {
  const octokit = getOctokit(accessToken)
  const { owner, repo, branch, snippetsPath } = config.github

  const id = crypto.randomUUID()
  const filename = `${id}.md`
  const now = new Date().toISOString()

  const frontmatter: SnippetFrontmatter = {
    title: snippet.title,
    description: snippet.description,
    language: snippet.language,
    createdAt: now,
    updatedAt: now,
    tags: snippet.tags,
    isPublic: snippet.isPublic,
  }

  const content = matter.stringify(snippet.code, frontmatter)
  const encodedContent = Buffer.from(content).toString('base64')

  try {
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: `${snippetsPath}/${filename}`,
      message: `Create snippet: ${snippet.title}`,
      content: encodedContent,
      branch,
    })

    return {
      id,
      title: snippet.title,
      description: snippet.description,
      language: snippet.language,
      code: snippet.code,
      filename,
      createdAt: now,
      updatedAt: now,
      tags: snippet.tags,
      isPublic: snippet.isPublic,
    }
  } catch (error) {
    console.error('Error creating snippet:', error)
    return null
  }
}

export async function updateSnippet(
  id: string,
  snippet: Omit<Snippet, 'id' | 'filename' | 'createdAt' | 'updatedAt'>,
  accessToken: string
): Promise<Snippet | null> {
  const octokit = getOctokit(accessToken)
  const { owner, repo, branch, snippetsPath } = config.github

  const filename = `${id}.md`
  const path = `${snippetsPath}/${filename}`
  const now = new Date().toISOString()

  let existingSha: string | undefined
  
  try {
    const existingFile = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    })
    
    if (!Array.isArray(existingFile.data) && existingFile.data.type === 'file') {
      existingSha = existingFile.data.sha
      
      const existingContent = Buffer.from(existingFile.data.content, 'base64').toString('utf-8')
      const { data: existingFrontmatter } = matter(existingContent)
      
      const frontmatter: SnippetFrontmatter = {
        title: snippet.title,
        description: snippet.description,
        language: snippet.language,
        createdAt: existingFrontmatter.createdAt || now,
        updatedAt: now,
        tags: snippet.tags,
        isPublic: snippet.isPublic,
      }

      const content = matter.stringify(snippet.code, frontmatter)
      const encodedContent = Buffer.from(content).toString('base64')

      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: `Update snippet: ${snippet.title}`,
        content: encodedContent,
        sha: existingSha,
        branch,
      })

      return {
        id,
        title: snippet.title,
        description: snippet.description,
        language: snippet.language,
        code: snippet.code,
        filename,
        createdAt: existingFrontmatter.createdAt || now,
        updatedAt: now,
        tags: snippet.tags,
        isPublic: snippet.isPublic,
      }
    }
  } catch (error) {
    console.error('Error updating snippet:', error)
    return null
  }

  return null
}

export async function deleteSnippet(
  id: string,
  accessToken: string
): Promise<boolean> {
  const octokit = getOctokit(accessToken)
  const { owner, repo, branch, snippetsPath } = config.github

  const filename = `${id}.md`
  const path = `${snippetsPath}/${filename}`

  try {
    const existingFile = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    })
    
    if (Array.isArray(existingFile.data)) {
      return false
    }

    await octokit.repos.deleteFile({
      owner,
      repo,
      path,
      message: `Delete snippet: ${id}`,
      sha: existingFile.data.sha,
      branch,
    })

    return true
  } catch (error) {
    console.error('Error deleting snippet:', error)
    return false
  }
}
