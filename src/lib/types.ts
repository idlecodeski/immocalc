// TypeScript interfaces for ImmoCalc

export interface CalculatorInputs {
  // Szenario
  scenarioName: string;

  // Objektdaten
  kaufpreis: number;
  wohnflaeche: number; // optional, 0 = not set
  baujahr: number; // optional, 0 = not set

  // Kaufnebenkosten
  bundesland: string;
  grunderwerbsteuer: number; // %
  notarUndGrundbuch: number; // %, default 2.0
  makler: number; // %, default 3.57
  sonstigeKosten: number; // €, default 0

  // Finanzierung
  eigenkapital: number;
  darlehenszins: number; // % p.a.
  tilgung: number; // % p.a., default 2
  zinsbindung: number; // years, default 10
  sondertilgung: number; // €/year, default 0

  // Einnahmen
  kaltmiete: number; // €/month
  mietsteigerung: number; // % p.a., default 1.5

  // Ausgaben
  hausgeld: number; // €/month (non-recoverable portion)
  instandhaltung: number; // €/m²/year, default 10
  verwaltung: number; // €/month, default 30
  mietausfallrisiko: number; // %, default 2
}

export interface KaufnebenkostenBreakdown {
  grunderwerbsteuer: number; // €
  notarUndGrundbuch: number; // €
  makler: number; // €
  sonstigeKosten: number; // €
  gesamt: number; // €
}

export interface CalculationResults {
  // Kaufnebenkosten
  kaufnebenkosten: KaufnebenkostenBreakdown;

  // Key metrics
  gesamtkosten: number; // €
  darlehenssumme: number; // €
  eigenkapitalAnteil: number; // % of Gesamtkosten
  monatlicheKreditrate: number; // €
  bruttorendite: number; // %
  nettorendite: number; // %
  monatlicherCashflow: number; // €
  jaehrlicherCashflow: number; // €
  /** @deprecated use cashOnCashRendite */
  eigenkapitalrendite: number; // % (alias for cashOnCashRendite)
  cashOnCashRendite: number; // % — Jährlicher Cashflow / Eigenkapital × 100
  eigenkapitalrenditeInklTilgung: number; // % — (Cashflow + Tilgung Jahr 1) / Eigenkapital × 100
  mietfaktor: number; // Kaufpreis / Jahreskaltmiete
  kaufpreisProQm: number | null; // €/m²
  amortisationsdauer: number | null; // years

  // Amortization schedule
  tilgungsplan: TilgungsplanRow[];

  // Cashflow projection
  cashflowEntwicklung: CashflowRow[];
}

export interface TilgungsplanRow {
  jahr: number;
  restschuld: number; // remaining debt at year end
  zinsanteil: number; // interest paid this year
  tilgungsanteil: number; // principal repaid this year
  sondertilgung: number; // extra repayment this year
  annuitaet: number; // regular annual payment
}

export interface CashflowRow {
  jahr: number;
  kaltmiete: number; // monthly rent this year
  kreditrate: number; // monthly payment (decreasing interest)
  nebenkosten: number; // monthly costs (hausgeld + verwaltung + instandhaltung/12)
  mietausfall: number; // monthly vacancy cost
  cashflow: number; // monthly net cashflow
  cashflowJaehrlich: number; // annual
  kumulierterCashflow: number; // cumulative from year 1
}

export interface Scenario {
  id: string;
  name: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  inputs: CalculatorInputs;
}
