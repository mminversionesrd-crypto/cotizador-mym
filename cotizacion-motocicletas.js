"use strict";

const form = document.querySelector("#motorcycleQuoteForm");
const financingFields = document.querySelector("#financingFields");
const financeSummary = document.querySelector("#financeSummary");
const discountFields = document.querySelector("#discountFields");
const discountBreakdown = document.querySelector("#discountBreakdown");
const notesSection = document.querySelector("#notesSection");
const imageInput = document.querySelector("#motorcycleImage");
const imageStatus = document.querySelector("#imageStatus");
const imagePreview = document.querySelector("#viewMotorcycleImage");
const imageFrame = document.querySelector("#motorcyclePhoto");
const removeImage = document.querySelector("#removeImage");
let imageSelection = 0;
const currency = new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = (amount) => currency.format(Number.isFinite(amount) ? amount : 0).replace("DOP", "RD$");
const field = (name) => form.elements.namedItem(name);
const value = (name) => String(field(name).value || "").trim();
const number = (name) => Number(field(name).value) || 0;
const show = (id, content) => { document.getElementById(id).textContent = content; };
const display = (content) => content || "—";

function todayLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateLabel(raw) {
  if (!raw) return "Fecha no indicada";
  const date = new Date(`${raw}T12:00:00`);
  return Number.isNaN(date.getTime()) ? "Fecha no indicada" : new Intl.DateTimeFormat("es-DO", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function updateQuote() {
  const financed = field("saleType").value === "financed";
  const price = number("price");
  const hasDiscount = field("hasDiscount").checked;
  const discountType = value("discountType");
  const discountInput = number("discountValue");
  const discount = hasDiscount ? discountType === "percent" ? price * discountInput / 100 : discountInput : 0;
  const finalPrice = Math.max(0, price - discount);
  const down = number("downPayment");
  const term = number("termMonths");
  const rate = number("monthlyRate");
  const principal = Math.max(0, finalPrice - down);
  const interest = principal * (rate / 100) * term;
  const monthly = term > 0 ? (principal + interest) / term : 0;

  financingFields.hidden = !financed;
  financeSummary.hidden = !financed;
  discountFields.hidden = !hasDiscount;
  discountBreakdown.hidden = !hasDiscount;
  field("discountValue").required = hasDiscount;
  for (const name of ["downPayment", "termMonths", "monthlyRate"]) field(name).required = financed;
  field("discountValue").setCustomValidity(hasDiscount && price > 0 && discount >= price ? "El descuento debe ser menor que el precio de la motocicleta." : "");
  field("downPayment").setCustomValidity(financed && finalPrice > 0 && down >= finalPrice ? "La inicial debe ser menor que el precio final." : "");

  show("viewDate", dateLabel(value("quoteDate")));
  show("viewClient", display(value("clientName")));
  show("viewClientId", display(value("clientId")));
  show("viewPhone", value("clientPhone") || "Teléfono no indicado");
  show("viewBrand", display(value("brand")));
  show("viewModel", display(value("model")));
  show("viewYear", display(value("year")));
  show("viewColor", display(value("color")));
  show("viewDisplacement", value("displacement") ? `${value("displacement")} cc` : "—");
  show("viewChassis", display(value("chassis")));
  show("viewPriceLabel", hasDiscount ? "Precio final con descuento" : financed ? "Precio de la motocicleta" : "Precio de contado");
  show("viewPrice", money(finalPrice));
  show("viewSaleType", financed ? "FINANCIADA" : "CONTADO");
  show("viewRegularPrice", money(price));
  show("viewDiscountLabel", discountType === "percent" ? `Descuento (${discountInput.toLocaleString("es-DO", { maximumFractionDigits: 2 })}%)` : "Descuento");
  show("viewDiscount", `−${money(discount)}`);
  show("viewDownPayment", money(down));
  show("viewFinanced", money(principal));
  show("viewTerm", term ? `${term} meses` : "—");
  show("viewRate", value("monthlyRate") ? `${rate.toLocaleString("es-DO", { maximumFractionDigits: 2 })}%` : "—");
  show("viewMonthlyPayment", value("monthlyRate") ? money(monthly) : "—");
  show("viewPlate", field("includesPlate").checked ? "Incluida" : "No incluida");
  show("viewRegistration", field("includesRegistration").checked ? "Incluida" : "No incluida");
  show("viewInsurance", field("includesInsurance").checked ? "Incluido" : "No incluido");

  const notes = value("notes");
  notesSection.hidden = !notes;
  show("viewNotes", notes);
}

function clearImage() {
  imageSelection += 1;
  imageInput.value = "";
  imagePreview.onload = null;
  imagePreview.onerror = null;
  imagePreview.removeAttribute("src");
  imageFrame.hidden = true;
  removeImage.hidden = true;
  imageStatus.textContent = "Sin imagen seleccionada";
}

imageInput.addEventListener("change", () => {
  const file = imageInput.files?.[0];
  if (!file) return;
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type) || file.size > 10 * 1024 * 1024) {
    clearImage();
    imageStatus.textContent = "Selecciona una imagen JPG, PNG o WebP de hasta 10 MB.";
    return;
  }
  const selection = ++imageSelection;
  const reader = new FileReader();
  reader.onload = () => {
    if (selection !== imageSelection) return;
    imagePreview.onload = () => {
      if (selection !== imageSelection) return;
      imageFrame.hidden = false;
      removeImage.hidden = false;
      imageStatus.textContent = file.name;
    };
    imagePreview.onerror = () => {
      if (selection !== imageSelection) return;
      clearImage();
      imageStatus.textContent = "No se pudo mostrar la imagen. Intenta con otro archivo.";
    };
    imageStatus.textContent = "Preparando imagen…";
    imagePreview.src = String(reader.result);
  };
  reader.onerror = () => {
    if (selection !== imageSelection) return;
    clearImage();
    imageStatus.textContent = "No se pudo leer la imagen. Intenta con otro archivo.";
  };
  reader.readAsDataURL(file);
});
removeImage.addEventListener("click", clearImage);

field("quoteDate").value = todayLocal();
form.addEventListener("input", updateQuote);
form.addEventListener("change", updateQuote);
document.querySelector("#printQuote").addEventListener("click", () => {
  updateQuote();
  if (imageInput.files?.length && imageFrame.hidden) {
    imageStatus.textContent = "Espera a que la imagen esté lista antes de imprimir.";
    return;
  }
  if (form.reportValidity()) window.print();
});
document.querySelector("#newQuote").addEventListener("click", () => {
  if (!window.confirm("¿Comenzar una cotización nueva? Se limpiarán los datos de esta hoja.")) return;
  form.reset();
  clearImage();
  field("quoteDate").value = todayLocal();
  updateQuote();
  field("clientName").focus();
});
updateQuote();
