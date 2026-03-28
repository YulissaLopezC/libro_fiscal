// ── FORMATO DE VALOR ──────────────────────────────────────────
export function formatValor(input) {
  const raw = input.value.replace(/\D/g, '');
  if (raw) input.value = '$ ' + parseInt(raw).toLocaleString('es-CO');
  else input.value = '';
}

export function parsearValor(str) {
  return parseInt(str.replace(/\D/g, '')) || 0;
}

export function formatCOP(numero) {
  return '$' + Math.abs(numero).toLocaleString('es-CO');
}

// ── TOAST ─────────────────────────────────────────────────────
export function toast(msg, error = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = error ? '#c0392b' : '#2d7a4f';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── EXPORTAR CSV ──────────────────────────────────────────────
export function exportarCSV(movimientos, nombreEmpresa) {
  const headers = [
    'Fecha','Tipo','Cuenta','Subcuenta','Auxiliar',
    'Proveedor','Recibo','Metodo','Valor','Facturado a'
  ];
  const rows = movimientos.map(m => [
    m.fecha, m.tipo, m.cuenta, m.subcuenta || '',
    m.auxiliar || '', m.proveedor || '', m.recibo || '',
    m.metodo, m.valor, m.facturadoA || ''
  ].join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = `${nombreEmpresa}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  toast('CSV exportado ✓');
}

// ── FECHA HOY ─────────────────────────────────────────────────
export function fechaHoy() {
  return new Date().toISOString().slice(0, 10);
}