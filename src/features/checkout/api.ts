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
  status:
    | 'PENDING'
    | 'AWAITING_PAYMENT'
    | 'PAID'
    | 'CANCELED'
    | 'FULFILLED';
  totalAmount: number;
  currency: string;
  createdAt: string;
  items: OrderItemDto[];
  lastPayment: { status: string; confirmationUrl: string | null } | null;
}

export interface PaymentDto {
  paymentId: string;
  confirmationUrl: string | null;
  status: string;
}

/** Step 2: create order (prices are computed server-side). */
export function createOrder(
  form: CheckoutForm,
  items: { productId: number; quantity: number }[],
): Promise<OrderDto> {
  return api<OrderDto>('/orders', {
    method: 'POST',
    body: { ...form, items },
  });
}

/** Step 3: create YooKassa payment intent → confirmation_url. */
export function createPayment(orderId: string): Promise<PaymentDto> {
  return api<PaymentDto>(`/orders/${orderId}/payment`, { method: 'POST' });
}

/** Step 6-7: poll order status after returning from payment. */
export function getOrder(orderId: string): Promise<OrderDto> {
  return api<OrderDto>(`/orders/${orderId}`);
}
