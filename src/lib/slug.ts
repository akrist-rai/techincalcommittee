export function slugify(input: string, fallback = 'section'): string {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

export function uniqueAnchors<T>(items: T[], getLabel: (item: T) => string): string[] {
  const seen = new Map<string, number>();
  return items.map((item) => {
    const base = slugify(getLabel(item));
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  });
}
