import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Candidate } from './schemas/candidate.schema';
import { CreateCandidateDto } from './dto/create-candidate.dto';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectModel(Candidate.name) private candidateModel: Model<Candidate>,
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
}
