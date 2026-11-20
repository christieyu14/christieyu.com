"use client";

import * as Form from "@radix-ui/react-form";
import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { HazeText } from "@/components/effects/HazeText";
import { CONTACT_MESSAGE_MAX } from "@/lib/contact";

type FormStatus = "idle" | "submitting" | "sent" | "error";

const MESSAGE_MIN_HEIGHT = 92;
const MESSAGE_MIN_WIDTH = 280;
const KEYBOARD_STEP = 16;

function maxMessageHeight(): number {
  return Math.max(MESSAGE_MIN_HEIGHT, Math.round(window.innerHeight * 0.6));
}

function maxMessageWidth(): number {
  return Math.max(MESSAGE_MIN_WIDTH, Math.round(window.innerWidth * 0.7));
}

function clampHeight(height: number): number {
  return Math.min(Math.max(height, MESSAGE_MIN_HEIGHT), maxMessageHeight());
}

function clampWidth(width: number): number {
  return Math.min(Math.max(width, MESSAGE_MIN_WIDTH), maxMessageWidth());
}

function newSubmissionId(): string {
  return crypto.randomUUID();
}

/** Contact form — Figma 109:1136. Posts to /api/contact without leaving the page. */
export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [messageHeight, setMessageHeight] = useState(MESSAGE_MIN_HEIGHT);
  const [messageWidth, setMessageWidth] = useState<number | null>(null);
  const [nameValue, setNameValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [messageValue, setMessageValue] = useState("");
  const [focused, setFocused] = useState<"name" | "email" | "message" | null>(
    null,
  );
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);
  const messageWrapRef = useRef<HTMLDivElement | null>(null);
  const submissionIdRef = useRef<string | null>(null);

  const onSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    submissionIdRef.current ??= newSubmissionId();

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          message: String(data.get("message") ?? ""),
          company: String(data.get("company") ?? ""),
          submissionId: submissionIdRef.current,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setErrorMessage(result.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      form.reset();
      setNameValue("");
      setEmailValue("");
      setMessageValue("");
      submissionIdRef.current = null;
      setMessageHeight(MESSAGE_MIN_HEIGHT);
      setMessageWidth(null);
      setStatus("sent");
    } catch {
      setErrorMessage("Network error. Please try again.");
      setStatus("error");
    }
  }, []);

  function onHandlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const wrap = messageWrapRef.current;
    const startWidth = messageWidth ?? wrap?.getBoundingClientRect().width ?? MESSAGE_MIN_WIDTH;
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startWidth,
      startHeight: messageHeight,
    };
  }

  function onHandlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    // Top-right handle: drag right/up expands outward.
    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;
    setMessageWidth(clampWidth(dragRef.current.startWidth + deltaX));
    setMessageHeight(clampHeight(dragRef.current.startHeight - deltaY));
  }

  function onHandlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  }

  function onHandleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setMessageHeight((height) => clampHeight(height + KEYBOARD_STEP));
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setMessageHeight((height) => clampHeight(height - KEYBOARD_STEP));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setMessageWidth((width) =>
        clampWidth((width ?? messageWrapRef.current?.clientWidth ?? MESSAGE_MIN_WIDTH) + KEYBOARD_STEP),
      );
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      setMessageWidth((width) =>
        clampWidth((width ?? messageWrapRef.current?.clientWidth ?? MESSAGE_MIN_WIDTH) - KEYBOARD_STEP),
      );
    }
  }

  const busy = status === "submitting";
  const showNamePh = focused !== "name" && nameValue.trim() === "";
  const showEmailPh = focused !== "email" && emailValue.trim() === "";
  const showMessagePh = focused !== "message" && messageValue.trim() === "";

  const cardStyle = {
    ...(messageWidth
      ? ({
          ["--contact-card-width" as string]: `${messageWidth + 56}px`,
          ["--message-width" as string]: `${messageWidth}px`,
        } as CSSProperties)
      : null),
  } as CSSProperties;

  return (
    <Form.Root
      className="contact-card"
      style={cardStyle}
      onSubmit={(event) => {
        void onSubmit(event);
      }}
      onChange={() => {
        if (status === "sent" || status === "error") {
          setStatus("idle");
        }
      }}
    >
      <div className="contact-card__fields">
        <h1 className="visually-hidden">Contact</h1>
        <Form.Field className="contact-field contact-field--short" name="name">
          <Form.Label className="visually-hidden">Name</Form.Label>
          <div className="contact-field__shell">
            {showNamePh ? (
              <HazeText
                as="span"
                className="contact-field__placeholder type-md haze-text--inline"
              >
                Name
              </HazeText>
            ) : null}
            <Form.Control asChild>
              <input
                className="contact-field__control type-md"
                type="text"
                required
                maxLength={200}
                autoComplete="name"
                placeholder=""
                disabled={busy}
                value={nameValue}
                onChange={(event) => setNameValue(event.target.value)}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused(null)}
              />
            </Form.Control>
          </div>
          <Form.Message className="contact-field__error type-sm" match="valueMissing">
            Please enter your name.
          </Form.Message>
        </Form.Field>

        <Form.Field className="contact-field contact-field--short" name="email">
          <Form.Label className="visually-hidden">Email</Form.Label>
          <div className="contact-field__shell">
            {showEmailPh ? (
              <HazeText
                as="span"
                className="contact-field__placeholder type-md haze-text--inline"
              >
                Email
              </HazeText>
            ) : null}
            <Form.Control asChild>
              <input
                className="contact-field__control type-md"
                type="email"
                required
                maxLength={320}
                autoComplete="email"
                placeholder=""
                disabled={busy}
                value={emailValue}
                onChange={(event) => setEmailValue(event.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
              />
            </Form.Control>
          </div>
          <Form.Message className="contact-field__error type-sm" match="valueMissing">
            Please enter your email.
          </Form.Message>
          <Form.Message className="contact-field__error type-sm" match="typeMismatch">
            Please enter a valid email.
          </Form.Message>
        </Form.Field>

        <Form.Field className="contact-field contact-field--message" name="message">
          <Form.Label className="visually-hidden">Message</Form.Label>
          <div ref={messageWrapRef} className="contact-field__message-wrap">
            <div className="contact-field__shell contact-field__shell--textarea">
              {showMessagePh ? (
                <HazeText
                  as="span"
                  className="contact-field__placeholder type-md haze-text--inline"
                >
                  Message
                </HazeText>
              ) : null}
              <Form.Control asChild>
                <textarea
                  id="contact-message"
                  className="contact-field__control contact-field__textarea type-md"
                  required
                  maxLength={CONTACT_MESSAGE_MAX}
                  placeholder=""
                  disabled={busy}
                  style={{ height: messageHeight }}
                  value={messageValue}
                  onChange={(event) => setMessageValue(event.target.value)}
                  onFocus={() => setFocused("message")}
                  onBlur={() => setFocused(null)}
                />
              </Form.Control>
            </div>
            <div
              className="contact-field__resize"
              role="separator"
              aria-orientation="horizontal"
              aria-label="Resize message box"
              aria-controls="contact-message"
              aria-valuenow={messageHeight}
              aria-valuemin={MESSAGE_MIN_HEIGHT}
              tabIndex={0}
              onPointerDown={onHandlePointerDown}
              onPointerMove={onHandlePointerMove}
              onPointerUp={onHandlePointerUp}
              onPointerCancel={onHandlePointerUp}
              onKeyDown={onHandleKeyDown}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icons/resize.svg"
                alt=""
                width={16}
                height={16}
                draggable={false}
              />
            </div>
          </div>
          <Form.Message className="contact-field__error type-sm" match="valueMissing">
            Please enter a message.
          </Form.Message>
        </Form.Field>

        <div className="visually-hidden" aria-hidden="true">
          <label>
            Company
            <input type="text" name="company" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </div>

      <div className="contact-card__footer">
        <Form.Submit className="type-link" disabled={busy}>
          {busy ? "sending…" : "send"}
        </Form.Submit>
        <p className="contact-card__status type-sm" role="status" aria-live="polite">
          {status === "sent" ? "Sent. Thanks for reaching out!" : null}
          {status === "error" ? errorMessage : null}
        </p>
      </div>
    </Form.Root>
  );
}
