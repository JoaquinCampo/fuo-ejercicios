import type { ReactNode } from "react";

export function Why({ children }: { children: ReactNode }) {
  return <div data-why>{children}</div>;
}
