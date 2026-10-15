(() => {
  "use strict";

  const dialog = document.querySelector("#privatePromissoryDialog");
  const launch = document.querySelector("#openPrivatePromissoryBtn");
  const close = document.querySelector("#closePrivatePromissoryBtn");
  const generate = document.querySelector("#generatePrivatePromissoryBtn");
  const print = document.querySelector("#printPrivatePromissoryBtn");
  const form = document.querySelector("#privatePromissorySettings");
  const validation = document.querySelector("#privatePromissoryValidation");
  const report = document.querySelector("#privatePromissoryReport");
  const empty = document.querySelector("#privatePromissoryEmpty");
  if (!dialog || !launch || !form || !report) return;

  const STORAGE_KEY = "mym-private-promissory-creditor-v1";
  const escape = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const money = (value) => `RD$${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0)}`;
  const dateISO = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };
  const formatDate = (raw) => raw ? new Intl.DateTimeFormat("es-DO", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${raw}T00:00:00Z`)) : "—";
  const upper = (value) => escape(String(value || "").toLocaleUpperCase("es-DO"));

  const UNITS = ["CERO", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE", "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
  const TENS = ["", "", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  const HUNDREDS = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];
  const SPECIAL_TWENTIES = { 21: "VEINTIUNO", 22: "VEINTIDÓS", 23: "VEINTITRÉS", 26: "VEINTISÉIS" };
  const under100 = (n) => n < 20 ? UNITS[n] : n < 30 ? (n === 20 ? "VEINTE" : SPECIAL_TWENTIES[n] || `VEINTI${UNITS[n - 20]}`) : `${TENS[Math.floor(n / 10)]}${n % 10 ? ` Y ${UNITS[n % 10]}` : ""}`;
  const under1000 = (n) => n === 100 ? "CIEN" : n < 100 ? under100(n) : `${HUNDREDS[Math.floor(n / 100)]}${n % 100 ? ` ${under100(n % 100)}` : ""}`;
  const apocope = (words) => words.replace(/VEINTIUNO$/, "VEINTIÚN").replace(/ Y UNO$/, " Y UN").replace(/UNO$/, "UN");
  function integerWords(n) {
    n = Math.max(0, Math.floor(Number(n) || 0));
    if (n < 1000) return under1000(n);
    if (n < 1000000) {
      const thousands = Math.floor(n / 1000);
      const rest = n % 1000;
      return `${thousands === 1 ? "MIL" : `${apocope(under1000(thousands))} MIL`}${rest ? ` ${under1000(rest)}` : ""}`;
    }
    const millions = Math.floor(n / 1000000);
    const rest = n % 1000000;
    return `${millions === 1 ? "UN MILLÓN" : `${apocope(integerWords(millions))} MILLONES`}${rest ? ` ${integerWords(rest)}` : ""}`;
  }
  function amountWords(value) {
    const amount = Math.round((Number(value) || 0) * 100) / 100;
    const cents = Math.round((amount - Math.floor(amount)) * 100);
    return `${integerWords(Math.floor(amount))} PESOS DOMINICANOS CON ${String(cents).padStart(2, "0")}/100`;
  }

  function values() {
    return Object.fromEntries([...new FormData(form)].map(([key, value]) => [key, String(value).trim()]));
  }

  function saveCreditor() {
    const data = values();
    const saved = { creditorName: data.creditorName, creditorId: data.creditorId, creditorAddress: data.creditorAddress, subscriptionCity: data.subscriptionCity, paymentMethod: data.paymentMethod };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch {}
  }

  function restoreCreditor() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      Object.entries(saved).forEach(([name, value]) => { if (form.elements[name] && value) form.elements[name].value = value; });
    } catch {}
  }

  function originFor(quote) {
    const product = String(quote.product || "la operación descrita").trim();
    return `Financiamiento acordado para ${product}`;
  }

  function basisFor(quote) {
    if (quote.rateTypeKey === "simple") return "el capital inicial o base amortizada, mediante interés simple durante el plazo pactado";
    if (quote.rateTypeKey === "effectiveAnnual") return "el saldo insoluto, convirtiendo la tasa efectiva anual a su equivalente mensual";
    if (quote.rateTypeKey === "nominalAnnual") return "el saldo insoluto, dividiendo la tasa nominal anual entre doce y aplicándola mensualmente";
    return "el saldo insoluto de capital en cada período";
  }

  function missingFields(quote, data) {
    const missing = [];
    if (!quote.customerIncluded) missing.push("activa e identifica al cliente");
    if (!quote.customer) missing.push("nombre completo del cliente");
    if (!quote.customerId) missing.push("cédula del cliente");
    if (!quote.customerAddress) missing.push("domicilio completo del cliente");
    if (!quote.firstPaymentDate) missing.push("fecha de la primera cuota");
    if (!quote.schedule?.length) missing.push("tabla de amortización válida");
    if (!quote.validation?.valid) missing.push(...(quote.validation?.issues || ["condiciones válidas de la operación"]));
    if (quote.codebtorIncluded) {
      if (!quote.codebtor) missing.push("nombre completo del codeudor solidario");
      if (!quote.codebtorId) missing.push("cédula del codeudor solidario");
      if (!quote.codebtorAddress) missing.push("domicilio completo del codeudor solidario");
    }
    [["creditorName", "nombre del acreedor"], ["creditorId", "cédula o RNC del acreedor"], ["creditorAddress", "domicilio del acreedor"], ["subscriptionDate", "fecha de suscripción"], ["subscriptionCity", "ciudad de suscripción"], ["paymentMethod", "lugar o medio de pago"], ["debtOrigin", "origen real de la deuda"]].forEach(([name, label]) => { if (!data[name]) missing.push(label); });
    return [...new Set(missing)];
  }

  function setValidation(missing) {
    validation.className = `private-promissory-validation ${missing.length ? "is-invalid" : "is-valid"}`;
    validation.innerHTML = missing.length
      ? `<i class="fa-solid fa-triangle-exclamation"></i><span><b>No se puede generar la versión final.</b> Completa: ${escape(missing.join(", "))}.</span>`
      : '<i class="fa-solid fa-circle-check"></i><span><b>Datos completos.</b> El documento puede generarse con la operación actual.</span>';
  }

  function operationHeader(quote, page, totalPages) {
    return `<header class="private-promissory-page__header"><div><img src="LOGO%20M%26M.png" alt="M&M Inversiones"><img src="LOGO%20VEGAMOTORS.png" alt="VegaMotors"></div><p><b>Operación ${escape(quote.reference || "SIN REFERENCIA")}</b><span>${upper(quote.customer)} · ${escape(quote.customerId)}</span></p><span class="private-promissory-page-number">Página ${page} de ${totalPages}</span></header>`;
  }

  function scheduleTable(rows) {
    return `<table class="private-promissory-table"><thead><tr><th>Cuota</th><th>Vencimiento</th><th>Capital</th><th>Intereses</th><th>Importe de cuota</th><th>Saldo</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${row.index}</td><td>${escape(formatDate(row.dueDate))}</td><td>${money(row.principal)}</td><td>${money(row.interest)}</td><td>${money(row.payment)}</td><td>${money(row.balance)}</td></tr>`).join("")}</tbody></table>`;
  }

  function splitSchedule(rows, size = 18) {
    const chunks = [];
    for (let index = 0; index < rows.length; index += size) chunks.push(rows.slice(index, index + size));
    return chunks.length ? chunks : [[]];
  }

  function renderDocument(quote, data) {
    const chunks = splitSchedule(quote.schedule);
    const totalPages = chunks.length + 1;
    const capitalWords = amountWords(quote.base);
    const finalDate = quote.schedule.at(-1)?.dueDate;
    const rateText = `${Number(quote.enteredRate).toFixed(2)}% ${escape(quote.rateType.shortLabel.toLocaleLowerCase("es-DO"))}, con pagos de periodicidad ${escape(quote.frequency.sentence)}`;
    const basis = basisFor(quote);
    const charges = Number(quote.legal || 0) + Number(quote.extra || 0);
    const identification = `<section class="private-promissory-identification"><h1>PAGARÉ BAJO FIRMA PRIVADA Y TABLA DE AMORTIZACIÓN</h1><p>Suscrito en <strong>${upper(data.subscriptionCity)}</strong>, República Dominicana, el <strong>${escape(formatDate(data.subscriptionDate))}</strong>.</p><dl><div><dt>Deudor</dt><dd>${upper(quote.customer)} · Cédula ${escape(quote.customerId)}<br>${escape(quote.customerAddress)}</dd></div><div><dt>Acreedor</dt><dd>${upper(data.creditorName)} · ${escape(data.creditorId)}<br>${escape(data.creditorAddress)}</dd></div>${quote.codebtorIncluded ? `<div><dt>Codeudor solidario</dt><dd>${upper(quote.codebtor)} · Cédula ${escape(quote.codebtorId)}<br>${escape(quote.codebtorAddress)}</dd></div>` : ""}<div><dt>Origen de la deuda</dt><dd>${escape(data.debtOrigin)}</dd></div></dl></section>`;
    const summary = `<section class="private-promissory-financial"><div><span>Capital adeudado</span><strong>${money(quote.base)}</strong><small>${escape(capitalWords)}</small></div><div><span>Intereses programados</span><strong>${money(quote.interest)}</strong><small>No forman parte del capital</small></div><div><span>Total programado</span><strong>${money(quote.total)}</strong><small>${quote.installments} cuotas ${escape(quote.frequency.plural)}</small></div></section><dl class="private-promissory-terms"><div><dt>Capital financiado</dt><dd>${money(quote.financed)}</dd></div><div><dt>Cargos expresamente registrados</dt><dd>${money(charges)}</dd></div><div><dt>Tasa y periodicidad</dt><dd>${rateText}</dd></div><div><dt>Base de cálculo</dt><dd>${escape(basis)}</dd></div><div><dt>Primera cuota</dt><dd>${escape(formatDate(quote.firstPaymentDate))}</dd></div><div><dt>Vencimiento final</dt><dd>${escape(formatDate(finalDate))}</dd></div><div><dt>Lugar o medio de pago</dt><dd>${escape(data.paymentMethod)}</dd></div></dl>`;

    const schedulePages = chunks.map((rows, index) => `<article class="private-promissory-page">${operationHeader(quote, index + 1, totalPages)}${index === 0 ? `${identification}${summary}` : `<h1 class="private-promissory-continuation">PAGARÉ BAJO FIRMA PRIVADA · TABLA DE AMORTIZACIÓN (CONT.)</h1>`}<section class="private-promissory-schedule"><h2>Tabla de amortización${chunks.length > 1 ? ` · parte ${index + 1} de ${chunks.length}` : ""}</h2>${scheduleTable(rows)}</section><footer>Capital, intereses, cuota y saldo corresponden al cálculo vigente de la operación ${escape(quote.reference)}.</footer></article>`).join("");

    const recognition = `Yo, <strong>${upper(quote.customer)}</strong>, titular de la cédula núm. <strong>${escape(quote.customerId)}</strong>, domiciliado en <strong>${escape(quote.customerAddress)}</strong>, reconozco adeudar a <strong>${upper(data.creditorName)}</strong>, identificado con <strong>${escape(data.creditorId)}</strong>, la suma de <strong>${escape(capitalWords)}</strong> (<strong>${money(quote.base)}</strong>), por concepto de <strong>${escape(data.debtOrigin)}</strong>, y me obligo a pagar dicho capital y los intereses expresamente pactados conforme a las cuotas y fechas de la tabla precedente, que forma parte integral de este pagaré. La tasa pactada es de <strong>${rateText}</strong>, calculada sobre <strong>${escape(basis)}</strong>, y el vencimiento final es el <strong>${escape(formatDate(finalDate))}</strong>. Los pagos se realizarán mediante <strong>${escape(data.paymentMethod)}</strong>. Todo pago recibido se descontará de la obligación, de acuerdo con su aplicación correspondiente.`;
    const codebtorClause = quote.codebtorIncluded ? `<p>Yo, <strong>${upper(quote.codebtor)}</strong>, titular de la cédula núm. <strong>${escape(quote.codebtorId)}</strong>, domiciliado en <strong>${escape(quote.codebtorAddress)}</strong>, asumo expresamente, junto con el deudor principal, la obligación solidaria de pagar el capital y los intereses pactados en este documento. El acreedor podrá reclamar a cualquiera de los obligados el saldo exigible, sin que ello permita cobrar más de lo efectivamente adeudado.</p>` : "";
    const manualBlock = (name, id, className = "") => `<section class="private-promissory-manual ${className}"><p><b>Mención manuscrita requerida cuando resulte aplicable el artículo 1326:</b> escriba de puño y letra “bueno y válido” seguido de <strong>${escape(capitalWords)}</strong>.</p><div class="private-promissory-handwriting"><span>Espacio para la mención manuscrita</span></div><div class="private-promissory-signature"><span></span><b>${upper(name)}</b><small>Cédula ${escape(id)}</small></div></section>`;
    const finalPage = `<article class="private-promissory-page private-promissory-page--recognition">${operationHeader(quote, totalPages, totalPages)}<h1>RECONOCIMIENTO DE LA OBLIGACIÓN Y FIRMAS</h1><section class="private-promissory-recognition"><p>${recognition}</p>${codebtorClause}<aside><b>Base legal:</b> artículo 188 del Código de Comercio y artículos 1322 y 1326 del Código Civil de la República Dominicana, según resulten aplicables.</aside><small>Este documento es un instrumento bajo firma privada. No declara desembolso no ocurrido, no incorpora penalidades no pactadas y no atribuye fuerza ejecutoria notarial ni garantía de aceptación judicial.</small></section><div class="private-promissory-manuals">${manualBlock(quote.customer, quote.customerId)}${quote.codebtorIncluded ? manualBlock(quote.codebtor, quote.codebtorId, "private-promissory-signature--codebtor") : ""}</div></article>`;
    report.innerHTML = schedulePages + finalPage;
    report.hidden = false;
    empty.hidden = true;
    print.disabled = false;
  }

  function currentQuote() {
    return typeof window.getActiveQuoteSnapshot === "function" ? window.getActiveQuoteSnapshot() : null;
  }

  function prepareDialog() {
    const quote = currentQuote();
    if (!quote) return;
    restoreCreditor();
    if (!form.elements.subscriptionDate.value) form.elements.subscriptionDate.value = dateISO();
    form.elements.debtOrigin.value = originFor(quote);
    report.hidden = true;
    report.innerHTML = "";
    empty.hidden = false;
    print.disabled = true;
    setValidation(missingFields(quote, values()));
    dialog.showModal();
  }

  function generateDocument() {
    const quote = currentQuote();
    if (!quote) return;
    const data = values();
    const missing = missingFields(quote, data);
    setValidation(missing);
    if (missing.length) {
      const firstInvalid = [...form.elements].find((field) => field.name && !String(field.value || "").trim());
      firstInvalid?.focus();
      return;
    }
    saveCreditor();
    renderDocument(quote, data);
  }

  launch.addEventListener("click", prepareDialog);
  close.addEventListener("click", () => dialog.close());
  generate.addEventListener("click", generateDocument);
  form.addEventListener("input", () => setValidation(missingFields(currentQuote(), values())));
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  print.addEventListener("click", () => {
    if (report.hidden) return;
    document.body.dataset.printTarget = "private-promissory";
    window.print();
  });
  window.addEventListener("afterprint", () => { if (document.body.dataset.printTarget === "private-promissory") delete document.body.dataset.printTarget; });
})();
