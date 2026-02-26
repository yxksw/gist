// Shared utility functions

/**
 * Detect programming language from filename extension
 */
export function detectLanguage(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const langMap: Record<string, string> = {
    'js': 'javascript', 'ts': 'typescript', 'tsx': 'typescript', 'jsx': 'javascript',
    'py': 'python', 'rb': 'ruby', 'go': 'go', 'rs': 'rust',
    'java': 'java', 'cpp': 'cpp', 'c': 'c', 'cs': 'csharp',
    'php': 'php', 'swift': 'swift', 'kt': 'kotlin', 'scala': 'scala',
    'html': 'html', 'htm': 'html', 'css': 'css', 'scss': 'scss',
    'sass': 'sass', 'less': 'less', 'styl': 'stylus', 'stylus': 'stylus',
    'pug': 'pug', 'jade': 'pug',
    'sql': 'sql',
    'sh': 'bash', 'bash': 'bash', 'zsh': 'bash', 'ps1': 'powershell',
    'json': 'json', 'yaml': 'yaml', 'yml': 'yaml', 'xml': 'xml',
    'md': 'markdown', 'txt': 'text',
    'vue': 'vue',
  }
  return langMap[ext] || 'text'
}

/**
 * Check if a file is a Markdown file
 */
export function isMarkdownFile(language: string, filename: string): boolean {
  return language === 'markdown' ||
    filename.toLowerCase().endsWith('.md') ||
    filename.toLowerCase().endsWith('.markdown')
}
