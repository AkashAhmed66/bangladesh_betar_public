import type { ComponentProps } from "react";

/** Keep catalogue cards at the same size, even when a row has just one result. */
export default function MediaGrid({ children, className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={`grid min-w-0 grid-cols-2 gap-4 min-[520px]:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 ${className}`}
    >
      {children}
    </div>
  );
}
