import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../shared/api/http';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ChevronDown, Phone, Shield, Truck,
  HeadphonesIcon, Award, Zap, Package, Clock,
  Radio, Target, Cpu, Backpack, MapPin, Star,
} from 'lucide-react';
import { products, categories } from '../entities/product/data/catalog.static';
import { ProductCard } from '../entities/product/ui/ProductCard';

const SD = 'https://skydefence.ru/wa-data/public/shop/products';

const fmtPrice = (p: number) => p.toLocaleString('ru-RU') + ' ₽';

/* ─── Hero slides ─────────────────────────────────────────────── */
const heroSlides = [
  {
    badge: 'Хит продаж',
    title: 'БУЛАТ V.4',
    subtitle: 'Всенаправленный детектор дронов',
    desc: 'Обнаружение БПЛА на расстоянии до 3 000 м. Пассивная система, 360°, автономность 8–12 часов.',
    price: 109900,
    slug: 'detektor-bulat-v4',
    img: `${SD}/11/01/111/images/460/460.970.png`,
    accent: '#47612e',
  },
  {
    badge: 'Новинка',
    title: 'ГАРПИЯ 120W',
    subtitle: 'Блокиратор дронов 6 каналов',
    desc: '120 Вт мощности, дальность подавления до 2 км. Блокирует GPS, 2.4/5.8 ГГц, 433/868 МГц.',
    price: null,
    slug: 'garpiya-120w',
    img: `${SD}/22/00/22/images/131/131.970.png`,
    accent: '#c8a84b',
  },
  {
    badge: 'Акция',
    title: 'DJI Mavic 3 Classic RC',
    subtitle: 'Профессиональный квадрокоптер',
    desc: 'Камера Hasselblad 4/3 CMOS, полёт 46 мин, дальность 15 км. Скидка 20 000 ₽.',
    price: 175000,
    oldPrice: 195000,
    slug: 'dji-mavic-3-classic-rc',
    img: `${SD}/02/00/2/images/13/13.970.png`,
    accent: '#47612e',
  },
];

/* ─── Category cards ──────────────────────────────────────────── */
const catCards = [
  { slug: 'detektory-bpla',  label: 'Детекторы БПЛА',   icon: Radio,    img: `${SD}/11/01/111/images/460/460.750x0.png`,  count: 7  },
  { slug: 'podaviteli-bpla', label: 'Подавители БПЛА',  icon: Target,   img: `${SD}/22/00/22/images/131/131.750x0.png`,   count: 49 },
  { slug: 'kvadrokoptery',   label: 'Квадрокоптеры',    icon: Cpu,      img: `${SD}/02/00/2/images/13/13.750x0.png`,      count: 139},
  { slug: 'militar',         label: 'Тактическое снаряжение', icon: Backpack, img: `${SD}/53/01/153/images/733/733.750x0.png`, count: 41 },
];

/* ─── Advantages ──────────────────────────────────────────────── */
const advantages = [
  { icon: Shield,         title: 'Оригинальная продукция',  sub: 'Только официальные поставки'       },
  { icon: Truck,          title: 'Быстрая доставка',        sub: 'По всей России и СНГ'              },
  { icon: HeadphonesIcon, title: 'Консультация эксперта',   sub: 'Поможем выбрать под задачи'        },
  { icon: Award,          title: 'Официальная гарантия',    sub: 'На весь ассортимент магазина'      },
];

/* ─── Promo banners ───────────────────────────────────────────── */
const promos = [
  {
    label: 'Акция',
    title: 'Скидка на DJI Mavic 3',
    sub: 'Сэкономьте 20 000 ₽',
    price: 175000,
    oldPrice: 195000,
    slug: 'dji-mavic-3-classic-rc',
    img: `${SD}/02/00/2/images/13/13.750x0.png`,
    color: 'from-[#0a1a06] to-[#1a2e10]',
  },
  {
    label: 'Хит',
    title: 'Детектор БУЛАТ V.4',
    sub: '109 900 ₽ — в наличии',
    price: 109900,
    slug: 'detektor-bulat-v4',
    img: `${SD}/11/01/111/images/460/460.750x0.png`,
    color: 'from-[#141f08] to-[#0f1509]',
  },
];

