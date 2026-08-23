"use client";

import { useCallback } from "react";
import en from "@/locales/en.json";
import bn from "@/locales/bn.json";
import { useUi } from "@/stores/ui";

export type Locale = "en" | "bn";
type Parameters = Record<string, string | number>;
type LocalizedRecord = Record<string, unknown>;

const dictionaries: Record<Locale, typeof en> = { en, bn };

export function translate(locale: Locale, key: string, parameters: Parameters = {}): string {
  const value = key.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[segment];
  }, dictionaries[locale]);

  const fallback = key.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[segment];
  }, dictionaries.en);

  const message = typeof value === "string" ? value : typeof fallback === "string" ? fallback : key;
  return Object.entries(parameters).reduce(
    (translated, [name, replacement]) => translated.replaceAll(`{${name}}`, String(replacement)),
    message,
  );
}

export function localizedText(record: LocalizedRecord, field: string, locale: Locale): string {
  const translated = locale === "bn" ? record[`${field}_bn`] : null;
  const fallback = record[field];
  return typeof translated === "string" && translated.trim()
    ? translated
    : typeof fallback === "string"
      ? fallback
      : "";
}

export function localizedList(record: LocalizedRecord, field: string, locale: Locale): string[] {
  const translated = locale === "bn" ? record[`${field}_bn`] : null;
  const fallback = record[field];
  if (Array.isArray(translated) && translated.length > 0) return translated.filter((item): item is string => typeof item === "string");
  return Array.isArray(fallback) ? fallback.filter((item): item is string => typeof item === "string") : [];
}

export function useTranslation() {
  const locale = useUi((state) => state.locale);
  const t = useCallback(
    (key: string, parameters?: Parameters) => translate(locale, key, parameters),
    [locale],
  );
  return {
    locale,
    t,
  };
}
