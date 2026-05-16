import { DoorbellCard } from '../../components';
import { getSettings, renderMissingEntityWhenReady } from '../helpers';

/**
 * @param {string} cardId
 * @param {Record<string, any>} dragProps
 * @param {(id: string) => any} getControls
 * @param {Record<string, any>} cardStyle
 * @param {string} settingsKey
 * @param {Record<string, any>} ctx
 */
export function renderDoorbellCard(cardId, dragProps, getControls, cardStyle, settingsKey, ctx) {
  const {
    entities,
    editMode,
    cardSettings,
    customNames,
    customIcons,
    getEntityImageUrl,
    t,
  } = ctx;
  const settings = getSettings(cardSettings, settingsKey, cardId);
  const binarySensorId = settings.doorbellSensorId || cardId;
  const entity = entities[binarySensorId];

  if (!entity) {
    return renderMissingEntityWhenReady(ctx, {
      cardId,
      dragProps,
      controls: getControls(cardId),
      cardStyle,
      missingEntityId: binarySensorId,
      t,
    });
  }

  return (
    <DoorbellCard
      key={cardId}
      cardId={cardId}
      dragProps={dragProps}
      controls={getControls(cardId)}
      cardStyle={cardStyle}
      entities={entities}
      editMode={editMode}
      cardSettings={cardSettings}
      settingsKey={settingsKey}
      customNames={customNames}
      customIcons={customIcons}
      getEntityImageUrl={getEntityImageUrl}
      t={t}
    />
  );
}
