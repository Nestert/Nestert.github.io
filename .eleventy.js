const fs = require("fs");
const path = require("path");
const Image = require("@11ty/eleventy-img");

const SERIES_COVERS_PATH = path.join(__dirname, "src", "_data", "series-covers.json");
const WORK_ORDER_PATH = path.join(__dirname, "src", "_data", "work-order.json");
const WORK_ORDER_CATEGORIES = ["projects", "paintings", "drawings", "objects"];

function getItemYear(item) {
  const year = Number(item?.data?.year);
  return Number.isFinite(year) ? year : Number.NEGATIVE_INFINITY;
}

function getItemOrder(item) {
  const order = Number(item?.data?.order);
  return Number.isFinite(order) ? order : 0;
}

function sortByYearDesc(items) {
  return [...(items || [])].sort((a, b) => {
    const yearDifference = getItemYear(b) - getItemYear(a);
    if (yearDifference !== 0) return yearDifference;

    const orderDifference = getItemOrder(a) - getItemOrder(b);
    if (orderDifference !== 0) return orderDifference;

    return String(a?.data?.title || "").localeCompare(String(b?.data?.title || ""), "ru", {
      sensitivity: "base"
    });
  });
}

function sortByOrderThenYear(items) {
  return [...(items || [])].sort((a, b) => {
    const orderDifference = getItemOrder(a) - getItemOrder(b);
    if (orderDifference !== 0) return orderDifference;

    const yearDifference = getItemYear(b) - getItemYear(a);
    if (yearDifference !== 0) return yearDifference;

    return String(a?.data?.title || "").localeCompare(String(b?.data?.title || ""), "ru", {
      sensitivity: "base"
    });
  });
}

function normalizeContentPath(value) {
  const normalized = String(value || "").trim().replace(/\\/g, "/");
  const contentIndex = normalized.lastIndexOf("src/content/");

  return contentIndex === -1
    ? normalized.replace(/^\.\//, "").replace(/^\//, "")
    : normalized.slice(contentIndex);
}

function readWorkOrder() {
  const emptyOrder = {
    series: [],
    ...Object.fromEntries(WORK_ORDER_CATEGORIES.map((category) => [category, []]))
  };

  if (!fs.existsSync(WORK_ORDER_PATH)) return emptyOrder;

  let data;

  try {
    data = JSON.parse(fs.readFileSync(WORK_ORDER_PATH, "utf8"));
  } catch (error) {
    throw new Error(`Не удалось прочитать порядок работ: ${error.message}`);
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Файл порядка работ должен содержать объект с массивами категорий.");
  }

  const categoryOrder = Object.fromEntries(WORK_ORDER_CATEGORIES.map((category) => {
    const entries = data[category] ?? [];

    if (!Array.isArray(entries)) {
      throw new Error(`В порядке работ поле «${category}» должно быть массивом.`);
    }

    const seen = new Set();
    const normalizedEntries = entries.map((entry, index) => {
      if (typeof entry !== "string") {
        throw new Error(
          `В порядке работ «${category}» запись ${index + 1} должна быть ссылкой на файл.`
        );
      }

      const normalizedPath = normalizeContentPath(entry);
      const expectedPrefix = `src/content/${category}/`;

      if (!normalizedPath.startsWith(expectedPrefix) || !normalizedPath.endsWith(".md")) {
        throw new Error(
          `В порядке работ «${category}» указан файл из другой категории: «${entry}».`
        );
      }

      if (seen.has(normalizedPath)) {
        throw new Error(
          `В порядке работ «${category}» файл «${entry}» добавлен дважды.`
        );
      }

      seen.add(normalizedPath);
      return normalizedPath;
    });

    return [category, normalizedEntries];
  }));

  const seriesEntries = data.series ?? [];

  if (!Array.isArray(seriesEntries)) {
    throw new Error("В порядке работ поле «series» должно быть массивом.");
  }

  const seenSeries = new Set();
  const series = seriesEntries.map((entry, index) => {
    if (typeof entry !== "string") {
      throw new Error(
        `В порядке серий запись ${index + 1} должна быть названием серии.`
      );
    }

    const key = normalizeSeriesName(entry);

    if (!key) {
      throw new Error(`В порядке серий у записи ${index + 1} не указано название.`);
    }

    if (seenSeries.has(key)) {
      throw new Error(`В порядке серий название «${entry}» добавлено дважды.`);
    }

    seenSeries.add(key);
    return key;
  });

  return { series, ...categoryOrder };
}

function sortByConfiguredWorkOrder(items, category) {
  const fallbackItems = sortByOrderThenYear(items);
  const configuredOrder = readWorkOrder()[category] || [];
  const ranks = new Map(configuredOrder.map((itemPath, index) => [itemPath, index]));

  return fallbackItems.sort((a, b) => {
    const aRank = ranks.get(normalizeContentPath(a?.inputPath));
    const bRank = ranks.get(normalizeContentPath(b?.inputPath));
    const aIsConfigured = aRank !== undefined;
    const bIsConfigured = bRank !== undefined;

    if (aIsConfigured && bIsConfigured) return aRank - bRank;
    if (aIsConfigured) return -1;
    if (bIsConfigured) return 1;
    return 0;
  });
}

function normalizeSeriesName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("ru-RU");
}

