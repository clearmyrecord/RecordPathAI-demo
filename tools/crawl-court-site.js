import fs from 'fs';
const args=Object.fromEntries(process.argv.slice(2).map(a=>a.replace(/^--/,'').split('=')));
const kws=(args.keywords||'sealing,expungement,record sealing,criminal record,conviction,dismissal,set aside,application,petition,forms,clerk').split(',').map(s=>s.trim());
const slug=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const dft=u=>/\.pdf/i.test(u)?'pdf':/\.docx?/i.test(u)?'doc':'html';
const score=(u,t)=>kws.filter(k=>`${u} ${t}`.toLowerCase().includes(k)).length*8+(dft(u)==='pdf'?12:0);
const root=args.url;const depth=Number(args.depth||2);const q=[[root,0]];const seen=new Set();const out=[];
while(q.length){const [u,d]=q.shift();if(!u||seen.has(u)||d>depth)continue;seen.add(u);try{const r=await fetch(u);const text=await r.text();for(const m of text.matchAll(/href=["']([^"']+)/gi)){const next=new URL(m[1],u).toString();const s=score(next,next);if(s>8){const t=next.split('/').pop();const ft=dft(next);out.push({id:crypto.randomUUID(),title:t,url:next,fileType:ft,relevanceScore:s,matchedKeywords:kws.filter(k=>next.toLowerCase().includes(k)),state:slug(args.state),county:slug(args.county),courtType:args.courtType,formCategory:args.formCategory,localAssetPath:`assets/${slug(args.state)}/${slug(args.county)}/${args.courtType}/${args.formCategory}/${slug(t)}.${ft}`,mappingPath:`templates/${slug(args.state)}/${slug(args.county)}/${args.courtType}/${args.formCategory}.json`,status:'Found'});}if(d<depth)q.push([next,d+1]);}}catch{}}
fs.writeFileSync('data/crawler-results.json',JSON.stringify({generatedAt:new Date().toISOString(),params:args,results:out},null,2));
console.log(`Wrote ${out.length} results to data/crawler-results.json`);
