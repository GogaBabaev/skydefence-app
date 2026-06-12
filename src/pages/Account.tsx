import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Package, Heart, Gift, Headphones,
  ChevronRight, Edit2, CheckCircle, Bell, LogOut,
  MapPin, Phone, Mail, ShieldCheck,
} from 'lucide-react';
import { BackButton } from '../shared/ui/BackButton';

/* ── Mock data ─────────────────────────────────────────────────── */
const MOCK_ORDERS = [
  { id: 'SD-20481', date: '05.06.2026', status: 'delivered',  statusLabel: 'Доставлен',    total: 175000, item: 'Квадрокоптер DJI Mavic 3 Classic RC' },
  { id: 'SD-20192', date: '18.05.2026', status: 'processing', statusLabel: 'В обработке',  total: 109900, item: 'Детектор БУЛАТ V.4' },
  { id: 'SD-19874', date: '02.04.2026', status: 'delivered',  statusLabel: 'Доставлен',    total: 85900,  item: 'Jackery 1000W Plus' },
];

const MOCK_WISHLIST = [
  { id: 'w1', name: 'ГАРПИЯ ПРО 160W (8 каналов)', price: null, img: 'https://skydefence.ru/wa-data/public/shop/products/23/00/23/images/136/136.750x0.png' },
  { id: 'w2', name: 'EcoFlow Delta 3 Max',          price: 124900, img: 'https://skydefence.ru/wa-data/public/shop/products/67/03/367/images/1910/1910.750x0.webp' },
];

type Tab = 'profile' | 'orders' | 'wishlist' | 'bonuses' | 'support';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile',  label: 'Профиль',     icon: User       },
  { id: 'orders',   label: 'Заказы',      icon: Package    },
  { id: 'wishlist', label: 'Избранное',   icon: Heart      },
  { id: 'bonuses',  label: 'Бонусы',      icon: Gift       },
  { id: 'support',  label: 'Поддержка',   icon: Headphones },
];

const statusColor: Record<string, string> = {
  delivered:  'text-green-400',
  processing: 'text-gold',
  cancelled:  'text-red-400',
};

const fmtPrice = (p: number) => p.toLocaleString('ru-RU') + ' ₽';

/* ── Sub-sections ──────────────────────────────────────────────── */

const ProfileTab = () => {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name:  'Михаил',
    phone: '+7 (495) 136-5777',
    email: 'info@skydefence.ru',
    city:  'Москва',
  });

  const handleSave = () => {
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Avatar block */}
      <div className="flex items-center gap-4 bg-dark-card border border-dark-border rounded-xl p-4">
        <div className="w-16 h-16 rounded-full bg-olive-500/20 border-2 border-olive-500/40 flex items-center justify-center shrink-0">
          <User size={28} className="text-olive-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-bold text-white">{form.name}</div>
          <div className="text-xs text-olive-500 mt-0.5">{form.email}</div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <ShieldCheck size={11} className="text-olive-500" />
            <span className="text-[10px] text-olive-600">Верифицирован</span>
          </div>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="w-8 h-8 rounded-lg border border-dark-border hover:border-olive-500/50 flex items-center justify-center text-olive-500 transition-colors"
        >
          <Edit2 size={13} />
        </button>
      </div>

      {/* Form */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-4 space-y-3">
        <div className="text-xs text-olive-600 uppercase tracking-wider mb-3">Личные данные</div>
        {[
          { key: 'name',  label: 'Имя',    icon: User,    type: 'text' },
          { key: 'phone', label: 'Телефон', icon: Phone,   type: 'tel'  },
          { key: 'email', label: 'Email',   icon: Mail,    type: 'email'},
          { key: 'city',  label: 'Город',   icon: MapPin,  type: 'text' },
        ].map(({ key, label, icon: Icon, type }) => (
          <div key={key}>
            <label className="text-[10px] text-olive-600 mb-1 block">{label}</label>
            <div className="relative">
              <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-olive-600" />
              <input
                type={type}
                disabled={!editing}
                value={form[key as keyof typeof form]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full bg-dark border border-dark-border rounded-lg pl-8 pr-3 py-2.5 text-sm text-olive-200 placeholder-olive-700 focus:outline-none focus:border-olive-500 transition-colors disabled:opacity-60 disabled:cursor-default"
              />
            </div>
          </div>
        ))}
        {editing && (
          <button onClick={handleSave} className="w-full btn-primary py-2.5 justify-center mt-1">
            Сохранить изменения
          </button>
        )}
      </div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2 text-sm text-green-400 px-1"
        >
          <CheckCircle size={14} /> Данные успешно сохранены
        </motion.div>
      )}

      {/* Notifications */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-olive-300">
            <Bell size={14} className="text-olive-500" />
            Уведомления о заказах
          </div>
          <div className="w-10 h-5 rounded-full bg-olive-500 relative cursor-pointer">
            <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white" />
          </div>
        </div>
      </div>

      {/* Logout */}
      <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dark-border text-olive-600 hover:text-red-400 hover:border-red-400/30 transition-colors text-sm">
        <LogOut size={14} /> Выйти из аккаунта
      </button>
    </div>
  );
};

