// 레푸스 근무표 — 한 번 열면 인터넷 없이도 열리도록 파일을 저장해 둡니다.
var CACHE = 'refuss-roster-v4';
var FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
// 새 버전이 있으면 받아 쓰고, 인터넷이 없으면 저장해 둔 파일로 엽니다.
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  // 우리 앱 파일, Firebase 프로그램, 글씨체 파일만 저장 (실시간 연결 통신은 건드리지 않음)
  var u = new URL(e.request.url);
  var OK = ['www.gstatic.com','hangeul.pstatic.net','fonts.googleapis.com','fonts.gstatic.com'];
  if(u.origin !== location.origin && OK.indexOf(u.hostname) < 0) return;
  // 우리 앱 화면 파일은 브라우저 임시 저장(최대 10분)을 건너뛰고 늘 최신으로 받아 옵니다.
  var fresh = (u.origin === location.origin) ? fetch(e.request.url, {cache:'no-cache', credentials:'same-origin'}) : fetch(e.request);
  e.respondWith(
    fresh.then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      return res;
    }).catch(function(){
      return caches.match(e.request).then(function(r){ return r || caches.match('./index.html'); });
    })
  );
});
