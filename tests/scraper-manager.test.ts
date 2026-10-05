import { ScraperManager } from '../src/services/ScraperManager.js';
import { BaseScraper } from '../src/scrapers/BaseScraper.js';
import type { RawJob } from '../src/models/RawJob.js';

class ScraperOk extends BaseScraper {
  readonly source = 'fonte-ok';

  constructor(private readonly vagas: RawJob[]) {
    super();
  }

  async scrape(): Promise<RawJob[]> {
    return this.vagas;
  }
}

class ScraperFalho extends BaseScraper {
  readonly source = 'fonte-falha';

  async scrape(): Promise<RawJob[]> {
    throw new Error('erro de conexão simulado');
  }
}

const vagaExemplo: RawJob = {
  title: 'Junior Gameplay Programmer',
  company: 'Ubisoft',
  location: 'Remote',
  description: 'Vaga de teste',
  url: 'https://example.com/job/1',
  source: 'fonte-ok',
};

describe('ScraperManager', () => {
  it('deve coletar vagas de todos os scrapers registrados', async () => {
    const manager = new ScraperManager([
      new ScraperOk([vagaExemplo]),
      new ScraperOk([{ ...vagaExemplo, title: 'Level Designer' }]),
    ]);

    const resultado = await manager.collect();

    expect(resultado.jobs).toHaveLength(2);
    expect(resultado.failures).toHaveLength(0);
  });

  it('não deve interromper os demais scrapers quando um falha', async () => {
    const manager = new ScraperManager([
      new ScraperOk([vagaExemplo]),
      new ScraperFalho(),
      new ScraperOk([{ ...vagaExemplo, title: 'UI Artist' }]),
    ]);

    const resultado = await manager.collect();

    expect(resultado.jobs).toHaveLength(2);
    expect(resultado.jobs.map((j) => j.title)).toEqual([
      'Junior Gameplay Programmer',
      'UI Artist',
    ]);
  });

  it('deve registrar a falha com fonte e mensagem de erro', async () => {
    const manager = new ScraperManager([new ScraperFalho()]);

    const resultado = await manager.collect();

    expect(resultado.jobs).toHaveLength(0);
    expect(resultado.failures).toEqual([
      { source: 'fonte-falha', error: 'erro de conexão simulado' },
    ]);
  });
});
