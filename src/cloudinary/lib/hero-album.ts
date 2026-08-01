import { unstable_cache } from "next/cache";
import {
  getCloudinaryAdmin,
  isCloudinaryAdminConfigured,
} from "@/cloudinary/lib/admin";
import { buildCloudinaryUrl } from "@/cloudinary/lib/url";
import {
  HERO_ALBUM_FOLDER,
  HERO_DELIVERY_WIDTH,
  type HeroAlbumAsset,
} from "@/cloudinary/lib/hero-album-shared";

export {
  HERO_ALBUM_FOLDER,
  HERO_ALBUM_PATH,
  HERO_DELIVERY_WIDTH,
  selectHeroAsset,
  type HeroAlbumAsset,
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

const ONE_HOUR = 3600;
const ONE_DAY = 86400;

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

function mapResource(resource: CloudinarySearchResource): HeroAlbumAsset | null {
  const fields = readContextFields(resource.context);
  const caption = fields.caption?.trim();
  const date = fields.date?.trim();

  if (!caption || !date || !resource.public_id) {
    return null;
  }

  return {
    publicId: resource.public_id,
    width: resource.width ?? HERO_DELIVERY_WIDTH,
    height: resource.height ?? Math.round(HERO_DELIVERY_WIDTH * (558.35 / 992.65)),
    caption,
    date,
  };
}

async function fetchHeroAlbumAssetsUncached(): Promise<HeroAlbumAsset[]> {
  const cloudinary = getCloudinaryAdmin();
  const assets: HeroAlbumAsset[] = [];
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
        assets.push(mapped);
      }
    }

    nextCursor = result.next_cursor;
  } while (nextCursor);

  return assets;
}

/**
 * Cached Admin Search for the hero folder.
 * Soft-revalidates after 1 hour; may keep serving the prior list for up to 24 hours
 * while a background refresh runs (stale-while-revalidate).
 */
const getCachedHeroAlbumAssets = unstable_cache(
  async () => {
    const assets = await fetchHeroAlbumAssetsUncached();
    return {
      assets,
      fetchedAt: Date.now(),
    };
  },
  ["cloudinary-hero-album-assets-v3"],
  {
    // Soft TTL: after 1h the next request revalidates in the background.
    revalidate: ONE_HOUR,
    tags: ["hero-album"],
  },
);

function isWithinStaleWindow(fetchedAt: number): boolean {
  return Date.now() - fetchedAt < ONE_DAY * 1000;
}

/** Build an optimized delivery URL for the homepage hero frame. */
export function buildHeroDeliveryUrl(publicId: string): string | undefined {
  return buildCloudinaryUrl({
    publicId,
    width: HERO_DELIVERY_WIDTH,
    quality: "auto",
    format: "auto",
    crop: "limit",
  });
}

/**
 * Hero album asset list from the Cloudinary `hero` folder.
 * Config checks stay outside the cache so a boot-time miss is not sticky.
 * Never call this from a Client Component — Admin credentials stay server-only.
 */
export async function getHeroAlbumAssets(): Promise<HeroAlbumAsset[]> {
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
    const cached = await getCachedHeroAlbumAssets();

    if (cached.assets.length === 0) {
      // Avoid a sticky empty cache from a transient miss.
      return await fetchHeroAlbumAssetsUncached();
    }

    if (!isWithinStaleWindow(cached.fetchedAt)) {
      // Past the 24h stale window: block for a fresh Admin list.
      return await fetchHeroAlbumAssetsUncached();
    }

    return cached.assets;
  } catch (error) {
    console.error("[hero-album] Failed to fetch Cloudinary hero folder:", error);
    try {
      return await fetchHeroAlbumAssetsUncached();
    } catch (retryError) {
      console.error("[hero-album] Retry also failed:", retryError);
      return [];
    }
  }
}

