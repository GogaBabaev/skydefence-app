import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../shared/api/http';
import { motion } from 'framer-motion';
import {
  ArrowRight, ChevronDown, Phone, Shield, Truck,
  HeadphonesIcon, Award, Zap, Package, Clock,
  Radio, Target, Cpu, Backpack, MapPin, Star,
} from 'lucide-react';
import { useCategories, useProducts } from '../entities/product/api';
import { ProductCard } from '../entities/product/ui/ProductCard';

const SD = 'https://skydefence.ru/wa-data/public/shop/products';

const fmtPrice = (p: number) => p.toLocaleString('ru-RU') + ' ₽';

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
  { icon: MapPin,  title: 'Самовывоз',         sub: 'Москва, Багратионовский пр-д, 7/2' },
  { icon: Clock,   title: 'Срочная доставка',  sub: 'По Москве — день в день'     },
];

/* ─── FAQ ─────────────────────────────────────────────────────── */
const faqItems = [
  { q: 'Каков порядок приобретения подавителей БПЛА?',  a: 'Порядок продажи и применения такого оборудования регулируется законодательством РФ и зависит от конкретной модели и статуса покупателя. Менеджер проконсультирует по условиям поставки под вашу задачу.' },
  { q: 'Как оформить корпоративный заказ?',       a: 'Отправьте запрос через форму или позвоните. Выставим счёт, подготовим договор и закрывающие документы.' },
  { q: 'Есть ли доставка в регионы?',             a: 'Да, доставляем СДЭК, Почтой России и транспортными компаниями по всей РФ и в ряд стран СНГ.' },
  { q: 'Какие дроны DJI есть в наличии?',         a: 'В наличии Mavic 3, Mini 4K, Agras, Matrice и аксессуары к ним. Актуальный список — в каталоге.' },
];

/* ─── Stats ───────────────────────────────────────────────────── */
const stats = [
  { value: '8+',    label: 'лет на рынке'         },
  { value: '2 000+', label: 'выполненных заказов' },
  { value: '260+',  label: 'товаров в каталоге'   },
  { value: '< 30 мин', label: 'быстрый ответ менеджера' },
];

/* ════════════════════════════════════════════════════════════════ */
export const Home = () => {
  const [activeFaq, setFaq] = useState<number | null>(null);
  const { products: apiProducts } = useProducts();
  const allFeatured          = apiProducts.slice(0, 8);

  // Live product counts per category (from backend); falls back to static.
  const liveCategories = useCategories();
  const countBySlug = Object.fromEntries(liveCategories.map(c => [c.slug, c.count]));

  return (
    <div className="overflow-x-hidden">

      {/* ══ HERO ═════════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-br from-[#0d1a07] via-dark to-[#0f1509] overflow-hidden always-dark">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #47612e 0, #47612e 1px, transparent 0, transparent 50%)', backgroundSize: '14px 14px' }} />
        <div className="relative max-w-screen-xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-olive-400 bg-olive-500/10 border border-olive-500/20 rounded-full px-3 py-1.5 mb-5">
              ☆ Официальный поставщик профессионального оборудования
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
              Профессиональное<br />
              <span className="text-olive-400">военное снаряжение</span><br />
              и БПЛА-оборудование
            </h1>
            <p className="text-sm text-olive-500 leading-relaxed mb-7 max-w-xl">
              Детекторы и подавители БПЛА, квадрокоптеры DJI, тактическое снаряжение,
              электростанции и системы РЭБ. Москва. Доставка по России.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/catalog" className="btn-primary px-6 py-2.5 text-sm">
                Смотреть каталог
              </Link>
              <Link to="/b2b" className="btn-outline px-6 py-2.5 text-sm">
                B2B / Оптовые заявки
              </Link>
            </div>
          </div>
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
                  <div className="text-[10px] text-olive-700 mt-0.5">{countBySlug[cat.slug] ?? cat.count} товаров</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Remaining category chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {liveCategories.filter(c => !catCards.find(cc => cc.slug === c.slug)).map(cat => (
            <Link
              key={cat.slug}
              to={`/catalog?cat=${cat.slug}`}
              className="text-xs text-olive-400 bg-dark-card border border-dark-border hover:border-olive-500/40 hover:text-white rounded-full px-3 py-1.5 transition-all"
            >
              {cat.label}
              <span className="ml-1 text-olive-700">{countBySlug[cat.slug] ?? cat.count}</span>
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
                SkyDefence — специализированный поставщик профессионального оборудования и технических средств специального назначения. Работаем с 2016 года.
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
          Бесплатная доставка СДЭК при заказе от 50 000 ₽ · Самовывоз: Москва, Багратионовский проезд, 7/2 (уточняйте при заказе)
        </p>
      </section>

      {/* ══ CALLBACK FORM ═══════════════════════════════════════ */}
      <section className="always-dark bg-gradient-to-r from-olive-900/30 to-dark-card border-y border-dark-border py-12">
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
  const [consent, setConsent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;
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
          consent: true,
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full md:w-auto">
      <div className="flex flex-col sm:flex-row gap-2">
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
        <button type="submit" disabled={loading || !consent} className="btn-primary whitespace-nowrap disabled:opacity-60">
          {loading ? 'Отправка…' : 'Оставить заявку'}
        </button>
      </div>
      <label className="flex items-start gap-2 cursor-pointer select-none">
        <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-olive-500" />
        <span className="text-[10px] text-olive-700 leading-snug">
          Согласен(на) на обработку персональных данных согласно{' '}
          <Link to="/politika" className="underline hover:text-olive-400">политике конфиденциальности</Link>
        </span>
      </label>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  );
};
