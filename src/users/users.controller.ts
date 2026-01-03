/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Param,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './schemas/user.schema';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Endpoint: POST /users
  @Post()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Approve a user
  @UseGuards(AuthGuard('jwt'), RolesGuard) // Check Token AND Role
  @Roles(UserRole.ADMIN) // Only Admin allowed
  @Post(':id/approve')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a pending user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User approved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  approveUser(@Param('id') id: string) {
    return this.usersService.approveUser(id);
  }

  // View all users (To find who is pending)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  findAll() {
    return this.usersService.findAll();
  }

  // Dev Only: Add Credits
  @UseGuards(AuthGuard('jwt'))
  @Post('add-credits')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add credits to current user (Dev/Testing)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          example: 10,
          description: 'Number of credits to add',
        },
      },
      required: ['amount'],
    },
  })
  @ApiResponse({ status: 200, description: 'Credits added successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  addCredits(@Request() req, @Body('amount') amount: number) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.usersService.addCredits(req.user.id, amount);
  }

  // Upload Resume
  @UseGuards(AuthGuard('jwt'))
  @Post('upload-resume')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload resume for current user' })
  @ApiResponse({ status: 200, description: 'Resume uploaded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  uploadResume(@Request() req, @UploadedFile() file: Express.Multer.File) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.usersService.uploadResume(req.user.id, file);
  }
}
