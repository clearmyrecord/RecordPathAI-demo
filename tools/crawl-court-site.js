import fs from 'fs';
import { runJurisdictionSearch } from './court-search-core.js';
const args=Object.fromEntries(process.argv.slice(2).map(a=>a.replace(/^--/,'').split('=')));
const payload={url:args.url,startUrl:args.url,state:args.state,county:args.county,city:args.city,courtName:args.courtName,courtType:args.courtType,formCategory:args.formCategory,depth:Number(args.depth||2),maxResults:Number(args.maxResults||25),searchTerms:(args.keywords||'sealing,expungement,record sealing,application').split(',').map(s=>s.trim())};
const out=await runJurisdictionSearch(payload);
fs.writeFileSync('data/crawler-results.json',JSON.stringify({generatedAt:new Date().toISOString(),params:payload,...out},null,2));
console.log(`Wrote ${out.results.length} results to data/crawler-results.json`);
