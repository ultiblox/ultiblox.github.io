module.exports = (config) => {
  // Passthrough file copying
  config.addPassthroughCopy({ 'src/assets/img': 'assets/img' });
  config.addPassthroughCopy({ 'src/assets/img': 'assets/img' });

  // Add JS files to watch target
  config.addWatchTarget("src/assets/js/");

  // Layout Aliases
  config.addLayoutAlias('default', 'layouts/default.njk');
  config.addLayoutAlias('post', 'layouts/post.njk');
  config.addLayoutAlias('page', 'layouts/page.njk'); // New layout for pages

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
      .getFilteredByGlob('src/pages/*.njk') // Only .njk files in the 'pages' folder
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0)); // Sort by 'order' in front matter
  });

  return {
    dir: {
      input: 'src',
      output: 'dist'
    },
    // pathPrefix: "/subfolder/",
    templateFormats: ['md', 'njk', 'html'],
    dataTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk'
  };
};
