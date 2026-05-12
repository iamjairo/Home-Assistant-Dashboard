import { useState, useCallback, useMemo } from 'react';
import {
  X,
  Server,
  Wifi,
  WifiOff,
  RefreshCw,
  Activity,
  HardDrive,
  Shield,
  UserCircle2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
} from '../icons';
import AccessibleModalShell from '../components/ui/AccessibleModalShell';

const MODAL_TITLE_ID = 'management-console-modal-title';

const TABS = ['health', 'devices', 'profiles'];

// ── Section heading ─────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p className="mb-3 text-[11px] font-bold tracking-widest text-[var(--text-muted)] uppercase">
      {children}
    </p>
  );
}

// ── Status dot ───────────────────────────────────────────────────────────────

function StatusDot({ ok }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
      style={{ background: ok ? 'var(--status-success-fg)' : '#ef4444' }}
    />
  );
}

// ── Health Tab ───────────────────────────────────────────────────────────────

function HealthTab({ connected, activeUrl, entities, t }) {
  const total = Object.keys(entities || {}).length;
  const unavailable = Object.values(entities || {}).filter(
    (e) => e.state === 'unavailable' || e.state === 'unknown'
  ).length;

  return (
    <div className="space-y-4">
      <SectionLabel>{t?.('management.health') || 'System Health'}</SectionLabel>

      <div className="space-y-2">
        {/* HA connection */}
        <div className="popup-surface flex items-center justify-between rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Server className="h-5 w-5 text-[var(--text-secondary)]" />
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">
                {t?.('management.haConnection') || 'Home Assistant'}
              </p>
              <p className="truncate text-xs text-[var(--text-muted)]">{activeUrl || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusDot ok={connected} />
            <span className="text-xs font-bold" style={{ color: connected ? 'var(--status-success-fg)' : '#ef4444' }}>
              {connected ? t?.('status.connected') || 'Connected' : t?.('status.disconnected') || 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Entity stats */}
        <div className="popup-surface flex items-center justify-between rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-[var(--text-secondary)]" />
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)]">
                {t?.('management.entities') || 'Entities'}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {unavailable} {t?.('management.unavailable') || 'unavailable'}
              </p>
            </div>
          </div>
          <span className="font-mono text-lg font-bold text-[var(--text-primary)]">{total}</span>
        </div>

        {/* Storage (LocalStorage estimate) */}
        <LocalStorageStatus t={t} />
      </div>
    </div>
  );
}

function LocalStorageStatus({ t }) {
  let used = '—';
  let total = '~5 MB';
  try {
    let bytes = 0;
    for (const key of Object.keys(localStorage)) {
      bytes += (localStorage[key] || '').length * 2; // UTF-16
    }
    used = `${(bytes / 1024).toFixed(1)} KB`;
  } catch (_) {
    /* ignore */
  }
  return (
    <div className="popup-surface flex items-center justify-between rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <HardDrive className="h-5 w-5 text-[var(--text-secondary)]" />
        <div>
          <p className="text-sm font-bold text-[var(--text-primary)]">
            {t?.('management.storage') || 'Local Storage'}
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            {used} / {total}
          </p>
        </div>
      </div>
      <CheckCircle className="h-5 w-5 text-[var(--status-success-fg)]" />
    </div>
  );
}

// ── Devices Tab ──────────────────────────────────────────────────────────────

const DOMAIN_ORDER = [
  'light', 'switch', 'sensor', 'binary_sensor',
  'climate', 'cover', 'media_player', 'camera',
  'vacuum', 'alarm_control_panel', 'lock', 'fan',
];

