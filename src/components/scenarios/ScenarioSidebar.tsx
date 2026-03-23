'use client';

import { useState, useRef } from 'react';
import { Scenario } from '@/lib/types';
import {
  deleteScenario,
  duplicateScenario,
  renameScenario,
  exportScenariosJson,
  importScenariosJson,
  saveScenarios,
} from '@/lib/scenarios';
import ScenarioDialog from './ScenarioDialog';

interface ScenarioSidebarProps {
  scenarios: Scenario[];
  activeScenarioId: string | null;
  onScenariosChange: (scenarios: Scenario[]) => void;
  onLoad: (scenario: Scenario) => void;
  onSave: () => void;
}

export default function ScenarioSidebar({
  scenarios,
  activeScenarioId,
  onScenariosChange,
  onLoad,
  onSave,
}: ScenarioSidebarProps) {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Scenario | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRename = (scenario: Scenario) => {
    setRenameTarget(scenario);
    setRenameDialogOpen(true);
  };

  const handleRenameConfirm = (name: string) => {
    if (!renameTarget) return;
    const updated = renameScenario(renameTarget.id, name);
    onScenariosChange(updated);
    setRenameDialogOpen(false);
    setRenameTarget(null);
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      const updated = deleteScenario(id);
      onScenariosChange(updated);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  const handleDuplicate = (id: string) => {
    const updated = duplicateScenario(id);
    onScenariosChange(updated);
  };

  const handleExport = () => {
    exportScenariosJson(scenarios);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const imported = importScenariosJson(text);
      if (imported) {
        saveScenarios(imported);
        onScenariosChange(imported);
      } else {
        alert('Ungültige Datei. Bitte eine gültige ImmoCalc JSON-Datei importieren.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <aside className="flex flex-col h-full bg-white" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Header */}
      <div className="px-5 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Szenarien</span>
          <span className="text-xs text-gray-400">{scenarios.length}</span>
        </div>
        <button
          onClick={onSave}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <span>+ Szenario speichern</span>
        </button>
      </div>

      {/* Scenario List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {scenarios.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-400">Noch keine Szenarien gespeichert.</p>
            <p className="text-xs text-gray-300 mt-1">Berechnung ausführen und speichern.</p>
          </div>
        ) : (
          scenarios.map((scenario) => {
            const isActive = scenario.id === activeScenarioId;
            return (
              <div
                key={scenario.id}
                className={`rounded-lg border p-3 transition-all ${
                  isActive
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <button
                  className="w-full text-left mb-2"
                  onClick={() => onLoad(scenario)}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-tight truncate ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>
                        {scenario.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(scenario.updatedAt).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    {isActive && (
                      <span className="text-xs bg-blue-100 text-blue-600 font-medium px-1.5 py-0.5 rounded shrink-0">
                        aktiv
                      </span>
                    )}
                  </div>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleRename(scenario)}
                    className="text-xs text-gray-400 hover:text-gray-700 px-1.5 py-1 rounded hover:bg-gray-100 transition-colors"
                    title="Umbenennen"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDuplicate(scenario.id)}
                    className="text-xs text-gray-400 hover:text-gray-700 px-1.5 py-1 rounded hover:bg-gray-100 transition-colors"
                    title="Duplizieren"
                  >
                    📋
                  </button>
                  <button
                    onClick={() => handleDelete(scenario.id)}
                    className={`text-xs px-1.5 py-1 rounded transition-colors ${
                      deleteConfirm === scenario.id
                        ? 'text-red-600 bg-red-50 font-bold'
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                    title={deleteConfirm === scenario.id ? 'Nochmal klicken zum Löschen' : 'Löschen'}
                  >
                    {deleteConfirm === scenario.id ? '⚠️' : '🗑️'}
                  </button>
                  {deleteConfirm === scenario.id && (
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="text-xs text-gray-400 hover:text-gray-700 px-1.5 py-1 rounded hover:bg-gray-100 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer: Export / Import */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex gap-2">
          <button
            className="flex-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleExport}
            disabled={scenarios.length === 0}
            title="Alle Szenarien als JSON exportieren"
          >
            ↓ Export
          </button>
          <button
            className="flex-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            title="Szenarien aus JSON importieren"
          >
            ↑ Import
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleImport}
        />
      </div>

      <ScenarioDialog
        open={renameDialogOpen}
        mode="rename"
        initialName={renameTarget?.name ?? ''}
        onConfirm={handleRenameConfirm}
        onCancel={() => setRenameDialogOpen(false)}
      />
    </aside>
  );
}
