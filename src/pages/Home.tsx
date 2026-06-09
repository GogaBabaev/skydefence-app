import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Phone, Shield, Truck, HeadphonesIcon, Star } from 'lucide-react';
import { products, categories } from '../data/products';
import { ProductCard } from '../components/ProductCard';

const fmtPrice = (p: number) => p.toLocaleString('ru-RU') + ' ₽';

const bannerSlides = [
  {
    label: 'Новинка',
    title: 'Детекторы БПЛА БУЛАТ V.4',
    sub: 'Всенаправленное обнаружение дронов до 3 км',
    price: 109900,
    slug: 'detektor-bulat-v4',
    bg: 'from-olive-900 to-dark',
  },
  {
    label: 'Популярное',
    title: 'Квадрокоптеры DJI Mavic 3',
    sub: 'Профессиональная аэросъёмка и разведка',
    price: 175000,
    slug: 'dji-mavic-3-classic-rc',
    bg: 'from-[#0f1509] to-[#1a2412]',
  },
  {
    label: 'Акция',
    title: 'Блокираторы дронов ГАРПИЯ',
    sub: 'Цена по запросу — звоните сейчас',
    price: null,
    slug: 'garpiya-120w',
    bg: 'from-[#1a1409] to-[#0f1509]',
  },
];

const advantages = [
  { icon: Shield,          title: 'Оригинальная продукция',  sub: 'Только официальные поставки'      },
  { icon: Truck,           title: 'Быстрая доставка',        sub: 'По всей России и СНГ'             },
  { icon: HeadphonesIcon,  title: 'Консультация эксперта',   sub: 'Поможем выбрать под задачи'       },
  { icon: Star,            title: 'Гарантия',                sub: 'Официальная гарантия на весь товар'},
];

const faqItems = [
  { q: 'Нужна ли лицензия на подавители БПЛА?', a: 'Для юридических лиц и силовых структур — да. Для частных покупок ряда моделей — нет. Наши менеджеры проконсультируют по конкретной модели.' },
  { q: 'Как оформить корпоративный заказ?', a: 'Отправьте запрос через форму или позвоните. Выставим счёт, подготовим договор и закрывающие документы.' },
  { q: 'Есть ли доставка в регионы?', a: 'Да, доставляем СДЭК, Почтой России и транспортными компаниями по всей РФ и в ряд стран СНГ.' },
  { q: 'Какие дроны DJI есть в наличии?', a: 'В наличии Mavic 3, Mini 4K, Agras, Matrice и аксессуары к ним. Актуальный список — в каталоге.' },
];

