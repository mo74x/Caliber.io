/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Candidate } from './schemas/candidate.schema';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { SearchCandidateDto } from './dto/search-candidate.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MailService } from '../mail/mail.service';
import { User, UserStatus } from '../users/schemas/user.schema';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectModel(Candidate.name)
    private candidateModel: Model<Candidate>,
    private mailService: MailService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  // Create Profile
  async create(
    createCandidateDto: CreateCandidateDto,
    userId: string,
  ): Promise<Candidate> {
    // Check if profile already exists for this user
    const existing = await this.candidateModel.findOne({ user: userId });
    if (existing) {
      throw new BadRequestException(
        'Profile already exists. Use Update instead.',
      );
    }

    const newProfile = new this.candidateModel({
      ...createCandidateDto,
      user: userId,
      lastActiveAt: new Date(),
    });

    return newProfile.save();
  }

  // Get My Profile
  async findOne(userId: string): Promise<Candidate> {
    const profile = await this.candidateModel.findOne({ user: userId });
    if (!profile) {
      throw new BadRequestException('Profile not found');
    }
    return profile;
  }

  // Search Profiles
  async search(filters: SearchCandidateDto): Promise<Candidate[]> {
    const query: any = { isVisible: true };

    if (filters.skill) {
      query.skills = { $regex: filters.skill, $options: 'i' };
    }
    if (filters.jobTitle) {
      query.jobTitle = { $regex: filters.jobTitle, $options: 'i' };
    }
    if (filters.maxSalary) {
      query.minSalary = { $lte: filters.maxSalary };
    }

    // SELECT ONLY PUBLIC FIELDS
    // We explicitly exclude: fullName, phone, linkedinUrl, cvUrl
    return this.candidateModel
      .find(query)
      .select('jobTitle skills experienceYears minSalary noticePeriod')
      .exec();
  }
  // Run this every day at Midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    console.log('Running Freshness Check...');

    // 1. Calculate the date 90 days ago
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    // 2. Find profiles that are visible BUT haven't been active since cutoffDate
    const result = await this.candidateModel.updateMany(
      {
        isVisible: true,
        lastActiveAt: { $lt: cutoffDate }, // Less than (older than) 90 days
      },
      {
        $set: { isVisible: false }, // Hide them
      },
    );

    console.log(
      `Freshness Check Complete. Hidden ${result.modifiedCount} inactive profiles.`,
    );
  }

  // Return EVERYTHING (Public + Private)
  async unlock(candidateId: string, recruiterId: string): Promise<Candidate> {
    const recruiter = await this.userModel.findById(recruiterId);
    if (!recruiter) {
      throw new BadRequestException('Recruiter not found.');
    }
    if (recruiter.status !== UserStatus.ACTIVE) {
      throw new BadRequestException(
        'Your account is pending approval. Please contact Admin.',
      );
    }
    const candidate = await this.candidateModel
      .findById(candidateId)
      .populate('user', 'email'); // Get the email from the User table

    if (!candidate) {
      console.log('❌ Candidate not found');
      throw new BadRequestException('Candidate not found');
    }

    // 2. Extract Email safely
    const userObj = candidate.user as any;
    console.log('🔍 User Object found:', userObj);

    if (userObj && userObj.email) {
      console.log(`📧 Attempting to send email to: ${userObj.email}`);

      try {
        // We put 'await' here so we can catch errors if sending fails
        await this.mailService.sendUnlockNotification(
          userObj.email,
          candidate.fullName,
        );
        console.log('✅ Email sent successfully!');
      } catch (error) {
        console.error('❌ Email failed to send:', error);
      }
    } else {
      console.log('⚠️ No email found for this user!');
    }

    return candidate;
  }

  async updateCvUrl(userId: string, url: string): Promise<Candidate> {
    const profile = await this.candidateModel
      .findOneAndUpdate(
        { user: userId },
        { cvUrl: url },
        { new: true }, // Return the updated document
      )
      .exec();
    if (!profile) {
      throw new BadRequestException('Profile not found');
    }
    return profile;
  }
}
