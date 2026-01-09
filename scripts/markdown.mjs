/**
 * Markdown Parser - converte Markdown para HTML
 */

export function parseMarkdown(content) {
  let html = content;

  // Remove frontmatter
  const frontmatterMatch = html.match(/^---\n([\s\S]*?)\n---\n/);
  if (frontmatterMatch) {
    html = html.slice(frontmatterMatch[0].length);
  }

  // Headers
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  // Images
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" />');

  // Code inline
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

  // Lists
  html = html.replace(/^\* (.*?)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>');
  html = html.replace(/^\- (.*?)$/gm, '<li>$1</li>');

  // Blockquotes
  html = html.replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr />');

  // Paragraphs (preserve empty lines for structure)
  const lines = html.split('\n\n');
  html = lines
    .map((line) => {
      // Skip if already in a tag
      if (
        line.trim().startsWith('<') ||
        line.trim() === '' ||
        line.includes('<li>') ||
        line.includes('<blockquote>')
      ) {
        return line;
      }
      return `<p>${line}</p>`;
    })
    .join('\n\n');

  // Clean up nested tags
  html = html.replace(/<p>(<[uh]|<pre|<blockquote|<hr)/g, '$1');
  html = html.replace(/(\/[uh]>|\/pre>|\/blockquote>|hr \/>)<\/p>/g, '$1');

  // Remove multiple line breaks
  html = html.replace(/\n\n+/g, '\n\n');

  return html.trim();
}

export function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return {};

  const frontmatter = {};
  match[1].split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      frontmatter[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
    }
  });

  return frontmatter;
}
