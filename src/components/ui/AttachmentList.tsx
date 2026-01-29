import { useAttachments, useDeleteAttachment } from '../../api/attachmentApi';

interface AttachmentListProps {
  entityType: string;
  entityId: string;
  canDelete?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function AttachmentList({ entityType, entityId, canDelete = true }: AttachmentListProps) {
  const { data, isLoading } = useAttachments(entityType, entityId);
  const deleteMutation = useDeleteAttachment();

  const attachments = data?.attachments ?? [];

  if (isLoading) {
    return (
      <div className="text-sm text-[#A8A29E] py-2">Cargando archivos...</div>
    );
  }

  if (attachments.length === 0) {
    return null;
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`¿Eliminar archivo "${name}"?`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[#1C1917] mb-2">
        Archivos Adjuntos ({attachments.length})
      </label>
      <div className="space-y-2">
        {attachments.map((att) => (
          <div
            key={att.id}
            className="flex items-center gap-3 p-2 bg-[#F5F5F4] rounded-lg"
          >
            {isImage(att.mimeType) && att.url ? (
              <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                <img
                  src={att.url}
                  alt={att.originalName}
                  className="w-10 h-10 object-cover rounded border border-[#E7E5E4]"
                />
              </a>
            ) : (
              <div className="w-10 h-10 flex items-center justify-center bg-[#E7E5E4] rounded flex-shrink-0">
                <svg
                  className="w-5 h-5 text-[#57534E]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <a
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#1C1917] hover:text-[#059669] truncate block"
              >
                {att.originalName}
              </a>
              <span className="text-xs text-[#A8A29E]">
                {formatFileSize(att.fileSize)}
              </span>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {att.url && (
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-[#57534E] hover:text-[#059669] transition-colors"
                  title="Descargar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </a>
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={() => handleDelete(att.id, att.originalName)}
                  disabled={deleteMutation.isPending}
                  className="p-1.5 text-[#DC2626] hover:text-[#B91C1C] transition-colors disabled:opacity-50"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
