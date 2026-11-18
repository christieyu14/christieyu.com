import { Resend } from "resend";
import {
  buildContactEmail,
  contactSubmissionSchema,
  createRateLimiter,
  isHoneypotFilled,
  sendWithRetry,
  type ContactEmailSender,
} from "@/lib/contact";
import { getContactEmailConfig } from "@/lib/env";

const limiter = createRateLimiter(5, 10 * 60 * 1000);

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown"
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = contactSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Please check the form and try again." },
      { status: 400 },
    );
  }

  const submission = parsed.data;
  if (isHoneypotFilled(submission)) {
    return Response.json({ ok: true });
  }

  if (!limiter.take(clientIp(request))) {
    return Response.json(
      { error: "Too many messages. Please try again later." },
      { status: 429 },
    );
  }

  const config = getContactEmailConfig();
  if (!config) {
    console.error(
      "Contact form: RESEND_API_KEY / CONTACT_TO_EMAIL / CONTACT_FROM_EMAIL not set",
    );
    return Response.json({ error: "Email is not configured yet." }, { status: 503 });
  }

  const resend = new Resend(config.apiKey);
  const send: ContactEmailSender = (payload, options) =>
    resend.emails.send(payload, options);

  const { data, error } = await sendWithRetry(
    send,
    buildContactEmail(submission, config),
    `contact-form/${submission.submissionId}`,
  );

  if (error) {
    console.error("Contact form: Resend send failed", error);
    return Response.json(
      { error: "Something went wrong sending your message." },
      { status: 502 },
    );
  }

  console.info("Contact form: sent email", data?.id);
  return Response.json({ ok: true });
}
