const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create a temporary HTML directory for indexing
const tempDir = path.join(__dirname, '../.pagefind-temp');
const outputDir = path.join(__dirname, '../public/pagefind');

// Ensure directories exist
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Create a simple HTML file for testing
const testHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Test Snippet</title>
  <meta name="description" content="A test code snippet">
</head>
<body>
  <h1>Test Snippet</h1>
  <p>This is a test snippet for pagefind indexing.</p>
  <pre><code>console.log('Hello World');</code></pre>
</body>
</html>`;

fs.writeFileSync(path.join(tempDir, 'test.html'), testHtml);

console.log('Building Pagefind index...');

try {
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
