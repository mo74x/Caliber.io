import { Controller, Post, Body } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Resume')
@Controller('resume')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post('test-parse')
  @ApiOperation({ summary: 'Queue a resume for parsing (Dev/Testing)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        url: {
          type: 'string',
          example: 'https://res.cloudinary.com/demo/resume.pdf',
        },
      },
      required: ['userId', 'url'],
    },
  })
  @ApiResponse({ status: 201, description: 'Resume queued for parsing' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async testParse(@Body() body: { userId: string; url: string }) {
    return this.resumeService.queueResumeForParsing(body.userId, body.url);
  }
}
