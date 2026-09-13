import { AudioLines } from "lucide-react";
import type { ReactNode } from "react";

interface ListenPageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
}

/** Editorial masthead shared by the Listen catalogue pages. */
export default function ListenPageHero({
  eyebrow = "Bangladesh Betar Listen",
  title,
  description,
  icon,
  meta,
  actions,
}: ListenPageHeroProps) {
  return (
    <section className="listen-page-hero portal-full-bleed relative -mt-5 overflow-hidden border-b border-edge sm:-mt-7">
      <div aria-hidden className="listen-hero-orb listen-hero-orb-one" />
      <div aria-hidden className="listen-hero-orb listen-hero-orb-two" />
      <div className="relative mx-auto grid min-h-[20rem] max-w-[1540px] items-end gap-8 px-5 py-10 sm:min-h-[23rem] sm:px-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--portal-color)_28%,var(--border-subtle))] bg-elev/65 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.19em] text-[var(--portal-color)] shadow-sm backdrop-blur-xl">
            <span className="grid size-7 place-items-center rounded-full bg-[var(--portal-color)] text-white">
              {icon ?? <AudioLines className="size-3.5" />}
            </span>
            {eyebrow}
          </div>
          <h1 className="mt-5 max-w-4xl text-balance font-display text-4xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-ink-soft sm:text-lg">
              {description}
            </p>
          )}
          {(meta || actions) && (
            <div className="mt-7 flex flex-wrap items-center gap-3">
              {actions}
              {meta && <div className="text-xs font-bold uppercase tracking-[0.12em] text-ink-mute">{meta}</div>}
            </div>
          )}
        </div>

        <div aria-hidden className="hidden h-48 items-end justify-center gap-2 lg:flex">
          {[46, 72, 38, 88, 58, 100, 68, 42, 78, 52, 92, 62].map((height, index) => (
            <span
              key={`${height}-${index}`}
              className="listen-spectrum-bar w-3 rounded-full"
              style={{ height: `${height}%`, animationDelay: `${index * -90}ms` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
