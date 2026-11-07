"use client";

import { useEffect } from "react";

/** Registers the static-assets service worker (ADR 0004). Only in production builds. */
export function RegistrarSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((e: unknown) => {
      // Installing is an enhancement; the site works the same without it.
      console.warn("Service worker não registrado:", e);
    });
  }, []);
  return null;
}
