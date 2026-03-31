const defaultSiteUrl = process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.DEPLOY_URL || "http://localhost:8080";

module.exports = {
  title: "EKATERINA ROMANOVA",
  description: "Портфолио художницы Екатерины Романовой",
  url: defaultSiteUrl.replace(/\/$/, ""),
  language: "ru",
  author: "Екатерина Романова"
};
