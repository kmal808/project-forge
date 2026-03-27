import React from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { PunchListItem } from '../types';

export function usePunchList(listId?: string) {
  const [items, setItems] = React.useState<PunchListItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchItems = React.useCallback(async () => {
    if (!listId) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      let query = supabase
        .from('punch_list')
        .select('*')
        .eq('list_id', listId)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setItems((data || []).map((row: any) => ({
        id: row.id,
        listId: row.list_id,
        description: row.description,
        status: row.status,
        priority: row.priority,
        assignedTo: row.assigned_to ?? undefined,
        dueDate: row.due_date ?? undefined,
        completedDate: row.completed_date ?? undefined,
        notes: row.notes ?? undefined,
      })));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch punch list items'));
      toast.error('Failed to fetch punch list items');
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

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
          table: 'punch_list',
          ...(listId ? { filter: `list_id=eq.${listId}` } : {})
        },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchItems, listId]);

  const addItem = async (item: Omit<PunchListItem, 'id'>) => {
    if (!listId) {
      toast.error('Select a punch list first');
      return;
    }

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('punch_list')
        .insert([
          {
            list_id: listId,
            description: item.description,
            status: item.status,
            priority: item.priority,
            assigned_to: item.assignedTo,
            due_date: item.dueDate,
            completed_date: item.completedDate,
            notes: item.notes,
            user_id: userData.user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      const mapped: PunchListItem = {
        id: data.id,
        listId: data.list_id,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assignedTo: data.assigned_to ?? undefined,
        dueDate: data.due_date ?? undefined,
        completedDate: data.completed_date ?? undefined,
        notes: data.notes ?? undefined,
      };

      setItems((prev) => [mapped, ...prev]);
      toast.success('Item added successfully');
      return mapped;
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
        .update({
          description: updates.description,
          status: updates.status,
          priority: updates.priority,
          assigned_to: updates.assignedTo,
          due_date: updates.dueDate,
          completed_date: updates.completedDate,
          notes: updates.notes,
        })
        .eq('id', id)
        .eq('list_id', listId)
        .select()
        .single();

      if (error) throw error;

      setItems((prev) =>
        prev.map((item) => (item.id === id
          ? {
              ...item,
              description: data.description,
              status: data.status,
              priority: data.priority,
              assignedTo: data.assigned_to ?? undefined,
              dueDate: data.due_date ?? undefined,
              completedDate: data.completed_date ?? undefined,
              notes: data.notes ?? undefined,
            }
          : item))
      );
      
      toast.success('Item updated successfully');
      return {
        ...updates,
        id,
      };
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
        .eq('id', id)
        .eq('list_id', listId);

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
    if (!listId) return [];

    try {
      const { data, error } = await supabase
        .from('punch_list')
        .select('*')
        .eq('list_id', listId)
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