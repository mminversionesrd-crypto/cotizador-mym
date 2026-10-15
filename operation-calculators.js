"use strict";

(function installOperationCalculators(globalScope) {
  const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  const number = (value) => Number(value) || 0;
  const frequencyMultiplier = { monthly: 1, biweekly: 2, weekly: 4 };
  function calculateProposal(input = {}) {
    const price = number(input.price);
    const downPayment = number(input.downPayment);
    const principal = input.principal !== undefined ? number(input.principal) : price - downPayment;
    const rate = number(input.monthlyRate);
    const term = number(input.term);
    const frequency = input.frequency || "monthly";
    if (!(principal > 0)) throw new Error("El capital debe ser mayor que cero.");
    if (!(term > 0)) throw new Error("El plazo debe ser mayor que cero.");
    if (rate < 0) throw new Error("La tasa no puede ser negativa.");
    const paymentCount = Math.round(term * (frequencyMultiplier[frequency] || 1));
    const interest = roundMoney(principal * (rate / 100) * term);
    const total = roundMoney(principal + interest);
    return { principal: roundMoney(principal), interest, total, installment: roundMoney(total / paymentCount), paymentCount, frequency };
  }
  function compareProposals(input = {}) {
    const terms = [...new Set((input.termOptions || []).map(number).filter((term) => term > 0))].sort((a, b) => a - b);
    if (!terms.length) throw new Error("Debes indicar plazos para comparar.");
    const chosen = [terms.at(-1), terms[Math.floor((terms.length - 1) / 2)], terms[0]];
    const keys = ["lowest_payment", "balanced", "lowest_cost"];
    return chosen.map((term, index) => ({ key: keys[index], term, ...calculateProposal({ ...input, term }) }));
  }
  function calculateCapacity(profile = {}) {
    const monthlyIncome = number(profile.monthlyIncome);
    const monthlyCommitments = number(profile.monthlyCommitments);
    const proposedPayment = number(profile.proposedPayment);
    const maximumDebtPayment = roundMoney(monthlyIncome * .35);
    const availableForNewPayment = roundMoney(Math.max(0, maximumDebtPayment - monthlyCommitments));
    return { maximumDebtPayment, availableForNewPayment, proposedPayment, withinCapacity: proposedPayment > 0 && proposedPayment <= availableForNewPayment, ratio: monthlyIncome ? roundMoney(((monthlyCommitments + proposedPayment) / monthlyIncome) * 100) : 0, decision: null };
  }
  function calculateMargin(sale = {}) {
    const totalCost = roundMoney(number(sale.purchaseCost) + number(sale.transport) + number(sale.preparation) + number(sale.accessories) + number(sale.otherCosts));
    const netSale = roundMoney(number(sale.salePrice) - number(sale.discount));
    const grossMargin = roundMoney(netSale - totalCost);
    return { totalCost, netSale, grossMargin, marginPercent: netSale ? Math.round((grossMargin / netSale) * 1000) / 10 : 0 };
  }
  function calculateCommercialCoverage(business = {}) {
    const availableCashflow = roundMoney(number(business.sales) - number(business.costs) - number(business.expenses) - number(business.currentDebtPayments));
    const proposedPayment = number(business.proposedPayment);
    return { availableCashflow, proposedPayment, coverageRatio: proposedPayment ? roundMoney(availableCashflow / proposedPayment) : 0, decision: null };
  }
  const api = { calculateProposal, compareProposals, calculateCapacity, calculateMargin, calculateCommercialCoverage };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalScope.OperationCalculators = api;
})(typeof window !== "undefined" ? window : globalThis);

