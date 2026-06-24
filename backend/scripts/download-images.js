/**
 * Скачивает все картинки товаров из catalog.json в папку public/images/
 * После скачивания обновляет пути в catalog.json на /images/...
 *
 * Запуск (после scrape-catalog.js):
 *   cd backend
 *   node scripts/download-images.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const CATALOG_FILE = path.join(__dirname, '..', 'prisma', 'catalog.json');
const OUT_DIR = path.join(__dirname, '..', '..', 'public', 'images');
const DELAY_MS = 100;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) return resolve('cached');
    const file = fs.createWriteStream(dest);
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://skydefence.ru/',
      },
      timeout: 15000,
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve('ok'); });
    });
    req.on('error', (e) => { file.close(); if (fs.existsSync(dest)) fs.unlinkSync(dest); reject(e); });
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function urlToLocalPath(url, slug) {
  if (!url) return null;
  const ext = (url.match(/\.(png|jpe?g|webp)(\?.*)?$/i) || [])[1] || 'jpg';
  const filename = path.basename(url).replace(/\?.*$/, '');
  return { dir: path.join(OUT_DIR, slug), filename, ext };
}

async function main() {
  const raw = fs.readFileSync(CATALOG_FILE, 'utf-8');
  const catalog = JSON.parse(raw);

  fs.mkdirSync(OUT_DIR, { recursive: true });

  let downloaded = 0, skipped = 0, failed = 0;
  const total = catalog.products.length;

  for (let i = 0; i < catalog.products.length; i++) {
    const p = catalog.products[i];
    const slug = p.slug;
    const slugDir = path.join(OUT_DIR, slug);
    fs.mkdirSync(slugDir, { recursive: true });

    const allUrls = [...new Set([p.image, ...(p.gallery || [])].filter(Boolean))];
    const newGallery = [];
    let newImage = null;

    for (const url of allUrls) {
      if (!url || !url.startsWith('http')) { newGallery.push(url); continue; }
      const filename = path.basename(url).replace(/\?.*$/, '');
      const dest = path.join(slugDir, filename);
      const publicPath = `/images/${slug}/${filename}`;

      try {
        const result = await downloadFile(url, dest);
        if (result === 'cached') skipped++;
        else { downloaded++; await sleep(DELAY_MS); }
        newGallery.push(publicPath);
        if (!newImage) newImage = publicPath;
      } catch (e) {
        console.warn(`  ✗ ${slug}/${filename}: ${e.message}`);
        failed++;
        newGallery.push(url); // keep original on failure
        if (!newImage) newImage = url;
      }
    }

    catalog.products[i].image = newImage || p.image;
    catalog.products[i].gallery = newGallery;

    if ((i + 1) % 20 === 0 || i + 1 === total) {
      console.log(`[${i + 1}/${total}] скачано: ${downloaded}, кэш: ${skipped}, ошибок: ${failed}`);
    }
  }

  fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`\nГотово. catalog.json обновлён с локальными путями.`);
  console.log(`Скачано: ${downloaded}, из кэша: ${skipped}, ошибок: ${failed}`);

  // Считаем размер папки
  const { execSync } = require('child_process');
  try {
    const size = execSync(`du -sh "${OUT_DIR}" 2>/dev/null | cut -f1`).toString().trim();
    console.log(`Размер папки images: ${size}`);
  } catch {}
}

main().catch((e) => { console.error(e); process.exit(1); });
