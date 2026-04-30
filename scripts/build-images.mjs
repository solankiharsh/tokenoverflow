/**
 * Convert PNG/JPG images in public/ to AVIF and WebP siblings.
 * Run: node scripts/build-images.mjs
 *
 * Each source image (e.g. public/foo.png) produces:
 *   public/foo.avif
 *   public/foo.webp
 *
 * Existing outputs are skipped unless --force is passed.
 */

import { readdir, stat } from "node:fs/promises";
import { join, basename, extname } from "node:path";
import sharp from "sharp";

const PUBLIC_DIR = new URL("../public", import.meta.url).pathname;
const FORCE = process.argv.includes("--force");
const SUPPORTED = new Set([".png", ".jpg", ".jpeg"]);

async function convertImage(srcPath, stemPath) {
  for (const [fmt, ext] of [
    ["avif", ".avif"],
    ["webp", ".webp"],
  ]) {
    const destPath = stemPath + ext;
    try {
      await stat(destPath);
      if (!FORCE) {
        console.log(`  skip  ${basename(destPath)} (exists)`);
        continue;
      }
    } catch {
      // file doesn't exist — proceed
    }
    try {
      await sharp(srcPath)[fmt]({ quality: 80 }).toFile(destPath);
      console.log(`  wrote ${basename(destPath)}`);
    } catch (err) {
      console.error(`  ERROR converting ${basename(srcPath)} to ${fmt}:`, err.message);
    }
  }
}

const files = await readdir(PUBLIC_DIR);
const images = files.filter((f) => SUPPORTED.has(extname(f).toLowerCase()));

if (images.length === 0) {
  console.log("No PNG/JPG images found in public/");
  process.exit(0);
}

for (const file of images) {
  const srcPath = join(PUBLIC_DIR, file);
  const stemPath = join(PUBLIC_DIR, basename(file, extname(file)));
  console.log(`Processing ${file}…`);
  await convertImage(srcPath, stemPath);
}

console.log("Done.");
