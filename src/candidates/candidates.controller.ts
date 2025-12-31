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

@Controller('candidates')
export class CandidatesController {
  constructor(
    private readonly candidatesService: CandidatesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(AuthGuard('jwt')) //locks the endpoint!
  @Post()
  create(@Body() createCandidateDto: CreateCandidateDto, @Request() req) {
    // req.user comes from the JWT Token we generated earlier
    return this.candidatesService.create(createCandidateDto, req.user.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  findMyProfile(@Request() req) {
    return this.candidatesService.findOne(req.user.id);
  }
  // Search profiles
  @Get('search')
  async searchCandidates(@Query() searchDto: SearchCandidateDto) {
    return this.candidatesService.search(searchDto);
  }
  //dev-test-for-cron
  @Post('test-cron')
  triggerCron() {
    return this.candidatesService.handleCron();
  }

  // GET /candidates/unlock/:id
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/unlock')
  async unlockCandidate(@Param('id') id: string) {
    return this.candidatesService.unlock(id);
  }

  // POST /candidates/upload-cv
  @UseGuards(AuthGuard('jwt'))
  @Post('upload-cv')
  @UseInterceptors(FileInterceptor('file'))
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
