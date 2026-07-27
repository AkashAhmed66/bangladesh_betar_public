"use client";

import { useEffect } from "react";

/**
 * Registers the offline app-shell service worker (Phase B PWA), so the app is
 * installable and opens without a network. No-ops where service workers are
 * unavailable (older browsers, insecure origins other than localhost).
 */
export default function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    };

    if (document.readyState === "complete") {
      register();
      return;
    }
    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
