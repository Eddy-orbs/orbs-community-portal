import test from 'node:test';import assert from 'node:assert/strict';import {parseBlog,parseTelegram,createCommunityLoader} from './community-data.mjs';
const card=(id,date)=>`<a href="/post-${id}/"><img src="/_next/image/?url=%2Fblog%2Fimage.png&w=3840&q=75" alt="Post ${id}"><div class="font-semibold">Post ${id}</div><time datetime="${date}"></time></a>`;
const html=cards=>`<main>${cards.join('')}</main>`;
test('blog extracts latest five unique dated articles with absolute thumbnails',()=>{
 const cards=Array.from({length:7},(_,i)=>card(i,`2026-10-0${i+1}`));
 const posts=parseBlog(html([...cards,cards[6],'<a href="javascript:alert(1)"><div class="font-semibold">Bad</div><time datetime="2026-11-01"></time></a>']));
 assert.equal(posts.length,5);assert.equal(posts[0].url,'https://www.orbs.com/post-6/');assert.equal(posts[0].text,'Post 6');assert.equal(new URL(posts[0].image).searchParams.get('w'),'640');assert.equal(posts[4].id,'https://www.orbs.com/post-2/');assert.throws(()=>parseBlog('Unavailable'));
});
test('community fetches blog not X, coalesces requests and caches for ten minutes',async()=>{
 const urls=[];const get=createCommunityLoader(async url=>{urls.push(url);return {ok:url.includes('orbs.com'),text:async()=>html([card(1,'2026-10-01')])};});
 const [a]=await Promise.all([get(),get()]);assert.equal(urls.length,2);assert.ok(urls.includes('https://www.orbs.com/blog/'));assert.ok(!urls.some(u=>u.includes('twitter')));assert.equal(a.sources.blog.posts.length,1);assert.equal(a.sources.announcements.error,true);await get();assert.equal(urls.length,2);
});
test('Telegram extracts safe text, photo and date',()=>{const posts=parseTelegram(`<div class="tgme_widget_message" data-post="OrbsAnnouncements/20"><div class="tgme_widget_message_text">Hello<br><b>world &amp; friends</b></div><a class="tgme_widget_message_photo_wrap" style="background-image:url('https://cdn1.telesco.pe/file/a.jpg')"></a><a class="tgme_widget_message_date"><time datetime="2026-10-01T12:00:00Z"></time></a></div>`);assert.equal(posts[0].text,'Hello\nworld & friends');assert.equal(posts[0].image,'https://cdn1.telesco.pe/file/a.jpg');assert.equal(posts[0].url,'https://t.me/OrbsAnnouncements/20');assert.throws(()=>parseTelegram('Unavailable'));});
