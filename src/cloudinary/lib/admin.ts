import { v2 as cloudinary } from "cloudinary";
import {
  getServerEnv,
  isCloudinaryAdminConfigured,
} from "@/lib/env";

export { isCloudinaryAdminConfigured };

/**
 * Configures and returns the Cloudinary Admin/Upload SDK (server-only).
 * Do not import this module from Client Components.
 */
export function getCloudinaryAdmin() {
  if (!isCloudinaryAdminConfigured()) {
    throw new Error(
      "Cloudinary admin is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  const server = getServerEnv();
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  cloudinary.config({
    cloud_name: cloudName,
    api_key: server.CLOUDINARY_API_KEY,
    api_secret: server.CLOUDINARY_API_SECRET,
    secure: true,
  });

  return cloudinary;
}

export function signCloudinaryParams(
  paramsToSign: Record<string, string | number | boolean>,
): string {
  const admin = getCloudinaryAdmin();
  return admin.utils.api_sign_request(
    paramsToSign,
    getServerEnv().CLOUDINARY_API_SECRET,
  );
}
