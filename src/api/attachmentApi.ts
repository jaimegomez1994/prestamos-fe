import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import type { Attachment } from '../types/attachment';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function uploadFiles(
  entityType: string,
  entityId: string,
  files: File[]
): Promise<{ attachments: Attachment[] }> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const token = localStorage.getItem('auth-token');
  const response = await fetch(
    `${API_BASE_URL}/api/attachments/${entityType}/${entityId}`,
    {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: 'Error al subir archivos',
    }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

const attachmentApi = {
  upload: uploadFiles,

  list: (entityType: string, entityId: string): Promise<{ attachments: Attachment[] }> =>
    apiClient.get(`/attachments/${entityType}/${entityId}`),

  download: (id: string): Promise<{ url: string; originalName: string }> =>
    apiClient.get(`/attachments/${id}/download`),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/attachments/${id}`),
};

export function useAttachments(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ['attachments', entityType, entityId],
    queryFn: () => attachmentApi.list(entityType, entityId),
    enabled: !!entityId,
  });
}

export function useUploadAttachments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entityType,
      entityId,
      files,
    }: {
      entityType: string;
      entityId: string;
      files: File[];
    }) => attachmentApi.upload(entityType, entityId, files),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['attachments', variables.entityType, variables.entityId],
      });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: attachmentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] });
    },
  });
}

export { attachmentApi };
