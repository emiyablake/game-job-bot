export type Relevance = 'high' | 'medium' | 'low';

export interface GameJob {
  hash: string;
  title: string;
  company: string;
  role: string;
  engines: string[];
  seniority: string;
  workMode: string;
  location: string;
  description: string;
  postedAt: Date;
  salary: string;
  tags: string[];
  url: string;
  source: string;
}
