(() => {
  const $ = (id) => document.getElementById(id);

  const fmt = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  });

  const DEFAULT_RATES = {
    iva: 21,
    irpf: 15
  };

  const els = {
    baseAmount: $('baseAmount'),
    totalAmount: $('totalAmount'),
    ivaRate: $('ivaRate'),
    irpfRate: $('irpfRate'),
    toggleIva: $('toggleIva'),
    toggleIvaIcon: $('toggleIvaIcon'),
    toggleIrpf: $('toggleIrpf'),
    toggleIrpfIcon: $('toggleIrpfIcon'),

    baseOut: $('baseOut'),
    ivaOut: $('ivaOut'),
    irpfOut: $('irpfOut'),
    totalOut: $('totalOut'),
    ivaRow: $('ivaRow'),
    irpfRow: $('irpfRow')
  };

  // Estado de UI
  let ivaEnabled = true;
  let irpfEnabled = false;
  let lastEdited = 'base'; // 'base' | 'total'
  let isUpdating = false;

  // Utilidades numéricas y formato
  const toNum = (v) => {
    const n = Number(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  };

  const toCents = (n) => Math.round((Number(n) + Number.EPSILON) * 100);
  const fromCents = (c) => (c / 100);
  const formatMoney = (c) => fmt.format(fromCents(c));
  const clampNonNeg = (cents) => Math.max(0, Math.trunc(cents));
  const percentToRate = (v) => Math.max(0, Math.floor(toNum(v))) / 100;
  const centsToInput = (c) => fromCents(c).toFixed(2);

  function computeLinesFromBaseCents(baseC, ivaRate, irpfRate) {
    const ivaC = Math.round(baseC * ivaRate);
    const irpfC = Math.round(baseC * irpfRate);
    const totalC = baseC + ivaC - irpfC;
    return { baseC, ivaC, irpfC, totalC };
  }

  function findBaseCentsForTotal(totalC, ivaRate, irpfRate) {
    const factor = 1 + ivaRate - irpfRate;
    if (factor <= 0) return { baseC: null, ok: false, reason: 'factor' };

    let baseGuess = Math.round(totalC / factor);
    baseGuess = clampNonNeg(baseGuess);

    const target = clampNonNeg(totalC);

    const test = (baseC) => {
      const r = computeLinesFromBaseCents(baseC, ivaRate, irpfRate);
      return r.totalC === target ? r : null;
    };

    let hit = test(baseGuess);
    if (hit) return { baseC: hit.baseC, ok: true };

    const MAX_DELTA = 500; // ±5,00€
    for (let d = 1; d <= MAX_DELTA; d++) {
      hit = test(baseGuess + d);
      if (hit) return { baseC: hit.baseC, ok: true };
      if (baseGuess - d >= 0) {
        hit = test(baseGuess - d);
        if (hit) return { baseC: hit.baseC, ok: true };
      }
    }

    return { baseC: baseGuess, ok: true, approx: true };
  }

  function setToggleUI(inputEl, buttonEl, iconEl, enabled) {
    inputEl.disabled = !enabled;
    buttonEl.classList.toggle('active', enabled);
    buttonEl.setAttribute('aria-pressed', String(enabled));
    iconEl.textContent = enabled ? '✓' : '✗';
  }

  function setIvaUI() {
    setToggleUI(els.ivaRate, els.toggleIva, els.toggleIvaIcon, ivaEnabled);
  }

  function setIrpfUI() {
    setToggleUI(els.irpfRate, els.toggleIrpf, els.toggleIrpfIcon, irpfEnabled);
  }

  function setRateRow(rowEl, valueEl, enabled, cents, prefix = '') {
    if (enabled && cents > 0) {
      rowEl.style.display = 'flex';
      valueEl.textContent = prefix + formatMoney(cents);
      return;
    }

    rowEl.style.display = 'none';
    valueEl.textContent = formatMoney(0);
  }

  function setRateRowUnknown(rowEl, valueEl, enabled) {
    if (enabled) {
      rowEl.style.display = 'flex';
      valueEl.textContent = '—';
      return;
    }

    rowEl.style.display = 'none';
    valueEl.textContent = formatMoney(0);
  }

  function updateOutputs({ baseC, ivaC, irpfC, totalC }) {
    els.baseOut.textContent = formatMoney(baseC);
    els.totalOut.textContent = formatMoney(totalC);
    setRateRow(els.ivaRow, els.ivaOut, ivaEnabled, ivaC);
    setRateRow(els.irpfRow, els.irpfOut, irpfEnabled, irpfC, '− ');

    isUpdating = true;
    try {
      // Sincronizar el campo “opuesto” sin crear bucles
      if (lastEdited === 'base') {
        els.totalAmount.value = centsToInput(totalC);
      } else {
        els.baseAmount.value = centsToInput(baseC);
      }
    } finally {
      isUpdating = false;
    }
  }

  function compute() {
    const ivaRate = ivaEnabled ? percentToRate(els.ivaRate.value) : 0;
    const irpfRate = irpfEnabled ? percentToRate(els.irpfRate.value) : 0;

    if (lastEdited === 'base') {
      const baseC = clampNonNeg(toCents(Math.max(0, toNum(els.baseAmount.value))));
      const lines = computeLinesFromBaseCents(baseC, ivaRate, irpfRate);
      updateOutputs(lines);
      return;
    }

    const totalC = clampNonNeg(toCents(Math.max(0, toNum(els.totalAmount.value))));
    const solved = findBaseCentsForTotal(totalC, ivaRate, irpfRate);

    if (solved.baseC == null) {
      els.baseOut.textContent = '—';
      els.totalOut.textContent = formatMoney(totalC);
      setRateRowUnknown(els.ivaRow, els.ivaOut, ivaEnabled);
      setRateRowUnknown(els.irpfRow, els.irpfOut, irpfEnabled);
      return;
    }

    const lines = computeLinesFromBaseCents(solved.baseC, ivaRate, irpfRate);
    updateOutputs(lines);
  }

  function toggleIvaState() {
    ivaEnabled = !ivaEnabled;

    if (ivaEnabled) {
      if (els.ivaRate.value === '0' || els.ivaRate.value.trim() === '') {
        els.ivaRate.value = String(DEFAULT_RATES.iva);
      }
    } else {
      els.ivaRate.value = '0';
    }

    setIvaUI();
    compute();
  }

  function toggleIrpfState() {
    irpfEnabled = !irpfEnabled;

    if (irpfEnabled) {
      if (els.irpfRate.value === '0' || els.irpfRate.value.trim() === '') {
        els.irpfRate.value = String(DEFAULT_RATES.irpf);
      }
    } else {
      els.irpfRate.value = '0';
    }

    setIrpfUI();
    compute();
  }

  function bindAmountField(inputEl, field) {
    const handler = () => {
      if (isUpdating) return;
      lastEdited = field;
      compute();
    };

    inputEl.addEventListener('input', handler);
    inputEl.addEventListener('change', handler);
  }

  function bindRateField(inputEl) {
    inputEl.addEventListener('input', compute);
    inputEl.addEventListener('change', compute);
  }

  function init() {
    // IVA activado por defecto
    ivaEnabled = true;
    if (els.ivaRate.value === '0' || els.ivaRate.value.trim() === '') {
      els.ivaRate.value = String(DEFAULT_RATES.iva);
    }
    setIvaUI();

    // IRPF desactivado por defecto
    irpfEnabled = false;
    els.irpfRate.value = '0';
    setIrpfUI();

    // Total inicial coherente con la base inicial
    lastEdited = 'base';
    compute();

    // Eventos (bidireccional)
    bindAmountField(els.baseAmount, 'base');
    bindAmountField(els.totalAmount, 'total');
    bindRateField(els.ivaRate);
    bindRateField(els.irpfRate);

    els.toggleIva.addEventListener('click', toggleIvaState);
    els.toggleIrpf.addEventListener('click', toggleIrpfState);
  }

  init();
})();
