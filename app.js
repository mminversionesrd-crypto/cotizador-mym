const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const TERMS = Array.from({ length: 34 }, (_, index) => index + 3);
const FEATURED_TERMS = [12, 15, 18];
const FREQUENCIES = {
  monthly: { label: "Mensual", sentence: "mensual", plural: "mensuales", divisor: 1 },
  biweekly: { label: "Quincenal", sentence: "quincenal", plural: "quincenales", divisor: 2 },
  weekly: { label: "Semanal", sentence: "semanal", plural: "semanales", divisor: 4 }
};

const PRODUCT_FORMS = {
  "Préstamo personal": {
    title: "Descripción del préstamo",
    fields: [
      { key: "purpose", label: "Destino del préstamo", placeholder: "Ej. Gastos médicos" },
      { key: "description", label: "Descripción", placeholder: "Detalle opcional" }
    ]
  },
  "Préstamo comercial": {
    title: "Datos del negocio",
    fields: [
      { key: "business", label: "Negocio o empresa", placeholder: "Nombre comercial" },
      { key: "purpose", label: "Destino del préstamo", placeholder: "Capital de trabajo" }
    ]
  },
  "Préstamo prendario": {
    title: "Bien en garantía",
    fields: [
      { key: "asset", label: "Bien a dejar en garantía", placeholder: "Ej. Vehículo" },
      { key: "description", label: "Marca, modelo o descripción", placeholder: "Detalle del bien" },
      { key: "year", label: "Año", placeholder: "Ej. 2023" }
    ]
  },
  Smartphone: {
    title: "Descripción del smartphone",
    fields: [
      { key: "brand", label: "Marca", placeholder: "Ej. Samsung" },
      { key: "model", label: "Modelo", placeholder: "Ej. Galaxy S24" },
      { key: "capacity", label: "Capacidad", placeholder: "Ej. 256 GB" },
      { key: "color", label: "Color", placeholder: "Ej. Negro" }
    ]
  },
  Electrodoméstico: {
    title: "Descripción del electrodoméstico",
    fields: [
      { key: "type", label: "Tipo", placeholder: "Ej. Nevera" },
      { key: "brand", label: "Marca", placeholder: "Ej. Samsung" },
      { key: "model", label: "Modelo", placeholder: "Ej. RT38" },
      { key: "color", label: "Color", placeholder: "Ej. Inoxidable" }
    ]
  },
  Motocicleta: {
    title: "Descripción de la motocicleta",
    fields: [
      { key: "brand", label: "Marca", placeholder: "Ej. Yamaha" },
      { key: "model", label: "Modelo", placeholder: "Ej. FZ 2.0" },
      { key: "color", label: "Color", placeholder: "Ej. Azul" },
      { key: "cc", label: "Cilindrada (cc)", placeholder: "Ej. 150" }
    ]
  }
};

