import type { MDXComponents } from "mdx/types";
import { Theorem } from "@/components/math/Theorem";
import { Definition } from "@/components/math/Definition";
import { Proof } from "@/components/math/Proof";
import { Example } from "@/components/math/Example";
import { Warning } from "@/components/math/Warning";
import { ControlQuestion } from "@/components/math/ControlQuestion";
import { Step } from "@/components/exercise/Step";
import { Why } from "@/components/exercise/Why";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Theorem,
    Definition,
    Proof,
    Example,
    Warning,
    ControlQuestion,
    Step,
    Why,
  };
}
