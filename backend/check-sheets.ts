import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const sheets = await prisma.deliverySheet.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log('Last 5 Sheets:', JSON.stringify(sheets, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
