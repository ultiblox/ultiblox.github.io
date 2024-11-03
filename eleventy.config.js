const markdownIt = require("markdown-it");

module.exports = (config) => {
  // Passthrough file copying
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

  // Configure Markdown-it for custom inline and block code handling
  const md = markdownIt({
    html: true,
    breaks: true,
    typographer: true,
  });

  // Custom renderer to replace single backticks with <span class="inline-code">
  md.renderer.rules.code_inline = (tokens, idx) => {
    const content = md.utils.escapeHtml(tokens[idx].content);
    return `<span class="inline-code">${content}</span>`;
  };

  // Custom renderer for fenced code blocks
  md.renderer.rules.fence = (tokens, idx) => {
    const token = tokens[idx];
    const langClass = token.info ? `language-${md.utils.escapeHtml(token.info.trim())}` : "";
    const content = md.utils.escapeHtml(token.content);
    return `<code class="${langClass}" style="white-space: pre; display: block; overflow-x: auto; padding: 1em; background-color: #f8f9fa; border: 1px solid #ddd; border-radius: 4px;">${content}</code>`;
  };

  config.setLibrary("md", md);

  // Dynamic Shortcode for fetching and rendering markdown from any URL
  config.addNunjucksAsyncShortcode("fetchMarkdown", async function(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const markdown = await response.text();

      // Convert markdown to HTML
      return md.render(markdown);
    } catch (error) {
      console.error(`Error fetching markdown from URL (${url}):`, error);
      return "<p>Error loading content from specified URL.</p>";
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