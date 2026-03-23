'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { CalculatorInputs, Scenario } from '@/lib/types';
import { DEFAULT_INPUTS } from '@/lib/constants';
import { calculate } from '@/lib/calculations';
import {
  loadScenarios,
  addScenario,
  updateScenario,
} from '@/lib/scenarios';

import CalculatorForm from '@/components/calculator/CalculatorForm';
import ResultsPanel from '@/components/calculator/ResultsPanel';
import CashflowChart from '@/components/calculator/CashflowChart';
import AmortizationChart from '@/components/calculator/AmortizationChart';
import ScenarioSidebar from '@/components/scenarios/ScenarioSidebar';
import ScenarioDialog from '@/components/scenarios/ScenarioDialog';

export default function Home() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setScenarios(loadScenarios());
  }, []);

  const results = useMemo(() => calculate(inputs), [inputs]);

  const handleInputChange = useCallback((updated: Partial<CalculatorInputs>) => {
    setInputs((prev) => ({ ...prev, ...updated }));
  }, []);

  const handleSave = () => setSaveDialogOpen(true);

  const handleSaveConfirm = (name: string) => {
    setSaveDialogOpen(false);
    const updatedInputs = { ...inputs, scenarioName: name };
    setInputs(updatedInputs);

    if (activeScenarioId) {
      const updated = updateScenario(activeScenarioId, updatedInputs);
      setScenarios(updated);
    } else {
      const updated = addScenario(updatedInputs);
      setScenarios(updated);
      const newScenario = updated[updated.length - 1];
      setActiveScenarioId(newScenario.id);
    }
  };

  const handleLoad = (scenario: Scenario) => {
    setInputs({ ...scenario.inputs });
    setActiveScenarioId(scenario.id);
    setSidebarOpen(false);
  };

  const handleScenariosChange = (updated: Scenario[]) => {
    setScenarios(updated);
    if (activeScenarioId && !updated.find((s) => s.id === activeScenarioId)) {
      setActiveScenarioId(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#fafafa]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 xl:w-72 border-r border-gray-200 bg-white flex-shrink-0 shadow-sm">
        <div className="w-full">
          <ScenarioSidebar
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            onScenariosChange={handleScenariosChange}
            onLoad={handleLoad}
            onSave={handleSave}
          />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 bg-white border-r border-gray-200 shadow-2xl h-full">
            <ScenarioSidebar
              scenarios={scenarios}
              activeScenarioId={activeScenarioId}
              onScenariosChange={handleScenariosChange}
              onLoad={handleLoad}
              onSave={handleSave}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white px-6 py-4 flex items-center gap-4 shrink-0">
          <button
            className="lg:hidden flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <span>☰</span>
            <span>Szenarien</span>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              ImmoCalc
            </h1>
          </div>

          {activeScenarioId && (
            <span className="text-sm text-gray-500 hidden sm:block">
              <span className="font-medium text-gray-700">{inputs.scenarioName}</span>
            </span>
          )}

          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
          >
            <span>Speichern</span>
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Input Form */}
              <div>
                <CalculatorForm inputs={inputs} onChange={handleInputChange} />
              </div>

              {/* Results */}
              <div className="space-y-4">
                <ResultsPanel results={results} inputs={inputs} />
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <CashflowChart data={results.cashflowEntwicklung} />
              <AmortizationChart data={results.tilgungsplan} />
            </div>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      <ScenarioDialog
        open={saveDialogOpen}
        mode="save"
        initialName={inputs.scenarioName}
        onConfirm={handleSaveConfirm}
        onCancel={() => setSaveDialogOpen(false)}
      />
    </div>
  );
}