const els = {
  form: $("#quoteForm"),
  productName: $("#productName"),
  productPicker: $("#productPicker"),
  productDetails: $("#productDetails"),
  productAmount: $("#productAmount"),
  downPayment: $("#downPayment"),
  monthlyRate: $("#monthlyRate"),
  legalRate: $("#legalRate"),
  extraFee: $("#extraFee"),
  customerName: $("#customerName"),
  customerPhone: $("#customerPhone"),
  downPercent: $("#downPercent"),
  termPicker: $("#termPicker"),
  toggleAllTerms: $("#toggleAllTerms"),
  allTerms: $("#allTerms"),
  frequencyPicker: $(".frequency-picker"),
  quoteHeading: $("#quoteHeading"),
  quoteReference: $("#quoteReference"),
  quoteCustomer: $("#quoteCustomer"),
  quoteDate: $("#quoteDate"),
  heroFrequencyLabel: $("#heroFrequencyLabel"),
  heroPayment: $("#heroPayment"),
  heroFrequency: $("#heroFrequency"),
  heroTerm: $("#heroTerm"),
  summaryPrice: $("#summaryPrice"),
  summaryDown: $("#summaryDown"),
  summaryFinanced: $("#summaryFinanced"),
  summaryDownPercent: $("#summaryDownPercent"),
  summaryFinancedPercent: $("#summaryFinancedPercent"),
  recommendedPlans: $("#recommendedPlans"),
  comparisonTabs: $$(".comparison-tab"),
  comparisonPanels: $$(".comparison-panel"),
  amortizationLabel: $("#amortizationLabel"),
  amortizationBody: $("#amortizationBody"),
  newQuoteBtn: $("#newQuoteBtn"),
  printBtn: $("#printBtn"),
  printModal: $("#printModal"),
  printPlanStart: $("#printPlanStart"),
  printPlanEnd: $("#printPlanEnd"),
  printModes: $$("input[name=printMode]"),
  printRangePicker: $("#printRangePicker"),
  printRangeSummary: $("#printRangeSummary"),
  printPageEstimate: $("#printPageEstimate"),
  printReviewProduct: $("#printReviewProduct"),
  printReviewCustomer: $("#printReviewCustomer"),
  printReviewPayment: $("#printReviewPayment"),
  cancelPrintBtn: $("#cancelPrintBtn"),
  confirmPrintBtn: $("#confirmPrintBtn"),
  printHeading: $("#printHeading"),
  printReference: $("#printReference"),
  printCustomer: $("#printCustomer"),
  printDate: $("#printDate"),
  printProduct: $("#printProduct"),
  printPayment: $("#printPayment"),
  printFrequency: $("#printFrequency"),
  printPrice: $("#printPrice"),
  printDown: $("#printDown"),
  printFinanced: $("#printFinanced"),
  printTotal: $("#printTotal"),
  printRangeLabel: $("#printRangeLabel"),
  printPlansBody: $("#printPlansBody"),
  printPlansSection: $("#printPlansSection"),
  printAmortizationSection: $("#printAmortizationSection"),
  printAmortizationLabel: $("#printAmortizationLabel"),
  printAmortizationBody: $("#printAmortizationBody")
};

const state = { term: 12, frequency: "monthly", reference: "BORRADOR", product: "Motocicleta", productDetails: {} };

function numberValue(input) {
  return Math.max(0, Number(input.value) || 0);
}

function money(value) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP", minimumFractionDigits: 2 }).format(value || 0);
}

