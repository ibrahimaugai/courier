import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const services = await prisma.service.findMany({
        where: {
            serviceName: { contains: 'Over Night', mode: 'insensitive' }
        },
        include: {
            _count: {
                select: { pricingRules: true }
            }
        }
    });

    console.log('--- Duplicate Service Inspection ---');
    services.forEach(s => {
        console.log(`ID: ${s.id}`);
        console.log(`Name: ${s.serviceName}`);
        console.log(`Code: ${s.serviceCode}`);
        console.log(`Status: ${s.status}`);
        console.log(`Rules Count: ${s._count.pricingRules}`);
        console.log('-----------------------------------');
    });
}

main().finally(() => prisma.$disconnect());
