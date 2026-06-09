import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import type { Product } from '../data/products';

interface Props {
  product: Product;
  onAddToCart?: (p: Product) => void;
}

const fmtPrice = (p: number) =>
  p.toLocaleString('ru-RU') + ' ₽';

export const ProductCard = ({ product, onAddToCart }: Props) => {
  return (
    <div className="product-card group flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden bg-dark aspect-[4/3]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badge */}
        {product.badge && (
          <span className={`absolute top-2 left-2 ${
            product.badge === 'new'  ? 'badge-new'  :
            product.badge === 'hit'  ? 'badge-hit'  : 'badge-sale'
          }`}>
            {product.badge === 'new' ? 'Новинка' : product.badge === 'hit' ? 'Хит' : 'Акция'}
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-dark/60 flex items-center justify-center">
            <span className="text-xs text-olive-400 font-semibold">Нет в наличии</span>
          </div>
        )}
        {/* Quick view overlay */}
        <Link
          to={`/product/${product.slug}`}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-dark/40"
        >
          <span className="flex items-center gap-1.5 bg-dark-card/90 text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/10">
            <Eye size={12} /> Быстрый просмотр
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

        {/* Price + cart */}
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            {product.price ? (
              <>
                <div className="price-tag">{fmtPrice(product.price)}</div>
                {product.oldPrice && (
                  <div className="price-old">{fmtPrice(product.oldPrice)}</div>
                )}
              </>
            ) : (
              <div className="text-sm font-semibold text-olive-400">По запросу</div>
            )}
          </div>

          <button
            onClick={() => onAddToCart?.(product)}
            disabled={!product.inStock}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-olive-500 hover:bg-olive-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
          >
            <ShoppingCart size={14} />
          </button>
        </div>

        {product.inStock ? (
          <div className="mt-2 text-[10px] text-olive-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            В наличии
          </div>
        ) : null}
      </div>
    </div>
  );
};
