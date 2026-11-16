import multer from 'multer';

// Use in-memory buffer storage so files are streamed directly to Cloudinary without writing temporary local disk files
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'image/avif',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-matroska',
    'video/avi',
  ];

  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Only images (JPEG, PNG, WEBP) and videos (MP4, WEBM, MOV) are allowed.`), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max limit (supports clear phone unboxing videos)
  },
});

