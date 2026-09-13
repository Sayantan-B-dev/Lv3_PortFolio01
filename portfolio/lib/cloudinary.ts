/* Cloudinary media handling (single responsibility: blog images).
   - Every upload lands in the dedicated `portfolio-blog/` folder, nothing
     scattered across the media library.
   - The returned public_id is stored on the post so deletion/replacement can
     destroy the exact asset. No orphans. */

import { v2 as cloudinary } from "cloudinary";

export const BLOG_IMAGE_FOLDER = "portfolio-blog";

let configured = false;

function ensureConfigured(): void {
  if (configured) return;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_KEY;
  const apiSecret = process.env.CLOUDINARY_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not configured.");
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  configured = true;
}

export interface UploadedImage {
  url: string;
  publicId: string;
}

export function uploadBlogImage(buffer: Buffer, filename: string): Promise<UploadedImage> {
  ensureConfigured();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: BLOG_IMAGE_FOLDER,
        resource_type: "image",
        unique_filename: true,
        overwrite: false,
        filename_override: filename.replace(/[^\w.-]+/g, "_").slice(0, 80),
      },
      (error, result) => {
        if (error || !result?.secure_url || !result?.public_id) {
          reject(error ?? new Error("Image upload failed."));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function destroyBlogImage(publicId: string): Promise<void> {
  ensureConfigured();
  if (!publicId.startsWith(`${BLOG_IMAGE_FOLDER}/`)) {
    throw new Error("Refusing to delete an asset outside the blog folder.");
  }
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}
