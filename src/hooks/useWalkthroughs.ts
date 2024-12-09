import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { WalkthroughForm } from '../types';

export function useWalkthroughs() {
  const walkthroughs = useLiveQuery(() => db.walkthroughs.toArray());

  const addWalkthrough = async (form: Omit<WalkthroughForm, 'id'>) => {
    await db.walkthroughs.add(form);
  };

  const updateWalkthrough = async (id: string, updates: Partial<WalkthroughForm>) => {
    await db.walkthroughs.update(id, updates);
  };

  const deleteWalkthrough = async (id: string) => {
    await db.walkthroughs.delete(id);
  };

  const getWalkthroughsByJob = async (jobId: string) => {
    return db.walkthroughs.where('jobId').equals(jobId).toArray();
  };

  return {
    walkthroughs: walkthroughs || [],
    addWalkthrough,
    updateWalkthrough,
    deleteWalkthrough,
    getWalkthroughsByJob,
    isLoading: walkthroughs === undefined,
  };
}