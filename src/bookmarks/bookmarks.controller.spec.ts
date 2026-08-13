import { Test, TestingModule } from '@nestjs/testing';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';

const mockBookmarksService = {
  addBookmark: jest.fn(),
  removeBookmark: jest.fn(),
  getMyBookmarks: jest.fn(),
};

describe('BookmarksController', () => {
  let controller: BookmarksController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookmarksController],
      providers: [
        { provide: BookmarksService, useValue: mockBookmarksService },
      ],
    }).compile();

    controller = module.get<BookmarksController>(BookmarksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('add', () => {
    it('should bookmark a candidate for the requesting user', () => {
      const req = { user: { id: 'user_1' } };
      mockBookmarksService.addBookmark.mockReturnValue({ _id: 'bookmark_id' });

      const result = controller.add(req, 'candidate_1');

      expect(mockBookmarksService.addBookmark).toHaveBeenCalledWith(
        'user_1',
        'candidate_1',
      );
      expect(result).toEqual({ _id: 'bookmark_id' });
    });
  });

  describe('remove', () => {
    it('should remove the bookmark for the requesting user', () => {
      const req = { user: { id: 'user_1' } };
      mockBookmarksService.removeBookmark.mockReturnValue({
        _id: 'bookmark_id',
      });

      const result = controller.remove(req, 'candidate_1');

      expect(mockBookmarksService.removeBookmark).toHaveBeenCalledWith(
        'user_1',
        'candidate_1',
      );
      expect(result).toEqual({ _id: 'bookmark_id' });
    });
  });

  describe('findAll', () => {
    it('should return the requesting user bookmarks', () => {
      const req = { user: { id: 'user_1' } };
      mockBookmarksService.getMyBookmarks.mockReturnValue([{ _id: 'b1' }]);

      const result = controller.findAll(req);

      expect(mockBookmarksService.getMyBookmarks).toHaveBeenCalledWith(
        'user_1',
      );
      expect(result).toEqual([{ _id: 'b1' }]);
    });
  });
});
