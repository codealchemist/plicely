const CACHE_NAME = 'fonts'
console.log('SW-EXTERNAL')
const regex = /.*fonts.googleapis.com.*|.*fonts.gstatic.com.*/

self.addEventListener('fetch', event => {
  const request = event.request
  const { url } = request

  if (url.match(regex)) {
    console.log('FETCH URL', url)

    event.respondWith(
      caches.match(request).then(response => {
        // Return from cache.
        if (response) {
          console.log('RETURN CACHED', url)
          return response
        }

        // Fetch data.
        const fetchRequest = request.clone()
        return fetch(fetchRequest).then(response => {
          console.log('RESPONSE', response)
          // Check if we received a valid response
          if (!response || [400, 404, 500].includes(response.status)) {
            return response
          }

          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then(cache => {
            console.log('CACHE PUT', url)
            cache.put(request, responseToCache)
          })

          return response
        })
      })
    )
  }
})
