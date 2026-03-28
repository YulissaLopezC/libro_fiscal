import { state } from '../core/state.js';
import { formatCOP } from '../helpers.js';
import { eliminarMovimiento } from '../services/movimientos.js';
import { exportarCSV} from '../helpers.js';

export function renderMovimientos() {
  const filtroTipo   = document.getElementById('filtro-tipo')?.value   || '';
  const filtroMetodo = document.getElementById('filtro-metodo')?.value || '';
  const filtroCuenta = document.getElementById('filtro-cuenta')?.value || '';

  const lista = state.movimientos.filter(m => {
    if (filtroTipo   && m.tipo   !== filtroTipo)   return false;
    if (filtroMetodo && m.metodo !== filtroMetodo) return false;
    if (filtroCuenta && m.cuenta !== filtroCuenta) return false;
    return true;
  });

  const tbody = document.getElementById('tbody-movimientos');
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9"
      style="text-align:center;padding:28px;color:var(--muted)">
      Sin movimientos registrados</td></tr>`;
    return;
  }

  tbody.innerHTML = lista.map((m, i) => {
    const esE    = m.tipo === 'ENTRADA';
    const cls    = esE ? 'valor-entrada' : 'valor-salida';
    const signo  = esE ? '+' : '−';
    const badge  = esE
      ? '<span class="badge badge-entrada">↑</span>'
      : '<span class="badge badge-salida">↓</span>';
    const fecha  = m.fecha ? m.fecha.split('-').reverse().join('/') : '—';
    const cuenta = [m.cuenta, m.subcuenta, m.auxiliar]
      .filter(Boolean).join(' · ');
    const num    = String(lista.length - i).padStart(3, '0');

    return `<tr>
      <td style="font-family:'DM Mono',monospace;font-size:11px;
        color:var(--muted)">${num}</td>
      <td style="font-family:'DM Mono',monospace;font-size:12px">${fecha}</td>
      <td><span class="cuenta-pill">${cuenta}</span></td>
      <td style="font-size:12px;color:var(--muted)">${m.proveedor || '—'}</td>
      <td style="font-family:'DM Mono',monospace;font-size:11px;
        color:var(--muted)">${m.recibo || '—'}</td>
      <td style="font-size:12px;color:var(--muted)">${m.metodo}</td>
      <td>${badge}</td>
      <td class="${cls}" style="font-family:'DM Mono',monospace">
        ${signo}${formatCOP(m.valor)}
      </td>
      <td><button class="btn-icon"
        data-id="${m.id}"
        title="Eliminar">✕</button></td>
    </tr>`;
  }).join('');

  // Eventos eliminar
  tbody.querySelectorAll('.btn-icon[data-id]').forEach(btn => {
    btn.addEventListener('click', () => eliminarMovimiento(btn.dataset.id));
  });

  // Eventos filtros
  ['filtro-tipo','filtro-metodo','filtro-cuenta'].forEach(id => {
    document.getElementById(id)
      ?.addEventListener('change', renderMovimientos);
  });

  // Evento exportar
  const btnExp = document.getElementById('btn-exportar');
  if (btnExp) {
    btnExp.replaceWith(btnExp.cloneNode(true)); // limpia listeners viejos
    document.getElementById('btn-exportar')
      .addEventListener('click', () => {
        const emp = state.getEmpresa();
        exportarCSV(state.movimientos, emp?.nombre || 'empresa');
      });
  }
}