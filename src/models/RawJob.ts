export interface RawJob {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  source: string;
  postedAt?: string | undefined;
  salary?: string | undefined;
  tags?: string[] | undefined;
}
