export type YooKassaPaymentStatus =
  | 'pending'
  | 'waiting_for_capture'
  | 'succeeded'
  | 'canceled';

export interface YooKassaAmount {
  value: string; // "109900.00"
  currency: string; // "RUB"
}

export interface YooKassaPayment {
  id: string;
  status: YooKassaPaymentStatus;
  paid: boolean;
  amount: YooKassaAmount;
  confirmation?: {
    type: 'redirect';
    confirmation_url?: string;
    return_url?: string;
  };
  metadata?: Record<string, string>;
  created_at: string;
  captured_at?: string;
  cancellation_details?: { party: string; reason: string };
}

export interface CreateYooKassaPaymentParams {
  amountRub: string; // "109900.00"
  description: string;
  returnUrl: string;
  metadata: Record<string, string>;
  customerEmail?: string;
  customerPhone?: string;
  receiptItems: {
    description: string;
    quantity: number;
    amountRub: string; // unit price
  }[];
}

export interface YooKassaWebhookBody {
  type: 'notification';
  event:
    | 'payment.succeeded'
    | 'payment.waiting_for_capture'
    | 'payment.canceled'
    | 'refund.succeeded';
  object: YooKassaPayment;
}
