(function exposePreApplicationCore(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PreApplicationCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createPreApplicationCore() {
  const money = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

  function calculateOperation({ amount, monthlyRate, months }) {
    const principal = Number(amount);
    const rate = Number(monthlyRate);
    const term = Number(months);
    if (!Number.isFinite(principal) || principal <= 0) return null;
    if (!Number.isFinite(rate) || rate < 0) return null;
    if (!Number.isInteger(term) || term <= 0) return null;
    const interest = principal * (rate / 100) * term;
    const total = principal + interest;
    return {
      principal: money(principal),
      interest: money(interest),
      total: money(total),
      installment: money(total / term)
    };
  }

  const requiredMessages = Object.freeze({
    firstName: 'Completa el nombre.',
    lastName: 'Completa el apellido.',
    idNumber: 'Completa la cédula.',
    phone: 'Completa el teléfono.',
    address: 'Completa la dirección específica.',
    landmark1: 'Completa la primera referencia de ubicación.',
    landmark2: 'Completa la segunda referencia de ubicación.',
    dataReport: 'Escribe el resultado consultado en Data Crédito.'
  });
  const digits = (value) => String(value ?? '').replace(/\D/g, '');

  function validateParty(party = {}) {
    const errors = {};
    for (const [field, message] of Object.entries(requiredMessages)) {
      if (!String(party[field] ?? '').trim()) errors[field] = message;
    }
    if (!errors.idNumber && digits(party.idNumber).length !== 11) errors.idNumber = 'Escribe una cédula de 11 dígitos.';
    const phone = digits(party.phone);
    if (!errors.phone && !(phone.length === 10 || (phone.length === 11 && phone.startsWith('1')))) errors.phone = 'Escribe un teléfono de 10 dígitos.';
    return errors;
  }

  function validateApplication({ applicant = {}, hasCoDebtor = false, coDebtor = {} } = {}) {
    const errors = { applicant: validateParty(applicant), coDebtor: hasCoDebtor ? validateParty(coDebtor) : {} };
    if (hasCoDebtor && !errors.applicant.idNumber && !errors.coDebtor.idNumber && digits(applicant.idNumber) === digits(coDebtor.idNumber)) {
      errors.coDebtor.idNumber = 'El codeudor debe usar una cédula diferente.';
    }
    return errors;
  }

  function validateDecision({ decision = '', observations = '' } = {}) {
    const allowed = new Set(['Aprobado', 'Rechazado', 'Aprobado con observaciones']);
    if (!allowed.has(decision)) return 'Selecciona la decisión final.';
    if (decision === 'Aprobado con observaciones' && !String(observations).trim()) return 'Escribe las observaciones o condiciones de aprobación.';
    return '';
  }

  return Object.freeze({ calculateOperation, validateParty, validateApplication, validateDecision });
});
