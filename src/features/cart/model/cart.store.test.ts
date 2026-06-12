import { beforeEach, describe, expect, it } from 'vitest';
import { useCartStore } from './cart.store';
import type { Product } from '../../../entities/product/data/catalog.static';

const product = (id: string, price: number | null = 1000): Product => ({
  id,
  slug: `p-${id}`,
  name: `Product ${id}`,
  category: 'Test',
  categorySlug: 'test',
  price,
  inStock: true,
  shortDesc: '',
  fullDesc: '',
  image: '',
  gallery: [],
  specs: [],
});

describe('cart store', () => {
  beforeEach(() => useCartStore.setState({ items: [] }));

  it('adds products and increments qty for duplicates', () => {
    const { add } = useCartStore.getState();
    add(product('1'));
    add(product('1'));
    add(product('2'));
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(2);
    expect(items[0].qty).toBe(2);
  });

  it('removes items when qty drops to zero', () => {
    const { add, setQty } = useCartStore.getState();
    add(product('1'));
    setQty('1', 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('updates quantity', () => {
    const { add, setQty } = useCartStore.getState();
    add(product('1'));
    setQty('1', 5);
    expect(useCartStore.getState().items[0].qty).toBe(5);
  });

  it('removes specific item', () => {
    const { add, remove } = useCartStore.getState();
    add(product('1'));
    add(product('2'));
    remove('1');
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0].product.id).toBe('2');
  });

  it('clears the cart', () => {
    const { add, clear } = useCartStore.getState();
    add(product('1'));
    clear();
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
