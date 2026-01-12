(() => {
  const $ = (id) => document.getElementById(id);

  const fmt = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  });

  const els = {
    baseAmount: $('baseAmount'),
    totalAmount: $('totalAmount'),
    ivaRate: $('ivaRate'),
    irpfRate: $('irpfRate'),
    toggleIrpf: $('toggleIrpf'),
    toggleIcon: $('toggleIcon'),

    baseOut: $('baseOut'),
    ivaOut: $('ivaOut'),
    irpfOut: $('irpfOut'),
    totalOut: $('totalOut'),
    irpfRow: $('irpfRow'),
  };

  // Estado
  let irpfEnabled = false;
  let lastEdited = 'base'; // 'base' | 'total'
  let isUpdating = false;

  // Utilidades numéricas
  const toNum = (v) => {
    const n = Number(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  };

  const toCents = (n) => Math.round((Number(n) + Number.EPSILON) * 100);
  const fromCents = (c) => (c / 100);
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

  function setIrpfUI() {
    if (irpfEnabled) {
      els.irpfRate.disabled = false;
      els.toggleIrpf.classList.add('active');
      els.toggleIcon.textContent = '✓';
    } else {
      els.irpfRate.disabled = true;
      els.toggleIrpf.classList.remove('active');
      els.toggleIcon.textContent = '✗';
    }
  }

  function updateOutputs({ baseC, ivaC, irpfC, totalC }) {
    els.baseOut.textContent = fmt.format(fromCents(baseC));
    els.ivaOut.textContent = fmt.format(fromCents(ivaC));
    els.totalOut.textContent = fmt.format(fromCents(totalC));

    if (irpfEnabled && irpfC > 0) {
      els.irpfRow.style.display = 'flex';
      els.irpfOut.textContent = '− ' + fmt.format(fromCents(irpfC));
    } else {
      els.irpfRow.style.display = 'none';
      els.irpfOut.textContent = fmt.format(0);
    }

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
    const ivaRate = percentToRate(els.ivaRate.value);
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
      els.ivaOut.textContent = '—';
      els.totalOut.textContent = fmt.format(fromCents(totalC));
      els.irpfRow.style.display = 'none';
      return;
    }

    const lines = computeLinesFromBaseCents(solved.baseC, ivaRate, irpfRate);
    updateOutputs(lines);
  }

  function toggleIrpfState() {
    irpfEnabled = !irpfEnabled;

    if (irpfEnabled) {
      if (els.irpfRate.value === '0' || els.irpfRate.value.trim() === '') {
        els.irpfRate.value = '15';
      }
    } else {
      els.irpfRate.value = '0';
    }

    setIrpfUI();
    compute();
  }

  function init() {
    // IRPF desactivado por defecto
    irpfEnabled = false;
    els.irpfRate.value = '0';
    setIrpfUI();

    // Total inicial coherente con la base inicial
    lastEdited = 'base';
    compute();

    // Eventos (bidireccional)
    els.baseAmount.addEventListener('input', () => {
      if (isUpdating) return;
      lastEdited = 'base';
      compute();
    });
    els.baseAmount.addEventListener('change', () => {
      if (isUpdating) return;
      lastEdited = 'base';
      compute();
    });

    els.totalAmount.addEventListener('input', () => {
      if (isUpdating) return;
      lastEdited = 'total';
      compute();
    });
    els.totalAmount.addEventListener('change', () => {
      if (isUpdating) return;
      lastEdited = 'total';
      compute();
    });

    els.ivaRate.addEventListener('input', compute);
    els.ivaRate.addEventListener('change', compute);

    els.irpfRate.addEventListener('input', compute);
    els.irpfRate.addEventListener('change', compute);

    els.toggleIrpf.addEventListener('click', toggleIrpfState);
  }

  init();
})();