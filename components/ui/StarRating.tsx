"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  value: number;
  size?: string;
  /** Interactive when provided — click to select, hover to preview. */
  onChange?: (value: number) => void;
  className?: string;
  label?: string;
}

/**
 * Five-star display/picker. Read-only when `onChange` is omitted (renders
 * the rounded `value`); interactive otherwise (click to set, hover preview).
 */
export default function StarRating({ value, size = "size-4", onChange, className = "", label }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const interactive = onChange !== undefined;
  const display = interactive ? hover || value : Math.round(value);

  return (
    <div
      className={`flex items-center ${className}`}
      onMouseLeave={interactive ? () => setHover(0) : undefined}
      role={interactive ? "radiogroup" : undefined}
      aria-label={label ?? (interactive ? "Your rating" : "Rating")}
    >
      {[1, 2, 3, 4, 5].map((v) =>
        interactive ? (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            aria-label={`${v} star${v > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(v)}
            onClick={() => onChange!(v)}
            className="p-0.5"
          >
            <Star className={`${size} transition ${v <= display ? "fill-premium text-premium" : "text-ink-mute hover:text-premium/60"}`} />
          </button>
        ) : (
          <Star key={v} className={`${size} ${v <= display ? "fill-premium text-premium" : "text-ink-mute"}`} />
        ),
      )}
    </div>
  );
}