function DevicesTab({ entities, t }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const grouped = useMemo(() => {
    const lower = search.toLowerCase();
    const byDomain = {};
    for (const [id, entity] of Object.entries(entities || {})) {
      const domain = id.split('.')[0];
      const name = entity.attributes?.friendly_name || id;
      if (lower && !id.toLowerCase().includes(lower) && !name.toLowerCase().includes(lower)) continue;
      if (!byDomain[domain]) byDomain[domain] = [];
      byDomain[domain].push({ id, entity, name });
    }
    // sort by domain order then alphabetically
    const sorted = {};
    [...DOMAIN_ORDER, ...Object.keys(byDomain).filter((d) => !DOMAIN_ORDER.includes(d)).sort()].forEach((d) => {
      if (byDomain[d]) sorted[d] = byDomain[d].sort((a, b) => a.name.localeCompare(b.name));
    });
    return sorted;
  }, [entities, search]);

  const totalDevices = useMemo(() => Object.values(entities || {}).length, [entities]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionLabel>{t?.('management.devices') || 'Devices'}</SectionLabel>
        <span className="text-xs text-[var(--text-muted)]">{totalDevices} total</span>
      </div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t?.('addCard.search') || 'Search entities…'}
        className="w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
      />
      <div className="space-y-2">
        {Object.entries(grouped).map(([domain, items]) => {
          const isExpanded = expanded === domain;
          const unavailableCount = items.filter(
            ({ entity }) => entity.state === 'unavailable' || entity.state === 'unknown'
          ).length;
          return (
            <div key={domain} className="popup-surface overflow-hidden rounded-2xl">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                onClick={() => setExpanded((prev) => (prev === domain ? null : domain))}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[var(--text-primary)] capitalize">{domain.replace('_', ' ')}</span>
                  {unavailableCount > 0 && (
                    <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">
                      {unavailableCount} unavailable
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                  <span className="text-xs">{items.length}</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>
              {isExpanded && (
                <div className="border-t border-[var(--glass-border)] px-4 pb-3">
                  {items.slice(0, 50).map(({ id, entity, name }) => {
                    const isUnavailable = entity.state === 'unavailable' || entity.state === 'unknown';
                    return (
                      <div key={id} className="flex items-center justify-between py-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-[var(--text-primary)]">{name}</p>
                          <p className="truncate text-[10px] text-[var(--text-muted)]">{id}</p>
                        </div>
                        <div className="ml-3 flex flex-shrink-0 items-center gap-2">
                          <StatusDot ok={!isUnavailable} />
                          <span className="text-[10px] text-[var(--text-muted)]">{entity.state}</span>
                        </div>
                      </div>
                    );
                  })}
                  {items.length > 50 && (
                    <p className="py-2 text-center text-xs text-[var(--text-muted)]">+{items.length - 50} more</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {Object.keys(grouped).length === 0 && (
          <p className="py-8 text-center text-sm text-[var(--text-muted)] italic">
            {t?.('form.noResults') || 'No results'}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Profiles Tab ─────────────────────────────────────────────────────────────

function ProfilesTab({ profiles, activeProfileId, onSave, onLoad, t }) {
  return (
    <div className="space-y-4">
      <SectionLabel>{t?.('management.profiles') || 'Profiles'}</SectionLabel>

      {profiles && profiles.length > 0 ? (
        <div className="space-y-2">
          {profiles.map((profile) => (
            <div key={profile.id} className="popup-surface flex items-center justify-between gap-3 rounded-2xl p-4">
              <div className="flex min-w-0 items-center gap-3">
                <UserCircle2 className="h-5 w-5 flex-shrink-0 text-[var(--text-secondary)]" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--text-primary)]">{profile.label || profile.id}</p>
                  <p className="text-xs text-[var(--text-muted)]">{profile.id}</p>
                </div>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                {onLoad && (
                  <button
                    type="button"
                    onClick={() => onLoad(profile.id)}
                    className="rounded-xl border border-[var(--accent-color)] bg-[var(--accent-bg)] px-3 py-1.5 text-[11px] font-bold text-[var(--accent-color)] uppercase transition hover:opacity-80"
                  >
                    {t?.('profile.load') || 'Load'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--glass-border)] p-6 text-center">
          <AlertCircle className="mx-auto mb-2 h-6 w-6 text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-muted)]">
            {t?.('management.noProfiles') || 'No profiles saved yet'}
          </p>
        </div>
      )}

      {onSave && (
        <button
          type="button"
          onClick={onSave}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--accent-color)] bg-[var(--accent-bg)] py-3 font-bold text-[var(--accent-color)] uppercase transition hover:opacity-90"
        >
          {t?.('profile.save') || 'Save current profile'}
        </button>
      )}
    </div>
  );
}

// ── Main Modal ───────────────────────────────────────────────────────────────

/**
 * Management Console modal.
 * Shows health status, entity browser, and profile management.
 */
export default function ManagementConsoleModal({
  show,
  onClose,
  connected,
  activeUrl,
  entities,
  profiles,
  activeProfileId,
  onSaveProfile,
  onLoadProfile,
  t,
}) {
  const [tab, setTab] = useState('health');

  if (!show) return null;

  const tabLabel = (key) => {
    if (key === 'health') return t?.('management.health') || 'Health';
    if (key === 'devices') return t?.('management.devices') || 'Devices';
    if (key === 'profiles') return t?.('management.profiles') || 'Profiles';
    return key;
  };

  return (
    <AccessibleModalShell
      open={show}
      onClose={onClose}
      titleId={MODAL_TITLE_ID}
      overlayClassName="fixed inset-0 z-[130] flex items-center justify-center p-4"
      overlayStyle={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(0,0,0,0.35)' }}
      panelClassName="popup-anim relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-3xl border p-5 font-sans shadow-2xl backdrop-blur-xl md:rounded-[2.5rem] md:p-8"
      panelStyle={{
        background: 'linear-gradient(135deg, var(--card-bg) 0%, var(--modal-bg) 100%)',
        borderColor: 'var(--glass-border)',
        color: 'var(--text-primary)',
      }}
    >
      {(titleId) => (
        <>
          <button
            onClick={onClose}
            className="modal-close absolute top-5 right-5 md:top-8 md:right-8"
            aria-label={t?.('common.close') || 'Close'}
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-5 flex items-center gap-3">
            <Shield className="h-6 w-6 text-[var(--text-secondary)]" />
            <h3
              id={titleId}
              className="text-xl font-light tracking-widest text-[var(--text-primary)] uppercase italic"
            >
              {t?.('management.title') || 'Management Console'}
            </h3>
          </div>

          {/* Tab bar */}
          <div className="mb-5 flex gap-1.5">
            {TABS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex-1 rounded-full border px-3 py-2 text-[11px] font-bold tracking-wider uppercase transition-colors ${tab === key ? 'border-[var(--accent-color)] bg-[var(--accent-bg)] text-[var(--accent-color)]' : 'border-transparent bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:bg-[var(--glass-bg-hover)] hover:text-[var(--text-primary)]'}`}
              >
                {tabLabel(key)}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="custom-scrollbar flex-1 overflow-y-auto pr-1">
            {tab === 'health' && (
              <HealthTab connected={connected} activeUrl={activeUrl} entities={entities} t={t} />
            )}
            {tab === 'devices' && <DevicesTab entities={entities} t={t} />}
            {tab === 'profiles' && (
              <ProfilesTab
                profiles={profiles}
                activeProfileId={activeProfileId}
                onSave={onSaveProfile}
                onLoad={onLoadProfile}
                t={t}
              />
            )}
          </div>
        </>
      )}
    </AccessibleModalShell>
  );
}
