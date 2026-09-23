(() => {
  "use strict";

  const form = document.getElementById("expressCalculatorForm");
  if (!form) return;

  const amountInput = document.getElementById("expressAmount");
  const termInput = document.getElementById("expressTerm");
  const rateInput = document.getElementById("expressRate");
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
    result.classList.add("is-error");
    paymentOutput.textContent = "Revisa los datos";
    metaOutput.textContent = message;
    interestOutput.textContent = "";
  }

  function calculate() {
    const principal = Number(amountInput.value);
    const months = Number(termInput.value);
    const monthlyRate = Number(rateInput.value);

    if (!Number.isFinite(principal) || principal <= 0) {
      showError("Introduce un monto mayor que cero.");
      amountInput.focus();
      return;
    }
    if (!Number.isInteger(months) || months < 1 || months > 60) {
      showError("El plazo debe ser de 1 a 60 meses.");
      termInput.focus();
      return;
    }
    if (!Number.isFinite(monthlyRate) || monthlyRate < 0) {
      showError("Introduce una tasa válida.");
      rateInput.focus();
      return;
    }

    const frequency = frequencyConfig[selectedFrequency()];
    const paymentCount = months * frequency.paymentsPerMonth;
    const totalInterest = principal * (monthlyRate / 100) * months;
    const total = principal + totalInterest;
    const payment = total / paymentCount;

    result.classList.remove("is-error");
    paymentOutput.textContent = money.format(payment);
    metaOutput.textContent = `${paymentCount} pagos ${frequency.plural} · Total ${money.format(total)}`;
    interestOutput.textContent = `Interés total: ${money.format(totalInterest)}`;
    result.querySelector(".express-result__label").textContent = `Cuota ${frequency.singular} aproximada`;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    calculate();
  });

  form.addEventListener("change", (event) => {
    if (event.target.matches('input[name="expressFrequency"]')) calculate();
  });

  calculate();
})();
