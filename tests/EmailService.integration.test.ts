import { createTestAccount, getTestMessageUrl } from 'nodemailer';
import { EmailService } from '../src/services/EmailService.js';

describe('EmailService — Integração (Ethereal)', () => {
  it('deve enviar e-mail real via servidor Ethereal', async () => {
    // Cria conta temporária no Ethereal
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
      {
        title: 'Senior Gameplay Programmer',
        company: 'Naughty Dog',
        engines: ['Unreal Engine 5'],
        location: 'Santa Monica, CA',
        url: 'https://example.com/job/1',
        relevance: 'high' as const,
      },
      {
        title: 'Junior Unity Developer',
        company: 'Indie Studio',
        engines: ['Unity'],
        location: 'Remoto',
        url: 'https://example.com/job/2',
        relevance: 'medium' as const,
      },
    ];

    const info = await service.send(jobs, ['ItchIoScraper: 503']);

    // Verifica que o e-mail foi aceito pelo servidor
    expect(info.messageId).toBeDefined();
    expect(info.accepted).toContain('test@example.com');

    // Gera URL de preview (opcional — útil para debug manual)
    const previewUrl = getTestMessageUrl(info);
    console.log('🌐 Preview do e-mail:', previewUrl);
  }, 30000); // timeout de 30s para criação da conta Ethereal
});