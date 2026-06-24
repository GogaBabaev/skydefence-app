/**
 * Полный парсинг каталога skydefence.ru -> backend/prisma/catalog.json
 *
 * Запуск:
 *   cd backend
 *   npm install cheerio
 *   node scripts/scrape-catalog.js
 *   npm run seed
 *
 * Скрипт обходит все товары во всех категориях сайта (включая новый
 * раздел "Продукция DJI Osmo"), забирает название, цену, наличие,
 * галерею изображений, описание и характеристики, и формирует
 * backend/prisma/catalog.json в формате, который понимает prisma/seed.ts.
 *
 * Полный проход занимает 15-30 минут (~330 товаров), т.к. между
 * запросами выставлена задержка, чтобы не перегружать сайт.
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const BASE = 'https://skydefence.ru';
const OUT_FILE = path.join(__dirname, '..', 'prisma', 'catalog.json');
const DELAY_MS = 350;

// slug в нашем приложении -> путь категории на сайте + человекочитаемая подпись
const CATEGORIES = [
  { slug: 'detektory-bpla', label: 'Детекторы БПЛА', path: '/category/detektory-bpla/' },
  { slug: 'podaviteli-bpla', label: 'Подавители БПЛА', path: '/category/podaviteli-bpla/' },
  { slug: 'usiliteli-signala', label: 'Усилители БПЛА', path: '/category/usiliteli-signala/' },
  { slug: 'sistemy-monitoringa-dronom', label: 'Системы постоянного питания БПЛА', path: '/category/sistemy-monitoringa-dronom/' },
  { slug: 'kvadrokoptery', label: 'Квадрокоптеры', path: '/category/kvadrokoptery/' },
  { slug: 'militar', label: 'Тактическая одежда', path: '/category/militar/' },
  { slug: 'elektrostantsii', label: 'Портативные электростанции', path: '/category/portativnye-elektrostantsii/' },
  { slug: 'sputnik', label: 'Спутниковый интернет', path: '/category/sistemy-sputnikovogo-interneta/' },
  { slug: 'produktsiya-osmo', label: 'Продукция DJI Osmo', path: '/category/produktsiya-osmo/' },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
      'Accept-Language': 'ru-RU,ru;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

function absUrl(src) {
  if (!src) return null;
  if (src.startsWith('http')) return src;
  return BASE + src;
}

/** Парсит карточки товаров со страницы категории */
function parseCategoryPage(html) {
  const $ = cheerio.load(html);
  const list = $('.s-products-list').first();
  const items = [];
  const seen = new Set();
  list.children().each((_, el) => {
    const $el = $(el);
    const a = $el.find('a[href*="/product/"]').first();
    const href = a.attr('href');
    if (!href) return;
    if (seen.has(href)) return;
    seen.add(href);

    const img = $el.find('img').first();
    const imgSrc = absUrl(img.attr('src') || img.attr('data-src'));

    let text = $el.text().replace(/\s+/g, ' ').trim();
    text = text.replace(/^--?\s*Quick view\s*/i, '').trim();

    const priceMatch = text.match(/([\d\s]+)\s*₽\s*([\d\s]*)\s*₽/);
    let price = null;
    let rest = text;
    if (priceMatch) {
      const main = priceMatch[1].replace(/\D/g, '');
      price = main ? parseInt(main, 10) : null;
      rest = text.slice(text.indexOf(priceMatch[0]) + priceMatch[0].length);
    } else if (/По запросу/.test(text)) {
      rest = text.replace(/^.*?По запросу\s*По запросу\s*0\s*₽/i, '');
      price = null;
    }

    const inStock = !/Нет в наличии/i.test(rest);
    const name = rest
      .replace(/Под заказ.*$/i, '')
      .replace(/Нет в наличии.*$/i, '')
      .replace(/В наличии.*$/i, '')
      .trim();

    const slug = href.replace(/^.*\/product\//, '').replace(/\/$/, '');
    if (!name || !slug) return;

    items.push({ slug, name, price, image: imgSrc, inStock });
  });
  return items;
}

/** Парсит страницу товара: галерея, описание, характеристики */
function parseProductPage(html) {
  const $ = cheerio.load(html);

  const h1 = $('h1').first().text().trim();

  // галерея: уникальные изображения товара, версия .700.*
  const gallerySet = new Set();
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src');
    if (src && src.includes('/products/')) {
      const abs = absUrl(src.replace(/\.\d+(x0)?\.(png|jpe?g|webp)$/i, '.700.$2'));
      gallerySet.add(abs);
    }
  });
  const gallery = [...gallerySet];

  // описание + характеристики из вкладки #overview
  const overview = $('#overview');
  let fullDescParts = [];
  const specs = [];
  if (overview.length) {
    overview.find('p').each((_, p) => {
      const $p = $(p);
      // разбиваем по <br>: html -> текстовые строки
      const html2 = $p.html() || '';
      const lines = html2
        .split(/<br\s*\/?>/i)
        .map((l) => l.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim())
        .filter(Boolean);
      for (const line of lines) {
        const m = line.match(/^([^:]{2,60}):\s*(.+)$/);
        if (m) {
          specs.push({ label: m[1].trim(), value: m[2].trim() });
        } else {
          fullDescParts.push(line);
        }
      }
    });
  }

  let fullDesc = fullDescParts.join(' ').trim();
  if (!fullDesc && specs.length) {
    fullDesc = `${h1}. Основные характеристики: ` +
      specs.slice(0, 4).map((s) => `${s.label.toLowerCase()} — ${s.value}`).join(', ') + '.';
  }
  if (!fullDesc) {
    fullDesc = `${h1}. Подробное описание уточняйте у менеджера.`;
  }

  let shortDesc = fullDescParts[0] || fullDesc;
  if (shortDesc.length > 180) shortDesc = shortDesc.slice(0, 177).trim() + '…';

  // бейдж: скидка / хит / новинка
  let badge;
  const pageText = $('body').text();
  if (/Хит продаж|ХИТ/i.test(pageText)) badge = 'hit';
  else if (/Новинка/i.test(pageText)) badge = 'new';

  // вторая цена (старая цена при скидке)
  let oldPrice;
  const priceBlockText = $('.s-product-cart, .b-product-01').first().text().replace(/\s+/g, ' ');
  const priceMatch = priceBlockText.match(/([\d\s]+)\s*₽\s*([\d\s]+)\s*₽/);
  if (priceMatch) {
    const p2 = parseInt(priceMatch[2].replace(/\D/g, ''), 10);
    if (p2 > 0) oldPrice = p2;
  }

  return { gallery, fullDesc, shortDesc, specs, badge, oldPrice, name: h1 };
}

