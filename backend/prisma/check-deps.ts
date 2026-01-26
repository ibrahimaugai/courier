import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const inactiveId = '73774c1b-946d-4a30-998a-ac0f8d415b39';

    const productsCount = await prisma.product.count({ where: { serviceId: inactiveId } });
    const bookingsCount = await prisma.booking.count({ where: { serviceId: inactiveId } });

    console.log(`Product dependencies: ${productsCount}`);
    console.log(`Booking dependencies: ${bookingsCount}`);
}

main().finally(() => prisma.$disconnect());
