# Graph Report - barbearia  (2026-09-26)

## Corpus Check
- 46 files · ~21,589 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 274 nodes · 412 edges · 23 communities (15 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `324b4b8f`
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
- services/route.ts
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- IsolatedDatabaseStore
- validations.test.mjs
- AGENTS.md
- rules/graphify.md
- workflows/graphify.md

## God Nodes (most connected - your core abstractions)
1. `ServiceItem` - 19 edges
2. `DatabaseStore` - 18 edges
3. `getErrorMessage()` - 16 edges
4. `Barber` - 16 edges
5. `compilerOptions` - 16 edges
6. `Diretriz/Auditoria Mestra de Desenvolvimento Web — Cleomar` - 15 edges
7. `Appointment` - 14 edges
8. `getTodayString()` - 11 edges
9. `scripts` - 8 edges
10. `useAuth()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `AdminServicesListProps` --references--> `ServiceItem`  [EXTRACTED]
  src/components/admin/AdminServicesList.tsx → src/types/index.ts
- `GET()` --calls--> `getErrorMessage()`  [EXTRACTED]
  src/app/api/agendamentos/route.ts → src/lib/errors.ts
- `PATCH()` --calls--> `getErrorMessage()`  [EXTRACTED]
  src/app/api/agendamentos/route.ts → src/lib/errors.ts
- `GET()` --calls--> `getErrorMessage()`  [EXTRACTED]
  src/app/api/barbers/route.ts → src/lib/errors.ts
- `GET()` --calls--> `getErrorMessage()`  [EXTRACTED]
  src/app/api/services/route.ts → src/lib/errors.ts

## Import Cycles
- None detected.

## Communities (23 total, 8 thin omitted)

### Community 0 - "db-service.ts"
Cohesion: 0.10
Nodes (23): GET(), PATCH(), POST(), GET(), DELETE(), GET(), POST(), PUT() (+15 more)

### Community 1 - "page.tsx"
Cohesion: 0.16
Nodes (13): ClientSimulationSummary, POST(), SimulationResultResponse, AdminDashboard(), BookingWizard(), MyAppointments(), ConcurrencySimulatorModal(), ConcurrencySimulatorModalProps (+5 more)

### Community 2 - "functions/package.json"
Cohesion: 0.21
Nodes (9): geistMono, geistSans, metadata, AuthContext, AuthContextType, AuthProvider(), DEMO_USERS, UserProfile (+1 more)

### Community 3 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 4 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+9 more)

### Community 5 - "DatabaseStore"
Cohesion: 0.10
Nodes (21): AdminAppointmentsListProps, BookingSuccessCard(), BookingSuccessCardProps, StepBarberSelection(), StepBarberSelectionProps, StepConfirmation(), StepConfirmationProps, StepDateTimeSelection() (+13 more)

### Community 6 - "dependencies"
Cohesion: 0.07
Nodes (26): clsx, lucide-react, next, dependencies, clsx, lucide-react, next, react (+18 more)

### Community 7 - "include"
Cohesion: 0.08
Nodes (24): 1. Separação de Preocupações e Camadas, 2. Controle Estrito de Concorrência (Anti Double-Booking), 3. Catálogo de Endpoints da API, 4. Filosofia de Design e UI Anti-IA, Decisões Arquiteturais e Estrutura Técnica (ADRs), Desafio de Negócio, `GET /api/agendamentos`, `GET /api/barbers` (+16 more)

### Community 8 - "package.json"
Cohesion: 0.09
Nodes (21): 10. Performance e Otimização, 11. Estratégia de Testes, 12. Operações, CI/CD e Deploy, 13. Documentação do Projeto, 14. Protocolo de Auditoria e Code Review, 1. Identidade e Papel do Agente, 2. Protocolo Operacional do Agente, 3. Stack Tecnológica de Referência (+13 more)

### Community 9 - "services/route.ts"
Cohesion: 0.23
Nodes (8): AdminAppointmentsList(), AdminMetricsBar(), AdminMetricsBarProps, AdminServiceModal(), AdminServiceModalProps, ServiceFormData, AdminServicesList(), AdminServicesListProps

## Knowledge Gaps
- **112 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+107 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ServiceItem` connect `DatabaseStore` to `db-service.ts`, `services/route.ts`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `getErrorMessage()` connect `db-service.ts` to `page.tsx`, `DatabaseStore`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `DatabaseStore` connect `DatabaseStore` to `db-service.ts`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _112 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `db-service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10252100840336134 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._