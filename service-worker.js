"use strict";

const CACHE_NAME = "finanpro-workbench-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./ultimate-ui.css",
  "./ultimate-ui.js",
  "./operation-workbench.css",
  "./operation-workbench.js",
  "./operation-core.js",
  "./operation-repository.js",
  "./product-rules.js",
  "./product-policies.json",
  "./product-flows.js",
  "./operation-calculators.js",
  "./collateral-evaluation.js",
  "./document-center.js",
  "./app.js",
  "./LOGO%20M%26M.png",
  "./LOGO%20VEGAMOTORS.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html"))));
});
