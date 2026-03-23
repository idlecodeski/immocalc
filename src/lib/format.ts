// German number/currency formatting helpers

const CURRENCY_FORMATTER = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const CURRENCY_FORMATTER_0 = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const NUMBER_FORMATTER_2 = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const NUMBER_FORMATTER_1 = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const NUMBER_FORMATTER_0 = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Format as € with 2 decimal places: 1.234,56 € */
export function formatCurrency(value: number): string {
  return CURRENCY_FORMATTER.format(value);
}

/** Format as € rounded to nearest euro: 1.234 € */
export function formatCurrencyRounded(value: number): string {
  return CURRENCY_FORMATTER_0.format(value);
}

/** Format as percentage with 2 decimal places: 3,57 % */
export function formatPercent(value: number): string {
  return NUMBER_FORMATTER_2.format(value) + '\u00a0%';
}

/** Format as percentage with 1 decimal place: 3,5 % */
export function formatPercent1(value: number): string {
  return NUMBER_FORMATTER_1.format(value) + '\u00a0%';
}

/** Format a plain number with 2 decimal places */
export function formatNumber2(value: number): string {
  return NUMBER_FORMATTER_2.format(value);
}

/** Format a plain number rounded to integer */
export function formatNumber0(value: number): string {
  return NUMBER_FORMATTER_0.format(value);
}

/** Format years: "10,5 Jahre" */
export function formatYears(value: number): string {
  if (value === Infinity || isNaN(value) || value < 0) return '—';
  return NUMBER_FORMATTER_1.format(value) + ' Jahre';
}

/** Format €/m²: "3.500,00 €/m²" */
export function formatCurrencyPerSqm(value: number): string {
  return CURRENCY_FORMATTER.format(value) + '/m²';
}

/** Parse a German-formatted number string to float */
export function parseGermanNumber(value: string): number {
  // Replace German thousand separator (.) and convert decimal comma to dot
  const cleaned = value.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
