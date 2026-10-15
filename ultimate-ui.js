"use strict";

(() => {
  const menu = document.querySelector("#workspaceMenu");
  const daily = document.querySelector("#dailyDashboard");
  const express = document.querySelector(".express-calculator");
  const homeButton = document.querySelector("#workspaceHomeBtn");
  const menuSearch = document.querySelector("#workspaceMenuSearch");
  if (!menu || !daily || !express) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const iconByTarget = {
    operations: "fa-diagram-project", quote: "fa-calculator", application: "fa-file-signature", preapplication: "fa-bolt",
    evaluation: "fa-clipboard-check", delivery: "fa-file-circle-check", collection: "fa-route",
    payment: "fa-receipt", agreement: "fa-handshake", "motorcycle-delivery": "fa-motorcycle",
    dossier: "fa-folder-open", promissory: "fa-file-contract", authorization: "fa-phone-volume",
    disbursement: "fa-circle-check", balance: "fa-file-invoice-dollar", "cash-close": "fa-cash-register",
    "credit-letter": "fa-envelope-open-text", notarial: "fa-stamp"
  };

  function safeSessionRead(key, fallback) {
    try { return JSON.parse(sessionStorage.getItem(key) || "") || fallback; } catch { return fallback; }
  }

  function safeSessionWrite(key, value) {
    try { sessionStorage.setItem(key, JSON.stringify(value)); } catch { /* Session history is optional. */ }
  }

  const overview = document.createElement("section");
  overview.className = "ultimate-overview";
  overview.setAttribute("aria-label", "Resumen y cálculo rápido");
  daily.before(overview);
  overview.append(daily, express);

  const hero = document.createElement("section");
  hero.className = "ultimate-home-hero";
  hero.innerHTML = `
    <div class="ultimate-home-hero__copy">
      <span class="ultimate-kicker"><i class="fa-solid fa-circle-nodes" aria-hidden="true"></i> Mesa de operaciones M&amp;M</span>
      <h2>Todo el crédito,<br><em>en una sola ruta.</em></h2>
      <p>Cotiza, verifica, formaliza y controla cada operación desde un espacio claro, conectado y listo para imprimir.</p>
      <div class="ultimate-hero-actions">
        <button class="ultimate-primary-action" type="button" data-ultimate-target="operations"><i class="fa-solid fa-plus" aria-hidden="true"></i> Nueva operación</button>
        <button class="ultimate-secondary-action" type="button" data-ultimate-target="preapplication"><i class="fa-solid fa-bolt" aria-hidden="true"></i> Pre-solicitud rápida</button>
      </div>
    </div>
    <aside class="ultimate-home-hero__route" aria-label="Ruta de una operación">
      <span class="ultimate-route-label">Ruta de trabajo</span>
      <ol>
        <li class="is-current"><b>01</b><span>Cotizar<small>Define monto y condiciones</small></span></li>
        <li><b>02</b><span>Verificar<small>Evalúa cliente y expediente</small></span></li>
        <li><b>03</b><span>Formalizar<small>Genera documentos y firmas</small></span></li>
        <li><b>04</b><span>Controlar<small>Cobra y da seguimiento</small></span></li>
      </ol>
    </aside>`;
  overview.before(hero);

  const recent = document.createElement("section");
  recent.className = "ultimate-recent";
  recent.innerHTML = `<div><span class="ultimate-kicker">Continuar trabajando</span><h2>Accesos recientes</h2></div><div class="ultimate-recent__items" id="ultimateRecentItems"></div>`;
  menu.querySelector(".workspace-menu-intro")?.after(recent);

  const toolMap = new Map();
  document.querySelectorAll(".workspace-choice[data-workspace-target]").forEach((entry) => {
    const target = entry.dataset.workspaceTarget;
    toolMap.set(target, { target, title: entry.querySelector("b")?.textContent.trim() || target, description: entry.querySelector("small")?.textContent.trim() || "Abrir herramienta" });
  });

  function openTarget(target) {
    if (typeof window.selectCotizadorWorkspace === "function") window.selectCotizadorWorkspace(target);
    rememberTool(target);
    requestAnimationFrame(() => document.querySelector(`#documentWorkspace-${CSS.escape(target)}`)?.querySelector("form")?._ultimateRefresh?.());
  }

  function renderRecent() {
    const host = document.querySelector("#ultimateRecentItems");
    if (!host) return;
    const stored = safeSessionRead("mm-recent-tools", []).filter((target) => toolMap.has(target)).slice(0, 3);
    const targets = stored.length ? stored : ["operations", "quote", "payment"].filter((target) => toolMap.has(target));
    host.innerHTML = targets.map((target) => {
      const tool = toolMap.get(target);
      return `<button type="button" data-recent-target="${target}"><i class="fa-solid ${iconByTarget[target] || "fa-arrow-right"}" aria-hidden="true"></i><span><b>${tool.title}</b><small>${tool.description}</small></span><em>Abrir <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></em></button>`;
    }).join("");
    host.querySelectorAll("[data-recent-target]").forEach((button) => button.addEventListener("click", () => openTarget(button.dataset.recentTarget)));
  }

  function rememberTool(target) {
    if (!toolMap.has(target)) return;
    const stored = safeSessionRead("mm-recent-tools", []).filter((item) => item !== target);
    safeSessionWrite("mm-recent-tools", [target, ...stored].slice(0, 5));
    renderRecent();
  }

  document.querySelectorAll("[data-ultimate-target]").forEach((button) => button.addEventListener("click", () => openTarget(button.dataset.ultimateTarget)));
  document.querySelectorAll("[data-workspace-target]").forEach((button) => button.addEventListener("click", () => {
    const target = button.dataset.workspaceTarget;
    rememberTool(target);
    requestAnimationFrame(() => {
      const workspace = document.querySelector(`#documentWorkspace-${CSS.escape(target)}`) || ({
        application: document.querySelector("#creditApplication"), delivery: document.querySelector("#deliveryDocuments"),
        evaluation: document.querySelector("#evaluationWorkspace"), collection: document.querySelector("#collectionWorkspace"),
        preapplication: document.querySelector("#preApplicationWorkspace")
      })[target];
      workspace?.querySelector("form")?._ultimateRefresh?.();
    });
  }));
  renderRecent();

  const homeTitle = menu.querySelector(".workspace-menu-intro h2");
  const homeCopy = menu.querySelector(".workspace-menu-intro p");
  if (homeTitle) homeTitle.textContent = "¿Qué necesitas hacer ahora?";
  if (homeCopy) homeCopy.textContent = "Elige una etapa o busca directamente por nombre. Cada herramienta conserva la misma lógica de captura, revisión y resultado.";

  const searchLabel = menu.querySelector(".workspace-menu-search");
  if (searchLabel && !searchLabel.querySelector("kbd")) searchLabel.insertAdjacentHTML("beforeend", "<kbd>Ctrl K</kbd>");
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (menu.hidden) homeButton?.click();
      requestAnimationFrame(() => menuSearch?.focus());
    }
    if (event.key === "Escape" && document.activeElement === menuSearch) {
      menuSearch.value = "";
      menuSearch.dispatchEvent(new Event("input", { bubbles: true }));
      menuSearch.blur();
    }
  });

  function fieldLabel(field) {
    const label = field.closest("label");
    if (!label) return field.name || "Dato requerido";
    const clone = label.cloneNode(true);
    clone.querySelectorAll("input, select, textarea, small, span, b").forEach((node) => node.remove());
    return clone.textContent.replace(/\s+/g, " ").trim() || field.name || "Dato requerido";
  }

  function isVisible(field) {
    return !field.disabled && !field.closest("[hidden]") && field.type !== "hidden";
  }

  function enhanceForm(workspace, label) {
    const form = workspace.querySelector(":scope > form");
    if (!form || form.classList.contains("ultimate-enhanced-form")) return;
    const children = [...form.children];
    if (children.length < 2) return;
    const main = document.createElement("div");
    main.className = "ultimate-form-main";
    children.forEach((child) => main.append(child));

    const rail = document.createElement("aside");
    rail.className = "ultimate-progress-rail";
    rail.setAttribute("aria-label", `Estado de ${label}`);
    rail.innerHTML = `
      <div class="ultimate-progress-rail__head"><span><i class="fa-solid fa-list-check" aria-hidden="true"></i></span><div><small>Estado del proceso</small><h3>${label}</h3></div></div>
      <div class="ultimate-progress-ring" data-progress-ring><strong>0%</strong><span>completado</span></div>
      <div class="ultimate-progress-copy"><b data-progress-title>Comienza con los datos principales</b><p data-progress-copy>El panel se actualiza mientras completas el formulario.</p></div>
      <div class="ultimate-missing" data-missing><span>Campos pendientes</span><ol></ol></div>
      <nav class="ultimate-section-nav" aria-label="Secciones del formulario"></nav>
      <button class="ultimate-next-field" type="button" data-next-field><span>Ir al siguiente pendiente</span><i class="fa-solid fa-arrow-down" aria-hidden="true"></i></button>`;
    form.append(main, rail);
    form.classList.add("ultimate-enhanced-form");

    const sectionNav = rail.querySelector(".ultimate-section-nav");
    [...main.children].filter((section) => section.matches("section")).slice(0, 6).forEach((section, index) => {
      const heading = section.querySelector("h2, h3, legend")?.textContent.trim();
      if (!heading) return;
      if (!section.id) section.id = `ultimate-${workspace.id || "form"}-${index + 1}`;
      const button = document.createElement("button");
      button.type = "button";
      button.innerHTML = `<b>${String(index + 1).padStart(2, "0")}</b><span>${heading}</span>`;
      button.addEventListener("click", () => section.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "start" }));
      sectionNav.append(button);
    });

    function refresh() {
      const required = [...form.querySelectorAll("[required]")].filter(isVisible);
      const complete = required.filter((field) => {
        if ((field.type === "checkbox" || field.type === "radio")) return field.checked || (field.type === "radio" && form.querySelector(`[name="${CSS.escape(field.name)}"]:checked`));
        return String(field.value || "").trim() !== "";
      });
      const missing = required.filter((field) => !complete.includes(field));
      const percent = required.length ? Math.round((complete.length / required.length) * 100) : 100;
      rail.style.setProperty("--progress", `${percent * 3.6}deg`);
      rail.querySelector("[data-progress-ring] strong").textContent = `${percent}%`;
      rail.querySelector("[data-progress-title]").textContent = percent === 100 ? "Información lista para revisar" : percent >= 60 ? "Buen avance, faltan pocos datos" : percent ? "Continúa completando la operación" : "Comienza con los datos principales";
      rail.querySelector("[data-progress-copy]").textContent = percent === 100 ? "Revisa el contenido antes de guardar o imprimir." : `${missing.length} ${missing.length === 1 ? "campo esencial pendiente" : "campos esenciales pendientes"}.`;
      const list = rail.querySelector("[data-missing] ol");
      list.innerHTML = missing.slice(0, 4).map((field) => `<li>${fieldLabel(field)}</li>`).join("") || "<li class=\"is-complete\"><i class=\"fa-solid fa-circle-check\"></i> Datos esenciales completos</li>";
      rail.querySelector("[data-next-field]").disabled = missing.length === 0;
      rail.dataset.ready = String(missing.length === 0);
      rail._firstMissing = missing[0] || null;
    }

    rail.querySelector("[data-next-field]").addEventListener("click", () => {
      const field = rail._firstMissing;
      field?.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth", block: "center" });
      window.setTimeout(() => field?.focus(), reduceMotion.matches ? 0 : 280);
    });
    form.addEventListener("input", refresh);
    form.addEventListener("change", refresh);
    form.addEventListener("reset", () => requestAnimationFrame(refresh));
    form._ultimateRefresh = refresh;
    refresh();
  }

  const structured = [
    ["#creditApplication", "Solicitud de crédito"], ["#deliveryDocuments", "Entrega de documentos"],
    ["#evaluationWorkspace", "Visita de evaluación"], ["#collectionWorkspace", "Visita de cobro"],
    ["#preApplicationWorkspace", "Pre-solicitud"]
  ];
  structured.forEach(([selector, label]) => {
    const workspace = document.querySelector(selector);
    if (workspace) enhanceForm(workspace, label);
  });
  document.querySelectorAll(".document-workspace").forEach((workspace) => enhanceForm(workspace, workspace.dataset.workspaceTitle || "Documento"));

  document.querySelectorAll(".document-workspace").forEach((workspace) => {
    const form = workspace.querySelector("form");
    const rail = workspace.querySelector(".ultimate-progress-rail");
    const print = form?.querySelector("[data-print]");
    if (!form || !rail || !print) return;
    const printState = document.createElement("div");
    printState.className = "ultimate-print-readiness";
    printState.innerHTML = `<i class="fa-solid fa-print" aria-hidden="true"></i><span><b>Control de impresión</b><small>Completa la información esencial para generar la hoja final.</small></span>`;
    rail.querySelector(".ultimate-progress-copy")?.before(printState);
    print.addEventListener("click", () => {
      const ready = rail.dataset.ready === "true";
      printState.classList.toggle("is-ready", ready);
      printState.querySelector("b").textContent = ready ? "Documento preparado" : "Impresión bloqueada";
      printState.querySelector("small").textContent = ready ? "La versión final utiliza los datos mostrados." : "Revisa los campos señalados antes de imprimir.";
    });
  });

  function addWorkspaceNavigation(workspace) {
    if (workspace.querySelector(":scope > .ultimate-workspace-nav")) return;
    const title = workspace.dataset.workspaceTitle || workspace.querySelector("h1, h2")?.textContent.trim() || "Herramienta";
    const nav = document.createElement("nav");
    nav.className = "ultimate-workspace-nav";
    nav.setAttribute("aria-label", "Navegación de la herramienta");
    nav.innerHTML = `<button type="button" data-ultimate-home><i class="fa-solid fa-house" aria-hidden="true"></i><span>Inicio</span></button><i class="fa-solid fa-chevron-right" aria-hidden="true"></i><strong>${title}</strong><span class="ultimate-workspace-nav__hint">Cambiar de herramienta</span>`;
    nav.querySelector("[data-ultimate-home]").addEventListener("click", () => homeButton?.click());
    workspace.prepend(nav);
  }

  document.querySelectorAll(".workspace").forEach(addWorkspaceNavigation);
})();
