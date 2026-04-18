import type { JotformAnswer } from '../types/jotform';
import type { GeoPoint } from '../types/record';

export function indexAnswersByName(
  answers: Record<string, JotformAnswer>,
): Record<string, JotformAnswer> {
  const out: Record<string, JotformAnswer> = {};
  for (const a of Object.values(answers)) {
    if (a && typeof a.answer === 'string' && a.answer.length > 0) {
      out[a.name] = a;
    }
  }
  return out;
}

export function parseJotformTimestamp(s?: string): number | undefined {
  if (!s) return undefined;

  const m = s.match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2})$/);
  if (m) {
    const [, dd, mm, yyyy, hh, mi] = m;
    return Date.UTC(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      Number(hh),
      Number(mi),
    );
  }

  const fallback = Date.parse(s);
  return Number.isNaN(fallback) ? undefined : fallback;
}

export function parseCoordinates(s?: string): GeoPoint | undefined {
  if (!s) return undefined;
  const parts = s.split(',').map((n) => Number(n.trim()));
  if (parts.length !== 2) return undefined;
  const [lat, lng] = parts;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  return { lat, lng };
}
