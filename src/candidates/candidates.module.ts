import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { Candidate, CandidateSchema } from './schemas/candidate.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
    ]),
    CloudinaryModule,
    MailModule,
  ],
  controllers: [CandidatesController],
  providers: [CandidatesService],
  exports: [CandidatesService],
})
export class CandidatesModule {}
