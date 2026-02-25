import { Octokit } from '@octokit/rest'
import matter from 'gray-matter'
import { config } from './config'

export interface SnippetFile {
  filename: string
  language: string
  code: string
}

export interface Snippet {
  id: string
  title: string
  description: string
  files: SnippetFile[]
  createdAt: string
  updatedAt: string
  tags: string[]
  isPublic: boolean
}

export interface SnippetFrontmatter {
  title: string
  description?: string
  createdAt: string
  updatedAt: string
  tags?: string[]
  isPublic?: boolean
  files: { filename: string; language: string }[]
}

export interface SnippetRevision {
  sha: string
  message: string
  author: {
    name: string
    email: string
    date: string
  }
  committer: {
    name: string
    email: string
    date: string
  }
  stats?: {
    additions: number
    deletions: number
  }
}

function getOctokit(accessToken?: string) {
  // Priority: user's access token > configured token > no auth
  const token = accessToken || config.github.token
  if (token) {
    return new Octokit({ auth: token })
  }
  return new Octokit()
}

function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const langMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'jsx': 'javascript',
    'py': 'python',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'php': 'php',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'styl': 'stylus',
    'stylus': 'stylus',
    'pug': 'pug',
    'jade': 'pug',
    'sql': 'sql',
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'ps1': 'powershell',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'xml': 'xml',
    'md': 'markdown',
    'txt': 'text',
  }
  return langMap[ext] || 'text'
}

function isFileContent(data: unknown): data is { type: 'file'; content: string; sha: string } {
  return typeof data === 'object' && data !== null && 'type' in data && (data as { type: string }).type === 'file'
}

