const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const TERMS = Array.from({ length: 34 }, (_, index) => index + 3);
const FEATURED_TERMS = [12, 15, 18];
const FREQUENCIES = {
  monthly: { label: "Mensual", sentence: "mensual", plural: "mensuales", divisor: 1 },
  biweekly: { label: "Quincenal", sentence: "quincenal", plural: "quincenales", divisor: 2 },
  weekly: { label: "Semanal", sentence: "semanal", plural: "semanales", divisor: 4 }
};

const RATE_TYPES = {
  simple: {
    key: "simple",
    shortLabel: "Interés simple",
    label: "Tasa simple mensual %",
    help: "Interés plano: se calcula sobre el monto inicial y se distribuye entre las cuotas.",
    monthlyRate: (rate) => rate
  },
  monthly: {
    key: "amortized",
    shortLabel: "Tasa mensual",
    label: "Tasa efectiva mensual %",
    help: "La cuota se amortiza sobre saldo usando la tasa efectiva mensual.",
    monthlyRate: (rate) => rate
  },
  effectiveAnnual: {
    key: "amortized",
    shortLabel: "Tasa efectiva anual",
    label: "Tasa efectiva anual %",
    help: "Se convierte a una tasa mensual equivalente y cada cuota calcula interés sobre el saldo.",
    monthlyRate: (rate) => (1 + rate) ** (1 / 12) - 1
  },
  nominalAnnual: {
    key: "amortized",
    shortLabel: "Tasa nominal anual",
    label: "Tasa nominal anual %",
    help: "Se divide entre 12, se capitaliza mensualmente y se amortiza sobre saldo.",
    monthlyRate: (rate) => rate / 12
  }
};

