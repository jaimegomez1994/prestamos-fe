import { useState, useRef, useCallback } from 'react';

interface FileUploadZoneProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploadZone({
  files,
  onChange,
  maxFiles = 5,
  maxSizeMB = 10,
}: FileUploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndAdd = useCallback(
    (incoming: File[]) => {
      setError('');
      const maxBytes = maxSizeMB * 1024 * 1024;
      const valid: File[] = [];

      for (const file of incoming) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setError('Solo se permiten imagenes (JPEG, PNG, GIF, WebP) y PDF');
          continue;
        }
        if (file.size > maxBytes) {
          setError(`Archivo muy grande. Maximo ${maxSizeMB}MB`);
          continue;
        }
        valid.push(file);
      }

      const combined = [...files, ...valid].slice(0, maxFiles);
      onChange(combined);
    },
    [files, onChange, maxFiles, maxSizeMB]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const dropped = Array.from(e.dataTransfer.files);
      validateAndAdd(dropped);
    },
    [validateAndAdd]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      validateAndAdd(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[#1C1917] mb-2">
        Archivos Adjuntos
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-[#059669] bg-[#ECFDF5]'
            : 'border-[#E7E5E4] hover:border-[#A8A29E]'
        }`}
      >
        <svg
          className="w-8 h-8 mx-auto mb-2 text-[#A8A29E]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-sm text-[#57534E]">
          Arrastra archivos aqui o <span className="text-[#059669] font-medium">selecciona</span>
        </p>
        <p className="text-xs text-[#A8A29E] mt-1">
          Imagenes o PDF, max {maxSizeMB}MB, hasta {maxFiles} archivos
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-xs text-[#DC2626] mt-1">{error}</p>
      )}

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between p-2 bg-[#F5F5F4] rounded-lg text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <svg
                  className="w-4 h-4 text-[#A8A29E] flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
                <span className="truncate">{file.name}</span>
                <span className="text-xs text-[#A8A29E] flex-shrink-0">
                  {formatFileSize(file.size)}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                className="text-[#DC2626] hover:text-[#B91C1C] ml-2 flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
