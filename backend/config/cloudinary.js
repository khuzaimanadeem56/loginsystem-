import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

/**
 * Parses and sanitizes Cloudinary credentials from process.env
 * Handles:
 *  - Individual variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *  - Unified URL: CLOUDINARY_URL=cloudinary://key:secret@cloud_name
 *  - Common copy-paste mistakes (spaces, accidental 'CLOUDINARY_URL=' in secret, masked asterisks '***')
 */
export const getCloudinaryCredentials = () => {
  let cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
  let apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
  let apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();
  let cloudinaryUrl = (process.env.CLOUDINARY_URL || "").trim();

  // If apiSecret accidentally has "CLOUDINARY_URL=..." prefixed
  if (apiSecret.startsWith("CLOUDINARY_URL=")) {
    cloudinaryUrl = apiSecret.replace(/^CLOUDINARY_URL=/, "").trim();
    apiSecret = "";
  } else if (apiSecret.startsWith("cloudinary://")) {
    cloudinaryUrl = apiSecret;
    apiSecret = "";
  }

  // Parse cloudinary://key:secret@cloud_name
  if (cloudinaryUrl && cloudinaryUrl.startsWith("cloudinary://")) {
    const match = cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (match) {
      apiKey = apiKey || match[1].trim();
      apiSecret = apiSecret || match[2].trim();
      cloudName = cloudName || match[3].trim();
    }
  }

  // Clean quotes and spaces
  cloudName = cloudName.replace(/['"]/g, "").trim();
  apiKey = apiKey.replace(/['"]/g, "").trim();
  apiSecret = apiSecret.replace(/['"]/g, "").trim();

  // Check if secret is masked with asterisks or a placeholder
  const isMaskedOrDummy =
    !apiSecret ||
    apiSecret.includes("*") ||
    apiSecret === "YOUR_API_SECRET_HERE" ||
    apiSecret.length < 5;

  const isValid = Boolean(cloudName && apiKey && apiSecret && !isMaskedOrDummy);

  return {
    cloudName,
    apiKey,
    apiSecret,
    isValid,
  };
};

/**
 * Checks if Cloudinary is configured with valid credentials
 */
export const isCloudinaryConfigured = () => {
  return getCloudinaryCredentials().isValid;
};

// Multer memory storage (ZERO filesystem writes, completely safe on Vercel /var/task)
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter,
});

/**
 * Multer error handling wrapper to return clean JSON errors
 */
export const handleUpload = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File is too large. Maximum size is 5MB." });
      }
      return res.status(400).json({ message: err.message || "File upload failed." });
    }
    next();
  });
};

/**
 * Uploads an in-memory buffer to Cloudinary.
 * If Cloudinary is not yet configured or fails (e.g. invalid signature, network timeout),
 * it gracefully falls back to a base64 Data URI so the request NEVER crashes with 500.
 */
export const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve) => {
    const mime = options.mimetype || "image/jpeg";
    const dataUri = `data:${mime};base64,${fileBuffer.toString("base64")}`;

    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
      return resolve({ secure_url: "", url: "", public_id: "" });
    }

    const creds = getCloudinaryCredentials();

    if (!creds.isValid) {
      console.warn(
        "[Cloudinary Notice] Cloudinary credentials missing or masked. Storing image as Base64 Data URI."
      );
      return resolve({
        secure_url: dataUri,
        url: dataUri,
        public_id: `datauri_${Date.now()}`,
      });
    }

    // Configure Cloudinary dynamically with validated credentials
    cloudinary.config({
      cloud_name: creds.cloudName,
      api_key: creds.apiKey,
      api_secret: creds.apiSecret,
      secure: true,
    });

    const folder = options.folder || "uploads";
    const safeName = options.filename
      ? options.filename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_")
      : "file";
    const publicId = `${folder}/${Date.now()}_${safeName}`;

    try {
      const stream = cloudinary.uploader.upload_stream(
        { folder, public_id: publicId, resource_type: "auto" },
        (error, result) => {
          if (error) {
            console.warn(
              `[Cloudinary Upload Warning]: ${error.message}. Gracefully falling back to Data URI.`
            );
            return resolve({
              secure_url: dataUri,
              url: dataUri,
              public_id: `datauri_${Date.now()}`,
            });
          }
          console.log("[Cloudinary] Uploaded successfully:", result.secure_url);
          resolve(result);
        }
      );

      stream.end(fileBuffer);
    } catch (streamErr) {
      console.warn(
        `[Cloudinary Stream Exception]: ${streamErr.message}. Gracefully falling back to Data URI.`
      );
      resolve({
        secure_url: dataUri,
        url: dataUri,
        public_id: `datauri_${Date.now()}`,
      });
    }
  });
};

/**
 * Extracts public_id from a Cloudinary URL
 */
export const extractPublicId = (url) => {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("data:")) return null;
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

/**
 * Safely deletes an image from Cloudinary without throwing errors
 */
export const deleteFromCloudinary = async (imageUrlOrPublicId) => {
  if (!imageUrlOrPublicId) return;
  if (typeof imageUrlOrPublicId === "string" && imageUrlOrPublicId.startsWith("data:")) return;

  const creds = getCloudinaryCredentials();
  if (!creds.isValid) return;

  try {
    cloudinary.config({
      cloud_name: creds.cloudName,
      api_key: creds.apiKey,
      api_secret: creds.apiSecret,
      secure: true,
    });

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
