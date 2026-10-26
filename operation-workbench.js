"use strict";

(() => {
  const Core = window.OperationCore;
  const Repository = window.OperationRepository;
  const Rules = window.ProductRules;
  const Flows = window.ProductFlows;
  const Calc = window.OperationCalculators;
  const Collateral = window.CollateralEvaluation;
  const Documents = window.DocumentCenter;
  const shell = document.querySelector(".app-shell");
  const commercialMenu = document.querySelector("#commercialMenuCards");
  if (!Core || !Repository || !Rules || !Flows || !Calc || !Collateral || !Documents || !shell || !commercialMenu) return;

  const escape = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const money = (value) => `RD$${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0)}`;
  const getPath = (source, path) => path.split(".").reduce((value, key) => value?.[key], source);
  const patchAtPath = (path, value) => {
    const parts = path.split(".");
    const changes = {};
    let cursor = changes;
    parts.forEach((part, index) => { if (index === parts.length - 1) cursor[part] = value; else cursor = cursor[part] = {}; });
    operation = Core.patch(operation, changes);
  };
  const inputValue = (field, value) => field.type === "checkbox" ? Boolean(value) : value ?? "";

  let operation = Repository.load() || Core.create("personal_loan");
  let dirty = false;

  const menuButton = document.createElement("button");
  menuButton.type = "button";
  menuButton.className = "workspace-choice workspace-choice--operations";
  menuButton.dataset.workspaceTarget = "operations";
  menuButton.dataset.toolLabel = "Proceso completo";
  menuButton.innerHTML = '<span><i class="fa-solid fa-diagram-project"></i></span><b>Mesa unificada</b><small>Compra, vende, financia, evalúa garantías y prepara el expediente completo.</small><em>Crear operación <i class="fa-solid fa-arrow-right"></i></em>';
  commercialMenu.prepend(menuButton);

  const workspace = document.createElement("section");
  workspace.className = "workspace operation-workbench";
  workspace.id = "operationWorkbench";
  workspace.dataset.workspaceTitle = "Mesa unificada";
  workspace.hidden = true;
  workspace.innerHTML = `
    <header class="operation-hero">
      <div><span class="operation-hero__eyebrow"><i class="fa-solid fa-circle-nodes"></i> Expediente conectado</span><h2>Compra, venta y financiamiento</h2><p>Una sola operación alimenta evaluación, garantías, documentos, entrega y control.</p></div>
      <div class="operation-hero__reference"><small>Referencia activa</small><strong id="operationReference"></strong><span id="operationSaveState"><i></i> Guardado en este navegador</span></div>
    </header>
    <div class="operation-commandbar">
      <div><button type="button" data-operation-new><i class="fa-regular fa-file"></i> Nueva</button><button type="button" data-operation-duplicate><i class="fa-regular fa-copy"></i> Duplicar</button></div>
      <p class="operation-notice" id="operationNotice" role="status" aria-live="polite"></p>
      <div><input type="file" accept="application/json" data-operation-file hidden><button type="button" data-operation-import><i class="fa-solid fa-upload"></i> Importar</button><button type="button" data-operation-export><i class="fa-solid fa-download"></i> Exportar expediente</button></div>
    </div>
    <form class="operation-form" id="operationForm" novalidate autocomplete="off">
      <main class="operation-main">
        <section class="operation-product-section" aria-labelledby="operationProductTitle"><div class="operation-section-heading"><span>Inicio</span><div><h3 id="operationProductTitle">Selecciona el proceso</h3><p>El producto define formulario, controles, documentos y siguiente paso.</p></div></div><div class="operation-product-grid" id="operationProductGrid"></div></section>
        <nav class="operation-stage-nav" id="operationStageNav" aria-label="Etapas de la operación"></nav>
        <div class="operation-sections" id="operationSections"></div>
      </main>
      <aside class="operation-sidebar">
        <section class="operation-readiness-card"><div><span>Preparación del expediente</span><strong id="operationReadiness">0% listo</strong></div><div class="operation-readiness-track"><i id="operationReadinessBar"></i></div><p id="operationReadinessCopy">Completa la información esencial.</p></section>
        <section class="operation-live-card"><header><span><i class="fa-solid fa-calculator"></i></span><div><small>Resultado financiero</small><h3>Propuesta activa</h3></div></header><div id="operationProposalSummary" class="operation-proposal-summary"></div><div id="operationPlanComparison" class="operation-plan-comparison"></div></section>
        <section class="operation-live-card" id="operationDecisionCard"><header><span><i class="fa-solid fa-gauge-high"></i></span><div><small>Análisis orientativo</small><h3>Capacidad y control</h3></div></header><div id="operationDecisionSummary"></div></section>
        <section class="operation-live-card"><header><span><i class="fa-solid fa-folder-tree"></i></span><div><small>Documentos vinculados</small><h3>Centro documental</h3></div></header><div id="operationDocumentList" class="operation-document-list"></div></section>
        <button class="operation-next-action" type="button" id="operationNextAction"><span><small>Siguiente acción recomendada</small><b>Completar datos pendientes</b></span><i class="fa-solid fa-arrow-right"></i></button>
      </aside>
    </form>`;
  shell.append(workspace);

  const form = workspace.querySelector("#operationForm");
  const productGrid = workspace.querySelector("#operationProductGrid");
  const sectionsHost = workspace.querySelector("#operationSections");
  const stageNav = workspace.querySelector("#operationStageNav");

  function productCards() {
    const abbreviations = { motorcycle_cash_sale: "MV", motorcycle_financing: "MF", personal_loan: "PP", commercial_loan: "PC", vehicle_secured_loan: "GV", mortgage_secured_loan: "GH", smartphone_financing: "SM", appliance_financing: "EL" };
    productGrid.innerHTML = Rules.list().map((product) => `<button type="button" data-operation-product="${product.type}" class="${product.type === operation.productType ? "is-selected" : ""}"><i aria-hidden="true">${abbreviations[product.type] || "OP"}</i><span><b>${escape(product.label)}</b><small>${product.family === "secured" ? "Crédito con garantía real" : product.family === "sale" ? "Venta y rentabilidad" : "Evaluación y documentos"}</small></span><em>${product.type === operation.productType ? "Activo" : "Elegir"}</em></button>`).join("");
    productGrid.querySelectorAll("[data-operation-product]").forEach((button) => button.addEventListener("click", () => selectProduct(button.dataset.operationProduct)));
  }

  function control(field) {
    const value = getPath(operation, field.path);
    const attrs = `data-operation-path="${field.path}"${field.required ? " required" : ""}${field.readonly ? " readonly" : ""}${field.step ? ` step="${field.step}"` : ""}${field.autocomplete ? ` autocomplete="${field.autocomplete}"` : ""}`;
    if (field.type === "checkbox") return `<label class="operation-check ${field.wide ? "is-wide" : ""}"><input type="checkbox" ${attrs}${value ? " checked" : ""}><span><i></i><b>${escape(field.label)}</b></span></label>`;
    if (field.type === "textarea") return `<label class="${field.wide ? "is-wide" : ""}"><span>${escape(field.label)}</span><textarea ${attrs}>${escape(value || "")}</textarea></label>`;
    if (field.type === "select") return `<label class="${field.wide ? "is-wide" : ""}"><span>${escape(field.label)}</span><select ${attrs}><option value="">Selecciona</option>${(field.options || []).map((option) => { const [key, label = key] = option.split("|"); return `<option value="${escape(key)}"${String(value) === key ? " selected" : ""}>${escape(label)}</option>`; }).join("")}</select></label>`;
    const type = field.type === "money" ? "number" : field.type;
    const input = `<input type="${type}" ${attrs} value="${escape(inputValue(field, value))}"${field.type === "money" ? ' min="0" step="0.01" inputmode="decimal"' : ""}>`;
    return `<label class="${field.wide ? "is-wide" : ""}"><span>${escape(field.label)}</span>${field.type === "money" ? `<span class="operation-money"><b>RD$</b>${input}</span>` : input}</label>`;
  }

  function renderForm() {
    productCards();
    const product = Rules.get(operation.productType);
    stageNav.innerHTML = product.stages.map((stage, index) => `<span class="${index === 0 ? "is-active" : ""}"><b>${String(index + 1).padStart(2, "0")}</b>${escape(stage.replaceAll("_", " "))}</span>`).join("");
    sectionsHost.innerHTML = Flows.sections(operation.productType).map((item, index) => {
      if (item.id === "review") return `<section class="operation-section operation-review-section" id="operation-section-${item.id}"><div class="operation-section-heading"><span>${String(index + 1).padStart(2, "0")}</span><div><h3>${escape(item.label)}</h3><p>${escape(item.description)}</p></div></div><div class="operation-review-message"><i class="fa-solid fa-list-check"></i><p>El resumen lateral muestra los datos pendientes, la propuesta y los documentos aplicables.</p></div></section>`;
      return `<section class="operation-section" id="operation-section-${item.id}"><div class="operation-section-heading"><span>${String(index + 1).padStart(2, "0")}</span><div><h3>${escape(item.label)}</h3><p>${escape(item.description || "")}</p></div></div><div class="operation-fields">${item.fields.map(control).join("")}${item.id === "customer" && operation.people.codebtor ? [
        { path: "people.codebtor.fullName", label: "Nombre del codeudor solidario", type: "text", required: true },
        { path: "people.codebtor.idNumber", label: "Cédula del codeudor", type: "text", required: true },
        { path: "people.codebtor.address", label: "Domicilio del codeudor", type: "text", required: true, wide: true }
      ].map(control).join("") : ""}</div></section>`;
    }).join("");
    form.querySelectorAll("[data-operation-path]").forEach((input) => { input.addEventListener("input", onInput); input.addEventListener("change", onInput); });
    renderSummary();
  }

  function onInput(event) {
    const input = event.target;
    const path = input.dataset.operationPath;
    if (!path) return;
    if (path === "people.hasCodebtor") {
      patchAtPath("people.codebtor", input.checked ? { role: "solidary_codebtor" } : null);
      dirty = true; persist(); renderForm(); return;
    }
    const numeric = ["number", "range"].includes(input.type);
    patchAtPath(path, input.type === "checkbox" ? input.checked : numeric ? (input.value === "" ? "" : Number(input.value)) : input.value);
    if (path.startsWith("evaluation.business.")) updateBusinessCashflow();
    dirty = true;
    persist();
    renderSummary();
  }

  function updateBusinessCashflow() {
    const business = operation.evaluation?.business || {};
    const result = Calc.calculateCommercialCoverage({ ...business, proposedPayment: currentProposal()?.installment || 0 });
    patchAtPath("evaluation.business.availableCashflow", result.availableCashflow);
    const field = form.querySelector('[data-operation-path="evaluation.business.availableCashflow"]');
    if (field) field.value = result.availableCashflow || "";
  }

  function currentProposal() {
    const proposal = operation.proposal || {};
    const principal = Number(proposal.principal) || Math.max(0, Number(proposal.price || 0) - Number(proposal.downPayment || 0));
    try { return Calc.calculateProposal({ ...proposal, principal, frequency: proposal.frequency || "monthly" }); } catch { return null; }
  }

  function renderSummary() {
    workspace.querySelector("#operationReference").textContent = operation.reference;
    workspace.querySelector("#operationSaveState").classList.toggle("is-pending", dirty);
    workspace.querySelector("#operationSaveState").innerHTML = `<i></i> ${dirty ? "Cambios pendientes de guardar" : "Guardado · " + new Date(operation.updatedAt).toLocaleTimeString("es-DO")}`;
    const completion = Flows.completion(operation.productType, operation);
    workspace.querySelector("#operationReadiness").textContent = `${completion.percent}% listo`;
    workspace.querySelector("#operationReadinessBar").style.width = `${completion.percent}%`;
    workspace.querySelector("#operationReadinessCopy").textContent = completion.ready ? "Información esencial completa. Revisa antes de formalizar." : `Pendiente: ${completion.blockers.slice(0, 3).join(", ")}.`;
    const proposal = currentProposal();
    workspace.querySelector("#operationProposalSummary").innerHTML = proposal ? `<div><span>Capital</span><b>${money(proposal.principal)}</b></div><div class="is-highlight"><span>Cuota estimada</span><strong>${money(proposal.installment)}</strong><small>${proposal.paymentCount} pagos</small></div><div><span>Intereses</span><b>${money(proposal.interest)}</b></div><div><span>Total programado</span><b>${money(proposal.total)}</b></div>` : '<p class="operation-empty">Completa capital, tasa y plazo para calcular.</p>';
    renderComparisons(proposal);
    renderDecision(proposal);
    renderDocuments();
    const next = workspace.querySelector("#operationNextAction");
    next.querySelector("b").textContent = completion.ready ? "Revisar documentos disponibles" : `Completar ${completion.blockers[0] || "expediente"}`;
    next.onclick = () => { const missing = Rules.requirements(operation.productType, operation).find((item) => completion.blockers.includes(item.label)); const target = missing ? form.querySelector(`[data-operation-path="${missing.path}"]`) : workspace.querySelector("#operationDocumentList"); target?.scrollIntoView({ behavior: "smooth", block: "center" }); target?.focus?.(); };
  }

  function renderComparisons(proposal) {
    const host = workspace.querySelector("#operationPlanComparison");
    if (!proposal) { host.innerHTML = ""; return; }
    const product = Rules.get(operation.productType);
    if (!product.termOptions?.some((term) => term > 0)) { host.innerHTML = ""; return; }
    const plans = Calc.compareProposals({ principal: proposal.principal, monthlyRate: Number(operation.proposal.monthlyRate) || product.suggestedMonthlyRate || 0, termOptions: product.termOptions, frequency: operation.proposal.frequency || "monthly" });
    const labels = { lowest_payment: "Cuota más baja", balanced: "Equilibrada", lowest_cost: "Menor costo" };
    host.innerHTML = `<span>Comparar alternativas</span>${plans.map((plan) => `<button type="button" data-plan-term="${plan.term}"><b>${labels[plan.key]}</b><strong>${money(plan.installment)}</strong><small>${plan.term} meses · total ${money(plan.total)}</small></button>`).join("")}`;
    host.querySelectorAll("[data-plan-term]").forEach((button) => button.addEventListener("click", () => { patchAtPath("proposal.term", Number(button.dataset.planTerm)); dirty = true; persist(); renderForm(); }));
  }

  function renderDecision(proposal) {
    const host = workspace.querySelector("#operationDecisionSummary");
    if (operation.productType === "motorcycle_cash_sale") {
      const margin = Calc.calculateMargin({ purchaseCost: operation.asset.purchaseCost, transport: operation.asset.transportCost, preparation: operation.asset.preparationCost, accessories: operation.asset.accessoryCost, otherCosts: operation.asset.otherCosts, salePrice: operation.proposal.price, discount: operation.proposal.discount });
      host.innerHTML = `<dl><div><dt>Costo total</dt><dd>${money(margin.totalCost)}</dd></div><div><dt>Venta neta</dt><dd>${money(margin.netSale)}</dd></div><div><dt>Margen bruto</dt><dd>${money(margin.grossMargin)} · ${margin.marginPercent}%</dd></div></dl><p>Información interna; no se imprime en la cotización.</p>`;
      return;
    }
    if (operation.productType === "commercial_loan") {
      const result = Calc.calculateCommercialCoverage({ ...(operation.evaluation.business || {}), proposedPayment: proposal?.installment || 0 });
      host.innerHTML = `<dl><div><dt>Flujo disponible</dt><dd>${money(result.availableCashflow)}</dd></div><div><dt>Cobertura de cuota</dt><dd>${result.coverageRatio.toFixed(2)}×</dd></div></dl><p>Resultado orientativo sujeto a evaluación.</p>`;
      return;
    }
    if (operation.productType === "vehicle_secured_loan" || operation.productType === "mortgage_secured_loan") {
      const data = { ...(operation.collateral || {}), principal: proposal?.principal || Number(operation.proposal.principal) || 0 };
      const result = operation.productType === "vehicle_secured_loan" ? Collateral.evaluateVehicleCollateral(data) : Collateral.evaluateMortgageCollateral(data);
      host.innerHTML = `<dl><div><dt>Relación préstamo/valor</dt><dd>${result.loanToValue.toFixed(2)}%</dd></div><div><dt>Valor admisible</dt><dd>${money(result.admissibleValue)}</dd></div><div><dt>Cobertura</dt><dd>${result.coverageRatio.toFixed(2)}×</dd></div></dl><p class="${result.sufficient ? "is-ok" : "is-alert"}">${result.sufficient ? "Cobertura matemática suficiente; requiere revisión documental." : "Cobertura insuficiente o pendiente de valoración."}</p>`;
      return;
    }
    const capacity = Calc.calculateCapacity({ monthlyIncome: operation.evaluation.monthlyIncome, monthlyCommitments: operation.evaluation.monthlyCommitments, proposedPayment: proposal?.installment || 0 });
    host.innerHTML = `<dl><div><dt>Capacidad disponible</dt><dd>${money(capacity.availableForNewPayment)}</dd></div><div><dt>Cuota propuesta</dt><dd>${money(capacity.proposedPayment)}</dd></div><div><dt>Relación total</dt><dd>${capacity.ratio.toFixed(2)}%</dd></div></dl><p class="${capacity.withinCapacity ? "is-ok" : "is-alert"}">${capacity.withinCapacity ? "Dentro de la referencia del 35%; requiere evaluación." : "Revisar monto, cuota o compromisos."}</p>`;
  }

  function renderDocuments() {
    const host = workspace.querySelector("#operationDocumentList");
    host.innerHTML = Documents.available(operation).map((documentItem) => `<article class="${documentItem.ready ? "is-ready" : "is-blocked"}"><i class="fa-solid ${documentItem.ready ? "fa-circle-check" : "fa-lock"}"></i><span><b>${escape(documentItem.label)}</b><small>${documentItem.ready ? "Datos esenciales completos" : `${documentItem.blockers.length} pendientes`}</small></span>${documentItem.target ? `<button type="button" data-document-target="${documentItem.target}"${documentItem.ready ? "" : " disabled"}>Abrir</button>` : "<em>Preparado para integrar</em>"}</article>`).join("");
    host.querySelectorAll("[data-document-target]").forEach((button) => button.addEventListener("click", () => openExisting(button.dataset.documentTarget)));
  }

  function openExisting(target) {
    sessionStorage.setItem("mm-operation-document-bridge", JSON.stringify(Documents.documentData(target, operation)));
    window.selectCotizadorWorkspace?.(target);
    requestAnimationFrame(() => preloadExisting(target));
  }
  function preloadExisting(target) {
    const targetWorkspace = document.querySelector(`#documentWorkspace-${target}`) || document.querySelector(target === "application" ? "#creditApplication" : target === "evaluation" ? "#evaluationWorkspace" : target === "quote" ? "#quoteWorkspace" : "body");
    const targetForm = targetWorkspace?.querySelector("form");
    if (!targetForm) return;
    const customer = operation.people.customer || {};
    const mapping = { clientName: customer.fullName, debtorName: customer.fullName, clientId: customer.idNumber, debtorId: customer.idNumber, address: customer.address, debtorAddress: customer.address, loanNumber: operation.reference, principal: operation.proposal.principal, amount: operation.proposal.principal, term: operation.proposal.term, rate: operation.proposal.monthlyRate };
    Object.entries(mapping).forEach(([name, value]) => { const field = targetForm.elements?.namedItem(name); if (field && value !== undefined && value !== "") { field.value = value; field.dispatchEvent(new Event("input", { bubbles: true })); } });
  }

  function selectProduct(type) {
    if (type === operation.productType) return;
    operation = Core.changeProduct(operation, type);
    dirty = true; persist(); renderForm();
  }
  function setNotice(message = "", type = "") { const notice = workspace.querySelector("#operationNotice"); notice.textContent = message; notice.dataset.type = type; }
  function persist() { try { operation = Repository.save(operation); dirty = false; setNotice("Guardado en este navegador.", "success"); } catch(error) { dirty = true; setNotice(error.message + " Exporta el expediente para conservarlo.", "error"); } }
  function reset(type = "personal_loan") { operation = Core.create(type); dirty = false; persist(); setNotice("Nueva operación preparada.", "success"); renderForm(); }
  function download() {
    const blob = new Blob([Repository.export(operation)], { type: "application/json" });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `${operation.reference}.json`; link.click(); URL.revokeObjectURL(link.href); dirty = false; setNotice("Expediente exportado correctamente.", "success"); renderSummary();
  }
  function importFile(file) {
    if (!file) return;
    const reader = new FileReader(); reader.onload = () => { try { operation = Repository.import(reader.result); dirty = false; setNotice("Expediente importado y validado.", "success"); renderForm(); } catch (error) { setNotice(error.message, "error"); } }; reader.readAsText(file);
  }
  workspace.querySelector("[data-operation-new]").addEventListener("click", () => { if (!dirty || window.confirm("La operación actual no se ha exportado. ¿Deseas crear una nueva?")) reset(); });
  workspace.querySelector("[data-operation-duplicate]").addEventListener("click", () => { const copy = Core.patch(Core.create(operation.productType), { people: operation.people, proposal: operation.proposal, asset: operation.asset, collateral: operation.collateral, evaluation: operation.evaluation }); operation = copy; dirty = true; persist(); renderForm(); });
  workspace.querySelector("[data-operation-export]").addEventListener("click", download);
  workspace.querySelector("[data-operation-import]").addEventListener("click", () => workspace.querySelector("[data-operation-file]").click());
  workspace.querySelector("[data-operation-file]").addEventListener("change", (event) => importFile(event.target.files?.[0]));

  const originalSelect = window.selectCotizadorWorkspace;
  function openWorkbench() {
    operation = Repository.load() || operation;
    originalSelect?.("application");
    document.querySelectorAll(".workspace").forEach((item) => { item.hidden = item !== workspace; });
    document.querySelector("#workspaceMenu").hidden = true;
    document.body.dataset.workspace = "operations";
    const title = document.querySelector(".app-header h1"); if (title) title.textContent = "Mesa unificada";
    const home = document.querySelector("#workspaceHomeBtn"); if (home) home.hidden = false;
    workspace.hidden = false;
    renderForm();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  window.selectCotizadorWorkspace = (target) => { workspace.hidden = true; return target === "operations" ? openWorkbench() : originalSelect?.(target); };
  menuButton.addEventListener("click", openWorkbench);
  document.querySelector("#workspaceHomeBtn")?.addEventListener("click", () => { workspace.hidden = true; });
  window.addEventListener("beforeunload", (event) => { if (!dirty) return; event.preventDefault(); event.returnValue = ""; });
  window.OperationWorkbench = { open(reference) { Repository.activate(reference); operation = Repository.load(); window.selectCotizadorWorkspace("operations"); }, reload() { operation = Repository.load() || operation; renderForm(); } };
  renderForm();
})();

