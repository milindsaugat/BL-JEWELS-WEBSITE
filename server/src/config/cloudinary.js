import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'uuhuaten',
  api_key: process.env.CLOUDINARY_API_KEY || '184549499494377',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'bul1IQVjNEmVhdBShIi1IfzkKJw',
  secure: true,
});

/**
 * Uploads a file buffer directly to Cloudinary while preserving the exact original file name.
 * @param {Buffer} buffer - File buffer from Multer
 * @param {string} originalname - Original file name with extension
 * @param {string} folder - Target Cloudinary folder (e.g., 'bl-jewels/banners', 'bl-jewels/products')
 * @returns {Promise<{ secure_url: string, public_id: string, original_filename: string, format: string, width: number, height: number }>}
 */
export const uploadBufferToCloudinary = (buffer, originalname, folder = 'bl-jewels') => {
  return new Promise((resolve, reject) => {
    // Preserve original filename without extension for public_id
    const parsed = path.parse(originalname);
    // Sanitize spaces/special characters to hyphens while keeping readable name
    const sanitizedBaseName = parsed.name
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '')
      .toLowerCase() || 'asset';

    const uploadOptions = {
      folder,
      public_id: sanitizedBaseName,
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      resource_type: 'image',
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          original_filename: originalname,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Deletes an image from Cloudinary by its public_id.
 * @param {string} publicId - Cloudinary public_id (e.g., 'bl-jewels/banners/festive-hero')
 * @returns {Promise<any>}
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return { result: 'noop', message: 'No publicId provided' };
  try {
    const res = await cloudinary.uploader.destroy(publicId);
    console.log(`✦ Cloudinary Asset Purged: [${publicId}] -> Status: ${res.result}`);
    return res;
  } catch (error) {
    console.warn(`⚠️ Cloudinary Purge Warning for [${publicId}]:`, error.message);
    return { result: 'error', error: error.message };
  }
};

/**
 * Helper to extract Cloudinary public_id from a full URL if not explicitly stored.
 * Example URL:
 * https://res.cloudinary.com/uuhuaten/image/upload/v1730367200/bl-jewels/banners/my-banner.jpg
 * returns: bl-jewels/banners/my-banner
 */
export const extractPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
    return null;
  }
  try {
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex === -1) return null;
    let pathAfterUpload = url.substring(uploadIndex + '/upload/'.length);
    // Remove version tag if present: v1234567890/
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
    // Remove file extension
    const lastDotIndex = pathAfterUpload.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      pathAfterUpload = pathAfterUpload.substring(0, lastDotIndex);
    }
    return pathAfterUpload;
  } catch {
    return null;
  }
};

export default cloudinary;

