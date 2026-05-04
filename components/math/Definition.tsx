import type { ReactNode } from "react";
import { Callout } from "@/components/math/Callout";

export function Definition({ title, children }: { title?: string | undefined; children: ReactNode }) {
  return (
    <Callout variant="definition" title={title}>
      {children}
    </Callout>
  );
}
