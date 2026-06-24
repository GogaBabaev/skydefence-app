import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Tag, Clock, ArrowRight, Zap, Star, Gift } from 'lucide-react';
import { products } from '../entities/product/data/catalog.static';
import { ProductCard } from '../entities/product/ui/ProductCard';

const SD = 'https://skydefence.ru/wa-data/public/shop/products';

const fade = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: i * 0.08 },
});

const banners = [
  {
    tag: 'Скидка 20 000 ₽',
    title: 'DJI Mavic 3 Classic RC',
    sub: 'Профессиональная аэросъёмка с камерой Hasselblad',
    price: 175000,
    oldPrice: 195000,
    slug: 'dji-mavic-3-classic-rc',
    img: `${SD}/02/00/2/images/13/13.970.png`,
    accent: 'from-[#0a1a06] to-[#1a3010]',
    icon: Star,
    deadline: 'До конца месяца',
  },
  {
    tag: 'Хит + Скидка',
    title: 'DJI Mini 4K Fly More',
    sub: 'Лёгкий дрон до 249 г — не требует регистрации',
    price: 47990,
    oldPrice: 54990,
    slug: 'dji-mini-4k',
    img: `${SD}/02/00/2/images/9/9.970.png`,
    accent: 'from-[#1a1a06] to-[#0f1509]',
    icon: Zap,
    deadline: 'Ограниченное количество',
  },
];

const promoCards = [
  {
    icon: Gift,
    title: 'Скидка 10% на первый заказ',
    desc: 'При первом заказе на сумму от 30 000 ₽ — скидка 10%. Оставьте заявку и упомяните акцию.',
    label: '-10%',
    color: 'border-olive-500/30 bg-olive-500/5',
  },
  {
    icon: Tag,
    title: 'Бесплатная доставка',
    desc: 'СДЭК бесплатно при заказе от 50 000 ₽ по всей России.',
    label: '0 ₽',
    color: 'border-gold/20 bg-gold/5',
  },
  {
    icon: Star,
    title: 'Корпоративным клиентам',
    desc: 'Скидка от 5 до 20% при оптовых закупках. Спецусловия для силовых структур и охранных предприятий.',
    label: 'до -20%',
    color: 'border-olive-500/30 bg-olive-500/5',
  },
  {
    icon: Clock,
    title: 'Trade-in дронов DJI',
    desc: 'Сдайте старый дрон DJI — получите скидку на новый. Оценка онлайн, выкуп при получении.',
    label: 'Trade-in',
    color: 'border-dark-border bg-dark-card',
  },
];

const saleProducts = products.filter(p => p.badge === 'sale' || p.badge === 'hit');

export const Aktsii = () => (
  <div className="max-w-screen-xl mx-auto px-4 py-8">
    {/* Breadcrumb */}
    <div className="text-xs text-olive-600 mb-6">
      <Link to="/" className="hover:text-olive-400 transition-colors">Главная</Link>
      {' '}/{' '}
      <span className="text-olive-400">Акции и спецпредложения</span>
    </div>

    <h1 className="text-2xl font-black text-white mb-1">Акции и спецпредложения</h1>
    <p className="text-sm text-olive-500 mb-8">Актуальные скидки и выгодные предложения</p>

    {/* Big promo banners */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
      {banners.map((b, i) => (
        <motion.div key={b.slug} {...fade(i)}>
          <Link
            to={`/product/${b.slug}`}
            className={`always-dark group flex gap-4 bg-gradient-to-br ${b.accent} border border-dark-border hover:border-olive-500/40 rounded-xl p-5 transition-all overflow-hidden relative`}
          >
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, #47612e 0, #47612e 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }}
            />
            <div className="relative flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-olive-400 bg-olive-500/10 border border-olive-500/20 rounded-full px-2.5 py-1">
                  <b.icon size={10} /> {b.tag}
                </span>
                <span className="text-[10px] text-olive-700 flex items-center gap-1">
                  <Clock size={9} /> {b.deadline}
                </span>
              </div>
              <h3 className="text-lg font-black text-white mb-1">{b.title}</h3>
              <p className="text-xs text-olive-500 mb-3 leading-relaxed">{b.sub}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-white">{b.price.toLocaleString('ru-RU')} ₽</span>
                <span className="text-sm line-through text-olive-700">{b.oldPrice.toLocaleString('ru-RU')} ₽</span>
                <span className="text-xs font-bold text-green-400 bg-green-900/20 px-1.5 py-0.5 rounded">
                  -{Math.round((1 - b.price / b.oldPrice) * 100)}%
                </span>
              </div>
            </div>
            <div className="relative shrink-0 w-28 flex items-center justify-center">
              <img
                src={b.img}
                alt={b.title}
                className="w-28 h-28 object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-xl"
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
              />
            </div>
          </Link>
        </motion.div>
      ))}
    </div>

    {/* Promo cards */}
    <h2 className="section-title mb-4">Постоянные предложения</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
      {promoCards.map((c, i) => (
        <motion.div key={c.title} {...fade(i)}
          className={`rounded-xl border p-4 flex flex-col gap-3 ${c.color}`}
        >
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-lg bg-olive-500/10 flex items-center justify-center">
              <c.icon size={16} className="text-olive-500" />
            </div>
            <span className="text-lg font-black text-white">{c.label}</span>
          </div>
          <div>
            <div className="text-sm font-bold text-white mb-1">{c.title}</div>
            <div className="text-xs text-olive-600 leading-relaxed">{c.desc}</div>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Sale products */}
    {saleProducts.length > 0 && (
      <>
        <h2 className="section-title mb-4">Товары со скидкой</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {saleProducts.map((p, i) => (
            <motion.div key={p.id} {...fade(i)}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      </>
    )}

    {/* CTA */}
    <motion.div {...fade(0)}
      className="always-dark bg-gradient-to-r from-olive-900/30 to-dark-card border border-dark-border rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left"
    >
      <div className="flex-1">
        <div className="text-base font-bold text-white mb-1">Хотите индивидуальное предложение?</div>
        <div className="text-xs text-olive-500">Оставьте заявку — подберём лучшую цену для вашего запроса</div>
      </div>
      <Link to="/contacts" className="btn-primary shrink-0">
        Получить КП <ArrowRight size={13} />
      </Link>
    </motion.div>
  </div>
);
