# PRD — Game Job Bot

## Objetivo

O **Game Job Bot** é uma ferramenta para automatizar a busca de vagas relacionadas ao desenvolvimento de jogos.

O sistema coleta vagas de diferentes plataformas, normaliza seus dados, classifica sua relevância conforme as preferências do usuário, remove duplicatas, gera arquivos de saída e envia um resumo por e-mail.

## Arquitetura

### Pipeline

```
GitHub Actions
      │
      ▼
JobRunner
      │
      ▼
ScraperManager
      │
      ▼
+-------------------------------+
| Scrapers                      |
|-------------------------------|
| Greenhouse                    |
| Lever                         |
| WorkWithIndies                |
| RemoteGameJobs                |
| Itch.io                       |
+-------------------------------+
      │
      ▼
Normalizer
      │
      ▼
Validator
      │
      ▼
DuplicateDetector
      │
      ▼
StateManager.load()
      │
      ▼
NewJobsDetector
      │
      ▼
RelevanceService
      │
      ▼
Export
   │          │
   ▼          ▼
JSON        CSV
      │
      ▼
EmailService
      │
      ▼
Email
      │
      ▼
StateManager.save()
```

## Fluxo de Execução

O sistema pode ser executado de duas maneiras.

### Execução Agendada

O GitHub Actions executa automaticamente o pipeline conforme o cron configurado.

Exemplo:

```yaml
on:
  schedule:
    - cron: "0 12 * * *"

  workflow_dispatch:
```

Fluxo:

```
GitHub Actions
        │
        ▼
JobRunner.run()
        │
        ▼
Carrega Preferences
        │
        ▼
Executa todos os Scrapers
        │
        ▼
Normaliza os dados
        │
        ▼
Valida as vagas
        │
        ▼
Remove duplicatas internas
        │
        ▼
Carrega estado anterior
        │
        ▼
Detecta novas vagas
        │
        ▼
Classifica relevância
        │
        ▼
Gera JSON
        │
        ▼
Gera CSV
        │
        ▼
Envia Email
        │
        ▼
Salva estado
```

### Execução Manual

Durante o desenvolvimento o pipeline pode ser executado manualmente.

```
npm run collect
```

ou

```
npm run start
```

Ambos executam exatamente o mesmo fluxo da execução agendada.

### Ordem de Execução

Toda a orquestração pertence ao `JobRunner`.

```text
JobRunner.run()

↓

ScraperManager.collect()

↓

Normalizer.normalize()

↓

Validator.validate()

↓

DuplicateDetector.remove()

↓

StateManager.load()

↓

NewJobsDetector.detect()

↓

RelevanceService.classify()

↓

JsonWriter.write()

↓

CsvWriter.write()

↓

EmailService.send()

↓

StateManager.save()
```

Cada etapa inicia apenas após a conclusão da etapa anterior.

Caso alguma etapa falhe, a execução é interrompida e o erro é registrado no log.

## Estrutura do Projeto

```
src/

core/
    JobRunner.ts

config/
    config.ts
    preferences.ts

scrapers/
    BaseScraper.ts
    GreenhouseScraper.ts
    LeverScraper.ts
    WorkWithIndiesScraper.ts
    RemoteGameJobsScraper.ts

services/
    ScraperManager.ts
    Normalizer.ts
    Validator.ts
    RelevanceService.ts
    DuplicateDetector.ts
    NewJobsDetector.ts
    EmailService.ts

state/
    StateManager.ts
    JobState.ts

writers/
    JsonWriter.ts
    CsvWriter.ts

specifications/
    Specification.ts
    RoleSpecification.ts
    EngineSpecification.ts
    SenioritySpecification.ts
    WorkModeSpecification.ts
    LocationSpecification.ts

models/
    GameJob.ts
    UserPreferences.ts

utils/
    Logger.ts

tests/

.github/
```

## Modelo de Domínio

Todo o pipeline trabalha sobre um único modelo.

```typescript
interface GameJob {

    hash: string;

    title: string;

    company: string;

    role: string;

    engines: string[];

    seniority: string;

    workMode: string;

    location: string;

    description: string;

    postedAt: Date;

    salary: string;

    tags: string[];

    url: string;

    source: string;

}
```

## Responsabilidades

| Componente | Responsabilidade |
|------------|------------------|
| JobRunner | Orquestrar toda a execução do pipeline |
| ScraperManager | Executar todos os scrapers registrados |
| BaseScraper | Definir o contrato comum entre todos os scrapers |
| Normalizer | Converter diferentes formatos para GameJob |
| Validator | Garantir que uma vaga possui os dados mínimos necessários |
| DuplicateDetector | Identificar e remover vagas duplicadas dentro do mesmo batch |
| StateManager | Carregar e salvar o estado entre execuções |
| NewJobsDetector | Comparar vagas atuais contra o estado anterior e retornar apenas as novas |
| RelevanceService | Classificar a vaga conforme as Specifications |
| JsonWriter | Exportar JSON |
| CsvWriter | Exportar CSV |
| EmailService | Gerar e enviar o e-mail |

