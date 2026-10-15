(() => {
  "use strict";

  window.installNotarialPromissory = function installNotarialPromissory() {
    const menu = document.querySelector("#formalMenuCards");
    const shell = document.querySelector(".app-shell");
    if (!menu || !shell || document.querySelector("#notarialPromissoryWorkspace")) return;

    const NOTARY = {
      displayName: "Licda. Deyanira Mercedes Holguín",
      legalName: "LICDA. DEYANIRA HOLGUÍN FLORENCIO",
      role: "Abogada Notaria Pública de los del número para el Municipio de La Vega",
      license: "4927",
      id: "047-0083161-5",
      office: "número 46, alto, de la avenida García Godoy, ciudad de La Vega"
    };
    const WITNESSES = [
      { name: "DARLYN MOISÉS CONCEPCIÓN MONCIÓN", id: "402-2585057-3", address: "calle Principal, casa sin número, Guarionex, La Vega" },
      { name: "WILSON DE JESÚS CÁCERES PÁEZ", id: "402-2544983-0", address: "calle Principal, casa sin número, sector La Planta, La Vega" }
    ];
    const CREDITORS = {
      jose: { name: "JOSÉ ANÍBAL MORONTA MEJÍA", id: "402-2659780-1", address: "CALLE JOSÉ CABRERA, ESQUINA JOAQUÍN GÓMEZ, VILLA ROSA, LA VEGA" },
      jarvis: { name: "JARVIS MIGUEL MORONTA MEJÍA", id: "402-2521663-5", address: "CALLE JOSÉ MARTÍ NÚMERO 85, SECTOR EL HATICO, LA VEGA" }
    };
    const PROVINCES = ["Azua", "Bahoruco", "Barahona", "Dajabón", "Distrito Nacional", "Duarte", "El Seibo", "Elías Piña", "Espaillat", "Hato Mayor", "Hermanas Mirabal", "Independencia", "La Altagracia", "La Romana", "La Vega", "María Trinidad Sánchez", "Monseñor Nouel", "Monte Cristi", "Monte Plata", "Pedernales", "Peravia", "Puerto Plata", "Samaná", "San Cristóbal", "San José de Ocoa", "San Juan", "San Pedro de Macorís", "Sánchez Ramírez", "Santiago", "Santiago Rodríguez", "Santo Domingo", "Valverde"];

    const escape = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
    const numeric = (value) => Number(String(value ?? "").replace(/[^\d,.-]/g, "").replaceAll(",", "")) || 0;
    const money = (value) => `RD$${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numeric(value))}`;
    const today = () => new Date().toISOString().slice(0, 10);
    const cedula = (value) => {
      const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
      if (digits.length <= 3) return digits;
      if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`;
    };
    const optionList = (items, selected = "") => items.map((item) => `<option${item === selected ? " selected" : ""}>${escape(item)}</option>`).join("");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "workspace-choice workspace-choice--document workspace-choice--notarial";
    button.dataset.toolLabel = "Notarial";
    button.dataset.workspaceTarget = "notarial-promissory";
    button.innerHTML = '<span><i class="fa-solid fa-stamp"></i></span><b>Pagaré notarial</b><small>Auténtico · un deudor</small><em>Preparar pagaré <i class="fa-solid fa-arrow-right"></i></em>';
    menu.append(button);

    const workspace = document.createElement("section");
    workspace.className = "workspace document-workspace notarial-workspace";
    workspace.id = "documentWorkspace-notarial-promissory";
    workspace.dataset.workspaceTitle = "Pagaré notarial";
    workspace.hidden = true;
    workspace.innerHTML = `
      <header class="notarial-hero">
        <div class="notarial-seal"><img src="escudo-notarial.png" alt="Escudo de la República Dominicana"></div>
        <div class="notarial-hero-copy"><div class="notarial-brandline"><b>M&amp;M Inversiones</b><i aria-hidden="true"></i><b>VegaMotors</b></div><p>Formalización notarial</p><h2>Pagaré notarial auténtico</h2><span>Primera plantilla aprobable: un deudor, basada en el documento notarial suministrado.</span></div>
        <div class="notarial-state"><i class="fa-solid fa-user-shield"></i><span>Sesión temporal<br><b>No guarda datos</b></span></div>
      </header>
      <nav class="notarial-progress" aria-label="Etapas del pagaré">
        <button class="is-active" type="button" data-notarial-step="1" aria-current="step" aria-controls="notarialPanelControl"><b>1</b><span><strong>Control</strong><small>Acto y folios</small></span></button>
        <button type="button" data-notarial-step="2" aria-controls="notarialPanelPeople"><b>2</b><span><strong>Personas</strong><small>Acreedor y deudor</small></span></button>
        <button type="button" data-notarial-step="3" aria-controls="notarialPanelTerms"><b>3</b><span><strong>Condiciones</strong><small>Capital y cuotas</small></span></button>
        <button type="button" data-notarial-step="4" aria-controls="notarialPanelReview"><b>4</b><span><strong>Revisión</strong><small>Validar e imprimir</small></span></button>
      </nav>
      <div class="notarial-desk" data-notarial-desk>
      <div class="notarial-editor" data-notarial-editor>
      <form class="notarial-form" id="notarialPromissoryForm" novalidate autocomplete="off">
        <section class="notarial-template-picker" aria-label="Modalidades de pagaré notarial">
          <header><span>Plantilla del documento</span><b>Selecciona solo modalidades revisadas</b></header>
          <div>
            <button type="button" class="notarial-template-option is-active" data-notarial-variant="single" aria-current="true"><i class="fa-solid fa-user"></i><span><b>Un deudor</b><small>Disponible · modelo auténtico</small></span><em>Activa</em></button>
            <button type="button" class="notarial-template-option" data-notarial-variant="double" disabled><i class="fa-solid fa-user-group"></i><span><b>Dos deudores</b><small>Se adaptará desde este modelo</small></span><em>Próxima</em></button>
            <button type="button" class="notarial-template-option" data-notarial-variant="vehicle-single" disabled><i class="fa-solid fa-motorcycle"></i><span><b>Un deudor + vehículo</b><small>Cláusula y ficha de garantía</small></span><em>Próxima</em></button>
            <button type="button" class="notarial-template-option" data-notarial-variant="vehicle-double" disabled><i class="fa-solid fa-car-side"></i><span><b>Dos deudores + vehículo</b><small>Obligación y garantía conjuntas</small></span><em>Próxima</em></button>
          </div>
        </section>
        <aside class="notarial-operation-strip" data-notarial-operation-strip aria-label="Resumen vivo de la operación">
          <div><span>Acto</span><strong data-desk-summary="act">Sin número</strong><small data-desk-detail="folio">Folio pendiente</small></div>
          <div><span>Deudor</span><strong data-desk-summary="debtor">Sin identificar</strong><small data-desk-detail="identity">Cédula pendiente</small></div>
          <div><span>Capital</span><strong data-desk-summary="principal">RD$0.00</strong><small data-desk-detail="term">Sin plazo</small></div>
          <div class="is-accent"><span>Cuota estimada</span><strong data-desk-summary="payment">RD$0.00</strong><small data-desk-detail="frequency">Mensual</small></div>
        </aside>
        <section class="notarial-section" id="notarialPanelControl" data-notarial-panel="1">
          <div class="notarial-section-heading"><span>01</span><div><p>Protocolo</p><h3>Control del acto</h3></div></div>
          <div class="application-fields four-columns">
            <label>Número de acto <input name="actNumber" type="number" min="1" required placeholder="Ej. 321"></label>
            <label>Folio inicial <input name="folioStart" type="number" min="1" required placeholder="Ej. 614"></label>
            <label>Folio final · automático <input name="folioEnd" type="number" min="1" readonly aria-label="Folio final calculado automáticamente"></label>
            <label>Fecha del acto <input name="actDate" type="date" required></label>
            <label>Municipio <input name="actCity" required value="La Vega"></label>
            <label>Provincia <select name="actProvince" required>${optionList(PROVINCES, "La Vega")}</select></label>
            <label class="span-two">Tipografía del pagaré <select name="printFont" required><option value="courier">Courier New · estilo del original</option><option value="times">Times New Roman · clásico jurídico</option><option value="georgia">Georgia · formal y legible</option><option value="arial">Arial · limpio y moderno</option><option value="myriad">Myriad Pro · si está instalada; si no, Arial</option></select></label>
          </div>
          <aside class="notarial-fixed-data"><i class="fa-solid fa-scale-balanced"></i><div><b>${escape(NOTARY.displayName)}</b><span>${escape(NOTARY.role)} · Colegiatura ${escape(NOTARY.license)}</span></div><small>Notaria y testigos precargados desde el modelo suministrado.</small></aside>
        </section>

        <section class="notarial-section" id="notarialPanelPeople" data-notarial-panel="2" hidden>
          <div class="notarial-section-heading"><span>02</span><div><p>Comparecientes</p><h3>Acreedor y deudor</h3></div></div>
          <fieldset class="creditor-selector">
            <legend>Selecciona el acreedor</legend>
            <label><input name="creditorKey" type="radio" value="jose" checked><span><i class="fa-solid fa-user-tie"></i><b>José Aníbal</b><small>Perfil completo del modelo</small></span></label>
            <label><input name="creditorKey" type="radio" value="jarvis"><span><i class="fa-solid fa-user-tie"></i><b>Jarvis Miguel</b><small>Perfil completo del acreedor</small></span></label>
          </fieldset>
          <div class="application-fields four-columns creditor-profile">
            <label class="span-two">Nombre legal del acreedor <input name="creditorName" required></label>
            <label>Cédula <input name="creditorId" readonly></label>
            <label>Calidad <input value="Dominicano · mayor de edad · soltero · empresario" readonly></label>
            <label class="span-two">Domicilio del acreedor <input name="creditorAddress" readonly></label>
          </div>
          <div class="notarial-subheading"><span>Primer deudor</span><small>Los campos con listas reducen errores de redacción.</small></div>
          <div class="application-fields four-columns">
            <label class="span-two">Nombre completo <input name="debtorName" required placeholder="Nombre y apellidos"></label>
            <label>Cédula <input name="debtorId" inputmode="numeric" required placeholder="000-0000000-0"></label>
            <label>Tratamiento <select name="debtorGender" required><option value="male">Señor</option><option value="female">Señora</option></select></label>
            <label>Nacionalidad <select name="debtorNationality" required>${optionList(["Dominicano(a)", "Haitiano(a)", "Venezolano(a)", "Colombiano(a)", "Estadounidense", "Otro"], "Dominicano(a)")}</select></label>
            <label>Estado civil <select name="debtorCivilStatus" required>${optionList(["Soltero(a)", "Casado(a)", "Unión libre", "Divorciado(a)", "Viudo(a)"], "Soltero(a)")}</select></label>
            <label>Ocupación <select name="debtorOccupation" required>${optionList(["Empleado(a) privado(a)", "Empleado(a) público(a)", "Comerciante", "Empresario(a)", "Independiente", "Profesional", "Ama de casa", "Pensionado(a)", "Otra"], "Empleado(a) privado(a)")}</select></label>
            <label>Otra ocupación <input name="debtorOccupationOther" placeholder="Solo si elegiste Otra"></label>
            <label class="span-two">Dirección o calle <input name="debtorAddress" required placeholder="Ej. Calle Principal"></label>
            <label>Número de casa <input name="debtorHouseNumber" required placeholder="Ej. 24 o S/N"></label>
            <label>Sector <input name="debtorSector" required placeholder="Sector o paraje"></label>
            <label>Ciudad <input name="debtorCity" required value="La Vega"></label>
            <label>Provincia <select name="debtorProvince" required>${optionList(PROVINCES, "La Vega")}</select></label>
          </div>
        </section>

        <section class="notarial-section" id="notarialPanelTerms" data-notarial-panel="3" hidden>
          <div class="notarial-section-heading"><span>03</span><div><p>Obligación</p><h3>Condiciones financieras</h3></div></div>
          <div class="application-fields four-columns">
            <label>Capital prestado <span class="currency-input"><b>RD$</b><input name="principal" inputmode="decimal" required placeholder="0.00"></span></label>
            <label>Tasa por período (%) <input name="rate" type="number" min="0" step="0.01" required placeholder="0.00"></label>
            <label>Modalidad <select name="frequency" required><option value="monthly">Mensual</option><option value="biweekly">Quincenal</option><option value="weekly">Semanal</option></select></label>
            <label>Cantidad de cuotas <input name="installments" type="number" min="1" required placeholder="Ej. 6"></label>
            <label class="span-two">Método de cálculo <select name="calculationMode" required><option value="absolute">Saldo absoluto</option><option value="declining">Saldo insoluto · cuota fija</option><option value="bullet">Interés periódico y capital al término</option></select></label>
            <label>Fecha de desembolso <input name="disbursementDate" type="date" required></label>
            <label>Primera cuota <input name="firstDueDate" type="date" required></label>
            <label>Fecha final · automática <input name="finalDueDate" type="date" readonly aria-label="Fecha final calculada automáticamente"></label>
            <label>Mora mensual pactada (%) <input name="lateRate" type="number" min="0" step="0.01" required placeholder="Escribe la tasa acordada"></label>
            <label class="span-two">Concepto del préstamo <select name="loanPurpose" required>${optionList(["Préstamo personal", "Préstamo comercial o capital de trabajo", "Financiamiento de motocicleta", "Saldo financiado de motocicleta", "Financiamiento de smartphone", "Financiamiento de electrodoméstico", "Otro"], "Préstamo personal")}</select></label>
          </div>
          <label class="notarial-confirmation"><input name="disbursementConfirmed" type="checkbox"><span><b>Confirmo que el capital ya fue desembolsado</b><small>La versión final no se habilita hasta confirmar este hecho. La fecha indicada debe corresponder al desembolso real.</small></span></label>
          <aside class="notarial-calculation" aria-live="polite">
            <div><span>Cuota regular</span><strong data-calc="payment">RD$0.00</strong></div>
            <div><span>Interés total</span><strong data-calc="interest">RD$0.00</strong></div>
            <div><span>Total comprometido</span><strong data-calc="total">RD$0.00</strong></div>
            <div><span>Último vencimiento</span><strong data-calc="due">—</strong></div>
            <p data-calc="note">Completa capital, tasa y cuotas para validar la operación.</p>
          </aside>
          <p class="notarial-guarantee-note"><i class="fa-solid fa-shield-halved"></i><span><b>Cláusula patrimonial conservada.</b> El pagaré mantendrá el compromiso de bienes universales y la renuncia indicada en el modelo aprobado.</span></p>
        </section>

        <section class="notarial-section notarial-review-section" id="notarialPanelReview" data-notarial-panel="4" hidden>
          <div class="notarial-section-heading"><span>04</span><div><p>Control final</p><h3>Revisión antes de imprimir</h3></div></div>
          <div class="notarial-review" aria-live="polite">
            <div><span>Acto y folios</span><strong data-review="control">Pendiente</strong></div>
            <div><span>Acreedor</span><strong data-review="creditor">José Aníbal Moronta Mejía</strong></div>
            <div><span>Deudor</span><strong data-review="debtor">Pendiente</strong></div>
            <div><span>Obligación</span><strong data-review="loan">Pendiente</strong></div>
          </div>
          <div class="notarial-warning"><i class="fa-solid fa-triangle-exclamation"></i><span><b>Borrador sujeto a revisión notarial.</b> El sistema prepara el texto y verifica las cifras; la notaria conserva el control del protocolo, la lectura, las firmas y la expedición.</span></div>
        </section>

        <nav class="notarial-flow-controls" aria-label="Navegación del formulario">
          <button class="quiet-btn" type="button" data-notarial-back hidden><i class="fa-solid fa-arrow-left"></i> Anterior</button>
          <div><b data-notarial-stage-name>Control del acto</b><small data-notarial-stage-help>Completa la identificación del instrumento.</small></div>
          <button class="primary-btn" type="button" data-notarial-next>Continuar <i class="fa-solid fa-arrow-right"></i></button>
        </nav>
        <section class="notarial-actions" data-notarial-final-actions hidden>
          <div><i class="fa-solid fa-lock"></i><span><b>Datos temporales</b><small>La información se elimina al limpiar o cerrar esta página.</small></span></div>
          <aside><button class="quiet-btn" type="button" data-notarial-clear><i class="fa-solid fa-eraser"></i> Limpiar</button><button class="primary-btn" type="button" data-notarial-print><i class="fa-solid fa-print"></i> Revisar e imprimir</button></aside>
          <p class="application-status" data-notarial-status aria-live="polite">Completa las cuatro secciones para preparar el pagaré.</p>
          <small class="notarial-print-help">Al imprimir: papel Carta, escala 100 % y encabezados/pies del navegador desactivados.</small>
        </section>
      </form>
      </div>
      <aside class="notarial-preview-panel" data-notarial-preview aria-label="Vista previa del pagaré">
        <header class="notarial-preview-toolbar">
          <div><span>Documento en vivo</span><h3>Vista previa Carta</h3></div>
          <strong data-preview-state><i class="fa-solid fa-pen-ruler"></i> Borrador</strong>
        </header>
        <div class="notarial-preview-alert" data-preview-alert aria-live="polite"><i class="fa-solid fa-circle-info"></i><span>Completa los datos; el documento se actualiza automáticamente.</span></div>
        <div class="notarial-preview-viewport" data-preview-viewport>
          <div class="notarial-preview-pages notarial-print-report is-measuring" data-preview-pages data-current-page="1"></div>
        </div>
        <nav class="notarial-preview-nav" aria-label="Páginas de la vista previa">
          <button type="button" data-preview-previous aria-label="Página anterior"><i class="fa-solid fa-chevron-left"></i></button>
          <button type="button" data-preview-next aria-label="Página siguiente"><i class="fa-solid fa-chevron-right"></i></button>
        </nav>
        <footer><i class="fa-solid fa-shield-check"></i><span>La vista previa y la impresión usan el mismo texto, cálculos y paginación.</span></footer>
      </aside>
      </div>`;
    shell.append(workspace);

    const report = document.createElement("section");
    report.className = "document-print-report notarial-print-report";
    report.id = "notarialPromissoryPrintReport";
    report.setAttribute("aria-label", "Pagaré notarial imprimible");
    document.body.append(report);

    const form = workspace.querySelector("form");
    const status = form.querySelector("[data-notarial-status]");
    const previewPanel = workspace.querySelector("[data-notarial-preview]");
    const previewViewport = previewPanel.querySelector("[data-preview-viewport]");
    const previewPages = previewPanel.querySelector("[data-preview-pages]");
    const previewState = previewPanel.querySelector("[data-preview-state]");
    const previewAlert = previewPanel.querySelector("[data-preview-alert]");
    const previewPrevious = previewPanel.querySelector("[data-preview-previous]");
    const previewNext = previewPanel.querySelector("[data-preview-next]");
    const stepButtons = [...workspace.querySelectorAll("[data-notarial-step]")];
    const stepPanels = [...form.querySelectorAll("[data-notarial-panel]")];
    const backButton = form.querySelector("[data-notarial-back]");
    const nextButton = form.querySelector("[data-notarial-next]");
    const finalActions = form.querySelector("[data-notarial-final-actions]");
    const stageName = form.querySelector("[data-notarial-stage-name]");
    const stageHelp = form.querySelector("[data-notarial-stage-help]");
    let currentPreviewPage = 1;
    let currentFormStep = 1;
    let previewTimer = 0;
    let previewRevision = 0;
    const creditorName = form.elements.creditorName;
    const creditorId = form.elements.creditorId;
    const creditorAddress = form.elements.creditorAddress;

    const value = (name) => String(form.elements[name]?.value || "").trim();
    const FORM_STAGES = {
      1: { name: "Control del acto", help: "Completa la identificación del instrumento.", fields: ["actNumber", "folioStart", "actDate", "actCity", "actProvince", "printFont"] },
      2: { name: "Comparecientes", help: "Identifica al acreedor y al deudor sin repetir datos.", fields: ["creditorName", "creditorId", "creditorAddress", "debtorName", "debtorId", "debtorNationality", "debtorCivilStatus", "debtorOccupation", "debtorAddress", "debtorHouseNumber", "debtorSector", "debtorCity", "debtorProvince"] },
      3: { name: "Condiciones financieras", help: "Define capital, tasa, calendario y desembolso.", fields: ["principal", "rate", "frequency", "installments", "calculationMode", "disbursementDate", "firstDueDate", "lateRate", "loanPurpose", "disbursementConfirmed"] },
      4: { name: "Revisión final", help: "Confirma el resumen y revisa el documento antes de imprimir.", fields: [] }
    };
    const fieldIsComplete = (name) => name === "disbursementConfirmed" ? form.elements[name].checked : Boolean(value(name));
    const stageIsComplete = (step) => step === 4 ? !validate() : FORM_STAGES[step].fields.every(fieldIsComplete);

    function setFormStep(requestedStep, focusHeading = false) {
      currentFormStep = Math.min(Math.max(Number(requestedStep) || 1, 1), 4);
      stepPanels.forEach((panel) => { panel.hidden = Number(panel.dataset.notarialPanel) !== currentFormStep; });
      stepButtons.forEach((button) => {
        const step = Number(button.dataset.notarialStep);
        button.classList.toggle("is-active", step === currentFormStep);
        button.classList.toggle("is-complete", stageIsComplete(step));
        if (step === currentFormStep) button.setAttribute("aria-current", "step"); else button.removeAttribute("aria-current");
      });
      backButton.hidden = currentFormStep === 1;
      nextButton.hidden = currentFormStep === 4;
      finalActions.hidden = currentFormStep !== 4;
      stageName.textContent = FORM_STAGES[currentFormStep].name;
      stageHelp.textContent = FORM_STAGES[currentFormStep].help;
      if (focusHeading) stepPanels.find((panel) => !panel.hidden)?.querySelector("h3")?.focus({ preventScroll: true });
    }
    const integerWords = (raw) => {
      const n = Math.max(0, Math.floor(Number(raw) || 0));
      const units = ["CERO", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE", "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
      const tens = ["", "", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
      const hundreds = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];
      const specialTwenties = { 21: "VEINTIUNO", 22: "VEINTIDÓS", 23: "VEINTITRÉS", 26: "VEINTISÉIS" };
      const under100 = (x) => x < 20 ? units[x] : x < 30 ? (x === 20 ? "VEINTE" : specialTwenties[x] || `VEINTI${units[x - 20]}`) : `${tens[Math.floor(x / 10)]}${x % 10 ? ` Y ${units[x % 10]}` : ""}`;
      const under1000 = (x) => x === 100 ? "CIEN" : x < 100 ? under100(x) : `${hundreds[Math.floor(x / 100)]}${x % 100 ? ` ${under100(x % 100)}` : ""}`;
      const apocope = (words) => words.replace(/VEINTIUNO$/, "VEINTIÚN").replace(/ Y UNO$/, " Y UN").replace(/UNO$/, "UN");
      if (n < 1000) return under1000(n);
      if (n < 1000000) {
        const thousands = Math.floor(n / 1000);
        const rest = n % 1000;
        return `${thousands === 1 ? "MIL" : `${apocope(under1000(thousands))} MIL`}${rest ? ` ${under1000(rest)}` : ""}`;
      }
      const millions = Math.floor(n / 1000000);
      const rest = n % 1000000;
      return `${millions === 1 ? "UN MILLÓN" : `${apocope(integerWords(millions))} MILLONES`}${rest ? ` ${integerWords(rest)}` : ""}`;
    };
    const amountWords = (raw) => {
      const amount = Math.round(numeric(raw) * 100) / 100;
      const cents = Math.round((amount - Math.floor(amount)) * 100);
      return `${integerWords(Math.floor(amount))} PESOS DOMINICANOS CON ${String(cents).padStart(2, "0")}/100`;
    };
    const decimalWords = (raw) => {
      const [whole, decimals] = numeric(raw).toFixed(2).split(".");
      return `${integerWords(Number(whole))}${Number(decimals) ? ` PUNTO ${integerWords(Number(decimals))}` : ""}`;
    };
    const prettyDate = (raw) => {
      if (!raw) return "—";
      return new Intl.DateTimeFormat("es-DO", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${raw}T00:00:00Z`));
    };
    const dateWords = (raw) => {
      if (!raw) return "FECHA PENDIENTE";
      const [year, month, day] = raw.split("-").map(Number);
      const months = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
      return `${integerWords(day)} (${String(day).padStart(2, "0")}) DÍAS DEL MES DE ${months[month - 1]} DEL AÑO ${integerWords(year)} (${year})`;
    };
    const gendered = (text, female) => {
      const pairs = {
        "Dominicano(a)": ["Dominicano", "Dominicana"], "Haitiano(a)": ["Haitiano", "Haitiana"], "Venezolano(a)": ["Venezolano", "Venezolana"], "Colombiano(a)": ["Colombiano", "Colombiana"],
        "Soltero(a)": ["Soltero", "Soltera"], "Casado(a)": ["Casado", "Casada"], "Divorciado(a)": ["Divorciado", "Divorciada"], "Viudo(a)": ["Viudo", "Viuda"],
        "Empleado(a) privado(a)": ["Empleado privado", "Empleada privada"], "Empleado(a) público(a)": ["Empleado público", "Empleada pública"], "Empresario(a)": ["Empresario", "Empresaria"], "Pensionado(a)": ["Pensionado", "Pensionada"]
      };
      return pairs[text]?.[female ? 1 : 0] || text;
    };
    const frequencyMeta = () => ({
      monthly: { singular: "MENSUAL", plural: "MENSUALES", unit: "mes", add: (date, count) => date.setUTCMonth(date.getUTCMonth() + count) },
      biweekly: { singular: "QUINCENAL", plural: "QUINCENALES", unit: "quincena", add: (date, count) => date.setUTCDate(date.getUTCDate() + (15 * count)) },
      weekly: { singular: "SEMANAL", plural: "SEMANALES", unit: "semana", add: (date, count) => date.setUTCDate(date.getUTCDate() + (7 * count)) }
    })[value("frequency") || "monthly"];
    const calculate = () => {
      const principal = numeric(value("principal"));
      const rate = numeric(value("rate")) / 100;
      const installments = Math.max(0, Math.floor(numeric(value("installments"))));
      const mode = value("calculationMode");
      let payment = 0; let interest = 0; let total = 0; let finalPayment = 0;
      if (principal > 0 && installments > 0) {
        if (mode === "declining") {
          payment = rate ? principal * (rate * ((1 + rate) ** installments)) / (((1 + rate) ** installments) - 1) : principal / installments;
          total = payment * installments; interest = total - principal; finalPayment = payment;
        } else if (mode === "bullet") {
          payment = principal * rate; interest = payment * installments; total = principal + interest; finalPayment = principal + payment;
        } else {
          interest = principal * rate * installments; total = principal + interest; payment = total / installments; finalPayment = payment;
        }
      }
      let dueDate = "";
      if (value("firstDueDate") && installments) {
        const date = new Date(`${value("firstDueDate")}T00:00:00Z`);
        frequencyMeta().add(date, installments - 1);
        dueDate = date.toISOString().slice(0, 10);
      }
      return { principal, rate, installments, mode, payment, interest, total, finalPayment, dueDate };
    };
    const modeLabel = (mode) => ({ absolute: "saldo absoluto", declining: "saldo insoluto con cuota fija", bullet: "interés periódico y capital al término" })[mode] || "saldo absoluto";

    function syncCreditor() {
      const key = value("creditorKey") || "jose";
      const profile = CREDITORS[key];
      creditorName.value = profile.name;
      creditorName.placeholder = "Nombre legal";
      creditorName.readOnly = true;
      creditorId.value = profile.id;
      creditorAddress.value = profile.address;
      updateReview();
    }

    function updateCalculation() {
      const result = calculate();
      form.querySelector('[data-calc="payment"]').textContent = result.mode === "bullet" ? `${money(result.payment)} interés` : money(result.payment);
      form.querySelector('[data-calc="interest"]').textContent = money(result.interest);
      form.querySelector('[data-calc="total"]').textContent = money(result.total);
      form.querySelector('[data-calc="due"]').textContent = prettyDate(result.dueDate);
      form.elements.finalDueDate.value = result.dueDate;
      form.querySelector('[data-calc="note"]').textContent = result.mode === "bullet"
        ? `Pago periódico de interés: ${money(result.payment)}. Pago final con capital: ${money(result.finalPayment)}.`
        : `Cálculo por ${modeLabel(result.mode)} · ${result.installments || 0} cuotas ${frequencyMeta().plural.toLowerCase()}.`;
      updateReview();
    }

    function updateReview() {
      const result = calculate();
      form.querySelector('[data-review="control"]').textContent = value("actNumber") && value("folioStart") && value("folioEnd") ? `Acto ${value("actNumber")} · folios ${value("folioStart")}–${value("folioEnd")}` : "Pendiente";
      form.querySelector('[data-review="creditor"]').textContent = value("creditorName") || "Pendiente";
      form.querySelector('[data-review="debtor"]').textContent = value("debtorName") || "Pendiente";
      form.querySelector('[data-review="loan"]').textContent = result.principal && result.installments ? `${money(result.principal)} · ${result.installments} cuotas · ${modeLabel(result.mode)}` : "Pendiente";
      form.querySelector('[data-desk-summary="act"]').textContent = value("actNumber") ? `Acto ${value("actNumber")}` : "Sin número";
      form.querySelector('[data-desk-detail="folio"]').textContent = value("folioStart") ? `Desde folio ${value("folioStart")}` : "Folio pendiente";
      form.querySelector('[data-desk-summary="debtor"]').textContent = value("debtorName") || "Sin identificar";
      form.querySelector('[data-desk-detail="identity"]').textContent = value("debtorId") || "Cédula pendiente";
      form.querySelector('[data-desk-summary="principal"]').textContent = money(result.principal);
      form.querySelector('[data-desk-detail="term"]').textContent = result.installments ? `${result.installments} ${frequencyMeta().plural.toLowerCase()}` : "Sin plazo";
      form.querySelector('[data-desk-summary="payment"]').textContent = money(result.payment);
      form.querySelector('[data-desk-detail="frequency"]').textContent = frequencyMeta().singular;
      stepButtons.forEach((button) => button.classList.toggle("is-complete", stageIsComplete(Number(button.dataset.notarialStep))));
    }

    function validate() {
      const labels = {
        actNumber: "número de acto", folioStart: "folio inicial", actDate: "fecha del acto", actCity: "municipio del acto", actProvince: "provincia del acto",
        creditorName: "nombre legal del acreedor", debtorName: "nombre del deudor", debtorId: "cédula del deudor", debtorNationality: "nacionalidad", debtorCivilStatus: "estado civil", debtorOccupation: "ocupación",
        debtorAddress: "dirección o calle", debtorHouseNumber: "número de casa", debtorSector: "sector", debtorCity: "ciudad", debtorProvince: "provincia", principal: "capital", rate: "tasa", installments: "cantidad de cuotas", disbursementDate: "fecha de desembolso", firstDueDate: "primera cuota", lateRate: "mora"
      };
      const missing = Object.keys(labels).filter((name) => !value(name));
      if (missing.length) return { field: missing[0], message: `Completa ${missing.map((name) => labels[name]).join(", ")}.` };
      if (String(value("debtorId")).replace(/\D/g, "").length !== 11) return { field: "debtorId", message: "La cédula del deudor debe tener 11 dígitos." };
      if (numeric(value("folioEnd")) < numeric(value("folioStart"))) return { field: "folioEnd", message: "El folio final no puede ser menor que el folio inicial." };
      if (numeric(value("principal")) <= 0 || numeric(value("installments")) < 1) return { field: "principal", message: "El capital y la cantidad de cuotas deben ser mayores que cero." };
      if (value("debtorOccupation") === "Otra" && !value("debtorOccupationOther")) return { field: "debtorOccupationOther", message: "Escribe la ocupación del deudor." };
      if (value("firstDueDate") < value("disbursementDate")) return { field: "firstDueDate", message: "La primera cuota no puede ser anterior al desembolso." };
      if (!form.elements.disbursementConfirmed.checked) return { field: "disbursementConfirmed", message: "Confirma que el capital fue desembolsado antes de preparar la versión final." };
      return null;
    }

    const printHeader = () => `<header class="notarial-print-header"><img src="escudo-notarial.png" alt=""><h1>${escape(NOTARY.displayName)}</h1><p>Notario Público del Municipio Concepción de La Vega, República Dominicana</p><b>Colegiatura No. ${escape(NOTARY.license)}</b></header>`;
    const controlLine = (folio) => FinanDocumentBlocks.formatNotarialControlLine({
      actNumber: value("actNumber"),
      actWords: integerWords(value("actNumber")),
      folioNumber: folio,
      folioWords: integerWords(folio)
    });

    function showPreviewPage(requestedPage, resetViewport = true) {
      const pages = [...previewPages.querySelectorAll(".notarial-print-page")];
      const total = Math.max(1, pages.length);
      currentPreviewPage = Math.min(Math.max(1, requestedPage), total);
      previewPages.dataset.currentPage = String(currentPreviewPage);
      pages.forEach((page, index) => { page.hidden = index + 1 !== currentPreviewPage; });
      previewPrevious.disabled = currentPreviewPage <= 1;
      previewNext.disabled = currentPreviewPage >= total;
      if (resetViewport) previewViewport.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    function refreshLivePreview() {
      const paginationValid = renderPrint();
      const pages = [...report.querySelectorAll(".notarial-print-page")].map((page, index) => {
        const clone = page.cloneNode(true);
        clone.classList.add("notarial-preview-sheet");
        clone.dataset.previewPage = String(index + 1);
        clone.removeAttribute("data-page-index");
        return clone;
      });
      previewPages.replaceChildren(...pages);
      const problem = validate();
      const ready = !problem && paginationValid;
      previewState.className = ready ? "is-ready" : "is-draft";
      previewState.innerHTML = ready
        ? '<i class="fa-solid fa-circle-check"></i> Listo para revisar'
        : '<i class="fa-solid fa-pen-ruler"></i> Borrador';
      previewAlert.classList.toggle("is-ready", ready);
      previewAlert.innerHTML = ready
        ? '<i class="fa-solid fa-circle-check"></i><span>Datos completos y paginación válida. Revisa el texto antes de imprimir.</span>'
        : `<i class="fa-solid fa-circle-info"></i><span>${escape(problem?.message || "La paginación necesita revisión.")}</span>`;
      status.className = ready ? "application-status is-success" : "application-status";
      status.textContent = ready
        ? "Documento completo y listo para revisar antes de imprimir."
        : (problem?.message || "Completa las cuatro secciones para preparar el pagaré.");
      showPreviewPage(Math.min(currentPreviewPage, Math.max(1, pages.length)), false);
    }

    function queueLivePreview() {
      window.clearTimeout(previewTimer);
      const revision = ++previewRevision;
      previewTimer = window.setTimeout(async () => {
        await FinanNotarialFonts.waitForNotarialFont(document.fonts, value("printFont")).catch(() => {});
        if (revision === previewRevision) refreshLivePreview();
      }, 90);
    }

    function renderPrint() {
      const geometry = FinanPageGeometry.letterPageGeometry();
      [report, previewPages].forEach((surface) => {
        surface.style.setProperty("--notarial-content-width", `${geometry.contentWidthIn}in`);
        surface.style.setProperty("--notarial-content-height", `${geometry.contentHeightIn}in`);
      });
      const result = calculate();
      const fontClass = FinanNotarialFonts.selectNotarialFont(value("printFont")).className;
      const female = value("debtorGender") === "female";
      const debtorTitle = female ? "la señora" : "el señor";
      const debtorRole = female ? "LA DEUDORA" : "EL DEUDOR";
      const nationality = gendered(value("debtorNationality"), female);
      const civilStatus = gendered(value("debtorCivilStatus"), female);
      const occupation = value("debtorOccupation") === "Otra" ? value("debtorOccupationOther") : gendered(value("debtorOccupation"), female);
      const debtorAddress = `${value("debtorAddress")}, CASA NÚMERO ${value("debtorHouseNumber")}, SECTOR ${value("debtorSector")}, CIUDAD DE ${value("debtorCity")}, PROVINCIA ${value("debtorProvince")}, REPÚBLICA DOMINICANA`.toLocaleUpperCase("es-DO");
      const debtorSignatures = `<div class="wide"><span></span><b>${escape(value("debtorName")).toUpperCase()}</b><small>${debtorRole.replace("LA ", "").replace("EL ", "")}</small></div>`;
      const frequency = frequencyMeta();
      const termUnits = { mes: ["MES", "MESES"], quincena: ["QUINCENA", "QUINCENAS"], semana: ["SEMANA", "SEMANAS"] };
      const termUnit = termUnits[frequency.unit]?.[result.installments === 1 ? 0 : 1] || "PERÍODOS";
      const periodicRate = `${decimalWords(value("rate"))} POR CIENTO (${numeric(value("rate")).toFixed(2)}%) ${frequency.singular}`;
      const paymentText = result.mode === "bullet"
        ? `mediante <strong>${integerWords(result.installments)} (${String(result.installments).padStart(2, "0")}) PAGOS</strong> de intereses de <strong>${amountWords(result.payment)} (${money(result.payment)})</strong>, y un pago final de capital e interés ascendente a <strong>${amountWords(result.finalPayment)} (${money(result.finalPayment)})</strong>`
        : `mediante <strong>${integerWords(result.installments)} (${String(result.installments).padStart(2, "0")}) CUOTAS</strong> ascendentes a <strong>${amountWords(result.payment)} (${money(result.payment)})</strong>, cuotas <strong>IGUALES, ${escape(frequency.plural).toLocaleUpperCase("es-DO")} Y CONSECUTIVAS</strong>`;
      const basis = result.mode === "declining" ? "sobre saldo insoluto" : result.mode === "bullet" ? "sobre el capital pendiente hasta su vencimiento" : "sobre saldo absoluto";
      const latePenalty = `<strong class="notarial-no-break">${integerWords(numeric(value("lateRate")))} (${numeric(value("lateRate")).toFixed(0)}%) POR CIENTO MENSUAL</strong>`;
      const fourthClause = `<strong data-notarial-article>CUARTO:</strong> Queda entendido, y así lo declara y acepta <strong>EL DEUDOR</strong>, que, en caso de incumplimiento en el pago de cualquier cuota <strong>${escape(frequency.singular).toLocaleUpperCase("es-DO")}</strong>, perderá de pleno derecho el beneficio del término, lo cual facultará a <strong>EL ACREEDOR</strong> para reclamar el total de la deuda;<span data-notarial-break> así como los accesorios de un ${latePenalty} sobre la suma vencida;</span>`;
      const confirmedDisbursement = form.elements.disbursementConfirmed.checked;
      const debtOrigin = confirmedDisbursement
        ? `con ocasión de <strong>${escape(value("loanPurpose").toLocaleUpperCase("es-DO"))}</strong>, cuyo capital fue desembolsado en fecha <strong>${escape(dateWords(value("disbursementDate")))}</strong>`
        : `con ocasión de <strong>${escape(value("loanPurpose").toLocaleUpperCase("es-DO"))}</strong>, con <strong>DESEMBOLSO PENDIENTE DE CONFIRMACIÓN</strong>`;
      const termOrigin = confirmedDisbursement
        ? `a partir del desembolso efectuado en fecha <strong>${escape(dateWords(value("disbursementDate")))}</strong>`
        : `a partir del desembolso, cuya realización permanece <strong>PENDIENTE DE CONFIRMACIÓN</strong>`;
      const legalHtml = `En la provincia de <strong>${escape(value("actProvince").toLocaleUpperCase("es-DO"))}</strong>, República Dominicana, a los <strong>${escape(dateWords(value("actDate")))}</strong>. Por ante mí, <strong>${escape(NOTARY.legalName)}</strong>, ${escape(NOTARY.role)}, inscrita en el Colegio Dominicano de Notarios bajo el No. <strong>${escape(NOTARY.license)}</strong>, portadora de la cédula de identidad y electoral marcada con el número <strong>${escape(NOTARY.id)}</strong>, con mi estudio abierto en el <strong>${escape(NOTARY.office).toLocaleUpperCase("es-DO")}</strong>, República Dominicana. En presencia de los señores <strong>${escape(WITNESSES[0].name)}</strong> y <strong>${escape(WITNESSES[1].name)}</strong>, dominicanos, mayores de edad, solteros, portadores de las cédulas de identidad y electorales marcadas con los números <strong>${escape(WITNESSES[0].id)}</strong> y <strong>${escape(WITNESSES[1].id)}</strong>, domiciliados y residentes en <strong>${escape(WITNESSES[0].address).toLocaleUpperCase("es-DO")}</strong> y <strong>${escape(WITNESSES[1].address).toLocaleUpperCase("es-DO")}</strong>, respectivamente, de esta ciudad de La Vega; testigos instrumentales libres de tachas exigidas por la ley. <strong>HAN COMPARECIDO LIBRE Y VOLUNTARIAMENTE:</strong> De una parte, el señor <strong>${escape(value("creditorName").toLocaleUpperCase("es-DO"))}</strong>, dominicano, mayor de edad, soltero, empresario, domiciliado en <strong>${escape(value("creditorAddress").toLocaleUpperCase("es-DO"))}</strong>, portador de la cédula de identidad y electoral número <strong>${escape(value("creditorId"))}</strong>, quien en lo adelante se denominará <strong>EL ACREEDOR</strong>; y de la otra parte, ${debtorTitle} <strong>${escape(value("debtorName").toLocaleUpperCase("es-DO"))}</strong>, <strong>${escape(nationality.toLocaleUpperCase("es-DO"))}</strong>, mayor de edad, <strong>${escape(civilStatus.toLocaleUpperCase("es-DO"))}</strong>, <strong>${escape(occupation.toLocaleUpperCase("es-DO"))}</strong>, identificado${female ? "a" : ""} con la cédula de identidad y electoral marcada con el número <strong>${escape(value("debtorId"))}</strong>, domiciliado${female ? "a" : ""} y residente en <strong>${escape(debtorAddress)}</strong>, quien en lo adelante se denominará <strong>${debtorRole}</strong>. Quien me ha <strong>DECLARADO LO SIGUIENTE:</strong> <strong data-notarial-article>PRIMERO:</strong> Que <strong>${debtorRole}</strong> declara y reconoce ser deudor${female ? "a" : ""} personal, pur${female ? "a" : "o"}, simple y sin condición de ninguna especie a favor de <strong>EL ACREEDOR</strong>, por la suma de <strong>${escape(amountWords(result.principal))} (${money(result.principal)})</strong>, ${debtOrigin}; <strong data-notarial-article>SEGUNDO:</strong> Que, para seguridad de los valores adeudados a <strong>EL ACREEDOR</strong>, <strong>${debtorRole}</strong> consiente suscribir el presente pagaré notarial a favor de la primera parte; <strong data-notarial-article>TERCERO:</strong> Que los valores que <strong>${debtorRole} RECONOCE ADEUDAR</strong> a <strong>EL ACREEDOR</strong> son productivos de un <strong>${escape(periodicRate).toLocaleUpperCase("es-DO")}</strong>, <strong>${escape(basis).toLocaleUpperCase("es-DO")}</strong>, pagaderos ${paymentText}, en un término de <strong>${integerWords(result.installments)} (${String(result.installments).padStart(2, "0")}) ${termUnit}</strong> ${termOrigin}, sin necesidad de puesta en mora o advertencia ulterior en tal sentido; ${fourthClause} <strong data-notarial-article>QUINTO:</strong> Que, para seguridad de la suma adeudada, <strong>${debtorRole}</strong> compromete <strong>TODOS SUS BIENES UNIVERSALES HASTA LA TOTAL CANCELACIÓN DE LA DEUDA, RENUNCIANDO DESDE AHORA Y PARA SIEMPRE, DE MANERA FORMAL, DEFINITIVA Y EXPRESA, AL BENEFICIO DE EXCUSIÓN</strong>; <strong data-notarial-article>SEXTO:</strong> Que las partes han decidido dar fe pública a su otorgamiento, conforme a las disposiciones legales que resulten aplicables, sin que este sistema garantice su aceptación judicial; <strong data-notarial-article>SÉPTIMO:</strong> Que las partes hacen formal elección de domicilio y residencia en las direcciones anteriormente señaladas. Las declaraciones contenidas en el presente acto fueron realizadas de manera personal, libre y voluntaria por los comparecientes ante mí, quienes han firmado junto a mí el presente acto una vez que hemos leído en alta voz su contenido y comprobado que constituye la fiel transcripción de la declaración de voluntad hecha por ellos. Por todo lo cual rubricamos el presente acto en cada una de sus fojas, y yo certifico y doy fe.<span class="notarial-closing-rule" aria-hidden="true"></span>`;
      const signaturesHtml = `<section class="notarial-signatures">${debtorSignatures}<div><span></span><b>${escape(WITNESSES[0].name)}</b><small>Testigo instrumental</small></div><div><span></span><b>${escape(WITNESSES[1].name)}</b><small>Testigo instrumental</small></div><div class="wide"><span></span><b>${escape(value("creditorName")).toUpperCase()}</b><small>ACREEDOR</small></div><div class="wide notary"><span></span><b>${escape(NOTARY.legalName)}</b><small>Abogada Notaria · Matrícula No. ${escape(NOTARY.license)}</small></div></section>`;
      const source = document.createElement("p");
      source.innerHTML = legalHtml;
      source.querySelector(".notarial-closing-rule")?.remove();
      const normalize = (text) => String(text || "").replace(/\s+/g, " ").trim();
      const integrityText = (text) => normalize(text).replace(/-+$/, "").trim();
      const sourceText = integrityText(source.textContent);
      const segments = [];
      let segment = document.createElement("span");
      segment.className = "notarial-flow-unit";
      [...source.childNodes].forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE && node.matches("strong[data-notarial-article]") && segment.childNodes.length) {
          segments.push(segment);
          segment = document.createElement("span");
          segment.className = "notarial-flow-unit";
        }
        segment.append(node.cloneNode(true));
      });
      if (segment.childNodes.length) segments.push(segment);
      const blocks = FinanDocumentBlocks.composeNotarialBlocks(segments.map((node) => ({
        article: node.querySelector("[data-notarial-article]")?.textContent || null,
        text: node.textContent,
        node
      })));

      const folioStart = numeric(value("folioStart"));
      const continuation = () => {
        const node = document.createElement("p");
        node.className = "notarial-continued";
        node.setAttribute("aria-hidden", "true");
        return node;
      };
      const createPage = (index, withContinuation = true) => {
        const page = document.createElement("article");
        page.className = `notarial-print-page ${index === 0 ? "notarial-print-page--first" : "notarial-print-page--continuation"} ${fontClass}`;
        page.dataset.pageIndex = String(index);
        page.innerHTML = `${index === 0 ? `${printHeader()}<h2>PAGARÉ NOTARIAL</h2>` : ""}${controlLine(String(folioStart + index))}<div class="notarial-legal-copy"><p></p></div>`;
        if (withContinuation) page.querySelector(".notarial-legal-copy").append(continuation());
        report.append(page);
        return page;
      };
      const contentOf = (page) => page.querySelector(".notarial-legal-copy > p:first-child");
      const fits = (page) => page.scrollHeight <= page.clientHeight + 1;
      const atomicNodes = (unit) => {
        const atoms = [];
        const add = (node, wrapper = null) => {
          if (node.nodeType === Node.TEXT_NODE) {
            String(node.textContent).split(/(\s+)/).filter(Boolean).forEach((part) => {
              const text = document.createTextNode(part);
              if (!wrapper) atoms.push(text);
              else { const clone = wrapper.cloneNode(false); clone.append(text); atoms.push(clone); }
            });
            return;
          }
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          if (node.matches("strong, .notarial-no-break")) { atoms.push(node.cloneNode(true)); return; }
          [...node.childNodes].forEach((child) => add(child, node));
        };
        if (unit.nodeType === Node.TEXT_NODE) add(unit);
        else [...unit.childNodes].forEach((node) => add(node));
        return atoms;
      };
      const partialAtom = (atom, text) => {
        if (atom.nodeType === Node.TEXT_NODE) return document.createTextNode(text);
        const clone = atom.cloneNode(false);
        clone.textContent = text;
        return clone;
      };
      const tryPageBreakHyphen = (atom, fragment, currentPage) => {
        if (atom.nodeType !== Node.TEXT_NODE && (atom.nodeType !== Node.ELEMENT_NODE || atom.childNodes.length !== 1 || atom.firstChild.nodeType !== Node.TEXT_NODE)) return null;
        if (atom.nodeType === Node.ELEMENT_NODE && atom.matches("strong, .notarial-no-break")) return null;
        const before = [...fragment.getClientRects()].at(-1);
        if (!before || !fragment.textContent.trim()) return null;
        let accepted = null;
        const split = FinanPaginationEngine.chooseWordBreak(atom.textContent, (head) => {
          const piece = partialAtom(atom, head);
          const mark = document.createElement("span");
          mark.className = "notarial-page-break-hyphen";
          mark.setAttribute("aria-hidden", "true");
          mark.textContent = "-";
          fragment.append(piece, mark);
          const usable = fits(currentPage) && Math.abs(mark.getBoundingClientRect().top - before.top) < 3;
          if (usable) { accepted = { piece, mark }; return true; }
          piece.remove();
          mark.remove();
          return false;
        });
        return split && accepted ? { tail: partialAtom(atom, split.tail) } : null;
      };
      const appendFragmented = (unit, page) => {
        let fragment = document.createElement("span");
        fragment.className = "notarial-flow-fragment";
        contentOf(page).append(fragment);
        atomicNodes(unit).forEach((atom) => {
          fragment.append(atom);
          if (fits(page)) return;
          atom.remove();
          const children = [...fragment.childNodes];
          const lastMeaningful = [...children].reverse().find((child) => child.textContent.trim());
          const orphan = lastMeaningful?.nodeType === Node.ELEMENT_NODE && lastMeaningful.matches("strong[data-notarial-article]");
          const hyphenated = orphan ? null : tryPageBreakHyphen(atom, fragment, page);
          const carry = orphan ? children.slice(children.indexOf(lastMeaningful)) : [];
          carry.forEach((child) => child.remove());
          if (!fragment.childNodes.length) fragment.remove();
          page = createPage(report.querySelectorAll(".notarial-print-page").length);
          fragment = document.createElement("span");
          fragment.className = "notarial-flow-fragment";
          contentOf(page).append(fragment);
          fragment.append(...carry, hyphenated?.tail || atom);
        });
        return page;
      };

      report.replaceChildren();
      report.classList.add("is-measuring");
      let page = createPage(0);
      blocks.forEach(({ node: unit }) => {
        const candidate = unit.cloneNode(true);
        contentOf(page).append(candidate);
        if (fits(page)) return;
        candidate.remove();
        const hasContent = contentOf(page).childNodes.length > 0;
        if (hasContent) {
          const continuationLine = page.querySelector(".notarial-continued");
          const remainingHeight = page.getBoundingClientRect().bottom - continuationLine.getBoundingClientRect().bottom;
          const lineHeight = Number.parseFloat(getComputedStyle(contentOf(page)).lineHeight);
          if (FinanPaginationEngine.shouldContinueBlockOnPage({ remainingHeight, lineHeight })) {
            page = appendFragmented(unit, page);
            return;
          }
          const next = createPage(report.querySelectorAll(".notarial-print-page").length);
          contentOf(next).append(candidate);
          if (fits(next)) { page = next; return; }
          candidate.remove();
          page = appendFragmented(unit, next);
          return;
        }
        page = appendFragmented(unit, page);
      });

      let pages = [...report.querySelectorAll(".notarial-print-page")];
      let lastPage = pages.at(-1);
      lastPage.querySelector(".notarial-continued")?.remove();
      const signatureTemplate = document.createElement("template");
      signatureTemplate.innerHTML = signaturesHtml;
      let signatures = signatureTemplate.content.firstElementChild.cloneNode(true);
      lastPage.append(signatures);
      if (!fits(lastPage)) {
        signatures.remove();
        lastPage.querySelector(".notarial-legal-copy").append(continuation());
        const signaturePage = createPage(pages.length, false);
        signatures = signatureTemplate.content.firstElementChild.cloneNode(true);
        signaturePage.append(signatures);
        const previousContent = contentOf(lastPage);
        const signatureContent = contentOf(signaturePage);
        const lineHeight = Number.parseFloat(getComputedStyle(signatureContent).lineHeight);
        for (let moves = 0; moves < 10000 && previousContent.lastChild; moves += 1) {
          let node = previousContent.lastChild;
          if (node.nodeType === Node.ELEMENT_NODE && node.childNodes.length > 1) {
            const atoms = atomicNodes(node);
            if (atoms.length > 1) {
              node.replaceWith(...atoms);
              node = previousContent.lastChild;
            }
          }
          signatureContent.prepend(node);
          if (!fits(signaturePage) || !previousContent.textContent.trim()) {
            previousContent.append(node);
            break;
          }
          const stop = FinanPaginationEngine.shouldStopTailTransfer({
            movedHeight: signatureContent.getBoundingClientRect().height,
            lineHeight,
            previousHasText: Boolean(previousContent.textContent.trim()),
            previousEndsOrdinal: /(?:PRIMERO|SEGUNDO|TERCERO|CUARTO|QUINTO|SEXTO|SÉPTIMO):\s*$/.test(previousContent.textContent.trim()),
            finalFits: fits(signaturePage)
          });
          if (stop) break;
        }
        lastPage = signaturePage;
      }

      pages = [...report.querySelectorAll(".notarial-print-page")];
      pages.forEach((item, index) => {
        item.dataset.pageNumber = String(index + 1);
        const line = item.querySelector(".notarial-control-line");
        if (line) line.outerHTML = controlLine(String(folioStart + index));
      });
      form.elements.folioEnd.value = value("folioStart") ? String(folioStart + pages.length - 1) : "";
      const closingMode = FinanPaginationEngine.pageClosingMode({ pageIndex: pages.length - 1, totalPages: pages.length, legalText: contentOf(pages.at(-1)).textContent });
      pages.forEach((item, index) => {
        item.classList.toggle("notarial-print-page--flows-on", index < pages.length - 1);
        if (index === pages.length - 1 && closingMode === "final-fill") FinanLineFinisher.fillTrailingLine(contentOf(item));
        item.querySelector(".notarial-continued")?.setAttribute("data-follows-page", String(index + 2));
      });
      const legalTextOf = (item) => {
        const clone = contentOf(item).cloneNode(true);
        clone.querySelectorAll(".notarial-line-fill, .notarial-page-break-hyphen").forEach((fill) => fill.remove());
        return clone.textContent;
      };
      const fillSameLine = (item) => {
        const filler = contentOf(item).querySelector(".notarial-line-fill");
        if (!filler) return true;
        const previous = filler.previousSibling;
        if (!previous || previous.nodeType !== Node.TEXT_NODE || !previous.textContent.length) return false;
        const range = document.createRange();
        range.setStart(previous, previous.textContent.length - 1);
        range.setEnd(previous, previous.textContent.length);
        const lineTop = range.getBoundingClientRect().top;
        return [...filler.getClientRects()].every((box) => Math.abs(box.top - lineTop) < 3);
      };
      const renderedText = integrityText(pages.map(legalTextOf).join(""));
      const diagnostics = FinanDocumentLayout.validateDocumentLayout({
        sourceText,
        pages: pages.map((item, index) => {
          const group = item.querySelector(".notarial-signatures");
          const legalText = legalTextOf(item);
          const signatureRows = group ? [...group.children].map((signer) => signer.getBoundingClientRect()).reduce((rows, box) => {
            if (rows.length && Math.abs(rows.at(-1).top - box.top) < 3) rows.at(-1).bottom = Math.max(rows.at(-1).bottom, box.bottom);
            else rows.push({ top: box.top, bottom: box.bottom });
            return rows;
          }, []) : [];
          return {
            legalText,
            contentBottom: contentOf(item).getBoundingClientRect().bottom,
            pageBottom: item.getBoundingClientRect().bottom,
            hasContinuation: Boolean(item.querySelector(".notarial-continued")),
            continuationBottom: item.querySelector(".notarial-continued")?.getBoundingClientRect().bottom ?? null,
            continuationLastLineStretched: index < pages.length - 1 && getComputedStyle(contentOf(item)).textAlignLast === "justify",
            fillCount: item.querySelectorAll(".notarial-line-fill").length,
            signatureBottom: group?.lastElementChild?.getBoundingClientRect().bottom ?? null,
            signatureFirstTop: group?.firstElementChild?.getBoundingClientRect().top ?? null,
            signatureRowGaps: signatureRows.slice(1).map((row, index) => row.top - signatureRows[index].bottom),
            signatureCount: group ? 1 : 0,
            orphanHeading: /(?:PRIMERO|SEGUNDO|TERCERO|CUARTO|QUINTO|SEXTO|SÉPTIMO):\s*$/.test(legalText.trim()),
            closingFillSameLine: fillSameLine(item),
            pageNumber: Number(item.dataset.pageNumber),
            totalPages: pages.length
          };
        })
      });
      const valid = pages.length >= 1 && closingMode === "final-fill" && renderedText === sourceText && pages.every(fits) && diagnostics.length === 0 && report.querySelectorAll(".notarial-continued").length === pages.length - 1;
      const firstBox = pages[0]?.getBoundingClientRect();
      const firstEnd = pages[0]?.querySelector(".notarial-continued")?.getBoundingClientRect() || contentOf(pages[0])?.getBoundingClientRect();
      report.dataset.firstPageFreeSpace = firstBox && firstEnd ? String(Math.max(0, Math.round(firstBox.bottom - firstEnd.bottom))) : "-1";
      report.dataset.pageCount = String(pages.length);
      report.dataset.textIntegrity = renderedText === sourceText ? "valid" : "invalid";
      report.dataset.layoutDiagnostics = diagnostics.map(({ code }) => code).join(",");
      report.dataset.paginationState = valid ? "valid" : "overflow";
      report.classList.remove("is-measuring");
      return valid;
    }

    function reset() {
      form.reset();
      form.elements.actDate.value = today();
      form.elements.disbursementDate.value = today();
      const firstDue = new Date(`${today()}T00:00:00Z`); firstDue.setUTCMonth(firstDue.getUTCMonth() + 1);
      form.elements.firstDueDate.value = firstDue.toISOString().slice(0, 10);
      form.elements.actCity.value = "La Vega";
      form.elements.actProvince.value = "La Vega";
      form.elements.debtorCity.value = "La Vega";
      form.elements.debtorProvince.value = "La Vega";
      syncCreditor(); updateCalculation();
      status.className = "application-status";
      status.textContent = "Completa las cuatro secciones para preparar el pagaré.";
      currentPreviewPage = 1;
      setFormStep(1);
      queueLivePreview();
    }

    form.elements.creditorKey.forEach((radio) => radio.addEventListener("change", syncCreditor));
    form.elements.debtorId.addEventListener("input", (event) => { event.target.value = cedula(event.target.value); });
    const uppercaseFields = new Set(["debtorName", "debtorAddress", "debtorHouseNumber", "debtorSector", "debtorCity", "debtorOccupationOther"]);
    form.addEventListener("input", (event) => {
      if (uppercaseFields.has(event.target.name)) event.target.value = event.target.value.toLocaleUpperCase("es-DO");
      updateCalculation(); updateReview();
      queueLivePreview();
    });
    form.addEventListener("change", () => { updateCalculation(); updateReview(); queueLivePreview(); });
    form.addEventListener("submit", (event) => event.preventDefault());
    previewPrevious.addEventListener("click", () => showPreviewPage(currentPreviewPage - 1));
    previewNext.addEventListener("click", () => showPreviewPage(currentPreviewPage + 1));
    stepButtons.forEach((button) => button.addEventListener("click", () => setFormStep(button.dataset.notarialStep, true)));
    backButton.addEventListener("click", () => setFormStep(currentFormStep - 1, true));
    nextButton.addEventListener("click", () => setFormStep(currentFormStep + 1, true));
    form.querySelector("[data-notarial-clear]").addEventListener("click", reset);
    form.querySelector("[data-notarial-print]").addEventListener("click", async () => {
      const problem = validate();
      if (problem) {
        status.className = "application-status is-error";
        status.textContent = problem.message;
        const target = form.elements[problem.field];
        const panel = target?.closest?.("[data-notarial-panel]");
        if (panel) setFormStep(panel.dataset.notarialPanel);
        target?.focus();
        return;
      }
      await FinanNotarialFonts.waitForNotarialFont(document.fonts, value("printFont")).catch(() => {});
      if (!renderPrint()) {
        status.className = "application-status is-error";
        status.textContent = "No fue posible paginar el documento sin riesgo de cortar información. Revisa los datos antes de imprimir.";
        return;
      }
      document.querySelectorAll(".document-print-report").forEach((item) => item.classList.remove("is-current"));
      report.classList.add("is-current");
      document.body.dataset.printTarget = "document-notarial-promissory";
      status.className = "application-status is-success";
      const pageCount = Number(report.dataset.pageCount || 1);
      status.textContent = `Pagaré preparado en ${pageCount} ${pageCount === 1 ? "página" : "páginas"} Carta, con texto íntegro y folios consecutivos. Revisa la vista previa antes de imprimir.`;
      window.print();
    });
    button.addEventListener("click", () => window.selectCotizadorWorkspace?.("notarial-promissory"));
    reset();
    document.fonts?.ready?.then(queueLivePreview);
    const crest = new Image();
    crest.addEventListener("load", queueLivePreview, { once: true });
    crest.src = "escudo-notarial.png";
  };
})();
