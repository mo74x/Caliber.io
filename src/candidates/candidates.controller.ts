/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

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
}
