import type { ReactNode } from "react";
import { Callout } from "@/components/math/Callout";

export function Proof({ title, children }: { title?: string | undefined; children: ReactNode }) {
  return (
    <Callout variant="proof" title={title}>
      {children}
    </Callout>
  );
}
