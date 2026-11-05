(() => {
  "use strict";

  const form = document.getElementById("expressCalculatorForm");
  if (!form) return;

  const productInput = document.getElementById("expressProductType");
  const amountInput = document.getElementById("expressAmount");
  const downPaymentInput = document.getElementById("expressDownPayment");
  const termInput = document.getElementById("expressTerm");
  const weekOptions = [13, 16, 20, 24, 28, 32];
  const weekInput = document.createElement("select");
  weekInput.id = "expressWeeks";
  weekInput.hidden = true;
  weekInput.disabled = true;
  weekInput.replaceChildren(...weekOptions.map(weeks => new Option(weeks + " semanas", weeks)));
  termInput.after(weekInput);
  const termLabel = document.getElementById("expressMonthLabel");
  const printButton = document.getElementById("expressPrintAmortization");
  const printHost = document.getElementById("documentPrint-express-amortization");
  const rateInput = document.getElementById("expressRate");
  const financedOutput = document.getElementById("expressFinanced");
  const paymentOutput = document.getElementById("expressPayment");
  const metaOutput = document.getElementById("expressPaymentMeta");
  const interestOutput = document.getElementById("expressInterest");
  const result = document.getElementById("expressResult");

  const frequencyConfig = {
    weekly: { paymentsPerMonth: 4, singular: "semanal", plural: "semanales" },
    biweekly: { paymentsPerMonth: 2, singular: "quincenal", plural: "quincenales" },
    monthly: { paymentsPerMonth: 1, singular: "mensual", plural: "mensuales" }
  };

  const money = new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  function selectedFrequency() {
    return form.querySelector('input[name="expressFrequency"]:checked')?.value || "monthly";
  }

  function showError(message) {
    printButton.disabled = true;
    financedOutput.textContent = "A financiar: —";
    result.classList.add("is-error");
    paymentOutput.textContent = "Revisa los datos";
    metaOutput.textContent = message;
    interestOutput.textContent = "";
  }

  function calculate() {
    const amount = Number(amountInput.value);
    const downPayment = Number(downPaymentInput.value);
    const weekly = selectedFrequency() === "weekly";
    const weeks = Number(weekInput.value);
    const months = weekly ? weeks / 4 : Number(termInput.value);
    const monthlyRate = Number(rateInput.value);

    if (!Number.isFinite(amount) || amount <= 0) {
      showError("Introduce un monto mayor que cero.");
      return;
    }
    if (!Number.isFinite(downPayment) || downPayment < 0 || downPayment >= amount) {
      showError("La inicial debe ser menor que el monto o precio.");
      return;
    }
    if (weekly ? !weekOptions.includes(weeks) : !Number.isInteger(months) || months < 1 || months > 60) {
      showError("El plazo debe ser de 1 a 60 meses.");
      return;
    }
    if (!Number.isFinite(monthlyRate) || monthlyRate < 0) {
      showError("Introduce una tasa válida.");
      return;
    }

    const frequency = frequencyConfig[selectedFrequency()];
    const principal = amount - downPayment;
    const paymentCount = weekly ? weeks : months * frequency.paymentsPerMonth;
    const totalInterest = principal * (monthlyRate / 100) * months;
    const total = principal + totalInterest;
    const payment = total / paymentCount;

    printButton.disabled = false;
    result.classList.remove("is-error");
    financedOutput.textContent = `A financiar: ${money.format(principal)}`;
    paymentOutput.textContent = money.format(payment);
    metaOutput.textContent = `${productInput.value} · ${paymentCount} pagos ${frequency.plural}${weekly ? " · " + new Intl.NumberFormat("es-DO").format(months) + " meses" : ""}`;
    interestOutput.textContent = `Total ${money.format(total)} · Interés ${money.format(totalInterest)}`;
    result.querySelector(".express-result__label").textContent = `Cuota ${frequency.singular} aproximada`;
    return { principal, totalInterest, paymentCount, frequency, months, monthlyRate };
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    calculate();
    window.registerDailyActivity?.("express");
  });

  function update() {
    const weekly = selectedFrequency() === "weekly";
    termInput.hidden = termInput.disabled = weekly;
    weekInput.hidden = weekInput.disabled = !weekly;
    termLabel.textContent = weekly ? "Plazo en semanas" : "Plazo en meses";
    return calculate();
  }

  function printAmortization() {
    const quote = update();
    if (!quote) return;
    const { principal, totalInterest, paymentCount, frequency, months, monthlyRate } = quote;
    const capitalCents = Math.round(principal * 100);
    const interestCents = Math.round(totalInterest * 100);
    const rows = [];
    let paidCapital = 0;
    let paidInterest = 0;
    for (let index = 1; index <= paymentCount; index++) {
      const nextCapital = Math.round(capitalCents * index / paymentCount);
      const nextInterest = Math.round(interestCents * index / paymentCount);
      const capital = nextCapital - paidCapital;
      const interest = nextInterest - paidInterest;
      rows.push([index, ...[capital + interest, capital, interest, capitalCents - nextCapital].map(cents => money.format(cents / 100))]);
      paidCapital = nextCapital;
      paidInterest = nextInterest;
    }
    const sheet = document.createElement("section");
    sheet.className = "document-print-sheet";
    sheet.innerHTML = '<header class="document-print-header"><h1>Amortización · Cuota exprés</h1><p></p></header><table class="document-print-table"><thead><tr><th>Cuota</th><th>Pago</th><th>Capital</th><th>Interés</th><th>Saldo</th></tr></thead><tbody></tbody><tfoot><tr><th>Total</th></tr></tfoot></table>';
    sheet.querySelector("p").textContent = productInput.value + " · " + paymentCount + " pagos " + frequency.plural + " · " + months + " meses · Tasa mensual " + monthlyRate + "%";
    const table = sheet.querySelector("table");
    for (const row of rows) {
      const tr = table.tBodies[0].insertRow();
      for (const value of row) tr.insertCell().textContent = value;
    }
    for (const cents of [capitalCents + interestCents, capitalCents, interestCents, 0]) {
      table.tFoot.rows[0].insertCell().textContent = money.format(cents / 100);
    }
    printHost.replaceChildren(sheet);
    document.body.dataset.printTarget = "document-express-amortization";
    window.print();
  }

  form.addEventListener("input", update);
  form.addEventListener("change", update);
  printButton.addEventListener("click", printAmortization);
  update();
})();
