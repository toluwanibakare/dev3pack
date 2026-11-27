import React from "react";

/**
 * Marquee drifts its children sideways on a slow loop (duplicated for a
 * seamless wrap, pauses on hover). Reduced-motion stops it in globals.css.
 */
export function Marquee({
  items,
  className = "",
}: {
  items: React.ReactNode[];
  className?: string;
}) {
  const track = [...items, ...items];

  return (
    <div className={`marquee ${className}`}>
      <div className="marquee-track">
        {track.map((item, index) => (
          <div key={index} className="flex shrink-0 items-center">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}