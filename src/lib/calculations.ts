// All financial math as pure functions
import {
  CalculatorInputs,
  CalculationResults,
  KaufnebenkostenBreakdown,
  TilgungsplanRow,
  CashflowRow,
} from './types';

/**
 * Calculate Kaufnebenkosten (purchase side costs)
 */
export function calculateKaufnebenkosten(
  kaufpreis: number,
  grunderwerbsteuerPct: number,
  notarUndGrundbuchPct: number,
  maklerPct: number,
  sonstigeKosten: number
): KaufnebenkostenBreakdown {
  const grunderwerbsteuer = (kaufpreis * grunderwerbsteuerPct) / 100;
  const notarUndGrundbuch = (kaufpreis * notarUndGrundbuchPct) / 100;
  const makler = (kaufpreis * maklerPct) / 100;
  const gesamt = grunderwerbsteuer + notarUndGrundbuch + makler + sonstigeKosten;

  return {
    grunderwerbsteuer,
    notarUndGrundbuch,
    makler,
    sonstigeKosten,
    gesamt,
  };
}

/**
 * Standard annuity formula: monthly payment for a fixed-rate loan
 * P = principal, r = monthly interest rate, n = number of months
 * If r = 0, return P/n
 */
export function annuitaet(principal: number, annualInterestPct: number, annualRepaymentPct: number): number {
  if (principal <= 0) return 0;
  const annualRate = (annualInterestPct + annualRepaymentPct) / 100;
  return (principal * annualRate) / 12;
}

/**
 * Calculate monthly mortgage payment using proper annuity formula.
 * monthlyRate = annualInterestPct / 1200
 * n = number of months (used for proper PV/FV calculation if needed)
 * For simplicity (and standard German practice), we use the simple rate sum:
 * Annuität = Darlehen × (Zins% + Tilgung%) / 12
 * This is the standard "Annuitätendarlehen" calculation used in Germany.
 */
export function monatlicheKreditrate(darlehenssumme: number, zinsPct: number, tilgungPct: number): number {
  return annuitaet(darlehenssumme, zinsPct, tilgungPct);
}

/**
 * Build a year-by-year amortization schedule (Tilgungsplan).
 * The monthly payment (Annuität) stays fixed.
 * Interest portion decreases over time; repayment portion increases.
 * Sondertilgung is applied once per year (end of year).
 */
export function calculateTilgungsplan(
  darlehenssumme: number,
  zinsPct: number,
  tilgungPct: number,
  sondertilgungJahr: number,
  maxJahre: number = 50
): TilgungsplanRow[] {
  if (darlehenssumme <= 0) return [];

  const rows: TilgungsplanRow[] = [];
  const monatszins = zinsPct / 100 / 12;
  // Fixed monthly payment based on initial principal
  const monatlicheRate = annuitaet(darlehenssumme, zinsPct, tilgungPct);

  let restschuld = darlehenssumme;
  let jahr = 1;

  while (restschuld > 0.01 && jahr <= maxJahre) {
    let jahresZins = 0;
    let jahresTilgung = 0;
    let jahresAnnuitaet = 0;

    // Monthly calculations for this year
    for (let monat = 1; monat <= 12; monat++) {
      if (restschuld <= 0.01) break;

      const zinsAnteil = restschuld * monatszins;
      const tilgungsAnteil = Math.min(monatlicheRate - zinsAnteil, restschuld);

      jahresZins += zinsAnteil;
      jahresTilgung += tilgungsAnteil;
      jahresAnnuitaet += monatlicheRate;

      restschuld -= tilgungsAnteil;
    }

    // Apply Sondertilgung at year end
    const actualSondertilgung = Math.min(sondertilgungJahr, restschuld);
    restschuld -= actualSondertilgung;

    rows.push({
      jahr,
      restschuld: Math.max(0, restschuld),
      zinsanteil: jahresZins,
      tilgungsanteil: jahresTilgung,
      sondertilgung: actualSondertilgung,
      annuitaet: jahresAnnuitaet,
    });

    if (restschuld <= 0.01) break;
    jahr++;
  }

  return rows;
}

/**
 * Calculate year-by-year cashflow projection.
 * Rent increases annually by mietsteigerungPct.
 * Interest portion of loan payment decreases over time (from Tilgungsplan).
 * Fixed costs stay constant (simplified model).
 */
export function calculateCashflowEntwicklung(
  inputs: CalculatorInputs,
  tilgungsplan: TilgungsplanRow[],
  monatlicheRate: number,
  years: number = 20
): CashflowRow[] {
  const rows: CashflowRow[] = [];
  let kumulierterCashflow = 0;

  const instandhaltungMonatlich =
    inputs.wohnflaeche > 0
      ? (inputs.wohnflaeche * inputs.instandhaltung) / 12
      : inputs.instandhaltung / 12; // fallback: treat value as monthly if no area

  for (let i = 0; i < years; i++) {
    const jahr = i + 1;

    // Rent increases each year
    const kaltmieteMonatlich =
      inputs.kaltmiete * Math.pow(1 + inputs.mietsteigerung / 100, i);

    // After loan is paid off, no more credit payment
    const darlehensNochOffen = i < tilgungsplan.length;
    const kreditrateMonatlich = darlehensNochOffen ? monatlicheRate : 0;

    // Monthly non-recoverable costs
    const nebenkostenMonatlich =
      inputs.hausgeld + inputs.verwaltung + instandhaltungMonatlich;

    // Vacancy/rent loss
    const mietausfallMonatlich = (kaltmieteMonatlich * inputs.mietausfallrisiko) / 100;

    // Net monthly cashflow
    const cashflow =
      kaltmieteMonatlich -
      kreditrateMonatlich -
      nebenkostenMonatlich -
      mietausfallMonatlich;

    const cashflowJaehrlich = cashflow * 12;
    kumulierterCashflow += cashflowJaehrlich;

    rows.push({
      jahr,
      kaltmiete: kaltmieteMonatlich,
      kreditrate: kreditrateMonatlich,
      nebenkosten: nebenkostenMonatlich,
      mietausfall: mietausfallMonatlich,
      cashflow,
      cashflowJaehrlich,
      kumulierterCashflow,
    });
  }

  return rows;
}

