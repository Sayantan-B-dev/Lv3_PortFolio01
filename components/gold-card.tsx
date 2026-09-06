"use client";

import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";

interface DragScrollItem {
  id: string;
  label: string;
  href: string;
}

const sidebarItems: DragScrollItem[] = [
  { id: "work1", label: "Re-Docs", href: "#work" },
  { id: "work2", label: "BlueEye", href: "#work" },
  { id: "work3", label: "LnkZoo", href: "#work" },
  { id: "about", label: "About", href: "#about" },
  { id: "skills", label: "Skills", href: "#skills" },
  { id: "exp", label: "Experience", href: "#experience" },
  { id: "contact", label: "Contact", href: "#contact" },
];

export function DragScrollSidebar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const [dragStyle, setDragStyle] = useState<{ cursor: string; scale: number }>(
    { cursor: "grab", scale: 1 }
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    isDragging.current = true;
    startX.current = e.clientX;
    scrollStart.current = containerRef.current.scrollLeft;
    setDragStyle({ cursor: "grabbing", scale: 1.02 });
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const dx = e.clientX - startX.current;
    containerRef.current.scrollLeft = scrollStart.current - dx;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    setDragStyle({ cursor: "grab", scale: 1 });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    isDragging.current = true;
    startX.current = e.touches[0].clientX;
    scrollStart.current = containerRef.current.scrollLeft;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const dx = e.touches[0].clientX - startX.current;
    containerRef.current.scrollLeft = scrollStart.current - dx;
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  return (
    <div className="drag-sidebar">
      <div
        ref={containerRef}
        className="drag-scroll-container drag-sidebar__box"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="drag-scroll-content drag-sidebar__list">
          {sidebarItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="drag-sidebar__item"
              aria-label={item.label}
            >
              {item.label[0]}
            </a>
          ))}
        </div>
      </div>
      {/* Scroll indicator */}
      <div className="drag-sidebar__rail" />
    </div>
  );
}
