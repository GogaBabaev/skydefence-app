import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Send, Loader2, ShoppingCart } from 'lucide-react';
import { useCart } from '../../features/cart/model/cart.store';
import { createOrder } from '../../features/checkout/api';
import {
  checkoutSchema,
  type CheckoutForm,
} from '../../features/checkout/model/schema';
import { useTelegram } from '../../shared/lib/useTelegram';
import { useMainButton } from '../../shared/lib/useMainButton';
import { API_ENABLED } from '../../shared/config';

const fmtPrice = (p: number) => p.toLocaleString('ru-RU') + ' ₽';

const inputCls =
  'w-full bg-dark border border-dark-border rounded-lg px-3 py-2.5 text-sm text-olive-200 placeholder-olive-700 focus:outline-none focus:border-olive-500 transition-colors';

export const Checkout = () => {
  const { items, totalPrice, clear } = useCart();
  const { tg, hapticNotification } = useTelegram();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: [
        tg?.initDataUnsafe?.user?.first_name,
        tg?.initDataUnsafe?.user?.last_name,
      ]
        .filter(Boolean)
        .join(' '),
    },
  });

  const payable = items.filter((i) => i.product.price !== null);

  const onSubmit = handleSubmit(async (form) => {
    if (submitting || payable.length === 0) return;
    setSubmitting(true);
    setServerError(null);
    try {
      // create order — server recomputes all prices and notifies the
      // manager in Telegram; payment is arranged by manual transfer
      const order = await createOrder(
        form,
        payable.map((i) => ({
          productId: Number(i.product.id),
          quantity: i.qty,
        })),
      );
      clear();
      hapticNotification('success');
      navigate(`/order/${order.id}`);
    } catch (e) {
      hapticNotification('error');
      setServerError(
        e instanceof Error ? e.message : 'Не удалось создать заказ',
      );
    } finally {
      setSubmitting(false);
    }
  });

  // Telegram MainButton drives the form
  useMainButton({
    text: submitting
      ? 'Отправляем заявку…'
      : `Оформить заявку — ${fmtPrice(totalPrice)}`,
    visible: payable.length > 0,
    disabled: submitting,
    onClick: onSubmit,
  });

  if (items.length === 0) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-16 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-dark-card border border-dark-border flex items-center justify-center mb-5">
          <ShoppingCart size={32} className="text-olive-700" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Корзина пуста</h1>
        <Link to="/catalog" className="btn-primary">Перейти в каталог</Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-screen-md mx-auto px-4 py-6 pb-28"
    >
      <div className="text-xs text-olive-700 mb-4">
        Главная / Корзина / Оформление
      </div>
      <h1 className="section-title mb-6">Оформление заказа</h1>

      {/* Summary */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-4 mb-5 space-y-2">
        {items.map(({ product, qty }) => (
          <div key={product.id} className="flex justify-between text-xs">
            <span className="text-olive-500 truncate pr-2">
              {product.name} × {qty}
            </span>
            <span className="text-white shrink-0">
              {product.price ? fmtPrice(product.price * qty) : 'По запросу'}
            </span>
          </div>
        ))}
        <div className="flex justify-between items-center pt-2 border-t border-dark-border">
          <span className="text-sm text-olive-400">К оплате:</span>
          <span className="text-lg font-bold text-white">
            {fmtPrice(totalPrice)}
          </span>
        </div>
      </div>

      {!API_ENABLED && (
        <div className="mb-5 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg p-3">
          Backend не настроен (VITE_API_URL). Отправка заявки недоступна.
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Ваше имя *" error={errors.customerName?.message}>
          <input
            {...register('customerName')}
            placeholder="Иван Иванов"
            className={inputCls}
          />
        </Field>
        <Field label="Телефон *" error={errors.customerPhone?.message}>
          <input
            {...register('customerPhone')}
            type="tel"
            placeholder="+7 (999) 000-00-00"
            className={inputCls}
          />
        </Field>
        <Field
          label="Email (для чека)"
          error={errors.customerEmail?.message}
        >
          <input
            {...register('customerEmail')}
            type="email"
            placeholder="you@company.ru"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Компания" error={errors.company?.message}>
            <input
              {...register('company')}
              placeholder="ООО «Пример»"
              className={inputCls}
            />
          </Field>
          <Field label="ИНН" error={errors.inn?.message}>
            <input
              {...register('inn')}
              inputMode="numeric"
              placeholder="7700000000"
              className={inputCls}
            />
          </Field>
        </div>

        <Field
          label="Адрес доставки"
          error={errors.deliveryAddress?.message}
        >
          <input
            {...register('deliveryAddress')}
            placeholder="Город, улица, дом"
            className={inputCls}
          />
        </Field>
        <Field label="Комментарий" error={errors.comment?.message}>
          <textarea
            {...register('comment')}
            rows={3}
            placeholder="Пожелания к заказу"
            className={inputCls}
          />
        </Field>

        {serverError && (
          <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg p-3">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !API_ENABLED}
          className="w-full btn-primary py-3 justify-center disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          <span className="ml-2">
            Оформить заявку — {fmtPrice(totalPrice)}
          </span>
        </button>
        <p className="text-[10px] text-olive-700 text-center">
          Заявка отправляется менеджеру в Telegram. Он свяжется с вами для
          подтверждения заказа и оплаты переводом.
        </p>
      </form>
    </motion.div>
  );
};

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-xs text-olive-600 mb-1">{label}</label>
    {children}
    {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
  </div>
);
