import type { ReactNode } from "react";

export function Marquee({
  items,
  speed = 32,
  reverse = false,
  className = "",
  itemClassName = "",
  separator = "✦",
}: {
  items: ReactNode[];
  speed?: number;
  reverse?: boolean;
  className?: string;
  itemClassName?: string;
  separator?: ReactNode;
}) {
  const group = (ariaHidden: boolean) => (
    <div aria-hidden={ariaHidden || undefined} className="marquee-group">
      {items.map((item, i) => (
        <span key={i} className="marquee-item">
          <span className={itemClassName}>{item}</span>
          <span className="marquee-sep">{separator}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={reverse ? `marquee marquee-mask marquee-reverse ${className}` : `marquee marquee-mask ${className}`}
      style={{ ["--marquee-speed" as string]: `${speed}s` }}
    >
      <div className="marquee-track">
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}
