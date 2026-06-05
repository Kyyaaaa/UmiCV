export type DiffType = 'added' | 'removed' | 'modified';

export interface DiffChange {
  path: string;
  type: DiffType;
  oldValue: unknown;
  newValue: unknown;
}

/**
 * Deep compares two values and returns an array of differences.
 * Optimized for comparing JSON objects from Prisma Json type.
 */
export function generateDiff(original: any, draft: any, basePath: string = ''): DiffChange[] {
  const diffs: DiffChange[] = [];

  if (original === draft) {
    return diffs;
  }

  // Handle null / undefined cases
  if (original === null || original === undefined) {
    if (draft !== null && draft !== undefined) {
      diffs.push({ path: basePath, type: 'added', oldValue: original, newValue: draft });
    }
    return diffs;
  }

  if (draft === null || draft === undefined) {
    diffs.push({ path: basePath, type: 'removed', oldValue: original, newValue: draft });
    return diffs;
  }

  // Handle primitives (strings, numbers, booleans)
  if (typeof original !== 'object' || typeof draft !== 'object') {
    if (original !== draft) {
      diffs.push({ path: basePath, type: 'modified', oldValue: original, newValue: draft });
    }
    return diffs;
  }

  // Handle arrays
  if (Array.isArray(original) && Array.isArray(draft)) {
    const maxLength = Math.max(original.length, draft.length);
    for (let i = 0; i < maxLength; i++) {
      const newPath = basePath ? `${basePath}[${i}]` : `[${i}]`;
      const itemDiffs = generateDiff(original[i], draft[i], newPath);
      diffs.push(...itemDiffs);
    }
    return diffs;
  }

  // Handle type mismatch between object and array
  if (Array.isArray(original) !== Array.isArray(draft)) {
    diffs.push({ path: basePath, type: 'modified', oldValue: original, newValue: draft });
    return diffs;
  }

  // Handle objects
  const allKeys = new Set([...Object.keys(original), ...Object.keys(draft)]);
  for (const key of allKeys) {
    const newPath = basePath ? `${basePath}.${key}` : key;
    const itemDiffs = generateDiff(original[key], draft[key], newPath);
    diffs.push(...itemDiffs);
  }

  return diffs;
}
