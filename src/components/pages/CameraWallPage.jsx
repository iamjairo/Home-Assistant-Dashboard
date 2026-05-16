import { memo, useState, useCallback, useMemo } from 'react';
import { Camera, Maximize2, Minimize2, RefreshCw, Search, WifiOff } from '../../icons';

/**
 * CameraWallPage — displays a multi-camera grid with stream fallback.
 * Cameras are discovered from HA entities (`camera.*`).
 */
const CameraWallPage = memo(function CameraWallPage({
  entities,
  getEntityImageUrl,
  pageSettings,
  pageId,
  t,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [fullscreenId, setFullscreenId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const translate = t || ((k) => k);

  const cameraEntities = useMemo(() => {
    const cameras = Object.values(entities || {}).filter(
      (e) => e?.entity_id?.startsWith('camera.')
    );
    if (!searchTerm) return cameras;
    const lower = searchTerm.toLowerCase();
    return cameras.filter(
      (e) =>
        (e.attributes?.friendly_name || e.entity_id).toLowerCase().includes(lower) ||
        e.entity_id.toLowerCase().includes(lower)
    );
  }, [entities, searchTerm]);

  const handleRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);
  const handleFullscreen = useCallback((id) => setFullscreenId((prev) => (prev === id ? null : id)), []);

  const fullscreenEntity = fullscreenId ? entities?.[fullscreenId] : null;

  return (
    <div className="flex h-full flex-col p-4 md:p-6">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--glass-bg)] text-[var(--text-secondary)]">
          <Camera className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold tracking-widest text-[var(--text-primary)] uppercase">
            {pageSettings?.[pageId]?.label || translate('page.cameraWall') || 'Cameras'}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            {cameraEntities.length}{' '}
            {translate('cameraWall.cameraCount') || 'camera(s) found'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--glass-bg)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--glass-bg-hover)] hover:text-[var(--text-primary)]"
          title={translate('common.refresh') || 'Refresh'}
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder={translate('addCard.search') || 'Search cameras…'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] py-2.5 pr-4 pl-10 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
        />
      </div>

      {/* Fullscreen overlay */}
      {fullscreenEntity && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur"
          onClick={() => setFullscreenId(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <CameraTile
              entity={fullscreenEntity}
              getEntityImageUrl={getEntityImageUrl}
              refreshKey={refreshKey}
              isFullscreen
              onFullscreen={() => setFullscreenId(null)}
              t={translate}
            />
          </div>
        </div>
      )}

      {/* Camera Grid */}
      {cameraEntities.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-[var(--text-muted)]">
          <Camera className="h-12 w-12 opacity-30" />
          <p className="text-sm">{translate('cameraWall.noCameras') || 'No cameras found'}</p>
        </div>
      ) : (
        <div className="grid flex-1 auto-rows-auto grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cameraEntities.map((entity) => (
            <CameraTile
              key={entity.entity_id}
              entity={entity}
              getEntityImageUrl={getEntityImageUrl}
              refreshKey={refreshKey}
              isFullscreen={false}
              onFullscreen={() => handleFullscreen(entity.entity_id)}
              t={translate}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// ── Camera Tile ─────────────────────────────────────────────────────────────

const CameraTile = memo(function CameraTile({
  entity,
  getEntityImageUrl,
  refreshKey,
  isFullscreen,
  onFullscreen,
  t,
}) {
  const { entity_id, state, attributes } = entity;
  const name = attributes?.friendly_name || entity_id.split('.')[1] || entity_id;
  const isUnavailable = state === 'unavailable' || state === 'unknown';

  const snapshotUrl = getEntityImageUrl
    ? getEntityImageUrl(
        `/api/camera_proxy/${entity_id}?token=${attributes?.access_token || ''}`
      )
    : null;

  // Cache-bust on refresh
  const imgSrc = snapshotUrl ? `${snapshotUrl}&_r=${refreshKey}` : null;

  return (
    <div
      className={`group relative overflow-hidden rounded-[var(--card-border-radius,24px)] border border-[var(--card-border)] bg-black ${isFullscreen ? 'aspect-video w-full' : 'aspect-video'}`}
    >
      {isUnavailable ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--card-bg)] text-[var(--text-muted)]">
          <WifiOff className="h-8 w-8 opacity-40" />
          <p className="text-xs font-medium">{t?.('common.unavailable') || 'Unavailable'}</p>
        </div>
      ) : imgSrc ? (
        <img
          src={imgSrc}
          alt={name}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--card-bg)]">
          <Camera className="h-10 w-10 text-[var(--text-muted)] opacity-30" />
        </div>
      )}

      {/* Overlay: name + controls */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent px-3 py-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <span className="truncate text-xs font-bold text-white drop-shadow">{name}</span>
        <button
          type="button"
          onClick={onFullscreen}
          className="ml-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
          title={isFullscreen ? t?.('common.close') || 'Close' : t?.('cameraWall.fullscreen') || 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Always-visible name strip on mobile */}
      <div className="absolute inset-x-0 bottom-0 flex items-center bg-gradient-to-t from-black/60 to-transparent px-3 py-2 sm:hidden">
        <span className="truncate text-xs font-bold text-white">{name}</span>
      </div>
    </div>
  );
});

export default CameraWallPage;
