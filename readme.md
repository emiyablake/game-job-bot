# Game Job Bot

🎮 Bot automatizado para coletar e classificar vagas de emprego na área de desenvolvimento de jogos.

## O que faz

O **Game Job Bot** coleta vagas de diferentes plataformas (Greenhouse, Lever, WorkWithIndies, RemoteGameJobs, Itch.io), normaliza os dados, classifica a relevância conforme as preferências do usuário e envia um resumo por e-mail com as novas oportunidades encontradas.

## Como executar

### Execução agendada

O pipeline roda automaticamente via GitHub Actions conforme o cron configurado em `.github/workflows/collect.yml`.

### Execução manual

```bash
npm run collect
# ou
npm run start
```

Ambos executam o mesmo fluxo completo do pipeline.

## Estrutura do projeto

```
src/
  core/           # Orquestração (JobRunner)
  config/         # Configurações e preferências do usuário
  scrapers/       # Coletores de vagas por plataforma
  services/       # Regras de negócio (Normalizer, Validator, RelevanceService, etc.)
  state/          # Persistência de estado entre execuções
  writers/        # Exportação de dados (JSON, CSV)
  specifications/ # Regras de classificação de relevância
  models/         # Tipos e interfaces de domínio
  utils/          # Utilitários (Logger)
tests/
.github/          # Workflows do GitHub Actions
```

## Configuração

As preferências do usuário ficam centralizadas em `config/preferences.ts` (ou `preferences.yaml`):

```yaml
preferredRoles:
  - Gameplay Programmer
  - Game Developer

preferredEngines:
  - Unreal
  - Unity
  - Godot

preferredWorkModes:
  - Remote
  - Hybrid

preferredLevels:
  - Junior
  - Pleno

preferredLocations:
  - Brasil
  - Canadá
```

## Saídas

Ao final de cada execução são gerados:

- `output/jobs.json` — vagas classificadas em formato JSON
- `output/jobs.csv` — vagas em formato tabular
- E-mail resumido com as novas vagas encontradas

## Arquitetura

Para detalhes completos sobre pipeline, modelos de domínio, especificações, cache e decisões de engenharia, consulte o [PRD](docs/prd.md).

## Licença

MIT
