import { memo, useEffect, useRef, useState } from 'react';
import { BellRing, Bell, Camera } from '../../icons';
import { getIconComponent } from '../../icons';

const DoorbellCard = memo(/** @param {any} props */ function DoorbellCard({
  cardId,
  dragProps,
  controls,
  cardStyle,
  entities,
  editMode,
  cardSettings,
  settingsKey,
  customNames,
  customIcons,
  getEntityImageUrl,
  onOpen,
  t,
}) {
  const settings = cardSettings[settingsKey] || cardSettings[cardId] || {};
  const binarySensorId = settings.doorbellSensorId || cardId;
  const cameraEntityId = settings.doorbellCameraId || null;

  const entity = entities[binarySensorId];
  const cameraEntity = cameraEntityId ? entities[cameraEntityId] : null;

  const state = entity?.state;
  const isRinging = state === 'on' || state === 'detected';
  const isUnavailable = state === 'unavailable' || state === 'unknown' || !state;
  const isSmall = settings.size === 'small';

  const name = customNames?.[cardId] || entity?.attributes?.friendly_name || binarySensorId;
  const iconName = customIcons?.[cardId] || entity?.attributes?.icon;
  const DoorbellIcon = iconName ? getIconComponent(iconName) || Bell : Bell;

  const [ringPulse, setRingPulse] = useState(false);
  const prevIsRinging = useRef(false);

  useEffect(() => {
    if (isRinging && !prevIsRinging.current) {
      setRingPulse(true);
      const timer = setTimeout(() => setRingPulse(false), 1200);
      prevIsRinging.current = true;
      return () => clearTimeout(timer);
    }
    if (!isRinging) prevIsRinging.current = false;
  }, [isRinging]);

  const cameraSnapshotUrl = cameraEntity
    ? getEntityImageUrl?.(
        `/api/camera_proxy/${cameraEntityId}?token=${cameraEntity.attributes?.access_token || ''}`
      )
    : null;

  const stateLabel = isUnavailable
    ? t?.('common.unavailable') || 'Unavailable'
    : isRinging
      ? t?.('doorbell.ringing') || 'Ringing'
      : t?.('doorbell.idle') || 'Idle';

  const ringColor = isRinging ? 'var(--status-warning-fg)' : 'var(--text-secondary)';
  const ringBg = isRinging ? 'var(--status-warning-bg)' : 'var(--glass-bg)';
  const ringBorder = isRinging ? 'var(--status-warning-border)' : 'var(--glass-border)';

  if (!entity && !editMode) return null;

  if (isSmall) {
    return (
      <div
        key={cardId}
        {...dragProps}
        data-haptic={editMode ? undefined : 'card'}
        className="glass-texture touch-feedback group relative flex h-full items-center gap-4 overflow-hidden rounded-[var(--card-border-radius,24px)] border border-[var(--card-border)] bg-[var(--card-bg)] p-4 pl-5 font-sans backdrop-blur-xl transition-all duration-300"
        style={cardStyle}
        onClick={(e) => {
          e.stopPropagation();
          if (!editMode) onOpen?.();
        }}
      >
        {controls}
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 ${ringPulse ? 'scale-110' : ''}`}
          style={{ borderColor: ringBorder, background: ringBg }}
        >
          {isRinging ? (
            <BellRing className="h-5 w-5" style={{ color: ringColor }} />
          ) : (
            <DoorbellIcon className="h-5 w-5" style={{ color: ringColor }} />
          )}
        </div>
        <div className="flex min-w-0 flex-col justify-center">
          <p className="truncate text-sm font-bold leading-none text-[var(--text-primary)]">{name}</p>
          <p className="mt-1 text-xs" style={{ color: ringColor }}>{stateLabel}</p>
        </div>
        <span
          className="ml-auto h-2.5 w-2.5 flex-shrink-0 rounded-full transition-colors"
          style={{ background: isRinging ? 'var(--status-warning-fg)' : 'var(--text-muted)' }}
        />
      </div>
    );
  }

  return (
    <div
      key={cardId}
      {...dragProps}
      data-haptic={editMode ? undefined : 'card'}
      className="glass-texture touch-feedback group relative flex h-full flex-col overflow-hidden rounded-[var(--card-border-radius,24px)] border border-[var(--card-border)] bg-[var(--card-bg)] font-sans backdrop-blur-xl transition-all duration-300"
      style={cardStyle}
      onClick={(e) => {
        e.stopPropagation();
        if (!editMode) onOpen?.();
      }}
    >
      {controls}

      {/* Camera preview */}
      {cameraSnapshotUrl ? (
        <div className="relative h-32 w-full flex-shrink-0 overflow-hidden">
          <img
            src={cameraSnapshotUrl}
            alt={name}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.5) 100%)',
            }}
          />
          {isRinging && (
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] px-2 py-1 text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--status-warning-fg)' }}>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: 'var(--status-warning-fg)' }} />
              {t?.('doorbell.ringing') || 'Ringing'}
            </div>
          )}
        </div>
      ) : null}

      {/* Info row */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300 ${ringPulse ? 'scale-110' : ''}`}
            style={{ borderColor: ringBorder, background: ringBg }}
          >
            {isRinging ? (
              <BellRing className="h-5 w-5" style={{ color: ringColor }} />
            ) : (
              <DoorbellIcon className="h-5 w-5" style={{ color: ringColor }} />
            )}
          </div>
          {cameraEntityId && !cameraSnapshotUrl && (
            <Camera className="h-4 w-4 text-[var(--text-muted)]" />
          )}
        </div>
        <div className="mt-3 flex-1">
          <p className="mb-0.5 truncate text-[11px] font-bold tracking-widest uppercase opacity-60" style={{ color: ringColor }}>
            {stateLabel}
          </p>
          <p className="truncate text-base font-bold text-[var(--text-primary)]">{name}</p>
        </div>
      </div>
    </div>
  );
});

export default DoorbellCard;
