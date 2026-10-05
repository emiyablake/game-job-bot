import { jest } from '@jest/globals';
import { GreenhouseScraper } from '../src/scrapers/GreenhouseScraper.js';

const respostaGreenhouse = {
  jobs: [
    {
      id: 1,
      title: 'Junior Gameplay Programmer',
      location: { name: 'Remote' },
      absolute_url: 'https://boards.greenhouse.io/empresa/jobs/1',
      content: '<p>Trabalhe com &nbsp;<b>Unreal Engine</b></p>',
      updated_at: '2026-10-01T12:00:00Z',
      metadata: [{ name: 'department', value: 'Engineering' }],
    },
    {
      id: 2,
      title: 'Level Designer',
      location: { name: 'São Paulo' },
      absolute_url: 'https://boards.greenhouse.io/empresa/jobs/2',
    },
  ],
};

describe('GreenhouseScraper', () => {
  const fetchOriginal = global.fetch;

  afterEach(() => {
    global.fetch = fetchOriginal;
  });

  it('deve mapear as vagas da API para RawJob', async () => {
    global.fetch = jest.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => respostaGreenhouse,
    } as Response);

    const scraper = new GreenhouseScraper(['empresa']);
    const vagas = await scraper.scrape();

    expect(vagas).toHaveLength(2);
    expect(vagas[0]).toMatchObject({
      title: 'Junior Gameplay Programmer',
      company: 'empresa',
      location: 'Remote',
      source: 'greenhouse',
      url: 'https://boards.greenhouse.io/empresa/jobs/1',
    });
    expect(vagas[0]?.description).toBe('Trabalhe com Unreal Engine');
    expect(vagas[0]?.tags).toEqual(['Engineering']);
    expect(vagas[1]?.location).toBe('São Paulo');
  });

  it('deve consultar todos os boards configurados', async () => {
    const chamadas: string[] = [];
    global.fetch = jest.fn<typeof fetch>().mockImplementation((url) => {
      chamadas.push(String(url));
      return Promise.resolve({
        ok: true,
        json: async () => ({ jobs: [] }),
      } as Response);
    });

    const scraper = new GreenhouseScraper(['empresa-a', 'empresa-b']);
    await scraper.scrape();

    expect(chamadas).toHaveLength(2);
    expect(chamadas[0]).toContain('boards-api.greenhouse.io/v1/boards/empresa-a/jobs');
    expect(chamadas[1]).toContain('boards-api.greenhouse.io/v1/boards/empresa-b/jobs');
  });

  it('deve lançar erro quando a API retorna status de erro', async () => {
    global.fetch = jest.fn<typeof fetch>().mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const scraper = new GreenhouseScraper(['board-inexistente']);

    await expect(scraper.scrape()).rejects.toThrow('HTTP 404');
  });
});
