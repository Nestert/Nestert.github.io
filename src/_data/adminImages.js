const fs = require("fs");
const path = require("path");

const IMAGE_ROOT = path.join(__dirname, "..", "assets", "images");
const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function collectImages(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectImages(entryPath);
    }

    if (!SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      return [];
    }

    const relativePath = path.relative(IMAGE_ROOT, entryPath).split(path.sep).join("/");
    const category = path.dirname(relativePath) === "." ? "Общие" : path.dirname(relativePath);

    return [{
      label: `${category} / ${path.basename(relativePath)}`,
      url: `/assets/images/${relativePath}`
    }];
  });
}

module.exports = function () {
  return collectImages(IMAGE_ROOT).sort((a, b) => a.label.localeCompare(b.label, "ru", {
    numeric: true,
    sensitivity: "base"
  }));
};