const OrdersTab = () => (
  <div className="space-y-3">
    <div className="text-xs text-olive-600 uppercase tracking-wider px-1">История заказов</div>
    {MOCK_ORDERS.map(order => (
      <div key={order.id} className="bg-dark-card border border-dark-border rounded-xl p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-xs font-bold text-white">{order.id}</div>
            <div className="text-[10px] text-olive-600 mt-0.5">{order.date}</div>
          </div>
          <span className={`text-xs font-semibold ${statusColor[order.status]}`}>
            {order.statusLabel}
          </span>
        </div>
        <div className="text-sm text-olive-400 truncate mb-2">{order.item}</div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white">{fmtPrice(order.total)}</span>
          <button className="flex items-center gap-1 text-xs text-olive-500 hover:text-white transition-colors">
            Подробнее <ChevronRight size={12} />
          </button>
        </div>
      </div>
    ))}
  </div>
);

const WishlistTab = () => (
  <div className="space-y-3">
    <div className="text-xs text-olive-600 uppercase tracking-wider px-1">Избранные товары</div>
    {MOCK_WISHLIST.map(item => (
      <div key={item.id} className="bg-dark-card border border-dark-border rounded-xl p-3 flex items-center gap-3">
        <img src={item.img} alt={item.name} className="w-16 h-16 object-cover rounded-lg shrink-0 bg-dark" />
        <div className="flex-1 min-w-0">
          <div className="text-sm text-white font-medium leading-snug truncate">{item.name}</div>
          <div className="text-xs text-olive-400 mt-1">
            {item.price ? fmtPrice(item.price) : 'По запросу'}
          </div>
        </div>
        <button className="shrink-0 btn-outline text-xs px-3 py-1.5">В корзину</button>
      </div>
    ))}
    {MOCK_WISHLIST.length === 0 && (
      <div className="text-center py-12 text-olive-600 text-sm">Список избранного пуст</div>
    )}
  </div>
);

const BonusesTab = () => (
  <div className="space-y-4">
    {/* Balance */}
    <div className="bg-gradient-to-br from-olive-900/60 to-dark-card border border-olive-500/20 rounded-xl p-5 text-center">
      <div className="text-xs text-olive-500 uppercase tracking-wider mb-2">Бонусный счёт</div>
      <div className="text-4xl font-black text-white mb-1">3 750</div>
      <div className="text-xs text-olive-400">баллов · 1 балл = 1 ₽</div>
    </div>

    {/* Level */}
    <div className="bg-dark-card border border-dark-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-white">Уровень: Стандарт</div>
        <span className="text-xs text-olive-500">3 750 / 10 000</span>
      </div>
      <div className="w-full h-2 bg-dark rounded-full overflow-hidden">
        <div className="h-full bg-olive-500 rounded-full" style={{ width: '37.5%' }} />
      </div>
      <div className="text-[10px] text-olive-600 mt-2">До уровня «Серебро» — 6 250 баллов</div>
    </div>

    {/* How to earn */}
    <div className="bg-dark-card border border-dark-border rounded-xl p-4 space-y-2.5">
      <div className="text-xs text-olive-600 uppercase tracking-wider mb-1">Как накопить</div>
      {[
        ['За каждую покупку',    '5% от суммы в баллах'],
        ['Отзыв о товаре',       '+100 баллов'],
        ['Приглашение друга',    '+500 баллов'],
        ['День рождения',        '2× баллы весь день'],
      ].map(([label, value]) => (
        <div key={label} className="flex items-center justify-between text-sm">
          <span className="text-olive-400">{label}</span>
          <span className="text-white font-medium">{value}</span>
        </div>
      ))}
    </div>
  </div>
);

