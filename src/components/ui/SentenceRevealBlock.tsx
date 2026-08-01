"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface SentenceRevealBlockProps {
  paragraphs: readonly string[];
  className?: string;
  /** Gap between consecutive sentences across the whole block (ms). */
  staggerMs?: number;
}

type SentenceToken = {
  paragraphIndex: number;
  text: string;
  trailingSpace: boolean;
  globalIndex: number;
};

function splitSentences(paragraph: string): string[] {
  const parts = paragraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  if (!parts) {
    return [paragraph];
  }
  return parts.map((part) => part.trim()).filter(Boolean);
}

function buildTokens(paragraphs: readonly string[]): SentenceToken[] {
  const tokens: SentenceToken[] = [];
  let globalIndex = 0;

  paragraphs.forEach((paragraph, paragraphIndex) => {
    const sentences = splitSentences(paragraph);
    sentences.forEach((text, index) => {
      tokens.push({
        paragraphIndex,
        text,
        trailingSpace: index < sentences.length - 1,
        globalIndex,
      });
      globalIndex += 1;
    });
  });

  return tokens;
}

/**
 * Soft sentence-by-sentence entrance for one continuous copy block,
 * with a blinking caret at the live end until the sequence finishes.
 */
export function SentenceRevealBlock({
  paragraphs,
  className,
  staggerMs = 200,
}: SentenceRevealBlockProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [done, setDone] = useState(false);
  const tokens = useMemo(() => buildTokens(paragraphs), [paragraphs]);
  const total = tokens.length;

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(true);
      setRevealedCount(total);
      setDone(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [total]);

  useEffect(() => {
    if (!active || done) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealedCount(total);
      setDone(true);
      return;
    }

    if (revealedCount >= total) {
      const finish = window.setTimeout(() => setDone(true), 280);
      return () => window.clearTimeout(finish);
    }

    const delay = revealedCount === 0 ? 40 : staggerMs;
    const timer = window.setTimeout(() => {
      setRevealedCount((count) => Math.min(count + 1, total));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [active, done, revealedCount, staggerMs, total]);

  const cursorIndex = done || revealedCount === 0 ? -1 : revealedCount - 1;

  return (
    <div
      ref={ref}
      className={[
        "sentence-reveal",
        active ? "sentence-reveal--in" : null,
        done ? "sentence-reveal--done" : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {paragraphs.map((paragraph, paragraphIndex) => {
        const paragraphTokens = tokens.filter(
          (token) => token.paragraphIndex === paragraphIndex,
        );

        return (
          <p key={paragraph.slice(0, 32)}>
            {paragraphTokens.map((token) => {
              const visible = token.globalIndex < revealedCount;
              const showCursor = token.globalIndex === cursorIndex;

              return (
                <span key={`${token.paragraphIndex}-${token.globalIndex}`}>
                  <span
                    className={`sentence-reveal__sentence${
                      visible ? " is-visible" : ""
                    }`}
                  >
                    {token.text}
                    {token.trailingSpace ? " " : ""}
                  </span>
                  {showCursor ? (
                    <span className="sentence-reveal__cursor" aria-hidden="true" />
                  ) : null}
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
}
