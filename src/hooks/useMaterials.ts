import React from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { MaterialItem } from '../types';

export function useMaterials() {
  const [materials, setMaterials] = React.useState<MaterialItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchMaterials = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch materials'));
      toast.error('Failed to fetch materials');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
          table: 'materials'
        },
        () => {
          fetchMaterials();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMaterials]);

  const addMaterial = async (material: Omit<MaterialItem, 'id' | 'user_id'>) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from('materials')
        .insert([
          {
            ...material,
            user_id: userData.user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setMaterials((prev) => [data, ...prev]);
      toast.success('Material added successfully');
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add material';
      toast.error(message);
      throw err;
    }
  };

  const updateMaterial = async (id: string, updates: Partial<MaterialItem>) => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setMaterials((prev) =>
        prev.map((material) => (material.id === id ? { ...material, ...data } : material))
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
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);

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