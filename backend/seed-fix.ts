import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting seed fix...');

    // 1. Ensure a city exists
    let city = await prisma.city.findFirst();
    if (!city) {
        city = await prisma.city.create({
            data: {
                cityCode: 'LHR',
                cityName: 'Lahore',
                province: 'Punjab',
                status: 'active'
            }
        });
        console.log('Created city:', city.cityName);
    }

    // 2. Ensure a station exists
    let station = await prisma.station.findFirst();
    if (!station) {
        station = await prisma.station.create({
            data: {
                stationCode: 'LHR-01',
                stationName: 'Lahore Head Office',
                cityId: city.id,
                status: 'active'
            }
        });
        console.log('Created station:', station.stationName);
    }

    // 3. Assign admin user to this station
    const adminId = '8b60c334-69e5-4320-bfee-0abc4a0a3fdd';
    const updatedUser = await prisma.user.update({
        where: { id: adminId },
        data: { stationId: station.id }
    });
    console.log('Updated user admin with stationId:', updatedUser.stationId);

    console.log('Seed fix completed.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
