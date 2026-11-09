import { enrichTelegram, ORBS_LOGO } from './link-thumbnail.mjs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { load } from 'cheerio';
const SOURCES={blog:'https://www.orbs.com/blog/',announcements:'https://t.me/s/OrbsAnnouncements'};
const httpsUrl=v=>{try{const u=new URL(v);return u.protocol==='https:'?u.href:null}catch{return null}};
const latest=posts=>[...new Map(posts.map(p=>[p.id,p])).values()].sort((a,b)=>Date.parse(b.date)-Date.parse(a.date)).slice(0,5);
export function parseBlog(html) {
  const $ = load(html), posts = [];
  $('main a[href]').each((_, el) => {
    const card = $(el), date = card.find('time[datetime]').first().attr('datetime');
    if (!Number.isFinite(Date.parse(date))) return;
    let url;
    try { url = new URL(card.attr('href'), SOURCES.blog); } catch { return; }
    if (url.origin !== 'https://www.orbs.com') return;
    const img = card.find('img').first();
    const title = card.find('h2,h3,.font-semibold').first().text().trim() || img.attr('alt')?.trim();
    if (!title) return;
    let image = ORBS_LOGO;
    try {
      const src = img.attr('src');
      if (!src) throw Error('Missing image');
      const candidate = new URL(src, SOURCES.blog);
      if (candidate.protocol === 'https:') {
        if (candidate.origin === url.origin && candidate.pathname.startsWith('/_next/image')) candidate.searchParams.set('w', '640');
        image = candidate.href;
      }
    } catch {}
    posts.push({id:url.href, url:url.href, title, text:title, date:new Date(date).toISOString(), image,
      imageSource:image === ORBS_LOGO ? 'logo' : 'post', imageCount:1, repost:false});
  });
  if (!posts.length) throw Error('No readable blog posts');
  return latest(posts);
}
export function parseTelegram(html){const $=load(html);const posts=[];$('.tgme_widget_message[data-post]').each((_,el)=>{const root=$(el),id=root.attr('data-post');if(!/^OrbsAnnouncements\/\d+$/.test(id||''))return;const date=root.find('.tgme_widget_message_date time').attr('datetime')||root.find('time').first().attr('datetime');if(!Number.isFinite(Date.parse(date)))return;const body=root.find('.tgme_widget_message_text').first().clone();body.find('br').replaceWith('\n');let text=body.text().trim();const media=root.find('.tgme_widget_message_photo_wrap,.tgme_widget_message_video_thumb,.tgme_widget_message_link_preview_image');const images=[];media.each((_,m)=>{const style=$(m).attr('style')||'';const match=style.match(/url\(\s*['"]?([^'"\)]+)['"]?\s*\)/);const url=httpsUrl(match?.[1]);if(url)images.push(url)});if(!text)text=root.find('.link_preview_title').text().trim()||'';if(!text&&!images.length)return;const links=[...new Set(root.find('.tgme_widget_message_text a,.tgme_widget_message_link_preview').map((_,a)=>httpsUrl($(a).attr('href'))).get().filter(u=>u&&!new URL(u).hostname.endsWith('t.me')))];posts.push({links,id:id.split('/')[1],text:text||'Media post',url:`https://t.me/${id}`,date:new Date(date).toISOString(),image:images[0]||null,imageCount:images.length,repost:false});});if(!posts.length)throw Error('No readable announcement posts');return latest(posts);}
export function createCommunityLoader(fetcher=fetch,persistence=null){const cache={};let pending,loaded=false,nextRefresh=0;return async()=>{if(!loaded){loaded=true;if(persistence)try{const saved=JSON.parse(await readFile(persistence,'utf8'));for(const name of Object.keys(SOURCES))if(Array.isArray(saved[name]?.posts))cache[name]={...saved[name],posts:saved[name].posts.map(p=>({...p,image:p.image||ORBS_LOGO}))};}catch{}}if(Date.now()>=nextRefresh){pending??=Promise.all(Object.entries(SOURCES).map(async([name,url])=>{try{const r=await fetcher(url,{signal:AbortSignal.timeout(15000),headers:{'User-Agent':'Mozilla/5.0','Accept':'text/html'}});if(!r.ok)throw Error('Upstream unavailable');const html=await r.text();const posts=name==='blog'?parseBlog(html):await enrichTelegram(parseTelegram(html));cache[name]={posts,error:false,fetchedAt:new Date().toISOString()};}catch{cache[name]={...cache[name],error:true};}})).then(async()=>{nextRefresh=Date.now()+600000;if(persistence)try{await mkdir(new URL('./state/',import.meta.url),{recursive:true});await writeFile(persistence,JSON.stringify(cache));}catch{}}).finally(()=>pending=null);await pending;}return {sources:cache,refreshIntervalSeconds:600};};}
export const getCommunity=createCommunityLoader(fetch,new URL('./state/community-cache.json',import.meta.url));
