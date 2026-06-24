import { Test } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { LeadsService } from './leads.service';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramNotifyService } from '../notifications/telegram-notify.service';

const dec = (v: string | number) => new Prisma.Decimal(v);

describe('LeadsService', () => {
  let service: LeadsService;
  let prisma: {
    product: { findMany: jest.Mock };
    order: { create: jest.Mock };
    leadCallback: { create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      product: { findMany: jest.fn() },
      order: { create: jest.fn() },
      leadCallback: { create: jest.fn() },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: TelegramNotifyService,
          useValue: { notifyManager: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();
    service = moduleRef.get(LeadsService);
  });

  it('computes website order total from DB prices by slug', async () => {
    prisma.product.findMany.mockResolvedValue([
      {
        id: 1,
        slug: 'detector-a',
        name: 'Detector A',
        price: dec('1000'),
        inStock: true,
      },
      {
        id: 2,
        slug: 'detector-b',
        name: 'Detector B',
        price: dec('500'),
        inStock: true,
      },
    ]);
    prisma.order.create.mockResolvedValue({ id: 'o1', number: 42 });

    await service.order({
      name: 'Ivan',
      phone: '+79990000000',
      items: [
        { slug: 'detector-a', qty: 2 },
        { slug: 'detector-b', qty: 1 },
      ],
      consent: true,
    } as any);

    const created = prisma.order.create.mock.calls[0][0].data;
    expect(created.totalAmount).toBe(2500);
    expect(created.items.create).toEqual([
      {
        productId: 1,
        productName: 'Detector A',
        unitPrice: 1000,
        quantity: 2,
      },
      {
        productId: 2,
        productName: 'Detector B',
        unitPrice: 500,
        quantity: 1,
      },
    ]);
  });

  it('rejects unknown product slugs', async () => {
    prisma.product.findMany.mockResolvedValue([]);
    await expect(
      service.order({
        name: 'Ivan',
        phone: '+79990000000',
        items: [{ slug: 'fake-product', qty: 1 }],
      }),
    ).rejects.toThrow('Some products do not exist');
  });
});
