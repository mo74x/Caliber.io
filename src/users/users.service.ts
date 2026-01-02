/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserRole, UserStatus } from './schemas/user.schema';
import { ResumeService } from '../resume/resume.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private resumeService: ResumeService,
    private cloudinaryService: CloudinaryService,
  ) {}

  // 1. Create a new User
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash the password (security)
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const initialStatus =
      createUserDto.role === UserRole.RECRUITER
        ? UserStatus.PENDING
        : UserStatus.ACTIVE;

    // Save to Database
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      status: initialStatus,
    });

    return createdUser.save();
  }

  // 2. Find a user by Email
  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  // 3. Find all users (Optional, for admin)
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // helper function for the Admin later
  async approveUser(id: string): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(
      id,
      { status: UserStatus.ACTIVE },
      { new: true },
    );
  }
  async findOneByResetToken(token: string): Promise<User | null> {
    return this.userModel.findOne({ resetPasswordToken: token });
  }

  // Dev Only: Add Credits
  async addCredits(userId: string, amount: number) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $inc: { credits: amount } }, // $inc means "increment"
      { new: true },
    );
  }

  async uploadResume(userId: string, file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadFile(file);
    await this.userModel.findByIdAndUpdate(userId, { resumeUrl: result.url });
    // NEW: Trigger the Background Job! 🚀
    await this.resumeService.queueResumeForParsing(userId, result.url);
    return result;
  }
}
