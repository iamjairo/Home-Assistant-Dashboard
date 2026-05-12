import { SmartPlugCard } from '../../components';
import { getSettings } from '../helpers';

/**
 * @param {string} cardId
 * @param {Record<string, any>} dragProps
 * @param {(id: string) => any} getControls
 * @param {Record<string, any>} cardStyle
 * @param {string} settingsKey
 * @param {Record<string, any>} ctx
 */
export function renderSmartPlugCard(cardId, dragProps, getControls, cardStyle, settingsKey, ctx) {
  const { entities, editMode, cardSettings, customNames, customIcons, callService, isMobile, t } =
    ctx;
  const settings = getSettings(cardSettings, settingsKey, cardId);

  return (
    <SmartPlugCard
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
      callService={callService}
      isMobile={isMobile}
      settings={settings}
      t={t}
    />
  );
}
