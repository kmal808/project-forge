import React from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { ContainerItem } from '../types';

export function useContainerItems(containerId: string) {
  const [items, setItems] = React.useState<ContainerItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchItems = React.useCallback(async () => {
    // Don't fetch if no containerId is provided
    if (!containerId) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('container_items')
        .select('*')
        .eq('container_id', containerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setItems(data?.map(item => ({
        id: item.id,
        containerId: item.container_id,
        jobName: item.job_name,
        jobNumber: item.job_number,
        manufacturerOrderNumber: item.manufacturer_order_number,
        itemType: item.item_type,
        quantity: item.quantity,
        notes: item.notes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        userId: item.user_id,
      })) || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch items'));
      toast.error('Failed to fetch container items');
    } finally {
      setIsLoading(false);
    }
  }, [containerId]);

  React.useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  React.useEffect(() => {
    // Only subscribe to changes if we have a containerId
    if (!containerId) return;

    const channel = supabase
      .channel('container_items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'container_items',
          filter: `container_id=eq.${containerId}`
        },
        () => fetchItems()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [containerId, fetchItems]);

  const addItem = async (item: Omit<ContainerItem, 'id' | 'containerId' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!containerId) {
      toast.error('No container selected');
      return;
    }

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('container_items')
        .insert([
          {
            container_id: containerId,
            job_name: item.jobName,
            job_number: item.jobNumber,
            manufacturer_order_number: item.manufacturerOrderNumber,
            item_type: item.itemType,
            quantity: item.quantity,
            notes: item.notes,
            user_id: userData.user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newItem: ContainerItem = {
        id: data.id,
        containerId: data.container_id,
        jobName: data.job_name,
        jobNumber: data.job_number,
        manufacturerOrderNumber: data.manufacturer_order_number,
        itemType: data.item_type,
        quantity: data.quantity,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        userId: data.user_id,
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

  const updateItem = async (id: string, updates: Partial<ContainerItem>) => {
    if (!containerId) {
      toast.error('No container selected');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('container_items')
        .update({
          job_name: updates.jobName,
          job_number: updates.jobNumber,
          manufacturer_order_number: updates.manufacturerOrderNumber,
          item_type: updates.itemType,
          quantity: updates.quantity,
          notes: updates.notes,
        })
        .eq('id', id)
        .eq('container_id', containerId)
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
          updatedAt: data.updated_at,
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
    if (!containerId) {
      toast.error('No container selected');
      return;
    }

    try {
      const { error } = await supabase
        .from('container_items')
        .delete()
        .eq('id', id)
        .eq('container_id', containerId);

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