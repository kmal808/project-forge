import React from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { PunchListItem } from '../types';

export function usePunchList() {
  const [items, setItems] = React.useState<PunchListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchItems = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('punch_list')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch punch list items'));
      toast.error('Failed to fetch punch list items');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  React.useEffect(() => {
    const channel = supabase
      .channel('punch_list_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'punch_list'
        },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchItems]);

  const addItem = async (item: Omit<PunchListItem, 'id' | 'user_id'>) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('punch_list')
        .insert([
          {
            ...item,
            user_id: userData.user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setItems((prev) => [data, ...prev]);
      toast.success('Item added successfully');
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add item';
      toast.error(message);
      throw err;
    }
  };

  const updateItem = async (id: string, updates: Partial<PunchListItem>) => {
    try {
      const { data, error } = await supabase
        .from('punch_list')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...data } : item))
      );
      
      toast.success('Item updated successfully');
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update item';
      toast.error(message);
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('punch_list')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success('Item deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete item';
      toast.error(message);
      throw err;
    }
  };

  const getItemsByStatus = async (status: PunchListItem['status']) => {
    try {
      const { data, error } = await supabase
        .from('punch_list')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch items by status';
      toast.error(message);
      throw err;
    }
  };

  return {
    items,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    getItemsByStatus,
    refresh: fetchItems,
  };
}