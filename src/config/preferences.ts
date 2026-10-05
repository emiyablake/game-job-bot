import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import type { UserPreferences } from '../models/UserPreferences.js';

export function loadPreferences(path: string = 'config/preferences.yaml'): UserPreferences {
  const content = readFileSync(path, 'utf-8');
  const preferences = load(content) as Partial<UserPreferences>;

  const camposObrigatorios: (keyof UserPreferences)[] = [
    'preferredRoles',
    'preferredEngines',
    'preferredWorkModes',
    'preferredLevels',
    'preferredLocations',
  ];

  for (const campo of camposObrigatorios) {
    if (!Array.isArray(preferences[campo])) {
      throw new Error(`⚠️ Preferência ausente ou inválida no arquivo: ${campo}`);
    }
  }

  return preferences as UserPreferences;
}
