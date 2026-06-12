import { describe, expect, it } from 'vitest';
import { checkoutSchema } from './schema';

const valid = {
  customerName: 'Иван Иванов',
  customerPhone: '+7 (999) 000-00-00',
  customerEmail: 'ivan@company.ru',
  company: 'ООО «Пример»',
  inn: '7700000000',
  deliveryAddress: 'Москва, ул. Примерная, 1',
  comment: 'Срочно',
};

describe('checkoutSchema', () => {
  it('accepts a valid full form', () => {
    expect(checkoutSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts minimal form (name + phone only)', () => {
    const result = checkoutSchema.safeParse({
      customerName: 'Иван',
      customerPhone: '+79990000000',
      customerEmail: '',
      company: '',
      inn: '',
      deliveryAddress: '',
      comment: '',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customerEmail).toBeUndefined();
      expect(result.data.inn).toBeUndefined();
    }
  });

  it('rejects bad phone', () => {
    expect(
      checkoutSchema.safeParse({ ...valid, customerPhone: 'abc' }).success,
    ).toBe(false);
  });

  it('rejects bad INN', () => {
    expect(checkoutSchema.safeParse({ ...valid, inn: '123' }).success).toBe(
      false,
    );
    expect(
      checkoutSchema.safeParse({ ...valid, inn: '770000000000' }).success,
    ).toBe(true); // 12 digits ok
  });

  it('rejects too short name', () => {
    expect(
      checkoutSchema.safeParse({ ...valid, customerName: 'И' }).success,
    ).toBe(false);
  });

  it('rejects bad email', () => {
    expect(
      checkoutSchema.safeParse({ ...valid, customerEmail: 'not-email' })
        .success,
    ).toBe(false);
  });
});