/* ─── Delivery options ────────────────────────────────────────── */
const deliveryOptions = [
  { icon: Package, title: 'СДЭК',             sub: '1–5 дней по всей России'      },
  { icon: Truck,   title: 'Транспортные компании', sub: 'Крупногабаритный груз'   },
  { icon: MapPin,  title: 'Самовывоз',         sub: 'Москва, офис на Тверской'    },
  { icon: Clock,   title: 'Срочная доставка',  sub: 'По Москве — день в день'     },
];

/* ─── FAQ ─────────────────────────────────────────────────────── */
const faqItems = [
  { q: 'Нужна ли лицензия на подавители БПЛА?',  a: 'Для юридических лиц и силовых структур — да. Для частных покупок ряда моделей — нет. Наши менеджеры проконсультируют по конкретной модели.' },
  { q: 'Как оформить корпоративный заказ?',       a: 'Отправьте запрос через форму или позвоните. Выставим счёт, подготовим договор и закрывающие документы.' },
  { q: 'Есть ли доставка в регионы?',             a: 'Да, доставляем СДЭК, Почтой России и транспортными компаниями по всей РФ и в ряд стран СНГ.' },
  { q: 'Какие дроны DJI есть в наличии?',         a: 'В наличии Mavic 3, Mini 4K, Agras, Matrice и аксессуары к ним. Актуальный список — в каталоге.' },
];

/* ─── Stats ───────────────────────────────────────────────────── */
const stats = [
  { value: '8+',    label: 'лет на рынке'         },
  { value: '2 000+', label: 'выполненных заказов' },
  { value: '260+',  label: 'товаров в каталоге'   },
  { value: '24/7',  label: 'поддержка клиентов'   },
];

