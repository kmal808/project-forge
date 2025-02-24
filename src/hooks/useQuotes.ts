import React from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { ConfiguratorQuote } from '../types';

export function useQuotes() {
  const [quotes, setQuotes] = React.useState<ConfiguratorQuote[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchQuotes = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          items:quote_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch quotes'));
      toast.error('Failed to fetch quotes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  React.useEffect(() => {
    const channels = [
      supabase
        .channel('quotes_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'quotes' },
          () => fetchQuotes()
        )
        .subscribe(),
      supabase
        .channel('quote_items_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'quote_items' },
          () => fetchQuotes()
        )
        .subscribe(),
    ];

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel));
    };
  }, [fetchQuotes]);

  const addQuote = async (quote: Omit<ConfiguratorQuote, 'id'>) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Create quote record
      const { data, error } = await supabase
        .from('quotes')
        .insert([
          {
            customer_name: quote.customerName,
            customer_email: quote.customerEmail,
            customer_phone: quote.customerPhone,
            status: quote.status,
            total_amount: quote.totalAmount,
            user_id: userData.user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Add quote items
      if (quote.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(
            quote.items.map((item) => ({
              quote_id: data.id,
              ...item,
            }))
          );

        if (itemsError) throw itemsError;
      }

      await fetchQuotes(); // Refresh to get items
      toast.success('Quote added successfully');
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add quote';
      toast.error(message);
      throw err;
    }
  };

  const updateQuote = async (id: string, updates: Partial<ConfiguratorQuote>) => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .update({
          customer_name: updates.customerName,
          customer_email: updates.customerEmail,
          customer_phone: updates.customerPhone,
          status: updates.status,
          total_amount: updates.totalAmount,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (updates.items) {
        // Delete existing items
        const { error: deleteError } = await supabase
          .from('quote_items')
          .delete()
          .eq('quote_id', id);

        if (deleteError) throw deleteError;

        // Add new items
        if (updates.items.length > 0) {
          const { error: itemsError } = await supabase
            .from('quote_items')
            .insert(
              updates.items.map((item) => ({
                quote_id: id,
                ...item,
              }))
            );

          if (itemsError) throw itemsError;
        }
      }

      await fetchQuotes(); // Refresh to get updated items
      toast.success('Quote updated successfully');
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update quote';
      toast.error(message);
      throw err;
    }
  };

  const deleteQuote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setQuotes((prev) => prev.filter((quote) => quote.id !== id));
      toast.success('Quote deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete quote';
      toast.error(message);
      throw err;
    }
  };

  const getQuotesByStatus = async (status: ConfiguratorQuote['status']) => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          items:quote_items(*)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch quotes';
      toast.error(message);
      throw err;
    }
  };

  return {
    quotes,
    isLoading,
    error,
    addQuote,
    updateQuote,
    deleteQuote,
    getQuotesByStatus,
    refresh: fetchQuotes,
  };
}