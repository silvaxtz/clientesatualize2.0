const CACHE = "atualize-v2-1.0.0";

const arquivos = [

    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./clientes.json",
    "./manifest.json",
    "./logo.png"

];

self.addEventListener("install", event => {

    self.skipWaiting();

    event.waitUntil(

        caches.open(CACHE)

        .then(cache => cache.addAll(arquivos))

    );

});

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()

        .then(keys =>

            Promise.all(

                keys

                .filter(key => key !== CACHE)

                .map(key => caches.delete(key))

            )

        )

    );

    self.clients.claim();

});

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") return;

    event.respondWith(

        caches.match(event.request)

        .then(cache => {

            return cache || fetch(event.request);

        })

    );

});
