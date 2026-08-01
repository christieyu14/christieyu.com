import { NextResponse } from "next/server";
import {
  isCloudinaryAdminConfigured,
  signCloudinaryParams,
} from "@/cloudinary/lib/admin";

export async function POST(request: Request) {
  if (!isCloudinaryAdminConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary admin credentials are not configured." },
      { status: 503 },
    );
  }

  let body: { paramsToSign?: Record<string, string | number | boolean> };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.paramsToSign || typeof body.paramsToSign !== "object") {
    return NextResponse.json(
      { error: "Missing paramsToSign object." },
      { status: 400 },
    );
  }

  const signature = signCloudinaryParams(body.paramsToSign);

  return NextResponse.json({ signature });
}
