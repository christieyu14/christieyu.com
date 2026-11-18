"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { usePageReveal } from "@/components/content/page-reveal";
import "./HazeText.css";

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

/** Half-width katakana (Matrix-style “backwards” rain glyphs). Layout held by measure text. */
const SCRAMBLE_CHARS =
  "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";
const DURATION = 1.2;
const SPEED = 0.4;

interface HazeTextProps {
  children: string;
  as?: ElementType;
  className?: string;
  /** When false, skips intro (still renders plain text). Default: follow page reveal. */
  enabled?: boolean;
}

/**
 * Layout-stable Haze intro: invisible measure text holds size; scramble plays in an
 * overflow-hidden overlay so blocky glyphs never expand the document flow.
 */
export function HazeText({
  children,
  as: Tag = "span",
  className = "",
  enabled = true,
}: HazeTextProps) {
  const { ready } = usePageReveal();
  const liveRef = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(!enabled);
  const playedRef = useRef(false);

  useLayoutEffect(() => {
    if (!enabled || !ready || playedRef.current || done) {
      return;
    }

    const live = liveRef.current;
    if (!live) {
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      playedRef.current = true;
      setDone(true);
      return;
    }

    const split = SplitText.create(live, {
      type: "chars",
      smartWrap: true,
      aria: "none",
    });
    const chars = split.chars as HTMLElement[];
    let completed = false;

    const timeline = gsap.timeline({
      onComplete: () => {
        completed = true;
        playedRef.current = true;
        gsap.killTweensOf(chars);
        split.revert();
        setDone(true);
      },
    });

    chars.forEach((char, index) => {
      const original = char.textContent ?? "";
      if (!original.trim()) {
        return;
      }
      const reveal =
        0.1 +
        DURATION *
          (0.75 * (index / Math.max(chars.length, 1)) + 0.25 * Math.random());
      timeline.to(
        char,
        {
          duration: reveal + 0.08,
          ease: "none",
          scrambleText: {
            text: original,
            chars: SCRAMBLE_CHARS,
            speed: SPEED,
            revealDelay: reveal,
          },
        },
        0,
      );
    });

    timeline.time(0.001);
    timeline.play();

    return () => {
      timeline.kill();
      gsap.killTweensOf(chars);
      split.revert();
      if (!completed) {
        playedRef.current = false;
      }
    };
  }, [enabled, ready, done, children]);

  if (!enabled) {
    return <Tag className={className}>{children}</Tag>;
  }

  const showFinal = done || !ready;

  return (
    <Tag
      className={`haze-text${className ? ` ${className}` : ""}${
        showFinal ? " haze-text--done" : ""
      }`}
    >
      <span className="haze-text__measure" aria-hidden={showFinal ? undefined : true}>
        {children}
      </span>
      {!showFinal ? (
        <span ref={liveRef} className="haze-text__live" aria-hidden="true">
          {children}
        </span>
      ) : null}
      {!showFinal ? <span className="visually-hidden">{children}</span> : null}
    </Tag>
  );
}

/** Convenience for wrapping multiple block paragraphs. */
export function HazeBlocks({
  paragraphs,
  className = "",
}: {
  paragraphs: readonly string[];
  className?: string;
}): ReactNode {
  return paragraphs.map((paragraph) => (
    <HazeText key={paragraph} as="p" className={className}>
      {paragraph}
    </HazeText>
  ));
}
