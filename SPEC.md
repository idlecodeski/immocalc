# ImmoCalc — Immobilien Investment Rechner

## Overview
A German-language web app for calculating the profitability and cash flow of residential real estate investments (apartments/condos). Users input property details and the app computes key financial metrics. Users can save, name, and reload calculation scenarios.

## Tech Stack
- **Next.js 14+** (App Router, TypeScript)
- **Tailwind CSS + shadcn/ui** (already installed)
- **Recharts** for charts (already installed)
- **localStorage** for saving scenarios (no backend)
- **Language**: German UI, English code

## Pages / Routes
- `/` — Main calculator page (single-page app with sidebar for saved scenarios)

## Input Fields

### 1. Szenario-Name (Scenario Name)
- Text input, e.g. "Wohnung München – 20% EK"

### 2. Objektdaten (Property Data)
- `kaufpreis` (Purchase Price, €) — required
- `wohnflaeche` (Living Area, m²) — optional, used for per-m² calculations
- `baujahr` (Year Built) — optional, used for AfA rate

### 3. Kaufnebenkosten (Purchase Costs, broken down)
- `grunderwerbsteuer` (Real Estate Transfer Tax, %) — default by Bundesland dropdown:
  - Bayern: 3.5%, Baden-Württemberg: 5%, Berlin: 6%, Brandenburg: 6.5%, Bremen: 5%, Hamburg: 5.5%, Hessen: 6%, Mecklenburg-Vorpommern: 6%, Niedersachsen: 5%, NRW: 6.5%, Rheinland-Pfalz: 5%, Saarland: 6.5%, Sachsen: 3.5%, Sachsen-Anhalt: 5%, Schleswig-Holstein: 6.5%, Thüringen: 5% (2026 — 7.5% planned, use 5% for now)
- `notarUndGrundbuch` (Notary & Land Registry, %) — default 2.0%
- `makler` (Broker Fee, %) — default 3.57% (inkl. MwSt, buyer side)
- `sonstigeKosten` (Other Costs, €) — default 0

### 4. Finanzierung (Financing)
- `eigenkapital` (Equity, €) — required. Show as % of total cost automatically
- `darlehenszins` (Loan Interest Rate, % p.a.) — required
- `tilgung` (Repayment Rate, % p.a.) — required, default 2%
- `zinsbindung` (Fixed Interest Period, years) — default 10
- `sondertilgung` (Special Repayment, €/year) — default 0

### 5. Einnahmen (Income)
- `kaltmiete` (Monthly Net Rent, €) — required
- `mietsteigerung` (Annual Rent Increase, %) — default 1.5%

### 6. Ausgaben (Expenses)
- `hausgeld` (Monthly Condo Fee, €) — the portion NOT recoverable from tenant
- `instandhaltung` (Maintenance Reserve, €/m²/year) — default 10 €/m²
- `verwaltung` (Management Fee, €/month) — default 30
- `mietausfallrisiko` (Vacancy Risk, %) — default 2%

## Computed Outputs (display prominently)

### Key Metrics Card
1. **Gesamtkosten** (Total Cost) = Kaufpreis + all Kaufnebenkosten
2. **Darlehenssumme** (Loan Amount) = Gesamtkosten - Eigenkapital
3. **Monatliche Kreditrate** (Monthly Loan Payment) = Darlehenssumme × (Zins + Tilgung) / 12
4. **Bruttorendite** = (Jahreskaltmiete / Kaufpreis) × 100
5. **Nettorendite** = ((Jahreskaltmiete - Jahresausgaben) / Gesamtkosten) × 100
6. **Monatlicher Cashflow** = Kaltmiete - Kreditrate - Hausgeld - Verwaltung - (Instandhaltung/12) - (Mietausfallrisiko × Kaltmiete)
7. **Jährlicher Cashflow** = Monatlicher Cashflow × 12
8. **Eigenkapitalrendite** (Cash-on-Cash Return) = Jährlicher Cashflow / Eigenkapital × 100
9. **Mietfaktor** (Price-to-Rent Ratio) = Kaufpreis / Jahreskaltmiete
10. **Kaufpreis pro m²** = Kaufpreis / Wohnfläche (if provided)
11. **Amortisationsdauer** (Payback Period in years) — years until cumulative cashflow equals Eigenkapital

### Tilgungsplan (Amortization Schedule) — Table + Chart
- Year-by-year for the full loan term: Restschuld, Zinsanteil, Tilgungsanteil, Sondertilgung
- Show when loan is fully repaid

### Cashflow-Entwicklung (Cash Flow Over Time) — Chart
- Year-by-year Cashflow considering Mietsteigerung and decreasing interest portion
- Line chart via Recharts

## Scenario Management (Core Feature)
- **Save**: Store current inputs + computed results to localStorage with a user-given name
- **Load**: List saved scenarios in a sidebar, click to load
- **Rename**: Inline rename
- **Delete**: With confirmation
- **Duplicate**: Copy a scenario with " (Kopie)" suffix
- **Export/Import**: Download all scenarios as JSON, upload JSON to restore
- Data structure: `{ id: string, name: string, createdAt: string, updatedAt: string, inputs: {...} }`

## UI/UX Requirements
- **German language** throughout (labels, tooltips, results)
- **Single page** — no page navigation needed
- **Left sidebar**: Saved scenarios list
- **Main area**: Input form (top) → Results (bottom)
- **Responsive**: Works on mobile (sidebar becomes a sheet/drawer)
- **Number formatting**: German locale (1.234,56 €)
- **Instant calculation**: Results update live as user types (no submit button)
- **Color coding**: Green for positive cashflow, red for negative
- **Tooltips**: Brief explanation for each metric (what it means, what's a good value)

## File Structure
```
src/
  app/
    layout.tsx
    page.tsx
    globals.css
  components/
    calculator/
      CalculatorForm.tsx      — all input fields
      ResultsPanel.tsx        — key metrics display
      AmortizationChart.tsx   — Tilgungsplan chart
      CashflowChart.tsx       — Cashflow over time
    scenarios/
      ScenarioSidebar.tsx     — list + management
      ScenarioDialog.tsx      — save/rename dialog
    ui/                       — shadcn components (already here)
  lib/
    calculations.ts           — all financial math (pure functions, well-tested)
    types.ts                  — TypeScript interfaces
    scenarios.ts              — localStorage CRUD
    constants.ts              — Bundesland tax rates, defaults
    format.ts                 — number/currency formatting helpers
```

## Implementation Priority
Build Phase 1 (MVP) now:
1. Types & constants
2. Calculation engine (pure functions)
3. Input form with all fields
4. Results display with all metrics
5. Scenario save/load/delete/rename
6. Responsive layout
7. German number formatting
8. Amortization table (simple table, chart can come in Phase 2)

## Important Notes
- All calculations must be financially correct. Use standard annuity loan formulas.
- Eigenkapitalrendite should account for the leverage effect properly.
- The amortization schedule must account for Sondertilgung.
- Format all currency as € with German locale (Intl.NumberFormat).
- No backend, no auth, no database. Pure client-side app.
