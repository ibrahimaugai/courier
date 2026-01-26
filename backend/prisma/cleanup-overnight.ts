import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const activeId = 'b6666c43-0f89-4aa1-ba6e-1ba92b934cf5';
    const inactiveId = '73774c1b-946d-4a30-998a-ac0f8d415b39';

    console.log('Starting cleanup of duplicate Over Night service...');

    // 1. Move Bookings
    const updatedBookings = await prisma.booking.updateMany({
        where: { serviceId: inactiveId },
        data: { serviceId: activeId }
    });
    console.log(`Reassigned ${updatedBookings.count} bookings to active service.`);

    // 2. Move Products
    const updatedProducts = await prisma.product.updateMany({
        where: { serviceId: inactiveId },
        data: { serviceId: activeId }
    });
    console.log(`Reassigned ${updatedProducts.count} products to active service.`);

    // 3. Delete Pricing Rules for inactive service
    const deletedRules = await prisma.pricingRule.deleteMany({
        where: { serviceId: inactiveId }
    });
    console.log(`Deleted ${deletedRules.count} pricing rules from inactive service.`);

    // 4. Delete the inactive service
    await prisma.service.delete({
        where: { id: inactiveId }
    });
    console.log(`Successfully deleted the inactive 'Over Night' service duplicate.`);
}

main()
    .catch(e => console.error('Cleanup failed:', e))
    .finally(() => prisma.$disconnect());
