import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { FileUpload } from '../types';

export function useFiles() {
  const files = useLiveQuery(() => db.files.toArray());

  const addFile = async (file: Omit<FileUpload, 'id'>) => {
    await db.files.add({
      ...file,
      uploadDate: new Date().toISOString(),
    });
  };

  const deleteFile = async (id: string) => {
    const file = await db.files.get(id);
    if (file?.url) {
      URL.revokeObjectURL(file.url);
    }
    await db.files.delete(id);
  };

  const getFilesByJob = async (jobId: string) => {
    return db.files.where('jobId').equals(jobId).toArray();
  };

  return {
    files: files || [],
    addFile,
    deleteFile,
    getFilesByJob,
    isLoading: files === undefined,
  };
}