const CACHE = "atualize-v31";


const ARQUIVOS = [
    "./",
    "./index.html",
    "./style.css?v=31",
    "./script.js?v=31",
    "./clientes.json",
    "./logo.png",
    "./logo-512.png",
    "./manifest.json",
    "./xlsx.full.min.js",
    "./version.json"
];


/* =========================================================
   INSTALL
========================================================= */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(CACHE)
                .then(
                    cache =>
                        cache.addAll(
                            ARQUIVOS
                        )
                )

        );

        self.skipWaiting();

    }
);


/* =========================================================
   ACTIVATE
========================================================= */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()
                .then(
                    chaves =>

                        Promise.all(

                            chaves
                                .filter(
                                    chave =>
                                        chave !== CACHE
                                )
                                .map(
                                    chave =>
                                        caches.delete(
                                            chave
                                        )
                                )

                        )

                )
                .then(
                    () =>
                        self.clients.claim()
                )

        );

    }
);


/* =========================================================
   SKIP WAITING
========================================================= */

self.addEventListener(
    "message",
    event => {

        if (
            event.data ===
            "SKIP_WAITING"
        ) {

            self.skipWaiting();

        }

    }
);


/* =========================================================
   FETCH
========================================================= */

self.addEventListener(
    "fetch",
    event => {

        if (
            event.request.method !==
            "GET"
        ) {

            return;

        }


        /*
           Sempre tenta buscar a versão
           mais nova primeiro.
        */

        event.respondWith(

            fetch(
                event.request,
                {
                    cache:
                        "no-store"
                }
            )

            .then(
                resposta => {

                    const copia =
                        resposta.clone();


                    caches
                        .open(CACHE)
                        .then(
                            cache => {

                                cache.put(
                                    event.request,
                                    copia
                                );

                            }
                        );


                    return resposta;

                }
            )

            .catch(
                () =>
                    caches.match(
                        event.request
                    )
            )

        );

    }
);
