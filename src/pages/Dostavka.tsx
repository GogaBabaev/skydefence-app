import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Package, Truck, MapPin, Clock, CreditCard, Building2,
  Smartphone, CheckCircle, Phone, ArrowRight, Shield,
} from 'lucide-react';

const fade = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: i * 0.07 },
});

const deliveryMethods = [
  {
    icon: Package,
    title: 'СДЭК',
    time: '1–5 дней',
    desc: 'Доставка по всей России. Бесплатно при заказе от 50 000 ₽. До двери или до пункта выдачи.',
    badge: 'Популярный',
    badgeColor: 'bg-olive-500/20 text-olive-400 border-olive-500/30',
  },
  {
    icon: Truck,
    title: 'Почта России',
    time: '3–14 дней',
    desc: 'Доставка в отдалённые регионы и населённые пункты, где нет СДЭК.',
    badge: null,
    badgeColor: '',
  },
  {
    icon: Truck,
    title: 'ПЭК / Деловые Линии',
    time: '2–7 дней',
    desc: 'Для крупногабаритного груза — комплексы РЭБ, электростанции, промышленные дроны.',
    badge: 'Крупногабарит',
    badgeColor: 'bg-gold/10 text-gold border-gold/20',
  },
  {
    icon: MapPin,
    title: 'Самовывоз',
    time: 'В день обращения',
    desc: 'Москва — адрес уточняется при оформлении заказа. Бесплатно.',
    badge: 'Бесплатно',
    badgeColor: 'bg-olive-500/20 text-olive-400 border-olive-500/30',
  },
  {
    icon: Clock,
    title: 'Срочная курьером',
    time: 'День в день',
    desc: 'По Москве и ближайшему Подмосковью. Стоимость уточняется у менеджера.',
    badge: 'Москва',
    badgeColor: 'bg-dark border-dark-border text-olive-500',
  },
  {
    icon: Truck,
    title: 'Страны СНГ',
    time: '5–14 дней',
    desc: 'Беларусь, Казахстан, Узбекистан и другие. Доставка через СДЭК Международный или ТК.',
    badge: 'По запросу',
    badgeColor: 'bg-dark border-dark-border text-olive-500',
  },
];

const paymentMethods = [
  {
    icon: Building2,
    title: 'Безналичный расчёт',
    desc: 'Для юридических лиц и ИП. Выставляем счёт, договор, закрывающие документы с НДС.',
  },
  {
    icon: CreditCard,
    title: 'Карта / СБП',
    desc: 'Оплата картой Visa, MasterCard, МИР или через Систему быстрых платежей.',
  },
  {
    icon: Smartphone,
    title: 'Наложенный платёж',
    desc: 'Оплата при получении через СДЭК. Доступно для большинства товаров до 100 000 ₽.',
  },
  {
    icon: Shield,
    title: 'Оплата частями',
    desc: 'Рассрочка на крупные заказы от 200 000 ₽ — уточняйте условия у менеджера.',
  },
];

const conditions = [
  'Бесплатная доставка СДЭК при заказе от 50 000 ₽',
  'Упаковка крупногабаритного оборудования в кейс включена в стоимость',
  'Страхование груза — по запросу',
  'Доставка в страны СНГ — по согласованию с менеджером',
  'Все отправления сопровождаются накладной и чеком',
  'Возможна частичная предоплата для крупных корпоративных заказов',
];

export const Dostavka = () => (
  <div className="max-w-screen-xl mx-auto px-4 py-8">
    {/* Breadcrumb */}
    <div className="text-xs text-olive-600 mb-6">
      <Link to="/" className="hover:text-olive-400 transition-colors">Главная</Link>
      {' '}/{' '}
      <span className="text-olive-400">Доставка и оплата</span>
    </div>

    <h1 className="text-2xl font-black text-white mb-1">Доставка и оплата</h1>
    <p className="text-sm text-olive-500 mb-8">Работаем по всей России и в страны СНГ</p>

    {/* Free delivery banner */}
    <motion.div {...fade(0)} className="always-dark bg-gradient-to-r from-olive-900/40 to-dark-card border border-olive-500/20 rounded-xl p-4 mb-8 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-olive-500/20 flex items-center justify-center shrink-0">
        <Package size={18} className="text-olive-400" />
      </div>
      <div>
        <div className="text-sm font-bold text-white">Бесплатная доставка СДЭК</div>
        <div className="text-xs text-olive-500">При заказе от 50 000 ₽ по всей России</div>
      </div>
    </motion.div>

    {/* Delivery methods */}
    <h2 className="section-title mb-4">Способы доставки</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
      {deliveryMethods.map((m, i) => (
        <motion.div key={m.title} {...fade(i)}
          className="bg-dark-card border border-dark-border rounded-xl p-4 flex flex-col gap-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="w-9 h-9 rounded-lg bg-olive-500/10 flex items-center justify-center shrink-0">
              <m.icon size={16} className="text-olive-500" />
            </div>
            {m.badge && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${m.badgeColor}`}>
                {m.badge}
              </span>
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-white mb-0.5">{m.title}</div>
            <div className="text-xs text-olive-400 font-medium mb-2">{m.time}</div>
            <div className="text-xs text-olive-600 leading-relaxed">{m.desc}</div>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Conditions */}
    <motion.div {...fade(0)} className="bg-dark-card border border-dark-border rounded-xl p-5 mb-10">
      <h2 className="section-title mb-4">Условия доставки</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {conditions.map((c, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <CheckCircle size={14} className="text-olive-500 shrink-0 mt-0.5" />
            <span className="text-xs text-olive-400 leading-relaxed">{c}</span>
          </div>
        ))}
      </div>
    </motion.div>

    {/* Payment methods */}
    <h2 className="section-title mb-4">Способы оплаты</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
      {paymentMethods.map((p, i) => (
        <motion.div key={p.title} {...fade(i)}
          className="bg-dark-card border border-dark-border rounded-xl p-4 flex gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-olive-500/10 flex items-center justify-center shrink-0">
            <p.icon size={16} className="text-olive-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-white mb-1">{p.title}</div>
            <div className="text-xs text-olive-600 leading-relaxed">{p.desc}</div>
          </div>
        </motion.div>
      ))}
    </div>

    {/* CTA */}
    <motion.div {...fade(0)} className="always-dark bg-gradient-to-r from-olive-900/30 to-dark-card border border-dark-border rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4">
      <div className="flex-1 text-center sm:text-left">
        <div className="text-base font-bold text-white mb-1">Остались вопросы?</div>
        <div className="text-xs text-olive-500">Менеджер ответит на все вопросы по доставке и поможет оформить заказ</div>
      </div>
      <div className="flex gap-2 shrink-0">
        <a href="tel:+74951365777" className="btn-primary text-sm">
          <Phone size={13} /> Позвонить
        </a>
        <Link to="/contacts" className="btn-outline text-sm">
          Написать <ArrowRight size={13} />
        </Link>
      </div>
    </motion.div>
  </div>
);
