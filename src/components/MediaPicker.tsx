import React, { useEffect, useState } from 'react';
import { MediaApi, ApiError } from '../lib/api';
import type { MediaItem } from '../lib/types';

export const MediaPicker: React.FC<{
  value: string;
  onChange: (url: string) => void;
  label?: string;
}> = ({ value, onChange, label = 'Image' }) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open || items) return;
    MediaApi.list().then(setItems).catch((err) => {
      setError(err instanceof ApiError ? err.message : 'could not load media library.');
    });
  }, [open, items]);

  const onUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const uploaded = await MediaApi.upload(file);
      setItems((prev) => (prev ? [uploaded, ...prev] : [uploaded]));
      onChange(uploaded.url);
      setOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="media-picker">
      <div className="media-picker-row">
        {value ? <img className="media-picker-preview" src={value} alt="" /> : <div className="media-picker-preview media-picker-preview--empty" />}
        <div className="media-picker-controls">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`${label} URL`}
          />
          <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setOpen(true)}>
            Browse library
          </button>
        </div>
      </div>

      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>Media library</span>
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setOpen(false)}>Close</button>
            </div>

            <label className="admin-btn admin-btn-primary media-upload-btn">
              {uploading ? 'Uploading…' : 'Upload new image'}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(file);
                  e.target.value = '';
                }}
              />
            </label>

            {error && <div className="admin-error">{error}</div>}

            {!items ? (
              <div className="admin-loading">LOADING…</div>
            ) : (
              <div className="media-grid">
                {items.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    className="media-grid-item"
                    onClick={() => { onChange(img.url); setOpen(false); }}
                    title={img.alt_text}
                  >
                    <img src={img.url} alt={img.alt_text} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
