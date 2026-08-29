"use client";

import { useRef, useState, useCallback } from "react";

interface UploadGatewayProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
  uploadProgress: number;
  uploadedFile: File | null;
}

const ACCEPTED_EXTENSIONS = [".dxf"];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Inline SVG upload icon */
function UploadIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

/** Inline SVG document icon */
function FileIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

export default function UploadGateway({
  onFileSelected,
  isProcessing,
  uploadProgress,
  uploadedFile,
}: UploadGatewayProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): boolean => {
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setValidationError(
        `Invalid file type "${ext}". Only .dxf files are accepted in Standard Mode.`
      );
      return false;
    }
    setValidationError(null);
    return true;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        onFileSelected(file);
      }
    },
    [validateFile, onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="animate-in">
      <div
        className={`upload-zone glass-card ${isDragOver ? "drag-over" : ""}`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        aria-label="Upload DXF blueprint file"
        id="upload-gateway"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".dxf"
          className="upload-file-input"
          onChange={handleInputChange}
          disabled={isProcessing}
        />

        <div className="upload-zone-icon">
          <UploadIcon />
        </div>
        <div className="upload-zone-title">
          {isDragOver
            ? "Drop your blueprint here"
            : "Drag & Drop CAD Blueprint"}
        </div>
        <div className="upload-zone-subtitle">
          or click to browse your files
        </div>
        <div className="upload-zone-badge">.DXF</div>

        {/* Uploaded file info */}
        {uploadedFile && (
          <div className="upload-file-info">
            <div className="upload-file-info-icon">
              <FileIcon />
            </div>
            <div className="upload-file-info-details">
              <div className="upload-file-info-name">{uploadedFile.name}</div>
              <div className="upload-file-info-size">
                {formatFileSize(uploadedFile.size)}
              </div>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {isProcessing && (
          <div className="progress-container">
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="progress-label">
              Extracting geometry... {uploadProgress}%
            </div>
          </div>
        )}

        {/* Validation error */}
        {validationError && (
          <div
            style={{
              marginTop: "var(--space-md)",
              padding: "var(--space-sm) var(--space-md)",
              background: "var(--color-error-dim)",
              borderLeft: "3px solid var(--color-error)",
              borderRadius: "var(--radius-sm)",
              color: "var(--color-error)",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            {validationError}
          </div>
        )}
      </div>
    </div>
  );
}
