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
 * Catalog source of truth is the backend (PostgreSQL).
 * The bundled static catalog is used as a fallback so the storefront
 * stays browsable if the API is unreachable; orders/payments always
 * require the backend.
 */
export async function fetchProducts(category?: string): Promise<Product[]> {
  if (!API_ENABLED) return filterStatic(category);
  try {
    const qs = category && category !== 'all' ? `?category=${category}` : '';
    return await api<Product[]>(`/products${qs}`);
  } catch {
    return filterStatic(category);
  }
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  if (!API_ENABLED) {
    return staticProducts.find((p) => p.slug === slug) ?? null;
  }
  try {
    return await api<Product>(`/products/${slug}`);
  } catch {
    return staticProducts.find((p) => p.slug === slug) ?? null;
  }
}

export async function fetchCategories(): Promise<Category[]> {
  if (!API_ENABLED) return staticCategories;
  try {
    return await api<Category[]>(`/categories`);
  } catch {
    return staticCategories;
  }
}

function filterStatic(category?: string): Product[] {
  if (!category || category === 'all') return staticProducts;
  return staticProducts.filter((p) => p.categorySlug === category);
}

/* ── React hooks ─────────────────────────────────────────────── */

export function useProducts(category?: string) {
  const [products, setProducts] = useState<Product[]>(filterStatic(category));
  const [loading, setLoading] = useState(API_ENABLED);

  useEffect(() => {
    let active = true;
    setLoading(API_ENABLED);
    fetchProducts(category).then((data) => {
      if (active) {
        setProducts(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [category]);

  return { products, loading };
}

export function useProduct(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(
    () => staticProducts.find((p) => p.slug === slug) ?? null,
  );

  useEffect(() => {
    if (!slug) return;
    let active = true;
    fetchProduct(slug).then((data) => {
      if (active && data) setProduct(data);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  return product;
}
