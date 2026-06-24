import { useEffect, useState } from 'react';
import { api } from '../../shared/api/http';
import { API_ENABLED } from '../../shared/config';
import {
  categories as staticCategories,
  products as staticProducts,
  type Product,
} from './data/catalog.static';

export type { Product };

export interface Category {
  slug: string;
  label: string;
  count: number;
}

/**
 * Единый источник каталога — PostgreSQL через API. Сайт и мини-апп читают
 * одни и те же эндпоинты; изменения в админке видны на обоих каналах.
 * Статический каталог — только для локальной разработки без backend.
 */
export async function fetchProducts(category?: string): Promise<Product[]> {
  if (!API_ENABLED) return filterStatic(category);
  const qs = category && category !== 'all' ? `?category=${category}` : '';
  return await api<Product[]>(`/products${qs}`);
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  if (!API_ENABLED) {
    return staticProducts.find((p) => p.slug === slug) ?? null;
  }
  try {
    return await api<Product>(`/products/${slug}`);
  } catch {
    return null;
  }
}

export async function fetchCategories(): Promise<Category[]> {
  if (!API_ENABLED) return staticCategories;
  return await api<Category[]>(`/categories`);
}

function filterStatic(category?: string): Product[] {
  if (!category || category === 'all') return staticProducts;
  return staticProducts.filter((p) => p.categorySlug === category);
}

/* ── React hooks ─────────────────────────────────────────────── */

export function useProducts(category?: string) {
  const [products, setProducts] = useState<Product[]>(
    API_ENABLED ? [] : filterStatic(category),
  );
  const [loading, setLoading] = useState(API_ENABLED);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(API_ENABLED);
    setError(null);
    fetchProducts(category)
      .then((data) => {
        if (active) {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setProducts([]);
          setLoading(false);
          setError('Не удалось загрузить каталог');
        }
      });
    return () => {
      active = false;
    };
  }, [category]);

  return { products, loading, error };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(
    API_ENABLED ? [] : staticCategories,
  );

  useEffect(() => {
    let active = true;
    fetchCategories()
      .then((data) => {
        if (active && data?.length) setCategories(data);
      })
      .catch(() => {
        /* пустой список — админ ещё не добавил категории */
      });
    return () => {
      active = false;
    };
  }, []);

  return categories;
}

export function useProduct(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(
    API_ENABLED ? null : (staticProducts.find((p) => p.slug === slug) ?? null),
  );
  const [loading, setLoading] = useState(API_ENABLED);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(API_ENABLED);
    fetchProduct(slug).then((data) => {
      if (active) {
        setProduct(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [slug]);

  return { product, loading };
}
