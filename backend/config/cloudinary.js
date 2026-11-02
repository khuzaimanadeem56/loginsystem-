import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Checks if Cloudinary credentials are provided in the environment
 */
export const isCloudinaryConfigured = () => {
  return Boolean(
    (process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET) ||
    process.env.CLOUDINARY_URL
  );
};

// Multer in-memory storage configuration:
// ZERO disk writes, safe for read-only serverless filesystems (e.g. AWS Lambda / Vercel /var/task)
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowedMime = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "image/jfif",
  ];

  if (allowedMime.includes(file.mimetype) || (file.mimetype && file.mimetype.startsWith("image/"))) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only image files (JPEG, PNG, WEBP, GIF, SVG) are permitted."
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter,
});

/**
 * Multer error handling wrapper to return clean JSON error messages
 */
export const handleUpload = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "File is too large. Maximum allowed size is 5MB.",
        });
      }
      return res.status(400).json({
        message: err.message || "File upload validation failed.",
      });
    }
    next();
  });
};

/**
 * Uploads an in-memory file buffer directly to Cloudinary via upload_stream
 * @param {Buffer} fileBuffer - In-memory file buffer from req.file.buffer
 * @param {Object} options - { folder, filename, mimetype }
 * @returns {Promise<{ secure_url: string, url: string, public_id: string }>}
 */
export const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
      return reject(new Error("No valid file buffer provided for upload."));
    }

    if (!isCloudinaryConfigured()) {
      if (process.env.NODE_ENV === "production") {
        return reject(
          new Error(
            "Cloudinary storage is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to Vercel Environment Variables."
          )
        );
      }

      // Local development fallback: base64 Data URI so dev work without credentials does not crash
      console.warn(
        "[Cloudinary Notice] Cloudinary credentials not configured locally. Using in-memory base64 Data URI fallback."
      );
      const mime = options.mimetype || "image/jpeg";
      const dataUri = `data:${mime};base64,${fileBuffer.toString("base64")}`;
      return resolve({
        secure_url: dataUri,
        url: dataUri,
        public_id: `local_${Date.now()}`,
      });
    }

    const folder = options.folder || "uploads";
    const cleanOriginalName = options.filename
      ? options.filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_")
      : "file";
    const publicId = `${folder}/${Date.now()}_${cleanOriginalName}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("[Cloudinary Upload Error]:", error);
          return reject(
            new Error(error.message || "Cloudinary image upload failed.")
          );
        }
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Extracts Cloudinary public_id from a URL
 */
export const extractPublicId = (url) => {
  if (!url || typeof url !== "string") return null;
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

/**
 * Safely removes an image from Cloudinary without throwing errors
 */
export const deleteFromCloudinary = async (imageUrlOrPublicId) => {
  if (!imageUrlOrPublicId || !isCloudinaryConfigured()) return;
  try {
    const publicId = imageUrlOrPublicId.includes("cloudinary.com")
      ? extractPublicId(imageUrlOrPublicId)
      : imageUrlOrPublicId;
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (err) {
    console.warn("[Cloudinary Cleanup Warning]:", err.message);
  }
};

export default cloudinary;

