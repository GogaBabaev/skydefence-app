import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Check } from 'lucide-react';
import type { Product } from '../data/catalog.static';
import { useCart } from '../../../features/cart/model/cart.store';

const fmtPrice = (p: number) => p.toLocaleString('ru-RU') + ' ₽';

export const ProductCard = ({ product }: { product: Product }) => {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="product-card group flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden bg-dark aspect-[4/3] product-img-container">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
        />
        {product.badge && (
          <span className={`absolute top-2 left-2 z-[2] ${
            product.badge === 'new' ? 'badge-new' :
            product.badge === 'hit' ? 'badge-hit' : 'badge-sale'
          }`}>
            {product.badge === 'new' ? 'Новинка' : product.badge === 'hit' ? 'Хит' : 'Акция'}
          </span>
        )}
        {/* Quick view */}
        <Link
          to={`/product/${product.slug}`}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-dark/40 z-[2]"
        >
          <span className="flex items-center gap-1.5 bg-dark-card/90 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/10">
            <Eye size={12} /> Подробнее
          </span>
        </Link>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-3.5">
        <div className="text-[10px] text-olive-600 uppercase tracking-wider mb-1">{product.category}</div>
        <Link
          to={`/product/${product.slug}`}
          className="text-sm font-semibold text-white leading-snug hover:text-olive-300 transition-colors line-clamp-2 mb-auto"
        >
          {product.name}
        </Link>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            {product.price ? (
              <>
                <div className="text-base font-bold text-white">{fmtPrice(product.price)}</div>
                {product.oldPrice && (
                  <div className="text-xs line-through text-olive-700">{fmtPrice(product.oldPrice)}</div>
                )}
              </>
            ) : (
              <div className="text-sm font-semibold text-olive-400">По запросу</div>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all
              ${added
                ? 'bg-green-600 text-white scale-110'
                : 'bg-olive-500 hover:bg-olive-600 text-white disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
          >
            {added ? <Check size={14} /> : <ShoppingCart size={14} />}
          </button>
        </div>

        {product.inStock && (
          <div className="mt-1.5 text-[10px] text-olive-700 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            В наличии
          </div>
        )}
      </div>
    </div>
  );
};
