import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

// ─────────────────────────────────────────────────────────────────
// Cloudinary Configuration
// Supports both:
//   Option A (recommended): Set CLOUDINARY_URL=cloudinary://key:secret@cloud_name
//   Option B (individual):  Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
// ─────────────────────────────────────────────────────────────────
if (process.env.CLOUDINARY_URL) {
  // When CLOUDINARY_URL is set, the SDK reads it automatically.
  // We still call config() with secure:true to force HTTPS.
  cloudinary.config({ secure: true });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Returns true if Cloudinary is properly configured
 */
export const isCloudinaryConfigured = () => {
  const cfg = cloudinary.config();
  return Boolean(
    process.env.CLOUDINARY_URL ||
    (cfg.cloud_name && cfg.api_key && cfg.api_secret &&
     cfg.api_secret !== "YOUR_API_SECRET_HERE")
  );
};

// ─────────────────────────────────────────────────────────────────
// Multer – in-memory storage only (ZERO disk writes)
// Safe for Vercel / AWS Lambda read-only filesystems
// ─────────────────────────────────────────────────────────────────
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter,
});

/**
 * Wraps a multer middleware and returns clean JSON errors
 */
export const handleUpload = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File too large. Max 5 MB allowed." });
      }
      return res.status(400).json({ message: err.message || "File upload failed." });
    }
    next();
  });
};

/**
 * Uploads a Buffer to Cloudinary via upload_stream.
 * Falls back to a base64 Data URI in local dev when credentials are absent.
 *
 * @param {Buffer} fileBuffer
 * @param {{ folder?: string, filename?: string, mimetype?: string }} options
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
            "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, " +
            "and CLOUDINARY_API_SECRET (or CLOUDINARY_URL) to your Vercel Environment Variables."
          )
        );
      }

      // Local dev fallback: base64 Data URI so the server never crashes without credentials
      console.warn(
        "[Cloudinary] Credentials not set — using base64 Data URI fallback for local dev."
      );
      const mime = options.mimetype || "image/jpeg";
      const dataUri = `data:${mime};base64,${fileBuffer.toString("base64")}`;
      return resolve({ secure_url: dataUri, url: dataUri, public_id: `local_${Date.now()}` });
    }

    const folder = options.folder || "uploads";
    const safeName = options.filename
      ? options.filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_")
      : "file";
    const publicId = `${folder}/${Date.now()}_${safeName}`;

    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: "auto" },
      (error, result) => {
        if (error) {
          console.error("[Cloudinary Upload Error]:", error.message);
          return reject(new Error(error.message || "Cloudinary upload failed."));
        }
        console.log("[Cloudinary] Uploaded:", result.secure_url);
        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
};

/**
 * Extracts public_id from a Cloudinary URL
 */
export const extractPublicId = (url) => {
  if (!url || typeof url !== "string") return null;
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

/**
 * Safely deletes an image from Cloudinary – never throws
 */
export const deleteFromCloudinary = async (imageUrlOrPublicId) => {
  if (!imageUrlOrPublicId || !isCloudinaryConfigured()) return;
  try {
    const publicId = imageUrlOrPublicId.includes("cloudinary.com")
      ? extractPublicId(imageUrlOrPublicId)
      : imageUrlOrPublicId;
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
      console.log("[Cloudinary] Deleted:", publicId);
    }
  } catch (err) {
    console.warn("[Cloudinary Cleanup Warning]:", err.message);
  }
};

export default cloudinary;
