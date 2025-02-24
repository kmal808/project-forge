import React from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { InventoryItem } from '../types';

export function useInventory() {
  const [items, setItems] = React.useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchItems = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setItems(data?.map(item => ({
        id: item.id,
        jobName: item.job_name,
        jobNumber: item.job_number,
        manufacturerOrderNumber: item.manufacturer_order_number,
        itemType: item.item_type,
        quantity: item.quantity,
        notes: item.notes,
        dateAdded: item.date_added,
      })) || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch inventory'));
      toast.error('Failed to fetch inventory items');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  React.useEffect(() => {
    const channel = supabase
      .channel('inventory_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        () => fetchItems()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchItems]);

  const addItem = async (item: Omit<InventoryItem, 'id' | 'dateAdded'>) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('inventory')
        .insert([{
          job_name: item.jobName,
          job_number: item.jobNumber,
          manufacturer_order_number: item.manufacturerOrderNumber,
          item_type: item.itemType,
          quantity: item.quantity,
          notes: item.notes,
          user_id: userData.user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      const newItem: InventoryItem = {
        id: data.id,
        jobName: data.job_name,
        jobNumber: data.job_number,
        manufacturerOrderNumber: data.manufacturer_order_number,
        itemType: data.item_type,
        quantity: data.quantity,
        notes: data.notes,
        dateAdded: data.date_added,
      };

      setItems(prev => [newItem, ...prev]);
      toast.success('Item added successfully');
      return newItem;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add item';
      toast.error(message);
      throw err;
    }
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .update({
          job_name: updates.jobName,
          job_number: updates.jobNumber,
          manufacturer_order_number: updates.manufacturerOrderNumber,
          item_type: updates.itemType,
          quantity: updates.quantity,
          notes: updates.notes,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === id ? {
          ...item,
          jobName: data.job_name,
          jobNumber: data.job_number,
          manufacturerOrderNumber: data.manufacturer_order_number,
          itemType: data.item_type,
          quantity: data.quantity,
          notes: data.notes,
        } : item
      ));
      
      toast.success('Item updated successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update item';
      toast.error(message);
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      toast.success('Item deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete item';
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
    refresh: fetchItems,
  };
}