export const Home = () => {
  const [slide, setSlide]     = useState(0);
  const [activeFaq, setFaq]   = useState<number | null>(null);
  const featured              = products.slice(0, 6);
  const cur                   = bannerSlides[slide];

  return (
    <div>
      {/* ── HERO BANNER ─────────────────────────────────────── */}
      <section className={`relative bg-gradient-to-r ${cur.bg} overflow-hidden`}>
        <div className="absolute inset-0 bg-military-pattern opacity-50" />
        <div className="relative max-w-screen-xl mx-auto px-4 py-14 md:py-20">
          <motion.div
            key={slide}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-xl"
          >
            <span className="badge-new mb-4 inline-block">{cur.label}</span>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-3">
              {cur.title}
            </h1>
            <p className="text-olive-300 text-sm mb-6">{cur.sub}</p>
            <div className="flex flex-wrap gap-3 items-center">
              {cur.price ? (
                <div className="text-2xl font-bold text-white">{fmtPrice(cur.price)}</div>
              ) : (
                <div className="text-lg font-semibold text-olive-400">Цена по запросу</div>
              )}
              <Link to={`/product/${cur.slug}`} className="btn-primary">
                Подробнее <ArrowRight size={15} />
              </Link>
              <Link to="/contacts" className="btn-outline">
                Получить КП
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {bannerSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`w-5 h-1 rounded-full transition-all ${i === slide ? 'bg-olive-500 w-8' : 'bg-olive-700'}`}
            />
          ))}
        </div>
      </section>

      {/* ── CATEGORY TILES ──────────────────────────────────── */}
      <section className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">Категории</h2>
          <Link to="/catalog" className="text-xs text-olive-400 hover:text-white transition-colors flex items-center gap-1">
            Все категории <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/catalog?cat=${cat.slug}`}
                className="block bg-dark-card border border-dark-border hover:border-olive-500/40 rounded-xl p-3.5 transition-all group"
              >
                <div className="text-sm font-semibold text-olive-200 group-hover:text-white transition-colors leading-snug mb-1">
                  {cat.label}
                </div>
                <div className="text-xs text-olive-700">{cat.count} товаров</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ADVANTAGES ──────────────────────────────────────── */}
      <div className="bg-dark-card border-y border-dark-border py-5">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {advantages.map((adv) => (
              <div key={adv.title} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-olive-500/10 flex items-center justify-center shrink-0">
                  <adv.icon size={16} className="text-olive-500" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{adv.title}</div>
                  <div className="text-[10px] text-olive-600">{adv.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── POPULAR PRODUCTS ────────────────────────────────── */}
      <section className="max-w-screen-xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">Лучшие предложения</h2>
          <Link to="/catalog" className="text-xs text-olive-400 hover:text-white transition-colors flex items-center gap-1">
            Весь каталог <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featured.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CALL BACK FORM ──────────────────────────────────── */}
      <section className="bg-dark-card border-y border-dark-border py-12">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">Бесплатная консультация по всей линейке DJI!</h2>
              <p className="text-sm text-olive-500">Оставьте заявку — наш эксперт свяжется с вами!</p>
            </div>
            <CallbackForm />
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section className="max-w-screen-xl mx-auto px-4 py-10">
        <h2 className="section-title mb-6">Частые вопросы</h2>
        <div className="max-w-2xl space-y-2">
          {faqItems.map((item, i) => (
            <div key={i} className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
              <button
                onClick={() => setFaq(activeFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="text-sm font-medium text-olive-200 pr-4">{item.q}</span>
                <ChevronDown
                  size={15}
                  className={`shrink-0 text-olive-500 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`}
                />
              </button>
              {activeFaq === i && (
                <div className="px-4 pb-4 pt-1 text-sm text-olive-500 leading-relaxed border-t border-dark-border">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT TEASER ────────────────────────────────────── */}
      <section className="bg-dark-card border-t border-dark-border py-12">
        <div className="max-w-screen-xl mx-auto px-4 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <h2 className="section-title mb-3">Интернет-магазин SkyDefence</h2>
            <p className="text-sm text-olive-500 leading-relaxed max-w-xl">
              «СпецСнаряжение» — специализированный поставщик профессионального оборудования. Беспилотные системы, радиоэлектронные комплексы, спецсредства связи, оптико-электронные системы и тактическое снаряжение для силовых структур и охранных предприятий.
            </p>
            <Link to="/about" className="mt-4 inline-flex items-center gap-1.5 text-sm text-olive-400 hover:text-white transition-colors">
              О компании <ArrowRight size={13} />
            </Link>
          </div>
          <div className="flex gap-3">
            <a href="tel:+74951365777" className="btn-primary py-3.5 px-6">
              <Phone size={15} /> +7 (495) 136-5777
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

/* Inline callback form */
const CallbackForm = () => {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) return (
    <div className="flex items-center gap-3 text-olive-400 text-sm font-medium">
      <span className="w-5 h-5 rounded-full bg-olive-500/20 flex items-center justify-center text-olive-500">✓</span>
      Спасибо! Свяжемся в ближайшее время.
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
      <input
        type="text" required placeholder="Ваше имя" value={name}
        onChange={e => setName(e.target.value)}
        className="bg-dark border border-dark-border rounded-lg px-3 py-2.5 text-sm text-olive-200 placeholder-olive-700 focus:outline-none focus:border-olive-500 transition-colors"
      />
      <input
        type="tel" required placeholder="Номер телефона" value={phone}
        onChange={e => setPhone(e.target.value)}
        className="bg-dark border border-dark-border rounded-lg px-3 py-2.5 text-sm text-olive-200 placeholder-olive-700 focus:outline-none focus:border-olive-500 transition-colors"
      />
      <button type="submit" className="btn-primary whitespace-nowrap">Оставить заявку</button>
    </form>
  );
};
