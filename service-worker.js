/* =========================================================
   ATUALIZE TELECOM
   SERVICE WORKER - V2
   ========================================================= */

const CACHE_NAME = "atualize-telecom-v2";

const ARQUIVOS = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./clientes.json",
    "./logo.png",
    "./logo-192.png",
    "./logo-512.png",
    "./manifest.json",
    "./xlsx.full.min.js",
    "./version.json"
];


/* =========================================================
   INSTALAÇÃO
   ========================================================= */

self.addEventListener("install", event => {

    console.log(
        "[SW] Instalando nova versão..."
    );

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {

                return cache.addAll(
                    ARQUIVOS
                );

            })
            .then(() => {

                return self.skipWaiting();

            })

    );
});


/* =========================================================
   ATIVAÇÃO
   ========================================================= */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys()
            .then(keys => {

                return Promise.all(

                    keys
                        .filter(
                            key =>
                                key !== CACHE_NAME
                        )
                        .map(
                            key =>
                                caches.delete(key)
                        )

                );

            })
            .then(() => {

                return self.clients.claim();

            })

    );

});


/* =========================================================
   RECEBER COMANDOS DO APP
   ========================================================= */

self.addEventListener(
    "message",
    event => {

        if (
            event.data &&
            event.data.type === "SKIP_WAITING"
        ) {

            self.skipWaiting();

        }

    }
);


/* =========================================================
   BUSCAR ARQUIVOS
   ========================================================= */

self.addEventListener(
    "fetch",
    event => {

        if (
            event.request.method !== "GET"
        ) {
            return;
        }


        /*
           Não intercepta requisições
           externas.
        */

        const url =
            new URL(
                event.request.url
            );


        if (
            url.origin !== self.location.origin
        ) {

            return;
        }


        event.respondWith(

            fetch(event.request)

                .then(response => {

                    /*
                       Só guarda respostas
                       válidas.
                    */

                    if (
                        response &&
                        response.status === 200
                    ) {

                        const copia =
                            response.clone();


                        caches.open(
                            CACHE_NAME
                        )
                        .then(cache => {

                            cache.put(
                                event.request,
                                copia
                            );

                        });

                    }


                    return response;

                })

                .catch(() => {

                    /*
                       Sem internet:
                       tenta entregar
                       do cache.
                    */

                    return caches.match(
                        event.request
                    );

                })

        );

    }
);


/* =========================================================
   ATUALIZAÇÃO FORÇADA DO CACHE
   ========================================================= */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches.open(
                CACHE_NAME
            )
            .then(cache => {

                return cache.addAll(
                    ARQUIVOS
                );

            })

        );

    }
);
