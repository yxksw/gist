const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
const envPath = path.join(__dirname, '../.env');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  // Handle both Windows (\r\n) and Unix (\n) line endings
  const lines = envContent.split(/\r?\n/);
  
  lines.forEach((line) => {
    // Skip empty lines and comments
    if (!line || line.startsWith('#')) return;
    
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const { Octokit } = require('@octokit/rest');
const matter = require('gray-matter');

// Load config from environment variables (same as src/lib/config.ts)
const config = {
  github: {
    owner: process.env.NEXT_PUBLIC_GITHUB_OWNER || '',
    repo: process.env.NEXT_PUBLIC_GITHUB_REPO || '',
    branch: process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main',
    snippetsPath: process.env.NEXT_PUBLIC_SNIPPETS_PATH || 'snippets',
    token: process.env.GITHUB_TOKEN || '',
  },
};

// Create directories
const tempDir = path.join(__dirname, '../.pagefind-temp');
const outputDir = path.join(__dirname, '../public/pagefind');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Initialize Octokit
const octokit = new Octokit({
  auth: config.github.token || undefined
});

async function getSnippetContent(owner, repo, snippetsPath, branch, itemPath) {
  try {
    const dirResponse = await octokit.repos.getContent({
      owner,
      repo,
      path: itemPath,
      ref: branch,
    });

    if (!Array.isArray(dirResponse.data)) {
      return null;
    }

    const indexFile = dirResponse.data.find(f => f.name === 'index.md');
    if (!indexFile || indexFile.type !== 'file') {
      return null;
    }

    const indexResponse = await octokit.repos.getContent({
      owner,
      repo,
      path: indexFile.path,
      ref: branch,
    });

    if (indexResponse.data.type !== 'file' || !indexResponse.data.content) {
      return null;
    }

    const content = Buffer.from(indexResponse.data.content, 'base64').toString('utf-8');
    const parsed = matter(content);
    const frontmatter = parsed.data;

    const files = [];
    for (const file of dirResponse.data) {
      if (file.name === 'index.md' || file.type !== 'file') continue;

      const fileResponse = await octokit.repos.getContent({
        owner,
        repo,
        path: file.path,
        ref: branch,
      });

      if (fileResponse.data.type === 'file' && fileResponse.data.content) {
        const fileContent = Buffer.from(fileResponse.data.content, 'base64').toString('utf-8');
        files.push({
          filename: file.name,
          content: fileContent
        });
      }
    }

    return {
      id: itemPath.replace(snippetsPath + '/', ''),
      title: frontmatter.title || 'Untitled',
      description: frontmatter.description || '',
      tags: frontmatter.tags || [],
      createdAt: frontmatter.createdAt,
      updatedAt: frontmatter.updatedAt,
      isPublic: frontmatter.isPublic !== false,
      files: files
    };
  } catch (error) {
    console.error(`Error getting snippet content for ${itemPath}:`, error.message);
    return null;
  }
}

async function generateSearchIndex() {
  const { owner, repo, branch, snippetsPath } = config.github;

  if (!owner || !repo) {
    console.warn('GitHub owner or repo not configured. Skipping search index generation.');
    // Create a placeholder HTML
    const placeholderHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Search Placeholder</title>
</head>
<body>
  <h1>Search not configured</h1>
  <p>Please configure GITHUB_OWNER and GITHUB_REPO to enable search.</p>
</body>
</html>`;
    fs.writeFileSync(path.join(tempDir, 'placeholder.html'), placeholderHtml);
    return;
  }

  console.log(`Fetching snippets from ${owner}/${repo}...`);

  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: snippetsPath,
      ref: branch,
    });

    if (!Array.isArray(response.data)) {
      console.warn('Snippets path is not a directory');
      return;
    }

    let indexedCount = 0;

    for (const item of response.data) {
      if (item.type === 'dir') {
        const snippet = await getSnippetContent(owner, repo, snippetsPath, branch, item.path);
        if (snippet && snippet.isPublic) {
          // Generate HTML file for this snippet
          const filesHtml = snippet.files.map(file => `
            <div class="file" data-filename="${file.filename}">
              <h3>${file.filename}</h3>
              <pre><code>${file.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
            </div>
          `).join('');

          const tagsHtml = snippet.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ');

          const snippetUrl = `/snippet/${snippet.id}`;
          
          const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${snippet.title}</title>
  <meta name="description" content="${snippet.description || snippet.title}">
</head>
<body data-pagefind-body data-pagefind-url="${snippetUrl}">
  <article>
    <h1 data-pagefind-meta="title">${snippet.title}</h1>
    <p data-pagefind-meta="description">${snippet.description || ''}</p>
    <div class="tags">${tagsHtml}</div>
    <div class="files">
      ${filesHtml}
    </div>
  </article>
</body>
</html>`;

          const filename = `${snippet.id}.html`;
          fs.writeFileSync(path.join(tempDir, filename), html);
          console.log(`Indexed: ${snippet.title}`);
          indexedCount++;
        }
      }
    }

    console.log(`Indexed ${indexedCount} snippets`);

    if (indexedCount === 0) {
      // Create a placeholder if no snippets found
      const placeholderHtml = `<!DOCTYPE html>
<html>
<head>
  <title>No Snippets</title>
</head>
<body>
  <h1>No snippets found</h1>
  <p>No public snippets were found in the repository.</p>
</body>
</html>`;
      fs.writeFileSync(path.join(tempDir, 'placeholder.html'), placeholderHtml);
    }
  } catch (error) {
    console.error('Error fetching snippets:', error.message);
    // Create error placeholder
    const errorHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Search Error</title>
</head>
<body>
  <h1>Search temporarily unavailable</h1>
  <p>Could not fetch snippets from GitHub.</p>
</body>
</html>`;
    fs.writeFileSync(path.join(tempDir, 'error.html'), errorHtml);
  }
}

async function buildSearchIndex() {
  console.log('Building Pagefind index...');

  try {
    // Generate HTML files from snippets
    await generateSearchIndex();

    // Run pagefind CLI
    execSync(`npx pagefind --site "${tempDir}" --output-path "${outputDir}"`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });

    console.log('Search index built successfully!');

    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (error) {
    console.error('Failed to build search index:', error);
    process.exit(1);
  }
}

buildSearchIndex();
