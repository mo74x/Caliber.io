/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { AuthGuard } from '@nestjs/passport';
import { Query } from '@nestjs/common';
import { SearchCandidateDto } from './dto/search-candidate.dto';
import {
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CustomFileTypeValidator } from './validators/custom-file-type.validator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Candidates')
@Controller('candidates')
@ApiBearerAuth()
export class CandidatesController {
  constructor(
    private readonly candidatesService: CandidatesService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @UseGuards(AuthGuard('jwt')) //locks the endpoint!
  @Post()
  @ApiOperation({ summary: 'Create a new candidate profile' })
  @ApiResponse({ status: 201, description: 'Candidate profile created' })
  create(@Body() createCandidateDto: CreateCandidateDto, @Request() req) {
    // req.user comes from the JWT Token we generated earlier
    return this.candidatesService.create(createCandidateDto, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @ApiOperation({ summary: 'Find my candidate profile' })
  @ApiResponse({ status: 200, description: 'Candidate profile found' })
  findMyProfile(@Request() req) {
    return this.candidatesService.findOne(req.user.id);
  }
  // Search profiles
  @Get('search')
  @ApiOperation({ summary: 'Search candidates' })
  @ApiResponse({ status: 200, description: 'Candidates found' })
  async searchCandidates(@Query() searchDto: SearchCandidateDto) {
    return this.candidatesService.search(searchDto);
  }
  //dev-test-for-cron
  @Post('test-cron')
  @ApiOperation({ summary: 'Trigger cron job manually (Dev/Testing)' })
  @ApiResponse({ status: 200, description: 'Cron job triggered' })
  triggerCron() {
    return this.candidatesService.handleCron();
  }

  // GET /candidates/unlock/:id
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/unlock')
  @ApiOperation({ summary: 'Unlock a candidate profile' })
  @ApiResponse({ status: 200, description: 'Candidate profile unlocked' })
  async unlockCandidate(@Param('id') id: string, @Request() req) {
    // req.user contains the logged in user's ID
    return this.candidatesService.unlock(id, req.user.id); // Pass the Recruiter's ID
  }
  // Get One Profile
  @UseGuards(AuthGuard('jwt')) // Ensure they are logged in so we can track them
  @Get(':id')
  @ApiOperation({ summary: 'Get a candidate profile by ID' })
  @ApiParam({ name: 'id', description: 'Candidate ID' })
  @ApiResponse({ status: 200, description: 'Candidate profile found' })
  @ApiResponse({ status: 404, description: 'Candidate not found' })
  findOne(@Param('id') id: string, @Request() req) {
    // Pass the Candidate ID AND the User ID
    return this.candidatesService.findOne(id, req.user.id);
  }

  // POST /candidates/upload-cv
  @UseGuards(AuthGuard('jwt'))
  @Post('upload-cv')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a CV' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CV file (PDF, JPG, PNG, GIF - max 5MB)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'CV uploaded successfully' })
  async uploadCv(
    @Request() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
          new CustomFileTypeValidator({
            allowedMimeTypes: [
              'image/jpeg',
              'image/jpg',
              'image/png',
              'image/gif',
              'application/pdf',
            ],
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.cloudinaryService.uploadFile(file);
    return this.candidatesService.updateCvUrl(req.user.id, result.secure_url);
  }
}
