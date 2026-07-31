import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getServerEnv, isRevalidateConfigured } from "@/lib/env";
import {
  getRevalidationPaths,
  isValidRevalidateSecret,
  parseRevalidatePayload,
} from "@/lib/revalidate-paths";

function getProvidedSecret(request: Request): string | null {
  const headerSecret = request.headers.get("x-sanity-revalidate-secret");
  if (headerSecret) {
    return headerSecret;
  }

  const url = new URL(request.url);
  return url.searchParams.get("secret");
}

export async function POST(request: Request) {
  if (!isRevalidateConfigured()) {
    return NextResponse.json(
      { message: "Revalidation secret is not configured." },
      { status: 503 },
    );
  }

  const providedSecret = getProvidedSecret(request);
  const expectedSecret = getServerEnv().SANITY_REVALIDATE_SECRET;

  if (!isValidRevalidateSecret(providedSecret, expectedSecret)) {
    return NextResponse.json({ message: "Invalid secret." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseRevalidatePayload(body);
  if (!parsed) {
    return NextResponse.json(
      { message: "Unsupported or missing document type." },
      { status: 400 },
    );
  }

  const paths = getRevalidationPaths(parsed.documentType, parsed.slug);
  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, paths });
}
