import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { toast } from 'sonner';
import { handleError } from '../utils/error';
import { optimisticUpdate } from '../utils/optimistic';
import type { MaterialItem } from '../types';
import React from 'react';

export function useMaterials() {
  const materials = useLiveQuery(() => db.materials.toArray());
  const [optimisticMaterials, setOptimisticMaterials] = React.useState<MaterialItem[]>([]);

  React.useEffect(() => {
    if (materials) {
      setOptimisticMaterials(materials);
    }
  }, [materials]);

  const addMaterial = async (material: Omit<MaterialItem, 'id'>) => {
    const newMaterial = {
      ...material,
      id: `temp-${Date.now()}`,
    };

    setOptimisticMaterials((prev) => [...prev, newMaterial]);

    try {
      await optimisticUpdate('materials', 'add', newMaterial);
      toast.success('Material added successfully');
    } catch (error) {
      setOptimisticMaterials((prev) => prev.filter((m) => m.id !== newMaterial.id));
      const message = handleError(error);
      toast.error(`Failed to add material: ${message}`);
      throw error;
    }
  };

  const updateMaterial = async (id: string, updates: Partial<MaterialItem>) => {
    const originalMaterials = [...optimisticMaterials];
    setOptimisticMaterials((prev) =>
      prev.map((material) => (material.id === id ? { ...material, ...updates } : material))
    );

    try {
      await optimisticUpdate('materials', 'update', { id, ...updates });
      toast.success('Material updated successfully');
    } catch (error) {
      setOptimisticMaterials(originalMaterials);
      const message = handleError(error);
      toast.error(`Failed to update material: ${message}`);
      throw error;
    }
  };

  const deleteMaterial = async (id: string) => {
    const originalMaterials = [...optimisticMaterials];
    setOptimisticMaterials((prev) => prev.filter((material) => material.id !== id));

    try {
      await optimisticUpdate('materials', 'delete', { id });
      toast.success('Material deleted successfully');
    } catch (error) {
      setOptimisticMaterials(originalMaterials);
      const message = handleError(error);
      toast.error(`Failed to delete material: ${message}`);
      throw error;
    }
  };

  return {
    materials: optimisticMaterials,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    isLoading: materials === undefined,
  };
}