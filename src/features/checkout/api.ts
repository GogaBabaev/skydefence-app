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
