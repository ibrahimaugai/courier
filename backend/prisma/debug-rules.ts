import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const origin = await prisma.city.findFirst({ where: { cityCode: 'DHN' } });
    const destination = await prisma.city.findFirst({ where: { cityCode: 'ISB' } });
    const service = await prisma.service.findFirst({ where: { serviceName: 'INTL - Documents' } });

    console.log('City/Service Search:');
    console.log('Origin:', origin?.id, origin?.cityName);
    console.log('Destination:', destination?.id, destination?.cityName);
    console.log('Service:', service?.id, service?.serviceName);

    if (origin && destination && service) {
        const rules = await prisma.pricingRule.findMany({
            where: {
                originCityId: origin.id,
                destinationCityId: destination.id,
                serviceId: service.id
            }
        });
        console.log('Rules found:', JSON.stringify(rules, null, 2));
    }
}

main().finally(() => prisma.$disconnect());