## Specifications

A classificação das vagas utiliza o padrão **Specification**.

Cada Specification verifica apenas um critério.

```
GameJob
    │
    ▼
RoleSpecification
EngineSpecification
SenioritySpecification
WorkModeSpecification
LocationSpecification
    │
    ▼
RelevanceService
```

Contrato comum:

```typescript
interface Specification {

    isSatisfiedBy(job: GameJob): boolean;

}
```

## Relevância

O `RelevanceService` contabiliza quantas Specifications foram satisfeitas.

| Critérios atendidos | Classificação |
|--------------------|---------------|
| 4 ou 5 | 🟢 Muito relevante |
| 2 ou 3 | 🟡 Relevante |
| 0 ou 1 | ⚪ Pouco relevante |

## Preferências

As preferências do usuário ficam centralizadas em um único arquivo.

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

Cada Specification consulta essas preferências para verificar se a vaga atende ao critério.

---

## Saídas

Ao final do pipeline são gerados:

- JSON contendo todas as vagas classificadas.
- CSV contendo as vagas em formato tabular.
- E-mail resumido com as vagas encontradas.

---

## E-mail

O objetivo do e-mail é permitir uma leitura rápida.

```
🎮 Novas vagas encontradas

────────────────────────────

🟢 Muito relevantes (5)

1. Junior Gameplay Programmer
   Ubisoft | Unreal Engine 5
   https://...

2. Unity Developer
   Wildlife Studios | Unity
   https://...

────────────────────────────

🟡 Relevantes (8)

1. Gameplay Programmer
   Studio XYZ | Godot
   https://...

────────────────────────────

⚪ Pouco relevantes (12)

1. Engine Programmer
   Company ABC | Custom Engine
   https://...
```

---

## Cache e Estado entre Execuções

O pipeline utiliza um mecanismo de cache para persistir o estado entre execuções, permitindo que o bot identifique apenas as **novas vagas** desde a última coleta.

### Objetivo

- Evitar o re-processamento de vagas já vistas.
- Permitir que o e-mail de resumo contenha apenas vagas novas (diff).
- Manter um histórico de vagas monitoradas sem depender de servidor dedicado (VPS/VM/Worker).

### Estratégia: GitHub Cache

O estado é persistido utilizando a action nativa `actions/cache`. Esta abordagem foi escolhida por ser a ferramenta ideal para reutilização de dados entre execuções efêmeras: é rápida, não depende de actions de terceiros e não polui o histórico de commits do repositório.

### Pipeline com Estado

```
GitHub Actions
      │
      ▼
JobRunner
      │
      ▼
StateManager.load()  ← Restaura estado do cache
      │
      ▼
ScraperManager
      │
      ▼
Normalizer
      │
      ▼
Validator
      │
      ▼
DuplicateDetector.remove()  ← Remove duplicatas dentro do batch atual
      │
      ▼
NewJobsDetector.detect()  ← Remove vagas já vistas em execuções anteriores
      │
      ▼
RelevanceService
      │
      ▼
Export (JSON / CSV)
      │
      ▼
EmailService
      │
      ▼
Email (apenas vagas novas)
      │
      ▼
StateManager.save()  → Persiste estado no cache para a próxima execução
```

### Workflow do GitHub Actions

```yaml
on:
  schedule:
    - cron: "0 12 * * *"
  workflow_dispatch:

jobs:
  collect:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Restore previous state
        uses: actions/cache@v4
        with:
          path: ./state/state.json
          key: gamejob-state-${{ github.run_id }}
          restore-keys: |
            gamejob-state-

      - name: Run bot
        run: npm run collect
        env:
          STATE_PATH: ./state/state.json

      - name: Save state for next run
        uses: actions/cache@v4
        with:
          path: ./state/state.json
          key: gamejob-state-${{ github.run_id }}
```

### Modelo de Estado

```typescript
interface JobState {
    version: number;
    lastRunAt: string;
    seenHashes: string[];
    lastNewJobsCount: number;
}
```

| Campo | Descrição |
|-------|-----------|
| `version` | Versão do formato do estado. Permite evoluções futuras e migrações. |
| `lastRunAt` | Data/hora da última execução bem-sucedida (ISO 8601). |
| `seenHashes` | Lista de hashes das vagas já processadas em execuções anteriores. |
| `lastNewJobsCount` | Quantidade de novas vagas encontradas na última execução. |

### Hash de Identificação

O hash é calculado a partir de campos estáveis da vaga, tornando-o resistente a mudanças de URL (query parameters, tracking codes, etc.).

