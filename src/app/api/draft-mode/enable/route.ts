import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { hasPreviewSecret } from "@/lib/env";
import { client } from "@/sanity/lib/client";
import {
  canUsePreview,
  getPreviewSecret,
  getSanityReadToken,
} from "@/sanity/lib/token";

function createUnavailableResponse() {
  return NextResponse.json(
    {
      message:
        "Draft mode is not configured. Set SANITY_API_READ_TOKEN (and optionally SANITY_PREVIEW_SECRET for manual preview URLs).",
    },
    { status: 503 },
  );
}

const draftModeHandlers = client
  ? defineEnableDraftMode({
      client: client.withConfig({ token: getSanityReadToken() }),
    })
  : null;

/**
 * Preview entry:
 * 1. Sanity Presentation / preview-url-secret → handled by defineEnableDraftMode
 * 2. Manual shared secret → GET /api/draft-mode/enable?secret=...&redirect=/path
 */
export async function GET(request: Request) {
  if (!canUsePreview() || !client) {
    return createUnavailableResponse();
  }

  const url = new URL(request.url);
  const providedSecret = url.searchParams.get("secret");

  if (providedSecret !== null) {
    if (!hasPreviewSecret()) {
      return createUnavailableResponse();
    }

    const expectedSecret = getPreviewSecret();
    if (!expectedSecret || providedSecret !== expectedSecret) {
      return NextResponse.json({ message: "Invalid secret." }, { status: 401 });
    }

    const draft = await draftMode();
    draft.enable();

    const redirectTo = url.searchParams.get("redirect") ?? "/";
    return NextResponse.redirect(new URL(redirectTo, url.origin));
  }

  if (!draftModeHandlers) {
    return createUnavailableResponse();
  }

  return draftModeHandlers.GET(request);
}
