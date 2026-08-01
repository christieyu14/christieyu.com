"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
  type TransitionEvent,
} from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  visibleClassName?: string;
  /** Stagger delay in milliseconds once revealed. */
  delayMs?: number;
  as?: ElementType;
  /** Intersection ratio before revealing (0–1). */
  threshold?: number;
  style?: CSSProperties;
} & Omit<
  HTMLAttributes<HTMLElement>,
  "className" | "style" | "children" | "onTransitionEnd"
>;

/**
 * Soft fade/rise when an element enters the viewport.
 * After the motion settles, transform is cleared so backdrop-filter
 * on descendants (e.g. frosted project cards) can sample the page again.
 */
export function Reveal({
  children,
  className,
  visibleClassName,
  delayMs = 0,
  as: Tag = "div",
  threshold = 0.14,
  style,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      setSettled(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -4% 0px",
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  useEffect(() => {
    if (!visible || settled) {
      return;
    }

    // Fallback if transitionend is skipped (tab background, reduced paint, etc.)
    const settleMs = 480 + delayMs + 100;
    const timer = window.setTimeout(() => setSettled(true), settleMs);
    return () => window.clearTimeout(timer);
  }, [visible, settled, delayMs]);

  function handleTransitionEnd(event: TransitionEvent<HTMLElement>) {
    if (event.target !== ref.current) {
      return;
    }
    if (event.propertyName === "transform" || event.propertyName === "opacity") {
      setSettled(true);
    }
  }

  const classes = [
    "reveal",
    visible ? "reveal--in" : null,
    settled ? "reveal--settled" : null,
    visible && visibleClassName ? visibleClassName : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      ref={ref}
      className={classes}
      style={{
        ...style,
        transitionDelay: visible && !settled && delayMs ? `${delayMs}ms` : undefined,
      }}
      {...rest}
      onTransitionEnd={handleTransitionEnd}
    >
      {children}
    </Tag>
  );
}