const SupportTab = () => {
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  const send = () => {
    if (!msg.trim()) return;
    setSent(true);
    setMsg('');
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Contact methods */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-4 space-y-3">
        <div className="text-xs text-olive-600 uppercase tracking-wider mb-1">Связаться с нами</div>
        {[
          { icon: Phone,    label: '+7 (495) 136-5777', sub: 'Пн–Сб 08:00–18:00', href: 'tel:+74951365777' },
          { icon: Mail,     label: 'info@skydefence.ru', sub: 'Ответим в течение часа', href: 'mailto:info@skydefence.ru' },
        ].map(({ icon: Icon, label, sub, href }) => (
          <a key={href} href={href}
            className="flex items-center gap-3 py-1 hover:text-white transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-olive-500/10 flex items-center justify-center shrink-0 group-hover:bg-olive-500/20 transition-colors">
              <Icon size={15} className="text-olive-400" />
            </div>
            <div>
              <div className="text-sm text-white font-medium">{label}</div>
              <div className="text-[10px] text-olive-600">{sub}</div>
            </div>
          </a>
        ))}
      </div>

      {/* Message form */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-4">
        <div className="text-xs text-olive-600 uppercase tracking-wider mb-3">Написать в поддержку</div>
        {sent ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle size={32} className="text-olive-500 mb-2" />
            <div className="text-sm font-semibold text-white">Сообщение отправлено!</div>
            <div className="text-xs text-olive-500 mt-1">Ответим в течение 30 минут</div>
          </div>
        ) : (
          <>
            <textarea
              rows={4}
              placeholder="Опишите вашу проблему или вопрос..."
              value={msg}
              onChange={e => setMsg(e.target.value)}
              className="w-full bg-dark border border-dark-border rounded-lg px-3 py-2.5 text-sm text-olive-200 placeholder-olive-700 focus:outline-none focus:border-olive-500 resize-none transition-colors mb-3"
            />
            <button onClick={send} className="w-full btn-primary py-2.5 justify-center">
              Отправить
            </button>
          </>
        )}
      </div>

      {/* FAQ */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-4 space-y-3">
        <div className="text-xs text-olive-600 uppercase tracking-wider">Частые вопросы</div>
        {[
          'Как оформить заказ?',
          'Условия доставки и оплаты',
          'Гарантия и возврат',
          'Как накопить бонусы?',
        ].map(q => (
          <button key={q} className="w-full flex items-center justify-between text-sm text-olive-400 hover:text-white transition-colors py-1">
            {q}
            <ChevronRight size={13} className="text-olive-600 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

/* ── Main component ─────────────────────────────────────────────── */
export const Account = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const panels: Record<Tab, React.ReactNode> = {
    profile:  <ProfileTab />,
    orders:   <OrdersTab />,
    wishlist: <WishlistTab />,
    bonuses:  <BonusesTab />,
    support:  <SupportTab />,
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-4 pb-24">
      <BackButton label="Назад" />

      <div className="text-xs text-olive-700 mb-4">
        Главная / <span className="text-olive-500">Личный кабинет</span>
      </div>

      <h1 className="text-xl font-bold text-white uppercase tracking-wide mb-5">
        Личный кабинет
      </h1>

      {/* Tab bar */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-5 pb-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors
              ${activeTab === id
                ? 'bg-olive-500 text-white'
                : 'bg-dark-card border border-dark-border text-olive-400 hover:text-white hover:border-olive-500/40'
              }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {panels[activeTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
