module.exports = {
  layout: "layouts/work.njk",
  eleventyComputed: {
    permalink: data => `/projects/${data.page.fileSlug}/`
  }
};
