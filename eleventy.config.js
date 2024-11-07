const markdownIt = require("markdown-it");
const markdownItHighlightJs = require("markdown-it-highlightjs");

module.exports = (config) => {
  // Passthrough file copying
  config.addPassthroughCopy({ 'src/assets/icons': 'assets/icons' });
  config.addPassthroughCopy({ 'src/assets/img': 'assets/img' });
  config.addPassthroughCopy({ 'src/assets/css': 'assets/css' });
  config.addPassthroughCopy({ 'src/assets/js': 'assets/js' });

  // Add JS files to watch target
  config.addWatchTarget("src/assets/js/");

  // Layout Aliases
  config.addLayoutAlias('default', 'layouts/default.njk');
  config.addLayoutAlias('post', 'layouts/post.njk');
  config.addLayoutAlias('page', 'layouts/page.njk');

  // Filters
  config.addFilter('readableDate', require('./lib/filters/readableDate'));
  config.addFilter('minifyJs', require('./lib/filters/minifyJs'));

  // HTML Minification
  config.addTransform('minifyHtml', require('./lib/transforms/minifyHtml'));

  // Collections
  config.addCollection('posts', require('./lib/collections/posts'));
  config.addCollection('tagList', require('./lib/collections/tagList'));
  config.addCollection('pagedPosts', require('./lib/collections/pagedPosts'));
  config.addCollection('pagedPostsByTag', require('./lib/collections/pagedPostsByTag'));

  // New Collection for Pages with Custom Order
  config.addCollection('pages', (collectionApi) => {
    return collectionApi
      .getFilteredByGlob('src/pages/*.njk')
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  });

  // Configure Markdown-it with Highlight.js for syntax highlighting
  const md = markdownIt({
    html: true,
    breaks: true,
    typographer: true,
  }).use(markdownItHighlightJs);

  // Custom renderer for block code: use <code> only, with block styling
  md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx];
    const langClass = token.info ? `language-${md.utils.escapeHtml(token.info.trim())}` : "";
    const content = md.utils.escapeHtml(token.content);
    return `<code class="${langClass}" style="white-space: pre; display: block; overflow-x: auto; padding: 1em; background-color: #f8f9fa; border: 1px solid #ddd; border-radius: 4px;">${content}</code>`;
  };

  // Custom renderer to replace single backticks with <span class="inline-code">
  md.renderer.rules.code_inline = (tokens, idx) => {
    const content = md.utils.escapeHtml(tokens[idx].content);
    return `<span class="inline-code">${content}</span>`;
  };

  config.setLibrary("md", md);

  // Dynamic Shortcode for fetching and rendering markdown from any repository name
  config.addNunjucksAsyncShortcode("fetchMarkdown", async function(repoName) {
    const githubUrl = `https://github.com/${repoName}`;
    const readmeUrl = `https://raw.githubusercontent.com/${repoName}/main/README.md`;

    // GitHub Link with SVG Icon and right alignment
    const githubLink = `
      <div style="text-align: right; margin-bottom: 1em;">
        <a href="${githubUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; text-decoration: none; color: #0366d6;">
          <svg height="16" width="16" aria-hidden="true" viewBox="0 0 16 16" version="1.1" style="margin-right: 4px; fill: currentColor;">
            <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.548 7.548 0 012.01-.27c.68.003 1.36.093 2.01.27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
          </svg>
          View Library on GitHub
        </a>
      </div>`;

    try {
      const response = await fetch(readmeUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const markdown = await response.text();

      // Convert markdown to HTML and prepend GitHub link
      return githubLink + md.render(markdown);
    } catch (error) {
      console.error(`Error fetching markdown from URL (${readmeUrl}):`, error);
      return `<p>Error loading content from the repository README.</p>`;
    }
  });

  return {
    dir: {
      input: 'src',
      output: 'dist'
    },
    pathPrefix: process.env.PATH_PREFIX || "",
    templateFormats: ['md', 'njk', 'html'],
    dataTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk'
  };
};