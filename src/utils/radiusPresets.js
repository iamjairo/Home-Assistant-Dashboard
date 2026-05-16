const CARD_RADIUS_PRESET_DEFINITIONS = [
  { translationKey: 'settings.radiusPreset.square', fallback: 'Square', value: 0 },
  { translationKey: 'settings.radiusPreset.soft', fallback: 'Soft', value: 16 },
  { translationKey: 'settings.radiusPreset.rounded', fallback: 'Rounded', value: 24 },
  { translationKey: 'settings.radiusPreset.pill', fallback: 'Pill', value: 48 },
];

export function getCardRadiusPresets(t) {
  return CARD_RADIUS_PRESET_DEFINITIONS.map(({ translationKey, fallback, value }) => ({
    label: t(translationKey) || fallback,
    value,
  }));
}
