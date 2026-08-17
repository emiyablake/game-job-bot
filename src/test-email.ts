import { createTestAccount, getTestMessageUrl } from 'nodemailer';
import { EmailService } from './services/EmailService.js';

async function main(): Promise<void> {
  console.log('📧 Teste de envio de e-mail\n');

  // Cria conta temporária no Ethereal Email (sandbox gratuito)
  console.log('→ Criando conta temporária no Ethereal Email...');
  const testAccount = await createTestAccount();
  console.log(`  ✅ Conta criada: ${testAccount.user}`);

  // Configura o EmailService com a conta de teste
  const emailService = new EmailService({
    host: 'smtp.ethereal.email',
    port: 587,
    user: testAccount.user,
    pass: testAccount.pass,
    from: 'bot@gamejobbot.com',
    to: 'usuario@exemplo.com',
  });

  // Dados de teste (vagas fictícias)
  const testJobs = [
    {
      title: 'Junior Gameplay Programmer',
      company: 'Ubisoft',
      engines: ['Unreal Engine 5'],
      location: 'Remoto',
      url: 'https://example.com/job/1',
      relevance: 'high' as const,
    },
    {
      title: 'Unity Developer',
      company: 'Wildlife Studios',
      engines: ['Unity'],
      location: 'São Paulo, Brasil',
      url: 'https://example.com/job/2',
      relevance: 'medium' as const,
    },
    {
      title: 'Game Designer',
      company: 'Indie Studio',
      engines: ['Godot'],
      location: 'Remoto',
      url: 'https://example.com/job/3',
      relevance: 'low' as const,
    },
  ];

  const failedSources: string[] = ['GreenhouseScraper: Timeout'];

  console.log('→ Enviando e-mail de teste...');
  const info = await emailService.send(testJobs, failedSources);

  console.log(`  ✅ E-mail enviado! MessageId: ${info.messageId}`);
  console.log('');

  // URL de preview do e-mail (você pode clicar e ver como ficou)
  const previewUrl = getTestMessageUrl(info);
  console.log('🌐 Preview do e-mail:');
  console.log(`   ${previewUrl}`);
  console.log('');
  console.log('   ↑ Clique no link acima para ver o e-mail renderizado!');
  console.log('   (O link expira em algumas horas)');
  console.log('');
  console.log('✅ Teste de e-mail concluído com sucesso!');
}

main().catch((err) => {
  console.error('💥 Erro ao enviar e-mail:', err);
  process.exit(1);
});