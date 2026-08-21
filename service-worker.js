/* =========================================================
   ATUALIZE TELECOM
   SERVICE WORKER
   ========================================================= */

const CACHE_VERSION = "atualize-v20";

const ARQUIVOS_ESTATICOS = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./version.json",
    "./logo.png",
    "./xlsx.full.min.js"
];


/* =========================================================
   INSTALAÇÃO
   ========================================================= */

self.addEventListener("install", event => {

    console.log(
        "[Atualize] Instalando:",
        CACHE_VERSION
    );

    event.waitUntil(

        caches
            .open(CACHE_VERSION)
            .then(cache => {

                return cache.addAll(
                    ARQUIVOS_ESTATICOS
                );

            })

    );

    /*
       Ativa a nova versão imediatamente.
    */

    self.skipWaiting();

});


/* =========================================================
   ATIVAÇÃO
   ========================================================= */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches
            .keys()
            .then(chaves => {

                return Promise.all(

                    chaves.map(chave => {

                        if (
                            chave !== CACHE_VERSION &&
                            chave.startsWith("atualize-")
                        ) {

                            console.log(
                                "[Atualize] Removendo cache antigo:",
                                chave
                            );

                            return caches.delete(chave);

                        }

                        return null;

                    })

                );

            })
            .then(() => {

                return self.clients.claim();

            })

    );

});


/* =========================================================
   MENSAGEM
   ========================================================= */

self.addEventListener("message", event => {

    if (!event.data) return;


    /*
       O botão "Atualizar" do aplicativo
       pode mandar essa mensagem.
    */

    if (
        event.data === "SKIP_WAITING" ||
        event.data.type === "SKIP_WAITING"
    ) {

        self.skipWaiting();

    }

});


/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener("fetch", event => {

    const request = event.request;

    /*
       Só trabalhamos com GET.
    */

    if (request.method !== "GET") {
        return;
    }


    const url = new URL(request.url);


    /*
       Não interferir em requisições externas.
    */

    if (
        url.origin !== self.location.origin
    ) {

        return;

    }


    /*
       CLIENTES.JSON
       
       Sempre tenta buscar a versão atual
       na internet primeiro.

       Se estiver sem internet,
       usa a versão armazenada no cache.
    */

    if (
        url.pathname.endsWith("/clientes.json") ||
        url.pathname.endsWith("clientes.json")
    ) {

        event.respondWith(

            fetch(request, {
                cache: "no-store"
            })

            .then(response => {

                if (
                    response &&
                    response.ok
                ) {

                    const copia =
                        response.clone();

                    caches
                        .open(CACHE_VERSION)
                        .then(cache => {

                            cache.put(
                                request,
                                copia
                            );

                        });

                }

                return response;

            })

            .catch(() => {

                return caches.match(request);

            })

        );

        return;

    }


    /*
       VERSION.JSON
       
       Sempre busca a versão atual.
    */

    if (
        url.pathname.endsWith("/version.json") ||
        url.pathname.endsWith("version.json")
    ) {

        event.respondWith(

            fetch(request, {
                cache: "no-store"
            })

            .then(response => {

                if (
                    response &&
                    response.ok
                ) {

                    const copia =
                        response.clone();

                    caches
                        .open(CACHE_VERSION)
                        .then(cache => {

                            cache.put(
                                request,
                                copia
                            );

                        });

                }

                return response;

            })

            .catch(() => {

                return caches.match(request);

            })

        );

        return;

    }


    /*
       HTML / CSS / JS / imagens
       
       Primeiro tenta internet.
       Se estiver offline, usa cache.
    */

    event.respondWith(

        fetch(request)

        .then(response => {

            if (
                response &&
                response.ok
            ) {

                const copia =
                    response.clone();

                caches
                    .open(CACHE_VERSION)
                    .then(cache => {

                        cache.put(
                            request,
                            copia
                        );

                    });

            }

            return response;

        })

        .catch(() => {

            return caches.match(request)

                .then(cachedResponse => {

                    if (cachedResponse) {

                        return cachedResponse;

                    }

                    /*
                       Se não encontrou no cache,
                       tenta retornar index.html.
                    */

                    return caches.match(
                        "./index.html"
                    );

                });

        })

    );

});