function groupWorksBySeries(items) {
  const groups = new Map();

  (items || []).forEach((item) => {
    const seriesKey = normalizeSeriesName(item?.data?.series);

    if (!groups.has(seriesKey)) {
      groups.set(seriesKey, []);
    }

    groups.get(seriesKey).push(item);
  });

  return Array.from(groups.values()).flat();
}

function sortSeriesByConfiguredOrder(items) {
  const fallbackItems = sortByOrderThenYear(items);
  const configuredOrder = readWorkOrder().series || [];
  const ranks = new Map(configuredOrder.map((seriesKey, index) => [seriesKey, index]));

  return fallbackItems.sort((a, b) => {
    const aRank = ranks.get(normalizeSeriesName(a?.data?.title));
    const bRank = ranks.get(normalizeSeriesName(b?.data?.title));
    const aIsConfigured = aRank !== undefined;
    const bIsConfigured = bRank !== undefined;

    if (aIsConfigured && bIsConfigured) return aRank - bRank;
    if (aIsConfigured) return -1;
    if (bIsConfigured) return 1;
    return 0;
  });
}

function startsNewSeries(items, index) {
  const position = Number(index);

  if (!Number.isInteger(position) || position <= 0) return false;

  const currentSeries = normalizeSeriesName(items?.[position]?.data?.series);
  const previousSeries = normalizeSeriesName(items?.[position - 1]?.data?.series);

  return currentSeries !== previousSeries;
}

function slugifySeriesName(value) {
  const transliteration = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z",
    и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "shch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya"
  };

  const transliterated = String(value || "")
    .trim()
    .toLocaleLowerCase("ru-RU")
    .split("")
    .map((character) => transliteration[character] ?? character)
    .join("");

  return transliterated
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readSeriesCovers() {
  if (!fs.existsSync(SERIES_COVERS_PATH)) return new Map();

  let entries;

  try {
    entries = JSON.parse(fs.readFileSync(SERIES_COVERS_PATH, "utf8"));
  } catch (error) {
    throw new Error(`Не удалось прочитать настройки обложек серий: ${error.message}`);
  }

  if (!Array.isArray(entries)) {
    throw new Error("Настройки обложек серий должны быть массивом.");
  }

  const settings = new Map();

  entries.forEach((entry, index) => {
    const name = String(entry?.name || "").trim().replace(/\s+/g, " ");
    const key = normalizeSeriesName(name);

    if (!key) {
      throw new Error(`В настройках обложек серий у записи ${index + 1} не указано название.`);
    }

    if (!entry.image) {
      throw new Error(`В настройках серии «${name}» не указана обложка.`);
    }

    if (settings.has(key)) {
      throw new Error(`В настройках обложек найден дубль серии «${name}».`);
    }

    const hasOrder = entry.order !== undefined && entry.order !== null && entry.order !== "";
    const order = hasOrder ? Number(entry.order) : 0;

    if (!Number.isFinite(order)) {
      throw new Error(`В настройках серии «${name}» поле «Порядок» должно быть числом.`);
    }

    settings.set(key, {
      image: entry.image,
      thumbnail_position: entry.thumbnail_position,
      order
    });
  });

  return settings;
}

function createSeriesProjects(collectionApi) {
  const sourceItems = [
    ...collectionApi.getFilteredByGlob("src/content/paintings/**/*.md"),
    ...collectionApi.getFilteredByGlob("src/content/drawings/**/*.md"),
    ...collectionApi.getFilteredByGlob("src/content/objects/**/*.md")
  ];
  const groups = new Map();

  sourceItems.forEach((item) => {
    const title = String(item.data.series || "").trim().replace(/\s+/g, " ");
    const key = normalizeSeriesName(title);

    if (!key) return;

    if (!groups.has(key)) {
      groups.set(key, { title, members: [] });
    }

    groups.get(key).members.push(item);
  });

  const seriesSettings = readSeriesCovers();
  const usedSlugs = new Map();

  const seriesProjects = [...groups.entries()].map(([key, group]) => {
    const members = sortByOrderThenYear(group.members);
    const years = members
      .map(getItemYear)
      .filter(Number.isFinite);
    const newestYear = Math.max(...years);
    const oldestYear = Math.min(...years);
    const yearLabel = newestYear === oldestYear ? String(newestYear) : `${oldestYear}–${newestYear}`;
    const slug = slugifySeriesName(group.title);

    if (!slug) {
      throw new Error(`Не удалось сформировать адрес для серии «${group.title}».`);
    }

    if (usedSlugs.has(slug)) {
      throw new Error(
        `Серии «${usedSlugs.get(slug)}» и «${group.title}» получают одинаковый адрес «${slug}».`
      );
    }

    usedSlugs.set(slug, group.title);

    const settings = seriesSettings.get(key);
    const newestMember = sortByYearDesc(group.members)[0];
    const automaticCover = newestMember?.data?.thumbnail || newestMember?.data?.image;
    const image = settings?.image || automaticCover;
    const thumbnailPosition = settings
      ? settings.thumbnail_position
      : newestMember?.data?.thumbnail_position;

    if (!image) {
      throw new Error(`Для серии «${group.title}» не удалось определить обложку.`);
    }

    return {
      url: `/projects/series/${slug}/`,
      data: {
        title: group.title,
        year: newestYear,
        yearLabel,
        order: settings?.order ?? 0,
        image,
        thumbnail: image,
        thumbnail_position: thumbnailPosition,
        members,
        isGeneratedSeries: true
      }
    };
  });

  return sortSeriesByConfiguredOrder(seriesProjects);
}

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

  if (attrs.style) {
    htmlAttributes.style = attrs.style;
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

function formatThumbnailPosition(position) {
  if (!position || typeof position !== "object") return "";

  const hasX = position.x !== undefined && position.x !== null && position.x !== "";
  const hasY = position.y !== undefined && position.y !== null && position.y !== "";

  if (!hasX && !hasY) return "";

  const clampPercentage = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(100, Math.max(0, number)) : 50;
  };

  return `--thumbnail-focus-x: ${clampPercentage(position.x)}%; --thumbnail-focus-y: ${clampPercentage(position.y)}%;`;
}

