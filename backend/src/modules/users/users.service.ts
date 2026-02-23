import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        staffCode: true,
        stationId: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        staffCode: true,
        stationId: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    });
  }

  /**
   * Get pending customers (USER role, isActive: false) for SUPER_ADMIN approval.
   */
  async findPendingCustomers() {
    return this.prisma.user.findMany({
      where: { role: 'USER', isActive: false },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Approve a customer (set isActive: true). SUPER_ADMIN only.
   */
  async approveCustomer(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (user.role !== 'USER') {
      throw new BadRequestException('Can only approve customer (USER role) accounts');
    }
    return this.prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        staffCode: true,
        stationId: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        staffCode: true,
        stationId: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Permanently delete an employee (SUPER_ADMIN only). Cannot delete self or other SUPER_ADMINs.
   */
  async deletePermanently(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new BadRequestException('Cannot delete your own account');
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (user.role === 'SUPER_ADMIN') {
      throw new BadRequestException('Cannot permanently delete a SUPER_ADMIN');
    }
    if (user.role !== 'ADMIN') {
      throw new BadRequestException('Can only permanently delete admin employees');
    }

    try {
      await this.prisma.user.delete({ where: { id } });
      return { deleted: true, id };
    } catch (error: any) {
      if (error?.code === 'P2003' || error?.message?.includes('foreign key')) {
        throw new BadRequestException(
          'Cannot delete: this user has associated records. Deactivate the user instead.',
        );
      }
      throw error;
    }
  }
}
