import { runJurisdictionSearch } from '../tools/court-search-core.js';

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  try{
    const payload=req.body||{};
    const data=await runJurisdictionSearch(payload);
    return res.json({...data,generatedAt:new Date().toISOString()});
  }catch(e){
    return res.status(500).json({backendConfigured:false,queries:[],results:[],errors:[e.message],generatedAt:new Date().toISOString()});
  }
}
