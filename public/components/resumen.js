import { state } from '../core/state.js';
import { formatCOP } from '../helpers.js';

export function renderResumen() {
  const movs    = state.movimientos;
  const salidas = movs.filter(m => m.tipo === 'SALIDA');
  const entradas= movs.filter(m => m.tipo === 'ENTRADA');
  const totalS  = salidas.reduce((a, m) => a + m.valor, 0);
  const totalE  = entradas.reduce((a, m) => a + m.valor, 0);
  const balance = totalE - totalS;

  document.getElementById('resumen-entradas').textContent = formatCOP(totalE);
  document.getElementById('resumen-salidas').textContent  = formatCOP(totalS);
  document.getElementById('base-ica').textContent         = formatCOP(totalS);

  const balEl = document.getElementById('resumen-balance');
  balEl.textContent = (balance >= 0 ? '+' : '−') + formatCOP(balance);
  balEl.style.color = balance >= 0 ? 'var(--verde)' : 'var(--rojo)';

  // Por cuenta
  const porCuenta = {};
  salidas.forEach(m => {
    const k = [m.cuenta, m.subcuenta].filter(Boolean).join(' · ');
    porCuenta[k] = (porCuenta[k] || 0) + m.valor;
  });
  const maxC = Math.max(...Object.values(porCuenta), 1);
  const elC  = document.getElementById('tbody-resumen-cuentas');
  if (elC) elC.innerHTML = Object.entries(porCuenta)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `
      <div class="categoria-row">
        <div style="flex:1">
          <div class="cat-name">${k}</div>
          <div class="cat-bar-wrap">
            <div class="cat-bar"
              style="width:${Math.round(v/maxC*100)}%"></div>
          </div>
        </div>
        <div class="cat-valor">${formatCOP(v)}</div>
      </div>`).join('')
    || '<div style="color:var(--muted);padding:12px 0">Sin datos</div>';

  // Por método
  const porMetodo = {};
  movs.forEach(m => {
    porMetodo[m.metodo] = (porMetodo[m.metodo] || 0) + m.valor;
  });
  const maxM = Math.max(...Object.values(porMetodo), 1);
  const elM  = document.getElementById('tbody-resumen-metodos');
  if (elM) elM.innerHTML = Object.entries(porMetodo)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `
      <div class="categoria-row">
        <div style="flex:1">
          <div class="cat-name">${k}</div>
          <div class="cat-bar-wrap">
            <div class="cat-bar"
              style="width:${Math.round(v/maxM*100)}%;
              background:var(--azul)"></div>
          </div>
        </div>
        <div class="cat-valor">${formatCOP(v)}</div>
      </div>`).join('')
    || '<div style="color:var(--muted);padding:12px 0">Sin datos</div>';
}