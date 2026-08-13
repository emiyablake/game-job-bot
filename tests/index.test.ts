import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Ambiente básico', () => {
  it('deve encontrar o tsconfig.json', () => {
    const tsconfig = readFileSync(resolve('./tsconfig.json'), 'utf-8');
    const parsed = JSON.parse(tsconfig);
    expect(parsed.compilerOptions.module).toBe('nodenext');
  });

  it('deve encontrar o package.json com o nome correto', () => {
    const pkg = readFileSync(resolve('./package.json'), 'utf-8');
    const parsed = JSON.parse(pkg);
    expect(parsed.name).toBe('game-job-bot');
  });

  it('deve encontrar o preferences.yaml', () => {
    const prefs = readFileSync(resolve('./config/preferences.yaml'), 'utf-8');
    expect(prefs).toContain('preferredRoles');
  });
});