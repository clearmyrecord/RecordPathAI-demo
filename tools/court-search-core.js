const DEFAULT_TERMS=['sealing','expungement','record sealing','application','petition','clerk','court forms'];
const COURT_TYPES=['municipal','county','common-pleas','district','superior','circuit','other'];
const slugify=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const detectFileType=u=>/\.pdf($|\?)/i.test(u)?'pdf':/\.docx?($|\?)/i.test(u)?'doc':'html';
const score=(txt,ft,terms)=>terms.reduce((n,t)=>n+(txt.includes(t.toLowerCase())?8:0),0)+(ft==='pdf'?12:0)+(/court|clerk|municipal|county/.test(txt)?6:0);

export function buildQueries(p){
  const s=p.state||'';const c=p.county||'';const city=p.city||'';const cn=p.courtName||'';const ct=p.courtType||'court';
  return [
    `site:.gov "${c}" "${s}" "${ct}" "sealing record" filetype:pdf`,
    `site:.gov "${c}" "${s}" "expungement" filetype:pdf`,
    `site:.gov "${city}" "${s}" "record sealing" "${ct}" filetype:pdf`,
    `site:.gov "${cn}" "application for sealing" filetype:pdf`
  ].map(q=>q.replace(/\s+/g,' ').trim());
}


function knownJurisdictionUrls(p){
  const k=`${(p.state||'').toLowerCase()}|${(p.county||'').toLowerCase()}|${(p.city||'').toLowerCase()}|${(p.courtName||'').toLowerCase()}|${(p.courtType||'').toLowerCase()}`;
  if(k.includes('ohio') && k.includes('wood-county') && k.includes('municipal')){
    return [
      'https://clerkofcourt.co.wood.oh.us/DocumentCenter/View/142/Application-for-Sealing-295332-Conviction-PDF',
      'https://www.woodcountymunicipalcourt.com/',
      'https://clerkofcourt.co.wood.oh.us/'
    ];
  }
  return [];
}

async function ddgSearch(query){
  const u=`https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const r=await fetch(u,{headers:{'User-Agent':'Mozilla/5.0'}}); if(!r.ok) throw new Error(`search ${r.status}`);
  const h=await r.text();
  const out=[];
  for(const m of h.matchAll(/<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi)){
    const url=m[1].replace(/&amp;/g,'&'); const title=m[2].replace(/<[^>]+>/g,' ').trim(); out.push({url,title});
  }
  return out;
}

async function crawlUrl(seed,p){
  const depth=Number(p.depth||2), max=Number(p.maxResults||25); const terms=(p.searchTerms?.length?p.searchTerms:DEFAULT_TERMS).map(x=>x.toLowerCase());
  const q=[[seed,0]], seen=new Set(), results=[];
  while(q.length && results.length<max){const [u,d]=q.shift(); if(seen.has(u)||d>depth) continue; seen.add(u);
    try{const r=await fetch(u,{headers:{'User-Agent':'Mozilla/5.0'}}); if(!r.ok) continue; const ct=(r.headers.get('content-type')||'').toLowerCase();
      if((Number(r.headers.get('content-length')||0))>10_000_000) continue; const body=await r.text();
      if(ct.includes('html')){for(const m of body.matchAll(/href=["']([^"'#]+)["']/gi)){let next; try{next=new URL(m[1],u).toString();}catch{continue;}
        if(!/^https?:/i.test(next)) continue; const fileType=detectFileType(next); const txt=`${next} ${body.slice(0,5000)}`.toLowerCase(); const sc=score(txt,fileType,terms);
        if(sc>10 && /\.(pdf|doc|docx)(\?|$)/i.test(next)){results.push({id:`r-${Buffer.from(next).toString('base64').slice(0,10)}`,title:decodeURIComponent(next.split('/').pop()||'form'),url:next,fileType,matchedKeywords:terms.filter(t=>txt.includes(t)),relevanceScore:sc,state:p.state,county:p.county,courtType:p.courtType||'other',formCategory:p.formCategory||'unknown',localAssetPath:`assets/${slugify(p.state)}/${slugify(p.county)}/${p.courtType||'other'}/${p.formCategory||'unknown'}/${slugify(next.split('/').pop())}.${fileType==='doc'?'docx':fileType}`,mappingPath:`templates/${slugify(p.state)}/${slugify(p.county)}/${p.courtType||'other'}/${p.formCategory||'unknown'}.json`,status:'Found'});}
        if(d<depth) q.push([next,d+1]);
      }}
    }catch{}
  }
  return results;
}

export async function runJurisdictionSearch(p){
  const queries=buildQueries(p); const errors=[]; let seeds=[];
  try{for(const q of queries){const hits=await ddgSearch(q); seeds.push(...hits.map(h=>h.url));}}catch(e){errors.push(`Search backend failed: ${e.message}`)}
  seeds=[...new Set(seeds)].filter(u=>u.includes('.gov')||u.includes('court')||u.includes('clerk')).slice(0,20);
  if(p.startUrl) seeds.unshift(p.startUrl);
  seeds=[...new Set([...knownJurisdictionUrls(p),...seeds])];
  if(!seeds.length) return {backendConfigured:false,queries,results:[],errors:[...errors,'Search backend not configured'],fallbackCommand:`node tools/crawl-court-site.js --url=\"${p.startUrl||'https://examplecourt.gov/forms'}\" --state=${p.state||'ohio'} --county=${p.county||'wood-county'} --courtType=${p.courtType||'municipal'} --formCategory=${p.formCategory||'sealing-conviction'} --depth=${p.depth||2}`};
  const bucket=new Map();
  for(const s of seeds){const found=await crawlUrl(s,p); for(const r of found){if(!bucket.has(r.url)) bucket.set(r.url,r); if(bucket.size>=Number(p.maxResults||25)) break;} if(bucket.size>=Number(p.maxResults||25)) break;}
  if(!bucket.size){
    const known=knownJurisdictionUrls(p).filter(u=>/pdf|court|clerk/i.test(u)).map((u,i)=>({id:`known-${i}-${Buffer.from(u).toString('base64').slice(0,8)}`,title:decodeURIComponent(u.split('/').pop()||'court-link'),url:u,fileType:detectFileType(u),matchedKeywords:(p.searchTerms||DEFAULT_TERMS).slice(0,4),relevanceScore:30,state:p.state,county:p.county,courtType:p.courtType||'municipal',formCategory:p.formCategory||'sealing-conviction',localAssetPath:`assets/${slugify(p.state)}/${slugify(p.county)}/${p.courtType||'municipal'}/${p.formCategory||'sealing-conviction'}/${slugify(u.split('/').pop()||'court-link')}.${detectFileType(u)==='doc'?'docx':detectFileType(u)}`,mappingPath:`templates/${slugify(p.state)}/${slugify(p.county)}/${p.courtType||'municipal'}/${p.formCategory||'sealing-conviction'}.json`,status:'Needs Review'}));
    if(known.length) return {backendConfigured:true,queries,results:known,errors:[...errors,'Live crawl unavailable; showing known jurisdiction sources'],fallbackCommand:''};
  }
  return {backendConfigured:true,queries,results:[...bucket.values()],errors,fallbackCommand:''};
}
