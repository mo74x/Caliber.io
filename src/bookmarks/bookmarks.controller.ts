/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Bookmarks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post(':candidateId')
  @ApiOperation({ summary: 'Bookmark a candidate' })
  @ApiParam({
    name: 'candidateId',
    description: 'The ID of the candidate to bookmark',
  })
  @ApiResponse({
    status: 201,
    description: 'Candidate bookmarked successfully',
  })
  @ApiResponse({ status: 409, description: 'Already bookmarked' })
  add(@Request() req, @Param('candidateId') candidateId: string) {
    return this.bookmarksService.addBookmark(req.user.id, candidateId);
  }

  @Delete(':candidateId')
  @ApiOperation({ summary: 'Remove a bookmark' })
  @ApiParam({
    name: 'candidateId',
    description: 'The ID of the candidate to remove from bookmarks',
  })
  @ApiResponse({ status: 200, description: 'Bookmark removed successfully' })
  remove(@Request() req, @Param('candidateId') candidateId: string) {
    return this.bookmarksService.removeBookmark(req.user.id, candidateId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all my bookmarked candidates' })
  @ApiResponse({ status: 200, description: 'List of bookmarked candidates' })
  findAll(@Request() req) {
    return this.bookmarksService.getMyBookmarks(req.user.id);
  }
}
