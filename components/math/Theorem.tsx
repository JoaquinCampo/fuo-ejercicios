import type { ReactNode } from "react";
import { Callout } from "@/components/math/Callout";

export function Theorem({ title, children }: { title?: string | undefined; children: ReactNode }) {
  return (
    <Callout variant="theorem" title={title}>
      {children}
    </Callout>
  );
}
