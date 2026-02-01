# MODEL.md

## 1. Source of Truth

1. Runtime application code (pages/, components/, hooks/, contexts/, lib/, prisma/) is primary.
2. This MODEL.md is secondary and must match observed code.
3. Other documentation files rank below MODEL.md.
4. LLM-generated output has no authority if it conflicts with repository code.

## 2. Tech Stack (Locked)

- **Framework**: Next.js (pages router) with React 18.
- **Styling**: CSS Modules under styles/.
- **Backend/API**: Next.js API routes under pages/api/, Prisma Client for PostgreSQL access.
- **State**: React Context (contexts/AuthContext) plus custom hooks.
- **Calendar UI**: @fullcalendar/react with daygrid/timegrid/interaction plugins and moment.js.
- **Security/Utilities**: bcryptjs, jsonwebtoken, validator, express middleware-like helpers in lib/.
- **Testing**: Jest + Testing Library for unit/integration; Cypress for e2e.
- **Forbidden**: Do not introduce other frontend frameworks (e.g., App Router, Vue, Angular), alternate ORMs, or state libraries (Redux, Zustand, MobX). Do not replace moment.js or FullCalendar unless code already does.

## 3. Folder Responsibilities

- **pages/**: Next.js page components and API route handlers. Only React components rendered by Next.js and HTTP handlers belong here.
- **pages/api/**: HTTP endpoints. Must stay stateless beyond reading contexts/middleware and must call lib/ + prisma for data.
- **components/**: Reusable React UI pieces (Calendar, headers, debug panels). Do not place hooks, contexts, or API logic here.
- **hooks/**: Custom React hooks encapsulating client logic (auth, availability). Ensure hook filenames start with `use`.
- **contexts/**: React context providers (currently AuthContext). Must export Provider plus context.
- **lib/**: Shared utilities (e.g., prisma client, middleware, services). Keep non-React logic here.
- **prisma/**: Database schema and migrations. Only Prisma artifacts belong here.
- **styles/**: CSS Modules and global styles referenced via `import styles from ...`.
- **tests (**tests**/, jest.setup.js)**: Jest test files/config. Do not mix production code here.
- Anything not covered above should remain where it currently lives; do not invent new top-level folders without evidence.

## 4. Routing Rules

- Uses Next.js **pages router**. Each file under pages/ becomes a route (e.g., pages/dashboard.js → `/dashboard`).
- **Dynamic API routes** use bracket syntax (e.g., pages/api/admin/reports/[id]/index.js for `/api/admin/reports/:id`).
- `_app.js` wraps every page with `<AuthProvider>` and global scripts/service worker registration.
- `_document.js` should only contain custom Document markup (follow existing file).
- Only add routes inside pages/; do not attempt App Router or nested layouts.

## 5. Component Rules

- Components live in components/ and are functional React components.
- Use CSS Modules imported as `styles` for scoped styling.
- Calendar component encapsulates FullCalendar logic; any event UI changes must keep color/status mapping defined there.
- Props are explicit and descriptive (see UserProfileHeader). Components expect data/handlers passed from hooks/contexts, not fetched internally.
- Components can include internal helper classes (e.g., `class CalendarEvent`) if tightly scoped to the component responsibility.
- Do not instantiate hooks outside components; components call hooks directly.

## 6. Hooks Rules

- Hooks reside in hooks/, named `useX.js`.
- They wrap context data (useAuth) or encapsulate client-side logic plus side effects (useAvailability).
- Hooks manage async calls via fetch to API routes and synchronize with context/local state.
- Hooks may expose helper methods but must never mutate DOM directly; side effects are enclosed in `useEffect`.
- Hooks must integrate with AuthContext for tokens and user data when auth is required.
- Do not create hooks for logic already handled by contexts or components without evidence.

## 7. State Management Rules

- Global auth state is handled exclusively by `contexts/AuthContext` and consumed via `useAuth`.
- `AuthProvider` stores user + token in localStorage; updates must go through `saveAuthData`, `clearAuthData`, or `updateUser`.
- Availability state is client-side via `useAvailability` and synced to the backend; other persistent toggles should follow this pattern.
- No external state libraries (Redux, Zustand, etc.) are permitted; only React state, context, and hooks.

## 8. Data & Prisma Rules

- `prisma/schema.prisma` is the definitive data model (PostgreSQL).
- Models: User, Report, Event, MatchProposal, UserSportLevel plus enums (ReportReason, ReportStatus, EventStatus, ProposalStatus, Sport).
- Relationships and constraints (e.g., `@@unique([reporterId, reportedId])`, `@@unique([userId, sport])`) must be respected when modifying data logic.
- Any schema change requires updating migrations and regenerating Prisma Client (`prisma generate`).
- API routes must use the shared Prisma client from lib/prisma for data access.

## 9. Testing Rules

- Unit/integration tests run via Jest (`npm run test`, `test:watch`, `test:coverage`) with jest-environment-jsdom and Testing Library utilities.
- Cypress handles end-to-end flows (`npm run test:e2e`, `test:e2e:headless`).
- When changing code that has existing tests/specs, update or add corresponding Jest/Cypress coverage following existing tooling; do not introduce other test runners.

## 10. Forbidden Actions

- Do not switch to Next.js App Router or rewrite routing architecture.
- Do not replace Prisma or PostgreSQL with other ORMs/databases.
- Do not introduce new global state solutions outside React Context/Hooks already present.
- Do not modify AuthContext storage logic without aligning with current localStorage/token behavior.
- Do not invent components/hooks/contexts or APIs that are not grounded in the repository structure.
- Do not remove or bypass withAuth middleware patterns on protected API routes.

## 11. How to Modify Existing Code

1. Inspect current files to understand patterns before editing.
2. For UI changes, update components/ and relevant CSS Modules; keep props and hook usage consistent.
3. For state logic, extend hooks or contexts only if aligned with existing structure, ensuring `useAuth`/`useAvailability` remain single sources for auth and availability.
4. For data changes, edit prisma/schema.prisma, run migrations, and ensure affected API routes/components are updated.
5. Update tests matching the changed area (Jest for units, Cypress for flows).
6. Never overwrite user/local changes blindly; apply minimal diffs respecting current behavior.
7. Rerun necessary scripts/tests (`next dev`, `npm run test`, `npm run test:e2e`) to verify.

## 12. Anti-Hallucination Instructions for LLMs

- If a pattern, component, or API is not explicitly in the repository, assume it does not exist.
- Do not invent abstractions, folders, or libraries.
- When uncertain about behavior or requirements, request clarification instead of guessing.
- Base every change or rule on observed code; omit topics you cannot verify.
- Prefer silence over speculation—leave sections blank rather than fabricating details.