async function main() {
  const products = new Map(); // slug -> product

  for (const cat of CATEGORIES) {
    console.log(`\n=== Категория: ${cat.label} (${cat.slug}) ===`);
    let page = 1;
    while (true) {
      const url = page === 1 ? `${BASE}${cat.path}` : `${BASE}${cat.path}?page=${page}`;
      let html;
      try {
        html = await fetchHtml(url);
      } catch (e) {
        console.warn(`  Ошибка загрузки ${url}: ${e.message}`);
        break;
      }
      const items = parseCategoryPage(html);
      if (items.length === 0) break;
      console.log(`  страница ${page}: ${items.length} товаров`);
      for (const item of items) {
        if (!products.has(item.slug)) {
          products.set(item.slug, { ...item, categorySlug: cat.slug });
        }
      }
      page += 1;
      await sleep(DELAY_MS);
      if (page > 30) break; // защита от бесконечного цикла
    }
  }

  console.log(`\nВсего уникальных товаров: ${products.size}`);
  console.log('Загрузка карточек товаров (описание/характеристики/галерея)...');

  let i = 0;
  for (const [slug, item] of products) {
    i += 1;
    const url = `${BASE}/product/${slug}/`;
    try {
      const html = await fetchHtml(url);
      const details = parseProductPage(html);
      item.gallery = details.gallery.length ? details.gallery : (item.image ? [item.image] : []);
      item.image = item.image || item.gallery[0] || '';
      item.fullDesc = details.fullDesc;
      item.shortDesc = details.shortDesc;
      item.specs = details.specs;
      if (details.badge) item.badge = details.badge;
      if (details.oldPrice) item.oldPrice = details.oldPrice;
      if (details.name) item.name = details.name;
    } catch (e) {
      console.warn(`  [${i}/${products.size}] ${slug}: ошибка ${e.message}`);
      item.gallery = item.image ? [item.image] : [];
      item.fullDesc = `${item.name}. Подробное описание уточняйте у менеджера.`;
      item.shortDesc = item.fullDesc;
      item.specs = [];
    }
    if (i % 10 === 0 || i === products.size) {
      console.log(`  [${i}/${products.size}] ${slug}`);
    }
    await sleep(DELAY_MS);
  }

  const catalog = {
    categories: CATEGORIES.map((c) => ({ slug: c.slug, label: c.label })),
    products: [...products.values()].map((p) => ({
      slug: p.slug,
      name: p.name,
      categorySlug: p.categorySlug,
      price: p.price,
      oldPrice: p.oldPrice,
      badge: p.badge,
      inStock: p.inStock,
      shortDesc: p.shortDesc,
      fullDesc: p.fullDesc,
      image: p.image,
      gallery: p.gallery,
      specs: p.specs,
    })),
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`\nГотово. Записано в ${OUT_FILE}`);
  console.log(`Категорий: ${catalog.categories.length}, товаров: ${catalog.products.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