```typescript
function hash(job: GameJob): string {
    return `${job.title}|${job.company}|${job.location}`.toLowerCase();
}
```

### Responsabilidades

| Componente | Responsabilidade |
|------------|------------------|
| `StateManager` | Carregar e salvar o estado entre execuções. Conhece apenas o formato e o caminho do arquivo. |
| `NewJobsDetector` | Receber o estado carregado e a lista de vagas atuais, retornando apenas as que ainda não foram vistas. |
| `DuplicateDetector` | Remover duplicatas dentro da mesma execução (mesmo batch). |
| `EmailService` | Enviar e-mail apenas quando `newJobs.length > 0`. |

### E-mail com Diff

Com o estado persistente, o resumo por e-mail passa a conter apenas vagas novas desde a última execução:

```
🎮 Game Job Bot — 2026-08-07

🆕 3 novas vagas desde ontem

────────────────────────────

🟢 Muito relevantes (1)

1. Junior Gameplay Programmer
   Ubisoft | Unreal Engine 5 | Remoto
   https://...

────────────────────────────

📋 Total de vagas monitoradas: 47
```

---

## Tratamento de Erros

- Um scraper que falhar não interrompe os demais.
- Todas as exceções são registradas pelo Logger.
- O pipeline continua executando sempre que possível.
- O e-mail informa quais fontes falharam durante a coleta.

### Issues Automáticas para Falhas de Scrapers

Quando um scraper falha durante a coleta, o `ErrorReporter` abre automaticamente uma issue no repositório do projeto. Isso garante que falhas sejam rastreadas, priorizadas e corrigidas — especialmente quando sites de origem mudam de layout ou estrutura.

#### Comportamento

| Condição | Ação |
|----------|------|
| Scraper falha com exceção | `ErrorReporter` captura o erro e abre uma issue |
| Issue já existe para o mesmo scraper + erro | Não abre duplicata; adiciona comentário ou reabre se fechada |
| Pipeline continua | Demais scrapers executam normalmente |

#### Conteúdo da Issue

Cada issue gerada contém:

- **Título:** `[Scraper] Falha em {NomeDoScraper} — {data}`
- **Labels:** `bug`, `scraper`, `{nome-da-fonte}` (ex: `greenhouse`, `lever`)
- **Body:**
  - Nome do scraper que falhou
  - URL ou endpoint que estava sendo acessado
  - Stack trace completo
  - Timestamp da execução
  - Link para o run do GitHub Actions que gerou a falha
  - Sugestão de investigação (ex: "Verificar se o seletor CSS ainda é válido")

#### Exemplo de Issue

```markdown
## [Scraper] Falha em GreenhouseScraper — 2026-08-10

**Fonte:** Greenhouse
**Scraper:** `GreenhouseScraper.ts`
**URL:** https://boards.greenhouse.io/ubisoft
**Execução:** [Run #847](https://github.com/usuario/repo/actions/runs/123456789)

### Erro

```
Error: Element ".opening" not found
    at GreenhouseScraper.parse (/src/scrapers/GreenhouseScraper.ts:42:15)
```

### Possível causa

O seletor CSS `.opening` pode ter sido alterado no novo layout do Greenhouse.

### Próximos passos sugeridos

- [ ] Inspecionar o HTML da página manualmente
- [ ] Atualizar o seletor no scraper
- [ ] Adicionar teste com fixture atualizada
```

#### Implementação

O `ErrorReporter` utiliza a API do GitHub (`GITHUB_TOKEN`) para criar issues. O token já está disponível no runner do GitHub Actions.

```typescript
class ErrorReporter {
    async report(scraperName: string, error: Error, context: ScraperContext): Promise<void> {
        const title = `[Scraper] Falha em ${scraperName} — ${formatDate(new Date())}`;
        const body = this.buildIssueBody(scraperName, error, context);

        // Verifica se issue aberta para este scraper + erro já existe
        const existing = await this.findOpenIssue(title);
        if (existing) {
            await this.addComment(existing.number, `Reocorrência em ${context.runUrl}`);
            return;
        }

        await this.createIssue({ title, body, labels: ['bug', 'scraper'] });
    }
}
```

#### Pipeline com ErrorReporter

```
ScraperManager
      │
      ├── Scraper A → Sucesso
      ├── Scraper B → Falha → ErrorReporter.openIssue()
      └── Scraper C → Sucesso
      │
      ▼
Normalizer (recebe apenas resultados bem-sucedidos)
```

#### Workflow — Permissões Necessárias

O workflow precisa de permissão para criar issues:

```yaml
permissions:
  issues: write
  contents: read
```

---

## Princípios de Arquitetura

- Single Responsibility Principle (SRP)
- Open/Closed Principle (OCP)
- Specification Pattern
- Pipeline Pattern
- Alta coesão
- Baixo acoplamento