/* ════════════════════════════════════════════════════════════════ */
export const Home = () => {
  const [slide, setSlide]   = useState(0);
  const [activeFaq, setFaq] = useState<number | null>(null);
  const featured             = products.filter(p => p.badge === 'hit' || p.badge === 'sale').slice(0, 4);
  const allFeatured          = products.slice(0, 8);
  const cur                  = heroSlides[slide];

  /* Auto-advance hero */
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="overflow-x-hidden">

      {/* ══ HERO BANNER ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden always-dark" style={{ minHeight: 480 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {/* Background product image */}
            <div
              className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 bg-no-repeat bg-center bg-contain opacity-20 md:opacity-40"
              style={{ backgroundImage: `url(${cur.img})`, backgroundPosition: 'right center' }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/90 to-transparent" />
            <div className="absolute inset-0 bg-military-pattern opacity-30" />
          </motion.div>
        </AnimatePresence>

        <div className="relative max-w-screen-xl mx-auto px-4 py-16 md:py-24 flex">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.4 }}
              className="max-w-lg"
            >
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-olive-400 bg-olive-500/10 border border-olive-500/20 rounded-full px-3 py-1 mb-4">
                {cur.badge}
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-none mb-1">
                {cur.title}
              </h1>
              <p className="text-sm font-semibold text-olive-400 uppercase tracking-wider mb-3">
                {cur.subtitle}
              </p>
              <p className="text-sm text-olive-500 leading-relaxed mb-6 max-w-sm">
                {cur.desc}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {cur.price ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">{fmtPrice(cur.price)}</span>
                    {cur.oldPrice && (
                      <span className="text-sm line-through text-olive-700">{fmtPrice(cur.oldPrice)}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-lg font-semibold text-olive-400">Цена по запросу</span>
                )}
                <Link to={`/product/${cur.slug}`} className="btn-primary">
                  Подробнее <ArrowRight size={14} />
                </Link>
                <Link to="/contacts" className="btn-outline">Получить КП</Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Product image (desktop) */}
          <div className="hidden md:flex flex-1 items-center justify-end">
            <AnimatePresence mode="wait">
              <motion.img
                key={slide}
                src={cur.img}
                alt={cur.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5 }}
                className="w-72 h-72 object-contain drop-shadow-2xl"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </AnimatePresence>
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-1 rounded-full transition-all duration-300 ${i === slide ? 'w-8 bg-olive-500' : 'w-3 bg-olive-700 hover:bg-olive-600'}`}
            />
          ))}
        </div>
      </section>

      {/* ══ ADVANTAGES BAR ═══════════════════════════════════════ */}
      <div className="bg-dark-card border-y border-dark-border">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
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

      {/* ══ CATEGORY CARDS ═══════════════════════════════════════ */}
      <section className="max-w-screen-xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">Категории товаров</h2>
          <Link to="/catalog" className="text-xs text-olive-400 hover:text-white transition-colors flex items-center gap-1">
            Весь каталог <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {catCards.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <Link
                to={`/catalog?cat=${cat.slug}`}
                className="group block bg-dark-card border border-dark-border hover:border-olive-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-olive-900/30"
              >
                {/* Image */}
                <div className="aspect-[4/3] relative overflow-hidden bg-dark flex items-center justify-center p-4">
                  <img
                    src={cat.img}
                    alt={cat.label}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = 'none';
                      (el.parentElement as HTMLElement).innerHTML = `<div class="w-12 h-12 text-olive-700 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></div>`;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-card/80 to-transparent" />
                </div>
                {/* Label */}
                <div className="px-3 py-2.5 border-t border-dark-border">
                  <div className="text-sm font-semibold text-olive-200 group-hover:text-white transition-colors leading-snug">
                    {cat.label}
                  </div>
                  <div className="text-[10px] text-olive-700 mt-0.5">{cat.count} товаров</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Remaining category chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.filter(c => !catCards.find(cc => cc.slug === c.slug)).map(cat => (
            <Link
              key={cat.slug}
              to={`/catalog?cat=${cat.slug}`}
              className="text-xs text-olive-400 bg-dark-card border border-dark-border hover:border-olive-500/40 hover:text-white rounded-full px-3 py-1.5 transition-all"
            >
              {cat.label}
              <span className="ml-1 text-olive-700">{cat.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ ХИТЫ ПРОДАЖ ══════════════════════════════════════════ */}
      <section className="max-w-screen-xl mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">
            <Star size={16} className="text-gold inline-block mr-2 -mt-0.5" />
            Хиты продаж
          </h2>
          <Link to="/catalog" className="text-xs text-olive-400 hover:text-white transition-colors flex items-center gap-1">
            Все товары <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {allFeatured.map((p, i) => (
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

      {/* ══ АКЦИИ (PROMO BANNERS) ════════════════════════════════ */}
      <section className="max-w-screen-xl mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">
            <Zap size={16} className="text-gold inline-block mr-2 -mt-0.5" />
            Акции и спецпредложения
          </h2>
          <Link to="/aktsii" className="text-xs text-olive-400 hover:text-white transition-colors flex items-center gap-1">
            Все акции <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promos.map((promo, i) => (
            <motion.div
              key={promo.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/product/${promo.slug}`}
                className={`always-dark group flex items-center gap-4 bg-gradient-to-r ${promo.color} border border-dark-border hover:border-olive-500/40 rounded-xl p-4 md:p-5 transition-all overflow-hidden relative`}
              >
                <div className="absolute inset-0 bg-military-pattern opacity-20" />
                <div className="relative shrink-0">
                  <img
                    src={promo.img}
                    alt={promo.title}
                    className="w-20 h-20 md:w-28 md:h-28 object-contain group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                  />
                </div>
                <div className="relative flex-1 min-w-0">
                  <span className="badge-sale mb-1.5 inline-block">{promo.label}</span>
                  <h3 className="text-base font-bold text-white leading-tight mb-1">{promo.title}</h3>
                  <p className="text-xs text-olive-500 mb-3">{promo.sub}</p>
                  <div className="flex items-center gap-2">
                    {promo.price && (
                      <span className="text-lg font-bold text-white">{fmtPrice(promo.price)}</span>
                    )}
                    {promo.oldPrice && (
                      <span className="text-xs line-through text-olive-700">{fmtPrice(promo.oldPrice)}</span>
                    )}
                  </div>
                </div>
                <div className="relative shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={20} className="text-olive-400" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ О КОМПАНИИ ═══════════════════════════════════════════ */}
      <section className="bg-dark-card border-y border-dark-border py-12">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Text */}
            <div>
              <h2 className="section-title mb-4">Интернет-магазин SkyDefence</h2>
              <p className="text-sm text-olive-500 leading-relaxed mb-4">
                «СпецСнаряжение» — специализированный поставщик профессионального оборудования и технических средств специального назначения. Работаем с 2016 года.
              </p>
              <p className="text-sm text-olive-500 leading-relaxed mb-6">
                В ассортименте: детекторы и подавители БПЛА, квадрокоптеры DJI, тактическое снаряжение, портативные электростанции и спутниковый интернет для силовых структур и охранных предприятий.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/about" className="btn-outline text-sm">
                  О компании <ArrowRight size={13} />
                </Link>
                <a href="tel:+74951365777" className="btn-primary text-sm">
                  <Phone size={13} /> +7 (495) 136-5777
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <div key={s.value} className="bg-dark border border-dark-border rounded-xl p-4 text-center">
                  <div className="text-3xl font-black text-olive-400 mb-1">{s.value}</div>
                  <div className="text-xs text-olive-600">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ ДОСТАВКА ════════════════════════════════════════════ */}
      <section className="max-w-screen-xl mx-auto px-4 py-10">
        <h2 className="section-title mb-5">Доставка по всей России</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {deliveryOptions.map((d) => (
            <div key={d.title} className="bg-dark-card border border-dark-border rounded-xl p-4 flex flex-col items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-olive-500/10 flex items-center justify-center">
                <d.icon size={16} className="text-olive-500" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white mb-0.5">{d.title}</div>
                <div className="text-xs text-olive-600">{d.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-olive-700 text-center">
          Бесплатная доставка СДЭК при заказе от 50 000 ₽ · Самовывоз: Москва, ул. Тверская (уточняйте при заказе)
        </p>
      </section>

      {/* ══ CALLBACK FORM ═══════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-olive-900/30 to-dark-card border-y border-dark-border py-12">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl font-bold text-white mb-2">Бесплатная консультация</h2>
              <p className="text-sm text-olive-500">
                Оставьте заявку — эксперт свяжется с вами в течение 30 минут и поможет подобрать оборудование под ваши задачи.
              </p>
            </div>
            <CallbackForm />
          </div>
        </div>
      </section>

      {/* ══ FAQ ════════════════════════════════════════════════ */}
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

    </div>
  );
};

/* ─── Inline callback form component ──────────────────────────── */
const CallbackForm = () => {
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [name, setName]       = useState('');
  const [phone, setPhone]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api('/b2b-requests', {
        method: 'POST',
        body: {
          company: 'Физическое лицо',
          contactName: name,
          phone,
          message: 'Запрос обратного звонка с главной страницы',
        },
      });
      setSent(true);
    } catch {
      setError('Не удалось отправить заявку. Позвоните нам: +7 (495) 136-5777');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex items-center gap-2 text-olive-400 text-sm font-medium bg-olive-500/10 px-4 py-2.5 rounded-xl border border-olive-500/20">
        <span className="w-5 h-5 rounded-full bg-olive-500/20 flex items-center justify-center text-olive-400 text-xs">✓</span>
        Спасибо! Свяжемся в ближайшее время.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
      <input
        type="text" required placeholder="Ваше имя" value={name}
        onChange={e => setName(e.target.value)}
        className="bg-dark border border-dark-border rounded-lg px-3 py-2.5 text-sm text-olive-200 placeholder-olive-700 focus:outline-none focus:border-olive-500 transition-colors min-w-0 sm:w-40"
      />
      <input
        type="tel" required placeholder="+7 (999) 000-00-00" value={phone}
        onChange={e => setPhone(e.target.value)}
        className="bg-dark border border-dark-border rounded-lg px-3 py-2.5 text-sm text-olive-200 placeholder-olive-700 focus:outline-none focus:border-olive-500 transition-colors min-w-0 sm:w-44"
      />
      <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap disabled:opacity-60">
        {loading ? 'Отправка…' : 'Оставить заявку'}
      </button>
      {error && <p className="text-xs text-red-400 mt-1 sm:mt-0 sm:self-center">{error}</p>}
    </form>
  );
};
