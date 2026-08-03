const CACHE = "atualize-v10";
self.addEventListener("message", event => {

    if (event.data === "SKIP_WAITING") {

        self.skipWaiting();

    }

});
const arquivos = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./clientes.json",
    "./logo.png",
    "./manifest.json",
    "./xlsx.full.min.js"
];

self.addEventListener("install", event => {
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(arquivos))
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        Promise.all([
            caches.keys().then(keys =>
                Promise.all(
                    keys
                        .filter(key => key !== CACHE)
                        .map(key => caches.delete(key))
                )
            ),
            self.clients.claim()
        ])
    );
});

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request)
            .then(response => {

                const copia = response.clone();

                caches.open(CACHE).then(cache => {
                    cache.put(event.request, copia);
                });

                return response;

            })
            .catch(() => caches.match(event.request))
    );

});
