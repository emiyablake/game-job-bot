import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

interface FetchResult {
  url: string;
  status: number;
  ok: boolean;
  contentLength: number;
  snippet: string;
  error?: string;
}

async function fetchSite(url: string): Promise<FetchResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GameJobBot/1.0)',
      },
    });

    const text = await response.text();
    const snippet = text
      .replace(/\s+/g, ' ')
      .slice(0, 500);

    return {
      url,
      status: response.status,
      ok: response.ok,
      contentLength: text.length,
      snippet,
    };
  } catch (err) {
    return {
      url,
      status: 0,
      ok: false,
      contentLength: 0,
      snippet: '',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function runExternalAccessTest(): Promise<void> {
  console.log('\n🌐 Teste de acesso a sites externos\n');

  const sites = [
    'https://workwithindies.com',
    'https://boards.greenhouse.io/ubisoft',
    'https://httpbin.org/get',
  ];

  const results: FetchResult[] = [];

  for (const url of sites) {
    console.log(`→ Buscando ${url}...`);
    const result = await fetchSite(url);
    results.push(result);

    if (result.ok) {
      console.log(`  ✅ ${result.status} | ${result.contentLength} bytes`);
      console.log(`  📄 ${result.snippet.slice(0, 200)}...\n`);
    } else {
      console.log(`  ❌ ${result.status} | ${result.error || 'Unknown error'}\n`);
    }
  }

  mkdirSync(resolve('./output'), { recursive: true });
  writeFileSync(
    resolve('./output/test-scraper-result.json'),
    JSON.stringify(results, null, 2),
  );

  const successCount = results.filter((r) => r.ok).length;
  console.log(`📊 ${successCount}/${results.length} sites acessados com sucesso`);

  if (successCount === 0) {
    throw new Error('Nenhum site acessado. Verifique conectividade.');
  }
}