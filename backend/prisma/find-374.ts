import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const rules = await prisma.pricingRule.findMany({
        where: {
            OR: [
                { baseRate: 374 },
                { baseRate: { gte: 373, lte: 375 } }
            ]
        },
        include: {
            originCity: true,
            destinationCity: true,
            service: true
        }
    });

    console.log('Rules near 374:', JSON.stringify(rules, null, 2));
}

main().finally(() => prisma.$disconnect());
