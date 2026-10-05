import type { GameJob, Relevance } from '../src/models/GameJob.js';
import type { UserPreferences } from '../src/models/UserPreferences.js';

describe('Modelos de domínio', () => {
  it('deve criar uma GameJob válida com todos os campos do PRD', () => {
    const job: GameJob = {
      hash: 'junior gameplay programmer|ubisoft|brasil',
      title: 'Junior Gameplay Programmer',
      company: 'Ubisoft',
      role: 'Gameplay Programmer',
      engines: ['Unreal Engine 5'],
      seniority: 'Junior',
      workMode: 'Remote',
      location: 'Brasil',
      description: 'Vaga de gameplay programmer júnior.',
      postedAt: new Date('2026-08-07'),
      salary: '',
      tags: ['gameplay', 'unreal'],
      url: 'https://example.com/job/1',
      source: 'greenhouse',
    };

    expect(job.title).toBe('Junior Gameplay Programmer');
    expect(job.engines).toContain('Unreal Engine 5');
    expect(job.postedAt).toBeInstanceOf(Date);
  });

  it('deve aceitar apenas os níveis de relevância definidos', () => {
    const niveis: Relevance[] = ['high', 'medium', 'low'];

    expect(niveis).toHaveLength(3);
  });

  it('deve criar UserPreferences com todas as listas de preferências', () => {
    const prefs: UserPreferences = {
      preferredRoles: ['Gameplay Programmer', 'Game Developer'],
      preferredEngines: ['Unreal', 'Unity', 'Godot'],
      preferredWorkModes: ['Remote', 'Hybrid'],
      preferredLevels: ['Junior', 'Pleno'],
      preferredLocations: ['Brasil', 'Canadá'],
    };

    expect(prefs.preferredRoles.length).toBeGreaterThan(0);
    expect(prefs.preferredEngines).toContain('Godot');
    expect(prefs.preferredLevels).toContain('Junior');
  });
});
