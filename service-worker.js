"use strict";

const CACHE_NAME = "mym-financiamiento-home-v14-vfx";
const APP_SHELL = [
  "./financing-crm.js",
  "./financing-crm-core.js",
  "./financing-crm.css",
  "./financing-form-bridge.js",
  "./bank-dashboard.js",
  "./bank-dashboard.css",
  "./system-home.css",
  "./system-home.js",
  "./system-navigation.js",
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
  "./pagare-notarial.css",
  "./pagare-notarial.js",
  "./document-engine/page-geometry.js",
  "./document-engine/document-blocks.js",
  "./document-engine/pagination-engine.js",
  "./document-engine/line-finisher.js",
  "./document-engine/document-layout-contract.js",
  "./document-engine/notarial-fonts.js",
  "./document-engine/notarial-debtors.js",
  "./escudo-notarial.png",
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
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
    }
    return response;
  }).catch(async () => {
    const cached = await caches.match(event.request, { ignoreSearch: true });
    if (cached) return cached;
    if (event.request.mode === "navigate") return (await caches.match("./index.html")) || Response.error();
    return Response.error();
  }));
});
