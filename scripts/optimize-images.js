#!/usr/bin/env node

/**
 * Image Optimization Script
 * Generates WebP versions of images and optimizes file sizes
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.dirname(__dirname);

const INPUT_DIR = path.join(PROJECT_ROOT, 'src/img');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'src/img/optimized');

// Image quality settings
const QUALITY_SETTINGS = {
  webp: { quality: 85 },
  jpeg: { quality: 90, mozjpeg: true },
  png: { quality: 90, compressionLevel: 9 }
};

// Supported image formats
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * Ensure output directory exists
 */
function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const galleryDir = path.join(OUTPUT_DIR, 'gallery');
  if (!fs.existsSync(galleryDir)) {
    fs.mkdirSync(galleryDir, { recursive: true });
  }
}

/**
 * Get all image files from directory
 */
function getImageFiles(dir) {
  const files = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else {
        const ext = path.extname(item).toLowerCase();
        if (SUPPORTED_FORMATS.includes(ext)) {
          files.push(fullPath);
        }
      }
    });
  }
  
  scanDirectory(dir);
  return files;
}

/**
 * Optimize single image
 */
async function optimizeImage(inputPath) {
  try {
    const relativePath = path.relative(INPUT_DIR, inputPath);
    const parsedPath = path.parse(relativePath);
    const outputBase = path.join(OUTPUT_DIR, parsedPath.dir, parsedPath.name);
    
    console.log(`Processing: ${relativePath}`);
    
    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    console.log(`  Original: ${metadata.width}x${metadata.height}, ${Math.round(metadata.size / 1024)}KB`);
    
    // Create Sharp instance
    let image = sharp(inputPath);
    
    // Resize if too large (max 1920px width)
    if (metadata.width > 1920) {
      image = image.resize(1920, null, {
        withoutEnlargement: true,
        kernel: sharp.kernel.lanczos3
      });
    }
    
    // Generate WebP version
    await image
      .webp(QUALITY_SETTINGS.webp)
      .toFile(`${outputBase}.webp`);
    
    // Generate optimized original format
    const originalExt = path.extname(inputPath).toLowerCase();
    
    if (originalExt === '.jpg' || originalExt === '.jpeg') {
      await image
        .jpeg(QUALITY_SETTINGS.jpeg)
        .toFile(`${outputBase}.jpg`);
    } else if (originalExt === '.png') {
      await image
        .png(QUALITY_SETTINGS.png)
        .toFile(`${outputBase}.png`);
    }
    
    // Check file sizes
    const webpStats = fs.statSync(`${outputBase}.webp`);
    console.log(`  WebP: ${Math.round(webpStats.size / 1024)}KB`);
    
    const optimizedExt = originalExt === '.png' ? '.png' : '.jpg';
    const optimizedStats = fs.statSync(`${outputBase}${optimizedExt}`);
    console.log(`  Optimized: ${Math.round(optimizedStats.size / 1024)}KB`);
    
    console.log(`  ✓ Completed\n`);
    
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error.message);
  }
}

/**
 * Generate picture element with WebP fallback
 */
function generatePictureMarkup(imagePath, alt, className = '', width = '', height = '') {
  const baseName = path.parse(imagePath).name;
  const optimizedPath = imagePath.replace('src/img/', 'src/img/optimized/');
  const webpPath = optimizedPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const fallbackPath = optimizedPath.replace(/\.png$/i, '.jpg');
  
  const widthAttr = width ? ` width="${width}"` : '';
  const heightAttr = height ? ` height="${height}"` : '';
  const classAttr = className ? ` class="${className}"` : '';
  
  return `<picture>
  <source srcset="${webpPath}" type="image/webp">
  <img src="${fallbackPath}" alt="${alt}"${classAttr}${widthAttr}${heightAttr} loading="lazy">
</picture>`;
}

/**
 * Main optimization function
 */
async function optimizeImages() {
  console.log('🖼️  Starting image optimization...\n');
  
  ensureOutputDir();
  
  const imageFiles = getImageFiles(INPUT_DIR);
  console.log(`Found ${imageFiles.length} images to process\n`);
  
  for (const file of imageFiles) {
    await optimizeImage(file);
  }
  
  console.log('✅ Image optimization completed!');
  console.log('\n📝 Example usage in HTML:');
  console.log(generatePictureMarkup(
    'src/img/gallery/аист1.jpg',
    'Произведение Аисты - линогравюра художника Екатерины Романовой',
    'gallery__image',
    '300',
    '400'
  ));
}

// Run optimization if called directly
const isMainModule = fileURLToPath(import.meta.url) === process.argv[1];
if (isMainModule) {
  optimizeImages().catch(console.error);
}

export {
  optimizeImages,
  generatePictureMarkup
}; 