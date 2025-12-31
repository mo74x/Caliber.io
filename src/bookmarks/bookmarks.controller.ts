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

@UseGuards(AuthGuard('jwt'))
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post(':candidateId')
  add(@Request() req, @Param('candidateId') candidateId: string) {
    return this.bookmarksService.addBookmark(req.user.id, candidateId);
  }

  @Delete(':candidateId')
  remove(@Request() req, @Param('candidateId') candidateId: string) {
    return this.bookmarksService.removeBookmark(req.user.id, candidateId);
  }

  @Get()
  findAll(@Request() req) {
    return this.bookmarksService.getMyBookmarks(req.user.id);
  }
}
