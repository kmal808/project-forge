import React from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { WalkthroughForm } from '../types';

export function useWalkthroughs() {
  const [walkthroughs, setWalkthroughs] = React.useState<WalkthroughForm[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchWalkthroughs = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('walkthroughs')
        .select(`
          *,
          photos:files(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWalkthroughs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch walkthroughs'));
      toast.error('Failed to fetch walkthroughs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchWalkthroughs();
  }, [fetchWalkthroughs]);

  React.useEffect(() => {
    const channel = supabase
      .channel('walkthroughs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'walkthroughs'
        },
        () => {
          fetchWalkthroughs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchWalkthroughs]);

  const addWalkthrough = async (form: Omit<WalkthroughForm, 'id'>) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Create walkthrough record
      const { data, error } = await supabase
        .from('walkthroughs')
        .insert([
          {
            job_id: form.jobId,
            completion_date: form.completionDate,
            client_name: form.clientName,
            client_signature: form.clientSignature,
            installation_issues: form.installationIssues,
            manufacturing_issues: form.manufacturingIssues,
            payment_status: form.paymentStatus,
            payment_amount: form.paymentAmount,
            follow_up_needed: form.followUpNeeded,
            follow_up_notes: form.followUpNotes,
            user_id: userData.user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Link photos
      if (form.photos.length > 0) {
        const { error: photosError } = await supabase
          .from('walkthrough_photos')
          .insert(
            form.photos.map((photo) => ({
              walkthrough_id: data.id,
              file_id: photo.id,
            }))
          );

        if (photosError) throw photosError;
      }

      setWalkthroughs((prev) => [data, ...prev]);
      toast.success('Walkthrough added successfully');
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add walkthrough';
      toast.error(message);
      throw err;
    }
  };

  const updateWalkthrough = async (id: string, updates: Partial<WalkthroughForm>) => {
    try {
      const { data, error } = await supabase
        .from('walkthroughs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setWalkthroughs((prev) =>
        prev.map((walkthrough) => (walkthrough.id === id ? { ...walkthrough, ...data } : walkthrough))
      );
      
      toast.success('Walkthrough updated successfully');
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update walkthrough';
      toast.error(message);
      throw err;
    }
  };

  const deleteWalkthrough = async (id: string) => {
    try {
      const { error } = await supabase
        .from('walkthroughs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWalkthroughs((prev) => prev.filter((walkthrough) => walkthrough.id !== id));
      toast.success('Walkthrough deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete walkthrough';
      toast.error(message);
      throw err;
    }
  };

  const getWalkthroughsByJob = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('walkthroughs')
        .select(`
          *,
          photos:files(*)
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch walkthroughs';
      toast.error(message);
      throw err;
    }
  };

  return {
    walkthroughs,
    isLoading,
    error,
    addWalkthrough,
    updateWalkthrough,
    deleteWalkthrough,
    getWalkthroughsByJob,
    refresh: fetchWalkthroughs,
  };
}