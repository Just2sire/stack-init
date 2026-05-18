import type { ProjectConfig } from '@/types/schema';
import type { Preset } from '@/types/presets';

const STORAGE_KEY = 'stack-init:presets';

function readStorage(): Preset[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Preset[];
  } catch {
    return [];
  }
}

function writeStorage(presets: Preset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

export function loadPresets(): Preset[] {
  return readStorage();
}

export function savePreset(
  config: ProjectConfig,
  name: string,
  options?: { icon?: string; description?: string }
): Preset {
  const preset: Preset = {
    id: crypto.randomUUID(),
    name,
    description: options?.description,
    icon: options?.icon,
    createdAt: new Date().toISOString(),
    config,
  };
  const existing = readStorage();
  writeStorage([...existing, preset]);
  return preset;
}

export function deletePreset(id: string): void {
  const existing = readStorage().filter((p) => p.id !== id);
  writeStorage(existing);
}

export function exportPresetFile(preset: Preset): void {
  const blob = new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${preset.name.replace(/\s+/g, '-').toLowerCase()}.preset.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importPresetFile(file: File): Promise<Preset> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as Preset;
        if (!data.id || !data.name || !data.config) {
          reject(new Error('Invalid preset file format'));
          return;
        }
        const preset: Preset = { ...data, id: crypto.randomUUID() };
        const existing = readStorage();
        writeStorage([...existing, preset]);
        resolve(preset);
      } catch {
        reject(new Error('Failed to parse preset file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
