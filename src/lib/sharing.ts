import LZString from 'lz-string';
import type { ProjectConfig } from '../types/schema';

/**
 * Compresse une configuration projet en une chaîne Base64 sûre pour les URLs.
 */
export function compressConfig(config: ProjectConfig): string {
  const json = JSON.stringify(config);
  return LZString.compressToEncodedURIComponent(json);
}

/**
 * Décompresse une configuration projet depuis une chaîne Base64 issue de l'URL.
 */
export function decompressConfig(compressed: string): ProjectConfig | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;
    return JSON.parse(json) as ProjectConfig;
  } catch (error) {
    console.error('Failed to decompress config:', error);
    return null;
  }
}

/**
 * Génère l'URL complète de partage pour le wizard.
 */
export function generateShareUrl(config: ProjectConfig): string {
  if (typeof window === 'undefined') return '';
  const compressed = compressConfig(config);
  const url = new URL(window.location.origin + '/create');
  url.searchParams.set('c', compressed);
  return url.toString();
}
