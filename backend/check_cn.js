
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const booking = await prisma.booking.findUnique({
        where: { cnNumber: '213' },
        include: {
            originCity: true,
            destinationCity: true,
            customer: true
        }
    });
    console.log(JSON.stringify(booking, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
