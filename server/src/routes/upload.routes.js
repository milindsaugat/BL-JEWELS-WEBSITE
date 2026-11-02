import express from 'express';
import { upload } from '../middleware/upload.js';
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromUrl,
} from '../config/cloudinary.js';

const router = express.Router();

// Middleware helper to accept either 'image' or 'file' field name
const handleSingleUpload = (req, res, next) => {
  const uploadSingle = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]);

  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    const uploadedFile = req.files?.image?.[0] || req.files?.file?.[0];
    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded. Pass image in field "image" or "file".',
      });
    }
    req.uploadedFile = uploadedFile;
    next();
  });
};

/**
 * @route   POST /api/v1/upload/single
 * @desc    Upload single image to Cloudinary preserving original filename
 */
router.post('/single', handleSingleUpload, async (req, res) => {
  try {
    const file = req.uploadedFile;
    const folder = req.body.folder || 'bl-jewels/uploads';

    const result = await uploadBufferToCloudinary(
      file.buffer,
      file.originalname,
      folder
    );

    res.status(200).json({
      success: true,
      message: 'Image successfully uploaded to Cloudinary',
      url: result.secure_url,
      publicId: result.public_id,
      originalName: result.original_filename,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Cloudinary upload failed: ${error.message}`,
    });
  }
});

/**
 * @route   POST /api/v1/upload/multiple
 * @desc    Upload multiple images for product galleries
 */
router.post('/multiple', upload.array('images', 8), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided in field "images".',
      });
    }

    const folder = req.body.folder || 'bl-jewels/products';
    const uploadPromises = req.files.map((file) =>
      uploadBufferToCloudinary(file.buffer, file.originalname, folder)
    );

    const results = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      count: results.length,
      images: results.map((r) => ({
        url: r.secure_url,
        publicId: r.public_id,
        originalName: r.original_filename,
        format: r.format,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Cloudinary batch upload failed: ${error.message}`,
    });
  }
});

/**
 * @route   DELETE /api/v1/upload/asset
 * @desc    Purge an image asset from Cloudinary by publicId or URL
 */
router.delete('/asset', async (req, res) => {
  try {
    let publicId = req.body.publicId || req.query.publicId;
    const url = req.body.url || req.query.url;

    if (!publicId && url) {
      publicId = extractPublicIdFromUrl(url);
    }

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide publicId or Cloudinary image URL to delete.',
      });
    }

    const deletionResult = await deleteFromCloudinary(publicId);

    res.status(200).json({
      success: true,
      message: `Asset ${publicId} deletion processed`,
      result: deletionResult,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Asset deletion failed: ${error.message}`,
    });
  }
});

export default router;