export async function listSnippets(accessToken?: string): Promise<Snippet[]> {
  const octokit = getOctokit(accessToken)
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
    
    for (const item of response.data) {
      if (item.type === 'dir') {
        const snippet = await getSnippetContent(item.path, accessToken)
        if (snippet) {
          snippets.push(snippet)
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
  const octokit = getOctokit(accessToken)
  const { owner, repo, branch } = config.github

  try {
    const dirResponse = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    })

    if (!Array.isArray(dirResponse.data)) {
      return null
    }

    const indexFile = dirResponse.data.find(f => f.name === 'index.md')
    if (!indexFile || indexFile.type !== 'file') {
      return null
    }

    const indexResponse = await octokit.repos.getContent({
      owner,
      repo,
      path: indexFile.path,
      ref: branch,
    })

    if (Array.isArray(indexResponse.data) || !isFileContent(indexResponse.data)) {
      return null
    }

    const indexContent = Buffer.from(indexResponse.data.content, 'base64').toString('utf-8')
    const { data: frontmatter } = matter(indexContent)
    
    const id = path.split('/').pop() || ''
    const files: SnippetFile[] = []

    for (const fileInfo of frontmatter.files || []) {
      const fileItem = dirResponse.data.find(f => f.name === fileInfo.filename)
      if (fileItem && fileItem.type === 'file') {
        const fileResponse = await octokit.repos.getContent({
          owner,
          repo,
          path: fileItem.path,
          ref: branch,
        })
        
        if (!Array.isArray(fileResponse.data) && isFileContent(fileResponse.data)) {
          const code = Buffer.from(fileResponse.data.content, 'base64').toString('utf-8')
          files.push({
            filename: fileInfo.filename,
            language: fileInfo.language || detectLanguage(fileInfo.filename),
            code,
          })
        }
      }
    }

    if (files.length === 0) {
      return null
    }

    return {
      id,
      title: frontmatter.title || id,
      description: frontmatter.description || '',
      files,
      createdAt: frontmatter.createdAt || new Date().toISOString(),
      updatedAt: frontmatter.updatedAt || new Date().toISOString(),
      tags: frontmatter.tags || [],
      isPublic: frontmatter.isPublic !== false,
    }
  } catch (error) {
    console.error('Error getting snippet content:', error)
    return null
  }
}

export async function createSnippet(
  snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>,
  accessToken: string
): Promise<Snippet | null> {
  const octokit = getOctokit(accessToken)
  const { owner, repo, branch, snippetsPath } = config.github

  const id = crypto.randomUUID()
  const snippetDir = `${snippetsPath}/${id}`
  const now = new Date().toISOString()

  const frontmatter: SnippetFrontmatter = {
    title: snippet.title,
    description: snippet.description,
    createdAt: now,
    updatedAt: now,
    tags: snippet.tags,
    isPublic: snippet.isPublic,
    files: snippet.files.map(f => ({ filename: f.filename, language: f.language })),
  }

  try {
    const indexContent = matter.stringify('', frontmatter)
    
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: `${snippetDir}/index.md`,
      message: `Create snippet: ${snippet.title}`,
      content: Buffer.from(indexContent).toString('base64'),
      branch,
    })

    for (const file of snippet.files) {
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: `${snippetDir}/${file.filename}`,
        message: `Add file: ${file.filename}`,
        content: Buffer.from(file.code).toString('base64'),
        branch,
      })
    }

    return {
      id,
      title: snippet.title,
      description: snippet.description,
      files: snippet.files,
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
  snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>,
  accessToken: string
): Promise<Snippet | null> {
  const octokit = getOctokit(accessToken)
  const { owner, repo, branch, snippetsPath } = config.github

  const snippetDir = `${snippetsPath}/${id}`
  const indexPath = `${snippetDir}/index.md`
  const now = new Date().toISOString()

  try {
    const existingIndex = await octokit.repos.getContent({
      owner,
      repo,
      path: indexPath,
      ref: branch,
    })

    if (Array.isArray(existingIndex.data) || !isFileContent(existingIndex.data)) {
      return null
    }

    const existingContent = Buffer.from(existingIndex.data.content, 'base64').toString('utf-8')
    const { data: existingFrontmatter } = matter(existingContent)

    const frontmatter: SnippetFrontmatter = {
      title: snippet.title,
      description: snippet.description,
      createdAt: existingFrontmatter.createdAt || now,
      updatedAt: now,
      tags: snippet.tags,
      isPublic: snippet.isPublic,
      files: snippet.files.map(f => ({ filename: f.filename, language: f.language })),
    }

    const indexContent = matter.stringify('', frontmatter)
    
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: indexPath,
      message: `Update snippet: ${snippet.title}`,
      content: Buffer.from(indexContent).toString('base64'),
      sha: existingIndex.data.sha,
      branch,
    })

    const dirResponse = await octokit.repos.getContent({
      owner,
      repo,
      path: snippetDir,
      ref: branch,
    })

    if (Array.isArray(dirResponse.data)) {
      const existingFiles = new Set(dirResponse.data.map(f => f.name))
      const newFiles = new Set(snippet.files.map(f => f.filename))

      for (const file of snippet.files) {
        const filePath = `${snippetDir}/${file.filename}`
        let sha: string | undefined

        if (existingFiles.has(file.filename)) {
          const existingFile = dirResponse.data.find(f => f.name === file.filename)
          if (existingFile && existingFile.type === 'file') {
            sha = existingFile.sha
          }
        }

        await octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: filePath,
          message: sha ? `Update file: ${file.filename}` : `Add file: ${file.filename}`,
          content: Buffer.from(file.code).toString('base64'),
          sha,
          branch,
        })
      }

      for (const existingFile of dirResponse.data) {
        if (existingFile.name !== 'index.md' && !newFiles.has(existingFile.name) && existingFile.type === 'file') {
          await octokit.repos.deleteFile({
            owner,
            repo,
            path: existingFile.path,
            message: `Delete file: ${existingFile.name}`,
            sha: existingFile.sha,
            branch,
          })
        }
      }
    }

    return {
      id,
      title: snippet.title,
      description: snippet.description,
      files: snippet.files,
      createdAt: existingFrontmatter.createdAt || now,
      updatedAt: now,
      tags: snippet.tags,
      isPublic: snippet.isPublic,
    }
  } catch (error) {
    console.error('Error updating snippet:', error)
    return null
  }
}

export async function deleteSnippet(
  id: string,
  accessToken: string
): Promise<boolean> {
  const octokit = getOctokit(accessToken)
  const { owner, repo, branch, snippetsPath } = config.github

  const snippetDir = `${snippetsPath}/${id}`

  try {
    const dirResponse = await octokit.repos.getContent({
      owner,
      repo,
      path: snippetDir,
      ref: branch,
    })

    if (!Array.isArray(dirResponse.data)) {
      return false
    }

    for (const file of dirResponse.data) {
      if (file.type === 'file') {
        await octokit.repos.deleteFile({
          owner,
          repo,
          path: file.path,
          message: `Delete snippet: ${id}`,
          sha: file.sha,
          branch,
        })
      }
    }

    return true
  } catch (error) {
    console.error('Error deleting snippet:', error)
    return false
  }
}

