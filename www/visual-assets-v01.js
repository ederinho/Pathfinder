// Graphics selected from the Pathfinder asset packs. Keys describe UI roles.
const assetPaths = Object.freeze({
  'attributes-strength': 'icons/attributes/attr_strength.webp',
  'attributes-endurance': 'icons/attributes/attr_endurance.webp',
  'attributes-knowledge': 'icons/attributes/attr_knowledge.webp',
  'attributes-discipline': 'icons/attributes/attr_discipline.webp',
  'attributes-sport': 'icons/attributes/attr_sport.webp',
  'attributes-organization': 'icons/attributes/attr_organization.webp',
  'attributes-relationships': 'icons/attributes/attr_relationships.webp',
  'attributes-communication': 'icons/attributes/attr_communication.webp',
  'attributes-mental-health': 'icons/attributes/attr_mental_health.webp',
  'attributes-cooking': 'icons/attributes/attr_cooking.webp',
  'attributes-adaptation': 'icons/attributes/attr_adaptation.webp',
  'attributes-luck': 'icons/attributes/attr_luck.webp',
  'navigation-journal': 'icons/navigation/nav_journal.webp',
  'navigation-characters': 'icons/navigation/nav_characters.webp',
  'navigation-map': 'icons/navigation/nav_map.webp',
  'navigation-chronicle': 'icons/navigation/nav_chronicle.webp',
  'navigation-bestiary': 'icons/navigation/nav_bestiary.webp',
  'navigation-settings': 'icons/navigation/nav_settings.webp',
  'navigation-contracts': 'icons/navigation/nav_contracts.webp',
  'navigation-guild': 'icons/navigation/nav_guild.webp',
  'navigation-rituals': 'icons/navigation/nav_rituals.webp',
  'navigation-inventory': 'icons/navigation/nav_inventory.webp',
  'navigation-achievements': 'icons/navigation/nav_achievements.webp',
  'navigation-progress': 'icons/navigation/nav_progress.webp',
  'navigation-custom-contract': 'icons/navigation/nav_custom_contract.webp',
  'resources-gold': 'icons/resources/resource_gold.webp',
  'resources-seal': 'icons/resources/resource_seal.webp',
  'resources-shard': 'icons/resources/resource_shard.webp',
  'resources-consultation': 'icons/resources/resource_consultation.webp',
  'resources-consultation-token': 'icons/resources/resource_consultation_token.webp',
  'system-close': 'icons/system/sys_close.svg',
  'system-check': 'icons/system/sys_check.svg',
  'system-info': 'icons/system/sys_info.svg',
  'system-refresh': 'icons/system/sys_refresh.svg',
  'system-download': 'icons/system/sys_download.svg',
  'system-plus': 'icons/system/sys_plus.svg',
  'system-warning': 'icons/system/sys_warning.svg',
  'system-message': 'icons/system/sys_message.svg',
  'textures-stone': 'ui/textures/tex_stone.webp',
  'textures-iron': 'ui/textures/tex_iron.webp',
  'textures-wood': 'ui/textures/tex_wood.webp',
  'textures-leather-black': 'ui/textures/tex_leather_black.webp',
  'textures-leather-brown': 'ui/textures/tex_leather_brown.webp',
  'textures-parchment-light': 'ui/textures/tex_parchment_light.webp',
  'textures-brass': 'ui/textures/tex_brass.webp',
  'textures-banner': 'ui/textures/tex_banner.webp',
  'frames-neutral': 'ui/frames/frame_neutral.svg',
  'frames-active': 'ui/frames/frame_active.svg',
  'frames-danger': 'ui/frames/frame_danger.svg',
  'frames-success': 'ui/frames/frame_success.svg',
  'frames-disabled': 'ui/frames/frame_disabled.svg',
  'kael': 'npc/npc_kael_neutral.webp',
  'guild-hall': 'locations/loc_guild_hall.webp',
  'logo': 'brand/logo.webp',
  'mark': 'brand/mark.webp',
});

const guildAssetPaths = Object.freeze({
  'guild-hall-mobile': 'guild-hall-mobile.webp',
  'guild-tile-board': 'guild-tile-contract-board.webp',
  'guild-tile-ledger': 'guild-tile-quest-ledger.webp',
  'frames-forged': 'frame-forged-nine-slice.webp',
  'shell-journal': 'nav-journal.webp',
  'shell-character': 'nav-character.webp',
  'shell-chronicle': 'nav-chronicle.webp',
  'shell-bestiary': 'nav-bestiary.webp',
  'shell-settings': 'nav-settings.webp',
});

