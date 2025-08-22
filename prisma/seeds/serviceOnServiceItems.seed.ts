import { Prisma, PrismaClient } from '@prisma/client';

export async function seedServiceOnServiceItems(prisma: PrismaClient) {
  const services = await prisma.service.findMany({ orderBy: { id: 'asc' } });
  const catalog  = await prisma.serviceItem.findMany({ orderBy: { id: 'asc' } });

  for (let i = 0; i < 10; i++) {
    const svc = services[i % services.length];
    const item = catalog[i % catalog.length];
    const qty = (i % 3) + 1;

    await prisma.serviceOnServiceItem.upsert({
      where: { serviceId_serviceItemId: { serviceId: svc.id, serviceItemId: item.id } },
      update: { quantity: qty, unitPrice: new Prisma.Decimal(item.price.toString()) },
      create: {
        serviceId: svc.id,
        serviceItemId: item.id,
        quantity: qty,
        unitPrice: new Prisma.Decimal(item.price.toString()),
      },
    });
  }
  console.log('ServiceOnServiceItem: 10 (upsert compound key)');
}