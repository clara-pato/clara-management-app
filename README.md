# Clara Management App

Das konsolidierte Kontrollzentrum für PATO.

- **URL:** [http://localhost:3001](http://localhost:3001)
- **Features:**
    - **/ (Home):** Das Kanban-Board zur Aufgabenverwaltung.
    - **/dashboard:** Das Retro-Dashboard mit Status und KPIs.
- **Backend-Logik:** Beinhaltet nun auch die Sync-Services (`clara-sync`, `local-sync`), die vorher separat in `work-management` lagen.
- **Tech Stack:** Next.js, TypeScript, Tailwind, Supabase.

### Entwicklung
Starten mit `npm run dev -- -p 3001`.
