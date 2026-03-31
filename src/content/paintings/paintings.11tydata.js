module.exports = {
  layout: "layouts/work.njk",
  eleventyComputed: {
    permalink: data => `/paintings/${data.page.fileSlug}/`
  }
};