const attributes = [
  'strength', 'endurance', 'knowledge', 'discipline', 'sport', 'organization',
  'relationships', 'communication', 'mental-health', 'cooking', 'adaptation', 'luck',
];

function assetUrl(id) {
  if (Object.hasOwn(guildAssetPaths, id)) {
    return new URL('./visual-v02/guild/' + guildAssetPaths[id], import.meta.url).href;
  }
  return Object.hasOwn(assetPaths, id)
    ? new URL('./visual-v01/' + assetPaths[id], import.meta.url).href
    : null;
}

function image(id) {
  const url = assetUrl(id);
  if (!url) return null;
  const img = document.createElement('img');
  img.alt = '';
  img.decoding = 'async';
  img.draggable = false;
  img.src = url;
  return img;
}

// Leave the existing icon in place until the replacement has loaded.
function decorateIcon(target, id) {
  const img = image(id);
  if (!img) return;
  const fallback = document.createElement('i');
  fallback.className = 'visual-icon-fallback';
  fallback.append(...target.childNodes);
  target.classList.add('visual-icon');
  img.className = 'visual-icon-image';
  img.addEventListener('load', () => { target.dataset.artReady = ''; }, { once: true });
  img.addEventListener('error', () => img.remove(), { once: true });
  target.append(fallback, img);
}

export function visualIcon(id, fallback, className = '') {
  const icon = document.createElement('span');
  icon.className = className;
  icon.setAttribute('aria-hidden', 'true');
  if (fallback) icon.append(fallback);
  decorateIcon(icon, id);
  return icon;
}

export function attributeIcon(index, fallback) {
  return visualIcon('attributes-' + attributes[index], fallback, 'visual-attribute');
}

export function replacePortrait(stage, id) {
  const existing = stage.querySelector('.awakening-portrait');
  const portrait = image(id);
  if (!existing || !portrait) return stage;
  portrait.className = existing.className + ' visual-portrait';
  portrait.addEventListener('load', () => existing.replaceWith(portrait), { once: true });
  return stage;
}

export function applyStaticArtwork() {
  for (const id of [...Object.keys(assetPaths), ...Object.keys(guildAssetPaths)]) {
    if (id.startsWith('textures-') || id.startsWith('frames-') || id.startsWith('guild-')
      || ['system-check', 'system-plus', 'system-warning', 'system-message'].includes(id)) {
      document.documentElement.style.setProperty('--visual-' + id, 'url("' + assetUrl(id) + '")');
    }
  }

  for (const [selector, id] of Object.entries({
    '#splash': 'logo',
    'main > header': 'mark',
    'nav [data-tab=journal] > span': 'shell-journal',
    'nav [data-tab=character] > span': 'shell-character',
    'nav [data-tab=history] > span': 'shell-chronicle',
    'nav [data-tab=bestiary] > span': 'shell-bestiary',
    '#settingsOpen': 'shell-settings',
    '[data-jview=journey]': 'navigation-rituals',
    '#chroniclerOpen': 'navigation-chronicle',
    '#livingCampaigns': 'navigation-bestiary',
    '#newQuest': 'navigation-custom-contract',
    '[data-cview=overview]': 'navigation-characters',
    '[data-cview=equipment]': 'navigation-inventory',
    '[data-cview=titles]': 'navigation-guild',
    '[data-cview=achievements]': 'navigation-achievements',
    '[data-cview=story]': 'navigation-chronicle',
    '[data-cview=stats]': 'navigation-progress',
    '#gearInfo': 'system-info',
    '#titlesInfo': 'system-info',
    '#closeEditor': 'system-close',
    '#chroniclerClose': 'system-close',
    '#forgeClose': 'system-close',
    '#settingsClose': 'system-close',
    '#checkUpdate': 'system-refresh',
    '#export': 'system-download',
  })) {
    const target = document.querySelector(selector);
    if (!target) continue;
    if (target.matches('#splash, main > header')) {
      const emblem = target.querySelector('.emblem');
      if (emblem) target.prepend(visualIcon(id, emblem, 'visual-brand'));
    } else if (target.matches('button:not(#settingsOpen, .close-red, #closeEditor, .info-dot)')) {
      target.prepend(visualIcon(id, null, 'visual-control-icon'));
    } else {
      decorateIcon(target, id);
    }
  }
}
