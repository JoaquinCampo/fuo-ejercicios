import type { ReactNode } from "react";
import { FichaSidebar } from "@/components/layout/FichaSidebar";
import { TOC } from "@/components/layout/TOC";

export default function FichasLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <FichaSidebar />
      <div className="flex-1 min-w-0 px-5 py-8 sm:px-8 sm:py-12 lg:px-16">
        <article className="prose">{children}</article>
      </div>
      <TOC />
    </div>
  );
}
