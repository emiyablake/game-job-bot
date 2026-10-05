import type { RawJob } from '../models/RawJob.js';

export const USER_AGENT = 'Mozilla/5.0 (compatible; GameJobBot/1.0)';

export abstract class BaseScraper {
  abstract readonly source: string;

  abstract scrape(): Promise<RawJob[]>;

  protected async fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ao acessar ${url}`);
    }

    return (await response.json()) as T;
  }
}
