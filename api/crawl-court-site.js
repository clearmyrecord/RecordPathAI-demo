export async function crawlCourtSite(){return {results:[],errors:['Serverless crawl stub: wire to search provider or backend crawler']};}
export default async function handler(req,res){res.json(await crawlCourtSite(req.body||{}));}
