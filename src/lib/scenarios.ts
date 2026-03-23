// localStorage CRUD for scenarios
import { Scenario, CalculatorInputs } from './types';
import { LOCALSTORAGE_KEY } from './constants';

function generateId(): string {
  return `scenario_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function loadScenarios(): Scenario[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Scenario[];
  } catch {
    return [];
  }
}

export function saveScenarios(scenarios: Scenario[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(scenarios));
  } catch {
    console.error('Failed to save scenarios to localStorage');
  }
}

export function createScenario(name: string, inputs: CalculatorInputs): Scenario {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name,
    createdAt: now,
    updatedAt: now,
    inputs: { ...inputs },
  };
}

export function addScenario(inputs: CalculatorInputs): Scenario[] {
  const scenarios = loadScenarios();
  const scenario = createScenario(inputs.scenarioName || 'Neues Szenario', inputs);
  const updated = [...scenarios, scenario];
  saveScenarios(updated);
  return updated;
}

export function updateScenario(id: string, inputs: CalculatorInputs): Scenario[] {
  const scenarios = loadScenarios();
  const updated = scenarios.map((s) =>
    s.id === id
      ? {
          ...s,
          name: inputs.scenarioName || s.name,
          updatedAt: new Date().toISOString(),
          inputs: { ...inputs },
        }
      : s
  );
  saveScenarios(updated);
  return updated;
}

export function renameScenario(id: string, name: string): Scenario[] {
  const scenarios = loadScenarios();
  const updated = scenarios.map((s) =>
    s.id === id ? { ...s, name, updatedAt: new Date().toISOString() } : s
  );
  saveScenarios(updated);
  return updated;
}

export function deleteScenario(id: string): Scenario[] {
  const scenarios = loadScenarios();
  const updated = scenarios.filter((s) => s.id !== id);
  saveScenarios(updated);
  return updated;
}

export function duplicateScenario(id: string): Scenario[] {
  const scenarios = loadScenarios();
  const source = scenarios.find((s) => s.id === id);
  if (!source) return scenarios;

  const now = new Date().toISOString();
  const copy: Scenario = {
    ...source,
    id: generateId(),
    name: `${source.name} (Kopie)`,
    createdAt: now,
    updatedAt: now,
    inputs: { ...source.inputs, scenarioName: `${source.name} (Kopie)` },
  };

  const updated = [...scenarios, copy];
  saveScenarios(updated);
  return updated;
}

export function exportScenariosJson(scenarios: Scenario[]): void {
  if (!isClient()) return;
  const json = JSON.stringify(scenarios, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `immocalc-szenarien-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importScenariosJson(jsonString: string): Scenario[] | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) return null;
    // Basic validation
    const valid = parsed.every(
      (s) =>
        typeof s.id === 'string' &&
        typeof s.name === 'string' &&
        typeof s.inputs === 'object'
    );
    if (!valid) return null;
    return parsed as Scenario[];
  } catch {
    return null;
  }
}
