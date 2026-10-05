import { resolve } from 'path';
import { loadPreferences } from '../src/config/preferences.js';

describe('Config — Preferences', () => {
  it('deve carregar as preferências do arquivo YAML padrão', () => {
    const prefs = loadPreferences();

    expect(prefs.preferredRoles.length).toBeGreaterThan(0);
    expect(prefs.preferredEngines).toContain('Godot');
    expect(prefs.preferredWorkModes).toContain('Remote');
    expect(prefs.preferredLevels).toContain('Junior');
    expect(prefs.preferredLocations).toContain('Brasil');
  });

  it('deve carregar preferências de um caminho customizado', () => {
    const prefs = loadPreferences(resolve('config/preferences.yaml'));

    expect(prefs.preferredRoles).toContain('Gameplay Programmer');
  });

  it('deve lançar erro quando uma preferência obrigatória está ausente', () => {
    expect(() => loadPreferences(resolve('tests/fixtures/preferences-invalid.yaml'))).toThrow();
  });
});
