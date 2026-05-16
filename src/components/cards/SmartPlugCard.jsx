import { memo, useCallback } from 'react';
import { Plug, Zap, Activity } from '../../icons';
import { getIconComponent } from '../../icons';

const SmartPlugCard = memo(/** @param {any} props */ function SmartPlugCard({
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
  callService,
  onOpen,
  isMobile: _isMobile,
  t,
}) {
  const settings = cardSettings[settingsKey] || cardSettings[cardId] || {};
  const entityId = settings.plugId || cardId;
  const powerSensorId = settings.powerSensorId || null;
  const energySensorId = settings.energySensorId || null;

  const entity = entities[entityId];
  const powerEntity = powerSensorId ? entities[powerSensorId] : null;
  const energyEntity = energySensorId ? entities[energySensorId] : null;

  const state = entity?.state;
  const isOn = state === 'on';
  const isUnavailable = state === 'unavailable' || state === 'unknown' || !state;
  const isSmall = settings.size === 'small';

  const name = customNames?.[cardId] || entity?.attributes?.friendly_name || entityId;
  const iconName = customIcons?.[cardId] || entity?.attributes?.icon;
  const PlugIcon = iconName ? getIconComponent(iconName) || Plug : Plug;

  const powerValue = powerEntity
    ? parseFloat(powerEntity.state)
    : null;
  const powerUnit = powerEntity?.attributes?.unit_of_measurement ?? '';
  const energyValue = energyEntity
    ? parseFloat(energyEntity.state)
    : null;
  const energyUnit = energyEntity?.attributes?.unit_of_measurement ?? '';

  const handleToggle = useCallback(
    (e) => {
      e.stopPropagation();
      if (isUnavailable || editMode) return;
      callService('switch', isOn ? 'turn_off' : 'turn_on', { entity_id: entityId });
    },
    [entityId, callService, isOn, isUnavailable, editMode]
  );

  if (!entity && !editMode) return null;

  const stateColor = isUnavailable
    ? 'var(--text-muted)'
    : isOn
      ? 'var(--status-success-fg)'
      : 'var(--text-secondary)';

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
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border transition-colors duration-300"
          style={{
            borderColor: isOn ? 'var(--status-success-border)' : 'var(--glass-border)',
            background: isOn ? 'var(--status-success-bg)' : 'var(--glass-bg)',
          }}
        >
          <PlugIcon className="h-5 w-5" style={{ color: stateColor }} />
        </div>
        <div className="flex min-w-0 flex-col justify-center">
          <p className="truncate text-sm font-bold leading-none text-[var(--text-primary)]">{name}</p>
          {Number.isFinite(powerValue) && (
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {powerValue.toFixed(1)} {powerUnit}
            </p>
          )}
        </div>
        <button
          type="button"
          aria-label={isOn ? t?.('status.off') || 'Turn off' : t?.('status.on') || 'Turn on'}
          onClick={handleToggle}
          className="ml-auto flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors"
          style={{
            background: isOn ? 'var(--status-success-bg)' : 'var(--glass-bg)',
            border: isOn ? '1px solid var(--status-success-border)' : '1px solid var(--glass-border)',
          }}
        >
          <span
            className="h-2.5 w-2.5 rounded-full transition-colors"
            style={{ background: isOn ? 'var(--status-success-fg)' : 'var(--text-muted)' }}
          />
        </button>
      </div>
    );
  }

  return (
    <div
      key={cardId}
      {...dragProps}
      data-haptic={editMode ? undefined : 'card'}
      className="glass-texture touch-feedback group relative flex h-full flex-col overflow-hidden rounded-[var(--card-border-radius,24px)] border border-[var(--card-border)] bg-[var(--card-bg)] p-5 font-sans backdrop-blur-xl transition-all duration-300"
      style={cardStyle}
      onClick={(e) => {
        e.stopPropagation();
        if (!editMode) onOpen?.();
      }}
    >
      {controls}

      {/* Header row */}
      <div className="mb-4 flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl border"
          style={{
            borderColor: isOn ? 'var(--status-success-border)' : 'var(--glass-border)',
            background: isOn ? 'var(--status-success-bg)' : 'var(--glass-bg)',
          }}
        >
          <PlugIcon className="h-6 w-6" style={{ color: stateColor }} />
        </div>
        <button
          type="button"
          aria-label={isOn ? t?.('status.off') || 'Turn off' : t?.('status.on') || 'Turn on'}
          onClick={handleToggle}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95"
          style={{
            background: isOn ? 'var(--status-success-bg)' : 'var(--glass-bg)',
            border: isOn ? '1px solid var(--status-success-border)' : '1px solid var(--glass-border)',
          }}
        >
          <span
            className="h-3 w-3 rounded-full transition-colors"
            style={{ background: isOn ? 'var(--status-success-fg)' : 'var(--text-muted)' }}
          />
        </button>
      </div>

      {/* Name + status */}
      <div className="flex-1">
        <p className="mb-0.5 truncate text-[11px] font-bold tracking-widest text-[var(--text-secondary)] uppercase opacity-60">
          {isUnavailable
            ? t?.('common.unavailable') || 'Unavailable'
            : isOn
              ? t?.('status.on') || 'On'
              : t?.('status.off') || 'Off'}
        </p>
        <p className="truncate text-base font-bold text-[var(--text-primary)]">{name}</p>
      </div>

      {/* Power / energy row */}
      {(Number.isFinite(powerValue) || Number.isFinite(energyValue)) && (
        <div className="mt-3 flex gap-3 border-t border-[var(--glass-border)] pt-3">
          {Number.isFinite(powerValue) && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <Zap className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--status-warning-fg)' }} />
              <span className="font-bold tabular-nums">{powerValue.toFixed(1)}</span>
              <span className="opacity-60">{powerUnit}</span>
            </div>
          )}
          {Number.isFinite(energyValue) && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <Activity className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--status-info-fg)' }} />
              <span className="font-bold tabular-nums">{energyValue.toFixed(2)}</span>
              <span className="opacity-60">{energyUnit}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default SmartPlugCard;
