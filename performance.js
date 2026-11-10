'use strict';
(() => {
  const C = PerformanceCore, R = OperationRepository;
  const key = 'mm-performance-settings-v1';
  let today = C.day();
  const ws = document.createElement('section');
  ws.className = 'workspace performance';
  ws.id = 'performanceWorkspace';
  ws.hidden = true;
  document.querySelector('.app-shell').append(ws);
  const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
  const uid = () => globalThis.crypto.randomUUID();
  const number = new Intl.NumberFormat('es-DO', { maximumFractionDigits: 2 });
  const status = { open: 'Abierta', working: 'En gestión', resolved: 'Resuelta' };
  const permissions = { dashboard: 'Ver tablero de equipo', goals: 'Asignar metas', results: 'Confirmar resultados', incidents: 'Gestionar incidencias' };
  let page = 'dashboard', edit = '', selectedDay = '', resultKind = 'sale', showTrend = false, reverseId = '';
  let filters = { month: today.slice(0, 7), metric: 'saleCount', branch: '', team: '', employee: '' };
  let state, operations;
  let incidentFilter = 'pending', incidentEmployee = '', incidentDraft = false;
  let transactionFilter = { month: '', kind: '', employee: '' };
  const mainMetrics = ['saleCount', 'creditAmount'];
  const metricTitles = { saleCount: 'Ventas', creditAmount: 'Desembolsos' };
  const monthLabel = (month) => new Intl.DateTimeFormat('es-DO', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(month + '-01'));
  const badge = (employee) => `<span class="pf-avatar" aria-hidden="true">${escape(employee.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join(''))}</span>`;
  const identity = (employee) => `<div class="pf-person">${badge(employee)}<div><strong>${escape(employee.name)}</strong>
    <small>${escape(teamName(employee.team))} · ${escape(branchName(employee.branch))}</small></div></div>`;

  function read() {
    return JSON.parse(localStorage.getItem(key)) || {
      employees: [], jobs: [], roles: [], teams: [], branches: [], goals: [], incidents: []
    };
  }
  const input = (name, label, value = '', attrs = '') =>
    `<label>${label}<input name="${name}" value="${escape(value)}" ${attrs}></label>`;
  const option = (value, text, selected) =>
    `<option value="${escape(value)}"${value === selected ? ' selected' : ''}>${escape(text)}</option>`;
  const select = (name, label, entries, value = '', empty = 'Selecciona', required = false) =>
    `<label>${label}<select name="${name}" ${required ? 'required' : ''}>${empty ? option('', empty, value) : ''}${entries.map(([id, text]) => option(id, text, value)).join('')}</select></label>`;
  const list = (key, include = '') => state[key].filter((item) => item.active !== false || item.id === include)
    .map((item) => [item.id, item.name]);
  const employeeName = (id) => state.employees.find((item) => item.id === id)?.name || 'Sin ejecutivo';
  const teamName = (id) => state.teams.find((item) => item.id === id)?.name || 'Sin equipo';
  const branchName = (id) => state.branches.find((item) => item.id === id)?.name || 'Sin sucursal';
  const metrics = Object.entries(C.indicators).map(([id, item]) => [id, item.label]);
  const refs = () => operations.map((op) => [op.reference, op.reference + ' · ' + (op.people.customer.fullName || 'Cliente pendiente')]);
  const fmt = (value, metric = filters.metric) => (C.indicators[metric].count ? '' : 'RD$ ') + number.format(value);
  const sum = (items) => Math.round(items.reduce((total, item) => total + item.value, 0) * 100) / 100;
  const form = (action, body, label) => `<form class="pf-form" data-pf-form="${action}">${body}<button>${label}</button></form>`;
  const empty = (text) => `<p class="pf-empty">${text}</p>`;
  const button = (target, label) => `<button type="button" data-pf-page="${target}" aria-pressed="${page === target}">${label}</button>`;
  const changeButton = (id) => `<button type="button" data-pf-edit="${escape(id)}">Editar</button>`;
  const history = (entries = []) => entries.length ? `<details><summary>Historial</summary><ul>${entries.map((entry) =>
    `<li>${escape(entry.date)} · ${escape(entry.actor)} · ${escape(entry.note)}</li>`).join('')}</ul></details>` : '';
  const dateField = (name, label, value = today) => input(name, label, value, 'type="date" required');
  const nameField = (label, value) => input('name', label, value, 'required maxlength="100"');

  function settings() {
    const tabs = [['employees', 'Colaboradores'], ['jobs', 'Puestos'], ['roles', 'Roles'], ['teams', 'Equipos'], ['branches', 'Sucursales']];
    const label = tabs.find(([id]) => id === page)[1];
    const items = state[page];
    const item = items.find(({ id }) => id === edit) || {};
    let fields = nameField('Nombre', item.name);
    if (page === 'employees') {
      fields += input('email', 'Correo', item.email, 'type="email" maxlength="150"');
      fields += select('job', 'Puesto', list('jobs'), item.job) + select('role', 'Rol', list('roles'), item.role);
      fields += select('team', 'Equipo', list('teams'), item.team) + select('branch', 'Sucursal', list('branches'), item.branch);
      fields += select('supervisor', 'Supervisor', list('employees', item.supervisor).filter(([id]) => id !== item.id), item.supervisor, 'Sin supervisor');
      fields += select('active', 'Estado', [['yes', 'Activo'], ['no', 'Inactivo']], item.active === false ? 'no' : 'yes', '');
    }
    if (page === 'roles') {
      fields += `<fieldset><legend>Permisos del perfil</legend>${Object.entries(permissions).map(([id, title]) =>
        `<label class="pf-check"><input type="checkbox" name="permission" value="${id}" ${item.permissions?.includes(id) ? 'checked' : ''}> ${title}</label>`).join('')}</fieldset>`;
    }
    return `<nav class="pf-tabs" aria-label="Equipo y accesos">${tabs.map(([id, title]) => button(id, title)).join('')}</nav>
      <section class="pf-panel"><h3>${item.id ? 'Editar registro' : label}</h3>
        <p>Los perfiles se guardan en este navegador. Las cuentas de inicio de sesión requieren un servicio compartido.</p>
        ${form('settings', fields, item.id ? 'Guardar cambios' : 'Crear registro')}
        ${item.id ? '<button type="button" data-pf-edit="">Cancelar edición</button>' : ''}
        ${items.length ? `<ul class="pf-list">${items.map((row) => `<li><div><strong>${escape(row.name)}</strong>
          ${page === 'employees' ? `<small>${escape(state.jobs.find((job) => job.id === row.job)?.name || 'Sin puesto')} · ${escape(teamName(row.team))} · ${escape(branchName(row.branch))} · ${row.active ? 'Activo' : 'Inactivo'}</small>` : ''}
          ${page === 'roles' ? `<small>${escape(row.permissions.map((id) => permissions[id]).join(' · ') || 'Sin permisos seleccionados')}</small>` : ''}
          </div>${changeButton(row.id)}</li>`).join('')}</ul>` : empty('Aún no hay registros.')}</section>`;
  }

  function scopeMatches(item) {
    return (!filters.branch || item.branch === filters.branch) &&
      (!filters.team || item.team === filters.team) && (!filters.employee || item.employee === filters.employee);
  }
  function transactionOperations(settings = state, records = operations) {
    const direct = new Map();
    for (const entry of settings.transactions || []) {
      const id = entry.reverses || entry.id;
      if (!direct.has(id)) direct.set(id, { reference: entry.note, performance: [], direct: true });
      direct.get(id).performance.push(entry);
    }
    return [...records, ...direct.values()];
  }

  function periodRows(metric, sources) {
    return C.movements(sources, metric).filter((item) => item.date.startsWith(filters.month) && scopeMatches(item));
  }

  function chart(days, rows, target, { interactive = true, through = today } = {}) {
    const width = 780, height = 220, margin = 18;
    let cumulative = 0, work = 0;
    const workTotal = days.filter((d) => d.working).length;
    const points = days.map((d) => {
      if (d.working) work += 1;
      cumulative += sum(rows.filter((row) => row.date === d.date));
      return { ...d, actual: cumulative, planned: target * work / workTotal };
    });
    const min = Math.min(0, ...points.map((p) => p.actual));
    const max = Math.max(1, target, ...points.map((p) => p.actual));
    const x = (i) => margin + i * (width - 2 * margin) / Math.max(1, points.length - 1);
    const y = (value) => height - margin - (value - min) * (height - 2 * margin) / (max - min);
    const line = (items, metric) => items.map((p, i) => `${x(i)},${y(p[metric])}`).join(' ');
    const actual = points.filter((p) => p.date <= through);
    return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Avance acumulado y ritmo esperado del mes">
      ${[0, .25, .5, .75, 1].map((n) => `<line x1="${margin}" x2="${width - margin}" y1="${y(min + n * (max - min))}" y2="${y(min + n * (max - min))}" class="pf-gridline"/>`).join('')}
      ${target ? `<polyline points="${line(points, 'planned')}" class="pf-plan"/>` : ''}
      ${actual.length ? `<polyline points="${line(actual, 'actual')}" class="pf-actual"/><circle cx="${x(actual.length - 1)}" cy="${y(actual.at(-1).actual)}" r="5" class="pf-point"/>` : ''}
      </svg>${interactive ? `<div class="pf-days" aria-label="Ver movimientos por día">${days.map((d) =>
        `<button type="button" data-pf-day="${d.date}" aria-pressed="${selectedDay === d.date}" title="${d.date}" aria-label="Ver movimientos del ${d.date}">${Number(d.date.slice(-2))}</button>`).join('')}</div>` : ''}`;
  }

  function officeOverview() {
    const date = C.day();
    const month = date.slice(0, 7);
    const days = C.daysFor(month);
    let settings, sources;
    try {
      settings = read();
      sources = transactionOperations(settings, R.list());
    } catch {
      return '<section class="office-goals"><h2>Metas totales de la oficina</h2><p>No se pudieron leer los datos de seguimiento.</p></section>';
    }
    const targets = C.monthlyTargets(settings.goals, month);
    return `<section class="office-goals" aria-labelledby="officeGoalsTitle">
      <header class="office-goals-header"><div><span class="office-month">${escape(monthLabel(month))}</span>
        <h2 id="officeGoalsTitle">Metas totales de la oficina</h2></div>
        <button type="button" data-system-tool="performance-dashboard" data-system-filter="office">Ver por ejecutivo <span aria-hidden="true">→</span></button></header>
      <div class="office-goals-grid">${mainMetrics.map((metric) => {
        const goal = targets.filter((item) => item.metric === metric && item.employee).reduce((total, item) => total + item.target, 0);
        const rows = C.movements(sources, metric).filter((row) => row.date.startsWith(month) && row.date <= date);
        const value = sum(rows);
        const progress = goal ? number.format(value / goal * 100) + ' %' : 'Sin meta';
        return `<article class="office-goal" data-office-metric="${metric}">
          <div class="office-goal-title"><h3>${escape(C.indicators[metric].label)}</h3><span>${progress}</span></div>
          <strong>${fmt(value, metric)}</strong>
          <p>${goal ? `Meta ${fmt(goal, metric)} · ${value >= goal ? 'Meta cumplida' : 'Faltan ' + fmt(goal - value, metric)}` : 'Aún no hay metas asignadas para este indicador.'}</p>
          ${chart(days, rows, goal, { interactive: false, through: date })}
          <div class="office-chart-dates" aria-hidden="true"><span>Día 1</span><span>Día ${days.length}</span></div>
        </article>`;
      }).join('')}</div>
      <footer class="office-goals-footer"><span><i class="pf-dot" aria-hidden="true"></i> Avance real</span>
        <span><i class="pf-dash" aria-hidden="true"></i> Ritmo esperado</span>
        <small>El resultado incluye toda la oficina. La meta suma los objetivos de los ejecutivos.</small></footer></section>`;
  }

  function dashboard() {
    const days = C.daysFor(filters.month);
    const workdays = days.filter((day) => day.working);
    const pace = workdays.filter((day) => day.date <= today).length / workdays.length;
    const sources = transactionOperations();
    const byMetric = Object.fromEntries([...new Set([...mainMetrics, filters.metric])].map((id) => [id, periodRows(id, sources)]));
    const targets = C.monthlyTargets(state.goals, filters.month);
    const people = state.employees.filter((employee) => {
      const hasResults = Object.values(byMetric).some((rows) => rows.some((row) => row.employee === employee.id));
      const hasTarget = targets.some((goal) => goal.employee === employee.id && scopeMatches(goal));
      return hasResults || hasTarget || (employee.active && scopeMatches({ ...employee, employee: employee.id }));
    }).sort((a, b) => a.name.localeCompare(b.name, 'es'));
    const targetFor = (employee, metric) => targets.find((goal) =>
      goal.employee === employee && goal.metric === metric && scopeMatches(goal))?.target;
    const amountFor = (employee, metric) => sum(byMetric[metric].filter((row) => row.employee === employee));
    const totalFor = (metric) => people.reduce((total, employee) => total + (targetFor(employee.id, metric) || 0), 0);
    const chartTarget = totalFor(filters.metric);
    const rows = byMetric[filters.metric];
    const teamTargets = targets.filter((goal) => !goal.employee && !filters.employee && goal.metric === filters.metric &&
      (!filters.team || filters.team === goal.team) && (!filters.branch || filters.branch === goal.branch));
    const detail = rows.filter((row) => !selectedDay || row.date === selectedDay).sort((a, b) => b.date.localeCompare(a.date));
    const overdue = state.incidents.filter((incident) => incident.status !== 'resolved' && incident.due < today &&
      scopeMatches({ ...state.employees.find((item) => item.id === incident.employee), employee: incident.employee })).length;
    return `<div class="pf-filterbar">${form('filters', input('month', 'Mes de seguimiento', filters.month, 'type="month" required') +
      select('branch', 'Sucursal', list('branches'), filters.branch, 'Todas') +
      select('team', 'Equipo', list('teams'), filters.team, 'Todos') +
      select('employee', 'Ejecutivo', state.employees.map((item) => [item.id, item.name]), filters.employee, 'Todos'), 'Aplicar')}</div>
      <div class="pf-scoreboard">${mainMetrics.map((metric) => {
        const target = totalFor(metric);
        const value = sum(byMetric[metric]);
        const tracked = sum(byMetric[metric].filter((row) => targetFor(row.employee, metric)));
        return `<article class="pf-score" data-metric="${metric}"><span>${metricTitles[metric]} del mes</span>
          <strong>${fmt(value, metric)}</strong><small>${target ? `${fmt(tracked, metric)} de ${fmt(target, metric)} en metas asignadas` : 'Sin objetivos asignados'}</small>
          ${target ? meter(tracked / target, pace) : ''}</article>`;
      }).join('')}</div>
      <section class="pf-panel pf-roster"><div class="pf-section-head"><div><h3>Avance por ejecutivo</h3><p>${escape(monthLabel(filters.month))} · ${people.length} en la lista</p></div>
      <button type="button" data-pf-page="incidents">${overdue ? overdue + ' incidencias vencidas' : 'Ver incidencias'}</button></div>
      ${people.length ? `<div class="pf-roster-head"><span>Ejecutivo</span><span>Ventas entregadas</span><span>Capital desembolsado</span><span></span></div>
        <ul class="pf-roster-list">${people.map((employee) => `<li class="pf-roster-row">${identity(employee)}
          ${mainMetrics.map((metric) => progressCell(amountFor(employee.id, metric), targetFor(employee.id, metric), metric, pace)).join('')}
          <button type="button" data-pf-goal-employee="${escape(employee.id)}">Editar metas</button></li>`).join('')}</ul>` :
        empty('Agrega colaboradores en Configuración → Equipo y accesos.')}</section>
      <details class="pf-panel pf-trend"${showTrend ? ' open' : ''}><summary>Curva de avance y movimientos</summary>
        <div class="pf-tabs" aria-label="Indicador de la gráfica">${metrics.map(([id, title]) =>
          `<button type="button" data-pf-metric="${id}" aria-pressed="${id === filters.metric}">${title}</button>`).join('')}</div>
        <p>Real <span class="pf-dot"></span> · Ritmo esperado <span class="pf-dash"></span></p>
        ${chart(days, chartTarget ? rows.filter((row) => targetFor(row.employee, filters.metric)) : rows, chartTarget)}
        <small>Ritmo de lunes a viernes. Cuando hay metas asignadas, la curva compara los resultados de esos ejecutivos.</small>
        ${teamTargets.length ? `<h3>Metas de equipo existentes</h3><ul class="pf-list">${teamTargets.map((goal) => `<li><strong>${escape(teamName(goal.team))}</strong>
          <span>${fmt(sum(rows.filter((row) => row.team === goal.team && (!goal.branch || row.branch === goal.branch))))} / ${fmt(goal.target)}</span></li>`).join('')}</ul>` : ''}
        <h3>Movimientos ${escape(selectedDay)}</h3>
        ${selectedDay ? '<button type="button" data-pf-day="">Ver todo el mes</button>' : ''}
        ${detail.length ? `<ul class="pf-list">${detail.map((row) => `<li><div><strong>${escape(row.reference)} · ${escape(employeeName(row.employee))}</strong>
          <small>${escape(row.date)} · ${escape(row.note)}${row.reversal ? ' · Reversión' : ''}</small></div><strong>${fmt(row.value)}</strong>${row.direct ? '' : openOperation(row.reference)}</li>`).join('')}</ul>` :
          empty('Todavía no hay movimientos en esta selección.')}</details>`;
  }

  function meter(ratio, pace) {
    const width = Math.max(0, Math.min(100, ratio * 100));
    return `<span class="pf-meter" role="progressbar" aria-label="Cumplimiento" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(width)}">
      <i style="--pf-width:${width}%"></i><b style="--pf-pace:${pace * 100}%" title="Ritmo esperado"></b></span>`;
  }

  function progressCell(value, target, metric, pace) {
    const ratio = target ? value / target : 0;
    const flag = !target ? 'Sin meta' : ratio >= 1 ? 'Cumplida' : ratio >= pace ? 'Al ritmo' : 'En riesgo';
    return `<div class="pf-progress" data-metric="${metric}"><span class="pf-mobile-metric">${metricTitles[metric]}</span>
      <div><strong>${fmt(value, metric)}</strong>${target ? ` <small>/ ${fmt(target, metric)}</small>` : ''}</div>
      ${target ? meter(ratio, pace) : ''}<small><span data-state="${flag}">${flag}</span>${target ? ` · ${number.format(ratio * 100)} %` : ''}</small></div>`;
  }

  function openOperation(reference) {
    return `<button type="button" data-pf-operation="${escape(reference)}">Ver expediente</button>`;
  }
  function goals() {
    const month = today.slice(0, 7);
    const current = C.monthlyTargets(state.goals, month);
    const target = (employee, metric) => current.find((goal) => goal.employee === employee && goal.metric === metric);
    const employees = state.employees.filter((item) => item.active || state.goals.some((goal) => goal.employee === item.id));
    const selected = employees.find((employee) => employee.id === edit);
    return `<section class="pf-panel pf-roster"><div class="pf-section-head"><div><h3>Metas recurrentes</h3>
      <p>El avance comienza de cero cada mes. Los objetivos siguen vigentes hasta el próximo ajuste.</p></div></div>
      ${employees.length ? `<div class="pf-roster-head"><span>Ejecutivo</span><span>Ventas al mes</span><span>Desembolso al mes</span><span></span></div>
      <ul class="pf-roster-list">${employees.map((employee) => `<li><div class="pf-roster-row">${identity(employee)}
        ${mainMetrics.map((metric) => {
          const goal = target(employee.id, metric);
          return `<div class="pf-goal-number"><span class="pf-mobile-metric">${metricTitles[metric]}</span><strong>${goal ? fmt(goal.target, metric) : 'Sin meta'}</strong>
          ${goal ? `<small>${goal.recurring ? 'Desde' : 'Solo'} ${escape(monthLabel(goal.month))}</small>` : ''}</div>`;
        }).join('')}
        <button type="button" data-pf-goal-employee="${escape(employee.id)}" ${employee.active ? '' : 'disabled'}>${employee.active ? 'Editar metas' : 'Inactivo'}</button></div>
        ${selected?.id === employee.id ? `<div class="pf-inline-editor">
          ${form('goalPair', input('month', 'Vigentes desde', month, `type="month" min="${month}" required`) +
            input('sales', 'Ventas (unidades)', target(employee.id, 'saleCount')?.target, 'type="number" min="1" step="1" required') +
            input('disbursement', 'Desembolso (RD$)', target(employee.id, 'creditAmount')?.target, 'type="number" min="0.01" step="0.01" required') +
            input('actor', 'Registrado por', '', 'required maxlength="100"'), 'Guardar metas')}
          <button type="button" data-pf-edit="">Cerrar edición</button></div>` : ''}
        ${state.goals.some((goal) => goal.employee === employee.id) ? `<details class="pf-goal-history"><summary>Historial de metas</summary><ul>
          ${state.goals.filter((goal) => goal.employee === employee.id).sort((a, b) => b.month.localeCompare(a.month)).map((goal) =>
            `<li>${escape(goal.month)} · ${escape(C.indicators[goal.metric].label)} · ${fmt(goal.target, goal.metric)} · ${goal.recurring ? 'Recurrente' : 'Un mes'}${goal.endsBefore ? ' · Baja efectiva ' + escape(goal.endsBefore) : ''}${history(goal.history)}</li>`).join('')}</ul></details>` : ''}</li>`).join('')}</ul>` :
        empty('Registra un colaborador en Configuración → Equipo y accesos para asignarle metas.')}</section>`;
  }

  function results() {
    const op = operations.find((item) => item.reference === edit);
    const records = transactionOperations().flatMap((item) => (item.performance || []).map((entry) =>
      ({ ...entry, reference: item.reference, direct: item.direct })));
    const reversed = new Set(records.filter((entry) => entry.reverses).map((entry) => entry.reverses));
    const activeRecord = records.find((entry) => entry.id === reverseId && !entry.reverses && !reversed.has(entry.id));
    const visible = records.filter((entry) => (!transactionFilter.month || entry.date.startsWith(transactionFilter.month)) &&
      (!transactionFilter.kind || entry.kind === transactionFilter.kind) && (!transactionFilter.employee || entry.employee === transactionFilter.employee));
    const title = resultKind === 'sale' ? 'Registrar venta' : 'Registrar desembolso';
    return `<section class="pf-panel pf-capture"><div class="pf-section-head"><div><h3>Nueva transacción</h3>
      <p>El movimiento se suma al mes de su fecha efectiva.</p></div></div>
      <div class="pf-tabs" aria-label="Tipo de transacción">
        <button type="button" data-pf-kind="sale" aria-pressed="${resultKind === 'sale'}">Venta entregada</button>
        <button type="button" data-pf-kind="credit" aria-pressed="${resultKind === 'credit'}">Desembolso</button></div>
      ${form('result', `<input type="hidden" name="kind" value="${resultKind}">` +
        select('employee', 'Ejecutivo', list('employees'), '', 'Selecciona', true) + dateField('date', 'Fecha efectiva') +
        input('amount', resultKind === 'sale' ? 'Total vendido (RD$)' : 'Capital desembolsado (RD$)', '', 'type="number" min="0.01" step="0.01" required') +
        input('note', 'N.º de factura o comprobante', '', 'required maxlength="250"') +
        input('actor', 'Registrado por', '', 'required maxlength="100"') +
        select('reference', 'Expediente (opcional)', refs(), op?.reference, 'Sin expediente'), title)}
      ${resultKind === 'credit' ? '<small>Si el desembolso es parcial, selecciona el expediente para agrupar los pagos del mismo crédito.</small>' : ''}</section>
      <section class="pf-panel"><div class="pf-section-head"><div><h3>Transacciones registradas</h3><p>${visible.length} de ${records.length} en el historial</p></div></div>
      ${form('transactionFilters', input('month', 'Mes', transactionFilter.month, 'type="month"') +
        select('kind', 'Tipo', [['sale', 'Ventas'], ['credit', 'Desembolsos']], transactionFilter.kind, 'Todos') +
        select('employee', 'Ejecutivo', state.employees.map((employee) => [employee.id, employee.name]), transactionFilter.employee, 'Todos'), 'Filtrar')}
      ${visible.length ? `<ul class="pf-list pf-transactions">${visible.sort((a, b) => b.date.localeCompare(a.date)).map((entry) => `<li>
        <span class="pf-txn-icon" data-metric="${entry.kind === 'sale' ? 'saleCount' : 'creditAmount'}" aria-hidden="true">${entry.kind === 'sale' ? '↗' : '↓'}</span>
        <div><strong>${entry.reverses ? 'Reversión' : entry.kind === 'sale' ? 'Venta entregada' : 'Desembolso'}</strong>
        <small>${escape(employeeName(entry.employee))} · ${escape(entry.date)} · ${escape(entry.note)}${reversed.has(entry.id) ? ' · Revertida' : ''}</small>
        <small>Registrado por ${escape(entry.actor)}${entry.direct ? '' : ' · ' + escape(entry.reference)}</small></div>
        <strong>${entry.reverses ? '−' : ''}RD$ ${number.format(entry.amount / 100)}</strong>
        ${entry.direct ? '' : openOperation(entry.reference)}
        ${!entry.reverses && !reversed.has(entry.id) ? `<button type="button" data-pf-reverse="${escape(entry.id)}">Revertir</button>` : ''}
        ${activeRecord?.id === entry.id ? `<div class="pf-inline-editor">
          ${form('reversal', `<input type="hidden" name="id" value="${escape(entry.id)}">` + dateField('date', 'Fecha de reversión') +
            input('actor', 'Registrado por', '', 'required maxlength="100"') + input('note', 'Motivo de reversión', '', 'required maxlength="250"'), 'Confirmar reversión')}
          <button type="button" data-pf-reverse="">Cancelar</button></div>` : ''}</li>`).join('')}</ul>` :
        empty('No hay transacciones para esta selección.')}</section>`;
  }

  function incidents() {
    const item = state.incidents.find(({ id }) => id === edit) || {};
    const pending = state.incidents.filter((row) => row.status !== 'resolved');
    const overdue = pending.filter((row) => row.due < today).length;
    const urgency = { urgent: 0, high: 1, normal: 2 };
    const labels = { pending: 'Pendientes', overdue: 'Vencidas', resolved: 'Resueltas', all: 'Todas' };
    const rows = state.incidents.filter((row) =>
      (!incidentEmployee || row.employee === incidentEmployee) &&
      (incidentFilter === 'all' || (incidentFilter === 'resolved' ? row.status === 'resolved' :
        row.status !== 'resolved' && (incidentFilter !== 'overdue' || row.due < today))))
      .sort((a, b) => Number(a.status === 'resolved') - Number(b.status === 'resolved') ||
        Number(b.due < today) - Number(a.due < today) || a.due.localeCompare(b.due) || urgency[a.priority] - urgency[b.priority]);
    return `<section class="pf-panel"><div class="pf-section-head"><div><h3>Incidencias</h3>
      <p>${pending.length} pendientes · ${overdue} vencidas</p></div>
      <button type="button" class="pf-action" data-pf-new-incident>＋ Nueva incidencia</button></div>
      <div class="pf-list-filters"><div class="pf-tabs" aria-label="Filtrar incidencias">${Object.entries(labels).map(([id, label]) =>
        `<button type="button" data-pf-incident-filter="${id}" aria-pressed="${id === incidentFilter}">${label}</button>`).join('')}</div>
        ${select('incidentEmployee', 'Responsable', state.employees.map((employee) => [employee.id, employee.name]), incidentEmployee, 'Todos')}</div>
      ${incidentDraft || item.id ? `<div class="pf-inline-editor">
        <h4>${item.id ? 'Actualizar incidencia' : 'Registrar incidencia'}</h4>
        ${form('incident', input('title', 'Incidencia', item.title, 'required maxlength="120"') +
          select('reference', 'Expediente', refs(), item.reference, 'Sin expediente') +
          select('goal', 'Meta', state.goals.map((goal) => [goal.id, `${goal.month} · ${C.indicators[goal.metric].label} · ${goal.employee ? employeeName(goal.employee) : teamName(goal.team)}`]), item.goal, 'Sin meta') +
          select('employee', 'Responsable', list('employees', item.employee), item.employee, 'Selecciona', true) +
          select('priority', 'Prioridad', [['normal', 'Normal'], ['high', 'Alta'], ['urgent', 'Urgente']], item.priority, '') +
          select('status', 'Estado', Object.entries(status), item.status || 'open', '') +
          dateField('due', 'Fecha límite', item.due) + input('action', 'Próxima acción o resolución', item.action, 'required maxlength="250"') +
          input('actor', 'Registrado por', '', 'required maxlength="100"'), item.id ? 'Guardar actualización' : 'Registrar incidencia')}
        <button type="button" data-pf-edit="">Cancelar</button></div>` : ''}
      ${rows.length ? `<ul class="pf-list pf-incidents">${rows.map((row) => `<li>
        <div><span class="pf-status" data-state="${row.status}">${status[row.status]}</span>
        ${row.status !== 'resolved' && row.due < today ? '<span class="pf-status" data-state="overdue">Vencida</span>' : ''}
        <strong>${escape(row.title)}</strong><small>${escape(employeeName(row.employee))} · Vence ${escape(row.due)} · Prioridad ${({ normal: 'normal', high: 'alta', urgent: 'urgente' })[row.priority]}</small>
        <p>${escape(row.action)}</p>${history(row.history)}</div>${row.reference ? openOperation(row.reference) : ''}
        <button type="button" data-pf-edit="${escape(row.id)}">Gestionar</button></li>`).join('')}</ul>` :
        empty('No hay incidencias para esta selección.')}</section>`;
  }

  const views = { dashboard, goals, results, incidents, employees: settings, roles: settings, jobs: settings, branches: settings, teams: settings };
  const isSettings = () => !['dashboard', 'goals', 'results', 'incidents'].includes(page);
  function render(message = '') {
    today = C.day();
    state = read();
    operations = R.list();
    ws.innerHTML = `<header class="pf-heading"><div><span>Centro de financiamiento</span>
      <h2>${isSettings() ? 'Equipo y accesos' : 'Metas y supervisión'}</h2>
      <p>${isSettings() ? 'Colaboradores, puestos y equipos.' : 'Ventas y crédito, en una sola vista.'}</p></div>
      ${isSettings() ? '' : '<button type="button" class="pf-primary" data-pf-page="results">＋ Nueva transacción</button>'}</header>
      ${isSettings() ? '' : `<nav class="pf-tabs" aria-label="Metas y supervisión">${button('dashboard', 'Tablero')}${button('goals', 'Metas por ejecutivo')}${button('results', 'Transacciones')}${button('incidents', 'Incidencias')}</nav>`}
      <p class="pf-message" role="status">${escape(message)}</p>${views[page]()}`;
  }

  function saveItem(collection, values) {
    const items = state[collection];
    const index = items.findIndex((item) => item.id === edit);
    const item = { ...values, id: items[index]?.id || uid() };
    if (index === -1) items.push(item);
    else items[index] = item;
    localStorage.setItem(key, JSON.stringify(state));
  }
  function audit(item, actor, note) {
    return [...(item?.history || []), { date: new Date().toLocaleString('es-DO', { timeZone: 'America/Santo_Domingo' }), actor, note }];
  }
  function save(action, data, fields) {
    if (action === 'filters') {
      if (!C.validMonth(data.month)) throw Error('Selecciona un período válido.');
      filters = { ...filters, ...data };
      selectedDay = '';
      return '';
    }
    if (action === 'transactionFilters') {
      transactionFilter = data;
      reverseId = '';
      return '';
    }
    if (action === 'settings') {
      if (!data.name) throw Error('Indica un nombre.');
      if (state[page].some((item) => item.id !== edit && item.name.toLowerCase() === data.name.toLowerCase() &&
        (page !== 'employees' || (item.email || '').toLowerCase() === data.email.toLowerCase()))) throw Error('Ya existe un registro con esos datos.');
      if (page === 'employees') {
        data.active = data.active === 'yes';
        const visited = new Set([edit]);
        let supervisor = data.supervisor;
        while (supervisor) {
          if (visited.has(supervisor)) throw Error('La asignación de supervisores crea un ciclo.');
          visited.add(supervisor);
          supervisor = state.employees.find((item) => item.id === supervisor)?.supervisor;
        }
        if (!data.active && state.employees.find((item) => item.id === edit)?.active) {
          const endsBefore = C.nextMonth(today.slice(0, 7));
          state.goals = state.goals.map((goal) => goal.employee === edit && goal.recurring &&
            (!goal.endsBefore || goal.endsBefore > endsBefore) ? { ...goal, endsBefore } : goal);
        }
      }
      if (page === 'roles') data = { name: data.name, permissions: fields.getAll('permission') };
      saveItem(page, data);
      return 'Registro guardado.';
    }
    if (!data.actor) throw Error('Indica quién registra el cambio.');
    if (action === 'goalPair') {
      const employee = state.employees.find((item) => item.active && item.id === edit);
      const sales = Number(data.sales), disbursement = Number(data.disbursement);
      if (!employee) throw Error('Selecciona un ejecutivo activo.');
      if (!C.validMonth(data.month) || data.month < today.slice(0, 7)) throw Error('Selecciona el mes actual o uno posterior.');
      if (!Number.isSafeInteger(sales) || sales <= 0 || !Number.isSafeInteger(Math.round(disbursement * 100)) || disbursement <= 0) {
        throw Error('Ingresa una cantidad entera de ventas y un monto de desembolso mayor que cero.');
      }
      for (const [metric, target] of [['saleCount', sales], ['creditAmount', disbursement]]) {
        const old = state.goals.find((goal) => goal.recurring && goal.employee === employee.id && goal.metric === metric && goal.month === data.month);
        const entry = {
          id: old?.id || uid(), recurring: true, employee: employee.id, team: employee.team, branch: employee.branch,
          month: data.month, metric, target, history: audit(old, data.actor, old ?
            `Ajuste de ${fmt(old.target, metric)} a ${fmt(target, metric)}` : `Objetivo recurrente de ${fmt(target, metric)}`)
        };
        if (old) state.goals[state.goals.indexOf(old)] = entry;
        else state.goals.push(entry);
      }
      localStorage.setItem(key, JSON.stringify(state));
      return 'Metas recurrentes guardadas.';
    }
    if (action === 'incident') {
      if (!data.reference && !data.goal) throw Error('Vincula la incidencia a un expediente o una meta.');
      if (!data.title || !data.action) throw Error('Completa la incidencia y su próxima acción o resolución.');
      const old = state.incidents.find(({ id }) => id === edit);
      saveItem('incidents', { ...data, history: audit(old, data.actor, `${status[data.status]} · ${employeeName(data.employee)} · ${data.due} · ${data.action}`) });
      incidentDraft = false;
      if (incidentFilter === 'overdue' && (data.status === 'resolved' || data.due >= today)) incidentFilter = 'all';
      if ((incidentFilter === 'pending' && data.status === 'resolved') ||
          (incidentFilter === 'resolved' && data.status !== 'resolved')) incidentFilter = 'all';
      return 'Incidencia guardada.';
    }
    if (action === 'result') {
      const employee = state.employees.find(({ id, active }) => active && id === data.employee);
      if (!employee) throw Error('Selecciona un colaborador activo.');
      const recorded = transactionOperations().some((op) => (op.performance || []).some((entry) =>
        !entry.reverses && entry.kind === data.kind && entry.note.trim().toLowerCase() === data.note.toLowerCase()));
      if (recorded) throw Error('Ya hay una transacción de este tipo con ese comprobante.');
      const entry = { ...data, id: uid(), team: employee.team, branch: employee.branch };
      if (data.reference) R.updatePerformance(data.reference, (op) => C.record(op, entry));
      else {
        state.transactions = C.recordDirect(state.transactions || [], entry);
        localStorage.setItem(key, JSON.stringify(state));
      }
      return 'Transacción registrada. El avance del mes se actualizó.';
    }
    if ((state.transactions || []).some((entry) => entry.id === data.id)) {
      state.transactions = C.recordDirect(state.transactions, {
        id: uid(), reverses: data.id, date: data.date, actor: data.actor, note: data.note
      });
      localStorage.setItem(key, JSON.stringify(state));
      reverseId = '';
      return 'Reversión registrada.';
    }
    const op = operations.find((item) => item.performance?.some((entry) => entry.id === data.id));
    if (!op) throw Error('Registro no encontrado.');
    reverseId = '';
    R.updatePerformance(op.reference, (current) => C.record(current, {
      id: uid(), reverses: data.id, date: data.date, actor: data.actor, note: data.note
    }));
    return 'Reversión registrada.';
  }

  ws.addEventListener('submit', (event) => {
    const action = event.target.dataset.pfForm;
    if (!action) return;
    event.preventDefault();
    const fields = new FormData(event.target);
    const data = Object.fromEntries([...fields].map(([name, value]) => [name, value.trim()]));
    try {
      state = read();
      operations = R.list();
      const message = save(action, data, fields);
      edit = '';
      render(message);
    } catch (error) {
      const message = ws.querySelector('.pf-message');
      message.textContent = error.message;
      message.scrollIntoView({ block: 'nearest' });
    }
  });

  ws.addEventListener('click', (event) => {
    const control = event.target.closest('button');
    if (!control) return;
    if (control.hasAttribute('data-pf-operation')) {
      FinancingCRM.open();
      FinancingCRM.details(control.dataset.pfOperation);
      return;
    }
    showTrend = ws.querySelector('.pf-trend')?.open || false;
    if (control.hasAttribute('data-pf-new-incident')) {
      edit = '';
      incidentDraft = true;
    } else if (control.hasAttribute('data-pf-incident-filter')) {
      incidentFilter = control.dataset.pfIncidentFilter;
      edit = '';
      incidentDraft = false;
    } else if (control.hasAttribute('data-pf-goal-employee')) {
      page = 'goals';
      edit = control.dataset.pfGoalEmployee;
    } else if (control.hasAttribute('data-pf-kind')) {
      const form = ws.querySelector('[data-pf-form="result"]');
      const draft = Object.fromEntries(new FormData(form));
      resultKind = control.dataset.pfKind;
      render();
      const next = ws.querySelector('[data-pf-form="result"]');
      for (const name of ['employee', 'date', 'amount', 'note', 'actor', 'reference']) next.elements[name].value = draft[name];
      ws.querySelector('[data-pf-kind="' + resultKind + '"]').focus();
      return;
    } else if (control.hasAttribute('data-pf-reverse')) reverseId = control.dataset.pfReverse;
    else if (control.hasAttribute('data-pf-metric')) {
      filters.metric = control.dataset.pfMetric;
      selectedDay = '';
    } else if (control.hasAttribute('data-pf-day')) selectedDay = control.dataset.pfDay;
    else if (control.hasAttribute('data-pf-edit')) {
      edit = control.dataset.pfEdit;
      incidentDraft = false;
    }
    else if (control.hasAttribute('data-pf-page')) {
      page = control.dataset.pfPage;
      edit = '';
      reverseId = '';
      incidentDraft = false;
    } else return;
    render();
    if (control.hasAttribute('data-pf-goal-employee')) ws.querySelector('[data-pf-form="goalPair"] input')?.focus();
    if (control.hasAttribute('data-pf-new-incident') || (page === 'incidents' && control.dataset.pfEdit)) ws.querySelector('[data-pf-form="incident"] input')?.focus();
    if (control.dataset.pfReverse) ws.querySelector('[data-pf-form="reversal"] input[type=date]')?.focus();
    if (control.classList.contains('pf-primary')) ws.querySelector('[data-pf-form="result"] select')?.focus();
  });

  ws.addEventListener('change', (event) => {
    if (event.target.name !== 'incidentEmployee') return;
    incidentEmployee = event.target.value;
    render();
    ws.querySelector('[name="incidentEmployee"]')?.focus();
  });

  window.PerformanceWorkspace = {
    officeOverview,
    openOffice() {
      filters = { month: C.day().slice(0, 7), metric: 'saleCount', branch: '', team: '', employee: '' };
      selectedDay = '';
      this.open('dashboard');
    },
    followUpSummary() {
      try {
        const pending = read().incidents.filter((row) => row.status !== 'resolved');
        const date = C.day();
        return { open: pending.length, overdue: pending.filter((row) => row.due < date).length };
      } catch { return null; }
    },
    open(view, reference = '') {
      page = view;
      edit = reference;
      incidentDraft = false;
      reverseId = '';
      document.querySelectorAll('.workspace').forEach((item) => { item.hidden = item !== ws; });
      document.querySelector('#workspaceMenu').hidden = true;
      document.body.dataset.workspace = isSettings() ? 'performance-team' : 'performance';
      document.querySelector('.app-header h1').textContent = isSettings() ? 'Equipo y accesos' : 'Metas y supervisión';
      document.querySelectorAll('#applicationEntryBtn,#newQuoteBtn,#quoteHeaderSettingsBtn,#printBtn').forEach((item) => { item.hidden = true; });
      document.querySelector('#workspaceHomeBtn').hidden = false;
      render();
      window.scrollTo(0, 0);
    }
  };
})();
