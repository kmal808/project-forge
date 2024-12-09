import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { ConfiguratorQuote } from '../types';

export function useQuotes() {
  const quotes = useLiveQuery(() => db.quotes.toArray());

  const addQuote = async (quote: Omit<ConfiguratorQuote, 'id'>) => {
    await db.quotes.add({
      ...quote,
      createdAt: new Date().toISOString(),
    });
  };

  const updateQuote = async (id: string, updates: Partial<ConfiguratorQuote>) => {
    await db.quotes.update(id, updates);
  };

  const deleteQuote = async (id: string) => {
    await db.quotes.delete(id);
  };

  const getQuotesByStatus = async (status: ConfiguratorQuote['status']) => {
    return db.quotes.where('status').equals(status).toArray();
  };

  return {
    quotes: quotes || [],
    addQuote,
    updateQuote,
    deleteQuote,
    getQuotesByStatus,
    isLoading: quotes === undefined,
  };
}