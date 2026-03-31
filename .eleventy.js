const path = require("path");
const Image = require("@11ty/eleventy-img");

function resolveImageSource(src) {
  if (!src) {
    throw new Error("Missing image source.");
  }

  if (/^https?:\/\//.test(src)) {
    return src;
  }

  return path.join(__dirname, "src", src.replace(/^\//, ""));
}

async function renderImage(src, alt, attrs = {}, options = {}) {
  const metadata = await Image(resolveImageSource(src), {
    widths: options.widths || [null],
    formats: options.formats || ["webp", null],
    outputDir: "./_site/assets/images/optimized/",
    urlPath: "/assets/images/optimized/"
  });

  const htmlAttributes = {
    alt,
    loading: options.loading || "lazy",
    decoding: options.decoding || "async"
  };

  if (attrs.class) {
    htmlAttributes.class = attrs.class;
  }

  if (options.sizes) {
    htmlAttributes.sizes = options.sizes;
  }

  if (options.fetchpriority) {
    htmlAttributes.fetchpriority = options.fetchpriority;
  }

  return Image.generateHTML(metadata, htmlAttributes, {
    whitespaceMode: "inline"
  });
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("static");
  eleventyConfig.addPassthroughCopy({ "static/favicon.ico": "favicon.ico" });
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

  eleventyConfig.addFilter("sortByOrder", function (items) {
    return [...items].sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  });

  eleventyConfig.addNunjucksAsyncShortcode("cardImage", async function (src, alt, className = "") {
    return renderImage(src, alt, { class: className }, {
      widths: [320, 640, 960],
      sizes: "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
    });
  });

  eleventyConfig.addNunjucksAsyncShortcode("detailImage", async function (src, alt, className = "") {
    return renderImage(src, alt, { class: className }, {
      widths: [800, 1200, 1600],
      sizes: "(min-width: 932px) 900px, 100vw",
      loading: "eager",
      fetchpriority: "high"
    });
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
