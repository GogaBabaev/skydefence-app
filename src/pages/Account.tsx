import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Package, Headphones,
  ChevronRight, Phone, Mail,
} from 'lucide-react';
import { BackButton } from '../shared/ui/BackButton';
import { api } from '../shared/api/http';
import { useTelegram } from '../shared/lib/useTelegram';

/* ── Types ──────────────────────────────────────────────────────── */
interface OrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
}

interface Order {
  id: string;
  number: number;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  items: OrderItem[];
}

type Tab = 'profile' | 'orders' | 'support';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Профиль',   icon: User      },
  { id: 'orders',  label: 'Заказы',    icon: Package   },
  { id: 'support', label: 'Поддержка', icon: Headphones },
];

const STATUS_LABEL: Record<string, string> = {
  NEW:       'Новый',
  CONFIRMED: 'Подтверждён',
  FULFILLED: 'Выполнен',
  CANCELED:  'Отменён',
};

const STATUS_COLOR: Record<string, string> = {
  NEW:       'text-olive-400',
  CONFIRMED: 'text-blue-400',
  FULFILLED: 'text-green-400',
  CANCELED:  'text-red-400',
};

const fmtPrice = (p: number) => p.toLocaleString('ru-RU') + ' ₽';
const fmtDate  = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

/* ── Profile tab ────────────────────────────────────────────────── */
const ProfileTab = () => {
  const { user } = useTelegram();

  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Пользователь';
  const username    = user?.username ? `@${user.username}` : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 bg-dark-card border border-dark-border rounded-xl p-4">
        <div className="w-16 h-16 rounded-full bg-olive-500/20 border-2 border-olive-500/40 flex items-center justify-center shrink-0">
          <User size={28} className="text-olive-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-bold text-white">{displayName}</div>
          {username && <div className="text-xs text-olive-500 mt-0.5">{username}</div>}
          <div className="text-[10px] text-olive-600 mt-1">Telegram ID: {user?.id ?? '—'}</div>
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl p-4 space-y-3">
        <div className="text-xs text-olive-600 uppercase tracking-wider mb-1">Контакты менеджера</div>
        {[
          { icon: Phone, label: '+7 (495) 136-5777', href: 'tel:+74951365777' },
          { icon: Mail,  label: 'info@skydefence.ru', href: 'mailto:info@skydefence.ru' },
        ].map(({ icon: Icon, label, href }) => (
          <a key={href} href={href} className="flex items-center gap-3 py-1 hover:text-white transition-colors group">
            <div className="w-9 h-9 rounded-lg bg-olive-500/10 flex items-center justify-center shrink-0 group-hover:bg-olive-500/20 transition-colors">
              <Icon size={15} className="text-olive-400" />
            </div>
            <div className="text-sm text-white font-medium">{label}</div>
          </a>
        ))}
      </div>
    </div>
  );
};

/* ── Orders tab ─────────────────────────────────────────────────── */
const OrdersTab = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    api<Order[]>('/orders')
      .then(setOrders)
      .catch(() => setError('Не удалось загрузить заказы'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="bg-dark-card border border-dark-border rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-dark-border rounded w-1/3 mb-2" />
            <div className="h-3 bg-dark-border rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-olive-500 text-sm">{error}</div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package size={36} className="text-olive-700 mx-auto mb-3" />
        <div className="text-sm text-olive-500">У вас пока нет заказов</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-xs text-olive-600 uppercase tracking-wider px-1">История заказов</div>
      {orders.map(order => {
        const statusLabel = STATUS_LABEL[order.status] ?? order.status;
        const statusColor = STATUS_COLOR[order.status] ?? 'text-olive-400';
        const [expanded, setExpanded] = useState(false);

        return (
          <div key={order.id} className="bg-dark-card border border-dark-border rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-xs font-bold text-white">Заявка №{order.number}</div>
                <div className="text-[10px] text-olive-600 mt-0.5">{fmtDate(order.createdAt)}</div>
              </div>
              <span className={`text-xs font-semibold ${statusColor}`}>{statusLabel}</span>
            </div>

            <div className="text-sm text-olive-400 truncate mb-2">
              {order.items[0]?.productName ?? '—'}
              {order.items.length > 1 && ` +${order.items.length - 1} товар`}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">{fmtPrice(order.totalAmount)}</span>
              <button
                onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1 text-xs text-olive-500 hover:text-white transition-colors"
              >
                {expanded ? 'Скрыть' : 'Подробнее'}
                <ChevronRight size={12} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
              </button>
            </div>

            {expanded && (
              <div className="mt-3 pt-3 border-t border-dark-border space-y-1.5">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs text-olive-400">
                    <span className="truncate mr-2">{item.productName} × {item.quantity}</span>
                    <span className="shrink-0">{fmtPrice(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ── Support tab ────────────────────────────────────────────────── */
const SupportTab = () => (
  <div className="space-y-4">
    <div className="bg-dark-card border border-dark-border rounded-xl p-4 space-y-3">
      <div className="text-xs text-olive-600 uppercase tracking-wider mb-1">Связаться с нами</div>
      {[
        { icon: Phone, label: '+7 (495) 136-5777', sub: 'Пн–Сб 08:00–18:00', href: 'tel:+74951365777' },
        { icon: Mail,  label: 'info@skydefence.ru', sub: 'Ответим в течение часа', href: 'mailto:info@skydefence.ru' },
      ].map(({ icon: Icon, label, sub, href }) => (
        <a key={href} href={href} className="flex items-center gap-3 py-1 hover:text-white transition-colors group">
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

    <div className="bg-dark-card border border-dark-border rounded-xl p-4 space-y-3">
      <div className="text-xs text-olive-600 uppercase tracking-wider">Быстрые ссылки</div>
      {[
        ['Условия доставки и оплаты', '/dostavka'],
        ['Гарантия и возврат',        '/garantiya'],
        ['Реквизиты',                 '/rekvizity'],
      ].map(([label, href]) => (
        <a key={href} href={`#${href}`} className="w-full flex items-center justify-between text-sm text-olive-400 hover:text-white transition-colors py-1">
          {label}
          <ChevronRight size={13} className="text-olive-600 shrink-0" />
        </a>
      ))}
    </div>
  </div>
);

/* ── Main component ─────────────────────────────────────────────── */
export const Account = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const panels: Record<Tab, React.ReactNode> = {
    profile: <ProfileTab />,
    orders:  <OrdersTab />,
    support: <SupportTab />,
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
