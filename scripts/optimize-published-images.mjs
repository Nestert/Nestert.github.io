import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE_DIR = path.resolve('src/assets/images');
const OUTPUT_DIR = path.resolve('_site/assets/images');
const MAX_DIMENSION = 2000;
const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

async function getImagePaths(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return getImagePaths(entryPath);
    }

    return SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
      ? [entryPath]
      : [];
  }));

  return paths.flat();
}

function createPipeline(sourcePath, extension) {
  const pipeline = sharp(sourcePath)
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true
    })
    .keepIccProfile();

  if (extension === '.jpg' || extension === '.jpeg') {
    return pipeline.jpeg({ quality: 82, progressive: true, mozjpeg: true });
  }

  if (extension === '.png') {
    return pipeline.png({ compressionLevel: 9, adaptiveFiltering: true });
  }

  return pipeline.webp({ quality: 82, effort: 5 });
}

async function optimizeImage(sourcePath) {
  const relativePath = path.relative(SOURCE_DIR, sourcePath);
  const outputPath = path.join(OUTPUT_DIR, relativePath);
  const extension = path.extname(sourcePath).toLowerCase();
  const sourceStats = await stat(sourcePath);
  const metadata = await sharp(sourcePath).metadata();
  const optimized = await createPipeline(sourcePath, extension).toBuffer();
  const isOversized = Math.max(metadata.width || 0, metadata.height || 0) > MAX_DIMENSION;

  if (!isOversized && optimized.byteLength >= sourceStats.size) {
    return { relativePath, before: sourceStats.size, after: sourceStats.size };
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, optimized);

  return { relativePath, before: sourceStats.size, after: optimized.byteLength };
}

const imagePaths = await getImagePaths(SOURCE_DIR);
const results = [];

for (const imagePath of imagePaths) {
  results.push(await optimizeImage(imagePath));
}

const changed = results.filter(({ before, after }) => after < before);
const bytesSaved = changed.reduce((total, { before, after }) => total + before - after, 0);

console.log(
  `Optimized ${changed.length}/${results.length} published images; saved ${(bytesSaved / 1024 / 1024).toFixed(2)} MB.`
);
