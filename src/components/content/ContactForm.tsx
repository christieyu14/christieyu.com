"use client";

import * as Form from "@radix-ui/react-form";
import { useCallback, useState, type FormEvent } from "react";

const CONTACT_EMAIL = "christieyu@aya.yale.edu";

type FormStatus = "idle" | "submitting" | "sent";

interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

function buildMailto({ name, email, message }: ContactFormValues): string {
  const subject = encodeURIComponent(`Message from ${name}`);
  const body = encodeURIComponent(`${message}\n\n—\n${name}\n${email}`);
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

/**
 * Lightweight contact form (Figma 68:726).
 * Uses Radix Form primitives; opens a mailto to christieyu@aya.yale.edu.
 */
export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");

  const onSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const values: ContactFormValues = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    };

    if (!values.name || !values.email || !values.message) {
      return;
    }

    setStatus("submitting");

    window.setTimeout(() => {
      window.location.href = buildMailto(values);
      setStatus("sent");
    }, 450);
  }, []);

  return (
    <Form.Root className="contact-form" onSubmit={onSubmit}>
      <p className="contact-form__title">Contact me</p>

      <div className="contact-form__panel">
        {status !== "sent" ? (
          <>
            <Form.Field className="contact-form__field" name="name">
              <Form.Label className="contact-form__label">
                Your name*
              </Form.Label>
              <Form.Control asChild>
                <input
                  className="contact-form__input"
                  type="text"
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Enter your name"
                  disabled={status === "submitting"}
                />
              </Form.Control>
              <Form.Message className="contact-form__message" match="valueMissing">
                Please enter your name.
              </Form.Message>
            </Form.Field>

            <Form.Field className="contact-form__field" name="email">
              <Form.Label className="contact-form__label">
                Email address*
              </Form.Label>
              <Form.Control asChild>
                <input
                  className="contact-form__input"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="Enter your email address"
                  disabled={status === "submitting"}
                />
              </Form.Control>
              <Form.Message className="contact-form__message" match="valueMissing">
                Please enter your email.
              </Form.Message>
              <Form.Message className="contact-form__message" match="typeMismatch">
                Please enter a valid email.
              </Form.Message>
            </Form.Field>

            <Form.Field className="contact-form__field" name="message">
              <Form.Label className="contact-form__label">Message*</Form.Label>
              <Form.Control asChild>
                <textarea
                  className="contact-form__textarea"
                  name="message"
                  required
                  rows={4}
                  placeholder="Enter your message"
                  disabled={status === "submitting"}
                />
              </Form.Control>
              <Form.Message className="contact-form__message" match="valueMissing">
                Please enter a message.
              </Form.Message>
            </Form.Field>

            <Form.Submit asChild>
              <button
                type="submit"
                className="contact-form__submit"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="contact-form__spinner"
                    src="/images/contact/spinner.svg"
                    alt=""
                    width={16}
                    height={16}
                  />
                ) : (
                  "Send me mail!"
                )}
              </button>
            </Form.Submit>
          </>
        ) : (
          <div className="contact-form__success">
            <p className="contact-form__sent">
              Sent
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="contact-form__check"
                src="/images/contact/check.svg"
                alt=""
                width={18}
                height={18}
              />
            </p>
            <div className="contact-form__reply">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="contact-form__portrait"
                src="/images/contact/portrait.png"
                alt=""
                width={48}
                height={52}
              />
              <p className="contact-form__reply-copy">
                I’m pretty sure I got your message! I’ll reply in a few business
                days. Thanks for reaching out.
              </p>
            </div>
          </div>
        )}
      </div>
    </Form.Root>
  );
}
