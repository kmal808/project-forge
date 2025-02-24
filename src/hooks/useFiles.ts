import React from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { FileUpload } from '../types';

export function useFiles() {
  const [files, setFiles] = React.useState<FileUpload[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchFiles = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch files'));
      toast.error('Failed to fetch files');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  React.useEffect(() => {
    const channel = supabase
      .channel('files_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'files'
        },
        () => {
          fetchFiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFiles]);

  const addFile = async (file: Omit<FileUpload, 'id' | 'url'>) => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${userData.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      // Create file record
      const { data, error } = await supabase
        .from('files')
        .insert([
          {
            name: file.name,
            url: publicUrl,
            type: file.type,
            size: file.size,
            job_id: file.jobId,
            user_id: userData.user.id,
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      setFiles((prev) => [data, ...prev]);
      toast.success('File uploaded successfully');
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload file';
      toast.error(message);
      throw err;
    }
  };

  const deleteFile = async (id: string) => {
    try {
      const file = files.find((f) => f.id === id);
      if (!file) throw new Error('File not found');

      // Delete from storage
      const filePath = new URL(file.url).pathname.split('/').pop();
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('files')
          .remove([filePath]);

        if (storageError) throw storageError;
      }

      // Delete record
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFiles((prev) => prev.filter((f) => f.id !== id));
      toast.success('File deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete file';
      toast.error(message);
      throw err;
    }
  };

  const getFilesByJob = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch files';
      toast.error(message);
      throw err;
    }
  };

  return {
    files,
    isLoading,
    error,
    addFile,
    deleteFile,
    getFilesByJob,
    refresh: fetchFiles,
  };
}