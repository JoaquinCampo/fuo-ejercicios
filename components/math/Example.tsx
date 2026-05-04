import type { ReactNode } from "react";
import { Callout } from "@/components/math/Callout";

export function Example({ title, children }: { title?: string | undefined; children: ReactNode }) {
  return (
    <Callout variant="example" title={title}>
      {children}
    </Callout>
  );
}
