import React from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { ContainerList, ContainerItem } from '../types';

export function useContainers() {
  const [containers, setContainers] = React.useState<ContainerList[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchContainers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('container_lists')
        .select(`
          *,
          items:container_items(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const containersWithCount = data?.map(container => ({
        id: container.id,
        containerNumber: container.container_number,
        createdAt: container.created_at,
        updatedAt: container.updated_at,
        userId: container.user_id,
        itemCount: container.items?.[0]?.count || 0
      })) || [];

      setContainers(containersWithCount);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch containers'));
      toast.error('Failed to fetch containers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchContainers();
  }, [fetchContainers]);

  React.useEffect(() => {
    const channels = [
      supabase
        .channel('container_lists_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'container_lists' },
          () => fetchContainers()
        )
        .subscribe(),
      supabase
        .channel('container_items_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'container_items' },
          () => fetchContainers()
        )
        .subscribe(),
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [fetchContainers]);

  const addContainer = async (containerNumber: string) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('container_lists')
        .insert([
          {
            container_number: containerNumber,
            user_id: userData.user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setContainers(prev => [{
        id: data.id,
        containerNumber: data.container_number,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        userId: data.user_id,
        itemCount: 0
      }, ...prev]);

      toast.success('Container added successfully');
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add container';
      toast.error(message);
      throw err;
    }
  };

  const deleteContainer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('container_lists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContainers(prev => prev.filter(container => container.id !== id));
      toast.success('Container deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete container';
      toast.error(message);
      throw err;
    }
  };

  return {
    containers,
    isLoading,
    error,
    addContainer,
    deleteContainer,
    refresh: fetchContainers,
  };
}