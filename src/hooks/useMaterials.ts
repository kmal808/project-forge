import React from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { MaterialItem } from '../types';

export function useMaterials(listId?: string) {
  const [materials, setMaterials] = React.useState<MaterialItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchMaterials = React.useCallback(async () => {
    if (!listId) {
      setMaterials([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      let query = supabase
        .from('materials')
        .select('*')
        .eq('list_id', listId)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setMaterials((data || []).map((row: any) => ({
        id: row.id,
        listId: row.list_id,
        name: row.name,
        quantity: row.quantity,
        unit: row.unit,
        status: row.status,
        orderDate: row.order_date ?? undefined,
        receivedDate: row.received_date ?? undefined,
        notes: row.notes ?? undefined,
      })));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch materials'));
      toast.error('Failed to fetch materials');
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  React.useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  React.useEffect(() => {
    const channel = supabase
      .channel('materials_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'materials',
          ...(listId ? { filter: `list_id=eq.${listId}` } : {})
        },
        () => {
          fetchMaterials();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMaterials, listId]);

  const addMaterial = async (material: Omit<MaterialItem, 'id'>) => {
    if (!listId) {
      toast.error('Select a material list first');
      return;
    }

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('materials')
        .insert([
          {
            list_id: listId,
            name: material.name,
            quantity: material.quantity,
            unit: material.unit,
            status: material.status,
            order_date: material.orderDate,
            received_date: material.receivedDate,
            notes: material.notes,
            user_id: userData.user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const mapped: MaterialItem = {
        id: data.id,
        listId: data.list_id,
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        status: data.status,
        orderDate: data.order_date ?? undefined,
        receivedDate: data.received_date ?? undefined,
        notes: data.notes ?? undefined,
      };

      setMaterials((prev) => [mapped, ...prev]);
      toast.success('Material added successfully');
      return mapped;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add material';
      toast.error(message);
      throw err;
    }
  };

  const updateMaterial = async (id: string, updates: Partial<MaterialItem>) => {
    if (!listId) {
      toast.error('Select a material list first');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('materials')
        .update({
          name: updates.name,
          quantity: updates.quantity,
          unit: updates.unit,
          status: updates.status,
          order_date: updates.orderDate,
          received_date: updates.receivedDate,
          notes: updates.notes,
        })
        .eq('id', id)
        .eq('list_id', listId)
        .select()
        .single();

      if (error) throw error;

      setMaterials((prev) =>
        prev.map((material) =>
          material.id === id
            ? {
                ...material,
                name: data.name,
                quantity: data.quantity,
                unit: data.unit,
                status: data.status,
                orderDate: data.order_date ?? undefined,
                receivedDate: data.received_date ?? undefined,
                notes: data.notes ?? undefined,
              }
            : material
        )
      );
      
      toast.success('Material updated successfully');
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update material';
      toast.error(message);
      throw err;
    }
  };

  const deleteMaterial = async (id: string) => {
    if (!listId) {
      toast.error('Select a material list first');
      return;
    }

    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id)
        .eq('list_id', listId);

      if (error) throw error;

      setMaterials((prev) => prev.filter((material) => material.id !== id));
      toast.success('Material deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete material';
      toast.error(message);
      throw err;
    }
  };

  return {
    materials,
    isLoading,
    error,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    refresh: fetchMaterials,
  };
}