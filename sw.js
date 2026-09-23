// Service worker: permite instalar no celular e abrir o app sem internet
// Troque o número da versão sempre que publicar uma atualização.
const CACHE = 'cv-vendas-v13';
const FILES = ['./', './index.html', './manifest.json', './logo.svg', './icon-192.png', './icon-512.png', './icon-180.png',
  './jspdf.umd.min.js', './cabecalho.jpg', './rodape.jpg', './marca-dagua.jpg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// Rede primeiro (pega sempre a versão mais nova); sem internet, usa o que está salvo
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const mesmoSite = new URL(e.request.url).origin === self.location.origin;
  // arquivos do app: sempre confere com o servidor (ignora o cache do navegador de 10 min do GitHub)
  const req = mesmoSite ? fetch(e.request.url, { cache: 'no-cache' }) : fetch(e.request);
  e.respondWith(
    req.then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request))
  );
});
