import { createTransport } from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { SentMessageInfo } from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  to: string;
}

interface ClassifiedJob {
  title: string;
  company: string;
  engines: string[];
  location: string;
  url: string;
  relevance: 'high' | 'medium' | 'low';
}

export class EmailService {
  private transporter: Transporter;
  private from: string;
  private to: string;

  constructor(config: EmailConfig) {
    this.transporter = createTransport({
      host: config.host,
      port: config.port,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
    this.from = config.from;
    this.to = config.to;
  }

  async send(jobs: ClassifiedJob[], failedSources: string[]): Promise<SentMessageInfo> {
    const subject = `🎮 Game Job Bot — ${jobs.length} novas vagas`;
    const body = this.buildBody(jobs, failedSources);

    const info = await this.transporter.sendMail({
      from: this.from,
      to: this.to,
      subject,
      text: body,
    });

    return info;
  }

  private buildBody(jobs: ClassifiedJob[], failedSources: string[]): string {
    const lines: string[] = [];
    lines.push('🎮 Game Job Bot');
    lines.push('');
    lines.push(`🆕 ${jobs.length} novas vagas encontradas`);
    lines.push('');
    lines.push('────────────────────────────');
    lines.push('');

    const high = jobs.filter((j) => j.relevance === 'high');
    const medium = jobs.filter((j) => j.relevance === 'medium');
    const low = jobs.filter((j) => j.relevance === 'low');

    if (high.length > 0) {
      lines.push(`🟢 Muito relevantes (${high.length})`);
      lines.push('');
      high.forEach((job, i) => {
        lines.push(`${i + 1}. ${job.title}`);
        lines.push(`   ${job.company} | ${job.engines.join(', ') || 'N/A'}`);
        lines.push(`   ${job.location}`);
        lines.push(`   ${job.url}`);
        lines.push('');
      });
      lines.push('────────────────────────────');
      lines.push('');
    }

    if (medium.length > 0) {
      lines.push(`🟡 Relevantes (${medium.length})`);
      lines.push('');
      medium.forEach((job, i) => {
        lines.push(`${i + 1}. ${job.title}`);
        lines.push(`   ${job.company} | ${job.engines.join(', ') || 'N/A'}`);
        lines.push(`   ${job.url}`);
        lines.push('');
      });
      lines.push('────────────────────────────');
      lines.push('');
    }

    if (low.length > 0) {
      lines.push(`⚪ Pouco relevantes (${low.length})`);
      lines.push('');
      low.forEach((job, i) => {
        lines.push(`${i + 1}. ${job.title}`);
        lines.push(`   ${job.company}`);
        lines.push(`   ${job.url}`);
        lines.push('');
      });
      lines.push('────────────────────────────');
      lines.push('');
    }

    if (failedSources.length > 0) {
      lines.push('⚠️ Fontes com falha na coleta:');
      failedSources.forEach((s) => lines.push(`  • ${s}`));
      lines.push('');
    }

    return lines.join('\n');
  }
}