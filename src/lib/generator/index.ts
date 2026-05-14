import type { ProjectConfig } from '@stack-init/schema';
import { isZipStack, isCliStack } from '@stack-init/schema';
import { generateZip } from './zip';
import { generateYaml } from './yaml';

export async function generate(config: ProjectConfig): Promise<void> {
  if (isZipStack(config.stack) && !isCliStack(config.stack)) {
    // React Only → ZIP
    await generateZip(config);
    return;
  }

  if (isCliStack(config.stack) && !isZipStack(config.stack)) {
    // Laravel Only → YAML
    generateYaml(config);
    return;
  }

  // Mixed stack → Both
  await Promise.all([
    generateZip(config),
    generateYaml(config),
  ]);
}
