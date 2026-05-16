export const defaults={keywords:'sealing, expungement, record sealing, criminal record, conviction, dismissal, set aside, application, petition, forms, clerk'};
export const courtTypes=['municipal','county','common-pleas','district','superior','circuit','other'];
export const formCategories=['sealing-conviction','sealing-dismissal','expungement','set-aside','pardon','general-record-relief','unknown'];
export const statuses=['Ready','Searching','Crawling','Found','Duplicate','Needs Review','Imported','Error'];
export const slugify=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const normalizeState=v=>slugify(v);
export const normalizeCounty=v=>{const s=slugify(v);return s.endsWith('-county')?s:`${s}-county`;};
export const detectFileType=u=>/\.pdf($|\?)/i.test(u)?'pdf':/\.docx?($|\?)/i.test(u)?'doc':'html';
export function extractKeywords(text,keywords){const t=(text||'').toLowerCase();return keywords.filter(k=>t.includes(k.toLowerCase()));}
export function suggestFormCategory(text){const t=text.toLowerCase();if(t.includes('dismiss'))return 'sealing-dismissal';if(t.includes('expung'))return 'expungement';if(t.includes('set aside'))return 'set-aside';if(t.includes('pardon'))return 'pardon';if(t.includes('seal'))return 'sealing-conviction';return 'unknown';}
export function suggestCourtType(text){const t=text.toLowerCase();return courtTypes.find(c=>t.includes(c.replace('-',' ')))||'other';}
export function scoreCourtFormResult(r,keywords){const hay=`${r.title} ${r.url}`.toLowerCase();const matched=extractKeywords(hay,keywords);let score=matched.length*8;if(r.fileType==='pdf')score+=12;if(/court|clerk|municipal|county/.test(hay))score+=6;return {score,matched};}
export const buildAssetPath=(s,c,ct,fc,name,ft)=>`assets/${normalizeState(s)}/${normalizeCounty(c)}/${ct}/${fc}/${slugify(name)||'court-form'}.${ft==='doc'?'docx':ft}`;
export const buildMappingPath=(s,c,ct,fc)=>`templates/${normalizeState(s)}/${normalizeCounty(c)}/${ct}/${fc}.json`;
export function detectDuplicate(item,existing){return existing.find(x=>x.sourceUrl===item.sourceUrl||x.localAssetPath===item.localAssetPath||(x.title===item.title&&x.county===item.county&&x.courtType===item.courtType&&x.formCategory===item.formCategory));}
