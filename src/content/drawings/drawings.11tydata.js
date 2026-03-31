module.exports = {
  layout: "layouts/work.njk",
  eleventyComputed: {
    permalink: data => `/drawings/${data.page.fileSlug}/`
  }
};
