/**
 * Registry tipado de fichas. Las fichas se publican vía MDX en content/fichas/,
 * pero acá listamos su orden y metadata mínima para sidebar y home.
 *
 * Cuando una ficha exista en content/fichas/{slug}.mdx, descomentar la entrada
 * y verificar que el frontmatter coincida.
 */

export type Practico = 1 | 2 | 3;

export type FichaId = string & { readonly __brand: "FichaId" };

export type Ficha = {
  id: string;
  slug: string;
  title: string;
  practico: Practico;
  ejercicio: number;
  estimated_minutes: number;
  status: "published" | "draft" | "todo";
};

export const fichas = [
  {
    id: "P1-Ej2",
    slug: "p1-ej2",
    title: "Convexas en R: desigualdades de cuerdas",
    practico: 1,
    ejercicio: 2,
    estimated_minutes: 90,
    status: "draft",
  },
  {
    id: "P1-Ej3",
    slug: "p1-ej3",
    title: "Jensen y desigualdad aritmético-geométrica",
    practico: 1,
    ejercicio: 3,
    estimated_minutes: 75,
    status: "draft",
  },
  {
    id: "P2-Ej2",
    slug: "p2-ej2",
    title: "Convergencia O(1/k) de steepest descent",
    practico: 2,
    ejercicio: 2,
    estimated_minutes: 90,
    status: "todo",
  },
  {
    id: "P2-Ej3",
    slug: "p2-ej3",
    title: "Convergencia lineal con regla de Armijo",
    practico: 2,
    ejercicio: 3,
    estimated_minutes: 90,
    status: "todo",
  },
  {
    id: "P2-Ej4",
    slug: "p2-ej4",
    title: "Heavy Ball y Nesterov como sistema de orden 2",
    practico: 2,
    ejercicio: 4,
    estimated_minutes: 75,
    status: "todo",
  },
  {
    id: "P2-Ej5",
    slug: "p2-ej5",
    title: "BFGS y condición secante",
    practico: 2,
    ejercicio: 5,
    estimated_minutes: 90,
    status: "todo",
  },
  {
    id: "P3-Ej3",
    slug: "p3-ej3",
    title: "Orden de convergencia de gradiente proyectado para cuadráticas",
    practico: 3,
    ejercicio: 3,
    estimated_minutes: 90,
    status: "todo",
  },
  {
    id: "P3-Ej4",
    slug: "p3-ej4",
    title: "Reglas de Armijo y minimización limitada para gradiente proyectado",
    practico: 3,
    ejercicio: 4,
    estimated_minutes: 90,
    status: "todo",
  },
  {
    id: "P3-Ej5",
    slug: "p3-ej5",
    title: "KKT y dualidad de Lagrange (water-filling)",
    practico: 3,
    ejercicio: 5,
    estimated_minutes: 90,
    status: "todo",
  },
  {
    id: "P3-Ej6",
    slug: "p3-ej6",
    title: "ADMM y LASSO (soft-thresholding)",
    practico: 3,
    ejercicio: 6,
    estimated_minutes: 90,
    status: "todo",
  },
] as const satisfies readonly Ficha[];

export type FichaSlug = (typeof fichas)[number]["slug"];

export const fichaBySlug = Object.fromEntries(
  fichas.map((f) => [f.slug, f] as const),
) as Record<FichaSlug, (typeof fichas)[number]>;
