module.exports = {
  layout: "layouts/base.njk",
  pagination: {
    data: "collections.seriesProjects",
    size: 1,
    alias: "seriesProject"
  },
  permalink: (data) => data.seriesProject.url,
  eleventyComputed: {
    title: (data) => data.seriesProject.data.title,
    image: (data) => data.seriesProject.data.image,
    description: (data) => `Серия работ «${data.seriesProject.data.title}» Екатерины Романовой`
  }
};
