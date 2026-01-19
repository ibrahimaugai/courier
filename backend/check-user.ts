import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const userId = '8b60c334-69e5-4320-bfee-0abc4a0a3fdd';
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { station: true }
    });
    console.log('User:', JSON.stringify(user, null, 2));

    const stations = await prisma.station.findMany();
    console.log('Available Stations:', JSON.stringify(stations, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
