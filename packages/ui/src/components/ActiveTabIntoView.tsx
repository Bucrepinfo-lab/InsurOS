"use client";

import { useEffect, useRef } from 'react';

/** Scrolls its tab strip so the current tab is visible (phones show only a few). */
export function ActiveTabIntoView() {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const strip = marker.current?.parentElement;
    const current = strip?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!strip || !current) return;
    const left = current.offsetLeft - strip.offsetLeft;
    if (left + current.offsetWidth > strip.scrollLeft + strip.clientWidth || left < strip.scrollLeft) {
      strip.scrollLeft = Math.max(0, left - 16);
    }
  }, []);
  return <span ref={marker} hidden />;
}
