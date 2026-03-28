import { state } from '../core/state.js';
import { formatCOP } from '../helpers.js';

export function renderDashboard() {
  const movs     = state.movimientos;
  const entradas = movs.filter(m => m.tipo === 'ENTRADA');
  const salidas  = movs.filter(m => m.tipo === 'SALIDA');
  const totalE   = entradas.reduce((a, m) => a + m.valor, 0);
  const totalS   = salidas.reduce((a, m) => a + m.valor, 0);
  const balance  = totalE - totalS;

  document.getElementById('stat-entradas').textContent = formatCOP(totalE);
  document.getElementById('stat-salidas').textContent  = formatCOP(totalS);
  document.getElementById('stat-count').textContent    = movs.length;

  const balEl = document.getElementById('stat-balance');
  balEl.textContent = (balance >= 0 ? '+' : '−') + formatCOP(balance);
  balEl.style.color = balance >= 0 ? 'var(--verde)' : 'var(--rojo)';

  const tbody = document.getElementById('tbody-recientes');
  if (!tbody) return;

  if (movs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6"
      style="text-align:center;padding:28px;color:var(--muted)">
      Sin movimientos aún</td></tr>`;
    return;
  }

  tbody.innerHTML = movs.slice(0, 6).map(m => {
    const esE   = m.tipo === 'ENTRADA';
    const cls   = esE ? 'valor-entrada' : 'valor-salida';
    const signo = esE ? '+' : '−';
    const badge = esE
      ? '<span class="badge badge-entrada">↑ Entrada</span>'
      : '<span class="badge badge-salida">↓ Salida</span>';
    const fecha = m.fecha ? m.fecha.split('-').reverse().join('/') : '—';
    return `<tr>
      <td style="font-family:'DM Mono',monospace;font-size:12px">${fecha}</td>
      <td><span class="cuenta-pill">
        ${[m.cuenta, m.subcuenta].filter(Boolean).join(' · ')}
      </span></td>
      <td style="font-size:12px;color:var(--muted)">${m.proveedor || '—'}</td>
      <td style="font-size:12px;color:var(--muted)">${m.metodo}</td>
      <td>${badge}</td>
      <td class="${cls}" style="font-family:'DM Mono',monospace">
        ${signo}${formatCOP(m.valor)}
      </td>
    </tr>`;
  }).join('');
}