function openLinksInNewTab(html) {
  if (!html) return html;

  return html.replace(/<a\b([^>]*)>/gi, (match, attributes) => {
    const cleanedAttributes = attributes
      .replace(/\s+target\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/\s+rel\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

    return `<a${cleanedAttributes} target="_blank" rel="noopener noreferrer">`;
  });
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("static");
  eleventyConfig.addPassthroughCopy({ "static/favicon.ico": "favicon.ico" });
  eleventyConfig.addPassthroughCopy("src/assets/images");
  eleventyConfig.addPassthroughCopy("src/assets/js");
  eleventyConfig.addPassthroughCopy("src/assets/css");

  eleventyConfig.addCollection("projects", function (collectionApi) {
    return sortByConfiguredWorkOrder(
      collectionApi.getFilteredByGlob("src/content/projects/**/*.md"),
      "projects"
    );
  });

  eleventyConfig.addCollection("paintings", function (collectionApi) {
    return groupWorksBySeries(
      sortByConfiguredWorkOrder(
        collectionApi.getFilteredByGlob("src/content/paintings/**/*.md"),
        "paintings"
      )
    );
  });

  eleventyConfig.addCollection("drawings", function (collectionApi) {
    return groupWorksBySeries(
      sortByConfiguredWorkOrder(
        collectionApi.getFilteredByGlob("src/content/drawings/**/*.md"),
        "drawings"
      )
    );
  });

  eleventyConfig.addCollection("objects", function (collectionApi) {
    return groupWorksBySeries(
      sortByConfiguredWorkOrder(
        collectionApi.getFilteredByGlob("src/content/objects/**/*.md"),
        "objects"
      )
    );
  });

  eleventyConfig.addCollection("seriesProjects", function (collectionApi) {
    return createSeriesProjects(collectionApi);
  });

  eleventyConfig.addCollection("projectIndexItems", function (collectionApi) {
    return [
      ...createSeriesProjects(collectionApi),
      ...sortByConfiguredWorkOrder(
        collectionApi.getFilteredByGlob("src/content/projects/**/*.md"),
        "projects"
      )
    ];
  });

  eleventyConfig.addFilter("sortByYearDesc", function (items) {
    return sortByYearDesc(items);
  });

  eleventyConfig.addFilter("sortByOrderThenYear", function (items) {
    return sortByOrderThenYear(items);
  });

  eleventyConfig.addFilter("startsNewSeries", function (items, index) {
    return startsNewSeries(items, index);
  });

  eleventyConfig.addFilter("getAdjacentWork", function (items, currentUrl, direction) {
    const sortedItems = [...(items || [])];
    const currentIndex = sortedItems.findIndex((item) => item.url === currentUrl);

    if (currentIndex === -1) return null;

    const offset = direction === "previous" ? -1 : 1;
    return sortedItems[currentIndex + offset] || null;
  });

  eleventyConfig.addFilter("openLinksInNewTab", openLinksInNewTab);

  eleventyConfig.addNunjucksAsyncShortcode("cardImage", async function (
    src,
    alt,
    className = "",
    loading = "lazy",
    fetchpriority = "",
    thumbnailPosition = null,
    sizes = "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
  ) {
    return renderImage(src, alt, {
      class: className,
      style: formatThumbnailPosition(thumbnailPosition)
    }, {
      widths: [320, 640, 960, 1200],
      sizes,
      loading,
      fetchpriority
    });
  });

  eleventyConfig.addNunjucksAsyncShortcode("detailImage", async function (
    src,
    alt,
    className = "",
    loading = "eager",
    fetchpriority = "high"
  ) {
    return renderImage(src, alt, { class: className }, {
      widths: [800, 1200, 1600],
      sizes: "(min-width: 932px) 900px, 100vw",
      loading,
      fetchpriority
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