const DEFAULT_PRODUCT_RULES = {
  "Préstamo personal": { minDown: 0, minTerm: 3, maxTerm: 36, rateType: "simple", rate: 2.5 },
  "Préstamo comercial": { minDown: 10, minTerm: 6, maxTerm: 36, rateType: "nominalAnnual", rate: 30 },
  "Préstamo prendario": { minDown: 20, minTerm: 3, maxTerm: 24, rateType: "simple", rate: 2 },
  Smartphone: { minDown: 20, minTerm: 3, maxTerm: 18, rateType: "monthly", rate: 3 },
  Electrodoméstico: { minDown: 15, minTerm: 3, maxTerm: 24, rateType: "monthly", rate: 2.8 },
  Motocicleta: { minDown: 15, minTerm: 6, maxTerm: 36, rateType: "simple", rate: 3 }
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

const PRODUCT_PRESENTATION = {
  "Préstamo personal": { icon: "fa-hand-holding-dollar", meta: "Personal" },
  "Préstamo comercial": { icon: "fa-briefcase", meta: "Comercial" },
  "Préstamo prendario": { icon: "fa-shield-halved", meta: "Garantía" },
  Smartphone: { icon: "fa-mobile-screen-button", meta: "Equipo móvil" },
  Electrodoméstico: { icon: "fa-plug-circle-bolt", meta: "Hogar" },
  Motocicleta: { icon: "fa-motorcycle", meta: "Vehículo" }
};

const els = {
  form: $("#quoteForm"),
  productName: $("#productName"),
  productPicker: $("#productPicker"),
  productMenu: $("#productMenu"),
  selectedProductIcon: $("#selectedProductIcon"),
  selectedProductName: $("#selectedProductName"),
  selectedProductMeta: $("#selectedProductMeta"),
  productDetails: $("#productDetails"),
  productDetailSummary: $("#productDetailSummary"),
  productAmount: $("#productAmount"),
  downPayment: $("#downPayment"),
  minimumDownNote: $("#minimumDownNote"),
  firstPaymentDate: $("#firstPaymentDate"),
  calendarNote: $("#calendarNote"),
  validationSummary: $("#validationSummary"),
  rateType: $("#rateType"),
  rateLabel: $("#rateLabel"),
  rateHelp: $("#rateHelp"),
  monthlyRate: $("#monthlyRate"),
  legalRate: $("#legalRate"),
  extraFee: $("#extraFee"),
  customerName: $("#customerName"),
  customerPhone: $("#customerPhone"),
  downPercent: $("#downPercent"),
  termPicker: $("#termPicker"),
  termSelect: $("#termSelect"),
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
  summaryInterest: $("#summaryInterest"),
  summaryInterestDetail: $("#summaryInterestDetail"),
  planComparisonInfo: $("#planComparisonInfo"),
  availableTermsLabel: $("#availableTermsLabel"),
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
  printScheduleInfo: $("#printScheduleInfo"),
  printPrice: $("#printPrice"),
  printDown: $("#printDown"),
  printFinanced: $("#printFinanced"),
  printInterest: $("#printInterest"),
  printTotal: $("#printTotal"),
  printRangeLabel: $("#printRangeLabel"),
  printPlansBody: $("#printPlansBody"),
  printPlansSection: $("#printPlansSection"),
  printAmortizationSection: $("#printAmortizationSection"),
  printAmortizationLabel: $("#printAmortizationLabel"),
  printAmortizationBody: $("#printAmortizationBody"),
  printTerms: $("#printTerms"),
  rulesProductName: $("#rulesProductName"),
  ruleMinDown: $("#ruleMinDown"),
  ruleMinTerm: $("#ruleMinTerm"),
  ruleMaxTerm: $("#ruleMaxTerm"),
  ruleRateType: $("#ruleRateType"),
  ruleRate: $("#ruleRate"),
  saveRulesBtn: $("#saveRulesBtn"),
  restoreRulesBtn: $("#restoreRulesBtn"),
  openRulesBtn: $("#openRulesBtn"),
  closeRulesBtn: $("#closeRulesBtn"),
  rulesDialog: $("#rulesDialog"),
  ruleActionProduct: $("#ruleActionProduct")
};

const state = { term: 12, frequency: "monthly", reference: "BORRADOR", product: "Motocicleta", productDetails: {}, productRules: loadProductRules(), quoteEdited: false };

function numberValue(input) {
  return Math.max(0, Number(input.value) || 0);
}

function money(value) {
  const amount = Number(value) || 0;
  return `RD$${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
}

function dateText() {
  return new Intl.DateTimeFormat("es-DO", { dateStyle: "medium" }).format(new Date());
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function cloneRules(rules) {
  return JSON.parse(JSON.stringify(rules));
}

function loadProductRules() {
  return cloneRules(DEFAULT_PRODUCT_RULES);
}

function persistProductRules() {
  // Las reglas ajustadas solo existen mientras esta pestaña permanezca abierta.
}

function rulesFor(product = els.productName.value) {
  return state.productRules[product] || DEFAULT_PRODUCT_RULES[product];
}

function allowedTerms(product = els.productName.value) {
  const rules = rulesFor(product);
  return TERMS.filter((term) => term >= rules.minTerm && term <= rules.maxTerm);
}

function featuredTerms(product = els.productName.value) {
  const allowed = allowedTerms(product);
  const preferred = FEATURED_TERMS.filter((term) => allowed.includes(term));
  if (preferred.length >= 3) return preferred;
  const anchors = [allowed[0], allowed[Math.floor((allowed.length - 1) / 2)], allowed.at(-1)];
  return [...new Set([...preferred, ...anchors])].sort((first, second) => first - second).slice(0, 3);
}

function dateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function defaultFirstPaymentDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return dateInputValue(date);
}

function formatDueDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-DO", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function paymentDate(firstPaymentDate, installmentIndex, frequencyKey) {
  if (!firstPaymentDate) return "";
  const [year, month, day] = firstPaymentDate.split("-").map(Number);
  if (![year, month, day].every(Number.isFinite)) return "";
  const date = new Date(year, month - 1, day, 12);
  if (frequencyKey === "monthly") {
    const targetMonth = date.getMonth() + installmentIndex;
    const targetYear = date.getFullYear() + Math.floor(targetMonth / 12);
    const normalizedMonth = ((targetMonth % 12) + 12) % 12;
    const lastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate();
    return dateInputValue(new Date(targetYear, normalizedMonth, Math.min(day, lastDay), 12));
  }
  date.setDate(date.getDate() + installmentIndex * (frequencyKey === "biweekly" ? 14 : 7));
  return dateInputValue(date);
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
  renderProductDetailSummary();
}

function productDescription() {
  const definition = PRODUCT_FORMS[els.productName.value];
  const details = definition.fields.map((field) => els.productDetails.querySelector(`[data-product-field="${field.key}"]`)?.value.trim()).filter(Boolean);
  return [els.productName.value, ...details].join(" · ");
}

function renderProductDetailSummary() {
  const definition = PRODUCT_FORMS[els.productName.value];
  const details = definition.fields.map((field) => els.productDetails.querySelector(`[data-product-field="${field.key}"]`)?.value.trim()).filter(Boolean);
  els.productDetailSummary.textContent = details.length ? details.join(" · ") : "Agregar detalles";
}

function selectedRateType() {
  return RATE_TYPES[els.rateType?.value] || RATE_TYPES.simple;
}

function renderRuleFields() {
  const rules = rulesFor();
  els.rulesProductName.value = els.productName.value;
  els.ruleMinDown.value = rules.minDown;
  els.ruleMinTerm.value = rules.minTerm;
  els.ruleMaxTerm.value = rules.maxTerm;
  els.ruleRateType.value = rules.rateType;
  els.ruleRate.value = rules.rate;
}

function applyProductRules() {
  const rules = rulesFor();
  els.rateType.value = rules.rateType;
  els.monthlyRate.value = rules.rate;
  const terms = allowedTerms();
  if (!terms.includes(state.term)) state.term = terms.includes(12) ? 12 : terms[0];
  els.minimumDownNote.textContent = `Mínimo ${rules.minDown}%`;
  renderRuleFields();
}

function saveProductRules() {
  const minTerm = Math.min(TERMS.at(-1), Math.max(TERMS[0], Math.round(numberValue(els.ruleMinTerm)) || TERMS[0]));
  const maxTerm = Math.min(TERMS.at(-1), Math.max(minTerm, Math.round(numberValue(els.ruleMaxTerm)) || minTerm));
  state.productRules[els.productName.value] = {
    minDown: Math.min(100, numberValue(els.ruleMinDown)),
    minTerm,
    maxTerm,
    rateType: RATE_TYPES[els.ruleRateType.value] ? els.ruleRateType.value : "simple",
    rate: Math.min(100, numberValue(els.ruleRate))
  };
  persistProductRules();
  applyProductRules();
  renderAllTermButtons();
  renderScreen();
}

function restoreProductRules() {
  state.productRules[els.productName.value] = { ...DEFAULT_PRODUCT_RULES[els.productName.value] };
  persistProductRules();
  applyProductRules();
  renderAllTermButtons();
  renderScreen();
}

function periodicRate(monthlyRate, frequency) {
  return (1 + monthlyRate) ** (1 / frequency.divisor) - 1;
}

function calculatePlan(base, term, frequency, rateType, monthlyRate) {
  const installments = term * frequency.divisor;
  if (!base || !installments) return { installments, payment: 0, interest: 0, total: base, rows: [] };

  const simpleInterest = rateType.key === "simple";
  const rate = simpleInterest ? 0 : periodicRate(monthlyRate, frequency);
  const flatInterest = simpleInterest ? base * monthlyRate * term : 0;
  const regularPayment = simpleInterest
    ? (base + flatInterest) / installments
    : rate
      ? base * (rate * (1 + rate) ** installments) / ((1 + rate) ** installments - 1)
      : base / installments;
  const rows = [];
  let balance = base;
  let total = 0;
  let interest = 0;

  for (let index = 1; index <= installments; index += 1) {
    const charge = simpleInterest ? flatInterest / installments : balance * rate;
    const principal = index === installments ? balance : Math.min(balance, regularPayment - charge);
    const payment = principal + charge;
    balance = Math.max(0, balance - principal);
    total += payment;
    interest += charge;
    rows.push({ index, payment, principal, interest: charge, balance });
  }

  return { installments, payment: regularPayment, interest, total, rows };
}

function planForTerm(quote, term, frequencyKey) {
  return calculatePlan(quote.base, term, FREQUENCIES[frequencyKey], quote.rateType, quote.monthlyRate);
}

function quoteValues() {
  const price = numberValue(els.productAmount);
  const down = Math.min(numberValue(els.downPayment), price);
  const financed = Math.max(0, price - down);
  const rateType = selectedRateType();
  const monthlyRate = rateType.monthlyRate(numberValue(els.monthlyRate) / 100);
  const legal = financed * (numberValue(els.legalRate) / 100);
  const extra = numberValue(els.extraFee);
  const base = financed + legal + extra;
  const frequency = FREQUENCIES[state.frequency];
  const plan = calculatePlan(base, state.term, frequency, rateType, monthlyRate);
  const firstPaymentDate = els.firstPaymentDate.value;
  const schedule = plan.rows.map((row, index) => ({ ...row, dueDate: paymentDate(firstPaymentDate, index, state.frequency) }));

  const quote = {
    product: productDescription(),
    customer: els.customerName.value.trim(),
    price,
    down,
    financed,
    base,
    total: plan.total,
    interest: plan.interest,
    term: state.term,
    frequency,
    monthlyRate,
    rateType,
    payment: plan.payment,
    schedule,
    installments: plan.installments,
    firstPaymentDate,
    rules: rulesFor()
  };
  quote.validation = validateQuote(quote);
  return quote;
}

function validateQuote(quote) {
  const issues = [];
  const suggestions = [];
  const minimumDown = quote.price * (quote.rules.minDown / 100);
  if (quote.price <= 0) issues.push("Indica un precio mayor que cero.");
  if (quote.down < minimumDown) suggestions.push(`Inicial sugerida para este producto: ${money(minimumDown)} (${quote.rules.minDown}%). Puedes imprimir la cotización sin inicial.`);
  if (!allowedTerms().includes(quote.term)) issues.push(`El plazo debe estar entre ${quote.rules.minTerm} y ${quote.rules.maxTerm} meses.`);
  if (numberValue(els.monthlyRate) > 100) issues.push("La tasa no puede exceder 100%.");
  if (!quote.firstPaymentDate) issues.push("Selecciona la fecha de la primera cuota.");
  return { valid: issues.length === 0, issues, suggestions, minimumDown };
}

function paymentForTerm(quote, term, frequencyKey) {
  return planForTerm(quote, term, frequencyKey).payment;
}

function renderAllTermButtons() {
  const terms = allowedTerms();
  els.termPicker.innerHTML = featuredTerms().map((term) => `<button class="choice-chip ${term === state.term ? "active" : ""}" type="button" data-term="${term}">${term}</button>`).join("");
  els.termSelect.innerHTML = terms.map((term) => `<option value="${term}">${term} meses</option>`).join("");
  els.termSelect.value = String(state.term);
}

function renderTermState() {
  $$('[data-term]').forEach((button) => button.classList.toggle("active", Number(button.dataset.term) === state.term));
  els.termSelect.value = String(state.term);
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
  const presentation = PRODUCT_PRESENTATION[els.productName.value];
  els.selectedProductIcon.className = `fa-solid ${presentation.icon}`;
  els.selectedProductName.textContent = els.productName.value;
  els.selectedProductMeta.textContent = presentation.meta;
  els.ruleActionProduct.textContent = els.productName.value;
}

function renderAmortization(quote, target, caption) {
  target.innerHTML = quote.schedule.map((row) => `<tr><td>${row.index}</td><td>${formatDueDate(row.dueDate)}</td><td>${money(row.payment)}</td><td>${money(row.principal)}</td><td>${money(row.interest)}</td><td>${money(row.balance)}</td></tr>`).join("");
  caption.textContent = `${quote.installments} cuotas ${quote.frequency.plural} · inicia ${formatDueDate(quote.firstPaymentDate)}`;
}

function renderRecommendedPlans(quote) {
  const terms = featuredTerms();
  const referenceTerm = Math.max(...terms);
  const referencePlan = planForTerm(quote, referenceTerm, state.frequency);
  els.recommendedPlans.innerHTML = terms.map((term) => {
    const selected = term === quote.term;
    const highlight = term === 15 ? "recommended" : "";
    const plan = planForTerm(quote, term, state.frequency);
    const benefit = term === 12 ? "Pago más rápido" : term === 15 ? "Mejor equilibrio" : "Cuota más baja";
    const savings = Math.max(0, referencePlan.interest - plan.interest);
    const savingsText = term === referenceTerm ? "Referencia de menor cuota" : `Ahorra ${money(savings)} en interés`;
    return `<article class="plan-card ${selected ? "selected" : ""} ${highlight}" data-term="${term}" tabindex="0" role="button" aria-label="Elegir plan de ${term} meses">
      <span class="plan-select"><i class="fa-solid fa-check"></i></span>
      <div><span class="plan-badge">${term === 15 ? "Recomendado" : benefit}</span><h3>${term} meses</h3><p>Total: ${money(plan.total)} · Interés: ${money(plan.interest)}<br>${savingsText}</p></div>
      <div class="plan-payment"><span>Cuota ${quote.frequency.sentence}</span><strong>${money(plan.payment)}</strong></div>
    </article>`;
  }).join("");
  els.planComparisonInfo.textContent = `Comparación con ${referenceTerm} meses: paga antes para reducir el interés total.`;
  els.availableTermsLabel.textContent = `Disponibles de ${quote.rules.minTerm} a ${quote.rules.maxTerm} meses`;
}

function renderValidation(quote) {
  const { valid, issues, suggestions, minimumDown } = quote.validation;
  els.validationSummary.className = `validation-summary ${valid ? "is-valid" : "is-invalid"}`;
  els.validationSummary.innerHTML = valid
    ? suggestions.length
      ? `<i class="fa-solid fa-circle-info"></i><span>${suggestions.join(" ")}</span>`
      : `<i class="fa-solid fa-circle-check"></i><span>Reglas validadas: inicial mínima ${money(minimumDown)} y plazo permitido.</span>`
    : `<i class="fa-solid fa-triangle-exclamation"></i><span>${issues.join(" ")}</span>`;
  els.printBtn.disabled = !valid;
  els.printBtn.title = valid ? suggestions.length ? "Preparar cotización sin inicial" : "Preparar PDF o impresión" : "Corrige las validaciones para generar la propuesta";
}

function renderScreen() {
  const quote = quoteValues();
  const downPercent = quote.price ? Math.round((quote.down / quote.price) * 100) : 0;
  const financedPercent = quote.price ? Math.round((quote.financed / quote.price) * 100) : 0;
  const customer = quote.customer || "No especificado";

  const rateType = selectedRateType();
  if (els.rateLabel) els.rateLabel.textContent = rateType.label;
  if (els.rateHelp) els.rateHelp.textContent = rateType.help;

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
  els.summaryInterest.textContent = money(quote.interest);
  els.summaryDownPercent.textContent = `${downPercent}% del precio`;
  els.summaryFinancedPercent.textContent = `${financedPercent}% del precio`;
  els.summaryInterestDetail.textContent = rateType.shortLabel;
  els.calendarNote.textContent = `${quote.installments} pagos ${quote.frequency.plural}: del ${formatDueDate(quote.firstPaymentDate)} al ${formatDueDate(quote.schedule.at(-1)?.dueDate)}.`;
  renderProductDetailSummary();
  renderProductState();
  renderTermState();
  renderFrequencyState();
  renderValidation(quote);
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
  els.printScheduleInfo.textContent = `Primera cuota: ${formatDueDate(quote.firstPaymentDate)} · ${quote.rateType.shortLabel}`;
  els.printPrice.textContent = money(quote.price);
  els.printDown.textContent = money(quote.down);
  els.printFinanced.textContent = money(quote.financed);
  els.printInterest.textContent = money(quote.interest);
  els.printTotal.textContent = money(quote.total);
  els.printReviewProduct.textContent = quote.product;
  els.printReviewCustomer.textContent = `Cliente: ${customer}`;
  els.printReviewPayment.textContent = `${money(quote.payment)} ${quote.frequency.sentence}`;
  els.printRangeLabel.textContent = `${start} a ${end} meses`;
  els.printPlansBody.innerHTML = allowedTerms().filter((term) => term >= start && term <= end).map((term) => {
    const classes = [term === quote.term ? "selected-row" : "", featuredTerms().includes(term) ? "recommended-row" : ""].filter(Boolean).join(" ");
    return `<tr class="${classes}"><td>${term} meses</td><td>${money(paymentForTerm(quote, term, "monthly"))}</td><td>${money(paymentForTerm(quote, term, "biweekly"))}</td><td>${money(paymentForTerm(quote, term, "weekly"))}</td></tr>`;
  }).join("");
  renderAmortization(quote, els.printAmortizationBody, els.printAmortizationLabel);
  els.printTerms.textContent = `${quote.rateType.shortLabel}: ${els.rateLabel.textContent}. ${quote.rateType.help} Primera cuota el ${formatDueDate(quote.firstPaymentDate)}. Cotización sujeta a validación y aprobación.`;
  const mode = printMode();
  els.printPlansSection.hidden = mode !== "plans";
  els.printAmortizationSection.hidden = mode !== "amortization";
}

function printPageEstimate(mode, start, end, quote) {
  const rows = mode === "plans" ? allowedTerms().filter((term) => term >= start && term <= end).length : quote.installments;
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
    : `Se imprimirá la amortización de ${quote.term} meses (${quote.installments} cuotas ${quote.frequency.plural}).`;
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
  if (!quoteValues().validation.valid) return;
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
  state.frequency = "monthly";
  state.reference = "BORRADOR";
  state.productDetails = {};
  state.product = els.productName.value;
  state.quoteEdited = false;
  els.firstPaymentDate.value = defaultFirstPaymentDate();
  applyProductRules();
  renderAllTermButtons();
  initializePrintRange();
  renderProductDetails();
  renderScreen();
}

function selectTerm(term) {
  const selectedTerm = Number(term);
  const terms = allowedTerms();
  if (!terms.includes(selectedTerm)) return;
  state.term = selectedTerm;
  state.quoteEdited = true;
  renderScreen();
}

function initializePrintRange() {
  const terms = allowedTerms();
  [els.printPlanStart, els.printPlanEnd].forEach((select) => {
    select.innerHTML = terms.map((term) => `<option value="${term}">${term} meses</option>`).join("");
  });
  els.printPlanStart.value = String(terms[0]);
  els.printPlanEnd.value = String(terms.includes(18) ? 18 : terms.at(-1));
}

els.firstPaymentDate.value = defaultFirstPaymentDate();
applyProductRules();
renderAllTermButtons();
initializePrintRange();
renderProductDetails();
renderScreen();

els.form.addEventListener("input", (event) => {
  // El selector de plazo se procesa en su propio control antes de volver a pintar la cotización.
  if (event.target === els.termSelect) return;
  state.quoteEdited = true;
  renderScreen();
});
els.form.addEventListener("change", (event) => {
  if (event.target === els.termSelect) return;
  state.quoteEdited = true;
  renderScreen();
});
els.productName.addEventListener("change", () => {
  saveProductDetails();
  renderProductDetails();
  applyProductRules();
  renderAllTermButtons();
  initializePrintRange();
  renderScreen();
});
els.productPicker.addEventListener("click", (event) => {
  const button = event.target.closest("[data-product]");
  if (!button) return;
  state.quoteEdited = true;
  saveProductDetails();
  els.productName.value = button.dataset.product;
  renderProductDetails();
  applyProductRules();
  renderAllTermButtons();
  initializePrintRange();
  els.productMenu.open = false;
  renderScreen();
});
els.termPicker.addEventListener("click", (event) => {
  const button = event.target.closest("[data-term]");
  if (button) selectTerm(Number(button.dataset.term));
});
// Algunos navegadores emiten "input" antes de "change" en un <select>.
// Sin esta sincronización, el render general podía restaurar el plazo anterior.
const syncSelectedTerm = () => selectTerm(els.termSelect.value);
els.termSelect.addEventListener("input", syncSelectedTerm);
els.termSelect.addEventListener("change", syncSelectedTerm);
els.frequencyPicker.addEventListener("click", (event) => {
  const button = event.target.closest("[data-frequency]");
  if (!button) return;
  state.quoteEdited = true;
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
els.saveRulesBtn.addEventListener("click", saveProductRules);
els.restoreRulesBtn.addEventListener("click", restoreProductRules);
els.openRulesBtn.addEventListener("click", () => els.rulesDialog.showModal());
els.printPlanStart.addEventListener("change", () => { updateRangeSummary(); renderScreen(); });
els.printPlanEnd.addEventListener("change", () => { updateRangeSummary(); renderScreen(); });
els.printModes.forEach((input) => input.addEventListener("change", () => { updateRangeSummary(); renderScreen(); }));
els.cancelPrintBtn.addEventListener("click", closePrintDialog);
els.confirmPrintBtn.addEventListener("click", () => { renderScreen(); closePrintDialog(); document.body.dataset.printTarget = "quote"; window.print(); });
els.printModal.addEventListener("click", (event) => { if (event.target === els.printModal) closePrintDialog(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && els.printModal.classList.contains("is-open")) closePrintDialog(); });

// Ficha operativa de cobro: se prepara digitalmente y se completa a mano durante la visita.
(() => {
  const fieldMenu = document.querySelector("#fieldMenuCards");
  const commercialMenu = document.querySelector("#commercialMenuCards");
  const evaluation = document.querySelector("#evaluationWorkspace");
  if (!fieldMenu || !commercialMenu || !evaluation) return;
  const choice = document.createElement("button");
  choice.className = "workspace-choice workspace-choice--collection";
  choice.type = "button";
  choice.dataset.workspaceTarget = "collection";
  choice.innerHTML = '<span><i class="fa-solid fa-hand-holding-dollar"></i></span><b>Visita de cobro</b><small>Prepara una ficha para gestionar atrasos y compromisos de pago.</small><em>Preparar ficha <i class="fa-solid fa-arrow-right"></i></em>';
  fieldMenu.append(choice);

  const workspace = document.createElement("section");
  workspace.className = "workspace collection-workspace";
  workspace.id = "collectionWorkspace";
  workspace.hidden = true;
  workspace.innerHTML = `<header class="collection-hero"><div class="collection-brand"><img src="LOGO%20M%26M.png" alt="M&M Inversiones"><span></span><img src="LOGO%20VEGAMOTORS.png" alt="VegaMotors"></div><div><p>Gestión de cartera</p><h2>Ficha de visita de cobro</h2><span>Prepara los datos antes de salir y completa el resultado manualmente durante la visita.</span></div><div class="collection-state"><i class="fa-solid fa-route"></i><span>Uso de campo<br><b>Registro temporal</b></span></div></header><form class="collection-form" id="collectionForm" novalidate autocomplete="off"><section class="collection-section"><div class="collection-section-heading"><span>01</span><div><p>Control de ruta</p><h3>Datos de la visita</h3></div></div><div class="application-fields four-columns"><label>Fecha de visita <input name="collectionDate" type="date" required></label><label>Gestor de cobro <input name="collectionAgent" required placeholder="Nombre del gestor"></label><label>Sucursal <select name="collectionBranch" required><option value="">Selecciona</option><option>VegaMotors</option><option>M&M Inversiones</option><option>Otra</option></select></label><label>Referencia de visita <input name="collectionReference" readonly></label></div></section><section class="collection-section"><div class="collection-section-heading"><span>02</span><div><p>Cliente y préstamo</p><h3>Estado de la obligación</h3></div></div><div class="application-fields four-columns"><label class="span-two">Nombre completo <input name="collectionClientName" required placeholder="Nombre y apellidos"></label><label>Cédula <input name="collectionClientId" required placeholder="000-0000000-0"></label><label>Teléfono <input name="collectionClientPhone" type="tel" placeholder="809-000-0000"></label><label> Número de préstamo <input name="collectionLoanNumber" required placeholder="Ej. PRE-000123"></label><label>Total en atraso <span class="currency-input"><b>RD$</b><input name="collectionArrears" type="number" min="0" required placeholder="0"></span></label><label>Total de la deuda <span class="currency-input"><b>RD$</b><input name="collectionTotalDebt" type="number" min="0" required placeholder="0"></span></label><label>Cuotas vencidas <input name="collectionOverdueInstallments" type="number" min="0" placeholder="0"></label><label>Último pago · fecha <input name="collectionLastPaymentDate" type="date"></label><label>Último pago · monto <span class="currency-input"><b>RD$</b><input name="collectionLastPaymentAmount" type="number" min="0" placeholder="0"></span></label><label class="span-two">Dirección para visita <input name="collectionAddress" placeholder="Calle, número, sector, ciudad o paraje"></label><label class="span-two">Referencia de ubicación <input name="collectionLocationReference" placeholder="Ej. cerca de la escuela, colmado o negocio"></label></div></section><section class="collection-section collection-field-note"><div><i class="fa-solid fa-pen-to-square"></i><div><b>Completar durante la visita</b><span>La ficha impresa incluirá casillas de resultado, compromiso de pago, nueva información de contacto y observaciones para llenar a mano.</span></div></div><div class="collection-actions"><button class="quiet-btn" id="clearCollectionBtn" type="button"><i class="fa-solid fa-eraser"></i> Limpiar</button><button class="primary-btn" id="printCollectionBtn" type="button"><i class="fa-solid fa-print"></i> Imprimir ficha</button></div><p class="application-status" id="collectionStatus" aria-live="polite">Completa los datos básicos antes de imprimir la visita.</p></section></form></section>`;
  evaluation.after(workspace);

  const report = document.createElement("section");
  report.className = "collection-print-report";
  report.id = "collectionPrintReport";
  report.setAttribute("aria-label", "Ficha de visita de cobro imprimible");
  report.innerHTML = '<article class="collection-print-sheet"><header><div class="collection-print-brand"><img src="LOGO%20M%26M.png" alt="M&M Inversiones"><img src="LOGO%20VEGAMOTORS.png" alt="VegaMotors"></div><span id="collectionPrintReference"></span></header><div class="collection-print-title"><span>Gestión de cartera · uso interno</span><h1>FICHA DE VISITA DE COBRO</h1><p>Preparada para completar manualmente durante la visita.</p></div><section class="collection-print-client"><h2>Cliente y obligación</h2><dl id="collectionPrintClient"></dl></section><section class="collection-print-outcome"><h2>Resultado de la visita <small>Marcar manualmente</small></h2><div><span>☐ Localizado</span><span>☐ No localizado</span><span>☐ Promesa de pago</span><span>☐ Pago recibido</span><span>☐ Cambio de dirección</span><span>☐ Rechazo de contacto</span></div></section><section class="collection-print-manual"><h2>Compromiso, pago o actualización de datos</h2><p><b>Monto acordado / recibido:</b><span></span><b>Fecha comprometida:</b><span></span></p><p><b>Nuevo teléfono o dirección:</b><span></span></p></section><section class="collection-print-notes"><h2>Observaciones del gestor</h2><span></span><span></span><span></span></section><section class="collection-print-signatures"><div><span></span><small>Firma del gestor de cobro</small><b id="collectionPrintAgent">Gestor</b></div><div><span></span><small>Fecha y hora de cierre de visita</small><b>________________________</b></div></section></article>';
  document.body.append(report);

  const preChoice = document.createElement("button");
  preChoice.className = "workspace-choice workspace-choice--preapplication";
  preChoice.type = "button";
  preChoice.dataset.workspaceTarget = "preapplication";
  preChoice.innerHTML = '<span><i class="fa-solid fa-filter-circle-dollar"></i></span><b>Pre-solicitud</b><small>Filtra capacidad y datos esenciales antes de la solicitud completa.</small><em>Preparar pre-solicitud <i class="fa-solid fa-arrow-right"></i></em>';
  commercialMenu.append(preChoice);
  const preWorkspace = document.createElement("section");
  preWorkspace.className = "workspace preapplication-workspace";
  preWorkspace.id = "preApplicationWorkspace";
  preWorkspace.hidden = true;
  preWorkspace.innerHTML = `<header class="preapplication-hero"><div class="preapplication-brand"><img src="LOGO%20M%26M.png" alt="M&M Inversiones"><span></span><img src="LOGO%20VEGAMOTORS.png" alt="VegaMotors"></div><div><p>Filtro comercial</p><h2>Pre-solicitud de crédito</h2><span>Captura lo esencial, calcula capacidad y toma una decisión preliminar.</span></div><div class="preapplication-state"><i class="fa-solid fa-bolt"></i><span>Proceso rápido<br><b>Uso interno</b></span></div></header><form class="preapplication-form" id="preApplicationForm" novalidate autocomplete="off"><section class="preapplication-section"><div class="preapplication-heading"><span>01</span><div><p>Control</p><h3>Datos de la pre-solicitud</h3></div></div><div class="application-fields four-columns"><label>Fecha <input name="preDate" type="date" required></label><label>Colaborador <input name="preAdvisor" required placeholder="Nombre del colaborador"></label><label>Sucursal <select name="preBranch" required><option value="">Selecciona</option><option>VegaMotors</option><option>M&M Inversiones</option><option>Otra</option></select></label><label>Referencia <input name="preReference" readonly></label></div></section><section class="preapplication-section"><div class="preapplication-heading"><span>02</span><div><p>Cliente</p><h3>Información esencial</h3></div></div><div class="preapplication-client-grid"><div class="application-fields two-columns"><label class="span-two">Nombre completo <input name="preClientName" required placeholder="Nombre y apellidos"></label><label>Cédula <input name="preClientId" required placeholder="000-0000000-0"></label><label>Teléfono <input name="preClientPhone" type="tel" placeholder="809-000-0000"></label><label class="span-two">Dirección completa <input name="preAddress" required placeholder="Calle, número, sector, ciudad o paraje"></label><label>Referencia de ubicación 1 <input name="preReference1" required placeholder="Ej. colmado, escuela o iglesia"></label><label>Referencia de ubicación 2 <input name="preReference2" required placeholder="Ej. parada, negocio o ferretería"></label><label class="span-two">Trabajo o actividad <input name="preWork" required placeholder="Empresa, negocio o actividad"></label><label class="span-two">Ingresos mensuales <span class="currency-input"><b>RD$</b><input name="preIncome" type="number" min="0" required placeholder="0"></span></label></div><section class="preapplication-upload"><div><i class="fa-regular fa-id-card"></i><h3>Cédula frontal</h3></div><label class="upload-drop"><input name="preIdPhoto" type="file" accept="image/*"><img id="preIdPreview" alt="Vista previa de cédula" hidden><span><i class="fa-solid fa-cloud-arrow-up"></i><b>Subir foto de cédula</b><small>JPG, PNG o WEBP</small></span></label></section></div></section><section class="preapplication-section"><div class="preapplication-heading"><span>03</span><div><p>Necesidad y capacidad</p><h3>Datos del financiamiento</h3></div></div><div class="preapplication-finance-grid"><div class="application-fields four-columns"><label>Tipo de préstamo <select name="preLoanType" required><option value="">Selecciona</option><option>Préstamo personal</option><option>Préstamo comercial</option><option>Compra de motocicleta</option><option>Compra de smartphone</option><option>Compra de electrodoméstico</option></select></label><label class="span-two">Qué desea financiar <input name="preProduct" required placeholder="Producto, servicio o detalle"></label><label>Monto solicitado <span class="currency-input"><b>RD$</b><input name="preAmount" type="number" min="0" required placeholder="0"></span></label><label>Inicial disponible <span class="currency-input"><b>RD$</b><input name="preInitial" type="number" min="0" placeholder="0"></span></label><label>Cuota propuesta <span class="currency-input"><b>RD$</b><input name="prePayment" type="number" min="0" required placeholder="0"></span></label><label>Plazo deseado <input name="preTerm" type="number" min="1" placeholder="Meses"></label></div><aside class="preapplication-capacity" id="preCapacity"><div><i class="fa-solid fa-gauge-high"></i><span>Capacidad automática</span></div><strong>Completa ingresos y cuota</strong><small>La capacidad recomendada equivale al 35% de los ingresos mensuales.</small></aside></div></section><section class="preapplication-section preapplication-decision"><div class="preapplication-heading"><span>04</span><div><p>Decisión preliminar</p><h3>Ruta recomendada</h3></div></div><div class="preapplication-decision-options" role="radiogroup" aria-label="Decisión preliminar"><label><input name="preDecision" type="radio" value="Proceder"><span><i class="fa-solid fa-circle-check"></i><b>Proceder</b><small>Continuar con solicitud completa.</small></span></label><label><input name="preDecision" type="radio" value="Proceder con modificaciones"><span><i class="fa-solid fa-pen-to-square"></i><b>Proceder con modificaciones</b><small>Ajustar monto, inicial o cuota.</small></span></label><label><input name="preDecision" type="radio" value="Descartar"><span><i class="fa-solid fa-circle-xmark"></i><b>Descartar</b><small>No continuar en esta etapa.</small></span></label></div><label class="preapplication-notes">Motivo o comentario <textarea name="preNotes" placeholder="Resume la decisión o ajustes requeridos"></textarea></label><div class="preapplication-actions"><button class="quiet-btn" id="clearPreApplicationBtn" type="button"><i class="fa-solid fa-eraser"></i> Limpiar</button><button class="primary-btn" id="printPreApplicationBtn" type="button"><i class="fa-solid fa-print"></i> Imprimir pre-solicitud</button></div><p class="application-status" id="preApplicationStatus" aria-live="polite">Completa los datos esenciales para preparar la pre-solicitud.</p></section></form></section>`;
  workspace.after(preWorkspace);
  const preReport = document.createElement("section");
  preReport.className = "preapplication-print-report";
  preReport.id = "preApplicationPrintReport";
  preReport.innerHTML = '<article class="preapplication-print-sheet"><header><div class="preapplication-print-brand"><img src="LOGO%20M%26M.png" alt="M&M Inversiones"><img src="LOGO%20VEGAMOTORS.png" alt="VegaMotors"></div><span id="prePrintReference"></span></header><div class="preapplication-print-title"><span>Filtro comercial · uso interno</span><h1>PRE-SOLICITUD DE CRÉDITO</h1><p>Resumen preliminar para continuar, modificar o descartar.</p></div><section><h2>Cliente</h2><div class="preapplication-print-client"><figure id="prePrintPhotoFigure" hidden><img id="prePrintPhoto" alt="Cédula del cliente"><figcaption>Cédula frontal</figcaption></figure><dl id="prePrintClient"></dl></div></section><section><h2>Financiamiento y capacidad</h2><dl id="prePrintFinance"></dl></section><section class="preapplication-print-decision"><h2>Decisión preliminar</h2><p id="prePrintDecision"></p><span id="prePrintNotes"></span></section><section class="preapplication-print-signatures"><div><span></span><small>Colaborador</small><b id="prePrintAdvisor">Colaborador</b></div><div><span></span><small>Revisión / supervisor</small><b>________________________</b></div></section></article>';
  document.body.append(preReport);
})();

// Documentos operativos temporales: preparados para impresión hoy y para integrarse a una base de datos después.
(() => {
  const sections = document.querySelector(".workspace-menu-sections");
  const shell = document.querySelector(".app-shell");
  if (!sections || !shell) return;
  const escape = (text) => String(text ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const number = (raw) => Number(String(raw ?? "").replace(/[^\d,.-]/g, "").replaceAll(",", "")) || 0;
  const pesos = (raw, fallback = "—") => String(raw ?? "").trim() === "" ? fallback : `RD$ ${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number(raw))}`;
  const today = () => new Date().toISOString().slice(0, 10);
  const formalSection = document.createElement("section");
  formalSection.className = "workspace-menu-section workspace-menu-section--formal";
  formalSection.innerHTML = '<header><span><i class="fa-solid fa-file-signature"></i> Formalización</span><h3 id="formalToolsTitle">Contrato, entrega y autorización</h3><p>Documentos listos para firmar y respaldar cada operación.</p></header><div class="workspace-menu-cards" id="formalMenuCards"></div>';
  const controlSection = document.createElement("section");
  controlSection.className = "workspace-menu-section workspace-menu-section--control";
  controlSection.innerHTML = '<header><span><i class="fa-solid fa-money-bill-transfer"></i> Cobro y control</span><h3 id="controlToolsTitle">Gestión financiera diaria</h3><p>Recibos, acuerdos, saldos y control interno.</p></header><div class="workspace-menu-cards" id="controlMenuCards"></div>';
  sections.append(formalSection, controlSection);
  const menus = { commercial: document.querySelector("#commercialMenuCards"), field: document.querySelector("#fieldMenuCards"), formal: formalSection.querySelector("div"), control: controlSection.querySelector("div") };
  const f = (n, l, o = {}) => ({ n, l, ...o });
  const commonControl = [f("date", "Fecha", { type: "date", required: true }), f("branch", "Sucursal", { options: ["VegaMotors", "M&M Inversiones", "Otra"], required: true }), f("staff", "Responsable", { required: true }), f("reference", "Referencia", { readonly: true })];
  const commonClient = [f("clientName", "Nombre completo", { required: true, wide: true }), f("clientId", "Cédula", { required: true }), f("phone", "Teléfono"), f("loanNumber", "Número de préstamo"), f("address", "Dirección", { wide: true })];
  const docs = [
    { id: "payment", menu: "control", icon: "fa-receipt", menuTitle: "Recibo de pago", title: "Recibo de pago y otros ingresos", subtitle: "Comprobante temporal de ingreso", prefix: "REC", groups: [["Control del recibo", commonControl], ["Cliente y operación", commonClient], ["Detalle del ingreso", [f("concept", "Concepto", { options: ["Cuota de préstamo", "Abono a capital", "Inicial de préstamo", "Pago de mora / recargo", "Pago de cuota de motocicleta", "Inicial de motocicleta", "Pago de documentos de motocicleta", "Matrícula", "Placa", "Traspaso", "Seguro", "Reserva de motocicleta", "Venta de contado", "Pago de smartphone", "Pago de electrodomésticos", "Cargo administrativo", "Gastos de legalización o notario", "Gastos de cobro legal", "Penalidad o cargo por atraso", "Reposición de llave o accesorio", "Otros"], required: true }), f("paymentMethod", "Método de pago", { options: ["Efectivo", "Transferencia bancaria", "Depósito bancario", "Tarjeta de débito o crédito", "Cheque", "Pago móvil / billetera", "Otro"], required: true }), f("amount", "Monto recibido", { money: true, required: true }), f("voucher", "No. comprobante", { readonly: true }), f("notes", "Detalle u observación", { textarea: true, wide: true })]]], declaration: "Recibo conforme el monto descrito por el concepto indicado. El número de referencia y el número de comprobante identifican el mismo recibo.", signatures: ["Recibido de", "Recibido por"] },
    { id: "agreement", menu: "control", icon: "fa-handshake", menuTitle: "Acuerdo de pago", title: "Acuerdo de pago y regularización", subtitle: "Compromiso para normalizar la obligación", prefix: "ACU", groups: [["Control", commonControl], ["Cliente", commonClient], ["Estado y propuesta", [f("totalDebt", "Deuda total", { money: true, required: true }), f("arrears", "Monto en atraso", { money: true, required: true }), f("overdue", "Cuotas vencidas", { type: "number" }), f("regularization", "Inicial de regularización", { money: true }), f("commitmentDate", "Fecha comprometida", { type: "date", required: true }), f("newPayment", "Nueva cuota", { money: true }), f("conditions", "Condiciones acordadas", { textarea: true, wide: true })]]], decision: ["Aprobado", "Aprobado con condiciones", "Pendiente"], declaration: "El cliente reconoce el balance indicado y se compromete a cumplir la propuesta establecida.", signatures: ["Cliente / deudor", "Codeudor (si aplica)", "Representante de la empresa"] },
    { id: "motorcycle-delivery", menu: "formal", icon: "fa-motorcycle", menuTitle: "Entrega de motocicleta", title: "Acta de entrega de motocicleta", subtitle: "Constancia de entrega física de la unidad", prefix: "ENTM", groups: [["Control de entrega", commonControl], ["Cliente", commonClient], ["Motocicleta", [f("brand", "Marca", { required: true }), f("model", "Modelo", { required: true }), f("year", "Año", { type: "number" }), f("color", "Color"), f("chassis", "No. chasis", { required: true }), f("engine", "No. motor"), f("plate", "No. placa"), f("registration", "No. matrícula"), f("odometer", "Kilometraje", { type: "number" })]]], checks: ["Llave principal", "Llave de repuesto", "Casco", "Manual", "Matrícula", "Placa", "Seguro", "Otros accesorios"], declaration: "El cliente recibe la motocicleta y los accesorios señalados en el estado indicado, luego de verificar sus datos principales.", signatures: ["Recibido por el cliente", "Entregado por la empresa"] },
    { id: "dossier", menu: "field", icon: "fa-folder-open", menuTitle: "Checklist de expediente", title: "Checklist de expediente de crédito", subtitle: "Control interno de documentos y pendientes", prefix: "EXP", groups: [["Control de revisión", commonControl], ["Cliente y crédito", [...commonClient, f("loanType", "Tipo de crédito", { options: ["Préstamo personal", "Préstamo comercial", "Préstamo con garantía", "Préstamo hipotecario", "Financiamiento de smartphone", "Financiamiento de electrodomésticos"], required: true })]]], checks: ["Cédula del deudor", "Foto del deudor", "Buró del deudor", "Referencias del deudor", "Evaluación de campo del deudor", "Cédula del codeudor (si aplica)", "Foto del codeudor (si aplica)", "Buró del codeudor (si aplica)", "Referencias del codeudor (si aplica)", "Evaluación de campo del codeudor (si aplica)", "Cotización", "Contrato", "Pagaré", "Autorización de cobro", "Garantía", "Matrícula", "Seguro", "Recibo de inicial", "Aprobación"], manual: "Documentos pendientes, responsable y fecha límite:", signatures: ["Revisado por", "Recibido para expediente"] },
    { id: "promissory", menu: "formal", icon: "fa-file-contract", menuTitle: "Pagaré simple", title: "Pagaré simple a la orden", subtitle: "Compromiso formal de pago", prefix: "PAG", calculator: true, codebtor: true, guarantee: true, defaults: { beneficiary: "M&M Inversiones / VegaMotors", placeOfPayment: "República Dominicana" }, groups: [["Control", commonControl], ["Deudor", [f("debtorName", "Nombre completo", { required: true, wide: true }), f("debtorId", "Cédula", { required: true }), f("debtorPhone", "Teléfono"), f("loanNumber", "No. de préstamo provisional", { readonly: true, wide: true }), f("debtorAddress", "Dirección residencial completa", { required: true, wide: true }), f("debtorWork", "Lugar de trabajo / actividad", { wide: true }), f("debtorIncome", "Ingresos mensuales", { money: true })]], ["Obligación", [f("beneficiary", "Beneficiario", { readonly: true, wide: true }), f("principal", "Monto prestado", { money: true, required: true }), f("rate", "Tasa mensual (%)", { type: "number", step: "0.01", required: true }), f("term", "Plazo (meses)", { type: "number", required: true }), f("startDate", "Fecha de inicio", { type: "date", required: true }), f("dueDate", "Fecha de vencimiento", { type: "date", required: true }), f("placeOfPayment", "Lugar de pago", { required: true }), f("valueReceived", "Valor recibido / causa", { options: ["Préstamo personal entregado en efectivo", "Préstamo comercial / capital de trabajo", "Financiamiento de motocicleta", "Saldo financiado de motocicleta", "Financiamiento de smartphone", "Financiamiento de electrodomésticos", "Préstamo con garantía de vehículo", "Préstamo hipotecario", "Otro"], required: true, wide: true }), f("hasGuarantee", "Requiere garantía", { checkbox: true }), f("security", "Describe la garantía", { wide: true })]]], codebtorFields: [f("coDebtorName", "Nombre completo del codeudor", { required: true, wide: true }), f("coDebtorId", "Cédula del codeudor", { required: true }), f("coDebtorPhone", "Teléfono del codeudor"), f("coDebtorAddress", "Dirección residencial completa", { required: true, wide: true }), f("coDebtorWork", "Lugar de trabajo / actividad", { wide: true }), f("coDebtorIncome", "Ingresos mensuales", { money: true })], declaration: "El Deudor promete pagar incondicionalmente a la orden del Beneficiario la suma indicada, en la fecha y lugar de pago pactados. Si interviene un Codeudor, este asume las obligaciones que acepte mediante su firma. Las partes declaran haber leído, comprendido y aceptado voluntariamente el contenido del documento.", legalNote: "Modelo operativo orientado a los requisitos del pagaré a la orden y de las convenciones en República Dominicana. Debe ser revisado y aprobado por un abogado dominicano antes de su uso definitivo.", signatures: ["Deudor", "Codeudor (si aplica)", "Testigo / representante"] },
    { id: "authorization", menu: "formal", icon: "fa-phone-volume", menuTitle: "Autorización de cobro", title: "Autorización de cobro y contacto", subtitle: "Consentimiento de contacto y gestión", prefix: "AUT", groups: [["Control", commonControl], ["Titular", commonClient], ["Codeudor", [f("coDebtor", "Nombre del codeudor"), f("coDebtorId", "Cédula del codeudor"), f("coDebtorPhone", "Teléfono del codeudor")]]], checks: ["Llamadas", "Mensajes", "Correo electrónico", "Contacto a referencias", "Visita domiciliaria", "Gestión de cobro"], declaration: "Autorizo a M&M Inversiones / VegaMotors a utilizar los medios marcados para fines de verificación, comunicación y gestión de la obligación.", signatures: ["Titular / deudor", "Codeudor (si aplica)", "Recibido por la empresa"] },
    { id: "disbursement", menu: "formal", icon: "fa-circle-check", menuTitle: "Orden de desembolso", title: "Orden de desembolso o autorización de entrega", subtitle: "Control interno previo a la entrega", prefix: "DES", groups: [["Control", commonControl], ["Cliente y operación", [...commonClient, f("product", "Producto o unidad", { wide: true }), f("amount", "Monto autorizado", { money: true, required: true }), f("initial", "Inicial confirmada", { money: true }), f("payment", "Cuota", { money: true }), f("term", "Plazo (meses)", { type: "number" }), f("rate", "Tasa mensual (%)", { type: "number", step: "0.01" })]], ["Aprobación", [f("commercial", "Responsable comercial"), f("reviewer", "Revisor"), f("approver", "Aprobador")]]], checks: ["Expediente completo", "Pagaré firmado", "Inicial confirmada", "Garantía validada", "Autorización de entrega"], decision: ["Aprobado", "Aprobado con condiciones", "Pendiente"], declaration: "La entrega solamente podrá realizarse cuando se hayan validado las condiciones y controles marcados.", signatures: ["Responsable comercial", "Revisión", "Aprobación"] },
    { id: "balance", menu: "control", icon: "fa-file-invoice-dollar", menuTitle: "Carta de saldo", title: "Carta de saldo / estado de cuenta", subtitle: "Resumen informativo de obligación", prefix: "SAL", groups: [["Control", commonControl], ["Cliente", commonClient], ["Estado de cuenta", [f("originalAmount", "Monto original", { money: true }), f("payments", "Pagos realizados", { money: true }), f("balance", "Saldo pendiente", { money: true, required: true }), f("arrears", "Cuotas vencidas", { type: "number" }), f("lateFee", "Mora", { money: true }), f("lastPayment", "Último pago", { money: true }), f("lastPaymentDate", "Fecha del último pago", { type: "date" }), f("regularization", "Monto para regularizar", { money: true })]]], declaration: "Este documento presenta un resumen informativo a la fecha de corte indicada y está sujeto a validación administrativa.", signatures: ["Emitido por", "Recibido por el cliente"] },
    { id: "cash-close", menu: "control", icon: "fa-cash-register", menuTitle: "Arqueo y cierre diario", title: "Arqueo y cierre diario", subtitle: "Control interno de ingresos y diferencias", prefix: "CAJ", groups: [["Control de caja", [f("date", "Fecha", { type: "date", required: true }), f("branch", "Sucursal", { options: ["VegaMotors", "M&M Inversiones", "Otra"], required: true }), f("staff", "Responsable de caja", { required: true }), f("reference", "Referencia", { readonly: true })]], ["Resumen del día", [f("receipts", "Recibos emitidos", { type: "number" }), f("cash", "Efectivo recibido", { money: true }), f("transfer", "Transferencias", { money: true }), f("deposits", "Depósitos", { money: true }), f("otherIncome", "Otros ingresos", { money: true }), f("voids", "Anulaciones", { money: true }), f("expenses", "Gastos autorizados", { money: true }), f("expected", "Total esperado", { money: true }), f("counted", "Total contado", { money: true }), f("difference", "Diferencia", { money: true })]], ["Detalle manual", [f("details", "Detalle de recibos, depósitos, anulaciones u observaciones", { textarea: true, wide: true })]]], manual: "Observaciones de cierre y acciones requeridas:", signatures: ["Responsable de caja", "Revisado por"] },
    { id: "credit-letter", menu: "commercial", icon: "fa-envelope-open-text", menuTitle: "Comunicación de crédito", title: "Carta de aprobación, requerimiento o rechazo", subtitle: "Comunicación comercial al cliente", prefix: "COM", groups: [["Control", commonControl], ["Cliente", commonClient], ["Comunicación", [f("result", "Tipo de comunicación", { options: ["Preaprobación", "Aprobación", "Requerimiento de documentos", "Rechazo"], required: true }), f("product", "Producto o solicitud", { wide: true }), f("amount", "Monto aprobado o solicitado", { money: true }), f("initial", "Inicial", { money: true }), f("payment", "Cuota", { money: true }), f("term", "Plazo (meses)", { type: "number" }), f("conditions", "Condiciones, documentos requeridos o motivo", { textarea: true, wide: true })]]], declaration: "Esta comunicación es informativa y está sujeta a las políticas, validaciones y formalización correspondientes.", signatures: ["Elaborado por", "Revisión comercial"] }
  ];
  function control(label, field) {
    const required = field.required ? " required" : ""; const wide = field.wide ? " span-two" : "";
    if (field.checkbox) return `<label class="document-inline-check${wide}"><input name="${field.n}" type="checkbox"><span>${escape(field.l)}</span></label>`;
    if (field.textarea) return `<label class="${wide}">${escape(field.l)}<textarea name="${field.n}" placeholder="${escape(field.placeholder || "Escribe los detalles necesarios")}"></textarea></label>`;
    if (field.options) return `<label class="${wide}">${escape(field.l)}<select name="${field.n}"${required}><option value="">Selecciona</option>${field.options.map((item) => `<option>${escape(item)}</option>`).join("")}</select></label>`;
    const input = `<input name="${field.n}" type="${field.type || "text"}"${field.step ? ` step="${field.step}"` : ""}${field.readonly ? " readonly" : ""}${required} placeholder="${escape(field.placeholder || (field.type === "date" ? "" : "Completar"))}">`;
    return `<label class="${wide}">${escape(field.l)}${field.money ? `<span class="currency-input"><b>RD$</b>${input}</span>` : input}</label>`;
  }
  function addDocument(cfg) {
    const button = document.createElement("button"); button.type = "button"; button.className = "workspace-choice workspace-choice--document"; button.dataset.workspaceTarget = cfg.id; button.innerHTML = `<span><i class="fa-solid ${cfg.icon}"></i></span><b>${escape(cfg.menuTitle)}</b><small>${escape(cfg.subtitle)}</small><em>Preparar documento <i class="fa-solid fa-arrow-right"></i></em>`; menus[cfg.menu].append(button);
    const workspace = document.createElement("section"); workspace.className = "workspace document-workspace"; workspace.id = `documentWorkspace-${cfg.id}`; workspace.dataset.workspaceTitle = cfg.menuTitle; workspace.hidden = true;
    const codebtorHtml = cfg.codebtor ? `<section class="document-section document-codebtor" data-codebtor-section hidden><div class="document-section-heading"><span>03</span><div><p>Obligado solidario</p><h3>Codeudor</h3></div></div><div class="application-fields four-columns">${cfg.codebtorFields.map((field) => control("Codeudor", field)).join("")}</div></section>` : "";
    const groupHtml = cfg.groups.map(([title, fields], index) => `${cfg.codebtor && index === 2 ? codebtorHtml : ""}<section class="document-section"><div class="document-section-heading"><span>${String(index + 1 + (cfg.codebtor && index === 2 ? 1 : 0)).padStart(2, "0")}</span><div><p>${index === 0 ? "Datos principales" : "Información del documento"}</p><h3>${escape(title)}</h3></div>${cfg.codebtor && title === "Deudor" ? '<label class="document-codebtor-toggle"><input name="requiresCodebtor" type="checkbox"><span>Requiere codeudor</span></label>' : ""}</div><div class="application-fields four-columns">${fields.map((field) => control(title, field)).join("")}</div>${cfg.calculator && index === cfg.groups.length - 1 ? '<aside class="document-interest-card" data-interest-card><b>Interés simple estimado</b><dl><div><dt>Interés</dt><dd>RD$ 0.00</dd></div><div><dt>Total a pagar</dt><dd>RD$ 0.00</dd></div><div><dt>Cuota estimada</dt><dd>RD$ 0.00</dd></div></dl><small>Capital × tasa mensual × plazo. Resultado orientativo para el pagaré.</small></aside>' : ""}</section>`).join("");
    const checks = cfg.checks ? `<section class="document-section"><div class="document-section-heading"><span>${String(cfg.groups.length + 1).padStart(2, "0")}</span><div><p>Verificación</p><h3>Checklist</h3></div></div><div class="document-checks">${cfg.checks.map((item, index) => `<label><input type="checkbox" name="check_${index}"><span>${escape(item)}</span></label>`).join("")}</div></section>` : "";
    const decision = cfg.decision ? `<section class="document-section document-decision"><div class="document-section-heading"><span>${String(cfg.groups.length + (cfg.checks ? 2 : 1)).padStart(2, "0")}</span><div><p>Decisión manual</p><h3>Completar en la hoja impresa</h3></div></div><p><i class="fa-solid fa-clipboard-check"></i> La decisión final se marca manualmente al momento de revisar o firmar el documento.</p></section>` : "";
    workspace.innerHTML = `<header class="document-hero"><div class="document-brand"><img src="LOGO%20M%26M.png" alt="M&M Inversiones"><span></span><img src="LOGO%20VEGAMOTORS.png" alt="VegaMotors"></div><div><p>Documento operativo</p><h2>${escape(cfg.title)}</h2><span>${escape(cfg.subtitle)}</span></div><div class="document-state"><i class="fa-solid ${cfg.icon}"></i><span>Modo temporal<br><b>Listo para imprimir</b></span></div></header><form class="document-form" novalidate autocomplete="off">${groupHtml}${checks}${decision}<section class="document-actions"><div><i class="fa-solid fa-file-shield"></i><span><b>Registro temporal</b><small>Descarga la ficha individual si necesitas continuar el llenado después.</small></span></div><p class="application-status" aria-live="polite">Completa los datos principales para preparar el documento.</p><aside><input type="file" accept="application/json" hidden><button class="quiet-btn" type="button" data-load><i class="fa-solid fa-upload"></i> Cargar ficha</button><button class="quiet-btn" type="button" data-save><i class="fa-solid fa-download"></i> Descargar ficha</button><button class="quiet-btn" type="button" data-clear><i class="fa-solid fa-eraser"></i> Limpiar</button><button class="primary-btn" type="button" data-print><i class="fa-solid fa-print"></i> Imprimir</button></aside></section></form>`;
    shell.append(workspace);
    const report = document.createElement("section"); report.className = "document-print-report"; report.id = `documentPrint-${cfg.id}`; report.innerHTML = '<article class="document-print-sheet"></article>'; document.body.append(report);
    const form = workspace.querySelector("form"); const status = form.querySelector(".application-status"); const required = cfg.groups.flatMap(([, fields]) => fields.filter((field) => field.required)); const codebtorToggle = form.elements.requiresCodebtor; const codebtorSection = form.querySelector("[data-codebtor-section]"); const guaranteeToggle = form.elements.hasGuarantee; const guaranteeField = form.elements.security?.closest("label");
    const ref = () => String(form.elements.reference?.value || `${cfg.prefix}-${String(form.elements.date?.value || today()).replaceAll("-", "")}`).trim();
    const values = () => Object.fromEntries([...new FormData(form)].filter(([key]) => !key.startsWith("check_")).map(([key, value]) => [key, String(value).trim()]));
    const checkValues = () => cfg.checks?.map((item, index) => ({ item, checked: form.elements[`check_${index}`]?.checked })) || [];
    const syncCodebtor = () => { if (!cfg.codebtor) return; codebtorSection.hidden = !codebtorToggle.checked; };
    const syncGuarantee = () => { if (!cfg.guarantee) return; guaranteeField.hidden = !guaranteeToggle.checked; };
    const setDefaults = () => { form.reset(); if (form.elements.date) form.elements.date.value = today(); const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14); const generatedReference = `${cfg.prefix}-${String(form.elements.date?.value || today()).replaceAll("-", "")}-${stamp.slice(-6)}`; if (form.elements.reference) form.elements.reference.value = generatedReference; if (cfg.id === "payment" && form.elements.voucher) form.elements.voucher.value = generatedReference; Object.entries(cfg.defaults || {}).forEach(([name, value]) => { if (form.elements[name]) form.elements[name].value = value; }); if (cfg.id === "promissory" && form.elements.loanNumber) form.elements.loanNumber.value = `PAG-PROV-${stamp}`; syncCodebtor(); syncGuarantee(); updateInterest(); };
    function updateInterest() { if (!cfg.calculator) return; const card = form.querySelector("[data-interest-card]"); const principal = number(form.elements.principal?.value); const rate = number(form.elements.rate?.value); const term = number(form.elements.term?.value); const interest = principal * (rate / 100) * term; const total = principal + interest; const payment = term ? total / term : 0; card.querySelector("dl").innerHTML = `<div><dt>Interés</dt><dd>${pesos(interest)}</dd></div><div><dt>Total a pagar</dt><dd>${pesos(total)}</dd></div><div><dt>Cuota estimada</dt><dd>${pesos(payment)}</dd></div>`; }
    function renderPrint() {
      const data = values();
      const text = (name, fallback = "—") => escape(data[name] || fallback);
      const cash = (name, fallback = "—") => pesos(data[name], fallback);
      const printDate = (raw) => { const parts = String(raw || "").split("-"); if (parts.length !== 3) return raw || "—"; return `${parts[2]}/${parts[1]}/${parts[0]}`; };
      const amountInWords = (raw) => {
        const amount = Math.round(number(raw) * 100) / 100;
        const units = ["CERO", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE", "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
        const tens = ["", "", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
        const hundreds = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];
        const under100 = (n) => n < 20 ? units[n] : n < 30 ? (n === 20 ? "VEINTE" : `VEINTI${units[n - 20]}`) : `${tens[Math.floor(n / 10)]}${n % 10 ? ` Y ${units[n % 10]}` : ""}`;
        const under1000 = (n) => n === 100 ? "CIEN" : n < 100 ? under100(n) : `${hundreds[Math.floor(n / 100)]}${n % 100 ? ` ${under100(n % 100)}` : ""}`;
        const integer = Math.floor(amount); const millions = Math.floor(integer / 1000000); const remainder = integer % 1000000; const thousands = Math.floor(remainder / 1000); const rest = remainder % 1000;
        let words = "";
        if (millions) words += `${under1000(millions)} ${millions === 1 ? "MILLÓN" : "MILLONES"}`;
        if (thousands) words += `${words ? " " : ""}${under1000(thousands)} MIL`;
        if (rest || !words) words += `${words ? " " : ""}${under1000(rest)}`;
        return `${words} PESOS DOMINICANOS CON ${String(Math.round((amount % 1) * 100)).padStart(2, "0")}/100`;
      };
      const header = (kind = "Documento operativo") => `<header><div class="document-print-brand"><img src="LOGO%20M%26M.png" alt="M&M Inversiones"><img src="LOGO%20VEGAMOTORS.png" alt="VegaMotors"></div><span>${escape(ref())}<br>${printDate(data.date)}${data.branch ? `<br>${escape(data.branch)}` : ""}</span></header><div class="document-print-title"><small>${escape(kind)} · M&M Inversiones / VegaMotors</small><h1>${escape(cfg.title).toUpperCase()}</h1><p>${escape(cfg.subtitle)}</p></div>`;
      const signatures = (items = cfg.signatures) => `<section class="document-print-signatures">${items.filter((signature) => signature !== "Codeudor (si aplica)" || (cfg.codebtor && codebtorToggle.checked)).map((signature) => `<div><span></span><small>${escape(signature)}</small><b>________________________</b></div>`).join("")}</section>`;
      const info = (items, className = "document-print-data") => `<dl class="${className}">${items.map(([label, value]) => `<div><dt>${escape(label)}</dt><dd>${value}</dd></div>`).join("")}</dl>`;
      const checklist = (className = "document-print-checks") => cfg.checks ? `<section class="${className}"><h2>Verificación</h2><div>${checkValues().map(({ item, checked }) => `<span>${checked ? "☒" : "☐"} ${escape(item)}</span>`).join("")}</div></section>` : "";
      const manual = (label) => `<section class="document-print-manual"><h2>${escape(label)}</h2><i></i><i></i><i></i></section>`;
      const generic = () => { const printGroups = [...cfg.groups]; if (cfg.codebtor && codebtorToggle.checked) printGroups.splice(2, 0, ["Codeudor", cfg.codebtorFields]); const details = printGroups.map(([title, fields], groupIndex) => `<section><h2>${String(groupIndex + 1).padStart(2, "0")} · ${escape(title)}</h2>${info(fields.filter((field) => !field.checkbox && !(cfg.guarantee && field.n === "security")).map((field) => [field.l, field.money ? cash(field.n) : text(field.n)]))}</section>`).join(""); return `${header()}${details}${checklist()}<section class="document-print-declaration"><b>Constancia</b><p>${escape(cfg.declaration || "Documento preparado para revisión y firma.")}</p></section>${signatures()}`; };
      let body = "";
      if (cfg.id === "promissory") {
        const principal = cash("principal"); const security = guaranteeToggle.checked ? text("security") : "No aplica";
        body = `${header("Instrumento de pago · sujeto a revisión jurídica")}<section class="legal-document"><p class="legal-place">En ${text("placeOfPayment")}, República Dominicana, a ${printDate(data.date)}.</p><h2>Promesa de pago</h2><p>Yo, <strong>${text("debtorName")}</strong>, dominicano(a), mayor de edad, portador(a) de la cédula de identidad y electoral No. <strong>${text("debtorId")}</strong>, domiciliado(a) en <strong>${text("debtorAddress")}</strong>, por medio del presente documento <strong>PROMETO PAGAR INCONDICIONALMENTE A LA ORDEN DE ${text("beneficiary")}</strong> la suma de <strong>${principal}</strong> (<strong>${escape(amountInWords(data.principal))}</strong>), recibida por concepto de <strong>${text("valueReceived")}</strong>.</p><p>La obligación devengará una tasa mensual de <strong>${text("rate")}%</strong>, tendrá un plazo de <strong>${text("term")} meses</strong>, iniciando el ${printDate(data.startDate)} y venciendo el ${printDate(data.dueDate)}. El pago se realizará en <strong>${text("placeOfPayment")}</strong>, República Dominicana, conforme a las condiciones que las partes formalicen.</p><p>La garantía indicada para esta obligación es: <strong>${security}</strong>. El deudor declara haber leído y aceptado voluntariamente el presente pagaré.</p>${codebtorToggle.checked ? `<p>Comparece además <strong>${text("coDebtorName")}</strong>, cédula No. <strong>${text("coDebtorId")}</strong>, domiciliado(a) en <strong>${text("coDebtorAddress")}</strong>, quien manifiesta su aceptación como codeudor(a) solidario(a) en los términos que suscriba.</p>` : ""}<aside class="legal-terms"><b>Datos de control</b>${info([["No. de préstamo provisional", text("loanNumber")], ["Monto principal", principal], ["Interés simple estimado", pesos(number(data.principal) * (number(data.rate) / 100) * number(data.term))], ["Total estimado", pesos(number(data.principal) * (1 + (number(data.rate) / 100) * number(data.term)))], ["Garantía", security]])}</aside><small class="legal-disclaimer">Modelo operativo. Debe ser revisado y aprobado por un abogado dominicano antes de su uso definitivo.</small></section>${signatures(["Deudor", ...(codebtorToggle.checked ? ["Codeudor solidario"] : []), "Testigo / representante"])}`;
      } else if (cfg.id === "payment") {
        body = `${header("Comprobante interno de ingreso")}<section class="receipt-document"><p>Recibimos de <strong>${text("clientName")}</strong>, cédula No. <strong>${text("clientId")}</strong>, la suma de <strong>${cash("amount")}</strong> por concepto de <strong>${text("concept")}</strong>.</p><table><thead><tr><th>Concepto</th><th>Préstamo / operación</th><th>Método</th><th>Valor recibido</th></tr></thead><tbody><tr><td>${text("concept")}</td><td>${text("loanNumber")}</td><td>${text("paymentMethod")}</td><td>${cash("amount")}</td></tr></tbody><tfoot><tr><th colspan="3">TOTAL RECIBIDO</th><th>${cash("amount")}</th></tr></tfoot></table><p class="receipt-words">Valor en letras: <strong>${escape(amountInWords(data.amount))}</strong>.</p><p>Detalle u observación: ${text("notes", "Sin observaciones")}</p><small>Referencia interna y comprobante: ${escape(ref())}. Este recibo no sustituye un comprobante fiscal autorizado.</small></section>${signatures(["Entregado por", "Recibido por M&M / VegaMotors"])}`;
      } else if (cfg.id === "agreement" || cfg.id === "authorization" || cfg.id === "credit-letter") {
        const isAgreement = cfg.id === "agreement"; const isAuthorization = cfg.id === "authorization"; const title = isAgreement ? "Compromiso de regularización" : isAuthorization ? "Autorización expresa" : "Comunicación al cliente";
        const narrative = isAgreement ? `El/la señor(a) <strong>${text("clientName")}</strong>, cédula No. <strong>${text("clientId")}</strong>, reconoce una deuda total de <strong>${cash("totalDebt")}</strong>, de la cual ${cash("arrears")} corresponde a monto en atraso. Se compromete a realizar una inicial de regularización de <strong>${cash("regularization")}</strong> y continuar con una cuota de <strong>${cash("newPayment")}</strong>, con fecha comprometida ${printDate(data.commitmentDate)}.` : isAuthorization ? `Yo, <strong>${text("clientName")}</strong>, cédula No. <strong>${text("clientId")}</strong>, autorizo a M&M Inversiones / VegaMotors a utilizar los medios de contacto marcados para verificación, comunicación y gestión de mi obligación.` : `Por medio de la presente informamos a <strong>${text("clientName")}</strong> que su solicitud o producto <strong>${text("product")}</strong> se encuentra en condición de <strong>${text("result")}</strong>. ${data.conditions ? `Condiciones o información relevante: <strong>${text("conditions")}</strong>.` : ""}`;
        body = `${header(isAgreement ? "Compromiso de pago" : isAuthorization ? "Consentimiento de contacto" : "Comunicación comercial")}<section class="narrative-document"><p class="narrative-date">${title} · ${printDate(data.date)}</p><p>${narrative}</p>${isAgreement ? info([["No. de préstamo", text("loanNumber")], ["Cuotas vencidas", text("overdue")], ["Fecha comprometida", printDate(data.commitmentDate)], ["Nueva cuota", cash("newPayment")]]) : isAuthorization ? checklist("document-print-checks document-print-checks--compact") : info([["Monto", cash("amount")], ["Inicial", cash("initial")], ["Cuota", cash("payment")], ["Plazo", `${text("term")} meses`]])}<p>${escape(cfg.declaration)}</p></section>${signatures()}`;
      } else if (cfg.id === "motorcycle-delivery") {
        body = `${header("Acta de entrega física")}<section class="narrative-document"><p>En ${text("branch")}, República Dominicana, hago constar que <strong>${text("clientName")}</strong>, cédula No. <strong>${text("clientId")}</strong>, recibe la motocicleta <strong>${text("brand")} ${text("model")}</strong>, año <strong>${text("year")}</strong>, color <strong>${text("color")}</strong>, chasis No. <strong>${text("chassis")}</strong>, motor No. <strong>${text("engine")}</strong>, placa <strong>${text("plate")}</strong> y matrícula <strong>${text("registration")}</strong>.</p>${checklist("document-print-checks document-print-checks--compact")}<p>El receptor declara haber verificado el estado de la unidad y de los accesorios señalados al momento de la entrega.</p></section>${signatures()}`;
      } else if (cfg.id === "dossier") {
        body = `${header("Control interno de expediente")}<section class="dossier-document">${info([["Cliente", text("clientName")], ["Cédula", text("clientId")], ["Tipo de crédito", text("loanType")], ["Responsable", text("staff")]])}<table><thead><tr><th>Requisito</th><th>Deudor</th><th>Codeudor</th><th>Estado</th><th>Observación</th></tr></thead><tbody>${checkValues().map(({ item, checked }) => `<tr><td>${escape(item)}</td><td>☐</td><td>${item.toLowerCase().includes("codeudor") ? "☐" : "—"}</td><td>${checked ? "Recibido" : "Pendiente"}</td><td></td></tr>`).join("")}</tbody></table>${manual("Pendientes, responsable y fecha límite")}</section>${signatures()}`;
      } else if (["disbursement", "balance", "cash-close"].includes(cfg.id)) {
        const items = cfg.id === "disbursement" ? [["Cliente", text("clientName")], ["Producto", text("product")], ["Monto autorizado", cash("amount")], ["Inicial confirmada", cash("initial")], ["Cuota", cash("payment")], ["Plazo", `${text("term")} meses`], ["Tasa", `${text("rate")}%`]] : cfg.id === "balance" ? [["Cliente", text("clientName")], ["Monto original", cash("originalAmount")], ["Pagos realizados", cash("payments")], ["Saldo pendiente", cash("balance")], ["Mora", cash("lateFee")], ["Último pago", cash("lastPayment")], ["Fecha último pago", printDate(data.lastPaymentDate)], ["Monto para regularizar", cash("regularization")]] : [["Recibos emitidos", text("receipts")], ["Efectivo", cash("cash")], ["Transferencias", cash("transfer")], ["Depósitos", cash("deposits")], ["Otros ingresos", cash("otherIncome")], ["Gastos autorizados", cash("expenses")], ["Total esperado", cash("expected")], ["Total contado", cash("counted")], ["Diferencia", cash("difference")]];
        body = `${header(cfg.id === "cash-close" ? "Control interno de caja" : "Control financiero")}<section class="financial-document">${info(items, "document-print-data document-print-data--financial")}${cfg.id === "disbursement" ? checklist("document-print-checks document-print-checks--compact") : ""}${cfg.id === "cash-close" ? manual("Observaciones de cierre y acciones requeridas") : `<p>${escape(cfg.declaration)}</p>`}</section>${signatures()}`;
      } else body = generic();
      report.querySelector("article").className = `document-print-sheet document-print-sheet--${cfg.id}`;
      report.querySelector("article").innerHTML = body;
    }
    function download() { const payload = { module: cfg.id, version: 1, exportedAt: new Date().toISOString(), fields: values(), checks: checkValues().map(({ checked }) => checked) }; const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `${ref()}-${cfg.id}.json`; link.click(); URL.revokeObjectURL(link.href); }
    function load(file) { if (!file) return; const reader = new FileReader(); reader.onload = () => { try { const payload = JSON.parse(String(reader.result || "{}")); if (payload.module && payload.module !== cfg.id) throw new Error("wrong-module"); setDefaults(); Object.entries(payload.fields || {}).forEach(([name, value]) => { if (form.elements[name]) form.elements[name].value = value; }); (payload.checks || []).forEach((checked, index) => { if (form.elements[`check_${index}`]) form.elements[`check_${index}`].checked = Boolean(checked); }); syncCodebtor(); syncGuarantee(); updateInterest(); status.className = "application-status is-success"; status.textContent = "Ficha cargada. Revisa los datos antes de imprimir."; } catch { status.className = "application-status is-error"; status.textContent = "El archivo no corresponde a este documento o no se puede leer."; } }; reader.readAsText(file); }
    form.querySelectorAll(".currency-input input").forEach((input) => { input.inputMode = "decimal"; input.addEventListener("focus", () => { const raw = number(input.value); if (input.value.trim()) input.value = String(raw); }); input.addEventListener("blur", () => { if (input.value.trim()) input.value = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number(input.value)); }); });
    codebtorToggle?.addEventListener("change", syncCodebtor); guaranteeToggle?.addEventListener("change", syncGuarantee);
    form.querySelector("[data-print]").addEventListener("click", () => { const missing = [...required, ...(cfg.codebtor && codebtorToggle.checked ? cfg.codebtorFields.filter((field) => field.required) : []), ...(cfg.guarantee && guaranteeToggle.checked ? [{ n: "security", l: "descripción de la garantía" }] : [])].filter((field) => !String(form.elements[field.n]?.value || "").trim()); if (missing.length) { status.className = "application-status is-error"; status.textContent = `Antes de imprimir completa: ${missing.map((field) => field.l.toLowerCase()).join(", ")}.`; form.elements[missing[0].n]?.focus(); return; } renderPrint(); document.querySelectorAll(".document-print-report").forEach((item) => item.classList.remove("is-current")); report.classList.add("is-current"); status.className = "application-status is-success"; status.textContent = "Documento preparado para impresión."; document.body.dataset.printTarget = `document-${cfg.id}`; window.print(); });
    form.querySelector("[data-clear]").addEventListener("click", () => { setDefaults(); status.className = "application-status"; status.textContent = "Documento limpio. Los datos no se guardan en el navegador."; }); form.querySelector("[data-save]").addEventListener("click", download); form.querySelector("[data-load]").addEventListener("click", () => form.querySelector('input[type="file"]').click()); form.querySelector('input[type="file"]').addEventListener("change", (event) => load(event.target.files?.[0])); form.addEventListener("input", updateInterest); form.addEventListener("submit", (event) => event.preventDefault()); button.addEventListener("click", () => window.selectCotizadorWorkspace(cfg.id)); setDefaults();
  }
  docs.forEach(addDocument);
})();

const workspaceMenuButtons = [...document.querySelectorAll("[data-workspace-target]")];
const workspaceMenu = document.querySelector("#workspaceMenu");
const quoteWorkspace = document.querySelector("#quoteWorkspace");
const applicationWorkspace = document.querySelector("#creditApplication");
const deliveryWorkspace = document.querySelector("#deliveryDocuments");
const evaluationWorkspace = document.querySelector("#evaluationWorkspace");
const collectionWorkspace = document.querySelector("#collectionWorkspace");
const preApplicationWorkspace = document.querySelector("#preApplicationWorkspace");
const headerTitle = document.querySelector(".app-header h1");
const headerApplicationButton = document.querySelector("#applicationEntryBtn");
const workspaceHomeButton = document.querySelector("#workspaceHomeBtn");

function selectWorkspace(target) {
  const application = target === "application";
  const delivery = target === "delivery";
  const evaluation = target === "evaluation";
  const collection = target === "collection";
  const preapplication = target === "preapplication";
  const documentWorkspace = document.querySelector(`#documentWorkspace-${target}`);
  document.body.dataset.workspace = target;
  workspaceMenu.hidden = true;
  quoteWorkspace.hidden = target !== "quote";
  applicationWorkspace.hidden = !application;
  deliveryWorkspace.hidden = !delivery;
  evaluationWorkspace.hidden = !evaluation;
  collectionWorkspace.hidden = !collection;
  preApplicationWorkspace.hidden = !preapplication;
  document.querySelectorAll(".document-workspace").forEach((workspace) => { workspace.hidden = workspace !== documentWorkspace; });
  document.querySelectorAll("[data-workspace-target]").forEach((button) => {
    const active = button.dataset.workspaceTarget === target;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (headerTitle) headerTitle.textContent = documentWorkspace?.dataset.workspaceTitle || (application ? "Solicitudes de crédito" : delivery ? "Entrega de documentos" : evaluation ? "Visita de evaluación" : collection ? "Visita de cobro" : preapplication ? "Pre-solicitud de crédito" : "Cotizador de pagos");
  workspaceHomeButton.hidden = false;
  if (headerApplicationButton) headerApplicationButton.hidden = target !== "quote";
  els.newQuoteBtn.hidden = target !== "quote";
  els.printBtn.hidden = target !== "quote";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showWorkspaceHome() {
  delete document.body.dataset.workspace;
  workspaceMenu.hidden = false;
  quoteWorkspace.hidden = true;
  applicationWorkspace.hidden = true;
  deliveryWorkspace.hidden = true;
  evaluationWorkspace.hidden = true;
  collectionWorkspace.hidden = true;
  preApplicationWorkspace.hidden = true;
  document.querySelectorAll(".document-workspace").forEach((workspace) => { workspace.hidden = true; });
  document.querySelectorAll("[data-workspace-target]").forEach((button) => { button.classList.remove("is-active"); button.setAttribute("aria-pressed", "false"); });
  if (headerTitle) headerTitle.textContent = "Centro de financiamiento";
  workspaceHomeButton.hidden = true;
  headerApplicationButton.hidden = true;
  els.newQuoteBtn.hidden = true;
  els.printBtn.hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

workspaceMenuButtons.forEach((button) => button.addEventListener("click", () => selectWorkspace(button.dataset.workspaceTarget)));
workspaceHomeButton.addEventListener("click", showWorkspaceHome);
window.selectCotizadorWorkspace = selectWorkspace;

// Solicitud de crédito: los detalles cambian según el producto solicitado.
(() => {
  const form = document.querySelector("#creditApplicationForm");
  if (!form) return;

  const entryButton = document.querySelector("#applicationEntryBtn");
  const entryLabel = entryButton?.querySelector("span");
  const contextTitle = document.querySelector("#applicationContextTitle");
  const contextCopy = document.querySelector("#applicationContextCopy");
  const contextAction = document.querySelector("#applicationContextAction");
  const typeInput = document.querySelector("#applicationType");
  const typeGrid = document.querySelector("#applicationTypeGrid");
  const specificTitle = document.querySelector("#appSpecificTitle");
  const specificFields = document.querySelector("#applicationSpecificFields");
  const status = document.querySelector("#applicationStatus");
  const clearButton = document.querySelector("#clearApplicationBtn");
  const wordButton = document.querySelector("#exportApplicationWordBtn");
  const excelButton = document.querySelector("#exportApplicationExcelBtn");
  const printButton = document.querySelector("#printApplicationBtn");
  const availableIncome = document.querySelector("#availableIncome");
  const totalIncome = document.querySelector("#totalIncome");
  const totalExpenses = document.querySelector("#totalExpenses");
  const loanEstimate = document.querySelector("#applicationLoanEstimate");
  const loanEstimatePrincipal = document.querySelector("#loanEstimatePrincipal");
  const loanEstimateInterest = document.querySelector("#loanEstimateInterest");
  const loanEstimateTotal = document.querySelector("#loanEstimateTotal");
  const loanEstimatePayment = document.querySelector("#loanEstimatePayment");
  const loanEstimateDetail = document.querySelector("#loanEstimateDetail");
  const evaluationAvailable = document.querySelector("#evaluationAvailable");
  const evaluationPayment = document.querySelector("#evaluationPayment");
  const evaluationRatio = document.querySelector("#evaluationRatio");
  const evaluationStatus = document.querySelector("#evaluationStatus");
  const flowSections = [...form.querySelectorAll(":scope > .application-section")];
  const flowLinks = [...form.querySelectorAll(".application-progress a")];
  const previousStepButton = document.querySelector("#applicationPrevStepBtn");
  const nextStepButton = document.querySelector("#applicationNextStepBtn");
  const stepLabel = document.querySelector("#applicationStepLabel");
  let activeStep = 0;
  const typeDetails = {
    personal: {
      title: "Información del préstamo personal",
      fields: [
        ["Monto solicitado", "requestedAmount", "number", "RD$", "Monto requerido", true],
        ["Destino del préstamo", "loanPurpose", "text", "", "Ej. gastos médicos", true],
        ["Plazo deseado (meses)", "requestedTerm", "number", "", "Ej. 12", true],
        ["Tasa simple mensual %", "simpleRate", "number", "%", "Ej. 3", true, undefined, "3"],
        ["¿Tiene otros créditos?", "otherCredits", "select", "", "", false, ["No", "Sí"]],
        ["Entidad acreedora", "currentLender", "text", "", "Si aplica", false],
        ["Cuota mensual actual", "currentInstallment", "number", "RD$", "0", false]
      ]
    },
    commercial: {
      title: "Información del préstamo comercial",
      fields: [
        ["Monto solicitado", "requestedAmount", "number", "RD$", "Monto requerido", true],
        ["Plazo deseado (meses)", "requestedTerm", "number", "", "Ej. 12", true],
        ["Tasa simple mensual %", "simpleRate", "number", "%", "Ej. 3", true, undefined, "3"],
        ["Nombre legal del negocio", "businessLegalName", "text", "", "Razón social", true],
        ["RNC", "businessRnc", "text", "", "000-00000-0", true],
        ["Tipo de negocio", "businessType", "text", "", "Ej. colmado, servicios", true],
        ["Años operando", "businessYears", "number", "", "0", true],
        ["Ventas mensuales estimadas", "monthlySales", "number", "RD$", "0", true],
        ["Dirección del negocio", "businessAddress", "text", "", "Calle, número, sector", true],
        ["Destino de los fondos", "loanPurpose", "text", "", "Ej. inventario", true]
      ]
    },
    vehicle: {
      title: "Vehículo ofrecido en garantía",
      fields: [
        ["Monto solicitado", "requestedAmount", "number", "RD$", "Monto requerido", true],
        ["Plazo deseado (meses)", "requestedTerm", "number", "", "Ej. 12", true],
        ["Tasa simple mensual %", "simpleRate", "number", "%", "Ej. 3", true, undefined, "3"],
        ["Marca", "vehicleBrand", "text", "", "Ej. Toyota", true],
        ["Modelo", "vehicleModel", "text", "", "Ej. Corolla", true],
        ["Año", "vehicleYear", "number", "", "Ej. 2021", true],
        ["Placa", "vehiclePlate", "text", "", "Placa o registro", true],
        ["Chasis / VIN", "vehicleVin", "text", "", "Número de chasis", true],
        ["Valor estimado", "vehicleValue", "number", "RD$", "0", true],
        ["Propietario registrado", "vehicleOwner", "text", "", "Nombre completo", true],
        ["Tiene seguro vigente", "vehicleInsurance", "select", "", "", true, ["Sí", "No"]],
        ["Destino del préstamo", "loanPurpose", "text", "", "Detalle", true]
      ]
    },
    mortgage: {
      title: "Inmueble ofrecido en garantía hipotecaria",
      fields: [
        ["Monto solicitado", "requestedAmount", "number", "RD$", "Monto requerido", true],
        ["Plazo deseado (meses)", "requestedTerm", "number", "", "Ej. 12", true],
        ["Tasa simple mensual %", "simpleRate", "number", "%", "Ej. 3", true, undefined, "3"],
        ["Tipo de inmueble", "propertyType", "select", "", "", true, ["Casa", "Apartamento", "Solar", "Local comercial", "Otro"]],
        ["Dirección del inmueble", "propertyAddress", "text", "", "Calle, número, sector", true],
        ["Provincia", "propertyProvince", "text", "", "Ubicación", true],
        ["Matrícula / título", "propertyTitle", "text", "", "Número de matrícula", true],
        ["Valor tasado estimado", "propertyValue", "number", "RD$", "0", true],
        ["Propietario(s)", "propertyOwners", "text", "", "Nombre completo", true],
        ["Tiene hipoteca vigente", "existingMortgage", "select", "", "", true, ["No", "Sí"]],
        ["Saldo de hipoteca", "mortgageBalance", "number", "RD$", "0", false],
        ["Destino del préstamo", "loanPurpose", "text", "", "Detalle", true]
      ]
    },
    smartphone: {
      title: "Equipo smartphone a financiar",
      fields: [
        ["Marca", "phoneBrand", "text", "", "Ej. Samsung", true],
        ["Modelo", "phoneModel", "text", "", "Ej. Galaxy S24", true],
        ["Capacidad", "phoneCapacity", "text", "", "Ej. 256 GB", true],
        ["Color", "phoneColor", "text", "", "Ej. negro", true],
        ["Precio del equipo", "productPrice", "number", "RD$", "0", true],
        ["Inicial disponible", "downPaymentAvailable", "number", "RD$", "0", true],
        ["Plazo deseado (meses)", "requestedTerm", "number", "", "Ej. 12", true],
        ["Tasa simple mensual %", "simpleRate", "number", "%", "Ej. 3", true, undefined, "3"],
        ["Tienda o sucursal", "saleLocation", "text", "", "Lugar de compra", false]
      ]
    },
    motorcycle: {
      title: "Motocicleta a financiar",
      fields: [
        ["Marca", "motorcycleBrand", "text", "", "Ej. Yamaha", true],
        ["Modelo", "motorcycleModel", "text", "", "Ej. FZ 2.0", true],
        ["Año", "motorcycleYear", "number", "", "Ej. 2026", true],
        ["Color", "motorcycleColor", "text", "", "Ej. azul", true],
        ["Cilindrada", "motorcycleCc", "number", "cc", "Ej. 150", true],
        ["Chasis", "motorcycleChassis", "text", "", "Si está disponible", false],
        ["Precio de venta", "productPrice", "number", "RD$", "0", true],
        ["Inicial disponible", "downPaymentAvailable", "number", "RD$", "0", true],
        ["Plazo deseado (meses)", "requestedTerm", "number", "", "Ej. 18", true],
        ["Tasa simple mensual %", "simpleRate", "number", "%", "Ej. 3", true, undefined, "3"],
        ["Sucursal / vendedor", "saleLocation", "text", "", "Nombre o sucursal", false]
      ]
    }
  };
  const specificValues = {};

  const escapeHtml = (value) => String(value || "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  const parseAmount = (value) => {
    const normalized = String(value ?? "").replace(/RD\$/gi, "").replace(/,/g, "").replace(/[^0-9.-]/g, "");
    return Math.max(0, Number(normalized) || 0);
  };
  const amountText = (value) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseAmount(value));
  const money = (value) => `RD$${amountText(value)}`;
  const number = (input) => parseAmount(input?.value);

  function formatMoneyInput(input) {
    if (!input?.value.trim()) return;
    input.value = amountText(input.value);
  }

  function rememberSpecificValues() {
    specificFields.querySelectorAll("[name]").forEach((input) => { specificValues[input.name] = input.value; });
  }

  function renderSpecificFields() {
    const details = typeDetails[typeInput.value];
    specificTitle.textContent = details.title;
    specificFields.innerHTML = details.fields.map(([label, name, type, prefix, placeholder, required, options, defaultValue = ""]) => {
      const value = escapeHtml(specificValues[name] ?? defaultValue);
      const requirement = required ? " required" : "";
      const control = type === "select"
        ? `<select name="${name}"${requirement}><option value="">Selecciona</option>${options.map((option) => `<option value="${option}"${value === option ? " selected" : ""}>${option}</option>`).join("")}</select>`
        : `<input name="${name}" type="${prefix === "RD$" ? "text" : type}"${prefix === "RD$" ? " inputmode=\"decimal\" data-money-input" : ""}${prefix === "cc" ? " min=\"0\"" : ""}${type === "number" && prefix !== "RD$" ? " min=\"0\" step=\"0.01\"" : ""}${requirement} value="${value}" placeholder="${placeholder}">`;
      return `<label>${label}${prefix === "RD$" ? `<span class="money-field"><b>RD$</b>${control}</span>` : prefix === "cc" || prefix === "%" ? `<span class="unit-field">${control}<b>${prefix}</b></span>` : control}</label>`;
    }).join("");
    specificFields.querySelectorAll("[data-money-input]").forEach(formatMoneyInput);
  }

  function updateFinancialSummary() {
    const income = [...form.querySelectorAll("[data-income]")].reduce((total, input) => total + number(input), 0);
    const expenses = [...form.querySelectorAll("[data-expense]")].reduce((total, input) => total + number(input), 0);
    const otherIncome = number(form.elements.namedItem("additionalIncome"));
    const source = form.elements.namedItem("additionalIncomeSource");
    if (source) {
      source.required = otherIncome > 0;
      source.closest("label")?.classList.toggle("is-required", otherIncome > 0);
    }
    totalIncome.textContent = money(income);
    totalExpenses.textContent = money(expenses);
    availableIncome.textContent = money(income - expenses);
    updateEvaluationBar();
  }

  function updateEvaluationBar() {
    const income = [...form.querySelectorAll("[data-income]")].reduce((total, input) => total + number(input), 0);
    const expenses = [...form.querySelectorAll("[data-expense]")].reduce((total, input) => total + number(input), 0);
    const available = income - expenses;
    const payment = number(specificFields.querySelector('[name="requestedTerm"]'))
      ? (number(specificFields.querySelector('[name="requestedAmount"]')) || Math.max(0, number(specificFields.querySelector('[name="productPrice"]')) - number(specificFields.querySelector('[name="downPaymentAvailable"]')))) * (1 + (number(specificFields.querySelector('[name="simpleRate"]')) / 100) * number(specificFields.querySelector('[name="requestedTerm"]'))) / number(specificFields.querySelector('[name="requestedTerm"]'))
      : 0;
    const ratio = income ? payment / income : 0;
    evaluationAvailable.textContent = money(available);
    evaluationPayment.textContent = money(payment);
    evaluationRatio.textContent = income && payment ? `${(ratio * 100).toFixed(1)}%` : "—";
    evaluationStatus.className = "evaluation-status";
    if (!income || !payment) {
      evaluationStatus.classList.add("is-pending");
      evaluationStatus.querySelector("strong").textContent = "Pendiente de cálculo";
    } else if (ratio <= .35 && available >= payment) {
      evaluationStatus.classList.add("is-favorable");
      evaluationStatus.querySelector("strong").textContent = "Capacidad favorable";
    } else if (ratio <= .5 && available >= payment) {
      evaluationStatus.classList.add("is-review");
      evaluationStatus.querySelector("strong").textContent = "Revisar capacidad";
    } else {
      evaluationStatus.classList.add("is-alert");
      evaluationStatus.querySelector("strong").textContent = "Requiere revisión";
    }
  }

  function updateLoanEstimate() {
    const requested = number(specificFields.querySelector('[name="requestedAmount"]'));
    const price = number(specificFields.querySelector('[name="productPrice"]'));
    const down = number(specificFields.querySelector('[name="downPaymentAvailable"]'));
    const principal = requested || Math.max(0, price - down);
    const rate = number(specificFields.querySelector('[name="simpleRate"]')) / 100;
    const term = number(specificFields.querySelector('[name="requestedTerm"]'));
    const interest = principal * rate * term;
    const total = principal + interest;
    const payment = term ? total / term : 0;
    loanEstimatePrincipal.textContent = money(principal);
    loanEstimateInterest.textContent = money(interest);
    loanEstimateTotal.textContent = money(total);
    loanEstimatePayment.textContent = money(payment);
    loanEstimateDetail.textContent = principal && rate && term
      ? `${(rate * 100).toFixed(2)}% mensual · ${term} ${term === 1 ? "mes" : "meses"} · interés simple`
      : "Ingresa monto, tasa y plazo para calcular.";
    loanEstimate.classList.toggle("has-estimate", Boolean(principal && rate && term));
    updateEvaluationBar();
  }

  function hasQuoteToConvert() {
    return Boolean(state.quoteEdited && numberValue(els.productAmount) > 0);
  }

  function updateApplicationEntry() {
    const convertible = hasQuoteToConvert();
    const isQuoteWorkspace = document.body.dataset.workspace === "quote";
    entryButton?.toggleAttribute("hidden", !isQuoteWorkspace);
    entryButton?.classList.toggle("is-convert", convertible);
    if (entryLabel) entryLabel.textContent = convertible ? "Convertir a solicitud" : "Nueva solicitud";
    if (!convertible) {
      contextTitle.textContent = "Nueva solicitud";
      contextCopy.textContent = "Completa los datos del solicitante para iniciar la evaluación.";
    }
  }

  function setFieldValue(name, value) {
    const field = form.elements.namedItem(name);
    if (field && value !== undefined && value !== null && value !== "") field.value = value;
  }

  function convertQuoteToApplication() {
    const product = els.productName.value;
    const typeByProduct = { "Préstamo personal": "personal", "Préstamo comercial": "commercial", "Préstamo prendario": "vehicle", Smartphone: "smartphone", Motocicleta: "motorcycle" };
    const targetType = typeByProduct[product] || "personal";
    const quote = quoteValues();
    const details = state.productDetails[product] || {};
    const [firstName, ...lastName] = (els.customerName.value || "").trim().split(/\s+/).filter(Boolean);
    const shared = { requestedAmount: String(quote.financed), requestedTerm: String(quote.term), simpleRate: String(numberValue(els.monthlyRate)), productPrice: String(quote.price), downPaymentAvailable: String(quote.down) };
    const productValues = product === "Motocicleta"
      ? { motorcycleBrand: details.brand || "", motorcycleModel: details.model || "", motorcycleColor: details.color || "", motorcycleCc: details.cc || "" }
      : product === "Smartphone"
        ? { phoneBrand: details.brand || "", phoneModel: details.model || "", phoneCapacity: details.capacity || "", phoneColor: details.color || "" }
        : {};
    selectType(targetType);
    Object.assign(specificValues, shared, productValues);
    renderSpecificFields();
    setFieldValue("firstNames", firstName || "");
    setFieldValue("lastNames", lastName.join(" "));
    setFieldValue("phone", els.customerPhone.value.trim());
    contextTitle.textContent = "Cotización convertida";
    contextCopy.textContent = `${product} · ${money(quote.financed)} financiado · ${quote.term} meses.`;
    updateLoanEstimate();
    status.className = "application-status is-success";
    status.textContent = "Se precargaron los datos de la cotización. Completa la información del solicitante.";
  }

  function clearApplication() {
    form.reset();
    Object.keys(specificValues).forEach((key) => delete specificValues[key]);
    delete state.applicationReference;
    selectType("personal");
    updateFinancialSummary();
    updateLoanEstimate();
    contextTitle.textContent = "Nueva solicitud";
    contextCopy.textContent = "Completa los datos del solicitante para iniciar la evaluación.";
    status.className = "application-status";
    status.textContent = "Formulario limpio. Los datos no se guardan en este navegador.";
  }

  function selectType(type) {
    rememberSpecificValues();
    typeInput.value = type;
    typeGrid.querySelectorAll("[data-application-type]").forEach((card) => {
      const selected = card.dataset.applicationType === type;
      card.classList.toggle("is-selected", selected);
      card.setAttribute("aria-checked", String(selected));
    });
    renderSpecificFields();
    updateLoanEstimate();
    status.className = "application-status";
    status.textContent = "Completa los campos requeridos para verificar la solicitud.";
  }

  function saveDraft() {
    rememberSpecificValues();
    status.className = "application-status is-success";
    status.textContent = "Datos verificados. Permanecen solo en esta pantalla hasta que limpies o recargues.";
  }

  function fieldValue(name, fallback = "—") {
    const field = form.elements.namedItem(name);
    if (!field) return fallback;
    if (field.type === "checkbox") return field.checked ? "Autorizado" : "Pendiente";
    return String(field.value || "").trim() || fallback;
  }

  function printRows(containerId, fields) {
    const container = document.querySelector(containerId);
    container.innerHTML = fields.map(([label, name, format]) => {
      const value = fieldValue(name);
      const display = format === "money" && value !== "—"
        ? money(value)
        : format === "duration" && value !== "—"
          ? `${escapeHtml(value)} ${escapeHtml(fieldValue(`${name}Unit`, ""))}`
          : format === "percent" && value !== "—"
            ? `${escapeHtml(value)}% mensual`
          : escapeHtml(value);
      return `<div><dt>${label}</dt><dd>${display}</dd></div>`;
    }).join("");
  }

  function referenceRows(containerId, columns, rows) {
    const container = document.querySelector(containerId);
    container.innerHTML = `<div class="credit-print-reference-head">${columns.map((column) => `<span>${column}</span>`).join("")}</div>${rows.map((row) => `<div class="credit-print-reference-row">${row.map((name) => `<span>${escapeHtml(fieldValue(name))}</span>`).join("")}</div>`).join("")}`;
  }

  function currentTypeLabel() {
    return typeGrid.querySelector(".is-selected b")?.textContent || "Solicitud de crédito";
  }

  function renderApplicationPrint() {
    rememberSpecificValues();
    const fullName = `${fieldValue("firstNames", "")} ${fieldValue("lastNames", "")}`.trim() || "Solicitante";
    const typeLabel = currentTypeLabel();
    document.querySelector("#creditPrintDate").textContent = new Intl.DateTimeFormat("es-DO", { dateStyle: "long" }).format(new Date());
    document.querySelector("#creditPrintType").textContent = typeLabel;
    document.querySelector("#creditPrintTypeBack").textContent = typeLabel;
    document.querySelector("#creditPrintApplicant").textContent = fullName;
    document.querySelector("#creditPrintSignatureName").textContent = fullName;
    printRows("#creditPrintPersonal", [
      ["Nombre completo", "firstNames"], ["Apellidos", "lastNames"], ["Cédula / pasaporte", "identityNumber"], ["Fecha de nacimiento", "birthDate"],
      ["Nacionalidad", "nationality"], ["Estado civil", "maritalStatus"], ["Teléfono", "phone"], ["Correo", "email"],
      ["Calle", "street"], ["No. de casa / apartamento", "houseNumber"], ["Sector", "sector"], ["Ciudad o municipio", "city"], ["Provincia", "province"], ["Referencia de ubicación 1", "residenceReference1"], ["Referencia de ubicación 2", "residenceReference2"], ["Tiempo en residencia", "residenceTime", "duration"], ["Tipo de vivienda", "housingType"], ["Dependientes", "dependents"]
    ]);
    printRows("#creditPrintEmployment", [
      ["Situación laboral", "employmentStatus"], ["Empresa o negocio", "employer"], ["Cargo u ocupación", "jobTitle"], ["Tiempo laborando", "employmentTime", "duration"],
      ["Dirección laboral", "workAddress"], ["Referencia del negocio", "businessNearby"], ["Teléfono laboral", "workPhone"], ["Supervisor / contacto", "supervisor"]
    ]);
    printRows("#creditPrintIncome", [
      ["Ingreso salarial", "monthlyIncome", "money"], ["Otros ingresos", "additionalIncome", "money"], ["Origen de otros ingresos", "additionalIncomeSource"],
      ["Vivienda / alquiler", "housingExpense", "money"], ["Préstamos actuales", "loanExpense", "money"], ["Servicios básicos", "utilitiesExpense", "money"], ["Alimentación", "foodExpense", "money"], ["Otros gastos", "otherExpense", "money"]
    ]);
    document.querySelector("#creditPrintAvailable").textContent = availableIncome.textContent;
    const specific = [...specificFields.querySelectorAll("label")].map((label) => {
      const control = label.querySelector("input, select");
      const labelText = [...label.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)?.textContent.trim() || "Detalle";
      const numeric = control?.matches("[data-money-input]") || (control?.type === "number" && /amount|value|price|payment|sales|balance/i.test(control.name));
      const percentage = control?.name === "simpleRate";
      return [labelText, control?.name, percentage ? "percent" : numeric ? "money" : ""];
    });
    printRows("#creditPrintSpecific", specific);
    referenceRows("#creditPrintPersonalReferences", ["Nombre", "Relación", "Teléfono"], [["personalReference1Name", "personalReference1Relation", "personalReference1Phone"], ["personalReference2Name", "personalReference2Relation", "personalReference2Phone"]]);
    referenceRows("#creditPrintCommercialReferences", ["Empresa o comercio", "Contacto", "Teléfono"], [["commercialReference1Name", "commercialReference1Contact", "commercialReference1Phone"], ["commercialReference2Name", "commercialReference2Contact", "commercialReference2Phone"]]);
    referenceRows("#creditPrintFamilyReferences", ["Nombre", "Parentesco", "Teléfono"], [["familyReference1Name", "familyReference1Relation", "familyReference1Phone"], ["familyReference2Name", "familyReference2Relation", "familyReference2Phone"]]);
  }

  function printApplication() {
    if (!form.checkValidity()) {
      form.reportValidity();
      status.className = "application-status is-error";
      status.textContent = "Completa los campos requeridos antes de imprimir la solicitud.";
      return;
    }
    renderApplicationPrint();
    document.body.dataset.printTarget = "application";
    window.print();
  }

  function specificPrintFields() {
    return [...specificFields.querySelectorAll("label")].map((label) => {
      const control = label.querySelector("input, select");
      const labelText = [...label.childNodes].find((node) => node.nodeType === Node.TEXT_NODE)?.textContent.trim() || "Detalle";
      const numeric = control?.matches("[data-money-input]") || (control?.type === "number" && /amount|value|price|payment|sales|balance/i.test(control.name));
      const percentage = control?.name === "simpleRate";
      return [labelText, control?.name, percentage ? "percent" : numeric ? "money" : ""];
    });
  }

  function wordDisplay(name, format) {
    const value = fieldValue(name);
    if (format === "money" && value !== "—") return money(value);
    if (format === "duration" && value !== "—") return `${value} ${fieldValue(`${name}Unit`, "")}`;
    if (format === "percent" && value !== "—") return `${value}% mensual`;
    return value;
  }

  function wordFieldTable(fields) {
    const cells = fields.map(([label, name, format]) => `<td><span>${escapeHtml(label)}</span><strong>${escapeHtml(wordDisplay(name, format))}</strong></td>`);
    const rows = [];
    for (let index = 0; index < cells.length; index += 2) rows.push(`<tr>${cells[index]}${cells[index + 1] || "<td></td>"}</tr>`);
    return `<table class="data-table"><tbody>${rows.join("")}</tbody></table>`;
  }

  function wordReferenceTable(columns, rows) {
    return `<table class="reference-table"><thead><tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((name) => `<td>${escapeHtml(fieldValue(name))}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
  }

  async function imageDataUrl(path) {
    try {
      const response = await fetch(path);
      if (!response.ok) return "";
      const blob = await response.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => resolve("");
        reader.readAsDataURL(blob);
      });
    } catch {
      return "";
    }
  }

  async function exportApplicationWord() {
    if (!form.checkValidity()) {
      form.reportValidity();
      status.className = "application-status is-error";
      status.textContent = "Completa los campos requeridos antes de exportar la solicitud.";
      return;
    }
    renderApplicationPrint();
    const fullName = `${fieldValue("firstNames", "")} ${fieldValue("lastNames", "")}`.trim() || "Solicitante";
    const typeLabel = currentTypeLabel();
    const [mmLogo, vegaLogo] = await Promise.all([imageDataUrl("LOGO%20M%26M.png"), imageDataUrl("LOGO%20VEGAMOTORS.png")]);
    const logo = (source, fallback, className) => source ? `<img class="${className}" src="${source}" alt="${fallback}">` : `<b class="logo-fallback">${fallback}</b>`;
    const personal = [["Nombres", "firstNames"], ["Apellidos", "lastNames"], ["Cédula / pasaporte", "identityNumber"], ["Fecha de nacimiento", "birthDate"], ["Nacionalidad", "nationality"], ["Estado civil", "maritalStatus"], ["Teléfono", "phone"], ["Correo", "email"], ["Calle", "street"], ["No. de casa / apartamento", "houseNumber"], ["Sector", "sector"], ["Ciudad o municipio", "city"], ["Provincia", "province"], ["Referencia de ubicación 1", "residenceReference1"], ["Referencia de ubicación 2", "residenceReference2"], ["Tiempo en residencia", "residenceTime", "duration"], ["Tipo de vivienda", "housingType"], ["Dependientes", "dependents"]];
    const employment = [["Situación laboral", "employmentStatus"], ["Empresa o negocio", "employer"], ["Cargo u ocupación", "jobTitle"], ["Tiempo laborando", "employmentTime", "duration"], ["Dirección laboral", "workAddress"], ["Referencia del negocio", "businessNearby"], ["Teléfono laboral", "workPhone"], ["Supervisor / contacto", "supervisor"]];
    const finances = [["Ingreso salarial", "monthlyIncome", "money"], ["Otros ingresos", "additionalIncome", "money"], ["Origen de otros ingresos", "additionalIncomeSource"], ["Vivienda / alquiler", "housingExpense", "money"], ["Préstamos actuales", "loanExpense", "money"], ["Servicios básicos", "utilitiesExpense", "money"], ["Alimentación", "foodExpense", "money"], ["Otros gastos", "otherExpense", "money"]];
    const wordHtml = `<!doctype html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>Solicitud de crédito</title><style>@page{size:Letter portrait;margin:.45in}.page{page-break-after:auto}body{font-family:Arial,sans-serif;color:#153554;font-size:9.5pt;line-height:1.25}.header{border-bottom:4px solid #1468c5;padding-bottom:11px}.brand{float:left}.brand img{max-height:48px;max-width:145px;margin-right:14px;vertical-align:middle}.logo-fallback{font-size:17pt;color:#0b4d99;margin-right:14px}.heading{text-align:right}.heading p{margin:0;color:#557a9b;font-size:7.5pt;text-transform:uppercase}.heading h1{margin:3px 0;color:#0a2647;font-size:17pt}.clear{clear:both}.banner{margin:12px 0 8px;padding:8px 10px;border-left:6px solid #1468c5;background:#edf6ff;color:#174f87}.banner b{font-size:10pt}.section{margin-top:10px;padding-bottom:8px;border-bottom:2px solid #c3ddef;page-break-inside:avoid}.section h2{margin:0 0 6px;color:#0b4d99;font-size:9pt;text-transform:uppercase}.data-table,.reference-table{width:100%;border-collapse:collapse}.data-table td{width:50%;padding:4px 8px;border:1px solid #d5e4ef;vertical-align:top}.data-table span{display:block;color:#63809b;font-size:7pt;font-weight:bold;text-transform:uppercase}.data-table strong{display:block;margin-top:2px;color:#1b3853;font-size:9pt}.summary{float:right;width:190px;margin:0 0 6px 10px;padding:9px 11px;border:1px solid #b8dbca;background:#eefaf2}.summary span{display:block;color:#397550;font-size:7.5pt;font-weight:bold;text-transform:uppercase}.summary strong{display:block;margin:3px 0;color:#166b3f;font-size:14pt}.reference-table th{padding:5px 7px;background:#eaf4fd;color:#315f87;font-size:7.5pt;text-align:left}.reference-table td{padding:5px 7px;border:1px solid #d5e4ef}.declaration{margin-top:13px;padding:10px;border:1px solid #c9ddec;background:#f8fbfe;font-size:8.5pt}.signatures{width:100%;margin-top:36px;border-collapse:separate;border-spacing:18px 0}.signatures td{width:33%;padding-top:7px;border-top:1px solid #3d6b95;text-align:center;font-size:8pt}.footer{margin-top:14px;padding-top:7px;border-top:2px solid #b9d7ed;color:#6f879e;font-size:7pt;text-align:center}</style></head><body><div class="page"><div class="header"><div class="brand">${logo(mmLogo, "M&M Inversiones", "mm-logo")}${logo(vegaLogo, "VegaMotors", "vega-logo")}</div><div class="heading"><p>Uso interno · Confidencial</p><h1>SOLICITUD DE CRÉDITO</h1><span>${new Intl.DateTimeFormat("es-DO", { dateStyle: "long" }).format(new Date())}</span></div><div class="clear"></div></div><div class="banner"><b>${escapeHtml(typeLabel)}</b> · Solicitud preparada para evaluación</div><div class="section"><h2>1. Datos personales</h2>${wordFieldTable(personal)}</div><div class="section"><h2>2. Información laboral</h2>${wordFieldTable(employment)}</div><div class="section"><h2>3. Ingresos y gastos mensuales</h2><div class="summary"><span>Disponible estimado</span><strong>${escapeHtml(availableIncome.textContent)}</strong>Resultado informativo sujeto a validación.</div>${wordFieldTable(finances)}<div class="clear"></div></div><div class="section"><h2>4. Detalles de la operación</h2>${wordFieldTable(specificPrintFields())}</div><div class="section"><h2>5. Referencias personales</h2>${wordReferenceTable(["Nombre", "Relación", "Teléfono"], [["personalReference1Name", "personalReference1Relation", "personalReference1Phone"], ["personalReference2Name", "personalReference2Relation", "personalReference2Phone"]])}</div><div class="section"><h2>6. Referencias comerciales</h2>${wordReferenceTable(["Empresa o comercio", "Contacto", "Teléfono"], [["commercialReference1Name", "commercialReference1Contact", "commercialReference1Phone"], ["commercialReference2Name", "commercialReference2Contact", "commercialReference2Phone"]])}</div><div class="section"><h2>7. Referencias familiares</h2>${wordReferenceTable(["Nombre", "Parentesco", "Teléfono"], [["familyReference1Name", "familyReference1Relation", "familyReference1Phone"], ["familyReference2Name", "familyReference2Relation", "familyReference2Phone"]])}</div><div class="declaration"><b>8. Declaración y autorización</b><br>Declaro que la información suministrada en esta solicitud es correcta y autorizo a M&M Inversiones / Vegamotors a verificarla para el proceso de evaluación de crédito.</div><table class="signatures"><tr><td>Firma del solicitante<br><b>${escapeHtml(fullName)}</b></td><td>Firma del cónyuge / codeudor<br><b>Nombre y cédula</b></td><td>Recibido por M&M / Vegamotors<br><b>Nombre y firma</b></td></tr></table><div class="footer">M&M Inversiones / Vegamotors · Solicitud de crédito · Documento confidencial</div></div></body></html>`;
    const blob = new Blob(["\ufeff", wordHtml], { type: "application/msword" });
    const link = document.createElement("a");
    const safeName = fullName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") || "solicitante";
    const downloadUrl = URL.createObjectURL(blob);
    link.href = downloadUrl;
    link.download = `Solicitud-de-Credito-${safeName}.doc`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    status.className = "application-status is-success";
    status.textContent = "Solicitud exportada en formato compatible con Word.";
  }

  async function exportApplicationWord() {
    if (!form.checkValidity()) {
      form.reportValidity();
      status.className = "application-status is-error";
      status.textContent = "Completa los campos requeridos antes de exportar la solicitud.";
      return;
    }
    if (!window.docx) {
      status.className = "application-status is-error";
      status.textContent = "No se pudo cargar el generador DOCX local.";
      return;
    }
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, WidthType, BorderStyle, AlignmentType } = window.docx;
    const blue = "1468C5";
    const navy = "0A2647";
    const light = "C3DDEF";
    const font = "Arial";
    const border = { style: BorderStyle.SINGLE, size: 6, color: light };
    const fullName = `${fieldValue("firstNames", "")} ${fieldValue("lastNames", "")}`.trim() || "Solicitante";
    const typeLabel = currentTypeLabel();
    const applicationRef = state.applicationReference || `SOL-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${String(Date.now()).slice(-4)}`;
    state.applicationReference = applicationRef;
    const personal = [["Nombres", "firstNames"], ["Apellidos", "lastNames"], ["Cédula / pasaporte", "identityNumber"], ["Fecha de nacimiento", "birthDate"], ["Nacionalidad", "nationality"], ["Estado civil", "maritalStatus"], ["Teléfono", "phone"], ["Correo", "email"], ["Calle", "street"], ["No. de casa / apartamento", "houseNumber"], ["Sector", "sector"], ["Ciudad o municipio", "city"], ["Provincia", "province"], ["Referencia de ubicación 1", "residenceReference1"], ["Referencia de ubicación 2", "residenceReference2"], ["Tiempo en residencia", "residenceTime", "duration"], ["Tipo de vivienda", "housingType"], ["Dependientes", "dependents"]];
    const employment = [["Situación laboral", "employmentStatus"], ["Empresa o negocio", "employer"], ["Cargo u ocupación", "jobTitle"], ["Tiempo laborando", "employmentTime", "duration"], ["Dirección laboral", "workAddress"], ["Referencia del negocio", "businessNearby"], ["Teléfono laboral", "workPhone"], ["Supervisor / contacto", "supervisor"]];
    const finances = [["Ingreso salarial", "monthlyIncome", "money"], ["Otros ingresos", "additionalIncome", "money"], ["Origen de otros ingresos", "additionalIncomeSource"], ["Vivienda / alquiler", "housingExpense", "money"], ["Préstamos actuales", "loanExpense", "money"], ["Servicios básicos", "utilitiesExpense", "money"], ["Alimentación", "foodExpense", "money"], ["Otros gastos", "otherExpense", "money"]];
    const getImage = async (path) => {
      try { const response = await fetch(path); return response.ok ? new Uint8Array(await response.arrayBuffer()) : null; } catch { return null; }
    };
    const [mmLogo, vegaLogo] = await Promise.all([getImage("LOGO%20M%26M.png"), getImage("LOGO%20VEGAMOTORS.png")]);
    const text = (value, options = {}) => new TextRun({ text: String(value ?? ""), font, size: 18, color: navy, ...options });
    const paragraph = (value, options = {}) => new Paragraph({ children: Array.isArray(value) ? value : [text(value, options.run || {})], spacing: { after: 80, ...(options.spacing || {}) }, alignment: options.alignment, border: options.border });
    const heading = (value) => new Paragraph({ children: [text(value, { bold: true, size: 19, color: blue })], spacing: { before: 150, after: 70 }, keepNext: true, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: blue, space: 4 } } });
    const cell = (label, value, width = 4680) => new TableCell({ width: { size: width, type: WidthType.DXA }, margins: { top: 90, bottom: 90, left: 120, right: 120 }, borders: { top: border, bottom: border, left: border, right: border }, children: [new Paragraph({ children: [text(label, { bold: true, size: 13, color: "5A7895" })], spacing: { after: 20 } }), new Paragraph({ children: [text(value || "—", { bold: true, size: 17 })], spacing: { after: 0 } })] });
    const pairTable = (fields) => {
      const rows = [];
      for (let index = 0; index < fields.length; index += 2) {
        const first = fields[index]; const second = fields[index + 1];
        rows.push(new TableRow({ cantSplit: true, children: [cell(first[0], wordDisplay(first[1], first[2])), second ? cell(second[0], wordDisplay(second[1], second[2])) : cell("", "")] }));
      }
      return new Table({ width: { size: 9360, type: WidthType.DXA }, rows });
    };
    const referenceTable = (headers, rows) => new Table({ width: { size: 9360, type: WidthType.DXA }, rows: [new TableRow({ tableHeader: true, children: headers.map((header) => new TableCell({ width: { size: 3120, type: WidthType.DXA }, shading: { fill: "EAF4FD" }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, borders: { top: border, bottom: border, left: border, right: border }, children: [new Paragraph({ children: [text(header, { bold: true, size: 13, color: blue })] })] })) }), ...rows.map((row) => new TableRow({ cantSplit: true, children: row.map((name) => new TableCell({ width: { size: 3120, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, borders: { top: border, bottom: border, left: border, right: border }, children: [new Paragraph({ children: [text(fieldValue(name), { size: 16 })] })] })) }))] });
    const headerRuns = [];
    if (mmLogo) headerRuns.push(new ImageRun({ data: mmLogo, type: "png", transformation: { width: 150, height: 150 } })); else headerRuns.push(text("M&M INVERSIONES", { bold: true, size: 24, color: blue }));
    headerRuns.push(text("   "));
    if (vegaLogo) headerRuns.push(new ImageRun({ data: vegaLogo, type: "png", transformation: { width: 150, height: 150 } })); else headerRuns.push(text("VEGAMOTORS", { bold: true, size: 24, color: blue }));
    const headerTable = new Table({ width: { size: 9360, type: WidthType.DXA }, rows: [new TableRow({ children: [new TableCell({ width: { size: 6600, type: WidthType.DXA }, margins: { top: 30, bottom: 80, left: 0, right: 40 }, borders: { bottom: { style: BorderStyle.SINGLE, size: 22, color: blue } }, children: [new Paragraph({ children: headerRuns, spacing: { after: 20 } })] }), new TableCell({ width: { size: 2760, type: WidthType.DXA }, margins: { top: 30, bottom: 80, left: 40, right: 0 }, borders: { bottom: { style: BorderStyle.SINGLE, size: 22, color: blue } }, children: [new Paragraph({ children: [text("SOLICITUD DE CRÉDITO", { bold: true, size: 18, color: navy })], alignment: AlignmentType.RIGHT, spacing: { after: 20 } }), new Paragraph({ children: [text(`${applicationRef} · ${new Intl.DateTimeFormat("es-DO", { dateStyle: "medium" }).format(new Date())}`, { size: 12, color: "5A7895" })], alignment: AlignmentType.RIGHT })] })] })] });
    const summaryTable = new Table({ width: { size: 9360, type: WidthType.DXA }, rows: [new TableRow({ children: [["Monto financiado", loanEstimatePrincipal.textContent], ["Tasa simple mensual", `${fieldValue("simpleRate")}%`], ["Plazo", `${fieldValue("requestedTerm")} meses`], ["Cuota estimada", loanEstimatePayment.textContent]].map(([label, value]) => cell(label, value, 2340)) })] });
    const signatureCells = [
      `Firma del solicitante\n${fullName}`,
      "Firma del cónyuge / codeudor\nNombre y cédula",
      "Recibido por M&M / Vegamotors\nNombre y firma",
    ].map((value) => new TableCell({
      width: { size: 3120, type: WidthType.DXA },
      borders: { top: { style: BorderStyle.SINGLE, size: 6, color: blue } },
      children: value.split("\n").map((part, index) => new Paragraph({
        children: [text(part, { bold: index === 1, size: 15, color: index === 1 ? navy : "5A7895" })],
        alignment: AlignmentType.CENTER,
        spacing: { before: index === 0 ? 70 : 20, after: 0 },
      })),
    }));
    const children = [headerTable, new Paragraph({ children: [text(`${typeLabel} · Solicitud preparada para evaluación`, { bold: true, color: blue, size: 18 })], shading: { fill: "EDF6FF" }, border: { left: { style: BorderStyle.SINGLE, size: 24, color: blue } }, spacing: { before: 100, after: 100 } }), heading("1. Datos personales"), pairTable(personal), heading("2. Información laboral"), pairTable(employment), heading("3. Ingresos y gastos mensuales"), pairTable(finances), heading("4. Condiciones y cálculo de interés simple"), summaryTable, new Paragraph({ children: [text(`Interés estimado: ${loanEstimateInterest.textContent} · Total a pagar: ${loanEstimateTotal.textContent}`, { bold: true, color: "176B3F", size: 18 })], spacing: { before: 80, after: 20 } }), heading("5. Detalles de la operación"), pairTable(specificPrintFields()), heading("6. Referencias personales"), referenceTable(["Nombre", "Relación", "Teléfono"], [["personalReference1Name", "personalReference1Relation", "personalReference1Phone"], ["personalReference2Name", "personalReference2Relation", "personalReference2Phone"]]), heading("7. Referencias comerciales"), referenceTable(["Empresa o comercio", "Contacto", "Teléfono"], [["commercialReference1Name", "commercialReference1Contact", "commercialReference1Phone"], ["commercialReference2Name", "commercialReference2Contact", "commercialReference2Phone"]]), heading("8. Referencias familiares"), referenceTable(["Nombre", "Parentesco", "Teléfono"], [["familyReference1Name", "familyReference1Relation", "familyReference1Phone"], ["familyReference2Name", "familyReference2Relation", "familyReference2Phone"]]), heading("9. Declaración y firmas"), paragraph("Declaro que la información suministrada es correcta y autorizo a M&M Inversiones / Vegamotors a verificarla exclusivamente para el proceso de evaluación de crédito.", { run: { size: 16 }, spacing: { after: 250 } }), new Table({ width: { size: 9360, type: WidthType.DXA }, rows: [new TableRow({ children: signatureCells })] })];
    const wordDocument = new Document({ sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 864, right: 864, bottom: 864, left: 864 } } }, children }] });
    const blob = await Packer.toBlob(wordDocument);
    const safeName = fullName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") || "solicitante";
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `Solicitud-de-Credito-${safeName}.docx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    status.className = "application-status is-success";
    status.textContent = "Solicitud DOCX generada y lista para descargar.";
  }

  function xlsxEscape(value) {
    return String(value ?? "")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");
  }

  function xlsxColumn(index) {
    let result = "";
    let value = index + 1;
    while (value > 0) {
      const remainder = (value - 1) % 26;
      result = String.fromCharCode(65 + remainder) + result;
      value = Math.floor((value - 1) / 26);
    }
    return result;
  }

  function xlsxDateSerial(value) {
    if (!value) return "";
    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return value;
    return Math.floor((date.getTime() - Date.UTC(1899, 11, 30)) / 86400000);
  }

  function xlsxCrc32(bytes) {
    let crc = -1;
    for (const byte of bytes) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
    return (crc ^ -1) >>> 0;
  }

  function xlsxZip(files) {
    const encoder = new TextEncoder();
    const prepared = files.map(({ name, content }) => {
      const data = content instanceof Uint8Array ? content : encoder.encode(content);
      return { nameBytes: encoder.encode(name), data, crc: xlsxCrc32(data) };
    });
    const localSize = prepared.reduce((total, file) => total + 30 + file.nameBytes.length + file.data.length, 0);
    const directorySize = prepared.reduce((total, file) => total + 46 + file.nameBytes.length, 0);
    const output = new Uint8Array(localSize + directorySize + 22);
    const view = new DataView(output.buffer);
    let offset = 0;
    const offsets = [];
    prepared.forEach((file) => {
      offsets.push(offset);
      view.setUint32(offset, 0x04034B50, true); offset += 4;
      view.setUint16(offset, 20, true); offset += 2;
      view.setUint16(offset, 0, true); offset += 2;
      view.setUint16(offset, 0, true); offset += 2;
      view.setUint16(offset, 0, true); offset += 2;
      view.setUint16(offset, 0, true); offset += 2;
      view.setUint32(offset, file.crc, true); offset += 4;
      view.setUint32(offset, file.data.length, true); offset += 4;
      view.setUint32(offset, file.data.length, true); offset += 4;
      view.setUint16(offset, file.nameBytes.length, true); offset += 2;
      view.setUint16(offset, 0, true); offset += 2;
      output.set(file.nameBytes, offset); offset += file.nameBytes.length;
      output.set(file.data, offset); offset += file.data.length;
    });
    const directoryStart = offset;
    prepared.forEach((file, index) => {
      view.setUint32(offset, 0x02014B50, true); offset += 4;
      view.setUint16(offset, 20, true); offset += 2;
      view.setUint16(offset, 20, true); offset += 2;
      view.setUint16(offset, 0, true); offset += 2;
      view.setUint16(offset, 0, true); offset += 2;
      view.setUint16(offset, 0, true); offset += 2;
      view.setUint16(offset, 0, true); offset += 2;
      view.setUint32(offset, file.crc, true); offset += 4;
      view.setUint32(offset, file.data.length, true); offset += 4;
      view.setUint32(offset, file.data.length, true); offset += 4;
      view.setUint16(offset, file.nameBytes.length, true); offset += 2;
      view.setUint16(offset, 0, true); offset += 2;
      view.setUint16(offset, 0, true); offset += 2;
      view.setUint16(offset, 0, true); offset += 2;
      view.setUint16(offset, 0, true); offset += 2;
      view.setUint32(offset, 0, true); offset += 4;
      view.setUint32(offset, offsets[index], true); offset += 4;
      output.set(file.nameBytes, offset); offset += file.nameBytes.length;
    });
    view.setUint32(offset, 0x06054B50, true); offset += 4;
    view.setUint16(offset, 0, true); offset += 2;
    view.setUint16(offset, 0, true); offset += 2;
    view.setUint16(offset, prepared.length, true); offset += 2;
    view.setUint16(offset, prepared.length, true); offset += 2;
    view.setUint32(offset, directorySize, true); offset += 4;
    view.setUint32(offset, directoryStart, true); offset += 4;
    view.setUint16(offset, 0, true);
    return output;
  }

  function xlsxCell(column, row, value, style = 0, formula = "") {
    const reference = `${xlsxColumn(column)}${row}`;
    if (formula) {
      const cached = value === "" || value === undefined || value === null ? 0 : value;
      return `<c r="${reference}" s="${style}"><f>${xlsxEscape(formula)}</f><v>${xlsxEscape(cached)}</v></c>`;
    }
    if (typeof value === "number" && Number.isFinite(value)) return `<c r="${reference}" s="${style}"><v>${value}</v></c>`;
    return `<c r="${reference}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${xlsxEscape(value)}</t></is></c>`;
  }

  function xlsxSheet({ headers = [], rows = [], widths = [], dataValidations = "", freeze = true, tabColor = "1468C5" }) {
    const rowXml = [];
    if (headers.length) rowXml.push(`<row r="1" ht="28" customHeight="1">${headers.map((header, index) => xlsxCell(index, 1, header, 1)).join("")}</row>`);
    rows.forEach((row, rowIndex) => {
      const cells = row.map((item, column) => {
        const data = typeof item === "object" && item !== null ? item : { value: item };
        return xlsxCell(column, rowIndex + 2, data.value ?? "", data.style ?? 0, data.formula || "");
      }).join("");
      rowXml.push(`<row r="${rowIndex + 2}">${cells}</row>`);
    });
    const lastColumn = xlsxColumn(Math.max(headers.length, ...rows.map((row) => row.length), 1) - 1);
    const cols = widths.map((width, index) => `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`).join("");
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetPr><tabColor rgb="FF${tabColor}"/></sheetPr><dimension ref="A1:${lastColumn}${Math.max(rows.length + 1, 2)}"/><sheetViews><sheetView workbookViewId="0"${freeze ? "><pane ySplit=\"1\" topLeftCell=\"A2\" activePane=\"bottomLeft\" state=\"frozen\"/><selection pane=\"bottomLeft\"" : ""}/></sheetView></sheetViews><cols>${cols}</cols><sheetData>${rowXml.join("")}</sheetData>${dataValidations}<autoFilter ref="A1:${lastColumn}${Math.max(rows.length + 1, 2)}"/><pageMargins left="0.3" right="0.3" top="0.5" bottom="0.5" header="0.2" footer="0.2"/></worksheet>`;
  }

  async function exportApplicationExcel() {
    if (!form.checkValidity()) {
      form.reportValidity();
      status.className = "application-status is-error";
      status.textContent = "Completa los campos requeridos antes de exportar la solicitud a Excel.";
      return;
    }
    const hasApplicationData = ["firstNames", "lastNames", "identityNumber", "requestedAmount", "productPrice"].some((name) => String(fieldValue(name, "")).trim());
    const applicationRef = state.applicationReference || `SOL-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${String(Date.now()).slice(-4)}`;
    state.applicationReference = applicationRef;
    const operationType = currentTypeLabel();
    const value = (name) => fieldValue(name, "");
    const number = (name) => parseAmount(value(name));
    const guaranteeValue = number("vehicleValue") || number("propertyValue") || number("productPrice");
    const financedAmount = number("requestedAmount") || Math.max(0, number("productPrice") - number("downPaymentAvailable"));
    const monthlyRate = number("simpleRate") / 100;
    const termMonths = number("requestedTerm");
    const simpleInterest = financedAmount * monthlyRate * termMonths;
    const totalToPay = financedAmount + simpleInterest;
    const estimatedPayment = termMonths ? totalToPay / termMonths : 0;
    const headers = ["No. solicitud", "Fecha", "Estado", "Sucursal", "Tipo de credito", "Nombres", "Apellidos", "Documento", "Fecha nacimiento", "Telefono", "Correo", "Calle", "No. de casa / apartamento", "Sector", "Ciudad / municipio", "Provincia", "Situacion laboral", "Empresa / negocio", "Cargo", "Tiempo empleo", "Referencia del negocio", "Ingreso salarial", "Otros ingresos", "Origen otros ingresos", "Vivienda", "Prestamos actuales", "Servicios", "Alimentacion", "Otros gastos", "Monto solicitado", "Monto financiado", "Tasa mensual", "Plazo (meses)", "Interes simple", "Total a pagar", "Cuota estimada", "Valor garantia", "Detalle operacion", "Referencia ubicacion 1", "Referencia ubicacion 2", "Pendiente documentacion"];
    const detail = specificPrintFields().map(([label, name, format]) => `${label}: ${wordDisplay(name, format)}`).join(" | ");
    const requestRow = [
      applicationRef, { value: xlsxDateSerial(new Date().toISOString().slice(0, 10)), style: 4 }, "En evaluacion", "Principal", operationType,
      value("firstNames"), value("lastNames"), value("identityNumber"), { value: xlsxDateSerial(value("birthDate")), style: 4 }, value("phone"), value("email"), value("street"), value("houseNumber"), value("sector"), value("city"), value("province"), value("employmentStatus"), value("employer"), value("jobTitle"), `${value("employmentTime")} ${value("employmentTimeUnit")}`, value("businessNearby"),
      { value: number("monthlyIncome"), style: 2 }, { value: number("additionalIncome"), style: 2 }, value("additionalIncomeSource"), { value: number("housingExpense"), style: 2 }, { value: number("loanExpense"), style: 2 }, { value: number("utilitiesExpense"), style: 2 }, { value: number("foodExpense"), style: 2 }, { value: number("otherExpense"), style: 2 }, { value: number("requestedAmount") || number("productPrice"), style: 2 }, { value: financedAmount, style: 2 }, { value: monthlyRate, style: 3 }, termMonths, { value: simpleInterest, style: 2 }, { value: totalToPay, style: 2 }, { value: estimatedPayment, style: 2 }, { value: guaranteeValue, style: 2 }, detail, value("residenceReference1"), value("residenceReference2"), ""
    ];
    const referenceHeaders = ["No. solicitud", "Tipo de referencia", "Orden", "Nombre / empresa", "Relacion / contacto", "Telefono"];
    const referenceRows = hasApplicationData ? [
      [applicationRef, "Personal", 1, value("personalReference1Name"), value("personalReference1Relation"), value("personalReference1Phone")],
      [applicationRef, "Personal", 2, value("personalReference2Name"), value("personalReference2Relation"), value("personalReference2Phone")],
      [applicationRef, "Comercial", 1, value("commercialReference1Name"), value("commercialReference1Contact"), value("commercialReference1Phone")],
      [applicationRef, "Comercial", 2, value("commercialReference2Name"), value("commercialReference2Contact"), value("commercialReference2Phone")],
      [applicationRef, "Familiar", 1, value("familyReference1Name"), value("familyReference1Relation"), value("familyReference1Phone")],
      [applicationRef, "Familiar", 2, value("familyReference2Name"), value("familyReference2Relation"), value("familyReference2Phone")]
    ] : [];
    const evaluationHeaders = ["No. solicitud", "Ingreso total", "Gastos totales", "Disponible", "Cuota estimada", "Relacion cuota / ingreso", "Monto financiado", "Valor garantia", "Relacion monto / garantia", "Estado de evaluacion"];
    const evaluationRows = hasApplicationData ? [[applicationRef, { formula: "Solicitudes!V2+Solicitudes!W2", style: 2 }, { formula: "Solicitudes!Y2+Solicitudes!Z2+Solicitudes!AA2+Solicitudes!AB2+Solicitudes!AC2", style: 2 }, { formula: "B2-C2", style: 2 }, { formula: "Solicitudes!AJ2", style: 2 }, { formula: "IFERROR(E2/B2,0)", style: 3 }, { formula: "Solicitudes!AE2", style: 2 }, { formula: "Solicitudes!AK2", style: 2 }, { formula: "IFERROR(G2/H2,0)", style: 3 }, { formula: "IF(OR(F2>0.4,I2>0.8),\"Revisar\",\"Dentro de parametros\")" }]] : [];
    const catalogRows = [["Estados", "Tipos de credito", "Sucursales"], ["En evaluacion", "Prestamo personal", "Principal"], ["Pendiente documentacion", "Prestamo comercial", "Santiago"], ["Aprobada", "Garantia vehiculo", "Santo Domingo"], ["Rechazada", "Garantia hipotecaria", "La Vega"], ["Desembolsada", "Financiamiento smartphone", "Vegamotors"], ["", "Financiamiento motocicleta", ""]];
    const panelRows = [["Panel de solicitudes", "Valor"], ["Solicitudes en evaluacion", { formula: "COUNTIF(Solicitudes!C2:C5000,\"En evaluacion\")" }], ["Pendientes de documentacion", { formula: "COUNTIF(Solicitudes!C2:C5000,\"Pendiente documentacion\")" }], ["Solicitudes aprobadas", { formula: "COUNTIF(Solicitudes!C2:C5000,\"Aprobada\")" }], ["Solicitudes rechazadas", { formula: "COUNTIF(Solicitudes!C2:C5000,\"Rechazada\")" }], ["Monto solicitado", { formula: "SUM(Solicitudes!AD2:AD5000)", style: 2 }], ["Monto aprobado", { formula: "SUMIF(Solicitudes!C2:C5000,\"Aprobada\",Solicitudes!AE2:AE5000)", style: 2 }], ["Cuota promedio", { formula: "IFERROR(AVERAGE(Solicitudes!AJ2:AJ5000),0)", style: 2 }]];
    const validations = `<dataValidations count="3"><dataValidation type="list" allowBlank="1" sqref="C2:C5000"><formula1>&apos;Catalogos&apos;!$A$2:$A$6</formula1></dataValidation><dataValidation type="list" allowBlank="1" sqref="D2:D5000"><formula1>&apos;Catalogos&apos;!$C$2:$C$6</formula1></dataValidation><dataValidation type="list" allowBlank="1" sqref="E2:E5000"><formula1>&apos;Catalogos&apos;!$B$2:$B$7</formula1></dataValidation></dataValidations>`;
    if (!window.XLSX) {
      status.className = "application-status is-error";
      status.textContent = "No se pudo cargar el generador de Excel. Recarga la página e inténtalo nuevamente.";
      return;
    }
    const formatByStyle = { 2: '"RD$"#,##0.00', 3: "0.00%", 4: "yyyy-mm-dd" };
    const appendExcelSheet = (sheetName, sheetHeaders, sheetRows, sheetWidths) => {
      const values = [sheetHeaders, ...sheetRows.map((row) => row.map((item) => {
        const data = typeof item === "object" && item !== null ? item : { value: item };
        return data.formula ? "" : data.value ?? "";
      }))];
      const worksheet = XLSX.utils.aoa_to_sheet(values);
      sheetRows.forEach((row, rowIndex) => row.forEach((item, columnIndex) => {
        const data = typeof item === "object" && item !== null ? item : { value: item };
        const reference = XLSX.utils.encode_cell({ r: rowIndex + 1, c: columnIndex });
        const cell = worksheet[reference] || (worksheet[reference] = { t: "s", v: "" });
        if (data.formula) {
          cell.f = data.formula;
          cell.t = /Dentro de parametros|Revisar/.test(data.formula) ? "s" : "n";
          cell.v = cell.t === "s" ? "" : 0;
        }
        if (formatByStyle[data.style]) cell.z = formatByStyle[data.style];
      }));
      worksheet["!cols"] = sheetWidths.map((width) => ({ wch: width }));
      worksheet["!autofilter"] = { ref: `A1:${XLSX.utils.encode_col(Math.max(sheetHeaders.length - 1, 0))}${Math.max(sheetRows.length + 1, 2)}` };
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    };
    const workbook = XLSX.utils.book_new();
    workbook.Props = {
      Title: "Solicitud de credito",
      Subject: "Evaluacion de credito",
      Author: "M&M Inversiones / Vegamotors",
      Company: "M&M Inversiones / Vegamotors"
    };
    const createApplicationSheet = () => {
      const worksheet = XLSX.utils.aoa_to_sheet([]);
      const navy = "153554";
      const blue = "1468C5";
      const softBlue = "EAF4FD";
      const paleBlue = "F7FBFF";
      const green = "176B3F";
      const softGreen = "EEF8F1";
      const line = "C8DCEB";
      const standardBorder = { top: { style: "thin", color: { rgb: line } }, bottom: { style: "thin", color: { rgb: line } }, left: { style: "thin", color: { rgb: line } }, right: { style: "thin", color: { rgb: line } } };
      const styles = {
        brand: { font: { name: "Arial", sz: 10, bold: true, color: { rgb: "FFFFFF" } }, fill: { patternType: "solid", fgColor: { rgb: navy } }, alignment: { horizontal: "center", vertical: "center" } },
        title: { font: { name: "Arial", sz: 16, bold: true, color: { rgb: navy } }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } }, alignment: { horizontal: "center", vertical: "center" } },
        subtitle: { font: { name: "Arial", sz: 8, bold: true, color: { rgb: "5A7895" } }, alignment: { horizontal: "center", vertical: "center" } },
        section: { font: { name: "Arial", sz: 9, bold: true, color: { rgb: "FFFFFF" } }, fill: { patternType: "solid", fgColor: { rgb: blue } }, alignment: { horizontal: "left", vertical: "center" }, border: standardBorder },
        label: { font: { name: "Arial", sz: 7, bold: true, color: { rgb: "527590" } }, fill: { patternType: "solid", fgColor: { rgb: softBlue } }, alignment: { horizontal: "left", vertical: "center", wrapText: true }, border: standardBorder },
        value: { font: { name: "Arial", sz: 9, bold: true, color: { rgb: navy } }, fill: { patternType: "solid", fgColor: { rgb: "FFFFFF" } }, alignment: { horizontal: "left", vertical: "center", wrapText: true }, border: standardBorder },
        money: { font: { name: "Arial", sz: 10, bold: true, color: { rgb: green } }, fill: { patternType: "solid", fgColor: { rgb: softGreen } }, alignment: { horizontal: "right", vertical: "center" }, border: standardBorder, numFmt: '"RD$"#,##0.00' },
        metricLabel: { font: { name: "Arial", sz: 7, bold: true, color: { rgb: green } }, fill: { patternType: "solid", fgColor: { rgb: softGreen } }, alignment: { horizontal: "center", vertical: "center" }, border: standardBorder },
        note: { font: { name: "Arial", sz: 8, color: { rgb: "496982" } }, fill: { patternType: "solid", fgColor: { rgb: paleBlue } }, alignment: { horizontal: "left", vertical: "center", wrapText: true }, border: standardBorder },
        signature: { font: { name: "Arial", sz: 8, color: { rgb: navy } }, alignment: { horizontal: "center", vertical: "center" }, border: { top: { style: "thin", color: { rgb: navy } } } },
        signatureLabel: { font: { name: "Arial", sz: 7, bold: true, color: { rgb: "527590" } }, alignment: { horizontal: "center", vertical: "center" } }
      };
      const merges = [];
      const merge = (from, to) => merges.push(XLSX.utils.decode_range(`${from}:${to}`));
      const cell = (address, value, style, type = "s") => {
        worksheet[address] = { t: type, v: value ?? "", s: style };
      };
      const mergedCell = (from, to, value, style, type = "s") => { merge(from, to); cell(from, value, style, type); };
      const pair = (row, leftLabel, leftValue, rightLabel, rightValue, leftStyle = styles.value, rightStyle = styles.value) => {
        mergedCell(`A${row}`, `B${row}`, leftLabel, styles.label);
        mergedCell(`C${row}`, `D${row}`, leftValue, leftStyle, typeof leftValue === "number" ? "n" : "s");
        mergedCell(`E${row}`, `F${row}`, rightLabel, styles.label);
        mergedCell(`G${row}`, `H${row}`, rightValue, rightStyle, typeof rightValue === "number" ? "n" : "s");
      };
      const wide = (row, label, itemValue, itemStyle = styles.value) => {
        mergedCell(`A${row}`, `B${row}`, label, styles.label);
        mergedCell(`C${row}`, `H${row}`, itemValue, itemStyle, typeof itemValue === "number" ? "n" : "s");
      };
      const section = (row, title) => mergedCell(`A${row}`, `H${row}`, title, styles.section);
      const reference = (prefix, index, name, relation, phone) => wide(index, prefix, `${fieldValue(name, "")}  |  ${fieldValue(relation, "")}  |  ${fieldValue(phone, "")}`.replace(/\s*\|\s*\|\s*/g, ""));
      const requestedAmount = number("requestedAmount") || number("productPrice");
      const available = Math.max(0, number("monthlyIncome") + number("additionalIncome") - number("housingExpense") - number("loanExpense") - number("utilitiesExpense") - number("foodExpense") - number("otherExpense"));
      const quotaRatio = number("monthlyIncome") + number("additionalIncome") ? estimatedPayment / (number("monthlyIncome") + number("additionalIncome")) : 0;

      worksheet["!cols"] = [{ wch: 13 }, { wch: 13 }, { wch: 15 }, { wch: 15 }, { wch: 13 }, { wch: 13 }, { wch: 15 }, { wch: 15 }];
      worksheet["!rows"] = Array.from({ length: 48 }, (_, index) => ({ hpt: index === 0 ? 23 : index === 2 ? 27 : index === 44 ? 30 : index === 45 ? 12 : 19 }));
      worksheet["!merges"] = merges;
      worksheet["!margins"] = { left: 0.3, right: 0.3, top: 0.45, bottom: 0.45, header: 0.2, footer: 0.2 };
      worksheet["!pageSetup"] = { orientation: "portrait", paperSize: 1, fitToWidth: 1, fitToHeight: 1 };
      worksheet["!printArea"] = "A1:H48";

      mergedCell("A1", "H1", "M&M INVERSIONES  |  VEGAMOTORS", styles.brand);
      mergedCell("A2", "H2", "USO INTERNO · INFORMACION CONFIDENCIAL", styles.subtitle);
      mergedCell("A3", "H3", "SOLICITUD DE CREDITO", styles.title);
      pair(4, "No. solicitud", applicationRef, "Fecha", new Intl.DateTimeFormat("es-DO", { dateStyle: "medium" }).format(new Date()));
      section(6, "1. OPERACION Y CALCULO");
      pair(7, "Tipo de credito", operationType, "Monto solicitado", requestedAmount, styles.value, styles.money);
      pair(8, "Destino / detalle", fieldValue("loanPurpose", "—"), "Plazo", `${termMonths || "—"} meses`);
      pair(9, "Tasa mensual", `${(monthlyRate * 100).toFixed(2)}%`, "Monto financiado", financedAmount, styles.value, styles.money);
      pair(10, "Interes estimado", simpleInterest, "Cuota mensual", estimatedPayment, styles.money, styles.money);
      pair(11, "Total a pagar", totalToPay, "Garantia / valor", guaranteeValue, styles.money, styles.money);
      section(13, "2. DATOS PERSONALES");
      pair(14, "Nombres", fieldValue("firstNames"), "Apellidos", fieldValue("lastNames"));
      pair(15, "Cedula o pasaporte", fieldValue("identityNumber"), "Fecha de nacimiento", fieldValue("birthDate"));
      pair(16, "Nacionalidad", fieldValue("nationality"), "Estado civil", fieldValue("maritalStatus"));
      pair(17, "Telefono", fieldValue("phone"), "Correo", fieldValue("email"));
      wide(18, "Direccion", `${fieldValue("street")}, ${fieldValue("houseNumber")} · ${fieldValue("sector")}`);
      pair(19, "Ciudad / municipio", fieldValue("city"), "Provincia", fieldValue("province"));
      section(21, "3. INFORMACION LABORAL");
      pair(22, "Situacion laboral", fieldValue("employmentStatus"), "Empresa o negocio", fieldValue("employer"));
      pair(23, "Cargo u ocupacion", fieldValue("jobTitle"), "Tiempo laborando", `${fieldValue("employmentTime", "")} ${fieldValue("employmentTimeUnit", "")}`.trim());
      wide(24, "Direccion laboral", fieldValue("workAddress"));
      wide(25, "Referencia del negocio", fieldValue("businessNearby"));
      pair(26, "Telefono laboral", fieldValue("workPhone"), "Supervisor / contacto", fieldValue("supervisor"));
      section(28, "4. INGRESOS, GASTOS Y CAPACIDAD DE PAGO");
      pair(29, "Ingreso salarial", number("monthlyIncome"), "Otros ingresos", number("additionalIncome"), styles.money, styles.money);
      wide(30, "Origen de otros ingresos", fieldValue("additionalIncomeSource"));
      pair(31, "Gastos mensuales", number("housingExpense") + number("loanExpense") + number("utilitiesExpense") + number("foodExpense") + number("otherExpense"), "Disponible estimado", available, styles.money, styles.money);
      pair(32, "Cuota / ingreso", `${(quotaRatio * 100).toFixed(1)}%`, "Estado", quotaRatio <= 0.35 && available >= estimatedPayment ? "Capacidad favorable" : "Requiere revision", styles.value, styles.metricLabel);
      section(34, "5. REFERENCIAS");
      reference("Personal 1", 35, "personalReference1Name", "personalReference1Relation", "personalReference1Phone");
      reference("Personal 2", 36, "personalReference2Name", "personalReference2Relation", "personalReference2Phone");
      reference("Comercial 1", 37, "commercialReference1Name", "commercialReference1Contact", "commercialReference1Phone");
      reference("Comercial 2", 38, "commercialReference2Name", "commercialReference2Contact", "commercialReference2Phone");
      reference("Familiar 1", 39, "familyReference1Name", "familyReference1Relation", "familyReference1Phone");
      reference("Familiar 2", 40, "familyReference2Name", "familyReference2Relation", "familyReference2Phone");
      section(42, "6. DECLARACION Y FIRMAS");
      mergedCell("A43", "H44", "Declaro que la informacion suministrada es correcta y autorizo a M&M Inversiones / Vegamotors a verificarla exclusivamente para evaluar esta solicitud de credito.", styles.note);
      mergedCell("A46", "B46", "", styles.signature);
      mergedCell("D46", "E46", "", styles.signature);
      mergedCell("G46", "H46", "", styles.signature);
      mergedCell("A47", "B47", "Firma del solicitante", styles.signatureLabel);
      mergedCell("D47", "E47", "Firma del conyuge / codeudor", styles.signatureLabel);
      mergedCell("G47", "H47", "Recibido por M&M / Vegamotors", styles.signatureLabel);
      mergedCell("A48", "H48", "Solicitud de credito · M&M Inversiones / Vegamotors", styles.subtitle);
      worksheet["!ref"] = "A1:H48";
      XLSX.utils.book_append_sheet(workbook, worksheet, "Solicitud de credito");
    };
    createApplicationSheet();
    appendExcelSheet("Solicitudes", headers, [requestRow], [18, 12, 20, 16, 24, 18, 18, 18, 14, 16, 28, 34, 22, 20, 24, 20, 18, ...Array(16).fill(16), 45, 28, 28, 28]);
    appendExcelSheet("Referencias", referenceHeaders, referenceRows, [18, 20, 10, 30, 28, 18]);
    appendExcelSheet("Evaluacion", evaluationHeaders, evaluationRows, [18, 18, 18, 18, 18, 22, 18, 18, 26, 25]);
    appendExcelSheet("Catalogos", catalogRows[0], catalogRows.slice(1), [26, 32, 24]);
    appendExcelSheet("Panel", panelRows[0], panelRows.slice(1), [34, 22]);
    XLSX.writeFile(workbook, `Solicitud-de-Credito-${applicationRef}.xlsx`, { bookType: "xlsx", compression: true });
    status.className = "application-status is-success";
    status.textContent = "Solicitud exportada a Excel con sus datos, referencias, evaluación y panel.";
    return;
    const sheets = [
      { name: "Solicitudes", xml: xlsxSheet({ headers, rows: hasApplicationData ? [requestRow] : [], widths: [18, 12, 20, 16, 24, 18, 18, 18, 14, 16, 28, 34, 22, 20, 24, 20, 18, ...Array(16).fill(16), 45, 28, 28, 28], dataValidations: validations }) },
      { name: "Referencias", xml: xlsxSheet({ headers: referenceHeaders, rows: referenceRows, widths: [18, 20, 10, 30, 28, 18], tabColor: "397550" }) },
      { name: "Evaluacion", xml: xlsxSheet({ headers: evaluationHeaders, rows: evaluationRows, widths: [18, 18, 18, 18, 18, 22, 18, 18, 26, 25], tabColor: "397550" }) },
      { name: "Catalogos", xml: xlsxSheet({ headers: catalogRows[0], rows: catalogRows.slice(1), widths: [26, 32, 24], tabColor: "6B8EAD" }) },
      { name: "Panel", xml: xlsxSheet({ headers: panelRows[0], rows: panelRows.slice(1), widths: [34, 22], tabColor: "1468C5" }) }
    ];
    const workbookSheets = sheets.map((sheet, index) => `<sheet name="${sheet.name}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join("");
    const relationshipSheets = sheets.map((sheet, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join("");
    const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="2"><numFmt numFmtId="164" formatCode="&quot;RD$&quot;#,##0.00"/><numFmt numFmtId="165" formatCode="0.00%"/></numFmts><fonts count="2"><font><sz val="10"/><color rgb="FF153554"/><name val="Arial"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Arial"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF1468C5"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFC3DDEF"/></left><right style="thin"><color rgb="FFC3DDEF"/></right><top style="thin"><color rgb="FFC3DDEF"/></top><bottom style="thin"><color rgb="FFC3DDEF"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="5"><xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="1" applyNumberFormat="1" applyBorder="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="1" applyNumberFormat="1" applyBorder="1"/><xf numFmtId="14" fontId="0" fillId="0" borderId="1" applyNumberFormat="1" applyBorder="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/></styleSheet>`;
    const files = [
      { name: "[Content_Types].xml", content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((sheet, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>` },
      { name: "_rels/.rels", content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
      { name: "xl/workbook.xml", content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView activeTab="0"/></bookViews><sheets>${workbookSheets}</sheets><calcPr calcId="0" calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/></workbook>` },
      { name: "xl/_rels/workbook.xml.rels", content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relationshipSheets}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
      { name: "xl/styles.xml", content: styles },
      ...sheets.map((sheet, index) => ({ name: `xl/worksheets/sheet${index + 1}.xml`, content: sheet.xml }))
    ];
    const blob = new Blob([xlsxZip(files)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const link = document.createElement("a");
    const downloadUrl = URL.createObjectURL(blob);
    link.href = downloadUrl;
    link.download = `Solicitud-de-Credito-${applicationRef}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    status.className = "application-status is-success";
    status.textContent = hasApplicationData ? "Libro XLSX descargado con la solicitud, referencias, evaluación, catálogos y panel." : "Plantilla XLSX descargada: completa la solicitud y vuelve a exportar para incluir sus datos.";
  }

  function clearLegacyClientData() {
    try {
      localStorage.removeItem("cotizador-mym-credit-application-v1");
      localStorage.removeItem("cotizador-mym-product-rules-v1");
    } catch {
      // La aplicación funciona aunque el navegador bloquee el almacenamiento local.
    }
  }

  function validateCurrentStep() {
    const fields = [...flowSections[activeStep].querySelectorAll("input, select, textarea")];
    const invalidField = fields.find((field) => field.willValidate && !field.checkValidity());
    if (!invalidField) {
      flowLinks[activeStep]?.classList.add("is-complete");
      return true;
    }
    invalidField.reportValidity();
    invalidField.focus({ preventScroll: true });
    status.className = "application-status is-error";
    status.textContent = "Completa los campos requeridos de esta etapa antes de continuar.";
    return false;
  }

  function setApplicationStep(index, { scroll = true } = {}) {
    activeStep = Math.max(0, Math.min(index, flowSections.length - 1));
    flowSections.forEach((section, sectionIndex) => { section.hidden = sectionIndex !== activeStep; });
    const currentSection = flowSections[activeStep];
    currentSection.classList.remove("is-entering");
    void currentSection.offsetWidth;
    currentSection.classList.add("is-entering");
    flowLinks.forEach((link, linkIndex) => {
      const active = linkIndex === activeStep;
      link.classList.toggle("is-active", active);
      link.setAttribute("aria-current", active ? "step" : "false");
    });
    const title = flowSections[activeStep].querySelector("h3")?.textContent || "Solicitud";
    stepLabel.textContent = `Paso ${activeStep + 1} de ${flowSections.length} · ${title}`;
    previousStepButton.hidden = activeStep === 0;
    nextStepButton.hidden = activeStep === flowSections.length - 1;
    if (scroll) document.querySelector("#creditApplication")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  typeGrid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-application-type]");
    if (card) selectType(card.dataset.applicationType);
  });
  entryButton?.addEventListener("click", (event) => {
    event.preventDefault();
    window.selectCotizadorWorkspace?.("application");
    if (hasQuoteToConvert()) convertQuoteToApplication();
    setApplicationStep(0, { scroll: false });
  });
  contextAction.addEventListener("click", () => {
    if (!window.confirm("¿Deseas limpiar los datos de la solicitud y comenzar una nueva?")) return;
    clearApplication();
    setApplicationStep(0, { scroll: false });
  });
  previousStepButton.addEventListener("click", () => setApplicationStep(activeStep - 1));
  nextStepButton.addEventListener("click", () => {
    if (validateCurrentStep()) setApplicationStep(activeStep + 1);
  });
  flowLinks.forEach((link, index) => link.addEventListener("click", (event) => {
    event.preventDefault();
    if (index > activeStep + 1) {
      status.className = "application-status is-error";
      status.textContent = "Avanza en orden para verificar cada etapa de la solicitud.";
      return;
    }
    if (index === activeStep + 1 && !validateCurrentStep()) return;
    setApplicationStep(index);
  }));
  els.form.addEventListener("input", updateApplicationEntry);
  els.form.addEventListener("change", updateApplicationEntry);
  form.addEventListener("focusin", (event) => {
    if (!event.target.matches("[data-money-input]")) return;
    if (event.target.value.trim()) event.target.value = String(parseAmount(event.target.value));
  });
  form.addEventListener("focusout", (event) => {
    if (!event.target.matches("[data-money-input]")) return;
    formatMoneyInput(event.target);
    updateFinancialSummary();
    updateLoanEstimate();
  });
  form.addEventListener("input", () => { updateFinancialSummary(); updateLoanEstimate(); });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      status.className = "application-status is-error";
      status.textContent = "Faltan datos requeridos. Revisa los campos marcados por el navegador.";
      return;
    }
    saveDraft();
    status.className = "application-status is-success";
    status.textContent = "Solicitud verificada y lista para calcular, imprimir o exportar. No se guardó ningún dato.";
  });
  wordButton.addEventListener("click", exportApplicationWord);
  excelButton?.addEventListener("click", exportApplicationExcel);
  printButton.addEventListener("click", printApplication);
  clearButton.addEventListener("click", () => {
    if (!window.confirm("¿Deseas limpiar todos los datos de esta solicitud?")) return;
    clearApplication();
    setApplicationStep(0, { scroll: false });
  });
  renderSpecificFields();
  updateFinancialSummary();
  updateLoanEstimate();
  clearLegacyClientData();
  setApplicationStep(0, { scroll: false });
  updateApplicationEntry();
  window.addEventListener("afterprint", () => { delete document.body.dataset.printTarget; });
})();

// Ficha temporal para visitas presenciales de evaluación de préstamos.
(() => {
  const form = document.querySelector("#evaluationForm");
  if (!form) return;

  const status = document.querySelector("#evaluationStatus");
  const hasCoDebtor = form.elements.namedItem("hasCoDebtor");
  const coDebtorFields = document.querySelector("#coDebtorFields");
  const coDebtorBureauFields = document.querySelector("#coDebtorBureauFields");
  const debtorBureauFields = form.elements.namedItem("debtorBureauLoanDebt").closest("fieldset");
  const debtorBureauStatusWrap = form.elements.namedItem("debtorBureauStatus").closest("label");
  const coDebtorBureauStatusWrap = document.querySelector("#coDebtorBureauStatusWrap");
  const debtorNoHistory = document.querySelector("#debtorNoHistory");
  const coDebtorNoHistory = document.querySelector("#coDebtorNoHistory");
  const coDebtorEmptyNote = document.querySelector("#coDebtorEmptyNote");
  const coDebtorPhotoSection = document.querySelector("#coDebtorPhotoSection");
  const debtorPhotoSection = document.querySelector('[aria-labelledby="debtorIdPhotoTitle"]');
  const debtorIdLabel = form.elements.namedItem("debtorId").closest("label");
  const coDebtorIdLabel = form.elements.namedItem("coDebtorId").closest("label");
  const evaluationOutcome = document.querySelector(".evaluation-outcome");
  const printOutcome = document.querySelector("#evaluationPrintOutcome").closest(".evaluation-print-result");
  const printButton = document.querySelector("#printEvaluationBtn");
  const clearButton = document.querySelector("#clearEvaluationBtn");
  const evaluationLayout = form.querySelector(".evaluation-layout");
  const evaluationMain = form.querySelector(".evaluation-main");
  const evaluationControlSection = document.querySelector('[aria-labelledby="evaluationControlTitle"]');
  const evaluationPeopleSection = document.querySelector('[aria-labelledby="evaluationPeopleTitle"]');
  const evaluationBureauSection = document.querySelector('[aria-labelledby="evaluationBureauTitle"]');
  const evaluationPeopleHeading = evaluationPeopleSection.querySelector("h3");
  const evaluationPeopleEyebrow = evaluationPeopleSection.querySelector(".evaluation-section-heading p");
  const evaluationBureauHeading = evaluationBureauSection.querySelector("h3");
  const evaluationBureauEyebrow = evaluationBureauSection.querySelector(".evaluation-section-heading p");
  const debtorPersonCard = form.elements.namedItem("debtorName").closest("fieldset");
  const coDebtorPersonCard = coDebtorFields.closest("fieldset");
  const evaluationSide = document.querySelector(".evaluation-side");
  const evaluationActions = document.querySelector(".evaluation-actions");
  const evaluationConsent = evaluationActions.querySelector(".consent-check");
  const evaluationActionButtons = evaluationActions.querySelector("div");
  const photos = { debtor: "", coDebtor: "" };
  let reference = "";
  let wizardStep = 1;
  let wizard = null;
  let wizardNavigation = null;
  let personDossier = null;
  let personDossierTitle = null;
  let personDossierDescription = null;
  let noCoDebtorControl = null;
  let reviewPanel = null;
  let operationSummary = null;
  const value = (name, fallback = "—") => String(form.elements.namedItem(name)?.value || "").trim() || fallback;
  const essentialFields = ["evaluationDate", "evaluatorName", "evaluationBranch", "evaluationProduct", "debtorName", "debtorId"];
  const moneyFieldNames = ["evaluationAmount", "evaluationInitial", "debtorWorkIncome", "coDebtorWorkIncome", "debtorBureauLoanDebt", "debtorBureauMonthlyPayment", "debtorBureauCardDebt", "coDebtorBureauLoanDebt", "coDebtorBureauMonthlyPayment", "coDebtorBureauCardDebt"];
  const escape = (text) => String(text ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  const fieldReference = (date = form.elements.namedItem("evaluationDate")?.value || new Date().toISOString().slice(0, 10)) => `CAMPO-${date.replaceAll("-", "")}`;

  function setCoDebtorVisibility() {
    const active = hasCoDebtor.checked;
    coDebtorFields.hidden = !active;
    coDebtorEmptyNote.hidden = active;
    coDebtorPhotoSection.hidden = !active;
    coDebtorPersonCard.querySelectorAll("input, select, textarea").forEach((field) => { if (field.name !== "hasCoDebtor") field.disabled = !active; });
    coDebtorBureauFields.querySelectorAll("input, select, textarea").forEach((field) => { field.disabled = !active; });
    form.elements.namedItem("coDebtorBureauStatus").disabled = !active;
    form.elements.namedItem("coDebtorIdPhoto").disabled = !active;
    form.elements.namedItem("coDebtorId").disabled = !active;
    coDebtorIdLabel.hidden = !active;
    if (noCoDebtorControl) noCoDebtorControl.checked = !active;
    if (!active) {
      coDebtorPersonCard.querySelectorAll("input:not([name=hasCoDebtor]), textarea, select").forEach((field) => { if (field.type !== "file") field.value = ""; });
      coDebtorBureauFields.querySelectorAll("input, textarea, select").forEach((field) => { field.value = ""; });
      form.elements.namedItem("coDebtorBureauStatus").value = "con-historial";
      photos.coDebtor = "";
      const preview = document.querySelector("#coDebtorIdPreview");
      preview.removeAttribute("src");
      preview.hidden = true;
      document.querySelector("#evaluationPrintCoDebtorSection").hidden = true;
    }
    updateBureauVisibility();
    renderWorkflowStatus();
    if (wizard) setWizardStep(wizardStep);
  }

  function setupPersonDossier() {
    personDossier = document.createElement("section");
    personDossier.className = "evaluation-person-dossier";
    personDossier.innerHTML = '<header class="evaluation-person-dossier-header"><span class="evaluation-person-dossier-step">02</span><div><p id="evaluationPersonDossierEyebrow">Persona principal</p><h3 id="evaluationPersonDossierTitle">Deudor principal</h3><small id="evaluationPersonDossierDescription">Identificación, residencia, empleo y perfil financiero en una sola ficha.</small></div><label class="no-codebtor-control" id="noCoDebtorControl" hidden><input type="checkbox"> <span>No tiene codeudor</span></label></header><div class="evaluation-person-dossier-body"></div>';
    const body = personDossier.querySelector(".evaluation-person-dossier-body");
    evaluationPeopleSection.before(personDossier);
    body.append(evaluationPeopleSection, evaluationBureauSection);
    personDossierTitle = personDossier.querySelector("#evaluationPersonDossierTitle");
    personDossierDescription = personDossier.querySelector("#evaluationPersonDossierDescription");
    noCoDebtorControl = personDossier.querySelector("#noCoDebtorControl input");
    noCoDebtorControl.addEventListener("change", () => {
      hasCoDebtor.checked = !noCoDebtorControl.checked;
      setCoDebtorVisibility();
    });
    debtorPersonCard.append(debtorPhotoSection);
    coDebtorPersonCard.append(coDebtorPhotoSection);
  }

  function setupReviewPanel() {
    reviewPanel = document.createElement("section");
    reviewPanel.className = "evaluation-review-panel";
    reviewPanel.innerHTML = '<header><span>04</span><div><p>Control antes de imprimir</p><h3>Revisión de la solicitud</h3><small>Confirma la información levantada y el estado de los documentos.</small></div></header><section class="evaluation-review-readiness"><h4>Estado de la ficha</h4><div id="evaluationReviewReadiness"></div></section><section><h4>Resumen de la operación</h4><dl id="evaluationReviewOperation"></dl></section><section><h4>Personas y documentos</h4><div class="evaluation-review-docs" id="evaluationReviewDocuments"></div></section><section class="evaluation-review-manual"><h4>Observaciones manuales de campo</h4><p>Este espacio se mostrará amplio en la ficha impresa para completarlo después de la visita.</p></section>';
    evaluationMain.append(reviewPanel);
  }

  function numberFromMoney(name) {
    return normalizeMoney(value(name, "")) || 0;
  }

  function formatPeso(amount) {
    return `RD$ ${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(amount) || 0)}`;
  }

  function personProgress(prefix) {
    const personal = [`${prefix}Name`, `${prefix}Id`, `${prefix}Phone`, `${prefix}HomeAddress`, `${prefix}NearbyReference1`, `${prefix}NearbyReference2`, `${prefix}WorkCompany`, `${prefix}WorkTime`, `${prefix}WorkIncome`];
    const bureauStatus = `${prefix}BureauStatus`;
    const bureau = value(bureauStatus, "con-historial") === "sin-historial" ? [bureauStatus] : [bureauStatus, `${prefix}BureauLoanDebt`, `${prefix}BureauMonthlyPayment`, `${prefix}BureauCardDebt`];
    const fields = [...personal, ...bureau];
    const complete = fields.filter((name) => Boolean(value(name, ""))).length;
    return { complete, total: fields.length, percent: Math.round((complete / fields.length) * 100) };
  }

  function setupOperationSummary() {
    operationSummary = document.createElement("aside");
    operationSummary.className = "evaluation-operation-summary";
    operationSummary.setAttribute("aria-live", "polite");
    operationSummary.innerHTML = '<div class="evaluation-operation-summary-title"><i class="fa-solid fa-gauge-high"></i><div><p>Control de campo</p><h3>Resumen en vivo</h3></div></div><div class="evaluation-operation-summary-content" id="evaluationOperationSummaryContent"></div>';
    evaluationLayout.before(operationSummary);
  }

  function setupPaymentCapacity() {
    [["debtor", debtorBureauFields], ["coDebtor", form.elements.namedItem("coDebtorBureauLoanDebt")?.closest("fieldset")]].forEach(([prefix, card]) => {
      if (!card) return;
      const panel = document.createElement("aside");
      panel.className = "evaluation-capacity-card";
      panel.dataset.capacityFor = prefix;
      panel.innerHTML = '<div><i class="fa-solid fa-chart-pie"></i><span>Capacidad de pago</span></div><strong>Completa ingresos y cuota mensual</strong><small>Referencia interna para orientar la visita; no sustituye la decisión de crédito.</small>';
      card.append(panel);
    });
  }

  function setupQuickFill() {
    const addShortcuts = (name, options) => {
      const input = form.elements.namedItem(name);
      const label = input?.closest("label");
      if (!input || !label) return;
      const shortcuts = document.createElement("span");
      shortcuts.className = "evaluation-quick-fill";
      shortcuts.setAttribute("aria-label", "Atajos de llenado");
      shortcuts.innerHTML = options.map((option) => `<button type="button">${escape(option)}</button>`).join("");
      shortcuts.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button) return;
        const option = button.textContent.trim();
        input.value = input.value ? `${input.value}${input.value.includes(option) ? "" : ` · ${option}`}` : option;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus();
      });
      label.append(shortcuts);
    };
    ["debtor", "coDebtor"].forEach((prefix) => {
      addShortcuts(`${prefix}WorkCompany`, ["Empleado", "Negocio propio", "Independiente"]);
    });
  }

  function renderPaymentCapacity(prefix) {
    const panel = document.querySelector(`[data-capacity-for="${prefix}"]`);
    if (!panel) return;
    const income = numberFromMoney(`${prefix}WorkIncome`);
    const payment = numberFromMoney(`${prefix}BureauMonthlyPayment`);
    if (!income || !payment) {
      panel.dataset.level = "empty";
      panel.innerHTML = '<div><i class="fa-solid fa-chart-pie"></i><span>Capacidad de pago</span></div><strong>Completa ingresos y cuota mensual</strong><small>Referencia interna para orientar la visita; no sustituye la decisión de crédito.</small>';
      return;
    }
    const ratio = Math.round((payment / income) * 100);
    const level = ratio <= 25 ? "comfortable" : ratio <= 40 ? "attention" : "high";
    const note = ratio <= 25 ? "Carga mensual moderada" : ratio <= 40 ? "Requiere validación adicional" : "Carga mensual elevada";
    panel.dataset.level = level;
    panel.innerHTML = `<div><i class="fa-solid fa-chart-pie"></i><span>Capacidad de pago</span><b>${ratio}%</b></div><strong>${note}</strong><dl><div><dt>Ingresos</dt><dd>${formatPeso(income)}</dd></div><div><dt>Cuota actual</dt><dd>${formatPeso(payment)}</dd></div><div><dt>Disponible</dt><dd>${formatPeso(Math.max(income - payment, 0))}</dd></div></dl>`;
  }

  function renderWorkflowStatus() {
    const debtor = personProgress("debtor");
    const codebtor = hasCoDebtor.checked ? personProgress("coDebtor") : null;
    wizard?.querySelector('[data-evaluation-step="2"] small')?.replaceChildren(document.createTextNode(`${debtor.complete}/${debtor.total} datos`));
    wizard?.querySelector('[data-evaluation-step="3"] small')?.replaceChildren(document.createTextNode(codebtor ? `${codebtor.complete}/${codebtor.total} datos` : "No aplica"));
    const core = [["Tipo", value("evaluationProduct")], ["Monto", value("evaluationAmount") ? `RD$ ${value("evaluationAmount")}` : "Pendiente"], ["Sucursal", value("evaluationBranch")], ["Deudor", value("debtorName")]];
    if (operationSummary) {
      operationSummary.querySelector("#evaluationOperationSummaryContent").innerHTML = `<div class="evaluation-operation-summary-grid">${core.map(([label, content]) => `<div><span>${escape(label)}</span><b>${escape(content)}</b></div>`).join("")}</div><div class="evaluation-person-progress"><div><span>Deudor</span><b>${debtor.percent}%</b><i><em style="width:${debtor.percent}%"></em></i></div>${codebtor ? `<div><span>Codeudor</span><b>${codebtor.percent}%</b><i><em style="width:${codebtor.percent}%"></em></i></div>` : '<div class="is-na"><span>Codeudor</span><b>No aplica</b></div>'}</div>`;
    }
    renderPaymentCapacity("debtor");
    renderPaymentCapacity("coDebtor");
  }

  function renderReadiness() {
    const target = document.querySelector("#evaluationReviewReadiness");
    if (!target) return;
    const missingEssential = essentialFields.filter((name) => !value(name, ""));
    const pending = [];
    if (!photos.debtor) pending.push("foto de cédula del deudor");
    if (hasCoDebtor.checked && !photos.coDebtor) pending.push("foto de cédula del codeudor");
    const note = missingEssential.length ? "Faltan datos obligatorios para imprimir" : "Lista para imprimir";
    target.innerHTML = `<div class="evaluation-readiness ${missingEssential.length ? "is-blocked" : "is-ready"}"><i class="fa-solid ${missingEssential.length ? "fa-triangle-exclamation" : "fa-circle-check"}"></i><div><strong>${note}</strong><span>${missingEssential.length ? missingEssential.map((name) => ({ evaluationDate: "Fecha", evaluatorName: "Evaluador", evaluationBranch: "Sucursal", evaluationProduct: "Tipo de préstamo", debtorName: "Deudor", debtorId: "Cédula" })[name]).join(" · ") : pending.length ? `Puedes imprimir; conviene completar: ${pending.join(" · ")}.` : "Datos esenciales y documentos verificados."}</span></div></div>`;
  }

  function renderReview() {
    const operation = [["Tipo", value("evaluationProduct")], ["Producto", value("evaluationProductDetail")], ["Precio", `RD$${value("evaluationAmount")}`], ["Inicial", `RD$${value("evaluationInitial", "0")}`], ["Plazo", `${value("evaluationTerm")} meses`], ["Sucursal", value("evaluationBranch")]];
    document.querySelector("#evaluationReviewOperation").innerHTML = operation.map(([label, content]) => `<div><dt>${escape(label)}</dt><dd>${escape(content)}</dd></div>`).join("");
    const photoStatus = (source, present, absent) => source ? `<i class="fa-solid fa-circle-check"></i> ${present}` : `<i class="fa-solid fa-circle-xmark"></i> ${absent}`;
    document.querySelector("#evaluationReviewDocuments").innerHTML = `<article><b>Deudor</b><span>${escape(value("debtorName"))}</span><p class="${photos.debtor ? "is-ready" : "is-pending"}">${photoStatus(photos.debtor, "Cédula frontal cargada", "Falta foto de cédula")}</p></article>${hasCoDebtor.checked ? `<article><b>Codeudor</b><span>${escape(value("coDebtorName"))}</span><p class="${photos.coDebtor ? "is-ready" : "is-pending"}">${photoStatus(photos.coDebtor, "Cédula frontal cargada", "Falta foto de cédula")}</p></article>` : '<article><b>Codeudor</b><span>No aplica</span><p class="is-neutral"><i class="fa-solid fa-minus"></i> No tiene codeudor</p></article>'}`;
    renderReadiness();
    renderWorkflowStatus();
  }

  function availableWizardSteps() {
    return [1, 2, 3, 4];
  }

  function setWizardStep(step, { scroll = false } = {}) {
    const available = availableWizardSteps();
    wizardStep = available.includes(step) ? step : available.find((item) => item > step) || available.at(-1);
    const showingPeople = wizardStep === 2 || wizardStep === 3;
    const showingBureau = wizardStep === 2 || wizardStep === 3;
    evaluationMain.classList.toggle("is-person-credit-step", false);
    evaluationMain.classList.toggle("is-person-dossier-step", showingPeople);
    personDossier.hidden = !showingPeople;
    evaluationControlSection.hidden = wizardStep !== 1;
    evaluationPeopleSection.hidden = !showingPeople;
    debtorPersonCard.hidden = wizardStep !== 2;
    coDebtorPersonCard.hidden = wizardStep !== 3;
    evaluationBureauSection.hidden = !showingBureau || (wizardStep === 3 && !hasCoDebtor.checked);
    evaluationSide.hidden = true;
    reviewPanel.hidden = wizardStep !== 4;
    evaluationConsent.hidden = wizardStep !== 4;
    evaluationActionButtons.hidden = wizardStep !== 4;
    evaluationPeopleEyebrow.textContent = "Identidad · residencia · empleo";
    evaluationPeopleHeading.textContent = "Información personal y de campo";
    evaluationBureauEyebrow.textContent = "Deudas · cuotas · comportamiento";
    evaluationBureauHeading.textContent = "Perfil financiero y buró";
    const isCoDebtor = wizardStep === 3;
    personDossier.querySelector(".evaluation-person-dossier-step").textContent = isCoDebtor ? "03" : "02";
    personDossier.querySelector("#evaluationPersonDossierEyebrow").textContent = isCoDebtor ? "Persona adicional" : "Persona principal";
    personDossierTitle.textContent = isCoDebtor ? "Codeudor" : "Deudor principal";
    personDossierDescription.textContent = isCoDebtor ? "Completa los datos y el buró del codeudor en esta misma ficha." : "Completa los datos y el buró del deudor en esta misma ficha.";
    noCoDebtorControl.closest("label").hidden = !isCoDebtor;
    updateBureauVisibility();
    if (wizardStep === 4) renderReview();

    wizard?.querySelectorAll("button[data-evaluation-step]").forEach((button) => {
      const itemStep = Number(button.dataset.evaluationStep);
      button.classList.toggle("is-current", itemStep === wizardStep);
      button.classList.toggle("is-complete", available.includes(itemStep) && itemStep < wizardStep);
      button.disabled = false;
    });
    const previous = available[available.indexOf(wizardStep) - 1];
    const next = available[available.indexOf(wizardStep) + 1];
    const previousButton = wizardNavigation?.querySelector("[data-wizard-prev]");
    const nextButton = wizardNavigation?.querySelector("[data-wizard-next]");
    previousButton?.toggleAttribute("disabled", !previous);
    nextButton?.toggleAttribute("hidden", !next);
    if (nextButton && next) nextButton.innerHTML = 'Siguiente <i class="fa-solid fa-arrow-right"></i>';
    const stepLabel = wizard?.querySelector(`button[data-evaluation-step="${wizardStep}"]`)?.querySelector("span")?.textContent || "Ficha de evaluación";
    status.className = "application-status";
    status.textContent = `Paso ${wizardStep}: ${stepLabel}.`;
    if (scroll) evaluationLayout.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setupEvaluationWizard() {
    wizard = document.createElement("nav");
    wizard.className = "evaluation-wizard";
    wizard.setAttribute("aria-label", "Pasos de la ficha de evaluación");
    wizard.innerHTML = [[1, "Datos de evaluación", "fa-clipboard-list"], [2, "Deudor y buró", "fa-user"], [3, "Codeudor y buró", "fa-user-group"], [4, "Revisión e impresión", "fa-file-circle-check"]].map(([step, label, icon]) => `<button type="button" data-evaluation-step="${step}"><b>${step}</b><span><i class="fa-solid ${icon}"></i>${label}<small></small></span></button>`).join("");
    evaluationLayout.before(wizard);
    wizardNavigation = document.createElement("div");
    wizardNavigation.className = "evaluation-wizard-navigation";
    wizardNavigation.innerHTML = '<button type="button" class="quiet-btn" data-wizard-prev><i class="fa-solid fa-arrow-left"></i> Anterior</button><button type="button" class="primary-btn" data-wizard-next>Siguiente <i class="fa-solid fa-arrow-right"></i></button>';
    evaluationActions.prepend(wizardNavigation);
    wizard.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-evaluation-step]");
      if (button && !button.disabled) setWizardStep(Number(button.dataset.evaluationStep), { scroll: true });
    });
    wizardNavigation.addEventListener("click", (event) => {
      const available = availableWizardSteps();
      const currentIndex = available.indexOf(wizardStep);
      if (event.target.closest("[data-wizard-prev]") && currentIndex > 0) setWizardStep(available[currentIndex - 1], { scroll: true });
      if (event.target.closest("[data-wizard-next]") && currentIndex < available.length - 1) setWizardStep(available[currentIndex + 1], { scroll: true });
    });
  }

  function updateBureauVisibility() {
    const debtorHasNoHistory = value("debtorBureauStatus", "con-historial") === "sin-historial";
    const coDebtorHasNoHistory = value("coDebtorBureauStatus", "con-historial") === "sin-historial";
    const debtorStep = wizardStep === 2;
    const coDebtorStep = wizardStep === 3 && hasCoDebtor.checked;
    debtorBureauStatusWrap.hidden = !debtorStep;
    debtorBureauFields.hidden = !debtorStep || debtorHasNoHistory;
    debtorNoHistory.hidden = !debtorStep || !debtorHasNoHistory;
    coDebtorBureauStatusWrap.hidden = !coDebtorStep;
    coDebtorBureauFields.hidden = !coDebtorStep || coDebtorHasNoHistory;
    coDebtorNoHistory.hidden = !coDebtorStep || !coDebtorHasNoHistory;
  }

  function configureEssentialValidation() {
    form.querySelectorAll("[required]").forEach((field) => { field.required = essentialFields.includes(field.name); });
  }

  function normalizeMoney(raw) {
    const cleaned = String(raw ?? "").replace(/[^\d,.-]/g, "").replaceAll(",", "");
    const amount = Number(cleaned);
    return Number.isFinite(amount) ? amount : null;
  }

  function formatMoney(raw) {
    const amount = normalizeMoney(raw);
    return amount === null ? "" : new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  }

  function setupMoneyFormatting() {
    moneyFieldNames.forEach((name) => {
      const input = form.elements.namedItem(name);
      if (!input) return;
      input.type = "text";
      input.inputMode = "decimal";
      input.autocomplete = "off";
      input.addEventListener("focus", () => {
        const amount = normalizeMoney(input.value);
        if (amount !== null) input.value = String(amount);
      });
      input.addEventListener("blur", () => {
        if (String(input.value).trim()) input.value = formatMoney(input.value);
      });
    });
  }

  function configureWorkTime(inputName) {
    const input = form.elements.namedItem(inputName);
    const label = input?.closest("label");
    if (!input || !label || form.elements.namedItem(`${inputName}Unit`)) return;
    const unit = document.createElement("select");
    unit.name = `${inputName}Unit`;
    unit.className = "work-time-unit";
    unit.setAttribute("aria-label", `Unidad de ${inputName}`);
    unit.innerHTML = '<option value="años">Años</option><option value="meses">Meses</option>';
    const controls = document.createElement("span");
    controls.className = "work-time-controls";
    input.placeholder = "Ej. 2";
    input.remove();
    controls.append(input, unit);
    label.replaceChildren(document.createTextNode("Tiempo laborando"), controls);
  }

  function readPhoto(inputName, previewId, key) {
    const input = form.elements.namedItem(inputName);
    const preview = document.querySelector(previewId);
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        photos[key] = String(reader.result || "");
        preview.src = photos[key];
        preview.hidden = false;
      });
      reader.readAsDataURL(file);
    });
  }

  function renderList(target, rows) {
    document.querySelector(target).innerHTML = rows.map(([label, content]) => `<div><dt>${escape(label)}</dt><dd>${escape(content)}</dd></div>`).join("");
  }

  function setPrintPhoto(imageId, figureId, source) {
    const image = document.querySelector(imageId);
    const figure = document.querySelector(figureId);
    figure.hidden = !source;
    if (source) image.src = source;
  }

  function renderPersonData(prefix, detailsTarget, creditTarget) {
    const time = value(`${prefix}WorkTime`, "");
    renderList(detailsTarget, [
      ["Dirección residencial", value(`${prefix}HomeAddress`)],
      ["Referencia cercana 1", value(`${prefix}NearbyReference1`)],
      ["Referencia cercana 2", value(`${prefix}NearbyReference2`)],
      ["Lugar de trabajo / actividad", value(`${prefix}WorkCompany`)],
      ["Tiempo laborando", time ? `${time} ${value(`${prefix}WorkTimeUnit`, "años")}` : "—"],
      ["Ingresos mensuales", `RD$${value(`${prefix}WorkIncome`)}`]
    ]);
    const money = (name) => { const amount = value(name, ""); return amount ? `RD$${amount}` : "No indicado"; };
    const creditTargetElement = document.querySelector(creditTarget);
    if (value(`${prefix}BureauStatus`, "con-historial") === "sin-historial") {
      creditTargetElement.dataset.history = "empty";
      creditTargetElement.innerHTML = '<div class="evaluation-credit-empty"><dt>Resultado DataCrédito</dt><dd>SIN HISTORIAL</dd></div>';
      return;
    }
    creditTargetElement.dataset.history = "full";
    const overdue = [["30", "Late30"], ["60", "Late60"], ["90", "Late90"], ["120", "Late120"], ["150", "Late150"], ["Castigo", "WriteOff"]].map(([label, suffix]) => `<span><b>${label}</b><em>${escape(value(`${prefix}Bureau${suffix}`, "0"))}</em></span>`).join("");
    creditTargetElement.innerHTML = [["Deuda actual de préstamo", money(`${prefix}BureauLoanDebt`)], ["Cuota mensual que paga", money(`${prefix}BureauMonthlyPayment`)], ["Deuda actual de tarjetas", money(`${prefix}BureauCardDebt`)], ["Moras y castigos", overdue], ["Observaciones del buró", value(`${prefix}BureauNotes`)]].map(([label, content], index) => `<div${index === 3 ? ' class="evaluation-credit-moras"' : ""}><dt>${escape(label)}</dt><dd>${index === 3 ? content : escape(content)}</dd></div>`).join("");
  }

  function renderEvaluationPrint() {
    const dateValue = value("evaluationDate", "");
    const date = dateValue ? new Intl.DateTimeFormat("es-DO", { dateStyle: "long" }).format(new Date(`${dateValue}T00:00:00`)) : "—";
    reference ||= value("evaluationReference", `EVA-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}`);
    document.querySelector("#evaluationPrintReference").textContent = `${reference} · ${date}\nSucursal: ${value("evaluationBranch")}`;
    document.querySelector("#evaluationPrintCredit").innerHTML = [["Producto", value("evaluationProduct")], ["Detalle", value("evaluationProductDetail")], ["Precio", `RD$${value("evaluationAmount")}`], ["Inicial", `RD$${value("evaluationInitial", "0")}`], ["Plazo", `${value("evaluationTerm")} meses`]].map(([label, content]) => `<li><strong>${escape(label)}:</strong> ${escape(content)}</li>`).join("");
    document.querySelector("#evaluationPrintDebtorLocation").textContent = `${value("debtorName")}. Cédula: ${value("debtorId")}. Teléfono: ${value("debtorPhone")}.`;
    renderPersonData("debtor", "#evaluationPrintDebtorDetails", "#evaluationPrintDebtorCredit");
    document.querySelector("#evaluationPrintDebtorReport").hidden = true;
    setPrintPhoto("#evaluationPrintDebtorPhoto", "#evaluationPrintDebtorPhotoFigure", photos.debtor);
    const includeCoDebtor = hasCoDebtor.checked && Boolean(value("coDebtorName", ""));
    document.querySelector("#evaluationPrintCoDebtorSection").hidden = !includeCoDebtor;
    document.querySelector("#evaluationPrintCoDebtorLocation").textContent = includeCoDebtor ? `${value("coDebtorName")}. Cédula: ${value("coDebtorId")}. Teléfono: ${value("coDebtorPhone")}.` : "";
    if (includeCoDebtor) renderPersonData("coDebtor", "#evaluationPrintCoDebtorDetails", "#evaluationPrintCoDebtorCredit");
    document.querySelector("#evaluationPrintCoDebtorReport").hidden = true;
    setPrintPhoto("#evaluationPrintCoDebtorPhoto", "#evaluationPrintCoDebtorPhotoFigure", includeCoDebtor ? photos.coDebtor : "");
    document.querySelector("#evaluationPrintEvaluator").textContent = value("evaluatorName");
    document.querySelector("#evaluationPrintDebtor").textContent = "Aprobación";
    document.querySelector("#evaluationPrintCoDebtorSignature").hidden = true;
    document.querySelector("#evaluationPrintCoDebtor").textContent = "";
  }

  function printEvaluation() {
    const missing = essentialFields.filter((name) => !value(name, ""));
    if (missing.length) {
      const requiredStep = { evaluationDate: 1, evaluatorName: 1, evaluationBranch: 1, evaluationProduct: 1, debtorName: 2, debtorId: 2 }[missing[0]];
      setWizardStep(requiredStep);
      status.className = "application-status is-error";
      status.textContent = `Antes de imprimir completa: ${missing.map((name) => ({ evaluationDate: "fecha de visita", evaluatorName: "evaluador", evaluationBranch: "sucursal", evaluationProduct: "tipo de préstamo", debtorName: "nombre del deudor", debtorId: "cédula del deudor" })[name]).join(", ")}.`;
      const firstMissing = form.elements.namedItem(missing[0]);
      firstMissing?.focus({ preventScroll: true });
      firstMissing?.closest("fieldset, section")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    try {
      renderEvaluationPrint();
      status.className = "application-status is-success";
      status.textContent = "Ficha preparada. Abriendo impresión…";
      document.body.dataset.printTarget = "evaluation";
      window.print();
    } catch (error) {
      console.error("No se pudo preparar la impresión de la ficha", error);
      status.className = "application-status is-error";
      status.textContent = "No se pudo preparar la ficha para impresión. Revisa los datos e inténtalo de nuevo.";
    }
  }

  function setPhotoPreview(key, selector) {
    const preview = document.querySelector(selector);
    const source = photos[key];
    preview.hidden = !source;
    if (source) preview.src = source;
    else preview.removeAttribute("src");
  }

  function safeFileName(text) {
    return String(text || "ficha").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "ficha";
  }

  function evaluationFileData() {
    const fields = {};
    [...form.elements].forEach((field) => {
      if (!field.name || field.type === "file" || field.type === "submit" || field.type === "button") return;
      fields[field.name] = field.type === "checkbox" ? field.checked : field.value;
    });
    return {
      type: "cotizador-mym-ficha-evaluacion",
      version: 1,
      exportedAt: new Date().toISOString(),
      reference: reference || value("evaluationReference", ""),
      currentStep: wizardStep,
      fields,
      photos: { debtor: photos.debtor, coDebtor: photos.coDebtor }
    };
  }

  function downloadEvaluationFile() {
    const data = evaluationFileData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    const name = safeFileName(value("debtorName", "evaluacion"));
    const date = value("evaluationDate", new Date().toISOString().slice(0, 10));
    link.href = URL.createObjectURL(blob);
    link.download = `ficha-evaluacion-${name}-${date}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 0);
    status.className = "application-status is-success";
    status.textContent = "Ficha guardada. Conserva el archivo descargado para cargarlo después.";
  }

  function restoreEvaluationFile(data) {
    if (!data || data.type !== "cotizador-mym-ficha-evaluacion" || !data.fields || typeof data.fields !== "object") throw new Error("Archivo no reconocido");
    form.reset();
    const fields = data.fields;
    hasCoDebtor.checked = fields.hasCoDebtor !== false;
    setCoDebtorVisibility();
    Object.entries(fields).forEach(([name, savedValue]) => {
      const field = form.elements.namedItem(name);
      if (!field || field.type === "file") return;
      if (field.type === "checkbox") field.checked = Boolean(savedValue);
      else field.value = String(savedValue ?? "");
    });
    hasCoDebtor.checked = fields.hasCoDebtor !== false;
    reference = String(data.reference || "");
    photos.debtor = String(data.photos?.debtor || "");
    photos.coDebtor = String(data.photos?.coDebtor || "");
    setPhotoPreview("debtor", "#debtorIdPreview");
    setPhotoPreview("coDebtor", "#coDebtorIdPreview");
    setCoDebtorVisibility();
    updateBureauVisibility();
    setWizardStep(Math.min(Math.max(Number(data.currentStep) || 1, 1), 4));
    renderWorkflowStatus();
    status.className = "application-status is-success";
    status.textContent = "Ficha cargada correctamente. Revisa los datos y continúa la evaluación.";
  }

  function setupEvaluationFileTransfer() {
    const controls = document.createElement("div");
    controls.className = "evaluation-file-transfer";
    controls.innerHTML = '<div><i class="fa-solid fa-folder-open"></i><span><b>Archivo de ficha</b><small>Guarda o recupera esta evaluación sin conexión.</small></span></div><p><button class="quiet-btn" type="button" data-evaluation-download><i class="fa-solid fa-download"></i> Guardar ficha</button><button class="quiet-btn" type="button" data-evaluation-upload><i class="fa-solid fa-upload"></i> Cargar ficha</button><input type="file" accept=".json,application/json" data-evaluation-file hidden></p>';
    evaluationActions.prepend(controls);
    controls.querySelector("[data-evaluation-download]").addEventListener("click", downloadEvaluationFile);
    controls.querySelector("[data-evaluation-upload]").addEventListener("click", () => controls.querySelector("[data-evaluation-file]").click());
    controls.querySelector("[data-evaluation-file]").addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const content = await file.text();
        restoreEvaluationFile(JSON.parse(content));
      } catch (error) {
        console.error("No se pudo cargar la ficha", error);
        status.className = "application-status is-error";
        status.textContent = "No se pudo cargar el archivo. Selecciona una ficha descargada desde este cotizador.";
      } finally {
        event.target.value = "";
      }
    });
  }

  function clearEvaluation() {
    form.reset();
    hasCoDebtor.checked = true;
    reference = "";
    photos.debtor = "";
    photos.coDebtor = "";
    ["#debtorIdPreview", "#coDebtorIdPreview"].forEach((selector) => { const image = document.querySelector(selector); image.removeAttribute("src"); image.hidden = true; });
    form.elements.namedItem("evaluationDate").value = new Date().toISOString().slice(0, 10);
    form.elements.namedItem("evaluationReference").value = fieldReference();
    configureEssentialValidation();
    setCoDebtorVisibility();
    setWizardStep(1);
    status.className = "application-status";
    status.textContent = "Ficha limpia. Los datos y las fotos no se guardan en el navegador.";
  }

  readPhoto("debtorIdPhoto", "#debtorIdPreview", "debtor");
  readPhoto("coDebtorIdPhoto", "#coDebtorIdPreview", "coDebtor");
  configureWorkTime("debtorWorkTime");
  configureWorkTime("coDebtorWorkTime");
  setupMoneyFormatting();
  evaluationOutcome.hidden = true;
  printOutcome.hidden = true;
  setupPersonDossier();
  setupOperationSummary();
  setupPaymentCapacity();
  setupQuickFill();
  setupReviewPanel();
  setupEvaluationWizard();
  setupEvaluationFileTransfer();
  hasCoDebtor.addEventListener("change", setCoDebtorVisibility);
  form.elements.namedItem("debtorBureauStatus").addEventListener("change", updateBureauVisibility);
  form.elements.namedItem("coDebtorBureauStatus").addEventListener("change", updateBureauVisibility);
  form.elements.namedItem("evaluationDate").addEventListener("change", () => {
    reference = "";
    form.elements.namedItem("evaluationReference").value = fieldReference();
  });
  form.addEventListener("input", renderWorkflowStatus);
  form.addEventListener("change", () => {
    renderWorkflowStatus();
    if (wizardStep === 4) renderReview();
  });
  printButton.addEventListener("click", printEvaluation);
  clearButton.addEventListener("click", clearEvaluation);
  form.addEventListener("submit", (event) => event.preventDefault());
  form.elements.namedItem("evaluationDate").value = new Date().toISOString().slice(0, 10);
  form.elements.namedItem("evaluationReference").value = fieldReference();
  hasCoDebtor.checked = true;
  configureEssentialValidation();
  setCoDebtorVisibility();
  setWizardStep(1);
  renderWorkflowStatus();
})();

