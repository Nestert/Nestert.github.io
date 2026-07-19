module.exports = {
  layout: "layouts/work.njk",
  eleventyComputed: {
    permalink: data => `/objects/${data.page.fileSlug}/`
  }
};
