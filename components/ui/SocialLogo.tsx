import type { SVGProps } from "react";

export type SocialPlatform = "Facebook" | "Instagram" | "YouTube" | "X / Twitter";

const BRAND_COLORS: Partial<Record<SocialPlatform, string>> = {
  Facebook: "#1877f2",
  Instagram: "#e4405f",
  YouTube: "#ff0000",
};

/** Brand marks used consistently by the global social links. */
export default function SocialLogo({ platform, ...props }: { platform: SocialPlatform } & SVGProps<SVGSVGElement>) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    ...props,
    style: { color: BRAND_COLORS[platform], ...props.style },
    "aria-hidden": true,
  };

  if (platform === "Facebook") {
    return <svg {...common}><path fill="currentColor" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.026 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.971h-1.513c-1.491 0-1.956.931-1.956 1.887v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z" /></svg>;
  }

  if (platform === "Instagram") {
    return <svg {...common}><rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="2" /><circle cx="17.55" cy="6.55" r="1.15" fill="currentColor" /></svg>;
  }

  if (platform === "YouTube") {
    return <svg {...common}><path fill="currentColor" d="M21.58 7.19a2.98 2.98 0 0 0-2.1-2.1C17.63 4.58 12 4.58 12 4.58s-5.63 0-7.48.51a2.98 2.98 0 0 0-2.1 2.1C1.91 9.04 1.91 12 1.91 12s0 2.96.51 4.81a2.98 2.98 0 0 0 2.1 2.1c1.85.51 7.48.51 7.48.51s5.63 0 7.48-.51a2.98 2.98 0 0 0 2.1-2.1c.51-1.85.51-4.81.51-4.81s0-2.96-.51-4.81ZM10 15.36V8.64L15.77 12 10 15.36Z" /></svg>;
  }

  return <svg {...common}><path fill="currentColor" d="M18.9 2H22l-6.77 7.74L23.2 22h-6.27l-4.91-6.42L6.4 22H3.3l7.24-8.28L2.8 2h6.43l4.44 5.87L18.9 2Zm-1.1 17.6h1.73L8.28 4.3H6.42L17.8 19.6Z" /></svg>;
}
