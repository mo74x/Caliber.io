import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bookmark } from './schemas/bookmark.schema';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectModel(Bookmark.name) private bookmarkModel: Model<Bookmark>,
  ) {}

  // 1. Add Bookmark
  async addBookmark(userId: string, candidateId: string) {
    // Check if already exists
    const existing = await this.bookmarkModel.findOne({
      recruiter: userId,
      candidate: candidateId,
    });
    if (existing) throw new ConflictException('Already bookmarked');

    const bookmark = new this.bookmarkModel({
      recruiter: userId,
      candidate: candidateId,
    });
    return bookmark.save();
  }

  // 2. Remove Bookmark
  async removeBookmark(userId: string, candidateId: string) {
    return this.bookmarkModel.findOneAndDelete({
      recruiter: userId,
      candidate: candidateId,
    });
  }

  // 3. Get All My Bookmarks
  async getMyBookmarks(userId: string) {
    return this.bookmarkModel
      .find({ recruiter: userId })
      .populate('candidate') // Load the actual candidate details
      .exec();
  }
}
