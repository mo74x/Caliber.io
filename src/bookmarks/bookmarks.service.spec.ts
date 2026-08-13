/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { BookmarksService } from './bookmarks.service';
import { Bookmark } from './schemas/bookmark.schema';

const mockSave = jest.fn();

function MockBookmarkModel(data: any) {
  return {
    ...data,
    _id: 'bookmark_id',
    save: mockSave.mockResolvedValue({ ...data, _id: 'bookmark_id' }),
  };
}

MockBookmarkModel.findOne = jest.fn();
MockBookmarkModel.findOneAndDelete = jest.fn();
MockBookmarkModel.find = jest.fn();

describe('BookmarksService', () => {
  let service: BookmarksService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookmarksService,
        {
          provide: getModelToken(Bookmark.name),
          useValue: MockBookmarkModel,
        },
      ],
    }).compile();

    service = module.get<BookmarksService>(BookmarksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addBookmark', () => {
    it('should save a bookmark when none exists', async () => {
      MockBookmarkModel.findOne.mockResolvedValue(null);

      const result = await service.addBookmark('user_1', 'candidate_1');

      expect(MockBookmarkModel.findOne).toHaveBeenCalledWith({
        recruiter: 'user_1',
        candidate: 'candidate_1',
      });
      expect(result).toHaveProperty('_id');
      expect(result.recruiter).toEqual('user_1');
      expect(result.candidate).toEqual('candidate_1');
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw ConflictException when already bookmarked', async () => {
      MockBookmarkModel.findOne.mockResolvedValue({ _id: 'existing' });

      await expect(
        service.addBookmark('user_1', 'candidate_1'),
      ).rejects.toThrow(ConflictException);
      expect(mockSave).not.toHaveBeenCalled();
    });
  });

  describe('removeBookmark', () => {
    it('should delete the bookmark for the recruiter/candidate pair', async () => {
      const deleted = { _id: 'bookmark_id' };
      MockBookmarkModel.findOneAndDelete.mockResolvedValue(deleted);

      const result = await service.removeBookmark('user_1', 'candidate_1');

      expect(MockBookmarkModel.findOneAndDelete).toHaveBeenCalledWith({
        recruiter: 'user_1',
        candidate: 'candidate_1',
      });
      expect(result).toEqual(deleted);
    });
  });

  describe('getMyBookmarks', () => {
    it('should find bookmarks for the recruiter and populate candidate', async () => {
      const exec = jest.fn().mockResolvedValue([{ _id: 'bookmark_id' }]);
      MockBookmarkModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({ exec }),
      });

      const result = await service.getMyBookmarks('user_1');

      expect(MockBookmarkModel.find).toHaveBeenCalledWith({
        recruiter: 'user_1',
      });
      expect(result).toEqual([{ _id: 'bookmark_id' }]);
      expect(exec).toHaveBeenCalled();
    });
  });
});
