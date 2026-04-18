export function formatTimestamp(
  raw: string | undefined,
  ms: number | undefined,
): string {
  if (ms !== undefined) {
    const d = new Date(ms);
    return d.toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return raw ?? '';
}

export function truncate(text: string | undefined, max = 140): string {
  if (!text) return '';
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + '…';
}
