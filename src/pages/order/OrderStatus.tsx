import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, MessageCircle, XCircle } from 'lucide-react';
import { getOrder, type OrderDto } from '../../features/checkout/api';

const fmtPrice = (p: number) => p.toLocaleString('ru-RU') + ' ₽';

/**
 * After checkout the order is submitted as a request — the manager is
 * notified in Telegram and arranges payment by bank transfer manually.
 * This screen just confirms the request was received.
 */
export const OrderStatus = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      try {
        const data = await getOrder(id);
        if (active) setOrder(data);
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : 'Ошибка загрузки заказа');
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <Shell>
        <XCircle size={40} className="text-danger mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">Ошибка</h1>
        <p className="text-sm text-olive-500 mb-6">{error}</p>
        <Link to="/" className="btn-primary">На главную</Link>
      </Shell>
    );
  }

  if (!order) {
    return (
      <Shell>
        <Loader2 size={36} className="text-olive-500 animate-spin mb-4" />
        <p className="text-sm text-olive-500">Загружаем заказ…</p>
      </Shell>
    );
  }

  if (order.status === 'CANCELED') {
    return (
      <Shell>
        <XCircle size={40} className="text-danger mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">Заявка отменена</h1>
        <p className="text-sm text-olive-500 mb-6 max-w-xs">
          Заявка №{order.number} отменена. Свяжитесь с менеджером, если это
          ошибка.
        </p>
        <Link to="/catalog" className="text-xs text-olive-500 underline">
          Вернуться в каталог
        </Link>
      </Shell>
    );
  }

  if (order.status === 'FULFILLED') {
    return (
      <Shell>
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-full bg-olive-500/10 flex items-center justify-center mb-5"
        >
          <CheckCircle size={40} className="text-olive-500" />
        </motion.div>
        <h1 className="text-xl font-bold text-white mb-2">Заказ выполнен!</h1>
        <p className="text-sm text-olive-500 mb-6">
          Заказ №{order.number} на {fmtPrice(order.totalAmount)}
        </p>
        <Link to="/" className="btn-primary">На главную</Link>
      </Shell>
    );
  }

  // NEW / CONFIRMED — request received, manager will follow up
  return (
    <Shell>
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-20 h-20 rounded-full bg-olive-500/10 flex items-center justify-center mb-5"
      >
        <MessageCircle size={40} className="text-olive-500" />
      </motion.div>
      <h1 className="text-xl font-bold text-white mb-2">Заявка отправлена!</h1>
      <p className="text-sm text-olive-500 mb-1">
        Заявка №{order.number} на {fmtPrice(order.totalAmount)}
      </p>
      <p className="text-sm text-olive-600 mb-6 max-w-xs">
        Менеджер получил заявку в Telegram и свяжется с вами для подтверждения
        заказа и оплаты переводом.
      </p>
      <Link to="/" className="btn-primary">На главную</Link>
    </Shell>
  );
};

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="max-w-screen-xl mx-auto px-4 py-16 flex flex-col items-center text-center">
    {children}
  </div>
);
