export const config = {
  github: {
    owner: process.env.NEXT_PUBLIC_GITHUB_OWNER || '',
    repo: process.env.NEXT_PUBLIC_GITHUB_REPO || '',
    branch: process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main',
    snippetsPath: process.env.NEXT_PUBLIC_SNIPPETS_PATH || 'snippets',
    token: process.env.GITHUB_TOKEN || '',
  },
  auth: {
    allowedUsers: (process.env.ALLOWED_GITHUB_USERS || '').split(',').filter(Boolean),
  },
}

export const isAuthorizedUser = (username: string | null | undefined): boolean => {
  if (!username) return false
  const allowedUsers = config.auth.allowedUsers
  if (allowedUsers.length === 0) return true
  return allowedUsers.includes(username)
}
