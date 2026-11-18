import { z } from "zod";

/** Resend template alias for the contact notification (variables: SENDER_NAME, SENDER_EMAIL, MESSAGE). */
export const CONTACT_TEMPLATE_ID = "contact-form";

/** Resend caps each template variable value at 2,000 characters. */
export const CONTACT_MESSAGE_MAX = 2000;

export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  message: z.string().trim().min(1).max(CONTACT_MESSAGE_MAX),
  company: z.string().optional().default(""),
  submissionId: z.string().trim().min(8).max(64),
});

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;

export function isHoneypotFilled(submission: ContactSubmission): boolean {
  return submission.company.trim().length > 0;
}

export interface RateLimiter {
  /** Returns true when the key may proceed, recording the attempt. */
  take(key: string, now?: number): boolean;
}

/**
 * Fixed-window, in-memory limiter. Best effort only: serverless instances
 * do not share memory and cold starts reset the counts.
 */
export function createRateLimiter(limit: number, windowMs: number): RateLimiter {
  const hits = new Map<string, number[]>();
  return {
    take(key, now = Date.now()) {
      const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return false;
      }
      recent.push(now);
      hits.set(key, recent);
      return true;
    },
  };
}

export interface SendResult {
  data: { id: string } | null;
  error: { message: string; statusCode: number | null } | null;
}

export interface ContactEmailPayload {
  from: string;
  to: string;
  subject: string;
  replyTo: string;
  template: { id: string; variables: Record<string, string> };
}

export type ContactEmailSender = (
  payload: ContactEmailPayload,
  options: { idempotencyKey: string },
) => Promise<SendResult>;

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Template variables use triple braces, so Resend inserts them unescaped. */
export function toTemplateValue(value: string): string {
  const escaped = value.replace(/[&<>"']/g, (char) => HTML_ENTITIES[char] ?? char);
  if (escaped.length <= CONTACT_MESSAGE_MAX) {
    return escaped;
  }
  return `${escaped.slice(0, CONTACT_MESSAGE_MAX - 1).replace(/&[^;]*$/, "")}…`;
}

export function buildContactEmail(
  submission: ContactSubmission,
  config: { from: string; to: string },
): ContactEmailPayload {
  return {
    from: config.from,
    to: config.to,
    subject: `New message from ${submission.name}`,
    replyTo: submission.email,
    template: {
      id: CONTACT_TEMPLATE_ID,
      variables: {
        SENDER_NAME: toTemplateValue(submission.name),
        SENDER_EMAIL: toTemplateValue(submission.email),
        MESSAGE: toTemplateValue(submission.message),
      },
    },
  };
}

function isRetryable(error: SendResult["error"]): boolean {
  if (!error) {
    return false;
  }
  const status = error.statusCode;
  return status === null || status === 429 || status >= 500;
}

/** Sends once, retrying network errors, 429s and 5xx with exponential backoff. */
export async function sendWithRetry(
  send: ContactEmailSender,
  payload: ContactEmailPayload,
  idempotencyKey: string,
  { attempts = 3, baseDelayMs = 400 }: { attempts?: number; baseDelayMs?: number } = {},
): Promise<SendResult> {
  let result: SendResult = {
    data: null,
    error: { message: "Not sent", statusCode: null },
  };
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      result = await send(payload, { idempotencyKey });
    } catch (cause) {
      result = {
        data: null,
        error: {
          message: cause instanceof Error ? cause.message : "Network error",
          statusCode: null,
        },
      };
    }
    if (!isRetryable(result.error) || attempt === attempts - 1) {
      return result;
    }
    await new Promise((resolve) => setTimeout(resolve, baseDelayMs * 2 ** attempt));
  }
  return result;
}
