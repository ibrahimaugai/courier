import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAdminToSuperAdmin() {
    try {
        // Update the admin user to SUPER_ADMIN
        const result = await prisma.user.update({
            where: { username: 'admin' },
            data: { role: 'SUPER_ADMIN' }
        });

        console.log('✅ Successfully updated admin user to SUPER_ADMIN');
        console.log('Updated user:', {
            id: result.id,
            username: result.username,
            role: result.role,
            staffCode: result.staffCode
        });
    } catch (error) {
        console.error('❌ Error updating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateAdminToSuperAdmin();
