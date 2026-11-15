const V='cp-tracker-v4',SHELL=['/tracker.html','/app.html','/manifest.webmanifest','/images/blog/bottle-angle-correct-paced.jpg','/images/blog/bottle-angle-too-steep.jpg','/images/blog/calms-face-down-hold.jpg','/images/tiger-hold-errors.jpg','/images/latch-mechanism.jpg','/images/logo.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/api/'))return;
 e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)))});
