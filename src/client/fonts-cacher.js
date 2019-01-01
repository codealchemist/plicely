const CACHE_NAME = 'fonts'
const urls = ['https://fonts.googleapis.com/css?family=Raleway:200,400|Satisfy']
console.log('SW-EXTERNAL')

self.addEventListener('activate', event => {
  console.log('ACTIVATE', event)
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache', CACHE_NAME)
      return cache.addAll(urls)
    })
  )
})

self.addEventListener('fetch', event => {
  console.log('FETCH', event)
  event.respondWith(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.match(event.request, { ignoreSearch: true }))
      .then(response => {
        return response || fetch(event.request)
      })
  )

  // if (event.request.url.match(IS_GITHUB_REGEXP)) {

  // }
})
