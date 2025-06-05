// Simple HTML minification without external dependencies
function minifyHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/>\s+</g, '><') // Remove whitespace between tags
    .replace(/\s*\/>/g, '/>') // Clean self-closing tags
    .trim();
}

export function processHtml(html: string): string {
  // First, minify the HTML
  const minified = minifyHtml(html);

  // Replace double quotes with single quotes, being careful with nested quotes
  return minified.replace(/"/g, (match) => "'");
}

export function processMhtml(mhtmlContent: string): string {
  // Extract HTML content from MHTML
  const htmlMatch = mhtmlContent.match(/<html[^>]*>[\s\S]*<\/html>/i);
  if (!htmlMatch) {
    throw new Error('No HTML content found in MHTML file');
  }

  return processHtml(htmlMatch[0]);
}

export async function processUrlContent(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    return processHtml(html);
  } catch (error) {
    throw new Error(`Failed to fetch URL content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}