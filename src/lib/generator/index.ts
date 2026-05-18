import type { ProjectConfig } from '@stack-init/schema';
import { isZipStack, isCliStack } from '@stack-init/schema';
import { generateZip } from './zip';
import { generateYaml } from './yaml';

export async function generate(config: ProjectConfig): Promise<void> {
  if (isZipStack(config.stack)) {
    // ZIP stacks: stack-init.yaml is embedded inside the ZIP,
    // GETTING_STARTED.md is downloaded separately by generateZip.
    await generateZip(config);
    return;
  }

  // CLI-only stacks (e.g. laravel): download YAML + GETTING_STARTED separately
  generateYaml(config);
}
