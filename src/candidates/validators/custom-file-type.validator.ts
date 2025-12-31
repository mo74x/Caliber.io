import { FileValidator } from '@nestjs/common';

export class CustomFileTypeValidator extends FileValidator {
  private allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
  ];

  constructor(options: { allowedMimeTypes?: string[] }) {
    super(options);
    if (options.allowedMimeTypes) {
      this.allowedMimeTypes = options.allowedMimeTypes;
    }
  }

  isValid(file: Express.Multer.File): boolean {
    return this.allowedMimeTypes.includes(file.mimetype);
  }

  buildErrorMessage(): string {
    return `File type must be one of: ${this.allowedMimeTypes.join(', ')}`;
  }
}
