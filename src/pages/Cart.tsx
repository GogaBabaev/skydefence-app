import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingCart, CreditCard } from 'lucide-react';
import { useCart } from '../features/cart/model/cart.store';
import { useTelegram } from '../shared/lib/useTelegram';

const fmtPrice = (p: number) => p.toLocaleString('ru-RU') + ' ₽';

export const Cart = () => {
  const { items, totalCount, totalPrice, remove, setQty } = useCart();
  const { haptic } = useTelegram();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-16 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-dark-card border border-dark-border flex items-center justify-center mb-5">
          <ShoppingCart size={32} className="text-olive-700" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Корзина пуста</h1>
        <p className="text-sm text-olive-600 mb-6">Добавьте товары из каталога</p>
        <Link to="/catalog" className="btn-primary">Перейти в каталог</Link>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 pb-24">
      <div className="text-xs text-olive-700 mb-4">Главная / Корзина</div>
      <h1 className="section-title mb-6">
        Корзина
        <span className="ml-2 text-sm font-normal text-olive-600 normal-case">({totalCount} товар{totalCount > 1 ? 'а' : ''})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map(({ product, qty }) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15, height: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-dark-card border border-dark-border rounded-xl p-4 flex gap-4"
              >
                {/* Image */}
                <Link to={`/product/${product.slug}`} className="shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-lg bg-dark"
                  />
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-olive-600 mb-0.5">{product.category}</div>
                  <Link
                    to={`/product/${product.slug}`}
                    className="text-sm font-semibold text-white leading-snug hover:text-olive-300 transition-colors line-clamp-2"
                  >
                    {product.name}
                  </Link>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    {/* Price */}
                    <div className="text-sm font-bold text-white">
                      {product.price
                        ? fmtPrice(product.price * qty)
                        : <span className="text-olive-400 font-normal text-xs">По запросу</span>
                      }
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQty(product.id, qty - 1)}
                        className="w-7 h-7 rounded-lg border border-dark-border flex items-center justify-center text-olive-400 hover:border-olive-500 hover:text-white transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-semibold text-white w-5 text-center">{qty}</span>
                      <button
                        onClick={() => setQty(product.id, qty + 1)}
                        className="w-7 h-7 rounded-lg border border-dark-border flex items-center justify-center text-olive-400 hover:border-olive-500 hover:text-white transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => remove(product.id)}
                        className="ml-1 w-7 h-7 rounded-lg flex items-center justify-center text-olive-700 hover:text-danger transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-dark-card border border-dark-border rounded-xl p-5 sticky top-20">
            <h2 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Оформление заказа</h2>

            {/* Summary */}
            <div className="space-y-2 mb-4 pb-4 border-b border-dark-border">
              {items.map(({ product, qty }) => (
                <div key={product.id} className="flex justify-between text-xs">
                  <span className="text-olive-500 truncate pr-2">{product.name} × {qty}</span>
                  <span className="text-white shrink-0">
                    {product.price ? fmtPrice(product.price * qty) : '—'}
                  </span>
                </div>
              ))}
            </div>

            {totalPrice > 0 && (
              <div className="flex justify-between items-center mb-5">
                <span className="text-sm text-olive-400">Итого:</span>
                <span className="text-lg font-bold text-white">{fmtPrice(totalPrice)}</span>
              </div>
            )}

            <button
              onClick={() => { haptic('medium'); navigate('/checkout'); }}
              className="w-full btn-primary py-3 justify-center"
            >
              <CreditCard size={16} />
              <span className="ml-2">Перейти к оформлению</span>
            </button>
            <p className="mt-3 text-[10px] text-olive-700 text-center">
              Онлайн-оплата через ЮKassa. Менеджер уточнит стоимость доставки.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
