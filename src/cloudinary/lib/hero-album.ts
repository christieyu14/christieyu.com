import { unstable_cache } from "next/cache";
import { buildCloudinaryUrl } from "@/cloudinary/lib/url";
import {
  getCloudinaryAdmin,
  isCloudinaryAdminConfigured,
} from "@/cloudinary/lib/admin";
import {
  HERO_ALBUM_FOLDER,
  type HeroAlbumPhoto,
} from "@/cloudinary/lib/hero-album-shared";

export {
  HERO_ALBUM_FOLDER,
  HERO_ALBUM_PATH,
  selectHeroPhoto,
  type HeroAlbumPhoto,
} from "@/cloudinary/lib/hero-album-shared";

interface CloudinarySearchResource {
  public_id: string;
  width?: number;
  height?: number;
  context?:
    | {
        custom?: Record<string, string>;
        [key: string]: unknown;
      }
    | string;
}

function readContextFields(
  context: CloudinarySearchResource["context"],
): Record<string, string> {
  if (!context) {
    return {};
  }

  // Search API occasionally returns pipe-delimited context strings.
  if (typeof context === "string") {
    return Object.fromEntries(
      context
        .split("|")
        .map((pair) => pair.split("="))
        .filter((parts): parts is [string, string] => parts.length === 2 && Boolean(parts[0]))
        .map(([key, value]) => [key, value ?? ""]),
    );
  }

  const custom =
    context.custom && typeof context.custom === "object"
      ? (context.custom as Record<string, string>)
      : {};

  const flat = Object.fromEntries(
    Object.entries(context).filter(
      (entry): entry is [string, string] =>
        entry[0] !== "custom" && typeof entry[1] === "string",
    ),
  );

  return { ...flat, ...custom };
}

function mapResource(resource: CloudinarySearchResource): HeroAlbumPhoto | null {
  const fields = readContextFields(resource.context);
  const caption = fields.caption?.trim();
  const dateLabel = fields.date?.trim();

  if (!caption || !dateLabel) {
    return null;
  }

  const url = buildCloudinaryUrl({
    publicId: resource.public_id,
    width: 2400,
    quality: "auto",
    format: "auto",
    crop: "limit",
  });

  if (!url) {
    return null;
  }

  return {
    id: resource.public_id,
    publicId: resource.public_id,
    alt: fields.alt?.trim() || caption,
    caption,
    dateLabel,
    width: resource.width,
    height: resource.height,
    url,
  };
}

async function fetchHeroAlbumPhotosUncached(): Promise<HeroAlbumPhoto[]> {
  const cloudinary = getCloudinaryAdmin();
  const photos: HeroAlbumPhoto[] = [];
  let nextCursor: string | undefined;

  do {
    let query = cloudinary.search
      .expression(`folder:${HERO_ALBUM_FOLDER}`)
      .with_field("context")
      .sort_by("created_at", "desc")
      .max_results(500);

    if (nextCursor) {
      query = query.next_cursor(nextCursor);
    }

    const result = (await query.execute()) as {
      resources?: CloudinarySearchResource[];
      next_cursor?: string;
    };

    for (const resource of result.resources ?? []) {
      const mapped = mapResource(resource);
      if (mapped) {
        photos.push(mapped);
      }
    }

    nextCursor = result.next_cursor;
  } while (nextCursor);

  return photos;
}

const getCachedHeroAlbumPhotos = unstable_cache(
  fetchHeroAlbumPhotosUncached,
  ["cloudinary-hero-album-v2"],
  { revalidate: 3600 },
);

/**
 * Hero album photos from the Cloudinary `hero` folder.
 * Config checks stay outside the cache so a boot-time miss is not sticky.
 */
export async function getHeroAlbumPhotos(): Promise<HeroAlbumPhoto[]> {
  if (!isCloudinaryAdminConfigured()) {
    console.warn(
      "[hero-album] Cloudinary admin is not configured; returning no photos.",
    );
    return [];
  }

  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    console.warn(
      "[hero-album] NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is missing; cannot build URLs.",
    );
    return [];
  }

  try {
    const photos = await getCachedHeroAlbumPhotos();
    if (photos.length === 0) {
      // Avoid a sticky empty cache from a transient miss: fetch once uncached.
      return await fetchHeroAlbumPhotosUncached();
    }
    return photos;
  } catch (error) {
    console.error("[hero-album] Failed to fetch Cloudinary hero folder:", error);
    try {
      return await fetchHeroAlbumPhotosUncached();
    } catch (retryError) {
      console.error("[hero-album] Retry also failed:", retryError);
      return [];
    }
  }
}
