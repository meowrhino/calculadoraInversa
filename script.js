(() => {
  // Selección de elementos del DOM
  const $ = (id) => document.getElementById(id);

  const fmt = new Intl.NumberFormat('es-ES', { 
    style: 'currency', 
    currency: 'EUR' 
  });

  const els = {
    baseAmount: $('baseAmount'),
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

  // Estado de IRPF
  let irpfEnabled = false;

  // Utilidades
  const toNum = (v) => {
    const n = Number(String(v).replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  };

  const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

  // Función de cálculo principal
  function compute() {
    const base = Math.max(0, toNum(els.baseAmount.value));
    const ivaRate = Math.max(0, Math.floor(toNum(els.ivaRate.value))) / 100;
    const irpfRate = irpfEnabled 
      ? Math.max(0, Math.floor(toNum(els.irpfRate.value))) / 100 
      : 0;

    const iva = round2(base * ivaRate);
    const irpf = round2(base * irpfRate);
    const total = round2(base + iva - irpf);

    // Actualizar UI
    els.baseOut.textContent = fmt.format(base);
    els.ivaOut.textContent = fmt.format(iva);
    els.totalOut.textContent = fmt.format(total);

    if (irpfEnabled && irpf > 0) {
      els.irpfRow.style.display = 'flex';
      els.irpfOut.textContent = '− ' + fmt.format(irpf);
    } else {
      els.irpfRow.style.display = 'none';
      els.irpfOut.textContent = fmt.format(0);
    }
  }

  // Toggle de IRPF
  function toggleIrpfState() {
    irpfEnabled = !irpfEnabled;
    
    if (irpfEnabled) {
      els.irpfRate.disabled = false;
      els.toggleIrpf.classList.add('active');
      els.toggleIcon.textContent = '✓';
      if (els.irpfRate.value === '0') {
        els.irpfRate.value = '15';
      }
    } else {
      els.irpfRate.disabled = true;
      els.toggleIrpf.classList.remove('active');
      els.toggleIcon.textContent = '✗';
    }
    
    compute();
  }

  // Inicializar estado
  function init() {
    // IRPF desactivado por defecto
    els.irpfRate.disabled = true;
    els.irpfRate.value = '0';
    
    // Eventos de input
    els.baseAmount.addEventListener('input', compute);
    els.baseAmount.addEventListener('change', compute);
    
    els.ivaRate.addEventListener('input', compute);
    els.ivaRate.addEventListener('change', compute);
    
    els.irpfRate.addEventListener('input', compute);
    els.irpfRate.addEventListener('change', compute);
    
    // Evento del botón toggle
    els.toggleIrpf.addEventListener('click', toggleIrpfState);
    
    // Cálculo inicial
    compute();
  }

  init();
})();
