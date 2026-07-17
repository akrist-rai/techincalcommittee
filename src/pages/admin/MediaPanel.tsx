import React, { useEffect, useState } from 'react';
import { MediaApi, ApiError } from '../../lib/api';
import type { MediaItem } from '../../lib/types';

export const MediaPanel: React.FC = () => {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = () => MediaApi.list().then(setItems);

  useEffect(() => { load().catch((err) => setError(err instanceof ApiError ? err.message : 'load failed.')); }, []);

  const onUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        await MediaApi.upload(file);
      }
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this image? Anything on the site still pointing at it will break.')) return;
    try {
      await MediaApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'delete failed.');
    }
  };

  const copy = async (item: MediaItem) => {
    await navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (!items) return <div className="admin-loading">LOADING…</div>;

  return (
    <div>
      <div className="admin-page-header">
        <h1>Media library</h1>
        <label className="admin-btn admin-btn-primary media-upload-btn">
          {uploading ? 'Uploading…' : '+ Upload images'}
          <input type="file" accept="image/*" multiple hidden disabled={uploading} onChange={(e) => { onUpload(e.target.files); e.target.value = ''; }} />
        </label>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <p className="admin-hint">{items.length} images. Includes the built-in art library plus anything uploaded here.</p>

      <div className="media-grid media-grid--admin">
        {items.map((img) => (
          <div className="media-tile" key={img.id}>
            <img src={img.url} alt={img.alt_text} loading="lazy" />
            <div className="media-tile-actions">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => copy(img)}>
                {copiedId === img.id ? 'Copied!' : 'Copy URL'}
              </button>
              <button type="button" className="admin-btn admin-btn-danger" onClick={() => remove(img.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
