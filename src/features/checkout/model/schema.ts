import { z } from 'zod';

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .min(2, 'Укажите имя (минимум 2 символа)')
    .max(120, 'Слишком длинное имя'),
  customerPhone: z
    .string()
    .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Неверный формат телефона'),
  customerEmail: z
    .string()
    .email('Неверный email')
    .max(254)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  company: z
    .string()
    .max(200)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  inn: z
    .string()
    .regex(/^\d{10}(\d{2})?$/, 'ИНН — 10 или 12 цифр')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  deliveryAddress: z
    .string()
    .max(500)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  comment: z
    .string()
    .max(1000)
    .optional()
    .or(z.literal('').transform(() => undefined)),
  // 152-ФЗ: явное согласие на обработку ПДн. Фронтовый гейт — на бэкенд НЕ
  // отправляется (там ValidationPipe forbidNonWhitelisted, лишнее поле = 400).
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Подтвердите согласие на обработку персональных данных' }),
  }),
});

export type CheckoutForm = z.infer<typeof checkoutSchema>;
