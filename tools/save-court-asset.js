import fs from 'fs';
const args=Object.fromEntries(process.argv.slice(2).map(a=>a.replace(/^--/,'').split('=')));
const ids=(args.ids||'').split(',').filter(Boolean);
const craw=JSON.parse(fs.readFileSync('data/crawler-results.json','utf8'));const existing=fs.existsSync('data/court-assets.json')?JSON.parse(fs.readFileSync('data/court-assets.json','utf8')):[];
const sel=(craw.results||[]).filter(r=>ids.includes(r.id));let added=0;for(const r of sel){if(existing.some(x=>x.sourceUrl===r.url||x.localAssetPath===r.localAssetPath))continue;existing.push({id:r.id,state:r.state,county:r.county,courtType:r.courtType,formCategory:r.formCategory,sourceUrl:r.url,sourceDomain:new URL(r.url).hostname,title:r.title,fileType:r.fileType,localAssetPath:r.localAssetPath,mappingPath:r.mappingPath,dateDiscovered:new Date().toISOString(),lastChecked:new Date().toISOString(),status:'discovered',needsMapping:true,notes:''});added++;}
fs.writeFileSync('data/court-assets.json',JSON.stringify(existing,null,2));console.log(`Imported ${added} assets.`);
