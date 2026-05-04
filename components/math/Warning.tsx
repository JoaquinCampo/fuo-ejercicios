import type { ReactNode } from "react";
import { Callout } from "@/components/math/Callout";

export function Warning({ title, children }: { title?: string | undefined; children: ReactNode }) {
  return (
    <Callout variant="warning" title={title}>
      {children}
    </Callout>
  );
}