export async function getSnippetRevisions(
  id: string,
  accessToken?: string
): Promise<SnippetRevision[]> {
  const octokit = getOctokit(accessToken)
  const { owner, repo, snippetsPath } = config.github

  const snippetDir = `${snippetsPath}/${id}`

  try {
    const response = await octokit.repos.listCommits({
      owner,
      repo,
      path: snippetDir,
      per_page: 50,
    })

    const revisions: SnippetRevision[] = []

    for (const commit of response.data) {
      // Get commit details for stats
      const commitDetail = await octokit.repos.getCommit({
        owner,
        repo,
        ref: commit.sha,
      })

      let additions = 0
      let deletions = 0

      commitDetail.data.files?.forEach(file => {
        additions += file.additions
        deletions += file.deletions
      })

      revisions.push({
        sha: commit.sha,
        message: commit.commit.message,
        author: {
          name: commit.commit.author?.name || '',
          email: commit.commit.author?.email || '',
          date: commit.commit.author?.date || '',
        },
        committer: {
          name: commit.commit.committer?.name || '',
          email: commit.commit.committer?.email || '',
          date: commit.commit.committer?.date || '',
        },
        stats: {
          additions,
          deletions,
        },
      })
    }

    return revisions
  } catch (error) {
    console.error('Error getting snippet revisions:', error)
    return []
  }
}

export async function getSnippetRevisionContent(
  id: string,
  sha: string,
  accessToken?: string
): Promise<Snippet | null> {
  const octokit = getOctokit(accessToken)
  const { owner, repo, snippetsPath } = config.github

  const snippetDir = `${snippetsPath}/${id}`

  try {
    // Get the tree for this commit
    const treeResponse = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: sha,
      recursive: 'true',
    })

    const snippetFiles: SnippetFile[] = []
    let frontmatter: SnippetFrontmatter | null = null

    for (const item of treeResponse.data.tree) {
      if (item.path?.startsWith(snippetDir) && item.type === 'blob') {
        const fileName = item.path.split('/').pop()

        if (fileName === 'index.md') {
          // Get index.md content
          const contentResponse = await octokit.git.getBlob({
            owner,
            repo,
            file_sha: item.sha,
          })
          const content = Buffer.from(contentResponse.data.content, 'base64').toString('utf-8')
          const { data } = matter(content)
          frontmatter = data as SnippetFrontmatter
        } else {
          // Get file content
          const contentResponse = await octokit.git.getBlob({
            owner,
            repo,
            file_sha: item.sha,
          })
          const code = Buffer.from(contentResponse.data.content, 'base64').toString('utf-8')
          snippetFiles.push({
            filename: fileName || '',
            language: detectLanguage(fileName || ''),
            code,
          })
        }
      }
    }

    if (!frontmatter) {
      return null
    }

    return {
      id,
      title: frontmatter.title || id,
      description: frontmatter.description || '',
      files: snippetFiles,
      createdAt: frontmatter.createdAt || new Date().toISOString(),
      updatedAt: frontmatter.updatedAt || new Date().toISOString(),
      tags: frontmatter.tags || [],
      isPublic: frontmatter.isPublic !== false,
    }
  } catch (error) {
    console.error('Error getting snippet revision content:', error)
    return null
  }
}

export interface SnippetDiff {
  sha: string
  parentSha: string
  files: Array<{
    filename: string
    status: 'added' | 'removed' | 'modified' | 'renamed'
    additions: number
    deletions: number
    patch?: string
    previousFilename?: string
  }>
}

export async function getSnippetRevisionDiff(
  id: string,
  sha: string,
  accessToken?: string
): Promise<SnippetDiff | null> {
  const octokit = getOctokit(accessToken)
  const { owner, repo } = config.github

  try {
    const commitResponse = await octokit.repos.getCommit({
      owner,
      repo,
      ref: sha,
    })

    const parentSha = commitResponse.data.parents?.[0]?.sha || ''

    const files = commitResponse.data.files?.map(file => ({
      filename: file.filename,
      status: file.status as 'added' | 'removed' | 'modified' | 'renamed',
      additions: file.additions,
      deletions: file.deletions,
      patch: file.patch,
      previousFilename: file.previous_filename,
    })) || []

    return {
      sha,
      parentSha,
      files,
    }
  } catch (error) {
    console.error('Error getting snippet revision diff:', error)
    return null
  }
}
