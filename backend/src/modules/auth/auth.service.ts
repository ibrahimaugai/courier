import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from '../users/users.service';
import { BatchesService } from '../batches/batches.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private batchesService: BatchesService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Auto-ensure active batch for user
    let batchStatus: any = { status: 'none' };
    try {
      const batch = await this.batchesService.ensureActiveBatch(user.id);
      batchStatus = { status: 'active', batchCode: batch.batchCode };
      console.log(`✅ Active batch auto-ensured for user: ${user.username}`);
    } catch (error) {
      batchStatus = { status: 'error', message: error.message };
      console.warn(`⚠️ Batch auto-creation skipped for ${user.username}: ${error.message}`);
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        staffCode: user.staffCode,
      },
      batchInfo: batchStatus,
    };
  }

  async adminLogin(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    // Ensure user is ADMIN or SUPER_ADMIN
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Access denied. Admin privileges required.');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Auto-ensure active batch for user
    let batchStatus: any = { status: 'none' };
    try {
      const batch = await this.batchesService.ensureActiveBatch(user.id);
      batchStatus = { status: 'active', batchCode: batch.batchCode };
      console.log(`✅ Active batch auto-ensured for admin: ${user.username}`);
    } catch (error) {
      batchStatus = { status: 'error', message: error.message };
      console.warn(`⚠️ Batch auto-creation skipped for admin ${user.username}: ${error.message}`);
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        staffCode: user.staffCode,
      },
      batchInfo: batchStatus,
    };
  }

  async register(registerDto: RegisterDto) {
    // Check username uniqueness FIRST (strict rule)
    const existingUserByUsername = await this.prisma.user.findUnique({
      where: { username: registerDto.username },
    });

    if (existingUserByUsername) {
      throw new ConflictException('Username already exists');
    }

    // Check email uniqueness if provided
    if (registerDto.email) {
      const existingUserByEmail = await this.prisma.user.findUnique({
        where: { email: registerDto.email },
      });

      if (existingUserByEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // RESTRICTION: Public signup can ONLY create USER role accounts
    // Admin accounts must be created by SUPER_ADMIN or via seed
    const userRole = registerDto.role || 'USER';
    if (userRole !== 'USER') {
      throw new ConflictException(
        'Only USER role accounts can be created via public registration. Admin accounts must be created by system administrators.',
      );
    }

    // Create user and customer (if USER role and customer fields provided) in a transaction
    const result = await this.prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          username: registerDto.username,
          email: registerDto.email || null,
          passwordHash: hashedPassword,
          role: 'USER', // Force USER role for public signup
          staffCode: registerDto.staffCode,
          isActive: false, // Require SUPER_ADMIN approval before customer can login
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...userResult } = user;
      return userResult;
    });

    return result;
  }

  async registerEmployee(registerDto: RegisterDto) {
    // Check username uniqueness
    const existingUserByUsername = await this.prisma.user.findUnique({
      where: { username: registerDto.username },
    });

    if (existingUserByUsername) {
      throw new ConflictException('Username already exists');
    }

    // Check email uniqueness if provided
    if (registerDto.email) {
      const existingUserByEmail = await this.prisma.user.findUnique({
        where: { email: registerDto.email },
      });

      if (existingUserByEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Admin can create any role
    const user = await this.prisma.user.create({
      data: {
        username: registerDto.username,
        email: registerDto.email || null,
        passwordHash: hashedPassword,
        role: registerDto.role || 'USER',
        staffCode: registerDto.staffCode,
        stationId: registerDto.stationId,
        isActive: true,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userResult } = user;
    return userResult;
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Reset employee password (SUPER_ADMIN only). Returns the new password so SUPER_ADMIN can share it.
   */
  async resetEmployeePassword(userId: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new ConflictException('User not found');
    }
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new ConflictException('Can only reset password for admin employees');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    return { password: newPassword, username: user.username };
  }
}
