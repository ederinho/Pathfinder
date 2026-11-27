const themes=new Set(['hall','market','sanctuary','archive','road','chamber','guild']);
const portraits=new Set(['kael','rovan','oracle','edran','silas','morrigan','alden']);
export function sceneArtwork(theme,portrait){const stage=document.createElement('div');stage.className='vn-stage awakening-stage';stage.dataset.art=themes.has(theme)?theme:'hall';stage.setAttribute('aria-hidden','true');if(portraits.has(portrait)){const img=document.createElement('img');img.className='awakening-portrait';img.src='./awakening-art/'+portrait+'.svg';img.alt='';stage.append(img)}return stage}
export function decorateService(dialog,theme,portrait){dialog.classList.add('awakening-service');dialog.dataset.theme=theme;return sceneArtwork(theme,portrait)}
