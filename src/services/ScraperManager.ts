import type { BaseScraper } from '../scrapers/BaseScraper.js';
import type { RawJob } from '../models/RawJob.js';
import { Logger } from '../utils/Logger.js';

export interface ScraperFailure {
  source: string;
  error: string;
}

export interface ScrapeResult {
  jobs: RawJob[];
  failures: ScraperFailure[];
}

export class ScraperManager {
  constructor(private readonly scrapers: BaseScraper[]) {}

  async collect(): Promise<ScrapeResult> {
    const jobs: RawJob[] = [];
    const failures: ScraperFailure[] = [];

    for (const scraper of this.scrapers) {
      try {
        Logger.info(`Coletando vagas da fonte: ${scraper.source}`);
        const vagas = await scraper.scrape();
        jobs.push(...vagas);
        Logger.success(`${vagas.length} vaga(s) coletada(s) de ${scraper.source}`);
      } catch (erro) {
        const mensagem = erro instanceof Error ? erro.message : String(erro);
        Logger.error(`Falha ao coletar de ${scraper.source}`, erro as Error);
        failures.push({ source: scraper.source, error: mensagem });
      }
    }

    return { jobs, failures };
  }
}
