// Service worker simples: busca sempre na internet primeiro e,
// se estiver sem conexão, usa a última versão guardada.
const CACHE = 'times-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Só arquivos do próprio app; chamadas ao Supabase passam direto
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  event.respondWith(
    fetch(request)
      .then((resposta) => {
        const copia = resposta.clone()
        caches.open(CACHE).then((cache) => cache.put(request, copia))
        return resposta
      })
      .catch(() =>
        caches.match(request).then((salvo) => salvo || caches.match('/'))
      )
  )
})
