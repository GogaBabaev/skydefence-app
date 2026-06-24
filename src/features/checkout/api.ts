import { api } from '../../shared/api/http';
import type { CheckoutForm } from './model/schema';

export interface OrderItemDto {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderDto {
  id: string;
  number: number;
  status: 'NEW' | 'CONFIRMED' | 'CANCELED' | 'FULFILLED';
  totalAmount: number;
  currency: string;
  createdAt: string;
  items: OrderItemDto[];
}

/** Creates the order (prices are computed server-side) and notifies the
 * manager in Telegram. Payment is arranged manually afterwards. */
export function createOrder(
  form: CheckoutForm,
  items: { productId: number; quantity: number }[],
): Promise<OrderDto> {
  return api<OrderDto>('/orders', {
    method: 'POST',
    body: { ...form, items },
  });
}

export function getOrder(orderId: string): Promise<OrderDto> {
  return api<OrderDto>(`/orders/${orderId}`);
}

/**
 * Sends a price-quote (B2B) request for a cart that contains only
 * "price on request" items — there is nothing to price server-side, so we
 * notify the manager with the item list instead of creating an order.
 */
export function createQuoteRequest(
  form: CheckoutForm,
  items: { name: string; quantity: number }[],
): Promise<{ id: number; status: string }> {
  const list = items.map((i) => `• ${i.name} ×${i.quantity}`).join('\n');
  const message =
    `Запрос цены на товары:\n${list}` +
    (form.comment?.trim() ? `\n\nКомментарий: ${form.comment.trim()}` : '');
  return api<{ id: number; status: string }>('/b2b-requests', {
    method: 'POST',
    body: {
      company: form.company?.trim() || 'Физическое лицо',
      inn: form.inn?.trim() || undefined,
      contactName: form.customerName,
      phone: form.customerPhone,
      email: form.customerEmail?.trim() || undefined,
      message,
      consent: form.consent,
    },
  });
}
