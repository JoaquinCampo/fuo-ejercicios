# TypeScript

## `tsconfig.json` obligatorio

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "noEmit": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Reglas

- **Cero `any`.** Si necesitás `any`, parame y discutamos.
- `unknown` solo en boundaries (JSON, fetch). Narrow inmediato con Zod.
- **`type` por default**, `interface` solo si necesitás declaration merging.
- `satisfies` para configs y registries:
  ```ts
  const fichas = {
    "p1-ej2": { title: "Convexidad en R", order: 1 },
    "p1-ej3": { title: "Jensen", order: 2 },
  } satisfies Record<string, Ficha>;
  ```
- **Branded types para identificadores y unidades:**
  ```ts
  type FichaId = string & { readonly __brand: "FichaId" };
  type Radians = number & { readonly __brand: "Radians" };
  ```
- Server Actions tipadas extremo a extremo. Validar input con Zod en la primera línea.
- Discriminated unions para resultados:
  ```ts
  type Result<T> =
    | { ok: true; value: T }
    | { ok: false; error: string };
  ```
