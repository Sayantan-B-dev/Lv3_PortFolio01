"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const HOURS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, m) => String(m * 5).padStart(2, "0"));

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toLocalValue(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseLocal(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatNice(value: string): string {
  const d = parseLocal(value);
  if (!d) return "Pick date & time";
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Popup calendar + time picker. Emits local "YYYY-MM-DDTHH:mm" like datetime-local did. */
export function DateTimePicker({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const seed = parseLocal(value) ?? new Date();
  const [viewY, setViewY] = useState(seed.getFullYear());
  const [viewM, setViewM] = useState(seed.getMonth());
  const [hour, setHour] = useState(pad(seed.getHours()));
  const [minute, setMinute] = useState(pad(Math.floor(seed.getMinutes() / 5) * 5));
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstWeekday = (new Date(viewY, viewM, 1).getDay() + 6) % 7; // Monday first
  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, d) => d + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selected = parseLocal(value);

  const pickDay = (day: number) => {
    const d = new Date(viewY, viewM, day, Number(hour), Number(minute));
    onChange(toLocalValue(d));
  };

  const shiftTime = (part: "hour" | "minute", next: string) => {
    if (part === "hour") setHour(next);
    else setMinute(next);
    if (selected) {
      const d = new Date(selected);
      if (part === "hour") d.setHours(Number(next));
      else d.setMinutes(Number(next));
      onChange(toLocalValue(d));
    }
  };

  const stepMonth = (dir: 1 | -1) => {
    const d = new Date(viewY, viewM + dir, 1);
    setViewY(d.getFullYear());
    setViewM(d.getMonth());
  };

  return (
    <div ref={rootRef} className="dtp">
      <button
        type="button"
        className={value ? "dtp__btn" : "dtp__btn dtp__btn--empty"}
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <CalendarDays className="icon-4" aria-hidden="true" />
        {formatNice(value)}
      </button>
      {open && !disabled ? (
        <>
          <span className="dtp__scrim" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="dtp__pop" role="dialog" aria-label="Pick publish date and time">
            <div className="dtp__head">
              <button type="button" className="dtp__nav" onClick={() => stepMonth(-1)} aria-label="Previous month">
                <ChevronLeft className="icon-4" aria-hidden="true" />
              </button>
              <p>
                {MONTHS[viewM]} {viewY}
              </p>
              <button type="button" className="dtp__nav" onClick={() => stepMonth(1)} aria-label="Next month">
                <ChevronRight className="icon-4" aria-hidden="true" />
              </button>
            </div>
            <div className="dtp__week">
              {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((w) => (
                <span key={w}>{w}</span>
              ))}
            </div>
            <div className="dtp__grid">
              {cells.map((day, i) => {
                if (day === null) return <span key={`e-${i}`} className="dtp__day dtp__day--empty" />;
                const date = new Date(viewY, viewM, day);
                const past = date < today;
                const isSel = selected !== null && sameDay(date, selected);
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={past}
                    onClick={() => pickDay(day)}
                    className={
                      isSel ? "dtp__day dtp__day--sel" : past ? "dtp__day dtp__day--past" : "dtp__day"
                    }
                    aria-pressed={isSel}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <div className="dtp__time">
              <label>
                Hour
                <select value={hour} onChange={(e) => shiftTime("hour", e.target.value)}>
                  {HOURS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </label>
              <span aria-hidden="true">:</span>
              <label>
                Min
                <select value={minute} onChange={(e) => shiftTime("minute", e.target.value)}>
                  {MINUTES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="admin-btn"
                onClick={() => {
                  const now = new Date();
                  setViewY(now.getFullYear());
                  setViewM(now.getMonth());
                  setHour(pad(now.getHours()));
                  setMinute(pad(Math.floor(now.getMinutes() / 5) * 5));
                  onChange(toLocalValue(now));
                }}
              >
                Now
              </button>
              <button type="button" className="admin-btn admin-btn--primary" onClick={() => setOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
