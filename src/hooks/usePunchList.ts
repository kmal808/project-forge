import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { PunchListItem } from '../types';

export function usePunchList() {
  const items = useLiveQuery(() => db.punchList.toArray());

  const addItem = async (item: Omit<PunchListItem, 'id'>) => {
    await db.punchList.add(item);
  };

  const updateItem = async (id: string, updates: Partial<PunchListItem>) => {
    await db.punchList.update(id, updates);
  };

  const deleteItem = async (id: string) => {
    await db.punchList.delete(id);
  };

  const getItemsByStatus = async (status: PunchListItem['status']) => {
    return db.punchList.where('status').equals(status).toArray();
  };

  return {
    items: items || [],
    addItem,
    updateItem,
    deleteItem,
    getItemsByStatus,
    isLoading: items === undefined,
  };
}