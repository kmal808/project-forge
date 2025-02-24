import { db } from '../db';

export async function optimisticUpdate<T extends { id: string }>(
  table: string,
  operation: 'add' | 'update' | 'delete',
  data: T | Partial<T>,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  const snapshot = await db.table(table).toArray();
  
  try {
    switch (operation) {
      case 'add':
        await db.table(table).add(data);
        break;
      case 'update':
        await db.table(table).update((data as T).id, data);
        break;
      case 'delete':
        await db.table(table).delete((data as T).id);
        break;
    }
    onSuccess?.();
  } catch (error) {
    // Rollback on failure
    await db.table(table).clear();
    await db.table(table).bulkAdd(snapshot);
    onError?.(error as Error);
    throw error;
  }
}