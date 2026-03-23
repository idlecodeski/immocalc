import { CalculatorInputs } from './types';

// Grunderwerbsteuer by Bundesland (2026)
export const BUNDESLAND_STEUER: Record<string, number> = {
  'Bayern': 3.5,
  'Baden-Württemberg': 5.0,
  'Berlin': 6.0,
  'Brandenburg': 6.5,
  'Bremen': 5.0,
  'Hamburg': 5.5,
  'Hessen': 6.0,
  'Mecklenburg-Vorpommern': 6.0,
  'Niedersachsen': 5.0,
  'Nordrhein-Westfalen': 6.5,
  'Rheinland-Pfalz': 5.0,
  'Saarland': 6.5,
  'Sachsen': 3.5,
  'Sachsen-Anhalt': 5.0,
  'Schleswig-Holstein': 6.5,
  'Thüringen': 5.0,
};

export const BUNDESLAENDER = Object.keys(BUNDESLAND_STEUER);

export const DEFAULT_BUNDESLAND = 'Bayern';

export const DEFAULT_INPUTS: CalculatorInputs = {
  scenarioName: 'Neues Szenario',

  // Objektdaten
  kaufpreis: 300000,
  wohnflaeche: 0,
  baujahr: 0,

  // Kaufnebenkosten
  bundesland: DEFAULT_BUNDESLAND,
  grunderwerbsteuer: BUNDESLAND_STEUER[DEFAULT_BUNDESLAND],
  notarUndGrundbuch: 2.0,
  makler: 3.57,
  sonstigeKosten: 0,

  // Finanzierung
  eigenkapital: 60000,
  darlehenszins: 3.5,
  tilgung: 2.0,
  zinsbindung: 10,
  sondertilgung: 0,

  // Einnahmen
  kaltmiete: 1000,
  mietsteigerung: 1.5,

  // Ausgaben
  hausgeld: 200,
  instandhaltung: 10,
  verwaltung: 30,
  mietausfallrisiko: 2.0,
};

export const LOCALSTORAGE_KEY = 'immocalc_scenarios';
