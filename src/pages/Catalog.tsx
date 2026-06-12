import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { categories } from '../entities/product/data/catalog.static';
import { useProducts } from '../entities/product/api';
import { ProductCard } from '../entities/product/ui/ProductCard';

export const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<'default'|'price_asc'|'price_desc'>('default');
  const catSlug = searchParams.get('cat') || 'all';

  const setCategory = (slug: string) => {
    if (slug === 'all') searchParams.delete('cat');
    else searchParams.set('cat', slug);
    setSearchParams(searchParams);
  };

  // catalog comes from the backend API (static bundle as offline fallback)
  const { products } = useProducts(catSlug);
  let items = products;
  if (sortBy === 'price_asc')  items = [...items].sort((a,b) => (a.price ?? 999999) - (b.price ?? 999999));
  if (sortBy === 'price_desc') items = [...items].sort((a,b) => (b.price ?? 0) - (a.price ?? 0));

  const currentCat = categories.find(c => c.slug === catSlug);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="text-xs text-olive-600 mb-4">
        <span>Главная</span> / <span>Каталог</span>
        {currentCat && <> / <span className="text-olive-400">{currentCat.label}</span></>}
      </div>

      <h1 className="section-title mb-5">
        {currentCat ? currentCat.label : 'Весь каталог'}
        <span className="ml-2 text-sm font-normal text-olive-600 normal-case">({items.length} {declOfNum(items.length, ['товар','товара','товаров'])})</span>
      </h1>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-5">
        <button
          onClick={() => setCategory('all')}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${catSlug === 'all' ? 'bg-olive-500 text-white' : 'bg-dark-card border border-dark-border text-olive-400 hover:border-olive-500/40'}`}
        >
          Все товары
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setCategory(cat.slug)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${catSlug === cat.slug ? 'bg-olive-500 text-white' : 'bg-dark-card border border-dark-border text-olive-400 hover:border-olive-500/40'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sort bar */}
      <div className="flex items-center gap-3 mb-5 text-xs text-olive-500">
        <SlidersHorizontal size={13} />
        <span>Сортировка:</span>
        {[
          { val: 'default',    label: 'По умолчанию' },
          { val: 'price_asc',  label: 'Сначала дешевле' },
          { val: 'price_desc', label: 'Сначала дороже' },
        ].map(opt => (
          <button
            key={opt.val}
            onClick={() => setSortBy(opt.val as typeof sortBy)}
            className={`transition-colors ${sortBy === opt.val ? 'text-olive-300 font-medium' : 'hover:text-olive-300'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-olive-600">Товары не найдены</div>
      )}

      {/* All products count */}
      <p className="mt-6 text-xs text-olive-700 text-center">
        Показано {items.length} из {products.length} товаров
      </p>
    </div>
  );
};

function declOfNum(n: number, words: [string,string,string]) {
  const abs = Math.abs(n) % 100;
  if (abs >= 11 && abs <= 19) return words[2];
  const mod = abs % 10;
  if (mod === 1) return words[0];
  if (mod >= 2 && mod <= 4) return words[1];
  return words[2];
}
