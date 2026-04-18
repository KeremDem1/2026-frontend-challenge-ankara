const TURKISH_DIACRITIC_MAP: Record<string, string> = {
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  İ: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
  ç: 'c',
  Ç: 'c',
};

export function normalizeName(raw: string): string {
  if (!raw) return '';
  let out = '';
  for (const ch of raw) {
    out += TURKISH_DIACRITIC_MAP[ch] ?? ch;
  }
  out = out.toLowerCase();
  out = out.replace(/\s+[a-z]\.?$/, '');
  out = out.replace(/\s+/g, ' ').trim();
  return out;
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev: number[] = new Array(b.length + 1);
  let curr: number[] = new Array(b.length + 1);

  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }

  return prev[b.length];
}

export interface NameClusterEntry {
  canonical: string;
  aliases: string[];
}

const MIN_FUZZY_LENGTH = 4;
const MAX_FUZZY_DISTANCE = 1;

export function clusterNames(
  rawNames: string[],
): Map<string, NameClusterEntry> {
  const result = new Map<string, NameClusterEntry>();
  if (rawNames.length === 0) return result;

  const freq = new Map<string, number>();
  for (const name of rawNames) {
    if (!name) continue;
    freq.set(name, (freq.get(name) ?? 0) + 1);
  }

  const uniqueRaws = [...freq.keys()];
  const rawsByNorm = new Map<string, string[]>();
  for (const raw of uniqueRaws) {
    const norm = normalizeName(raw);
    if (!norm) continue;
    const bucket = rawsByNorm.get(norm) ?? [];
    bucket.push(raw);
    rawsByNorm.set(norm, bucket);
  }

  const norms = [...rawsByNorm.keys()];
  const parent = new Map<string, string>();
  for (const n of norms) parent.set(n, n);
  const find = (x: string): string => {
    const p = parent.get(x)!;
    if (p === x) return x;
    const root = find(p);
    parent.set(x, root);
    return root;
  };
  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  for (let i = 0; i < norms.length; i++) {
    for (let j = i + 1; j < norms.length; j++) {
      const a = norms[i];
      const b = norms[j];
      if (a.length < MIN_FUZZY_LENGTH || b.length < MIN_FUZZY_LENGTH) continue;
      if (Math.abs(a.length - b.length) > MAX_FUZZY_DISTANCE) continue;
      if (levenshtein(a, b) <= MAX_FUZZY_DISTANCE) union(a, b);
    }
  }

  const clusters = new Map<string, string[]>();
  for (const norm of norms) {
    const root = find(norm);
    const bucket = clusters.get(root) ?? [];
    bucket.push(...rawsByNorm.get(norm)!);
    clusters.set(root, bucket);
  }

  for (const raws of clusters.values()) {
    const sorted = [...raws].sort((a, b) => {
      const fa = freq.get(a) ?? 0;
      const fb = freq.get(b) ?? 0;
      if (fb !== fa) return fb - fa;
      if (b.length !== a.length) return b.length - a.length;
      return a.localeCompare(b);
    });
    const canonical = sorted[0];
    for (const raw of raws) {
      result.set(raw, { canonical, aliases: sorted });
    }
  }

  return result;
}

export function identityNameMap(
  rawNames: string[],
): Map<string, NameClusterEntry> {
  const result = new Map<string, NameClusterEntry>();
  for (const name of rawNames) {
    if (!name || result.has(name)) continue;
    result.set(name, { canonical: name, aliases: [name] });
  }
  return result;
}
