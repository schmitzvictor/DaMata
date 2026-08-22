"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  rotate?: number;
};

export function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  rotate = 0,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const style: CSSProperties = {
    transitionDelay: `${delay}ms`,
    transform: visible
      ? "translateY(0) rotate(0deg)"
      : `translateY(26px) rotate(${rotate}deg)`,
  };

  return (
    <Tag
      // @ts-expect-error -- ref typing varies by element tag
      ref={ref}
      className={`reveal-base ${className}`.trim()}
      style={style}
      data-visible={visible}
    >
      {children}
    </Tag>
  );
}