/**
 * Calculate Amortisationsdauer: years until cumulative cashflow >= Eigenkapital
 */
function calculateAmortisationsdauer(
  eigenkapital: number,
  cashflowRows: CashflowRow[]
): number | null {
  if (eigenkapital <= 0) return null;

  for (const row of cashflowRows) {
    if (row.kumulierterCashflow >= eigenkapital) {
      return row.jahr;
    }
  }

  return null; // not reached within projection
}

/**
 * Main calculation function — takes all inputs, returns all results.
 */
export function calculate(inputs: CalculatorInputs): CalculationResults {
  // Kaufnebenkosten
  const kaufnebenkosten = calculateKaufnebenkosten(
    inputs.kaufpreis,
    inputs.grunderwerbsteuer,
    inputs.notarUndGrundbuch,
    inputs.makler,
    inputs.sonstigeKosten
  );

  // Gesamtkosten & Darlehenssumme
  const gesamtkosten = inputs.kaufpreis + kaufnebenkosten.gesamt;
  const darlehenssumme = Math.max(0, gesamtkosten - inputs.eigenkapital);
  const eigenkapitalAnteil = gesamtkosten > 0 ? (inputs.eigenkapital / gesamtkosten) * 100 : 0;

  // Monthly loan payment
  const monatlicheKreditrateBetrag = monatlicheKreditrate(
    darlehenssumme,
    inputs.darlehenszins,
    inputs.tilgung
  );

  // Annual rent
  const jahreskaltmiete = inputs.kaltmiete * 12;

  // Annual non-recoverable costs (for Nettorendite)
  const instandhaltungJaehrlich =
    inputs.wohnflaeche > 0
      ? inputs.wohnflaeche * inputs.instandhaltung
      : inputs.instandhaltung; // fallback
  const jahresausgaben =
    inputs.hausgeld * 12 +
    inputs.verwaltung * 12 +
    instandhaltungJaehrlich +
    (jahreskaltmiete * inputs.mietausfallrisiko) / 100;

  // Renditen
  const bruttorendite =
    inputs.kaufpreis > 0 ? (jahreskaltmiete / inputs.kaufpreis) * 100 : 0;
  const nettorendite =
    gesamtkosten > 0 ? ((jahreskaltmiete - jahresausgaben) / gesamtkosten) * 100 : 0;

  // Monthly cashflow
  const instandhaltungMonatlich =
    inputs.wohnflaeche > 0
      ? (inputs.wohnflaeche * inputs.instandhaltung) / 12
      : inputs.instandhaltung / 12;
  const mietausfallMonatlich = (inputs.kaltmiete * inputs.mietausfallrisiko) / 100;
  const monatlicherCashflow =
    inputs.kaltmiete -
    monatlicheKreditrateBetrag -
    inputs.hausgeld -
    inputs.verwaltung -
    instandhaltungMonatlich -
    mietausfallMonatlich;
  const jaehrlicherCashflow = monatlicherCashflow * 12;

  // Cash-on-Cash Rendite (Cashflow / EK)
  const cashOnCashRendite =
    inputs.eigenkapital > 0 ? (jaehrlicherCashflow / inputs.eigenkapital) * 100 : 0;

  // Mietfaktor
  const mietfaktor = jahreskaltmiete > 0 ? inputs.kaufpreis / jahreskaltmiete : 0;

  // Price per sqm
  const kaufpreisProQm =
    inputs.wohnflaeche > 0 ? inputs.kaufpreis / inputs.wohnflaeche : null;

  // Amortization schedule
  const tilgungsplan = calculateTilgungsplan(
    darlehenssumme,
    inputs.darlehenszins,
    inputs.tilgung,
    inputs.sondertilgung
  );

  // Eigenkapitalrendite inkl. Tilgung: (Cashflow + Tilgung Jahr 1) / EK × 100
  const tilgungJahr1 = tilgungsplan.length > 0 ? tilgungsplan[0].tilgungsanteil : 0;
  const eigenkapitalrenditeInklTilgung =
    inputs.eigenkapital > 0
      ? ((jaehrlicherCashflow + tilgungJahr1) / inputs.eigenkapital) * 100
      : 0;

  // Cashflow projection
  const cashflowEntwicklung = calculateCashflowEntwicklung(
    inputs,
    tilgungsplan,
    monatlicheKreditrateBetrag,
    30
  );

  // Amortisationsdauer
  const amortisationsdauer = calculateAmortisationsdauer(
    inputs.eigenkapital,
    cashflowEntwicklung
  );

  return {
    kaufnebenkosten,
    gesamtkosten,
    darlehenssumme,
    eigenkapitalAnteil,
    monatlicheKreditrate: monatlicheKreditrateBetrag,
    bruttorendite,
    nettorendite,
    monatlicherCashflow,
    jaehrlicherCashflow,
    eigenkapitalrendite: cashOnCashRendite, // alias for backward compat
    cashOnCashRendite,
    eigenkapitalrenditeInklTilgung,
    mietfaktor,
    kaufpreisProQm,
    amortisationsdauer,
    tilgungsplan,
    cashflowEntwicklung,
  };
}
