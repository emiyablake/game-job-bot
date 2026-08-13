import { readFileSync } from 'fs';
import { resolve } from 'path';
import { runExternalAccessTest } from './test-scraper.js';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

function checkFile(path: string, description: string): TestResult {
  try {
    readFileSync(resolve(path), 'utf-8');
    return { name: description, passed: true, message: 'Arquivo encontrado' };
  } catch {
    return { name: description, passed: false, message: `Arquivo não encontrado: ${path}` };
  }
}

async function runBasicTests(): Promise<void> {
  console.log('🎮 Game Job Bot — Teste de fluxo básico\n');
  console.log(`Node version: ${process.version}`);
  console.log(`Working directory: ${process.cwd()}\n`);

  const results: TestResult[] = [];

  results.push(checkFile('./tsconfig.json', 'tsconfig.json'));
  results.push(checkFile('./package.json', 'package.json'));
  results.push(checkFile('./config/preferences.yaml', 'config/preferences.yaml'));

  const envVars = ['STATE_PATH', 'OUTPUT_DIR', 'GITHUB_TOKEN'];
  envVars.forEach((key) => {
    const value = process.env[key];
    results.push({
      name: `Env: ${key}`,
      passed: !!value,
      message: value ? 'Definido' : 'Não definido',
    });
  });

  console.log('--- Resultados ---');
  let passed = 0;
  let failed = 0;

  for (const r of results) {
    const icon = r.passed ? '✅' : '⚠️';
    console.log(`${icon} ${r.name}: ${r.message}`);
    if (r.passed) passed++; else failed++;
  }

  console.log(`\n📊 ${passed} passaram, ${failed} falharam`);

  if (failed > 0) {
    console.log('\n⚠️ Alguns testes básicos falharam.');
  } else {
    console.log('\n✅ Todos os testes básicos passaram!');
  }
}

async function main(): Promise<void> {
  try {
    await runBasicTests();
    await runExternalAccessTest();

    console.log('\n🎉 Pipeline de teste concluído com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('\n💥 Pipeline falhou:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

main();