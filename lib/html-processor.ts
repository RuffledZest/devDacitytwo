import { minify } from 'html-minifier';

export function processHtml(html: string): string {
  // First, minify the HTML
  const minified = minify(html, {
    collapseWhitespace: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
    minifyCSS: true,
    minifyJS: true
  });

  // Replace double quotes with single quotes
  return minified.replace(/"/g, "'");
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
    throw new Error(`Failed to fetch URL content: ${error.message}`);
  }
}