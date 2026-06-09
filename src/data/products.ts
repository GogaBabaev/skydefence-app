export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number | null;       // null = "По запросу"
  oldPrice?: number;
  badge?: 'new' | 'hit' | 'sale';
  inStock: boolean;
  shortDesc: string;
  fullDesc: string;
  image: string;
  gallery: string[];
  specs: { label: string; value: string }[];
}

const PH = (w: number, h: number, text: string, bg = '161d0d', fg = '47612e') =>
  `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(text)}`;

export const categories = [
  { slug: 'detektory-bpla',   label: 'Детекторы БПЛА',              count: 7  },
  { slug: 'podaviteli-bpla',  label: 'Подавители БПЛА',             count: 49 },
  { slug: 'usiliteli-signala',label: 'Усилители БПЛА',              count: 4  },
  { slug: 'kvadrokoptery',    label: 'Квадрокоптеры',               count: 139},
  { slug: 'militar',          label: 'Тактическая одежда',          count: 41 },
  { slug: 'elektrostantsii',  label: 'Портативные электростанции',  count: 16 },
  { slug: 'sputnik',          label: 'Спутниковый интернет',        count: 2  },
];

export const products: Product[] = [
  /* ── ДЕТЕКТОРЫ ── */
  {
    id: '1',
    slug: 'detektor-bulat-v4',
    name: 'Всенаправленный детектор дронов БУЛАТ V.4',
    category: 'Детекторы БПЛА',
    categorySlug: 'detektory-bpla',
    price: 109900,
    badge: 'hit',
    inStock: true,
    shortDesc: 'Всенаправленный пассивный детектор БПЛА с дальностью обнаружения до 3 км.',
    fullDesc: 'БУЛАТ V.4 — профессиональный всенаправленный детектор БПЛА, способный обнаруживать квадрокоптеры и FPV-дроны на расстоянии до 3 000 метров. Пассивная система не излучает сигналов и работает незаметно. Поддерживает протоколы DJI OcuSync, Lightbridge, WiFi, RC-Link. Встроенный аккумулятор 8–12 часов автономной работы.',
    image: PH(600, 400, 'БУЛАТ+V.4'),
    gallery: [PH(800,500,'БУЛАТ V.4 — вид спереди'), PH(800,500,'БУЛАТ V.4 — экран'), PH(800,500,'БУЛАТ V.4 — в поле')],
    specs: [
      { label: 'Дальность обнаружения', value: 'до 3 000 м' },
      { label: 'Направленность',         value: '360°' },
      { label: 'Диапазоны',              value: '433 / 868 / 915 МГц, 2.4 / 5.8 ГГц' },
      { label: 'Протоколы',              value: 'DJI OcuSync, Lightbridge, WiFi' },
      { label: 'Автономность',           value: '8–12 часов' },
      { label: 'Вес',                    value: '1.2 кг' },
    ],
  },
  {
    id: '2',
    slug: 'detektor-kolibri',
    name: 'Детектор БПЛА «Колибри»',
    category: 'Детекторы БПЛА',
    categorySlug: 'detektory-bpla',
    price: 65000,
    inStock: true,
    shortDesc: 'Компактный карманный детектор дронов для охраны объектов и мероприятий.',
    fullDesc: 'Колибри — портативный детектор БПЛА размером с смартфон. Идеален для личной охраны, VIP-мероприятий и патрулирования периметра. Вибро- и звуковое оповещение, LED-индикация направления.',
    image: PH(600, 400, 'Колибри', '1a2412', '7f9455'),
    gallery: [PH(800,500,'Колибри — вид'), PH(800,500,'Колибри — в руке')],
    specs: [
      { label: 'Дальность', value: 'до 500 м' },
      { label: 'Диапазоны', value: '2.4 / 5.8 ГГц' },
      { label: 'Оповещение', value: 'Вибро + звук + LED' },
      { label: 'Питание', value: 'USB-C, 6 часов' },
      { label: 'Вес', value: '180 г' },
    ],
  },

  /* ── ПОДАВИТЕЛИ ── */
  {
    id: '3',
    slug: 'garpiya-120w',
    name: 'Блокиратор дронов ГАРПИЯ 120W (6 каналов)',
    category: 'Подавители БПЛА',
    categorySlug: 'podaviteli-bpla',
    price: null,
    badge: 'new',
    inStock: true,
    shortDesc: 'Ручной 6-канальный блокиратор БПЛА мощностью 120 Вт, дальность подавления до 1.5 км.',
    fullDesc: 'ГАРПИЯ 120W — профессиональный ручной подавитель БПЛА с 6 независимыми каналами подавления. Блокирует все популярные системы управления дронами и GPS-навигацию. Встроенный аккумулятор обеспечивает до 2 часов непрерывной работы. Применяется силовыми структурами и охранными предприятиями.',
    image: PH(600, 400, 'ГАРПИЯ+120W', '0f1509', 'c8a84b'),
    gallery: [PH(800,500,'ГАРПИЯ 120W — вид'), PH(800,500,'ГАРПИЯ 120W — антенны'), PH(800,500,'ГАРПИЯ 120W — применение')],
    specs: [
      { label: 'Мощность',           value: '120 Вт' },
      { label: 'Каналы',             value: '6 (GPS L1/L2, 2.4/5.8 ГГц, 433/868 МГц)' },
      { label: 'Дальность',          value: 'до 1 500 м' },
      { label: 'Автономность',       value: '2 часа' },
      { label: 'Вес',                value: '3.8 кг' },
      { label: 'Режим работы',       value: 'Непрерывный / импульсный' },
    ],
  },
  {
    id: '4',
    slug: 'pancir-reb',
    name: 'Комплекс РЭБ «Панцирь»',
    category: 'Подавители БПЛА',
    categorySlug: 'podaviteli-bpla',
    price: null,
    badge: 'hit',
    inStock: true,
    shortDesc: 'Стационарный/мобильный комплекс РЭБ для подавления групп БПЛА на дальности до 5 км.',
    fullDesc: 'Комплекс «Панцирь» предназначен для защиты стратегических объектов, периметров и критической инфраструктуры. Автоматическое обнаружение и подавление, режим 360°, возможность интеграции с системами видеонаблюдения.',
    image: PH(600, 400, 'РЭБ+Панцирь', '161d0d', 'c8a84b'),
    gallery: [PH(800,500,'Панцирь — установка'), PH(800,500,'Панцирь — панель')],
    specs: [
      { label: 'Дальность подавления', value: 'до 5 000 м' },
      { label: 'Зона покрытия',        value: '360°' },
      { label: 'Диапазоны',            value: 'GPS/ГЛОНАСС, 433–5800 МГц' },
      { label: 'Режим',                value: 'Авто / ручной' },
      { label: 'Питание',              value: '220В / 12В' },
    ],
  },

  /* ── ДРОНЫ DJI ── */
  {
    id: '5',
    slug: 'dji-mavic-3-classic-rc',
    name: 'Квадрокоптер DJI Mavic 3 Classic RC',
    category: 'Квадрокоптеры',
    categorySlug: 'kvadrokoptery',
    price: 175000,
    oldPrice: 195000,
    badge: 'sale',
    inStock: true,
    shortDesc: 'Профессиональный квадрокоптер DJI с камерой Hasselblad и пультом RC с экраном.',
    fullDesc: 'DJI Mavic 3 Classic — профессиональный дрон с камерой Hasselblad 4/3 CMOS. Время полёта до 46 минут, дальность передачи видео до 15 км (O3). Умная система обхода препятствий APAS 5.0.',
    image: PH(600, 400, 'Mavic+3+Classic', '161d0d', 'e8ead4'),
    gallery: [PH(800,500,'Mavic 3 Classic — вид сверху'), PH(800,500,'Mavic 3 Classic — камера'), PH(800,500,'Mavic 3 Classic + RC')],
    specs: [
      { label: 'Время полёта',   value: 'до 46 мин' },
      { label: 'Дальность',      value: '15 км (O3)' },
      { label: 'Камера',         value: 'Hasselblad 4/3 CMOS, 20 МП' },
      { label: 'Видео',          value: '5.1K/50fps, 4K/120fps' },
      { label: 'Скорость',       value: '21 м/с (S-mode)' },
      { label: 'Вес',            value: '895 г' },
    ],
  },
  {
    id: '6',
    slug: 'dji-mini-4k-fly-more',
    name: 'Квадрокоптер DJI Mini 4K Fly More Combo',
    category: 'Квадрокоптеры',
    categorySlug: 'kvadrokoptery',
    price: null,
    inStock: true,
    shortDesc: 'Лёгкий дрон до 249 г с камерой 4K и набором Fly More — идеален для начинающих.',
    fullDesc: 'DJI Mini 4K — наследник популярной серии Mini. Весит менее 249 г (не требует регистрации). Комплект Fly More включает 3 аккумулятора, зарядный хаб и сумку. Идеален для видеосъёмки и разведки.',
    image: PH(600, 400, 'DJI+Mini+4K', '161d0d', '7f9455'),
    gallery: [PH(800,500,'Mini 4K — вид'), PH(800,500,'Mini 4K — комплект')],
    specs: [
      { label: 'Вес',           value: '< 249 г' },
      { label: 'Камера',        value: '4K/30fps' },
      { label: 'Время полёта',  value: 'до 34 мин' },
      { label: 'Дальность',     value: '10 км' },
      { label: 'В комплекте',   value: '3 АКБ + хаб + сумка' },
    ],
  },

  /* ── ТАКТИКА ── */
  {
    id: '7',
    slug: 'ryukzak-terminator',
    name: 'Рюкзак Eberlestock Terminator Pack Multicam',
    category: 'Тактическая одежда',
    categorySlug: 'militar',
    price: 70900,
    inStock: true,
    shortDesc: 'Тактический рюкзак 55 л с системой MOLLE и скрытым отделением для оружия.',
    fullDesc: 'Eberlestock Terminator — легендарный тактический рюкзак американского производства. Объём 55 л, система крепления Intex Frame, скрытое отделение для длинноствольного оружия, совместим с гидросистемой. Расцветка Multicam.',
    image: PH(600, 400, 'Terminator+Pack', '1a2412', 'c8a84b'),
    gallery: [PH(800,500,'Terminator — вид'), PH(800,500,'Terminator — отделения')],
    specs: [
      { label: 'Объём',           value: '55 л' },
      { label: 'Система',         value: 'MOLLE / Intex Frame' },
      { label: 'Материал',        value: '500D Cordura' },
      { label: 'Цвет',            value: 'Multicam' },
      { label: 'Вес',             value: '3.1 кг' },
    ],
  },

  /* ── ЭЛЕКТРОСТАНЦИИ ── */
  {
    id: '8',
    slug: 'ecoflow-delta-pro',
    name: 'Портативная электростанция EcoFlow DELTA Pro',
    category: 'Портативные электростанции',
    categorySlug: 'elektrostantsii',
    price: null,
    badge: 'new',
    inStock: true,
    shortDesc: 'Ёмкость 3.6 кВт·ч, мощность 3600 Вт — питание полевого лагеря или штаба.',
    fullDesc: 'EcoFlow DELTA Pro — флагманская портативная электростанция с ёмкостью батареи 3.6 кВт·ч и пиковой мощностью 7200 Вт. Поддерживает зарядку от солнечных панелей, 220В сети и автомобильного адаптера одновременно. Управление через приложение.',
    image: PH(600, 400, 'EcoFlow+DELTA+Pro', '161d0d', '47612e'),
    gallery: [PH(800,500,'DELTA Pro — вид'), PH(800,500,'DELTA Pro — порты')],
    specs: [
      { label: 'Ёмкость',         value: '3 600 Вт·ч' },
      { label: 'Мощность',        value: '3 600 Вт (пик 7 200 Вт)' },
      { label: 'Розетки',         value: '6× 220В + USB + DC' },
      { label: 'Зарядка',         value: 'Солнце / 220В / авто' },
      { label: 'Вес',             value: '45 кг' },
    ],
  },
];

export const getFeatured = () => products.slice(0, 6);
export const getByCategory = (slug: string) =>
  slug === 'all' ? products : products.filter(p => p.categorySlug === slug);
