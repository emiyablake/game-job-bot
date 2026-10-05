import { pathToFileURL } from 'url';
import { Logger } from '../utils/Logger.js';

export interface PipelineContext {
  [chave: string]: unknown;
}

export interface PipelineStep {
  readonly name: string;
  run(context: PipelineContext): Promise<void>;
}

export class JobRunner {
  private readonly steps: PipelineStep[];

  constructor(steps: PipelineStep[]) {
    this.steps = steps;
  }

  async run(): Promise<void> {
    const context: PipelineContext = {};
    Logger.info('Iniciando pipeline do Game Job Bot');

    for (const step of this.steps) {
      Logger.info(`Executando etapa: ${step.name}`);
      try {
        await step.run(context);
        Logger.success(`Etapa concluída: ${step.name}`);
      } catch (erro) {
        Logger.error(`Falha na etapa: ${step.name}`, erro as Error);
        throw erro;
      }
    }

    Logger.success('Pipeline finalizado com sucesso');
  }
}

function stub(name: string): PipelineStep {
  return {
    name,
    run: async (): Promise<void> => {
      Logger.warn(`Etapa "${name}" ainda não implementada — seguindo em frente`);
    },
  };
}

export function createDefaultPipeline(): PipelineStep[] {
  return [
    stub('CarregarPreferencias'),
    stub('ScraperManager.collect'),
    stub('Normalizer.normalize'),
    stub('Validator.validate'),
    stub('DuplicateDetector.remove'),
    stub('StateManager.load'),
    stub('NewJobsDetector.detect'),
    stub('RelevanceService.classify'),
    stub('JsonWriter.write'),
    stub('CsvWriter.write'),
    stub('EmailService.send'),
    stub('StateManager.save'),
  ];
}

const entrypoint = process.argv[1] ? pathToFileURL(process.argv[1]).href : null;
if (import.meta.url === entrypoint) {
  const runner = new JobRunner(createDefaultPipeline());
  runner.run().catch(() => process.exit(1));
}
