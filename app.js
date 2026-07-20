const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const els = {
  views: $$(".view"),
  navLinks: $$(".nav-link"),
  viewTitle: $("#viewTitle"),
  viewKicker: $("#viewKicker"),
  form: $("#quoteForm"),
  editingQuoteId: $("#editingQuoteId"),
  customerName: $("#customerName"),
  customerPhone: $("#customerPhone"),
  customerDocument: $("#customerDocument"),
  sellerName: $("#sellerName"),
  productType: $("#productType"),
  productName: $("#productName"),
  productAmount: $("#productAmount"),
  downPayment: $("#downPayment"),
  term: $("#term"),
  frequency: $("#frequency"),
  monthlyFactor: $("#monthlyFactor"),
  legalRate: $("#legalRate"),
  extraFee: $("#extraFee"),
  includeLegalization: $("#includeLegalization"),
  includeExtraFee: $("#includeExtraFee"),
  quoteStatus: $("#quoteStatus"),
  financedAmount: $("#financedAmount"),
  internalCharges: $("#internalCharges"),
  baseAmount: $("#baseAmount"),
  internalTotal: $("#internalTotal"),
  proposalCustomer: $("#proposalCustomer"),
  proposalDate: $("#proposalDate"),
  proposalNumber: $("#proposalNumber"),
  proposalProduct: $("#proposalProduct"),
  proposalAmount: $("#proposalAmount"),
  proposalDown: $("#proposalDown"),
  proposalFinanced: $("#proposalFinanced"),
  proposalTerm: $("#proposalTerm"),
  proposalFrequency: $("#proposalFrequency"),
  proposalPayment: $("#proposalPayment"),
  proposalCharges: $("#proposalCharges"),
  reportTerms: $("#reportTerms"),
  printPlansBody: $("#printPlansBody"),
  plansGrid: $("#plansGrid"),
  saveQuoteBtn: $("#saveQuoteBtn"),
  resetBtn: $("#resetBtn"),
  printBtn: $("#printBtn"),
  backupBtn: $("#backupBtn"),
  importInput: $("#importInput"),
  dashboardQuotes: $("#dashboardQuotes"),
  quotesTable: $("#quotesTable"),
  quoteSearch: $("#quoteSearch"),
  statusFilter: $("#statusFilter"),
  clientForm: $("#clientForm"),
  clientId: $("#clientId"),
  clientName: $("#clientName"),
  clientPhone: $("#clientPhone"),
  clientDocument: $("#clientDocument"),
  clientAddress: $("#clientAddress"),
  saveClientBtn: $("#saveClientBtn"),
  newClientBtn: $("#newClientBtn"),
  clientsTable: $("#clientsTable"),
  saveSettingsBtn: $("#saveSettingsBtn"),
  defaultRate: $("#defaultRate"),
  defaultLegal: $("#defaultLegal"),
  defaultExtra: $("#defaultExtra"),
  minDownPercent: $("#minDownPercent"),
  defaultSeller: $("#defaultSeller"),
  productTypesSetting: $("#productTypesSetting"),
  termsText: $("#termsText")
};

const planTerms = Array.from({ length: 22 }, (_, index) => index + 3);
const storage = {
  quotes: "mm_system_quotes",
  clients: "mm_system_clients",
  settings: "mm_system_settings",
  counter: "mm_quote_counter"
};

const defaultSettings = {
  defaultRate: 3,
  defaultLegal: 0,
  defaultExtra: 0,
  minDownPercent: 0,
  defaultSeller: "",
  productTypes: ["Motocicleta", "Celular", "Electrodomestico", "Mueble", "Otro"],
  termsText: "Cotizacion sujeta a validacion y aprobacion. Propuesta preparada para fines comerciales."
};

const frequencyLabels = {
  monthly: "Mensual",
  biweekly: "Quincenal",
  weekly: "Semanal"
};

const frequencyDivisors = {
  monthly: 1,
  biweekly: 2,
  weekly: 4
};

