import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingCart, Phone, CheckCircle, X, Share2 } from 'lucide-react';
import { useProduct } from '../entities/product/api';
import { useCart } from '../features/cart/model/cart.store';
import { useTelegram } from '../shared/lib/useTelegram';
import { BackButton } from '../shared/ui/BackButton';
import { api } from '../shared/api/http';

const fmtPrice = (p: number) => p.toLocaleString('ru-RU') + ' ₽';

export const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate  = useNavigate();
  const { showBackButton, hideBackButton, hapticNotification } = useTelegram();
  const [imgIdx, setImgIdx]     = useState(0);
  const [showForm, setShowForm]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm]           = useState({ name: '', phone: '' });
  const [added, setAdded]         = useState(false);

  const product = useProduct(slug);
  const { add } = useCart();

  useEffect(() => {
    const back = () => navigate(-1);
    showBackButton(back);
    return () => hideBackButton(back);
  }, [navigate, showBackButton, hideBackButton]);

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-olive-500">
      <p className="mb-4">Товар не найден</p>
      <Link to="/catalog" className="btn-primary">В каталог</Link>
    </div>
  );

  const handleAddCart = () => {
    add(product);
    hapticNotification('success');
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api('/b2b-requests', {
        method: 'POST',
        body: {
          company: 'Физическое лицо',
          contactName: form.name,
          phone: form.phone,
          productSlug: product.slug,
          message: `Запрос цены на товар: ${product.name}`,
        },
      });
      hapticNotification('success');
      setSubmitted(true);
      setTimeout(() => { setShowForm(false); setSubmitted(false); }, 3000);
    } catch {
      hapticNotification('error');
      setSubmitError('Не удалось отправить. Позвоните: +7 (495) 136-5777');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-4 pb-24">
      <BackButton label="Назад" />
      {/* Breadcrumb */}
      <div className="text-xs text-olive-700 mb-4 flex items-center gap-1.5">
        <Link to="/" className="hover:text-olive-400 transition-colors">Главная</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-olive-400 transition-colors">Каталог</Link>
        <span>/</span>
        <Link to={`/catalog?cat=${product.categorySlug}`} className="hover:text-olive-400 transition-colors">{product.category}</Link>
        <span>/</span>
        <span className="text-olive-500 truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gallery */}
        <div>
          <div className="relative rounded-xl overflow-hidden bg-dark-card border border-dark-border aspect-[4/3] mb-2">
            <AnimatePresence mode="wait">
              <motion.img
                key={imgIdx}
                src={product.gallery[imgIdx]}
                alt={product.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            {product.badge && (
              <span className={`absolute top-3 left-3 ${product.badge==='new'?'badge-new':product.badge==='hit'?'badge-hit':'badge-sale'}`}>
                {product.badge==='new'?'Новинка':product.badge==='hit'?'Хит':'Акция'}
              </span>
            )}
            {product.gallery.length > 1 && (
              <>
                <button onClick={() => setImgIdx(i => (i-1+product.gallery.length)%product.gallery.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg glass-military flex items-center justify-center">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setImgIdx(i => (i+1)%product.gallery.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg glass-military flex items-center justify-center">
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>
          {/* Thumbnails */}
          <div className="flex gap-2">
            {product.gallery.map((img, i) => (
              <button key={i} onClick={() => setImgIdx(i)}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors ${i===imgIdx?'border-olive-500':'border-dark-border hover:border-olive-500/40'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="text-xs text-olive-600 mb-1">{product.category}</div>
          <h1 className="text-xl font-bold text-white leading-snug mb-3">{product.name}</h1>

          {/* Stock */}
          {product.inStock ? (
            <div className="flex items-center gap-1.5 text-xs text-green-400 mb-4">
              <span className="w-2 h-2 rounded-full bg-green-400" /> В наличии
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-olive-600 mb-4">
              <span className="w-2 h-2 rounded-full bg-olive-700" /> Нет в наличии
            </div>
          )}

          {/* Price */}
          <div className="mb-5">
            {product.price ? (
              <div className="flex items-end gap-3">
                <span className="text-3xl font-black text-white">{fmtPrice(product.price)}</span>
                {product.oldPrice && (
                  <span className="text-sm line-through text-olive-700 mb-1">{fmtPrice(product.oldPrice)}</span>
                )}
              </div>
            ) : (
              <div>
                <span className="text-xl font-bold text-olive-400">По запросу</span>
                <p className="text-xs text-olive-600 mt-1">Уточните цену у менеджера</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={handleAddCart}
              disabled={!product.inStock}
              className={`flex-1 btn-primary py-3 justify-center ${added ? 'bg-green-600 hover:bg-green-600' : ''}`}
            >
              <ShoppingCart size={16} />
              {added ? 'Добавлено!' : 'В корзину'}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex-1 btn-outline py-3 justify-center"
            >
              <Phone size={16} />
              Запросить КП
            </button>
          </div>

          {/* Share */}
          <button className="flex items-center gap-1.5 text-xs text-olive-600 hover:text-olive-400 transition-colors mb-6">
            <Share2 size={12} /> Поделиться
          </button>

          {/* Short description */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-4 text-sm text-olive-400 leading-relaxed mb-4">
            {product.shortDesc}
          </div>

          {/* Key specs preview */}
          <div className="grid grid-cols-2 gap-2">
            {product.specs.slice(0,4).map(s => (
              <div key={s.label} className="bg-dark-card border border-dark-border rounded-lg p-3">
                <div className="text-[10px] text-olive-700 mb-0.5">{s.label}</div>
                <div className="text-xs font-semibold text-white">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full description */}
      <div className="mt-8 bg-dark-card border border-dark-border rounded-xl p-5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wide mb-3">Описание</h2>
        <p className="text-sm text-olive-400 leading-relaxed">{product.fullDesc}</p>
      </div>

      {/* Full specs */}
      <div className="mt-4 bg-dark-card border border-dark-border rounded-xl overflow-hidden">
        <h2 className="text-sm font-bold text-white uppercase tracking-wide p-4 border-b border-dark-border">
          Характеристики
        </h2>
        <div className="divide-y divide-dark-border">
          {product.specs.map((s, i) => (
            <div key={s.label} className={`flex items-center justify-between px-4 py-3 ${i%2===0?'bg-dark/30':''}`}>
              <span className="text-xs text-olive-600">{s.label}</span>
              <span className="text-xs font-medium text-white text-right max-w-[55%]">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Request form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={e => e.target===e.currentTarget && setShowForm(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="w-full max-w-sm bg-dark-card border border-dark-border rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-sm">Запрос КП — {product.name}</h3>
                <button onClick={() => setShowForm(false)} className="w-7 h-7 rounded-lg border border-dark-border flex items-center justify-center text-olive-500">
                  <X size={13} />
                </button>
              </div>
              {submitted ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <CheckCircle size={36} className="text-olive-500 mb-3" />
                  <h4 className="font-bold text-white mb-1">Заявка отправлена!</h4>
                  <p className="text-xs text-olive-500">Менеджер свяжется с вами в течение 30 минут.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input type="text" required placeholder="Ваше имя" value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full bg-dark border border-dark-border rounded-lg px-3 py-2.5 text-sm text-olive-200 placeholder-olive-700 focus:outline-none focus:border-olive-500 transition-colors" />
                  <input type="tel" required placeholder="Номер телефона" value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full bg-dark border border-dark-border rounded-lg px-3 py-2.5 text-sm text-olive-200 placeholder-olive-700 focus:outline-none focus:border-olive-500 transition-colors" />
                  <button type="submit" disabled={submitting} className="w-full btn-primary py-3 justify-center disabled:opacity-60">
                    {submitting ? 'Отправка…' : 'Оставить заявку'}
                  </button>
                  {submitError && <p className="text-xs text-red-400 text-center">{submitError}</p>}
                  <p className="text-[10px] text-olive-700 text-center">Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности</p>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