// Constancia temporal de entrega de placa y matrícula para motocicletas.
(() => {
  const form = document.querySelector("#deliveryForm");
  if (!form) return;

  const documentOptions = document.querySelector("#deliveryDocumentOptions");
  const selectionNote = document.querySelector("#deliverySelectionNote");
  const status = document.querySelector("#deliveryStatus");
  const printButton = document.querySelector("#printDeliveryBtn");
  const clearButton = document.querySelector("#clearDeliveryBtn");
  const plate = form.elements.namedItem("deliveryPlate");
  const registration = form.elements.namedItem("deliveryRegistration");
  const plateNumber = form.elements.namedItem("deliveryPlateNumber");
  const registrationNumber = form.elements.namedItem("deliveryRegistrationNumber");
  const thirdParty = form.elements.namedItem("deliveryThirdParty");
  const thirdPartyFields = document.querySelector("#deliveryThirdPartyFields");
  const otherLocationField = document.querySelector("#deliveryOtherLocationField");
  const branch = form.elements.namedItem("deliveryBranch");
  let reference = "";
  const value = (name, fallback = "—") => String(form.elements.namedItem(name)?.value || "").trim() || fallback;
  const escape = (text) => String(text ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

  function deliveredItems() {
    return [plate.checked && "Placa", registration.checked && "Matrícula"].filter(Boolean);
  }

  function updateDeliveredDocuments() {
    const selected = deliveredItems();
    plate.setCustomValidity(selected.length ? "" : "Selecciona al menos un documento a entregar.");
    documentOptions.querySelectorAll("label").forEach((label) => {
      label.classList.toggle("is-selected", label.querySelector("input").checked);
    });
    selectionNote.textContent = selected.length ? `Se entregará: ${selected.join(" y ")}.` : "Selecciona placa, matrícula o ambos.";
  }

  function updateReceiverFields() {
    const isThirdParty = thirdParty.checked;
    thirdPartyFields.hidden = !isThirdParty;
    ["deliveryReceiverName", "deliveryReceiverId", "deliveryReceiverPhone", "deliveryReceiverRelation"].forEach((name) => {
      form.elements.namedItem(name).required = isThirdParty;
    });
  }

  function updateLocationField() {
    const isOther = branch.value === "Otro";
    otherLocationField.hidden = !isOther;
    form.elements.namedItem("deliveryOtherLocation").required = isOther;
  }

  function receiver() {
    return thirdParty.checked ? { name: value("deliveryReceiverName"), id: value("deliveryReceiverId"), phone: value("deliveryReceiverPhone"), relation: value("deliveryReceiverRelation"), type: "Tercero autorizado" } : { name: value("deliveryClientName"), id: value("deliveryClientId"), phone: value("deliveryClientPhone"), relation: "Titular de la motocicleta", type: "Mismo cliente" };
  }

  function deliveryLocation() { return branch.value === "Otro" ? value("deliveryOtherLocation") : value("deliveryBranch"); }

  function renderPrintList(target, rows) {
    document.querySelector(target).innerHTML = rows.map(([label, content]) => `<div><dt>${escape(label)}</dt><dd>${escape(content)}</dd></div>`).join("");
  }

  function renderDeliveryPrint() {
    const items = deliveredItems();
    const receivedBy = receiver();
    const dateValue = value("deliveryDate", "");
    const date = dateValue ? new Intl.DateTimeFormat("es-DO", { dateStyle: "long" }).format(new Date(`${dateValue}T00:00:00`)) : "—";
    reference ||= `ENT-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${String(Date.now()).slice(-4)}`;
    const motorcycle = `${value("deliveryMotorcycleBrand", "")} ${value("deliveryMotorcycleModel", "")}`.trim();
    const receiverContext = thirdParty.checked ? `en calidad de tercero autorizado por el cliente ${value("deliveryClientName")}` : "en calidad de cliente titular";
    const receivedDocuments = [
      plate.checked && `Placa original (No. ${value("deliveryPlateNumber")})`,
      registration.checked && `Matrícula original (No. ${value("deliveryRegistrationNumber")})`
    ].filter(Boolean);
    document.querySelector("#deliveryPrintReference").textContent = `Ref. ${reference}`;
    document.querySelector("#deliveryPrintIntro").innerHTML = `Yo, <strong>${escape(receivedBy.name)}</strong>, portador(a) de la cédula de identidad y electoral No. <strong>${escape(receivedBy.id)}</strong>, ${escape(receiverContext)}, mediante el presente documento <strong><em>hago constar y dejo constancia expresa</em></strong> de que he recibido de manera voluntaria, en original y en buen estado, los siguientes documentos entregados por <strong>M&M Inversiones / VegaMotors</strong>.`;
    document.querySelector("#deliveryPrintItems").innerHTML = receivedDocuments.map((document, index) => `<li>${index + 1}. ${escape(document)}</li>`).join("");
    document.querySelector("#deliveryPrintVehicle").innerHTML = `Los documentos corresponden a la motocicleta <strong>${escape(motorcycle)}</strong>, año <strong>${escape(value("deliveryMotorcycleYear"))}</strong>, color <strong>${escape(value("deliveryMotorcycleColor"))}</strong>.`;
    document.querySelector("#deliveryPrintDeclaration").textContent = "Declaro que dichos documentos han sido recibidos a mi entera satisfacción y que no tengo reclamación alguna al respecto. Me comprometo a conservarlos y utilizarlos conforme a su naturaleza y fines.";
    document.querySelector("#deliveryPrintClosing").innerHTML = `En <strong>${escape(deliveryLocation())}</strong>, República Dominicana, a los <strong>${escape(date)}</strong>.`;
    document.querySelector("#deliveryPrintReceiver").textContent = receivedBy.name;
    document.querySelector("#deliveryPrintReceiverId").textContent = receivedBy.id;
    document.querySelector("#deliveryPrintStaff").textContent = value("deliveryStaffName");
    document.querySelector("#deliveryPrintLocation").textContent = deliveryLocation();
  }

  function printDelivery() {
    updateDeliveredDocuments();
    if (!form.checkValidity()) {
      form.reportValidity();
      status.className = "application-status is-error";
      status.textContent = "Completa los datos requeridos y selecciona el documento entregado antes de imprimir.";
      return;
    }
    renderDeliveryPrint();
    status.className = "application-status is-success";
    status.textContent = "Constancia preparada. Puedes imprimirla o guardarla como PDF.";
    document.body.dataset.printTarget = "delivery";
    window.print();
  }

  function clearDelivery() {
    form.reset();
    reference = "";
    form.elements.namedItem("deliveryDate").value = new Date().toISOString().slice(0, 10);
    updateDeliveredDocuments();
    updateReceiverFields();
    updateLocationField();
    status.className = "application-status";
    status.textContent = "Formulario limpio. Los datos no se guardan en este navegador.";
  }

  documentOptions.addEventListener("change", updateDeliveredDocuments);
  thirdParty.addEventListener("change", updateReceiverFields);
  branch.addEventListener("change", updateLocationField);
  form.addEventListener("submit", (event) => event.preventDefault());
  printButton.addEventListener("click", printDelivery);
  clearButton.addEventListener("click", clearDelivery);
  form.elements.namedItem("deliveryDate").value = new Date().toISOString().slice(0, 10);
  updateDeliveredDocuments();
  updateReceiverFields();
  updateLocationField();
})();

// Ficha temporal de cobro: la información se prepara antes de salir y el resultado se llena en papel.
(() => {
  const form = document.querySelector("#collectionForm");
  if (!form) return;
  const status = document.querySelector("#collectionStatus");
  const printButton = document.querySelector("#printCollectionBtn");
  const clearButton = document.querySelector("#clearCollectionBtn");
  const required = ["collectionDate", "collectionAgent", "collectionBranch", "collectionClientName", "collectionClientId", "collectionLoanNumber", "collectionArrears", "collectionTotalDebt"];
  const moneyFields = ["collectionArrears", "collectionTotalDebt", "collectionLastPaymentAmount"];
  const value = (name, fallback = "—") => String(form.elements.namedItem(name)?.value || "").trim() || fallback;
  const escape = (text) => String(text ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  const cleanMoney = (raw) => Number(String(raw ?? "").replace(/[^\d,.-]/g, "").replaceAll(",", ""));
  const money = (raw, fallback = "—") => {
    const amount = cleanMoney(raw);
    return Number.isFinite(amount) && String(raw).trim() ? `RD$ ${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}` : fallback;
  };
  const fieldLabel = { collectionDate: "fecha de visita", collectionAgent: "gestor de cobro", collectionBranch: "sucursal", collectionClientName: "nombre del cliente", collectionClientId: "cédula", collectionLoanNumber: "número de préstamo", collectionArrears: "total en atraso", collectionTotalDebt: "total de la deuda" };
  const photos = { id: "", location: "" };

  function setupCollectionExtensions() {
    const note = form.querySelector(".collection-field-note");
    const evidence = document.createElement("section");
    evidence.className = "collection-section collection-evidence-section";
    evidence.innerHTML = '<div class="collection-section-heading"><span>03</span><div><p>Evidencia previa</p><h3>Fotos para anexar a la visita</h3></div></div><p class="collection-evidence-note"><i class="fa-solid fa-pen-to-square"></i> La persona que atendió, relación, seguimiento y condición pre-legal se completan manualmente en la ficha impresa durante la visita.</p><div class="collection-upload-grid"><section class="collection-upload"><div><i class="fa-regular fa-id-card"></i><h3>Cédula frontal</h3></div><label class="upload-drop"><input name="collectionIdPhoto" type="file" accept="image/*"><img id="collectionIdPreview" alt="Vista previa de cédula" hidden><span><i class="fa-solid fa-cloud-arrow-up"></i><b>Anexar foto de cédula</b><small>JPG, PNG o WEBP</small></span></label></section><section class="collection-upload"><div><i class="fa-solid fa-location-dot"></i><h3>Cliente o ubicación</h3></div><label class="upload-drop"><input name="collectionLocationPhoto" type="file" accept="image/*"><img id="collectionLocationPreview" alt="Vista previa de cliente o ubicación" hidden><span><i class="fa-solid fa-camera"></i><b>Anexar foto de ubicación</b><small>Cliente, fachada o referencia</small></span></label></section></div></section>';
    note.before(evidence);
    const printTitle = document.querySelector(".collection-print-title");
    const badge = document.createElement("b");
    badge.className = "collection-prelegal-badge";
    badge.id = "collectionPrintPreLegal";
    badge.textContent = "☐ EXPEDIENTE DE PRE-LEGAL";
    printTitle.append(badge);
    const printClient = document.querySelector(".collection-print-client");
    const printEvidence = document.createElement("section");
    printEvidence.className = "collection-print-evidence";
    printEvidence.id = "collectionPrintEvidence";
    printEvidence.hidden = true;
    printEvidence.innerHTML = '<h2>Evidencia anexada</h2><div><figure id="collectionPrintIdFigure" hidden><img id="collectionPrintIdPhoto" alt="Cédula anexada"><figcaption>Cédula frontal</figcaption></figure><figure id="collectionPrintLocationFigure" hidden><img id="collectionPrintLocationPhoto" alt="Cliente o ubicación anexada"><figcaption>Cliente / ubicación</figcaption></figure></div>';
    printClient.after(printEvidence);
    const printManual = document.querySelector(".collection-print-manual");
    printManual.insertAdjacentHTML("beforeend", '<p class="collection-print-manual-visit"><b>Persona que atendió / relación:</b><span></span><b>Próximo seguimiento / horario:</b><span></span></p>');
    const printPromise = document.createElement("section");
    printPromise.className = "collection-print-promise";
    printPromise.innerHTML = '<h2>Promesa de pago acordada <small>Completar manualmente</small></h2><p class="collection-print-promise-lines"><b>Monto prometido:</b><span></span><b>Fecha comprometida:</b><span></span></p><p class="collection-print-promise-lines"><b>Medio / referencia:</b><span></span></p><p class="collection-print-declaration">Declaro que la promesa de pago indicada fue acordada durante esta visita.</p><div><span><small>Firma del cliente</small></span><span><small>Firma del gestor de cobro</small></span></div>';
    printManual.before(printPromise);
  }

  function readCollectionPhoto(inputName, previewId, key) {
    const input = form.elements.namedItem(inputName);
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        photos[key] = String(reader.result || "");
        const preview = document.querySelector(previewId);
        preview.src = photos[key];
        preview.hidden = false;
      });
      reader.readAsDataURL(file);
    });
  }

  function reference() {
    const date = value("collectionDate", new Date().toISOString().slice(0, 10)).replaceAll("-", "");
    return `COB-${date}`;
  }

  function syncReference() {
    form.elements.namedItem("collectionReference").value = reference();
  }

  function setupMoney() {
    moneyFields.forEach((name) => {
      const input = form.elements.namedItem(name);
      input.type = "text";
      input.inputMode = "decimal";
      input.addEventListener("focus", () => { const amount = cleanMoney(input.value); if (Number.isFinite(amount)) input.value = String(amount); });
      input.addEventListener("blur", () => { if (input.value.trim()) input.value = money(input.value, "").replace("RD$ ", ""); });
    });
  }

  function renderPrint() {
    const dateValue = value("collectionDate", "");
    const date = dateValue ? new Intl.DateTimeFormat("es-DO", { dateStyle: "long" }).format(new Date(`${dateValue}T00:00:00`)) : "—";
    document.querySelector("#collectionPrintReference").textContent = `${reference()} · ${date}\nSucursal: ${value("collectionBranch")}`;
    const rows = [["Cliente", value("collectionClientName")], ["Cédula", value("collectionClientId")], ["Teléfono", value("collectionClientPhone")], ["Número de préstamo", value("collectionLoanNumber")], ["Total en atraso", money(value("collectionArrears", ""))], ["Deuda total", money(value("collectionTotalDebt", ""))], ["Cuotas vencidas", value("collectionOverdueInstallments")], ["Último pago", `${value("collectionLastPaymentDate")} · ${money(value("collectionLastPaymentAmount", ""), "No indicado")}`], ["Dirección para visita", value("collectionAddress")], ["Referencia de ubicación", value("collectionLocationReference")]].map(([label, content]) => `<div><dt>${escape(label)}</dt><dd>${escape(content)}</dd></div>`).join("");
    document.querySelector("#collectionPrintClient").innerHTML = rows;
    document.querySelector("#collectionPrintAgent").textContent = value("collectionAgent");
    const evidence = document.querySelector("#collectionPrintEvidence");
    evidence.hidden = !photos.id && !photos.location;
    [["id", "#collectionPrintIdFigure", "#collectionPrintIdPhoto"], ["location", "#collectionPrintLocationFigure", "#collectionPrintLocationPhoto"]].forEach(([key, figureSelector, imageSelector]) => {
      const figure = document.querySelector(figureSelector);
      const image = document.querySelector(imageSelector);
      figure.hidden = !photos[key];
      if (photos[key]) image.src = photos[key];
    });
  }

  function printCollection() {
    const missing = required.filter((name) => !value(name, ""));
    if (missing.length) {
      status.className = "application-status is-error";
      status.textContent = `Antes de imprimir completa: ${missing.map((name) => fieldLabel[name]).join(", ")}.`;
      form.elements.namedItem(missing[0])?.focus();
      return;
    }
    renderPrint();
    status.className = "application-status is-success";
    status.textContent = "Ficha preparada. Marca el resultado y escribe las observaciones manualmente durante la visita.";
    document.body.dataset.printTarget = "collection";
    window.print();
  }

  function clearCollection() {
    form.reset();
    photos.id = "";
    photos.location = "";
    ["#collectionIdPreview", "#collectionLocationPreview"].forEach((selector) => { const image = document.querySelector(selector); image.removeAttribute("src"); image.hidden = true; });
    form.elements.namedItem("collectionDate").value = new Date().toISOString().slice(0, 10);
    syncReference();
    status.className = "application-status";
    status.textContent = "Ficha limpia. Los datos no se guardan en el navegador.";
  }

  setupCollectionExtensions();
  setupMoney();
  readCollectionPhoto("collectionIdPhoto", "#collectionIdPreview", "id");
  readCollectionPhoto("collectionLocationPhoto", "#collectionLocationPreview", "location");
  form.elements.namedItem("collectionDate").value = new Date().toISOString().slice(0, 10);
  syncReference();
  form.elements.namedItem("collectionDate").addEventListener("change", syncReference);
  form.addEventListener("submit", (event) => event.preventDefault());
  printButton.addEventListener("click", printCollection);
  clearButton.addEventListener("click", clearCollection);
})();

