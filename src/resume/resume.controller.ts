import { Controller, Post, Body } from '@nestjs/common';
import { ResumeService } from './resume.service';

@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post('test-parse')
  async testParse(@Body() body: { userId: string; url: string }) {
    return this.resumeService.queueResumeForParsing(body.userId, body.url);
  }
}
