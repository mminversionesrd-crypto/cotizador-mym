"use strict";

(function installProductFlows(globalScope) {
  const Rules = globalScope.ProductRules || (typeof require === "function" ? require("./product-rules.js") : null);
  const field = (path, label, type = "text", options = {}) => ({ path, label, type, ...options });
  const section = (id, label, fields, description) => ({ id, label, description, fields });
  const customer = section("customer", "Cliente y obligados", [
    field("people.customer.fullName", "Nombre completo", "text", { required: true, autocomplete: "name" }),
    field("people.customer.idNumber", "Cédula o documento", "text", { required: true }),
    field("people.customer.phone", "Teléfono", "tel", { autocomplete: "tel" }),
    field("people.customer.address", "Domicilio completo", "text", { required: true, wide: true, autocomplete: "street-address" }),
    field("people.hasCodebtor", "Incluir codeudor solidario", "checkbox", { wide: true })
  ], "Los datos se reutilizan en evaluación, pagarés, recibos y entregas.");
  const financing = section("financing", "Condiciones financieras", [
    field("proposal.price", "Precio o monto de referencia", "money"),
    field("proposal.downPayment", "Inicial", "money"),
    field("proposal.principal", "Capital solicitado", "money", { required: true }),
    field("proposal.term", "Plazo en meses", "number", { required: true }),
    field("proposal.monthlyRate", "Tasa mensual %", "number", { required: true, step: ".01" }),
    field("proposal.frequency", "Frecuencia", "select", { options: ["monthly|Mensual", "biweekly|Quincenal", "weekly|Semanal"] }),
    field("proposal.purpose", "Destino real o concepto", "text", { wide: true })
  ], "Compara cuota, intereses y total antes de seleccionar una propuesta.");
  const personal = section("personal_profile", "Capacidad personal", [
    field("evaluation.monthlyIncome", "Ingresos mensuales", "money", { required: true }),
    field("evaluation.monthlyCommitments", "Compromisos mensuales", "money"),
    field("evaluation.employer", "Empresa, trabajo o actividad", "text", { wide: true }),
    field("evaluation.employmentTime", "Tiempo en la actividad", "text"),
    field("evaluation.references", "Referencias y observaciones", "textarea", { wide: true })
  ], "La precalificación orienta la revisión y no sustituye la decisión humana.");
  const business = section("business", "Negocio y flujo comercial", [
    field("evaluation.business.activity", "Actividad del negocio", "text", { required: true, wide: true }),
    field("evaluation.business.operatingTime", "Tiempo operando", "text"),
    field("evaluation.business.sales", "Ventas mensuales", "money"),
    field("evaluation.business.costs", "Costos mensuales", "money"),
    field("evaluation.business.expenses", "Gastos mensuales", "money"),
    field("evaluation.business.currentDebtPayments", "Cuotas vigentes", "money"),
    field("evaluation.business.availableCashflow", "Flujo disponible", "money", { required: true, readonly: true }),
    field("evaluation.business.cycle", "Ciclo de recuperación", "text"),
    field("evaluation.business.references", "Referencias comerciales", "textarea", { wide: true })
  ], "Separa el flujo del negocio de los ingresos personales.");
  const motorcycle = section("motorcycle", "Motocicleta", [
    field("asset.brand", "Marca", "text", { required: true }), field("asset.model", "Modelo", "text", { required: true }),
    field("asset.year", "Año", "number"), field("asset.color", "Color"), field("asset.displacement", "Cilindraje"),
    field("asset.chassis", "Chasis"), field("asset.engine", "Motor"), field("asset.supplier", "Proveedor")
  ], "Identifica la unidad cotizada, financiada o entregada.");
  const profitability = section("profitability", "Costo y rentabilidad", [
    field("asset.purchaseCost", "Costo de compra", "money", { required: true }), field("asset.transportCost", "Transporte", "money"),
    field("asset.preparationCost", "Preparación", "money"), field("asset.accessoryCost", "Accesorios", "money"),
    field("asset.otherCosts", "Otros costos", "money"), field("proposal.discount", "Descuento", "money")
  ], "El margen es interno y no aparece en la cotización del cliente.");
  const vehicleCollateral = section("vehicle_collateral", "Garantía vehicular", [
    field("collateral.ownerName", "Propietario", "text", { required: true }), field("collateral.ownerId", "Cédula del propietario", "text"),
    field("collateral.brand", "Marca"), field("collateral.model", "Modelo"), field("collateral.year", "Año", "number"),
    field("collateral.chassis", "Chasis", "text", { required: true }), field("collateral.registration", "Matrícula", "text", { required: true }),
    field("collateral.marketValue", "Valor comercial", "money", { required: true }), field("collateral.liens", "Gravámenes declarados", "textarea", { wide: true })
  ], "La cobertura no sustituye la revisión física, registral ni jurídica.");
  const mortgageCollateral = section("mortgage_collateral", "Garantía hipotecaria", [
    field("collateral.ownerName", "Propietario", "text", { required: true }), field("collateral.ownerId", "Cédula o RNC", "text"),
    field("collateral.propertyType", "Tipo de inmueble", "select", { options: ["Casa", "Apartamento", "Local", "Solar", "Finca", "Otro"] }),
    field("collateral.address", "Ubicación completa", "text", { required: true, wide: true }), field("collateral.titleNumber", "Título o matrícula", "text", { required: true }),
    field("collateral.appraisalValue", "Valor de tasación", "money", { required: true }), field("collateral.appraisalDate", "Fecha de tasación", "date"),
    field("collateral.legalReview", "Revisión jurídica completada", "checkbox", { wide: true }), field("collateral.liens", "Gravámenes declarados", "textarea", { wide: true })
  ], "La operación permanece pendiente hasta confirmar la revisión jurídica.");
  const device = section("device", "Smartphone", [field("asset.brand", "Marca", "text", { required: true }), field("asset.model", "Modelo", "text", { required: true }), field("asset.serial", "IMEI o serie", "text", { required: true }), field("asset.capacity", "Capacidad"), field("asset.color", "Color"), field("asset.warranty", "Garantía comercial")], "La serie se confirma nuevamente en la entrega.");
  const appliance = section("appliance", "Electrodoméstico", [field("asset.category", "Categoría", "text", { required: true }), field("asset.brand", "Marca", "text", { required: true }), field("asset.model", "Modelo", "text", { required: true }), field("asset.serial", "Número de serie", "text", { required: true }), field("asset.warranty", "Garantía comercial"), field("asset.supplier", "Proveedor")], "La serie y los accesorios se confirman en la entrega.");
  const review = section("review", "Revisión y siguiente paso", [], "Revisa alertas, expediente y documentos disponibles.");
  const flows = {
    motorcycle_cash_sale: [customer, motorcycle, financing, profitability, review],
    motorcycle_financing: [customer, motorcycle, financing, personal, review],
    personal_loan: [customer, financing, personal, review],
    commercial_loan: [customer, financing, business, review],
    vehicle_secured_loan: [customer, financing, personal, vehicleCollateral, review],
    mortgage_secured_loan: [customer, financing, personal, mortgageCollateral, review],
    smartphone_financing: [customer, device, financing, personal, review],
    appliance_financing: [customer, appliance, financing, personal, review]
  };
  function sections(type) { return JSON.parse(JSON.stringify(flows[type] || [])); }
  function fields(type, operation = {}) {
    const result = sections(type).flatMap((item) => item.fields);
    if (operation.people?.codebtor) result.push(
      field("people.codebtor.fullName", "Nombre del codeudor", "text", { required: true }),
      field("people.codebtor.idNumber", "Cédula del codeudor", "text", { required: true }),
      field("people.codebtor.address", "Domicilio del codeudor", "text", { required: true, wide: true })
    );
    return result;
  }
  function completion(type, operation = {}) {
    const validation = Rules.validate(type, operation);
    const total = Rules.requirements(type, operation).length;
    const complete = total - validation.blockers.length;
    return { percent: total ? Math.round((complete / total) * 100) : 100, blockers: validation.blockers, ready: validation.ready };
  }
  const api = { sections, fields, completion, blockers: (type, operation) => completion(type, operation).blockers };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  globalScope.ProductFlows = api;
})(typeof window !== "undefined" ? window : globalThis);

