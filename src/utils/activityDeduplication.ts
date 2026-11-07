import { Activity } from '../types';

/**
 * Creates a unique normalized key for an activity based on its title, date, and barangay.
 */
export function normalizeActivityKey(act: Partial<Activity>): string {
  const title = (act.title || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const date = (act.date || '').trim();
  const barangay = (act.barangay || '').trim().toLowerCase();
  return `${title}__${date}__${barangay}`;
}

/**
 * Deduplicates an array of activities so that:
 * 1. Each activity ID is strictly unique.
 * 2. No two activities have the identical title, date, and barangay.
 * If duplicates exist, the one with more information (or later updatedAt/createdAt) is preserved.
 */
export function deduplicateActivities(list: (Activity | null | undefined)[]): Activity[] {
  if (!Array.isArray(list)) return [];

  const seenIds = new Set<string>();
  const seenKeys = new Map<string, Activity>();
  const deduped: Activity[] = [];

  for (const item of list) {
    if (!item || !item.id) continue;
    
    // Check if ID already seen
    if (seenIds.has(item.id)) {
      continue;
    }

    const key = normalizeActivityKey(item);
    
    // Check if duplicate title + date + barangay already seen
    if (key && key !== '__' && seenKeys.has(key)) {
      const existing = seenKeys.get(key)!;
      // If the new one has more assigned personnel or newer updatedAt, update existing
      const existingPersonnelCount = existing.assignedPersonnel?.length || 0;
      const currentPersonnelCount = item.assignedPersonnel?.length || 0;
      
      const existingTime = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
      const currentTime = new Date(item.updatedAt || item.createdAt || 0).getTime();

      if (currentPersonnelCount > existingPersonnelCount || currentTime > existingTime) {
        // Replace in-place
        const idx = deduped.findIndex((d) => d.id === existing.id);
        if (idx !== -1) {
          deduped[idx] = { ...existing, ...item, id: existing.id };
          seenKeys.set(key, deduped[idx]);
        }
      }
      continue;
    }

    seenIds.add(item.id);
    if (key && key !== '__') {
      seenKeys.set(key, item);
    }
    deduped.push(item);
  }

  return deduped;
}

/**
 * Checks whether an activity already exists with the same title, date, and barangay.
 */
export function findDuplicateActivity(
  candidate: Partial<Activity>,
  existingList: Activity[],
  excludeId?: string
): Activity | undefined {
  const candidateKey = normalizeActivityKey(candidate);
  if (!candidateKey || candidateKey === '__') return undefined;

  return existingList.find((act) => {
    if (excludeId && act.id === excludeId) return false;
    return normalizeActivityKey(act) === candidateKey;
  });
}
