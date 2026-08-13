import { AyranEntry } from '../types/ayran';

export function sortAyranlar(items: AyranEntry[]): AyranEntry[] {
  return [...items].sort((a, b) => {
    const diff = (a.sira ?? 9999) - (b.sira ?? 9999);
    if (diff !== 0) return diff;
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });
}
