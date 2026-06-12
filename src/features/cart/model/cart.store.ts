import { create } from 'zustand';
import type { Product } from '../../../entities/product/data/catalog.static';

export interface CartItem {
  product: Product;
  qty: number;
}

interface CartState {
  items: CartItem[];
  add: (product: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],

  add: (product) =>
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i,
          ),
        };
      }
      return { items: [...state.items, { product, qty: 1 }] };
    }),

  remove: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== id),
    })),

  setQty: (id, qty) =>
    set((state) => ({
      items:
        qty <= 0
          ? state.items.filter((i) => i.product.id !== id)
          : state.items.map((i) =>
              i.product.id === id ? { ...i, qty } : i,
            ),
    })),

  clear: () => set({ items: [] }),
}));

/** Drop-in replacement for the old CartContext hook. */
export const useCart = () => {
  const items = useCartStore((s) => s.items);
  const add = useCartStore((s) => s.add);
  const remove = useCartStore((s) => s.remove);
  const setQty = useCartStore((s) => s.setQty);
  const clear = useCartStore((s) => s.clear);

  const totalCount = items.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + (i.product.price ?? 0) * i.qty,
    0,
  );

  return { items, totalCount, totalPrice, add, remove, setQty, clear };
};
