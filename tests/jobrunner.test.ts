import { JobRunner } from '../src/core/JobRunner.js';
import type { PipelineStep } from '../src/core/JobRunner.js';

function stepMock(name: string, ordem: string[]): PipelineStep {
  return {
    name,
    run: async (): Promise<void> => {
      ordem.push(name);
    },
  };
}

describe('JobRunner', () => {
  it('deve executar as etapas em ordem sequencial', async () => {
    const ordem: string[] = [];
    const runner = new JobRunner([
      stepMock('EtapaA', ordem),
      stepMock('EtapaB', ordem),
      stepMock('EtapaC', ordem),
    ]);

    await runner.run();

    expect(ordem).toEqual(['EtapaA', 'EtapaB', 'EtapaC']);
  });

  it('deve interromper a execução (fail-fast) quando uma etapa falha', async () => {
    const ordem: string[] = [];
    const runner = new JobRunner([
      stepMock('EtapaA', ordem),
      {
        name: 'EtapaB',
        run: async (): Promise<void> => {
          ordem.push('EtapaB');
          throw new Error('falha simulada');
        },
      },
      stepMock('EtapaC', ordem),
    ]);

    await expect(runner.run()).rejects.toThrow('falha simulada');
    expect(ordem).toEqual(['EtapaA', 'EtapaB']);
  });

  it('deve compartilhar o contexto entre as etapas', async () => {
    const runner = new JobRunner([
      {
        name: 'Produz',
        run: async (context): Promise<void> => {
          context['jobs'] = ['vaga-1'];
        },
      },
      {
        name: 'Consome',
        run: async (context): Promise<void> => {
          expect(context['jobs']).toEqual(['vaga-1']);
        },
      },
    ]);

    await runner.run();
  });
});
