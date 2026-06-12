import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  CreditCard,
  Loader2,
  XCircle,
} from 'lucide-react';
import { getOrder, createPayment, type OrderDto } from '../../features/checkout/api';
import { useTelegram } from '../../shared/lib/useTelegram';

const fmtPrice = (p: number) => p.toLocaleString('ru-RU') + ' ₽';
const POLL_MS = 3000;
const POLL_LIMIT = 100; // ~5 minutes

/**
 * Steps 6–7 of the payment flow: after YooKassa redirects the user back,
 * this screen polls the order until the webhook flips it to PAID/CANCELED.
 */
export const OrderStatus = () => {
  const { id } = useParams<{ id: string }>();
  const { hapticNotification } = useTelegram();
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    let polls = 0;

    const tick = async () => {
      try {
        const data = await getOrder(id);
        if (!active) return;
        setOrder((prev) => {
          if (prev?.status !== 'PAID' && data.status === 'PAID') {
            hapticNotification('success');
          }
          return data;
        });
        if (
          data.status === 'AWAITING_PAYMENT' &&
          polls++ < POLL_LIMIT
        ) {
          setTimeout(tick, POLL_MS);
        }
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : 'Ошибка загрузки заказа');
        }
      }
    };
    void tick();
    return () => {
      active = false;
    };
  }, [id, hapticNotification]);

  const retryPayment = async () => {
    if (!id || retrying) return;
    setRetrying(true);
    try {
      const payment = await createPayment(id);
      if (payment.confirmationUrl) {
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.openLink(payment.confirmationUrl);
        } else {
          window.open(payment.confirmationUrl, '_blank');
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось создать платёж');
    } finally {
      setRetrying(false);
    }
  };

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

  if (order.status === 'PAID' || order.status === 'FULFILLED') {
    return (
      <Shell>
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-full bg-olive-500/10 flex items-center justify-center mb-5"
        >
          <CheckCircle size={40} className="text-olive-500" />
        </motion.div>
        <h1 className="text-xl font-bold text-white mb-2">Заказ оплачен!</h1>
        <p className="text-sm text-olive-500 mb-1">
          Заказ №{order.number} на {fmtPrice(order.totalAmount)}
        </p>
        <p className="text-sm text-olive-600 mb-6 max-w-xs">
          Менеджер свяжется с вами для согласования доставки.
        </p>
        <Link to="/" className="btn-primary">На главную</Link>
      </Shell>
    );
  }

  if (order.status === 'CANCELED') {
    return (
      <Shell>
        <XCircle size={40} className="text-danger mb-4" />
        <h1 className="text-xl font-bold text-white mb-2">
          Платёж не прошёл
        </h1>
        <p className="text-sm text-olive-500 mb-6 max-w-xs">
          Заказ №{order.number} отменён. Вы можете попробовать ещё раз.
        </p>
        <button
          onClick={retryPayment}
          disabled={retrying}
          className="btn-primary mb-3 disabled:opacity-50"
        >
          {retrying ? 'Создаём платёж…' : 'Повторить оплату'}
        </button>
        <Link to="/catalog" className="text-xs text-olive-500 underline">
          Вернуться в каталог
        </Link>
      </Shell>
    );
  }

  // PENDING / AWAITING_PAYMENT
  return (
    <Shell>
      <Clock size={40} className="text-olive-400 mb-4 animate-pulse" />
      <h1 className="text-xl font-bold text-white mb-2">Ожидаем оплату…</h1>
      <p className="text-sm text-olive-500 mb-6 max-w-xs">
        Заказ №{order.number} на {fmtPrice(order.totalAmount)}. Статус
        обновится автоматически после подтверждения банка.
      </p>
      {order.lastPayment?.confirmationUrl && (
        <button
          onClick={() => {
            const url = order.lastPayment!.confirmationUrl!;
            if (window.Telegram?.WebApp) window.Telegram.WebApp.openLink(url);
            else window.open(url, '_blank');
          }}
          className="btn-primary mb-3"
        >
          <CreditCard size={16} />
          <span className="ml-2">Открыть страницу оплаты</span>
        </button>
      )}
      <Link to="/" className="text-xs text-olive-500 underline">
        На главную
      </Link>
    </Shell>
  );
};

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="max-w-screen-xl mx-auto px-4 py-16 flex flex-col items-center text-center">
    {children}
  </div>
);
