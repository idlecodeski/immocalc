'use client';

import { CalculatorInputs } from '@/lib/types';
import { BUNDESLAENDER, BUNDESLAND_STEUER } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CalculatorFormProps {
  inputs: CalculatorInputs;
  onChange: (updated: Partial<CalculatorInputs>) => void;
}

interface FieldProps {
  label: string;
  id: string;
  value: number | string;
  onChange: (val: string) => void;
  suffix?: string;
  placeholder?: string;
  type?: string;
  min?: number;
  step?: number;
  tooltip?: string;
}

function Field({ label, id, value, onChange, suffix, placeholder, type = 'number', min, step, tooltip }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        title={tooltip}
        className="block text-sm font-medium text-gray-700 cursor-help"
      >
        {label}
        {tooltip && <span className="ml-1 text-gray-400 text-xs">ℹ</span>}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type={type}
          value={value === 0 && type === 'number' ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          step={step ?? (type === 'number' ? 'any' : undefined)}
          className="flex-1 h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder-gray-400 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            hover:border-gray-300 transition-colors"
          style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
        />
        {suffix && (
          <span className="text-sm text-gray-500 whitespace-nowrap shrink-0">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function numVal(val: string): number {
  const n = parseFloat(val.replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  );
}

export default function CalculatorForm({ inputs, onChange }: CalculatorFormProps) {
  return (
    <div className="space-y-4">
      {/* Szenario */}
      <Section title="Szenario">
        <Field
          label="Name"
          id="scenarioName"
          type="text"
          value={inputs.scenarioName}
          onChange={(v) => onChange({ scenarioName: v })}
          placeholder="z.B. Wohnung München – 20% EK"
        />
      </Section>

      {/* Objektdaten */}
      <Section title="Objektdaten">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Kaufpreis"
            id="kaufpreis"
            value={inputs.kaufpreis || ''}
            onChange={(v) => onChange({ kaufpreis: numVal(v) })}
            suffix="€"
            placeholder="300.000"
            min={0}
            tooltip="Kaufpreis der Immobilie ohne Nebenkosten"
          />
          <Field
            label="Wohnfläche (optional)"
            id="wohnflaeche"
            value={inputs.wohnflaeche || ''}
            onChange={(v) => onChange({ wohnflaeche: numVal(v) })}
            suffix="m²"
            placeholder="75"
            min={0}
            tooltip="Wohnfläche für Preis/m² und Instandhaltungsberechnung"
          />
          <Field
            label="Baujahr (optional)"
            id="baujahr"
            value={inputs.baujahr || ''}
            onChange={(v) => onChange({ baujahr: numVal(v) })}
            placeholder="1990"
            min={1800}
            step={1}
            tooltip="Baujahr der Immobilie"
          />
        </div>
      </Section>

      {/* Kaufnebenkosten */}
      <Section title="Kaufnebenkosten">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="bundesland" className="block text-sm font-medium text-gray-700">
              Bundesland
            </label>
            <Select
              value={inputs.bundesland}
              onValueChange={(v: string | null) => {
                if (!v) return;
                onChange({
                  bundesland: v,
                  grunderwerbsteuer: BUNDESLAND_STEUER[v] ?? inputs.grunderwerbsteuer,
                });
              }}
            >
              <SelectTrigger
                id="bundesland"
                className="border-gray-200 bg-white text-gray-900 focus:ring-blue-500"
                style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                {BUNDESLAENDER.map((land) => (
                  <SelectItem key={land} value={land}>
                    {land} ({BUNDESLAND_STEUER[land]}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Grunderwerbsteuer"
              id="grunderwerbsteuer"
              value={inputs.grunderwerbsteuer}
              onChange={(v) => onChange({ grunderwerbsteuer: numVal(v) })}
              suffix="%"
              min={0}
              step={0.1}
              tooltip="Steuer auf den Kaufpreis, abhängig vom Bundesland"
            />
            <Field
              label="Notar & Grundbuch"
              id="notarUndGrundbuch"
              value={inputs.notarUndGrundbuch}
              onChange={(v) => onChange({ notarUndGrundbuch: numVal(v) })}
              suffix="%"
              min={0}
              step={0.1}
              tooltip="Notar- und Grundbuchgebühren, ca. 2% des Kaufpreises"
            />
            <Field
              label="Maklergebühr"
              id="makler"
              value={inputs.makler}
              onChange={(v) => onChange({ makler: numVal(v) })}
              suffix="%"
              min={0}
              step={0.01}
              tooltip="Maklerprovision inkl. MwSt (Käuferseite), typisch 3,57%"
            />
            <Field
              label="Sonstige Kosten"
              id="sonstigeKosten"
              value={inputs.sonstigeKosten || ''}
              onChange={(v) => onChange({ sonstigeKosten: numVal(v) })}
              suffix="€"
              min={0}
              placeholder="0"
              tooltip="Weitere Kaufnebenkosten (z.B. Gutachten)"
            />
          </div>
        </div>
      </Section>

      {/* Finanzierung */}
      <Section title="Finanzierung">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Eigenkapital"
            id="eigenkapital"
            value={inputs.eigenkapital || ''}
            onChange={(v) => onChange({ eigenkapital: numVal(v) })}
            suffix="€"
            placeholder="60.000"
            min={0}
            tooltip="Eingesetztes Eigenkapital inkl. Nebenkosten"
          />
          <Field
            label="Darlehenszins"
            id="darlehenszins"
            value={inputs.darlehenszins}
            onChange={(v) => onChange({ darlehenszins: numVal(v) })}
            suffix="% p.a."
            min={0}
            step={0.01}
            tooltip="Nominalzins des Darlehens pro Jahr"
          />
          <Field
            label="Anfangstilgung"
            id="tilgung"
            value={inputs.tilgung}
            onChange={(v) => onChange({ tilgung: numVal(v) })}
            suffix="% p.a."
            min={0.1}
            step={0.1}
            tooltip="Anfänglicher Tilgungssatz pro Jahr, min. 1%"
          />
          <Field
            label="Zinsbindung"
            id="zinsbindung"
            value={inputs.zinsbindung}
            onChange={(v) => onChange({ zinsbindung: numVal(v) })}
            suffix="Jahre"
            min={1}
            step={1}
            tooltip="Festschreibungsdauer des Zinssatzes"
          />
          <Field
            label="Sondertilgung"
            id="sondertilgung"
            value={inputs.sondertilgung || ''}
            onChange={(v) => onChange({ sondertilgung: numVal(v) })}
            suffix="€/Jahr"
            min={0}
            placeholder="0"
            tooltip="Jährliche Sondertilgung zur schnelleren Entschuldung"
          />
        </div>
      </Section>

      {/* Einnahmen */}
      <Section title="Einnahmen">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Kaltmiete"
            id="kaltmiete"
            value={inputs.kaltmiete || ''}
            onChange={(v) => onChange({ kaltmiete: numVal(v) })}
            suffix="€/Monat"
            placeholder="1.000"
            min={0}
            tooltip="Monatliche Nettokaltmiete ohne Nebenkosten"
          />
          <Field
            label="Mietsteigerung"
            id="mietsteigerung"
            value={inputs.mietsteigerung}
            onChange={(v) => onChange({ mietsteigerung: numVal(v) })}
            suffix="% p.a."
            min={0}
            step={0.1}
            tooltip="Erwartete jährliche Mietsteigerung"
          />
        </div>
      </Section>

      {/* Ausgaben */}
      <Section title="Ausgaben">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Hausgeld (nicht umlegbar)"
            id="hausgeld"
            value={inputs.hausgeld || ''}
            onChange={(v) => onChange({ hausgeld: numVal(v) })}
            suffix="€/Monat"
            placeholder="200"
            min={0}
            tooltip="Der auf den Eigentümer entfallende Anteil des Hausgeldes, der nicht auf den Mieter umgelegt werden kann"
          />
          <Field
            label="Instandhaltungsrücklage"
            id="instandhaltung"
            value={inputs.instandhaltung}
            onChange={(v) => onChange({ instandhaltung: numVal(v) })}
            suffix="€/m²/Jahr"
            min={0}
            step={0.5}
            tooltip="Rücklagenansatz für Reparaturen, empfohlen 10–15 €/m²/Jahr"
          />
          <Field
            label="Verwaltungskosten"
            id="verwaltung"
            value={inputs.verwaltung}
            onChange={(v) => onChange({ verwaltung: numVal(v) })}
            suffix="€/Monat"
            min={0}
            step={1}
            tooltip="Kosten für die Miet- oder Sondereigentumsverwaltung"
          />
          <Field
            label="Mietausfallrisiko"
            id="mietausfallrisiko"
            value={inputs.mietausfallrisiko}
            onChange={(v) => onChange({ mietausfallrisiko: numVal(v) })}
            suffix="%"
            min={0}
            step={0.5}
            tooltip="Kalkulierter Leerstand und Mietausfall in % der Jahreskaltmiete"
          />
        </div>
      </Section>
    </div>
  );
}
