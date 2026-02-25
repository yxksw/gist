const { createIndex } = require('pagefind');
const { listSnippets } = require('../src/lib/github');
const fs = require('fs');
const path = require('path');

async function buildSearchIndex() {
  console.log('Building search index...');

  // Create index
  const { index } = await createIndex();

  // Get all snippets
  const snippets = await listSnippets(process.env.GITHUB_TOKEN);

  console.log(`Indexing ${snippets.length} snippets...`);

  // Add each snippet to the index
  for (const snippet of snippets) {
    if (!snippet.isPublic) continue; // Only index public snippets

    const content = snippet.files.map(f => f.code).join('\n\n');
    const fileContent = `
      <html>
        <head>
          <title>${snippet.title}</title>
          <meta name="description" content="${snippet.description || ''}">
        </head>
        <body>
          <h1>${snippet.title}</h1>
          <p>${snippet.description || ''}</p>
          <pre><code>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
        </body>
      </html>
    `;

    await index.addHTMLFile({
      url: `/snippet/${snippet.id}`,
      content: fileContent,
    }, {
      language: 'zh',
    });
  }

  // Write index to public directory
  const outputDir = path.join(__dirname, '../public/pagefind');
  await index.writeFiles(outputDir);

  console.log(`Search index built successfully at ${outputDir}`);
}

buildSearchIndex().catch(err => {
  console.error('Failed to build search index:', err);
  process.exit(1);
});
