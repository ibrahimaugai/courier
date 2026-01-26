import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting Attestation Services Seed...');

    // Get or create Attestation service type
    let attestationServiceType = await prisma.service.findFirst({
        where: { serviceType: 'Attestation', serviceName: 'Attestation Services' }
    });

    if (!attestationServiceType) {
        attestationServiceType = await prisma.service.create({
            data: {
                serviceCode: 'ATT-MAIN',
                serviceType: 'Attestation',
                serviceName: 'Attestation Services',
                status: 'active'
            }
        });
        console.log('✅ Created Attestation service type');
    }

    // Get a default city (attestation doesn't depend on routes, but we need city IDs for the schema)
    const defaultCity = await prisma.city.findFirst({ where: { status: 'active' } });
    if (!defaultCity) {
        throw new Error('No active city found. Please seed cities first.');
    }
    // CLEANUP: Delete existing Attestation services and rules to prevent duplicates/conflicts
    console.log('🧹 Cleaning up existing Attestation services...');

    // Find all attestation services
    const existingServices = await prisma.service.findMany({
        where: { serviceType: 'Attestation' },
        select: { id: true }
    });

    const serviceIds = existingServices.map(s => s.id);

    if (serviceIds.length > 0) {
        // Delete associated pricing rules first
        await prisma.pricingRule.deleteMany({
            where: { serviceId: { in: serviceIds } }
        });

        // Delete the services
        await prisma.service.deleteMany({
            where: { id: { in: serviceIds } }
        });
        console.log(`🗑️ Deleted ${serviceIds.length} existing attestation services and their rules.`);
    }

    // Attestation services data from the rate sheet
    const attestationServices = [
        // NPS All services Rate Sheet
        { category: 'NPS', name: 'Mofa General Attestation', days: '4 to 5 working days', rate: 4500, addPageRate: null },
        { category: 'NPS', name: 'Apostille Urgent single page', days: '4 to 5 working days', rate: 40000, addPageRate: null },
        { category: 'NPS', name: 'Appostille file URGENT', days: '4 to 5 working days', rate: 40000, addPageRate: 5000 },
        { category: 'NPS', name: 'National Beuro Urgent', days: '10 to 12 working days', rate: 26000, addPageRate: null },

        // Embassies Attestation
        { category: 'Embassy', name: 'Uae Embassy', days: '7 to 8 working days', rate: 41500, addPageRate: 41500 },
        { category: 'Embassy', name: 'Saudia Embassy', days: '7 to 8 working days', rate: 21500, addPageRate: 21500 },
        { category: 'Embassy', name: 'Saudi Culture', days: '12 to 15 working days', rate: 105000, addPageRate: 105000 },
        { category: 'Embassy', name: 'Oman Embassy', days: '7 to 8 working days', rate: 41500, addPageRate: 41500 },
        { category: 'Embassy', name: 'Kuwait Embassy', days: '7 to 8 working days', rate: 24500, addPageRate: 24500 },
        { category: 'Embassy', name: 'Bahrain embassy', days: '7 to 8 working days', rate: 33500, addPageRate: 33500 },
        { category: 'Embassy', name: 'Qatar Embassy', days: '7 to 8 working days', rate: 23500, addPageRate: 23500 },

        // Educational Documents Attestation
        { category: 'Educational', name: 'Hec Attestation', days: '8 working days', rate: 18000, addPageRate: 3000 },
        { category: 'Educational', name: 'University Verification', days: '4 to 5 working days', rate: 4500, addPageRate: 4500 },
        { category: 'Educational', name: 'Ibcc Attestation Urgent', days: '4 to 5 working days', rate: 12000, addPageRate: 3500 },
        { category: 'Educational', name: 'Gujranwala Borad verification', days: '4 to 5 working days', rate: 6000, addPageRate: 6000 },
        { category: 'Educational', name: 'Fedral Board Verification', days: '5 to 6 working days', rate: 6500, addPageRate: 6500 },
        { category: 'Educational', name: 'Lahore Board Verification', days: '5 to 6 working days', rate: 9500, addPageRate: 9500 },
        { category: 'Educational', name: 'IBCC ENQUIVALENCE DEGREE + IBCC ATTEST', days: '12 WORKING DAYS', rate: 35000, addPageRate: 15000 },
        { category: 'Educational', name: 'Technical Board verification', days: '5 to 6 working days', rate: 8500, addPageRate: 8500 },

        // Special Documemts
        { category: 'Special', name: 'Foreigner marriage certificate', days: '6 working days', rate: 30000, addPageRate: 30000 },
        { category: 'Special', name: 'Divorce certificate General Mofa', days: '6 working days', rate: 25000, addPageRate: 25000 },
        { category: 'Special', name: 'Stamp paper General mofa', days: '6 working days', rate: 75000, addPageRate: 75000 },
        { category: 'Special', name: 'Stamp paper Apostille Urgent', days: '3 to 4 working days', rate: 45000, addPageRate: 45000 },
        { category: 'Special', name: 'Commercial documents urgent appostille', days: '12 working days', rate: 30000, addPageRate: 30000 },
        { category: 'Special', name: 'commercial documents Mofa Attestation', days: '6 working days', rate: 25000, addPageRate: 25000 },
        { category: 'Special', name: 'Stamp paper apostille Normal', days: '10 working days', rate: 30000, addPageRate: 30000 },

        // Translation of any embassy
        { category: 'Translation', name: 'Translation', days: '4 to 5 working days', rate: 4500, addPageRate: 4500 },
    ];

    console.log(`📝 Creating ${attestationServices.length} attestation services...`);

    let createdCount = 0;
    let updatedCount = 0;

    for (const service of attestationServices) {
        // Check if pricing rule already exists
        const existingRule = await prisma.pricingRule.findFirst({
            where: {
                service: {
                    serviceName: service.name,
                    serviceType: 'Attestation'
                }
            },
            include: { service: true }
        });

        if (existingRule) {
            // Update existing service (ensure days are updated)
            await prisma.service.update({
                where: { id: existingRule.service.id },
                data: { days: service.days }
            });

            // Update existing rule
            await prisma.pricingRule.update({
                where: { id: existingRule.id },
                data: {
                    baseRate: new Prisma.Decimal(service.rate),
                    additionalCharges: service.addPageRate ? new Prisma.Decimal(service.addPageRate) : null,
                }
            });
            updatedCount++;
        } else {
            // Create new service
            const serviceCode = `ATT-${service.category.substring(0, 3).toUpperCase()}-${createdCount + 1}`;
            const newService = await prisma.service.create({
                data: {
                    serviceCode: serviceCode,
                    serviceType: 'Attestation',
                    serviceName: service.name,
                    days: service.days,
                    status: 'active'
                }
            });

            // Create pricing rule (weight-independent, using 0-999 range)
            await prisma.pricingRule.create({
                data: {
                    originCityId: defaultCity.id,
                    destinationCityId: defaultCity.id,
                    serviceId: newService.id,
                    weightFrom: new Prisma.Decimal(0),
                    weightTo: new Prisma.Decimal(999),
                    ratePerKg: new Prisma.Decimal(0), // Not weight-based
                    baseRate: new Prisma.Decimal(service.rate),
                    additionalCharges: service.addPageRate ? new Prisma.Decimal(service.addPageRate) : null,
                    status: 'active',
                    effectiveFrom: new Date()
                }
            });
            createdCount++;
        }
    }

    console.log(`✅ Created ${createdCount} new attestation services`);
    console.log(`✅ Updated ${updatedCount} existing attestation services`);
    console.log('🎉 Attestation services seed completed!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding attestation services:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
