const path = require("path");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("static");
  eleventyConfig.addPassthroughCopy("src/assets/images");
  eleventyConfig.addPassthroughCopy("src/assets/js");
  eleventyConfig.addPassthroughCopy("src/assets/css");

  eleventyConfig.addCollection("projects", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/projects/**/*.md");
  });

  eleventyConfig.addCollection("paintings", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/paintings/**/*.md");
  });

  eleventyConfig.addCollection("drawings", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/drawings/**/*.md");
  });

  eleventyConfig.addFilter("getCategoryItems", function (collection, category) {
    return collection.filter(item => {
      const path = item.inputPath || "";
      const categoryPath = `/src/content/${category}/`;
      return path.startsWith(categoryPath) && !path.endsWith('/index.md');
    });
  });

  eleventyConfig.addFilter("sortByOrder", function (items) {
    return items.sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "md", "html", "yml", "yaml"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
