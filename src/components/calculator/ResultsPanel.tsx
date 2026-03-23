'use client';

import { CalculationResults, CalculatorInputs } from '@/lib/types';
import {
  formatCurrency,
  formatCurrencyRounded,
  formatPercent,
  formatPercent1,
  formatNumber2,
  formatYears,
  formatCurrencyPerSqm,
} from '@/lib/format';

interface ResultsPanelProps {
  results: CalculationResults;
  inputs: CalculatorInputs;
}

interface MetricCardProps {
  label: string;
  value: string;
  tooltip?: string;
  color?: 'positive' | 'negative' | 'neutral' | 'blue';
  sub?: string;
  wide?: boolean;
}

function MetricCard({ label, value, tooltip, color = 'neutral', sub, wide }: MetricCardProps) {
  const valueColor =
    color === 'positive'
      ? 'text-green-600'
      : color === 'negative'
      ? 'text-red-600'
      : color === 'blue'
      ? 'text-blue-600'
      : 'text-gray-900';

  return (
    <div
      className={`bg-[#f8fafc] border border-gray-200 rounded-xl p-4 flex flex-col gap-1 ${wide ? 'col-span-2' : ''}`}
      title={tooltip}
    >
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-tight">{label}</span>
      <span className={`text-xl font-bold ${valueColor} leading-tight`}>{value}</span>
      {sub && <span className="text-xs text-gray-400 mt-0.5">{sub}</span>}
    </div>
  );
}

interface RowProps {
  label: string;
  value: string;
  indent?: boolean;
  bold?: boolean;
  color?: string;
  border?: boolean;
}

