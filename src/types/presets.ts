import type { ProjectConfig } from './schema';

export interface Preset {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  createdAt: string;
  config: ProjectConfig;
}
