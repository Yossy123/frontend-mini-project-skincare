'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GUIDES, GUIDE_START_EVENT, guideSeenKey, type GuideRole } from '@/lib/guide/content';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const CARD_WIDTH = 340;
const CARD_MIN_SPACE = 24;
const SPOTLIGHT_PADDING = 6;

/** Ask the mounted tour of this role to start from the first step. */
export function startGuideTour(role: GuideRole): void {
  window.dispatchEvent(new CustomEvent(GUIDE_START_EVENT, { detail: { role } }));
}

function hasSeenTour(key: string): boolean {
  try {
    return window.localStorage.getItem(key) !== null;
  } catch {
    // Storage is blocked: do not nag on every visit.
    return true;
  }
}

function markTourSeen(key: string): void {
  try {
    window.localStorage.setItem(key, new Date().toISOString());
  } catch {
    // The tour simply reappears next time.
  }
}

/** First element with this tour id that is actually on screen (menus can be off-canvas on phones). */
function findVisibleTarget(id: string): HTMLElement | null {
  const candidates = document.querySelectorAll<HTMLElement>(`[data-tour="${id}"]`);
  for (const element of candidates) {
    const box = element.getBoundingClientRect();
    if (box.width > 0 && box.height > 0 && box.right > 0 && box.left < window.innerWidth) {
      return element;
    }
  }
  return null;
}

function cardPosition(rect: Rect | null, viewport: { width: number; height: number }): React.CSSProperties {
  if (!rect || viewport.width < 640) {
    return rect
      ? { left: 12, right: 12, bottom: 16 }
      : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: `min(${CARD_WIDTH}px, calc(100vw - 24px))` };
  }

  const clampTop = (top: number) => Math.min(Math.max(12, top), viewport.height - 260);
  if (rect.left + rect.width + CARD_MIN_SPACE + CARD_WIDTH <= viewport.width) {
    return { left: rect.left + rect.width + 16, top: clampTop(rect.top + rect.height / 2 - 90), width: CARD_WIDTH };
  }
  const left = Math.min(Math.max(12, rect.left), viewport.width - CARD_WIDTH - 12);
  if (rect.top + rect.height + 240 < viewport.height) {
    return { left, top: rect.top + rect.height + 16, width: CARD_WIDTH };
  }
  return { left, top: clampTop(rect.top - 230), width: CARD_WIDTH };
}

interface GuideTourProps {
  role: GuideRole;
  userId: number | string;
  /** Start by itself the first time this user signs in. */
  autoStart?: boolean;
}

/**
 * Step-by-step tour that dims the page and highlights one menu or button at a time.
 * Finishing or skipping it is remembered per user, and it can be restarted with `startGuideTour`.
 */
export function GuideTour({ role, userId, autoStart = true }: GuideTourProps) {
  const steps = GUIDES[role].tour;
  const storageKey = guideSeenKey(role, userId);
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [viewport, setViewport] = useState({ width: 1024, height: 768 });
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);

  const step = steps[Math.min(index, steps.length - 1)];
  const isLast = index >= steps.length - 1;

  const finish = () => {
    setActive(false);
    markTourSeen(storageKey);
  };

  useEffect(() => {
    if (!autoStart || hasSeenTour(storageKey)) return;
    const timer = window.setTimeout(() => {
      setIndex(0);
      setActive(true);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [autoStart, storageKey]);

  useEffect(() => {
    const handleStart = (event: Event) => {
      const requested = (event as CustomEvent<{ role?: GuideRole }>).detail?.role;
      if (requested && requested !== role) return;
      setIndex(0);
      setActive(true);
    };
    window.addEventListener(GUIDE_START_EVENT, handleStart);
    return () => window.removeEventListener(GUIDE_START_EVENT, handleStart);
  }, [role]);

  useEffect(() => {
    if (!active) return;
    let frame = 0;

    const measure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const element = step.target ? findVisibleTarget(step.target) : null;
        const box = element?.getBoundingClientRect();
        setRect(box ? { top: box.top, left: box.left, width: box.width, height: box.height } : null);
        setViewport({ width: window.innerWidth, height: window.innerHeight });
      });
    };

    if (step.target) {
      findVisibleTarget(step.target)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [active, step]);

  useEffect(() => {
    if (!active) return;
    nextButtonRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActive(false);
        markTourSeen(storageKey);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [active, index, storageKey]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-100" role="dialog" aria-modal="true" aria-labelledby="guide-tour-title">
      {rect ? (
        <div
          aria-hidden
          className="pointer-events-none fixed rounded-2xl ring-2 ring-white/80 transition-all duration-200"
          style={{
            top: rect.top - SPOTLIGHT_PADDING,
            left: rect.left - SPOTLIGHT_PADDING,
            width: rect.width + SPOTLIGHT_PADDING * 2,
            height: rect.height + SPOTLIGHT_PADDING * 2,
            boxShadow: '0 0 0 9999px rgba(9, 9, 11, 0.72)',
          }}
        />
      ) : (
        <div aria-hidden className="fixed inset-0 bg-zinc-950/70" />
      )}

      <div
        className="fixed rounded-2xl border border-zinc-200 bg-white p-4 text-zinc-900 shadow-2xl sm:p-5"
        style={cardPosition(rect, viewport)}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9d681d]">
          Langkah {index + 1} dari {steps.length}
        </p>
        <h2 id="guide-tour-title" className="mt-1 text-base font-semibold text-zinc-900">
          {step.title}
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-zinc-600">{step.body}</p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={finish}
            className="cursor-pointer text-xs font-semibold text-zinc-500 hover:text-zinc-800"
          >
            Lewati
          </button>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={() => setIndex((current) => Math.max(0, current - 1))}
                className="min-h-9 cursor-pointer rounded-xl px-3 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
              >
                Kembali
              </button>
            )}
            <button
              ref={nextButtonRef}
              type="button"
              onClick={() => (isLast ? finish() : setIndex((current) => current + 1))}
              className="min-h-9 cursor-pointer rounded-xl bg-[#b77d32] px-4 text-xs font-semibold text-white hover:bg-[#9d6928]"
            >
              {isLast ? 'Selesai' : 'Lanjut'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
