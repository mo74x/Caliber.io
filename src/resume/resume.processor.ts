/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';
import axios from 'axios';

@Processor('cv-processing')
export class ResumeProcessor extends WorkerHost {
  private readonly logger = new Logger(ResumeProcessor.name);

  // A simple list of skills to look for (in a real app, this would be a huge database)
  private readonly SKILL_KEYWORDS = [
    'NestJS',
    'TypeScript',
    'JavaScript',
    'Node.js',
    'React',
    'Angular',
    'MongoDB',
    'PostgreSQL',
    'Docker',
    'AWS',
    'Python',
    'Java',
    'C++',
  ];

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`📄 Processing PDF for User: ${job.data.userId}`);
    const fileUrl = job.data.fileUrl;

    try {
      // 1. Download the file as a buffer
      const response = await axios.get(fileUrl, {
        responseType: 'arraybuffer',
      });
      const dataBuffer = Buffer.from(response.data);

      // 2. Extract Text using pdf-parse (v2.x API)
      const pdfParser = new PDFParse({ data: dataBuffer });
      const result = await pdfParser.getText();
      const text = result.text; // The raw text of the resume

      // 3. Simple AI: Scan text for keywords
      const foundSkills = this.SKILL_KEYWORDS.filter((skill) =>
        // specific regex to find whole words, case-insensitive
        new RegExp(`\\b${skill}\\b`, 'i').test(text),
      );

      this.logger.log(
        `✅ Success! Found ${foundSkills.length} skills: ${foundSkills.join(', ')}`,
      );

      // TODO: Save these skills to the User's profile in MongoDB

      return { success: true, skills: foundSkills };
    } catch (error) {
      this.logger.error(`❌ Failed to parse PDF: ${error.message}`);
      throw error;
    }
  }
}
