import { jest } from '@jest/globals';
import { EmailService } from '../src/services/EmailService.js';

describe('EmailService — Unitário', () => {
  it('deve instanciar com configuração válida', () => {
    const config = {
      host: 'smtp.ethereal.email',
      port: 587,
      user: 'test',
      pass: 'test',
      from: 'bot@test.com',
      to: 'user@test.com',
    };

    const service = new EmailService(config);
    expect(service).toBeDefined();
  });

  it('deve enviar e-mail com vagas agrupadas por relevância', async () => {
    const { createTestAccount } = await import('nodemailer');
    const testAccount = await createTestAccount();

    const service = new EmailService({
      host: 'smtp.ethereal.email',
      port: 587,
      user: testAccount.user,
      pass: testAccount.pass,
      from: 'bot@gamejobbot.com',
      to: 'test@example.com',
    });

    const jobs = [
      { title: 'Prog A', company: 'Corp A', engines: ['Unity'], location: 'BR', url: 'https://a.com', relevance: 'high' as const },
      { title: 'Prog B', company: 'Corp B', engines: ['Unreal'], location: 'CA', url: 'https://b.com', relevance: 'medium' as const },
      { title: 'Prog C', company: 'Corp C', engines: [], location: 'US', url: 'https://c.com', relevance: 'low' as const },
    ];

    const info = await service.send(jobs, ['GreenhouseScraper: Timeout']);

    expect(info.messageId).toBeDefined();
    expect(info.accepted).toContain('test@example.com');
  }, 30000);
});