function dateText() {
  return new Intl.DateTimeFormat("es-DO", { dateStyle: "medium" }).format(new Date());
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function saveProductDetails() {
  const values = {};
  els.productDetails.querySelectorAll("[data-product-field]").forEach((input) => {
    values[input.dataset.productField] = input.value.trim();
  });
  state.productDetails[state.product] = values;
}

function renderProductDetails() {
  const product = els.productName.value;
  const definition = PRODUCT_FORMS[product];
  const values = state.productDetails[product] || {};
  els.productDetails.innerHTML = `<div class="product-details-title"><i class="fa-solid fa-pen-ruler"></i><span>${definition.title}</span></div>${definition.fields.map((field) => `<label>${field.label}<input data-product-field="${field.key}" type="text" value="${escapeHtml(values[field.key])}" placeholder="${field.placeholder}"></label>`).join("")}`;
  state.product = product;
}

function productDescription() {
  const definition = PRODUCT_FORMS[els.productName.value];
  const details = definition.fields.map((field) => els.productDetails.querySelector(`[data-product-field="${field.key}"]`)?.value.trim()).filter(Boolean);
  return [els.productName.value, ...details].join(" · ");
}

function quoteValues() {
  const price = numberValue(els.productAmount);
  const down = Math.min(numberValue(els.downPayment), price);
  const financed = Math.max(0, price - down);
  const monthlyRate = numberValue(els.monthlyRate) / 100;
  const legal = financed * (numberValue(els.legalRate) / 100);
  const extra = numberValue(els.extraFee);
  const base = financed + legal + extra;
  const total = base * (1 + monthlyRate * state.term);
  const frequency = FREQUENCIES[state.frequency];
  const monthlyPayment = state.term ? total / state.term : 0;

  return {
    product: productDescription(),
    customer: els.customerName.value.trim(),
    price,
    down,
    financed,
    base,
    total,
    term: state.term,
    frequency,
    monthlyRate,
    payment: monthlyPayment / frequency.divisor
  };
}

function paymentForTerm(quote, term, frequencyKey) {
  const total = quote.base * (1 + quote.monthlyRate * term);
  return (total / term) / FREQUENCIES[frequencyKey].divisor;
}

function renderAllTermButtons() {
  els.allTerms.innerHTML = TERMS.map((term) => `<button type="button" data-term="${term}" class="${term === state.term ? "active" : ""}">${term}</button>`).join("");
}

function renderTermState() {
  $$('[data-term]').forEach((button) => button.classList.toggle("active", Number(button.dataset.term) === state.term));
}

function renderFrequencyState() {
  $$('[data-frequency]').forEach((button) => button.classList.toggle("active", button.dataset.frequency === state.frequency));
}

function renderProductState() {
  $$('[data-product]').forEach((button) => {
    const active = button.dataset.product === els.productName.value;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function renderAmortization(quote, target, caption) {
  const installments = quote.term * quote.frequency.divisor;
  const principalPart = installments ? quote.base / installments : 0;
  const chargePart = installments ? (quote.total - quote.base) / installments : 0;
  let balance = quote.base;
  target.innerHTML = "";

  for (let index = 1; index <= installments; index += 1) {
    const principal = index === installments ? balance : principalPart;
    balance = Math.max(0, balance - principal);
    const row = document.createElement("tr");
    row.innerHTML = `<td>${index}</td><td>${money(quote.payment)}</td><td>${money(principal)}</td><td>${money(chargePart)}</td><td>${money(balance)}</td>`;
    target.appendChild(row);
  }
  caption.textContent = `${installments} cuotas ${quote.frequency.plural}`;
}

function renderRecommendedPlans(quote) {
  els.recommendedPlans.innerHTML = FEATURED_TERMS.map((term) => {
    const selected = term === quote.term;
    const highlight = term === 15 ? "recommended" : "";
    const total = quote.base * (1 + quote.monthlyRate * term);
    const benefit = term === 12 ? "Pago más rápido" : term === 15 ? "Mejor equilibrio" : "Cuota más baja";
    return `<article class="plan-card ${selected ? "selected" : ""} ${highlight}" data-term="${term}" tabindex="0" role="button" aria-label="Elegir plan de ${term} meses">
      <span class="plan-select"><i class="fa-solid fa-check"></i></span>
      <div><span class="plan-badge">${term === 15 ? "Recomendado" : benefit}</span><h3>${term} meses</h3><p>Total: ${money(total)}</p></div>
      <div class="plan-payment"><span>Cuota ${quote.frequency.sentence}</span><strong>${money(paymentForTerm(quote, term, state.frequency))}</strong></div>
    </article>`;
  }).join("");
}

function renderScreen() {
  const quote = quoteValues();
  const downPercent = quote.price ? Math.round((quote.down / quote.price) * 100) : 0;
  const financedPercent = quote.price ? Math.round((quote.financed / quote.price) * 100) : 0;
  const customer = quote.customer || "No especificado";

  els.downPercent.textContent = `${downPercent}%`;
  els.quoteHeading.textContent = `Cotización de ${quote.product}`;
  els.quoteReference.textContent = state.reference;
  els.quoteCustomer.textContent = `Cliente: ${customer}`;
  els.quoteDate.textContent = dateText();
  els.heroFrequencyLabel.textContent = quote.frequency.sentence;
  els.heroPayment.textContent = money(quote.payment);
  els.heroFrequency.textContent = quote.frequency.sentence;
  els.heroTerm.textContent = `${quote.term} meses`;
  els.summaryPrice.textContent = money(quote.price);
  els.summaryDown.textContent = money(quote.down);
  els.summaryFinanced.textContent = money(quote.financed);
  els.summaryDownPercent.textContent = `${downPercent}% del precio`;
  els.summaryFinancedPercent.textContent = `${financedPercent}% del precio`;
  renderProductState();
  renderTermState();
  renderFrequencyState();
  renderRecommendedPlans(quote);
  renderAmortization(quote, els.amortizationBody, els.amortizationLabel);
  renderPrintReport(quote);
}

function rangeValues() {
  const start = Number(els.printPlanStart.value || 3);
  const end = Number(els.printPlanEnd.value || 18);
  return { start: Math.min(start, end), end: Math.max(start, end) };
}

function printMode() {
  return $("input[name=printMode]:checked").value;
}

function renderPrintReport(quote) {
  const { start, end } = rangeValues();
  const customer = quote.customer || "No especificado";
  els.printHeading.textContent = `Cotización de ${quote.product}`;
  els.printReference.textContent = state.reference;
  els.printCustomer.textContent = `Cliente: ${customer}`;
  els.printDate.textContent = dateText();
  els.printProduct.textContent = `Estás cotizando: ${quote.product}`;
  els.printPayment.textContent = money(quote.payment);
  els.printFrequency.textContent = `${quote.frequency.label} · ${quote.term} meses`;
  els.printPrice.textContent = money(quote.price);
  els.printDown.textContent = money(quote.down);
  els.printFinanced.textContent = money(quote.financed);
  els.printTotal.textContent = money(quote.total);
  els.printReviewProduct.textContent = quote.product;
  els.printReviewCustomer.textContent = `Cliente: ${customer}`;
  els.printReviewPayment.textContent = `${money(quote.payment)} ${quote.frequency.sentence}`;
  els.printRangeLabel.textContent = `${start} a ${end} meses`;
  els.printPlansBody.innerHTML = TERMS.filter((term) => term >= start && term <= end).map((term) => {
    const classes = [term === quote.term ? "selected-row" : "", FEATURED_TERMS.includes(term) ? "recommended-row" : ""].filter(Boolean).join(" ");
    return `<tr class="${classes}"><td>${term} meses</td><td>${money(paymentForTerm(quote, term, "monthly"))}</td><td>${money(paymentForTerm(quote, term, "biweekly"))}</td><td>${money(paymentForTerm(quote, term, "weekly"))}</td></tr>`;
  }).join("");
  renderAmortization(quote, els.printAmortizationBody, els.printAmortizationLabel);
  const mode = printMode();
  els.printPlansSection.hidden = mode !== "plans";
  els.printAmortizationSection.hidden = mode !== "amortization";
}

function printPageEstimate(mode, start, end, quote) {
  const rows = mode === "plans" ? TERMS.filter((term) => term >= start && term <= end).length : quote.term * quote.frequency.divisor;
  const capacity = mode === "plans" ? 23 : 25;
  return Math.max(1, Math.ceil((rows + 6) / capacity));
}

function updateRangeSummary() {
  const { start, end } = rangeValues();
  const mode = printMode();
  const quote = quoteValues();
  els.printRangePicker.hidden = mode !== "plans";
  els.printRangeSummary.textContent = mode === "plans"
    ? `Se imprimirán los planes de ${start} a ${end} meses.`
    : `Se imprimirá la amortización de ${quote.term} meses (${quote.term * quote.frequency.divisor} cuotas ${quote.frequency.plural}).`;
  const pages = printPageEstimate(mode, start, end, quote);
  els.printPageEstimate.textContent = `Aproximadamente ${pages} ${pages === 1 ? "página" : "páginas"}`;
  els.printModes.forEach((input) => input.closest(".print-option").classList.toggle("active", input.checked));
}

function createReference() {
  const now = new Date();
  const stamp = [now.getFullYear().toString().slice(-2), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0"), String(now.getHours()).padStart(2, "0"), String(now.getMinutes()).padStart(2, "0")].join("");
  state.reference = `MM-${stamp}`;
}

function openPrintDialog() {
  createReference();
  updateRangeSummary();
  renderScreen();
  els.printModal.classList.add("is-open");
  els.printModal.setAttribute("aria-hidden", "false");
  els.printPlanStart.focus();
}

function closePrintDialog() {
  els.printModal.classList.remove("is-open");
  els.printModal.setAttribute("aria-hidden", "true");
  els.printBtn.focus();
}

function resetQuote() {
  els.form.reset();
  state.term = 12;
  state.frequency = "monthly";
  state.reference = "BORRADOR";
  state.productDetails = {};
  state.product = els.productName.value;
  renderProductDetails();
  els.allTerms.hidden = true;
  els.toggleAllTerms.classList.remove("is-open");
  els.toggleAllTerms.innerHTML = 'Ver todos hasta 36 meses <i class="fa-solid fa-chevron-right"></i>';
  renderScreen();
}

function selectTerm(term) {
  state.term = term;
  renderScreen();
}

function initializePrintRange() {
  [els.printPlanStart, els.printPlanEnd].forEach((select) => {
    select.innerHTML = TERMS.map((term) => `<option value="${term}">${term} meses</option>`).join("");
  });
  els.printPlanStart.value = "3";
  els.printPlanEnd.value = "18";
}

renderAllTermButtons();
initializePrintRange();
renderProductDetails();
renderScreen();

els.form.addEventListener("input", renderScreen);
els.form.addEventListener("change", renderScreen);
els.productName.addEventListener("change", () => {
  saveProductDetails();
  renderProductDetails();
  renderScreen();
});
els.productPicker.addEventListener("click", (event) => {
  const button = event.target.closest("[data-product]");
  if (!button) return;
  saveProductDetails();
  els.productName.value = button.dataset.product;
  renderProductDetails();
  renderScreen();
});
els.termPicker.addEventListener("click", (event) => {
  const button = event.target.closest("[data-term]");
  if (button) selectTerm(Number(button.dataset.term));
});
els.allTerms.addEventListener("click", (event) => {
  const button = event.target.closest("[data-term]");
  if (button) selectTerm(Number(button.dataset.term));
});
els.toggleAllTerms.addEventListener("click", () => {
  const open = els.allTerms.hidden;
  els.allTerms.hidden = !open;
  els.toggleAllTerms.classList.toggle("is-open", open);
  els.toggleAllTerms.innerHTML = `${open ? "Ocultar plazos" : "Ver todos hasta 36 meses"} <i class="fa-solid fa-chevron-right"></i>`;
});
els.frequencyPicker.addEventListener("click", (event) => {
  const button = event.target.closest("[data-frequency]");
  if (!button) return;
  state.frequency = button.dataset.frequency;
  renderScreen();
});
els.recommendedPlans.addEventListener("click", (event) => {
  const card = event.target.closest("[data-term]");
  if (card) selectTerm(Number(card.dataset.term));
});
els.recommendedPlans.addEventListener("keydown", (event) => {
  if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-term]")) {
    event.preventDefault();
    selectTerm(Number(event.target.dataset.term));
  }
});
els.comparisonTabs.forEach((tab) => tab.addEventListener("click", () => {
  const panelId = tab.dataset.panel;
  els.comparisonTabs.forEach((item) => {
    const active = item === tab;
    item.classList.toggle("active", active);
    item.setAttribute("aria-selected", String(active));
  });
  els.comparisonPanels.forEach((panel) => {
    const active = panel.id === panelId;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });
}));
els.newQuoteBtn.addEventListener("click", resetQuote);
els.printBtn.addEventListener("click", openPrintDialog);
els.printPlanStart.addEventListener("change", () => { updateRangeSummary(); renderScreen(); });
els.printPlanEnd.addEventListener("change", () => { updateRangeSummary(); renderScreen(); });
els.printModes.forEach((input) => input.addEventListener("change", () => { updateRangeSummary(); renderScreen(); }));
els.cancelPrintBtn.addEventListener("click", closePrintDialog);
els.confirmPrintBtn.addEventListener("click", () => { renderScreen(); closePrintDialog(); window.print(); });
els.printModal.addEventListener("click", (event) => { if (event.target === els.printModal) closePrintDialog(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && els.printModal.classList.contains("is-open")) closePrintDialog(); });
