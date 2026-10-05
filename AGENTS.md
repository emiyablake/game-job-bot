# AGENTS.md — Game Job Bot

Guia para agentes de IA que trabalham neste repositório. O projeto é documentado em **português (Brasil)** — mantenha a linguagem das mensagens, logs, testes e documentação em português ao editar o código existente. Mas os commits devem ser escritos em inglês.

## Visão geral do projeto

O **Game Job Bot** é uma ferramenta (Node.js + TypeScript) para coletar, classificar e notificar vagas de emprego na área de desenvolvimento de jogos. O fluxo previsto: coletar vagas de plataformas como Greenhouse, Lever, WorkWithIndies, RemoteGameJobs e Itch.io, normalizar os dados, classificar a relevância conforme preferências do usuário, exportar resultados (JSON/CSV) e enviar um resumo por e-mail.

**Estado atual do código (importante):** o projeto está em estágio inicial. A arquitetura completa descrita no [PRD](docs/prd.md) (JobRunner, ScraperManager, scrapers, Normalizer, Validator, DuplicateDetector, StateManager, RelevanceService, writers) ainda **não está implementada** — o `package.json` aponta `dist/core/JobRunner.js` como entrypoint, mas esse código não existe. O que existe hoje:

- `src/services/EmailService.ts` — serviço de envio de e-mail via Nodemailer (único módulo de produção).
- `src/test-scraper.ts` — teste de conectividade que faz `fetch` em sites externos e grava `output/test-scraper-result.json`.
- `src/test-email.ts` — envia e-mail de teste usando conta sandbox do Ethereal Email.
- `src/index.ts` — script de verificação básica (arquivos, variáveis de ambiente) que orquestra os dois testes acima.

Leia o `docs/prd.md` antes de implementar novos módulos — ele é a especificação da arquitetura alvo.

## Stack tecnológica

- **Linguagem:** TypeScript 5.6, ESM (`"type": "module"`), módulos Node (`module: nodenext`).
- **Runtime:** Node.js 22 (também usado no CI).
- **Compilação:** `tsc` (saída em `dist/`, com source maps e declarações).
- **Execução direta de TS:** `tsx`.
- **Dependências de produção:** `dotenv`, `js-yaml` (leitura de `config/preferences.yaml`), `nodemailer`.
- **Testes:** Jest 29 + ts-jest (preset ESM), `@types/jest`.
- **Lint:** ESLint 9 com `@typescript-eslint` (flat config `eslint.config.js`; a legada `.eslintrc.js` foi removida).

## Comandos principais

```bash
npm install          # instalar dependências
npm run build        # compilar TypeScript (tsc)
npm test             # rodar testes Jest (usa --experimental-vm-modules por ESM)
npm run test:watch   # testes em modo watch
npm run lint         # eslint em src/ e tests/
npm run lint:fix     # eslint com --fix
npm run dev          # executar src/index.ts com tsx
npm run start        # node dist/core/JobRunner.js (entrypoint ainda não implementado)
```

`npm run collect` (`build && start`) está definido, mas só funcionará quando `src/core/JobRunner.ts` for criado.

## Organização de código

- `src/services/` — regras de negócio. Hoje contém apenas `EmailService.ts`; o PRD prevê Normalizer, Validator, DuplicateDetector, NewJobsDetector, RelevanceService, StateManager.
- `src/index.ts` — script de verificação de ambiente (não é a aplicação final).
- `src/models/` — contratos de domínio (`GameJob`, `UserPreferences`, tipo `Relevance`).
- `src/config/` — carregamento de configuração (`preferences.ts` lê o YAML de preferências).
- `src/test-*.ts` — scripts manuais de teste (e-mail e conectividade).
- `tests/` — testes Jest (`*.test.ts`), raiz configurada como `<rootDir>/tests`.
- `docs/prd.md` — PRD com pipeline, modelos de domínio e decisões de engenharia (referência arquitetural principal).
- `docs/specs/` — diretório de specs (vazio no momento).
- `config/preferences.yaml` — preferências do usuário (roles, engines, modalidade, nível, localização), carregado por `src/config/preferences.ts` (`loadPreferences()`).
- `.github/workflows/test.yml` — CI (ver seção abaixo).

A estrutura descrita no `readme.md` (`src/core`, `src/scrapers`, `src/writers`, etc.) é a **estrutura planejada**, não a real.

## Convenções de estilo

- TypeScript estrito: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `isolatedModules`.
- Imports de módulos locais usam sufixo `.js` (ex.: `import { EmailService } from './services/EmailService.js'`) — obrigatório por `moduleResolution: nodenext` + ESM.
- Tipos explícitos em retorno de funções e evitar `any` (ambos configurados como `warn` no ESLint); `no-unused-vars` é `error`.
- Mensagens de log/teste em português, com emojis (🎮, ✅, ⚠️, ❌) no padrão já usado.
- E-mails e relatórios agrupam vagas por relevância: `high` / `medium` / `low`.
- Domínio usa `relevance` (não `score`/`importance`).

## Testes

- Rodam com `npm test` (Jest ESM; o script já inclui `--experimental-vm-modules`, necessário pelo ts-jest ESM).
- `tests/EmailService.unit.test.ts` — teste unitário + envio real para sandbox Ethereal (rede externa; timeout de 30 s).
- `tests/EmailService.integration.test.ts` — teste de integração do EmailService.
- `tests/index.test.ts` — verifica `tsconfig.json`, `package.json` e `config/preferences.yaml`.
- `src/index.ts` executa verificações básicas e o teste de acesso externo (usa `fetch` nativo do Node 22, com `User-Agent` customizado `GameJobBot/1.0`), gravando resultado em `output/test-scraper-result.json`.

## CI/CD e deploy

- `.github/workflows/test.yml` — dispara em push/PR para `main`/`master` e manualmente (`workflow_dispatch`):
  1. `npm ci` + `npx tsc --noEmit`
  2. `npm run lint` (ESLint em `src/` e `tests/`)
  3. cria pastas `state/` e `output/`
  4. `npm test` (Jest)
  5. `npx tsx src/index.ts` (teste de acesso externo) com `STATE_PATH=./state/state.json` e `OUTPUT_DIR=./output`
  6. upload do artefato `output/test-scraper-result.json`
- O readme menciona um cron agendado em `.github/workflows/collect.yml`, mas esse arquivo **ainda não existe** — a execução agendada pelo GitHub Actions ainda não foi implementada.

## Segurança e configuração

- Nunca commitar segredos (senhas de SMTP, tokens). Use variáveis de ambiente via `dotenv` (`.env` está fora do versionamento).
- Variáveis de ambiente esperadas: `STATE_PATH`, `OUTPUT_DIR`, `GITHUB_TOKEN` (verificadas por `src/index.ts`), além das credenciais SMTP consumidas pelo `EmailService`.
- `.gitignore` cobre `node_modules`, `dist` e saídas; confirme antes de adicionar arquivos novos.
