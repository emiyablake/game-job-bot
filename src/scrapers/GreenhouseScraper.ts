import { BaseScraper } from './BaseScraper.js';
import type { RawJob } from '../models/RawJob.js';

interface GreenhouseJob {
  id: number;
  title: string;
  location: { name: string };
  absolute_url: string;
  content?: string;
  updated_at?: string;
  metadata?: { name: string; value: string }[];
}

interface GreenhouseResponse {
  jobs: GreenhouseJob[];
}

export class GreenhouseScraper extends BaseScraper {
  readonly source = 'greenhouse';

  constructor(private readonly boards: string[]) {
    super();
  }

  async scrape(): Promise<RawJob[]> {
    const vagas: RawJob[] = [];

    for (const board of this.boards) {
      const url = `https://boards-api.greenhouse.io/v1/boards/${board}/jobs?content=true`;
      const data = await this.fetchJson<GreenhouseResponse>(url);

      for (const job of data.jobs ?? []) {
        vagas.push({
          title: job.title,
          company: board,
          location: job.location?.name ?? '',
          description: this.stripHtml(job.content ?? ''),
          url: job.absolute_url,
          source: this.source,
          postedAt: job.updated_at,
          tags: (job.metadata ?? []).map((m) => m.value),
        });
      }
    }

    return vagas;
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
