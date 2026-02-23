import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from '@/common/decorators/public.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'User registration (USER role only)' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login (ADMIN/SUPER_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Admin login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or insufficient privileges' })
  async adminLogin(@Body() loginDto: LoginDto) {
    return this.authService.adminLogin(loginDto);
  }

  @Post('admin/register-employee')
  @ApiOperation({ summary: 'Admin register employee (any role)' })
  @ApiResponse({ status: 201, description: 'Employee registered successfully' })
  @ApiResponse({ status: 409, description: 'Username already exists' })
  async registerEmployee(@Body() registerDto: RegisterDto) {
    return this.authService.registerEmployee(registerDto);
  }

  @Post('admin/reset-employee-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reset employee password (SUPER_ADMIN only). Returns new password.' })
  async resetEmployeePassword(@Body() body: { userId: string; newPassword: string }) {
    return this.authService.resetEmployeePassword(body.userId, body.newPassword);
  }
}