function TableRow({ label, value, indent, bold, color, border }: RowProps) {
  return (
    <div className={`flex justify-between items-baseline py-1.5 ${border ? 'border-t border-gray-200 mt-1 pt-2' : ''}`}>
      <span className={`text-sm ${indent ? 'pl-3 text-xs' : ''} ${bold ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
        {label}
      </span>
      <span className={`text-sm font-medium ${color || 'text-gray-800'} ${bold ? 'font-bold' : ''}`}>
        {value}
      </span>
    </div>
  );
}

export default function ResultsPanel({ results, inputs }: ResultsPanelProps) {
  const cashflowColor =
    results.monatlicherCashflow > 0 ? 'positive' : results.monatlicherCashflow < 0 ? 'negative' : 'neutral';

  const ekRenditeColor =
    results.cashOnCashRendite > 4 ? 'positive' : results.cashOnCashRendite < 0 ? 'negative' : 'neutral';

  const ekInklTilgungColor =
    results.eigenkapitalrenditeInklTilgung > 6
      ? 'positive'
      : results.eigenkapitalrenditeInklTilgung < 0
      ? 'negative'
      : 'neutral';

  const nettoColor =
    results.nettorendite > 3 ? 'positive' : results.nettorendite < 0 ? 'negative' : 'neutral';

  return (
    <div className="space-y-4">
      {/* Kaufübersicht */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Kaufübersicht</h3>
        </div>
        <div className="px-5 py-4 space-y-0.5">
          <TableRow label="Kaufpreis" value={formatCurrencyRounded(inputs.kaufpreis)} />
          <TableRow
            label={`Grunderwerbsteuer (${inputs.grunderwerbsteuer}%)`}
            value={formatCurrencyRounded(results.kaufnebenkosten.grunderwerbsteuer)}
            indent
          />
          <TableRow
            label="Notar & Grundbuch"
            value={formatCurrencyRounded(results.kaufnebenkosten.notarUndGrundbuch)}
            indent
          />
          <TableRow
            label={`Makler (${inputs.makler}%)`}
            value={formatCurrencyRounded(results.kaufnebenkosten.makler)}
            indent
          />
          {results.kaufnebenkosten.sonstigeKosten > 0 && (
            <TableRow
              label="Sonstige"
              value={formatCurrencyRounded(results.kaufnebenkosten.sonstigeKosten)}
              indent
            />
          )}
          <TableRow
            label="Nebenkosten gesamt"
            value={formatCurrencyRounded(results.kaufnebenkosten.gesamt)}
            indent
            bold
          />
          <TableRow
            label="Gesamtkosten"
            value={formatCurrencyRounded(results.gesamtkosten)}
            bold
            border
          />
          <TableRow
            label="Eigenkapital"
            value={`${formatCurrencyRounded(inputs.eigenkapital)} (${formatPercent1(results.eigenkapitalAnteil)})`}
            color="text-blue-600"
          />
          <TableRow
            label="Darlehenssumme"
            value={formatCurrencyRounded(results.darlehenssumme)}
            bold
          />
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Kennzahlen</h3>
        </div>
        <div className="px-5 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MetricCard
              label="Monatliche Kreditrate"
              value={formatCurrency(results.monatlicheKreditrate)}
              tooltip="Monatliche Annuitätenzahlung (Zins + Tilgung)"
            />
            <MetricCard
              label="Monatl. Cashflow"
              value={formatCurrency(results.monatlicherCashflow)}
              color={cashflowColor}
              tooltip="Einnahmen minus alle Ausgaben pro Monat"
              sub={`jährlich: ${formatCurrencyRounded(results.jaehrlicherCashflow)}`}
            />
            <MetricCard
              label="Bruttorendite"
              value={formatPercent(results.bruttorendite)}
              tooltip="Jahreskaltmiete / Kaufpreis × 100. Faustformel: > 5%"
            />
            <MetricCard
              label="Nettorendite"
              value={formatPercent(results.nettorendite)}
              color={nettoColor}
              tooltip="(Jahreskaltmiete - Jahresausgaben) / Gesamtkosten × 100. Gut: > 3%"
            />
            <MetricCard
              label="Mietfaktor"
              value={`${formatNumber2(results.mietfaktor)}x`}
              tooltip="Kaufpreis / Jahreskaltmiete. Je niedriger, desto besser. Gut: < 20x"
            />
            {results.kaufpreisProQm !== null && (
              <MetricCard
                label="Kaufpreis/m²"
                value={formatCurrencyPerSqm(results.kaufpreisProQm)}
                tooltip="Kaufpreis pro Quadratmeter Wohnfläche"
              />
            )}
            <MetricCard
              label="Amortisation"
              value={results.amortisationsdauer !== null ? formatYears(results.amortisationsdauer) : '> 30 Jahre'}
              tooltip="Bis kumulierter Cashflow das Eigenkapital übersteigt"
            />
          </div>
        </div>
      </div>

      {/* Eigenkapitalrendite — Highlight Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Eigenkapitalrendite</h3>
        </div>
        <div className="px-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MetricCard
              label="Cash-on-Cash Rendite"
              value={formatPercent(results.cashOnCashRendite)}
              color={ekRenditeColor}
              tooltip="Jährlicher Cashflow / Eigenkapital × 100. Reiner Cashflow ohne Tilgungsanteil. Gut: > 4%"
              sub="nur Cashflow"
            />
            <MetricCard
              label="Eigenkapitalrendite (inkl. Tilgung)"
              value={formatPercent(results.eigenkapitalrenditeInklTilgung)}
              color={ekInklTilgungColor}
              tooltip="(Cashflow + Tilgungsanteil Jahr 1) / Eigenkapital × 100. Berücksichtigt Vermögensaufbau. Gut: > 6%"
              sub="inkl. Vermögensaufbau"
            />
          </div>
        </div>
      </div>

      {/* Tilgungsplan */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Tilgungsplan</h3>
        </div>
        <div className="px-5 py-4">
          {results.tilgungsplan.length === 0 ? (
            <p className="text-sm text-gray-500">Kein Darlehen erforderlich.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left pb-2 pr-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Jahr</th>
                    <th className="text-right pb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Restschuld</th>
                    <th className="text-right pb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Zinsen</th>
                    <th className="text-right pb-2 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tilgung</th>
                    {inputs.sondertilgung > 0 && (
                      <th className="text-right pb-2 pl-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sonder&shy;tilgung</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {results.tilgungsplan.map((row) => (
                    <tr key={row.jahr} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-2 pr-2 text-gray-700 font-medium">{row.jahr}</td>
                      <td className="text-right py-2 px-2 font-medium text-gray-800">
                        {row.restschuld < 1 ? '—' : formatCurrencyRounded(row.restschuld)}
                      </td>
                      <td className="text-right py-2 px-2 text-red-500">
                        {formatCurrencyRounded(row.zinsanteil)}
                      </td>
                      <td className="text-right py-2 px-2 text-blue-600">
                        {formatCurrencyRounded(row.tilgungsanteil)}
                      </td>
                      {inputs.sondertilgung > 0 && (
                        <td className="text-right py-2 pl-2 text-gray-600">
                          {row.sondertilgung > 0 ? formatCurrencyRounded(row.sondertilgung) : '—'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
