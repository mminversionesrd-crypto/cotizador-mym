'use strict';
((root) => {
  const indicators = {
    saleCount: { label: 'Ventas realizadas', kind: 'sale', count: true },
    saleAmount: { label: 'Monto vendido', kind: 'sale' },
    creditCount: { label: 'Créditos desembolsados', kind: 'credit', count: true },
    creditAmount: { label: 'Capital desembolsado', kind: 'credit' }
  };
  const officeCalendar = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santo_Domingo', year: 'numeric', month: '2-digit', day: '2-digit'
  });
  function day(value = new Date()) {
    const parts = Object.fromEntries(officeCalendar.formatToParts(value).map(({ type, value }) => [type, value]));
    return parts.year + '-' + parts.month + '-' + parts.day;
  }
  function nextMonth(month) {
    const [year, index] = month.split('-').map(Number);
    return new Date(Date.UTC(year, index, 1)).toISOString().slice(0, 7);
  }
  const validDay = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date;
  const isSale = (op) => ['motorcycle_cash_sale', 'motorcycle_financing', 'smartphone_financing', 'appliance_financing'].includes(op.productType);
  const cents = (value) => Math.round(Number(value) * 100);

  function record(op, entry, today = day()) {
    const history = op.performance || [];
    if (!validDay(entry.date) || entry.date > today) throw Error('Indica una fecha efectiva válida.');
    if (!entry.note?.trim()) throw Error('Indica una referencia o motivo.');
    if (entry.reverses) {
      const original = history.find((item) => item.id === entry.reverses && !item.reverses);
      if (!original || history.some((item) => item.reverses === original.id)) throw Error('El registro ya fue revertido o no existe.');
      if (entry.date < original.date) throw Error('La reversión no puede ser anterior al registro.');
      return [...history, { ...original, ...entry, amount: original.amount }];
    }
    if (!['sale', 'credit'].includes(entry.kind) || !entry.employee) throw Error('Selecciona el resultado y su ejecutivo.');
    if (entry.kind === 'sale' && !isSale(op)) throw Error('Este producto no corresponde a una venta.');
    if (entry.kind === 'credit' && op.productType === 'motorcycle_cash_sale') throw Error('Una venta de contado no genera desembolso.');
    if (!['formalization', 'completed'].includes(op.crm?.stage)) throw Error('El expediente debe estar en formalización o completado.');
    const amount = cents(entry.amount);
    if (!Number.isSafeInteger(amount) || amount <= 0) throw Error('Indica un monto válido.');
    const originals = history.filter((item) => !item.reverses && item.kind === entry.kind);
    if (originals.some((item) => item.note.trim().toLowerCase() === entry.note.trim().toLowerCase())) throw Error('Ya existe un registro con esa referencia.');
    const active = originals.filter((item) => !history.some((other) => other.reverses === item.id));
    if (history.some((item) => item.kind === entry.kind && item.date > entry.date)) {
      throw Error('La fecha es anterior a otro movimiento de este tipo en el expediente.');
    }
    if (entry.kind === 'sale' && active.length) throw Error('Ya hay una entrega confirmada para esta venta.');
    if (entry.kind === 'credit') {
      const approved = cents(op.crm.approvedAmount);
      const used = active.reduce((sum, item) => sum + item.amount, 0);
      if (!(approved > 0) || used + amount > approved) throw Error('El desembolso supera el capital aprobado disponible.');
    }
    return [...history, { ...entry, amount }];
  }

  const validMonth = (month) => /^\d{4}-(0[1-9]|1[0-2])$/.test(month);

  function monthlyTargets(goals, month) {
    const chosen = new Map();
    for (const goal of goals) {
      if (goal.month > month || (goal.endsBefore && month >= goal.endsBefore) ||
          (!goal.recurring && goal.month !== month)) continue;
      const key = JSON.stringify([goal.metric, goal.employee || '', goal.employee ? '' : goal.team, goal.employee ? '' : goal.branch]);
      const previous = chosen.get(key);
      if (!previous || (goal.recurring && !previous.recurring) ||
          (Boolean(previous.recurring) === Boolean(goal.recurring) && previous.month < goal.month)) chosen.set(key, goal);
    }
    return [...chosen.values()];
  }

  function recordDirect(records, entry, today = day()) {
    if (entry.reverses) {
      const original = records.find((item) => item.id === entry.reverses && !item.reverses);
      if (!original) throw Error('Transacción no encontrada.');
      const performance = records.filter((item) => item.id === original.id || item.reverses === original.id);
      const revision = record({ performance }, entry, today).at(-1);
      return [...records, revision];
    }
    if (!validDay(entry.date) || entry.date > today) throw Error('Indica una fecha efectiva válida.');
    if (!entry.note?.trim() || !entry.employee || !['sale', 'credit'].includes(entry.kind)) throw Error('Completa la transacción.');
    const amount = cents(entry.amount);
    if (!Number.isSafeInteger(amount) || amount <= 0) throw Error('Indica un monto válido.');
    return [...records, { ...entry, amount }];
  }

  function movements(operations, indicator) {
    const metric = indicators[indicator];
    return operations.flatMap((operation) => {
      const active = new Set();
      let counted;
      const entries = (operation.performance || []).filter((item) => item.kind === metric.kind)
        .sort((a, b) => a.date.localeCompare(b.date));
      return entries.flatMap((entry) => {
        const before = counted;
        if (entry.reverses) {
          if (!active.delete(entry.reverses)) return [];
          if (!active.size) counted = undefined;
        } else {
          active.add(entry.id);
          counted ||= entry;
        }
        const rows = metric.count
          ? before === counted ? [] : counted ? [[counted, 1]] : [[before, -1]]
          : [[entry, (entry.reverses ? -1 : 1) * entry.amount / 100]];
        return rows.map(([owner, value]) => ({
          ...owner, date: entry.date, value, reference: operation.reference, note: entry.note, direct: operation.direct === true,
          reversal: Boolean(entry.reverses)
        }));
      });
    });
  }

  function daysFor(month) {
    const [year, index] = month.split('-').map(Number);
    return Array.from({ length: new Date(Date.UTC(year, index, 0)).getUTCDate() }, (_, i) => {
      const date = month + '-' + String(i + 1).padStart(2, '0');
      const weekday = new Date(date).getUTCDay();
      return { date, working: weekday > 0 && weekday < 6 };
    });
  }

  const api = { indicators, day, isSale, record, recordDirect, movements, daysFor, monthlyTargets, validMonth, nextMonth };
  if (typeof module === 'object') module.exports = api;
  else root.PerformanceCore = api;
})(globalThis);
