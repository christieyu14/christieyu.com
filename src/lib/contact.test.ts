import { describe, expect, it, vi } from "vitest";
import {
  buildContactEmail,
  CONTACT_MESSAGE_MAX,
  CONTACT_TEMPLATE_ID,
  contactSubmissionSchema,
  createRateLimiter,
  isHoneypotFilled,
  sendWithRetry,
  toTemplateValue,
  type ContactEmailSender,
} from "@/lib/contact";

const valid = {
  name: "Ada",
  email: "ada@example.com",
  message: "Hello there",
  company: "",
  submissionId: "abc12345",
};

describe("contactSubmissionSchema", () => {
  it("accepts a valid submission and trims fields", () => {
    const parsed = contactSubmissionSchema.parse({ ...valid, name: "  Ada  " });
    expect(parsed.name).toBe("Ada");
  });

  it("rejects invalid emails, empty messages and oversized messages", () => {
    expect(contactSubmissionSchema.safeParse({ ...valid, email: "nope" }).success).toBe(
      false,
    );
    expect(
      contactSubmissionSchema.safeParse({ ...valid, message: "   " }).success,
    ).toBe(false);
    expect(
      contactSubmissionSchema.safeParse({ ...valid, message: "a".repeat(2001) })
        .success,
    ).toBe(false);
  });

  it("flags filled honeypots", () => {
    expect(isHoneypotFilled(contactSubmissionSchema.parse(valid))).toBe(false);
    expect(
      isHoneypotFilled(contactSubmissionSchema.parse({ ...valid, company: "x" })),
    ).toBe(true);
  });
});

describe("createRateLimiter", () => {
  it("blocks after the limit within the window and resets after it", () => {
    const limiter = createRateLimiter(2, 1000);
    expect(limiter.take("ip", 0)).toBe(true);
    expect(limiter.take("ip", 10)).toBe(true);
    expect(limiter.take("ip", 20)).toBe(false);
    expect(limiter.take("ip", 1500)).toBe(true);
  });
});

describe("buildContactEmail", () => {
  it("uses the template with the visitor as reply-to", () => {
    const payload = buildContactEmail(contactSubmissionSchema.parse(valid), {
      from: "christieyu.com <hello@christieyu.com>",
      to: "me@example.com",
    });
    expect(payload.replyTo).toBe("ada@example.com");
    expect(payload.template).toEqual({
      id: CONTACT_TEMPLATE_ID,
      variables: {
        SENDER_NAME: "Ada",
        SENDER_EMAIL: "ada@example.com",
        MESSAGE: "Hello there",
      },
    });
  });
});

describe("toTemplateValue", () => {
  it("escapes HTML", () => {
    expect(toTemplateValue(`<a href="x">Tom & 'Jerry'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;",
    );
  });

  it("stays within the template variable limit without splitting entities", () => {
    const value = toTemplateValue("&".repeat(CONTACT_MESSAGE_MAX));
    expect(value.length).toBeLessThanOrEqual(CONTACT_MESSAGE_MAX);
    expect(value.endsWith("&amp;…")).toBe(true);
  });
});

describe("sendWithRetry", () => {
  const payload = buildContactEmail(contactSubmissionSchema.parse(valid), {
    from: "a@b.c",
    to: "d@e.f",
  });

  it("retries 5xx responses and passes the idempotency key", async () => {
    const send = vi
      .fn<ContactEmailSender>()
      .mockResolvedValueOnce({
        data: null,
        error: { message: "boom", statusCode: 500 },
      })
      .mockResolvedValueOnce({ data: { id: "email_1" }, error: null });

    const result = await sendWithRetry(send, payload, "key-1", { baseDelayMs: 0 });

    expect(result.data?.id).toBe("email_1");
    expect(send).toHaveBeenCalledTimes(2);
    expect(send).toHaveBeenCalledWith(payload, { idempotencyKey: "key-1" });
  });

  it("does not retry other 4xx errors", async () => {
    const send = vi
      .fn<ContactEmailSender>()
      .mockResolvedValue({ data: null, error: { message: "bad", statusCode: 422 } });

    const result = await sendWithRetry(send, payload, "key-2", { baseDelayMs: 0 });

    expect(result.error?.statusCode).toBe(422);
    expect(send).toHaveBeenCalledTimes(1);
  });
});