const viewCopy = {
  dashboard: ["Sistema empresarial de cotizaciones", "Panel general"],
  quote: ["Entrada interna", "Nueva cotizacion"],
  quotes: ["Gestion comercial", "Cotizaciones"],
  clients: ["CRM basico", "Clientes"],
  reports: ["Analisis", "Reportes"],
  settings: ["Reglas internas", "Configuracion"]
};

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getSettings() {
  return { ...defaultSettings, ...readJson(storage.settings, {}) };
}

function getQuotes() {
  return readJson(storage.quotes, []);
}

function setQuotes(quotes) {
  writeJson(storage.quotes, quotes);
}

function getClients() {
  return readJson(storage.clients, []);
}

function setClients(clients) {
  writeJson(storage.clients, clients);
}

function numberValue(input) {
  return Number(input.value || 0);
}

function money(value) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 2
  }).format(Number.isFinite(value) ? value : 0);
}

function dateText(iso) {
  return new Date(iso || Date.now()).toLocaleDateString("es-DO");
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function nextQuoteNumber() {
  const next = Number(localStorage.getItem(storage.counter) || 0) + 1;
  localStorage.setItem(storage.counter, String(next));
  return `MM-${String(next).padStart(5, "0")}`;
}

function initTermOptions() {
  els.term.innerHTML = "";
  planTerms.forEach((term) => {
    const option = document.createElement("option");
    option.value = String(term);
    option.textContent = `${term} meses`;
    option.selected = term === 12;
    els.term.appendChild(option);
  });
}

function initProductTypes() {
  const settings = getSettings();
  els.productType.innerHTML = "";
  settings.productTypes.forEach((type) => {
    const option = document.createElement("option");
    option.textContent = type;
    els.productType.appendChild(option);
  });
}

function applySettingsToForm() {
  const settings = getSettings();
  els.monthlyFactor.value = settings.defaultRate;
  els.legalRate.value = settings.defaultLegal;
  els.extraFee.value = settings.defaultExtra;
  els.sellerName.value = settings.defaultSeller || "";
  els.reportTerms.textContent = settings.termsText;
}

function currentQuote() {
  const settings = getSettings();
  const productAmount = numberValue(els.productAmount);
  const rawDown = numberValue(els.downPayment);
  const minDown = productAmount * (Number(settings.minDownPercent || 0) / 100);
  const downPayment = Math.min(Math.max(rawDown, 0), productAmount);
  const financed = Math.max(productAmount - downPayment, 0);
  const legalRate = numberValue(els.legalRate);
  const configuredExtraFee = numberValue(els.extraFee);
  const includeLegalization = els.includeLegalization.checked;
  const includeExtraFee = els.includeExtraFee.checked;
  const legal = includeLegalization ? financed * (legalRate / 100) : 0;
  const appliedExtraFee = includeExtraFee ? configuredExtraFee : 0;
  const internalCharges = legal + appliedExtraFee;
  const base = financed + internalCharges;
  const term = Number(els.term.value);
  const factor = numberValue(els.monthlyFactor) / 100;
  const internalTotal = base * (1 + factor * term);
  const monthlyPayment = term > 0 ? internalTotal / term : 0;
  const payment = monthlyPayment / frequencyDivisors[els.frequency.value];

  return {
    id: els.editingQuoteId.value || uid("quote"),
    number: els.proposalNumber.textContent === "BORRADOR" ? "" : els.proposalNumber.textContent,
    status: "pendiente",
    customerName: els.customerName.value.trim(),
    customerPhone: els.customerPhone.value.trim(),
    customerDocument: els.customerDocument.value.trim(),
    sellerName: els.sellerName.value.trim(),
    productType: els.productType.value,
    productName: els.productName.value.trim() || els.productType.value,
    productAmount,
    downPayment,
    minDown,
    financed,
    legalRate,
    includeLegalization,
    legal,
    extraFee: configuredExtraFee,
    includeExtraFee,
    appliedExtraFee,
    internalCharges,
    base,
    term,
    monthlyRate: numberValue(els.monthlyFactor),
    factor,
    internalTotal,
    frequency: els.frequency.value,
    payment,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function calculatePaymentByFrequency(quote, term, frequency) {
  const total = quote.base * (1 + quote.factor * term);
  const monthly = term > 0 ? total / term : 0;
  return monthly / frequencyDivisors[frequency];
}

function renderProposal(quote) {
  els.financedAmount.textContent = money(quote.financed);
  els.internalCharges.textContent = money(quote.internalCharges);
  els.baseAmount.textContent = money(quote.base);
  els.internalTotal.textContent = money(quote.internalTotal);
  els.proposalCustomer.textContent = `Cliente: ${quote.customerName || "Sin nombre"}`;
  els.proposalDate.textContent = dateText(quote.createdAt);
  els.proposalNumber.textContent = quote.number || "BORRADOR";
  els.proposalProduct.textContent = quote.productName;
  els.proposalAmount.textContent = money(quote.productAmount);
  els.proposalDown.textContent = money(quote.downPayment);
  els.proposalFinanced.textContent = money(quote.financed);
  els.proposalTerm.textContent = `${quote.term} meses`;
  els.proposalFrequency.textContent = frequencyLabels[quote.frequency];
  els.proposalPayment.textContent = money(quote.payment);
  const charges = [];
  if (quote.includeLegalization && quote.legalRate > 0) charges.push(`Legalizacion ${quote.legalRate}%`);
  if (quote.includeExtraFee && quote.extraFee > 0) charges.push(`Adicional ${money(quote.extraFee)}`);
  els.proposalCharges.textContent = charges.length ? `Cargos incluidos: ${charges.join(" · ")}` : "Sin cargos adicionales incluidos";
  els.quoteStatus.textContent = quote.downPayment < quote.minDown ? "Inicial baja" : "Calculada";
}

function renderPrintPlans(quote) {
  els.printPlansBody.innerHTML = "";
  planTerms.forEach((term) => {
    const row = document.createElement("tr");
    if (term === quote.term) row.className = "selected-print-row";
    row.innerHTML = `
      <td>${term} meses</td>
      <td>${money(calculatePaymentByFrequency(quote, term, "monthly"))}</td>
      <td>${money(calculatePaymentByFrequency(quote, term, "biweekly"))}</td>
      <td>${money(calculatePaymentByFrequency(quote, term, "weekly"))}</td>
    `;
    els.printPlansBody.appendChild(row);
  });
}

function renderPlans(quote) {
  els.plansGrid.innerHTML = "";
  planTerms.forEach((term) => {
    const card = document.createElement("article");
    card.className = `plan-card${term === quote.term ? " selected" : ""}`;
    card.innerHTML = `
      <h3>${term} meses</h3>
      <p>${frequencyLabels[quote.frequency]}</p>
      <strong>${money(calculatePaymentByFrequency(quote, term, quote.frequency))}</strong>
      <button type="button" data-term="${term}">Usar plazo</button>
    `;
    card.querySelector("button").addEventListener("click", () => {
      els.term.value = String(term);
      updateQuotePreview();
    });
    els.plansGrid.appendChild(card);
  });
}

function updateQuotePreview() {
  const quote = currentQuote();
  renderProposal(quote);
  renderPlans(quote);
  renderPrintPlans(quote);
}

function upsertClientFromQuote(quote) {
  if (!quote.customerName && !quote.customerPhone) return;
  const clients = getClients();
  const existing = clients.find((client) =>
    (quote.customerPhone && client.phone === quote.customerPhone) ||
    (quote.customerDocument && client.document === quote.customerDocument)
  );
  if (existing) {
    existing.name = quote.customerName || existing.name;
    existing.phone = quote.customerPhone || existing.phone;
    existing.document = quote.customerDocument || existing.document;
    existing.updatedAt = new Date().toISOString();
  } else {
    clients.unshift({
      id: uid("client"),
      name: quote.customerName || "Cliente sin nombre",
      phone: quote.customerPhone,
      document: quote.customerDocument,
      address: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  setClients(clients);
}

function saveQuote() {
  const quote = currentQuote();
  const quotes = getQuotes();
  const existingIndex = quotes.findIndex((item) => item.id === quote.id);
  if (existingIndex >= 0) {
    quote.number = quotes[existingIndex].number;
    quote.status = quotes[existingIndex].status;
    quote.createdAt = quotes[existingIndex].createdAt;
    quotes[existingIndex] = quote;
  } else {
    quote.number = nextQuoteNumber();
    quotes.unshift(quote);
    els.editingQuoteId.value = quote.id;
  }
  setQuotes(quotes);
  upsertClientFromQuote(quote);
  els.proposalNumber.textContent = quote.number;
  els.quoteStatus.textContent = "Guardada";
  renderAll();
}

function loadQuote(quote) {
  els.editingQuoteId.value = quote.id;
  els.proposalNumber.textContent = quote.number || "BORRADOR";
  els.customerName.value = quote.customerName || "";
  els.customerPhone.value = quote.customerPhone || "";
  els.customerDocument.value = quote.customerDocument || "";
  els.sellerName.value = quote.sellerName || "";
  els.productType.value = quote.productType || getSettings().productTypes[0];
  els.productName.value = quote.productName || "";
  els.productAmount.value = quote.productAmount || 0;
  els.downPayment.value = quote.downPayment || 0;
  els.term.value = quote.term || 12;
  els.frequency.value = quote.frequency || "monthly";
  els.monthlyFactor.value = quote.monthlyRate ?? 3;
  els.legalRate.value = quote.legalRate ?? 0;
  els.extraFee.value = quote.extraFee || 0;
  els.includeLegalization.checked = quote.includeLegalization !== false;
  els.includeExtraFee.checked = quote.includeExtraFee !== false;
  syncChargeControls();
  showView("quote");
  updateQuotePreview();
}

function resetQuoteForm() {
  els.form.reset();
  els.editingQuoteId.value = "";
  els.proposalNumber.textContent = "BORRADOR";
  els.productName.value = "Motocicleta 150cc";
  els.productAmount.value = 60000;
  els.downPayment.value = 10000;
  els.term.value = 12;
  els.includeLegalization.checked = true;
  els.includeExtraFee.checked = true;
  applySettingsToForm();
  syncChargeControls();
  updateQuotePreview();
}

function syncChargeControls() {
  [
    [els.includeLegalization, els.legalRate],
    [els.includeExtraFee, els.extraFee]
  ].forEach(([checkbox, input]) => {
    input.closest(".charge-field")?.classList.toggle("is-excluded", !checkbox.checked);
  });
}

function statusBadge(status) {
  return `<span class="status-badge ${status}">${status}</span>`;
}

function quoteRow(quote) {
  return `
    <article class="record-row">
      <div>
        <strong>${quote.number} - ${quote.customerName || "Cliente sin nombre"}</strong>
        <p>${quote.productName} | ${money(quote.productAmount)} | ${quote.term} meses | ${money(quote.payment)}</p>
      </div>
      <div class="record-meta">
        ${statusBadge(quote.status)}
        <span>${dateText(quote.createdAt)}</span>
      </div>
      <div class="row-actions">
        <button type="button" data-action="load" data-id="${quote.id}">Editar</button>
        <button type="button" data-action="duplicate" data-id="${quote.id}">Duplicar</button>
        <select data-action="status" data-id="${quote.id}">
          <option value="pendiente"${quote.status === "pendiente" ? " selected" : ""}>Pendiente</option>
          <option value="enviada"${quote.status === "enviada" ? " selected" : ""}>Enviada</option>
          <option value="aprobada"${quote.status === "aprobada" ? " selected" : ""}>Aprobada</option>
          <option value="rechazada"${quote.status === "rechazada" ? " selected" : ""}>Rechazada</option>
          <option value="vencida"${quote.status === "vencida" ? " selected" : ""}>Vencida</option>
        </select>
      </div>
    </article>
  `;
}

function renderQuotes() {
  const search = (els.quoteSearch.value || "").toLowerCase();
  const status = els.statusFilter.value;
  const quotes = getQuotes().filter((quote) => {
    const text = `${quote.number} ${quote.customerName} ${quote.productName} ${quote.customerPhone}`.toLowerCase();
    return (status === "all" || quote.status === status) && text.includes(search);
  });
  els.quotesTable.innerHTML = quotes.length ? quotes.map(quoteRow).join("") : '<div class="empty-state">No hay cotizaciones para mostrar.</div>';
  els.dashboardQuotes.innerHTML = getQuotes().slice(0, 6).map(quoteRow).join("") || '<div class="empty-state">Todavia no hay cotizaciones.</div>';
}

function handleQuoteTable(event) {
  const target = event.target;
  const id = target.dataset.id;
  if (!id) return;
  const quotes = getQuotes();
  const quote = quotes.find((item) => item.id === id);
  if (!quote) return;

  if (target.dataset.action === "load") loadQuote(quote);
  if (target.dataset.action === "duplicate") {
    const copy = { ...quote, id: uid("quote"), number: nextQuoteNumber(), status: "pendiente", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    quotes.unshift(copy);
    setQuotes(quotes);
    renderAll();
  }
  if (target.dataset.action === "status") {
    quote.status = target.value;
    quote.updatedAt = new Date().toISOString();
    setQuotes(quotes);
    renderAll();
  }
}

function saveClient() {
  const clients = getClients();
  const id = els.clientId.value || uid("client");
  const existing = clients.findIndex((client) => client.id === id);
  const client = {
    id,
    name: els.clientName.value.trim() || "Cliente sin nombre",
    phone: els.clientPhone.value.trim(),
    document: els.clientDocument.value.trim(),
    address: els.clientAddress.value.trim(),
    createdAt: existing >= 0 ? clients[existing].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if (existing >= 0) clients[existing] = client;
  else clients.unshift(client);
  setClients(clients);
  resetClientForm();
  renderAll();
}

function resetClientForm() {
  els.clientForm.reset();
  els.clientId.value = "";
}

function renderClients() {
  const clients = getClients();
  els.clientsTable.innerHTML = clients.length ? clients.map((client) => `
    <article class="record-row">
      <div>
        <strong>${client.name}</strong>
        <p>${client.phone || "Sin telefono"} | ${client.document || "Sin documento"} | ${client.address || "Sin direccion"}</p>
      </div>
      <div class="row-actions">
        <button type="button" data-client-action="quote" data-id="${client.id}">Cotizar</button>
        <button type="button" data-client-action="edit" data-id="${client.id}">Editar</button>
      </div>
    </article>
  `).join("") : '<div class="empty-state">No hay clientes guardados.</div>';
}

function handleClientTable(event) {
  const target = event.target;
  const id = target.dataset.id;
  if (!id) return;
  const client = getClients().find((item) => item.id === id);
  if (!client) return;
  if (target.dataset.clientAction === "edit") {
    els.clientId.value = client.id;
    els.clientName.value = client.name;
    els.clientPhone.value = client.phone || "";
    els.clientDocument.value = client.document || "";
    els.clientAddress.value = client.address || "";
  }
  if (target.dataset.clientAction === "quote") {
    resetQuoteForm();
    els.customerName.value = client.name;
    els.customerPhone.value = client.phone || "";
    els.customerDocument.value = client.document || "";
    showView("quote");
    updateQuotePreview();
  }
}

function renderMetrics() {
  const quotes = getQuotes();
  const clients = getClients();
  const total = quotes.reduce((sum, quote) => sum + quote.productAmount, 0);
  const approved = quotes.filter((quote) => quote.status === "aprobada").length;
  $("#metricQuotes").textContent = quotes.length;
  $("#metricClients").textContent = clients.length;
  $("#metricAmount").textContent = money(total);
  $("#metricApproved").textContent = approved;

  const financed = quotes.reduce((sum, quote) => sum + quote.financed, 0);
  const down = quotes.reduce((sum, quote) => sum + quote.downPayment, 0);
  $("#reportFinanced").textContent = money(financed);
  $("#reportDown").textContent = money(down);
  $("#reportAverage").textContent = money(quotes.length ? total / quotes.length : 0);
  $("#reportApproval").textContent = `${quotes.length ? Math.round((approved / quotes.length) * 100) : 0}%`;
}

function renderReports() {
  const quotes = getQuotes();
  const statuses = ["pendiente", "enviada", "aprobada", "rechazada", "vencida"];
  $("#statusReport").innerHTML = statuses.map((status) => {
    const list = quotes.filter((quote) => quote.status === status);
    const total = list.reduce((sum, quote) => sum + quote.productAmount, 0);
    return `
      <article class="record-row">
        <div>
          <strong>${status}</strong>
          <p>${list.length} cotizaciones</p>
        </div>
        <div class="record-meta"><strong>${money(total)}</strong></div>
      </article>
    `;
  }).join("");
}

function renderSettingsForm() {
  const settings = getSettings();
  els.defaultRate.value = settings.defaultRate;
  els.defaultLegal.value = settings.defaultLegal;
  els.defaultExtra.value = settings.defaultExtra;
  els.minDownPercent.value = settings.minDownPercent;
  els.defaultSeller.value = settings.defaultSeller;
  els.productTypesSetting.value = settings.productTypes.join(", ");
  els.termsText.value = settings.termsText;
  els.reportTerms.textContent = settings.termsText;
}

function saveSettings() {
  const settings = {
    defaultRate: Number(els.defaultRate.value || 0),
    defaultLegal: Number(els.defaultLegal.value || 0),
    defaultExtra: Number(els.defaultExtra.value || 0),
    minDownPercent: Number(els.minDownPercent.value || 0),
    defaultSeller: els.defaultSeller.value.trim(),
    productTypes: els.productTypesSetting.value.split(",").map((item) => item.trim()).filter(Boolean),
    termsText: els.termsText.value.trim() || defaultSettings.termsText
  };
  writeJson(storage.settings, settings);
  initProductTypes();
  applySettingsToForm();
  updateQuotePreview();
  renderAll();
}

function exportData() {
  const data = {
    exportedAt: new Date().toISOString(),
    settings: getSettings(),
    quotes: getQuotes(),
    clients: getClients(),
    counter: Number(localStorage.getItem(storage.counter) || 0)
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `cotizador-mm-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.settings) writeJson(storage.settings, data.settings);
      if (Array.isArray(data.quotes)) setQuotes(data.quotes);
      if (Array.isArray(data.clients)) setClients(data.clients);
      if (data.counter != null) localStorage.setItem(storage.counter, String(data.counter));
      initProductTypes();
      renderSettingsForm();
      resetQuoteForm();
      renderAll();
    } catch {
      alert("El archivo no parece ser un respaldo valido.");
    }
  };
  reader.readAsText(file);
}

function showView(view) {
  els.views.forEach((item) => item.classList.toggle("active", item.id === `${view}View`));
  els.navLinks.forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  const [kicker, title] = viewCopy[view] || viewCopy.dashboard;
  els.viewKicker.textContent = kicker;
  els.viewTitle.textContent = title;
}

function renderAll() {
  renderQuotes();
  renderClients();
  renderMetrics();
  renderReports();
}

initTermOptions();
initProductTypes();
renderSettingsForm();
applySettingsToForm();
updateQuotePreview();
renderAll();

els.navLinks.forEach((button) => button.addEventListener("click", () => showView(button.dataset.view)));
$$("[data-go]").forEach((button) => button.addEventListener("click", () => showView(button.dataset.go)));
els.form.addEventListener("input", updateQuotePreview);
els.form.addEventListener("change", updateQuotePreview);
els.includeLegalization.addEventListener("change", syncChargeControls);
els.includeExtraFee.addEventListener("change", syncChargeControls);
els.saveQuoteBtn.addEventListener("click", saveQuote);
els.resetBtn.addEventListener("click", resetQuoteForm);
els.printBtn.addEventListener("click", () => window.print());
els.backupBtn.addEventListener("click", exportData);
els.importInput.addEventListener("change", (event) => importData(event.target.files[0]));
els.quoteSearch.addEventListener("input", renderQuotes);
els.statusFilter.addEventListener("change", renderQuotes);
els.quotesTable.addEventListener("click", handleQuoteTable);
els.quotesTable.addEventListener("change", handleQuoteTable);
els.dashboardQuotes.addEventListener("click", handleQuoteTable);
els.dashboardQuotes.addEventListener("change", handleQuoteTable);
els.saveClientBtn.addEventListener("click", saveClient);
els.newClientBtn.addEventListener("click", resetClientForm);
els.clientsTable.addEventListener("click", handleClientTable);
els.saveSettingsBtn.addEventListener("click", saveSettings);
