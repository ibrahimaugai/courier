import { PrismaClient } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

type PrismaTransactionClient = Omit<
  PrismaClient,
  '$on' | '$connect' | '$disconnect' | '$use' | '$transaction' | '$extends'
>;

/**
 * Centralized CN Number Generator
 *
 * Format: 10 digits, YYYYMMDDNN (no CN prefix, no dashes)
 * Example: 2026022301
 *
 * Rules:
 * - Auto-generated on backend only
 * - Unique per day
 * - Transaction-safe
 * - Prevents race conditions
 */
export class CnGenerator {
  /**
   * Generate a unique CN number
   * @param prisma - Prisma client instance (full client or transaction client)
   * @returns Promise<string> - Generated CN number
   */
  static async generate(prisma: PrismaClient | PrismaTransactionClient): Promise<string> {
    const maxRetries = 10;
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        // Get current date in YYYYMMDD format
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const day = now.getDate();
        const monthStr = String(month + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}${monthStr}${dayStr}`;

        // Get count of bookings created today to generate sequence
        const todayStart = new Date(year, month, day, 0, 0, 0, 0);
        const todayEnd = new Date(year, month, day, 23, 59, 59, 999);

        // Count existing bookings for today (transaction-safe)
        const count = await prisma.booking.count({
          where: {
            createdAt: {
              gte: todayStart,
              lte: todayEnd,
            },
          },
        });

        // Generate sequence number (2 digits, zero-padded) - 10 digits total: YYYYMMDD + NN
        const sequence = String(count + 1).padStart(2, '0');

        // Construct CN number (10 digits, no CN prefix or dashes)
        const cnNumber = `${dateStr}${sequence}`;

        // Check if this CN already exists (race condition protection)
        const exists = await prisma.booking.findUnique({
          where: { cnNumber },
        });

        if (!exists) {
          return cnNumber;
        }

        // If collision, increment and retry
        attempts++;

        // If too many collisions, use timestamp-based fallback
        if (attempts >= maxRetries) {
          const timestamp = Date.now().toString().slice(-2);
          const fallbackCn = `${dateStr}${timestamp}`;

          // Final check for fallback
          const fallbackExists = await prisma.booking.findUnique({
            where: { cnNumber: fallbackCn },
          });

          if (!fallbackExists) {
            return fallbackCn;
          }

          // Last resort: use random 2-digit suffix
          const randomSuffix = Math.floor(Math.random() * 100)
            .toString()
            .padStart(2, '0');
          return `${dateStr}${randomSuffix}`;
        }

        // Wait a bit before retry to avoid race conditions
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error) {
        attempts++;
        if (attempts >= maxRetries) {
          throw new BadRequestException('Failed to generate CN number. Please try again.');
        }
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    throw new BadRequestException('Failed to generate unique CN number after multiple attempts.');
  }

  /**
   * Generate CN number with transaction safety
   * Uses Prisma transaction to ensure atomicity
   */
  static async generateWithTransaction(prisma: PrismaClient): Promise<string> {
    return await prisma.$transaction(
      async tx => {
        return await this.generate(tx);
      },
      {
        maxWait: 5000, // Maximum time to wait for transaction
        timeout: 10000, // Maximum time for transaction to complete
      },
    );
  }
}
