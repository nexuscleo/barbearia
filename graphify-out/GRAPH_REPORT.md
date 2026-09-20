# Graph Report - C:\Users\clrtj\Desktop\barbearia  (2026-09-19)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 177 nodes · 235 edges · 16 communities (13 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `db2653c4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- db-service.ts
- page.tsx
- functions/package.json
- compilerOptions
- devDependencies
- DatabaseStore
- dependencies
- include
- package.json
- firebase.ts
- src/index.ts
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `DatabaseStore` - 18 edges
2. `compilerOptions` - 16 edges
3. `getTodayString()` - 10 edges
4. `useAuth()` - 9 edges
5. `ServiceItem` - 9 edges
6. `Barber` - 7 edges
7. `Appointment` - 7 edges
8. `include` - 7 edges
9. `scripts` - 6 edges
10. `scripts` - 6 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `getTodayString()`  [EXTRACTED]
  src/app/api/simulate-concurrency/route.ts → src/lib/db-service.ts
- `Home()` --calls--> `useAuth()`  [EXTRACTED]
  src/app/page.tsx → src/contexts/AuthContext.tsx
- `BookingWizard()` --calls--> `getTodayString()`  [EXTRACTED]
  src/components/client/BookingWizard.tsx → src/lib/db-service.ts
- `AuthContextType` --references--> `UserProfile`  [EXTRACTED]
  src/contexts/AuthContext.tsx → src/types/index.ts
- `DatabaseStore` --references--> `Barber`  [EXTRACTED]
  src/lib/db-service.ts → src/types/index.ts

## Import Cycles
- None detected.

## Communities (16 total, 3 thin omitted)

### Community 0 - "db-service.ts"
Cohesion: 0.15
Nodes (13): POST(), AdminDashboard(), BookingWizardProps, ConcurrencySimulatorModal(), ConcurrencySimulatorModalProps, AVAILABLE_HOURS, getTodayString(), INITIAL_BARBERS (+5 more)

### Community 1 - "page.tsx"
Cohesion: 0.16
Nodes (15): geistMono, geistSans, metadata, Home(), BookingWizard(), MyAppointments(), MyAppointmentsProps, Navbar() (+7 more)

### Community 2 - "functions/package.json"
Cohesion: 0.10
Nodes (19): firebase-admin, firebase-functions, dependencies, firebase-admin, firebase-functions, devDependencies, typescript, engines (+11 more)

### Community 3 - "compilerOptions"
Cohesion: 0.11
Nodes (19): dom, dom.iterable, esnext, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules (+11 more)

### Community 4 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+9 more)

### Community 5 - "DatabaseStore"
Cohesion: 0.18
Nodes (3): DatabaseStore, Appointment, ServiceItem

### Community 6 - "dependencies"
Cohesion: 0.13
Nodes (15): clsx, firebase, lucide-react, next, dependencies, clsx, firebase, lucide-react (+7 more)

### Community 7 - "include"
Cohesion: 0.18
Nodes (10): functions, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx (+2 more)

### Community 8 - "package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, start, test:concurrency (+1 more)

### Community 10 - "firebase.ts"
Cohesion: 0.40
Nodes (4): auth, db, firebaseConfig, isFirebaseConfigured

### Community 11 - "src/index.ts"
Cohesion: 0.50
Nodes (3): db, NovoAgendamentoInput, validarECriarAgendamento

## Knowledge Gaps
- **82 isolated node(s):** `eslintConfig`, `name`, `build`, `serve`, `shell` (+77 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `DatabaseStore` connect `DatabaseStore` to `db-service.ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `name`, `build` to the rest of the system?**
  _82 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `db-service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14666666666666667 - nodes in this community are weakly interconnected._
- **Should `functions/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._