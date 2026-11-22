import type { RouteSafetyTag } from '../types';

export interface SafetyTagOption {
  id: RouteSafetyTag;
  label: string;
  sentiment: 'positive' | 'negative';
}

export const SAFETY_TAG_CATALOG: Record<RouteSafetyTag, SafetyTagOption> = {
  // Positive observations
  bom_asfalto: { id: 'bom_asfalto', label: 'Bom asfalto', sentiment: 'positive' },
  iluminada: { id: 'iluminada', label: 'Iluminada', sentiment: 'positive' },
  sombra: { id: 'sombra', label: 'Sombra', sentiment: 'positive' },
  paisagem: { id: 'paisagem', label: 'Paisagem', sentiment: 'positive' },
  bem_sinalizada: { id: 'bem_sinalizada', label: 'Bem sinalizada', sentiment: 'positive' },
  ciclovia_larga: { id: 'ciclovia_larga', label: 'Ciclovia larga', sentiment: 'positive' },

  // Negative / Caution observations
  cruzamento_tenso: { id: 'cruzamento_tenso', label: 'Cruzamento tenso', sentiment: 'negative' },
  muito_movimento: { id: 'muito_movimento', label: 'Muito movimento', sentiment: 'negative' },
  asfalto_irregular: { id: 'asfalto_irregular', label: 'Asfalto ruim / buracos', sentiment: 'negative' },
  mal_iluminada: { id: 'mal_iluminada', label: 'Mal iluminada', sentiment: 'negative' },
  insegura: { id: 'insegura', label: 'Sensação insegura', sentiment: 'negative' },
  trecho_obstruido: { id: 'trecho_obstruido', label: 'Trecho obstruído', sentiment: 'negative' },
};

const TAG_IDS_BY_STARS: Record<number, RouteSafetyTag[]> = {
  // 5★: Positive observations only (6 positive, 0 negative)
  5: ['bom_asfalto', 'iluminada', 'sombra', 'paisagem', 'bem_sinalizada', 'ciclovia_larga'],
  // 4★: Mostly positive + 2 light alerts (4 positive, 2 negative)
  4: ['bom_asfalto', 'iluminada', 'sombra', 'paisagem', 'cruzamento_tenso', 'muito_movimento'],
  // 3★: Half positive, half negative (3 positive, 3 negative)
  3: ['bom_asfalto', 'sombra', 'paisagem', 'cruzamento_tenso', 'muito_movimento', 'asfalto_irregular'],
  // 2★: Mostly negative + 2 positive (4 negative, 2 positive)
  2: ['asfalto_irregular', 'mal_iluminada', 'cruzamento_tenso', 'muito_movimento', 'bom_asfalto', 'sombra'],
  // 1★: Negative observations only (6 negative, 0 positive)
  1: ['asfalto_irregular', 'mal_iluminada', 'cruzamento_tenso', 'muito_movimento', 'insegura', 'trecho_obstruido'],
};

export function getSafetyTagsForStars(stars: number): SafetyTagOption[] {
  const clamped = Math.max(1, Math.min(5, Math.round(stars || 5)));
  return TAG_IDS_BY_STARS[clamped].map((id) => SAFETY_TAG_CATALOG[id]);
}

export function filterTagsForStars(selected: RouteSafetyTag[], stars: number): RouteSafetyTag[] {
  const allowed = new Set(getSafetyTagsForStars(stars).map((t) => t.id));
  return selected.filter((t) => allowed.has(t));
}

export function getSafetyTagLabel(tagId: RouteSafetyTag | string): string {
  const found = SAFETY_TAG_CATALOG[tagId as RouteSafetyTag];
  return found ? found.label : String(tagId);
}

export function getSafetyPromptForStars(stars: number): string {
  const clamped = Math.max(1, Math.min(5, Math.round(stars || 5)));
  if (clamped === 5) return 'O que você mais gostou nesta rota?';
  if (clamped === 4) return 'Quase perfeita! O que se destacou?';
  if (clamped === 3) return 'Como foi a experiência neste trajeto?';
  if (clamped === 2) return 'O que pode melhorar nesta rota?';
  return 'Quais problemas você encontrou?';
}