// Pre-solicitud: filtro comercial rápido antes de iniciar la solicitud completa.
(() => {
  const form = document.querySelector("#preApplicationForm");
  if (!form) return;
  const decisionSection = form.querySelector(".preapplication-decision");
  decisionSection.innerHTML = '<div class="preapplication-heading"><span>04</span><div><p>Revisión gerencial</p><h3>Decisión manual en la ficha impresa</h3></div></div><p class="preapplication-manager-note"><i class="fa-solid fa-clipboard-check"></i> El gerente marcará manualmente “Proceder”, “Proceder bajo condiciones” o “Rechazar” y anotará sus condiciones en la hoja impresa.</p><div class="preapplication-actions"><button class="quiet-btn" id="clearPreApplicationBtn" type="button"><i class="fa-solid fa-eraser"></i> Limpiar</button><button class="primary-btn" id="printPreApplicationBtn" type="button"><i class="fa-solid fa-print"></i> Imprimir pre-solicitud</button></div><p class="application-status" id="preApplicationStatus" aria-live="polite">Completa los datos esenciales para preparar la pre-solicitud.</p>';
  const status = document.querySelector("#preApplicationStatus");
  const printButton = document.querySelector("#printPreApplicationBtn");
  const clearButton = document.querySelector("#clearPreApplicationBtn");
  const capacity = document.querySelector("#preCapacity");
  const paymentLabel = form.elements.namedItem("prePayment").closest("label");
  const rateLabel = document.createElement("label");
  rateLabel.innerHTML = 'Tasa de interés mensual <span class="currency-input rate-input"><input name="preRate" type="number" min="0" step="0.01" required placeholder="Ej. 3.00"><b>%</b></span>';
  paymentLabel.before(rateLabel);
  paymentLabel.innerHTML = 'Cuota calculada <span class="currency-input"><b>RD$</b><input name="prePayment" type="text" readonly placeholder="Completa tasa y plazo"></span>';
  const loanType = form.elements.namedItem("preLoanType");
  const loanPlans = {
    "Préstamo personal": { rate: 5, term: 24, text: "Consumo personal · referencia editable" },
    "Préstamo comercial": { rate: 4, term: 36, text: "Capital de trabajo o negocio · referencia editable" },
    "Garantía de vehículo": { rate: 3, term: 36, text: "Crédito con garantía vehicular · referencia editable" },
    "Hipotecario": { rate: 1.5, term: 120, text: "Crédito hipotecario · referencia editable" },
    "Compra de motocicleta": { rate: 3.5, term: 36, text: "Financiamiento de motocicleta · referencia editable" },
    "Compra de smartphone": { rate: 5, term: 12, text: "Financiamiento de smartphone · referencia editable" },
    "Compra de electrodoméstico": { rate: 4, term: 18, text: "Financiamiento de electrodoméstico · referencia editable" }
  };
  loanType.innerHTML = '<option value="">Selecciona el tipo</option>' + Object.keys(loanPlans).map((name) => `<option>${name}</option>`).join("");
  const planNote = document.createElement("p");
  planNote.className = "preapplication-plan-note";
  planNote.innerHTML = '<i class="fa-solid fa-sliders"></i><span>Selecciona un tipo de crédito para proponer la tasa y el plazo de referencia.</span>';
  form.querySelector(".preapplication-finance-grid").before(planNote);
  const required = ["preDate", "preAdvisor", "preBranch", "preClientName", "preClientId", "preAddress", "preReference1", "preReference2", "preWork", "preIncome", "preLoanType", "preProduct", "preAmount", "preRate", "preTerm"];
  const moneyFields = ["preIncome", "preAmount", "preInitial", "prePayment"];
  let photo = "";
  const value = (name, fallback = "—") => String(form.elements.namedItem(name)?.value || "").trim() || fallback;
  const escape = (text) => String(text ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  const amount = (raw) => Number(String(raw ?? "").replace(/[^\d,.-]/g, "").replaceAll(",", ""));
  const peso = (raw, fallback = "—") => Number.isFinite(amount(raw)) && String(raw).trim() ? `RD$ ${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount(raw))}` : fallback;
  const labels = { preDate: "fecha", preAdvisor: "colaborador", preBranch: "sucursal", preClientName: "nombre", preClientId: "cédula", preAddress: "dirección", preReference1: "referencia 1", preReference2: "referencia 2", preWork: "trabajo", preIncome: "ingresos", preLoanType: "tipo de préstamo", preProduct: "qué desea", preAmount: "monto solicitado", preRate: "tasa de interés mensual", preTerm: "plazo", preIdPhoto: "foto de cédula" };

  function reference() { return `PRE-${value("preDate", new Date().toISOString().slice(0, 10)).replaceAll("-", "")}`; }
  function syncReference() { form.elements.namedItem("preReference").value = reference(); }
  function applyLoanPlan() {
    const plan = loanPlans[value("preLoanType", "")];
    if (!plan) {
      planNote.innerHTML = '<i class="fa-solid fa-sliders"></i><span>Selecciona un tipo de crédito para proponer la tasa y el plazo de referencia.</span>';
      updateCapacity();
      return;
    }
    form.elements.namedItem("preRate").value = plan.rate;
    form.elements.namedItem("preTerm").value = plan.term;
    planNote.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i><span><b>${escape(value("preLoanType"))}:</b> ${escape(plan.text)} · tasa ${plan.rate}% mensual · plazo ${plan.term} meses.</span>`;
    updateCapacity();
  }
  function setupMoney() {
    moneyFields.forEach((name) => {
      const input = form.elements.namedItem(name);
      input.type = "text";
      input.inputMode = "decimal";
      if (input.readOnly) return;
      input.addEventListener("focus", () => { const numeric = amount(input.value); if (Number.isFinite(numeric)) input.value = String(numeric); });
      input.addEventListener("blur", () => { if (input.value.trim()) input.value = peso(input.value, "").replace("RD$ ", ""); });
    });
  }
  function financing() {
    const requested = amount(value("preAmount", ""));
    const initial = amount(value("preInitial", "")) || 0;
    const rate = Number(value("preRate", "").replace(",", "."));
    const term = Number(value("preTerm", ""));
    const capital = Math.max(requested - initial, 0);
    if (!requested || !Number.isFinite(rate) || rate < 0 || !term || term < 1) {
      form.elements.namedItem("prePayment").value = "";
      return { capital: 0, interest: 0, total: 0, payment: 0, rate: 0, term: 0, ready: false };
    }
    const interest = capital * (rate / 100) * term;
    const total = capital + interest;
    const payment = total / term;
    form.elements.namedItem("prePayment").value = peso(payment, "").replace("RD$ ", "");
    return { capital, interest, total, payment, rate, term, ready: true };
  }
  function updateCapacity() {
    const income = amount(value("preIncome", ""));
    const calculation = financing();
    const payment = calculation.payment;
    if (!income || !calculation.ready) {
      capacity.dataset.level = "empty";
      capacity.innerHTML = '<div><i class="fa-solid fa-gauge-high"></i><span>Capacidad automática</span></div><strong>Completa monto, inicial, tasa, plazo e ingresos</strong><small>Interés simple: capital × tasa mensual × plazo. La capacidad recomendada equivale al 35% de los ingresos mensuales.</small>';
      return;
    }
    const limit = income * .35;
    const percentage = Math.round((payment / income) * 100);
    const state = percentage <= 35 ? "within" : percentage <= 45 ? "review" : "exceeds";
    const label = state === "within" ? "Dentro de capacidad" : state === "review" ? "Revisar cuota" : "Excede capacidad";
    capacity.dataset.level = state;
    capacity.innerHTML = `<div><i class="fa-solid fa-gauge-high"></i><span>Capacidad automática</span><b>${percentage}%</b></div><strong>${label}</strong><dl><div><dt>Capital financiado</dt><dd>${peso(calculation.capital)}</dd></div><div><dt>Interés simple</dt><dd>${peso(calculation.interest)}</dd></div><div><dt>Total a pagar</dt><dd>${peso(calculation.total)}</dd></div><div><dt>Cuota calculada</dt><dd>${peso(payment)}</dd></div><div><dt>Capacidad (35%)</dt><dd>${peso(limit)}</dd></div><div><dt>Disponible</dt><dd>${peso(Math.max(limit - payment, 0))}</dd></div></dl>`;
  }
  function readPhoto() {
    form.elements.namedItem("preIdPhoto").addEventListener("change", () => {
      const file = form.elements.namedItem("preIdPhoto").files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.addEventListener("load", () => { photo = String(reader.result || ""); const preview = document.querySelector("#preIdPreview"); preview.src = photo; preview.hidden = false; });
      reader.readAsDataURL(file);
    });
  }
  function renderPrint() {
    const dateValue = value("preDate", "");
    const date = dateValue ? new Intl.DateTimeFormat("es-DO", { dateStyle: "long" }).format(new Date(`${dateValue}T00:00:00`)) : "—";
    document.querySelector("#prePrintReference").textContent = `${reference()} · ${date}\nSucursal: ${value("preBranch")}`;
    const client = [["Nombre", value("preClientName")], ["Cédula", value("preClientId")], ["Teléfono", value("preClientPhone")], ["Dirección", value("preAddress")], ["Referencia 1", value("preReference1")], ["Referencia 2", value("preReference2")], ["Trabajo / actividad", value("preWork")], ["Ingresos mensuales", peso(value("preIncome", ""))]].map(([label, content]) => `<div><dt>${escape(label)}</dt><dd>${escape(content)}</dd></div>`).join("");
    document.querySelector("#prePrintClient").innerHTML = client;
    const income = amount(value("preIncome", "")); const calculation = financing(); const payment = calculation.payment; const percent = income && payment ? `${Math.round((payment / income) * 100)}% de ingresos` : "—";
    const finance = [["Tipo", value("preLoanType")], ["Producto", value("preProduct")], ["Monto solicitado", peso(value("preAmount", ""))], ["Inicial", peso(value("preInitial", ""), "No indicado")], ["Capital financiado", peso(calculation.capital)], ["Tasa mensual", calculation.ready ? `${calculation.rate}%` : "—"], ["Plazo", calculation.ready ? `${calculation.term} meses` : "—"], ["Interés simple", peso(calculation.interest)], ["Total a pagar", peso(calculation.total)], ["Cuota calculada", peso(payment)], ["Capacidad (35%)", peso(income * .35)], ["Relación cuota / ingreso", percent]].map(([label, content]) => `<div><dt>${escape(label)}</dt><dd>${escape(content)}</dd></div>`).join("");
    document.querySelector("#prePrintFinance").innerHTML = finance;
    document.querySelector(".preapplication-print-decision").innerHTML = '<h2>Decisión del gerente <small>Marcar manualmente</small></h2><div class="preapplication-print-checklist"><span>☐ Proceder</span><span>☐ Proceder bajo condiciones</span><span>☐ Rechazar</span></div><p class="preapplication-print-conditions"><b>Condiciones, modificaciones o motivo:</b><span></span><span></span></p>';
    document.querySelector("#prePrintAdvisor").textContent = value("preAdvisor");
    const figure = document.querySelector("#prePrintPhotoFigure"); figure.hidden = !photo; if (photo) document.querySelector("#prePrintPhoto").src = photo;
  }
  function printPreApplication() {
    const missing = required.filter((name) => !value(name, ""));
    if (!photo) missing.push("preIdPhoto");
    if (missing.length) { status.className = "application-status is-error"; status.textContent = `Antes de imprimir completa: ${missing.map((name) => labels[name]).join(", ")}.`; const first = form.elements.namedItem(missing[0]); (first instanceof RadioNodeList ? first[0] : first)?.focus(); return; }
    renderPrint(); status.className = "application-status is-success"; status.textContent = "Pre-solicitud preparada para impresión."; document.body.dataset.printTarget = "preapplication"; window.print();
  }
  function clearPreApplication() { form.reset(); photo = ""; const preview = document.querySelector("#preIdPreview"); preview.removeAttribute("src"); preview.hidden = true; form.elements.namedItem("preDate").value = new Date().toISOString().slice(0, 10); syncReference(); applyLoanPlan(); updateCapacity(); status.className = "application-status"; status.textContent = "Pre-solicitud limpia. Los datos no se guardan en el navegador."; }
  setupMoney(); readPhoto(); form.elements.namedItem("preDate").value = new Date().toISOString().slice(0, 10); syncReference(); updateCapacity(); form.elements.namedItem("preDate").addEventListener("change", syncReference); loanType.addEventListener("change", applyLoanPlan); form.addEventListener("input", updateCapacity); form.addEventListener("submit", (event) => event.preventDefault()); printButton.addEventListener("click", printPreApplication); clearButton.addEventListener("click", clearPreApplication);
})();
