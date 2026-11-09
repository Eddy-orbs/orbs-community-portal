import http from 'node:http';
import { isIP } from 'node:net';
import { pathToFileURL } from 'node:url';
import { getAccount } from './account-data.mjs';
import { getCommunity } from './community-data.mjs';
import { getOverview } from './overview-data.mjs';
import { readFile } from 'node:fs/promises';
import { TokenBuckets, BusyError } from './request-policy.mjs';
const files=new Map([["/assets/stake-orbs.svg",["assets/stake-orbs.svg","image/svg+xml"]],["/assets/brand.svg",["assets/brand.svg","image/svg+xml"]],["/assets/logo-1.svg",["assets/logo-1.svg","image/svg+xml"]],["/assets/logo-2.svg",["assets/logo-2.svg","image/svg+xml"]],["/assets/logo-3.svg",["assets/logo-3.svg","image/svg+xml"]],["/assets/logo-4.svg",["assets/logo-4.svg","image/svg+xml"]],['/',['index.html','text/html']],['/index.html',['index.html','text/html']],['/i18n.js',['i18n.js','text/javascript']],['/app.js',['app.js','text/javascript']],['/wallet.js',['wallet.js','text/javascript']],['/style.css',['style.css','text/css']]]);
export function clientAddress(req){const peer=req.socket.remoteAddress||'';const loopback=['127.0.0.1','::1','::ffff:127.0.0.1'].includes(peer);if(loopback){const forwarded=String(req.headers['x-forwarded-for']||'').split(',').at(-1).trim();if(isIP(forwarded))return forwarded;}return peer;}
export function createPortalServer(loaders={getAccount,getCommunity,getOverview}){
 const allTraffic=new TokenBuckets({capacity:300,refillPerSecond:150,maxKeys:1});
 const perClient=new TokenBuckets({capacity:90,refillPerSecond:10});
 const apiGlobal=new TokenBuckets({capacity:60,refillPerSecond:20,maxKeys:1});
 const apiClient=new TokenBuckets({capacity:30,refillPerSecond:0.4});
 const send=(res,status,data,type='application/json',cache='no-store')=>{if(res.destroyed||res.writableEnded)return;res.writeHead(status,{'Content-Type':type,'Cache-Control':cache,'X-Content-Type-Options':'nosniff'});res.end(typeof data==='string'?data:JSON.stringify(data));};
 const server=http.createServer(async(req,res)=>{
  try{
   if(!allTraffic.take('all')||!perClient.take(clientAddress(req)))throw new BusyError();
   // Treat the request target as a path, never as an alternate authority/host.
   if(typeof req.url!=='string'||req.url.length>4096||!req.url.startsWith('/')||req.url.startsWith('//')||/[\\\u0000-\u0020]/.test(req.url))return send(res,400,{error:'Invalid request URL'});
   let url;try{url=new URL(req.url,'http://localhost');}catch{return send(res,400,{error:'Invalid request URL'});}
   const pathname=url.pathname;
   if(pathname.startsWith('/api/')){
    if(req.method!=='GET'){res.setHeader('Allow','GET');return send(res,405,{error:'Method not allowed'});}
    if(!apiGlobal.take('all')||!apiClient.take(clientAddress(req)))throw new BusyError();
    const force=/\bno-cache\b|\bmax-age=0\b/i.test(String(req.headers['cache-control']||''))||req.headers.pragma==='no-cache';
    if(pathname==='/api/account'){
     const address=url.searchParams.get('address'),part=url.searchParams.get('part');
     if(!/^0x[0-9a-f]{40}$/i.test(address||'')||!['ethereum','polygon','history-ethereum','history-polygon','votes'].includes(part))return send(res,400,{error:'Invalid account request'});
     const data=await loaders.getAccount(address,part,{force});return send(res,200,data,'application/json',data.data?.partial?'no-store':'private, max-age=600');
    }
    if(pathname==='/api/overview'||pathname==='/api/community'){
     const data=await (pathname==='/api/overview'?loaders.getOverview({force}):loaders.getCommunity());return send(res,200,data,'application/json',Object.values(data.sources).some(s=>s.error)?'no-store':'private, max-age=600');
    }
    return send(res,404,{error:'Not found'});
   }
   if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');return send(res,405,{error:'Method not allowed'});}
   if(pathname==='/health')return send(res,200,{status:'ok',service:'orbs-community-portal'});
   const file=files.get(pathname);if(!file)return send(res,404,{error:'Not found'});
   const body=await readFile(new URL(`./public/${file[0]}`,import.meta.url));if(res.destroyed)return;
   res.writeHead(200,{'Content-Type':`${file[1]}; charset=utf-8`,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:body);
  }catch(e){if(e instanceof BusyError){res.setHeader('Retry-After',String(e.retryAfter));return send(res,e.status,{error:e.message});}return send(res,503,{error:'Data temporarily unavailable'});}
 });
 server.maxConnections=256;
 return server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const port=Number(process.env.PORT||8894);createPortalServer().listen(port,'127.0.0.1',()=>console.log(`Orbs community portal listening on loopback port ${port}`));}
