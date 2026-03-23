'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ScenarioDialogProps {
  open: boolean;
  mode: 'save' | 'rename';
  initialName?: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export default function ScenarioDialog({
  open,
  mode,
  initialName = '',
  onConfirm,
  onCancel,
}: ScenarioDialogProps) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (open) setName(initialName);
  }, [open, initialName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onConfirm(name.trim());
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'save' ? 'Szenario speichern' : 'Szenario umbenennen'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-2">
            <Label htmlFor="scenario-name">Name</Label>
            <Input
              id="scenario-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Wohnung München – 20% EK"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {mode === 'save' ? 'Speichern' : 'Umbenennen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
