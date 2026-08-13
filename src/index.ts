import { readFileSync } from 'fs';
import { resolve } from 'path';

function main(): void {
  console.log('🎮 Game Job Bot — Teste de fluxo básico');
  console.log(`Node version: ${process.version}`);
  console.log(`Working directory: ${process.cwd()}`);

  const prefsPath = resolve('./config/preferences.yaml');
  try {
    const content = readFileSync(prefsPath, 'utf-8');
    console.log('✅ preferences.yaml encontrado');
    console.log('--- Conteúdo (primeiras 5 linhas) ---');
    console.log(content.split('\n').slice(0, 5).join('\n'));
  } catch {
    console.log('⚠️  preferences.yaml não encontrado em', prefsPath);
  }

  const envVars = ['STATE_PATH', 'OUTPUT_DIR', 'GITHUB_TOKEN'];
  envVars.forEach((key) => {
    const value = process.env[key];
    console.log(`${value ? '✅' : '⚠️'}  ${key}: ${value ? 'definido' : 'não definido'}`);
  });

  console.log('\n✅ Fluxo básico executado com sucesso!');
  process.exit(0);
}

main();