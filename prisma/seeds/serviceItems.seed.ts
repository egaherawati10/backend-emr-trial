import { Prisma, PrismaClient } from '@prisma/client';

export async function seedServiceItems(prisma: PrismaClient) {
  const names = [
    'Consultation','Blood Test','X-Ray','Ultrasound','ECG',
    'Urine Analysis','MRI (Basic)','Physio Session','Wound Dressing','Vaccination',
  ];

  for (let i = 0; i < 10; i++) {
    await prisma.serviceItem.upsert({
      where: { name: names[i] },
      update: {},
      create: { name: names[i], price: new Prisma.Decimal((25000 + i * 15000).toFixed(2)) },
    });
  }
  console.log('ServiceItem: 10');
}