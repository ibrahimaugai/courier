import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('cloudinary.cloudName'),
      api_key: this.configService.get<string>('cloudinary.apiKey'),
      api_secret: this.configService.get<string>('cloudinary.apiSecret'),
    });
  }

  /**
   * Upload a file buffer to Cloudinary
   * @param fileBuffer - File buffer
   * @param fileName - Original file name
   * @param folder - Optional folder path (defaults to configured folder)
   * @returns Promise with upload result containing secure_url
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    folder?: string,
  ): Promise<{ url: string; publicId: string; secureUrl: string }> {
    return new Promise((resolve, reject) => {
      const uploadFolder = folder || this.configService.get<string>('cloudinary.folder') || 'courier-documents';
      
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: uploadFolder,
          resource_type: 'auto', // Automatically detect file type
          allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              url: result.url,
              publicId: result.public_id,
              secureUrl: result.secure_url,
            });
          }
        },
      );

      // Convert buffer to stream
      const stream = Readable.from(fileBuffer);
      stream.pipe(uploadStream);
    });
  }

  /**
   * Upload multiple files
   * @param files - Array of file objects with buffer and filename
   * @param folder - Optional folder path
   * @returns Promise with array of upload results
   */
  async uploadMultipleFiles(
    files: Array<{ buffer: Buffer; filename: string }>,
    folder?: string,
  ): Promise<Array<{ url: string; publicId: string; secureUrl: string; filename: string }>> {
    const uploadPromises = files.map((file) =>
      this.uploadFile(file.buffer, file.filename, folder).then((result) => ({
        ...result,
        filename: file.filename,
      })),
    );

    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from Cloudinary
   * @param publicId - Public ID of the file to delete
   * @returns Promise with deletion result
   */
  async deleteFile(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }

  /**
   * Delete multiple files
   * @param publicIds - Array of public IDs to delete
   * @returns Promise with deletion results
   */
  async deleteMultipleFiles(publicIds: string[]): Promise<any> {
    return cloudinary.api.delete_resources(publicIds);
  }
}


