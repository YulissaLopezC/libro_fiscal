import { state } from '../core/state.js';
import {
  agregarCuenta, eliminarCuenta,
  agregarSubcuenta, eliminarSubcuenta,
  agregarAuxiliar, eliminarAuxiliar
} from '../services/empresas.js';
import { poblarSelectCuentas } from './digitacion.js';

export function renderCatalogo(cuentas) {
  const el = document.getElementById('catalogo-lista');
  if (!el) return;

  el.innerHTML = Object.entries(cuentas).map(([cuenta, subcuentas]) => {
    const esObjeto = !Array.isArray(subcuentas);
    const subsHTML = esObjeto
      ? Object.entries(subcuentas).map(([sub, auxiliares]) => `
          <div class="catalogo-sub-item">
            <div class="catalogo-sub-header">
              <span class="sub-nombre">↳ ${sub}</span>
              <div style="display:flex;gap:6px;align-items:center">
                <button class="sub-chip add-sub"
                  data-accion="agregar-aux"
                  data-cuenta="${cuenta}"
                  data-sub="${sub}">+ auxiliar</button>
                <button class="btn-icon"
                  data-accion="eliminar-sub"
                  data-cuenta="${cuenta}"
                  data-sub="${sub}">✕</button>
              </div>
            </div>
            <div class="catalogo-auxiliares">
              ${(auxiliares || []).map(a => `
                <span class="sub-chip">${a}
                  <button
                    data-accion="eliminar-aux"
                    data-cuenta="${cuenta}"
                    data-sub="${sub}"
                    data-aux="${a}">×</button>
                </span>`).join('')}
            </div>
          </div>`).join('')
      : subcuentas.map(s => `
          <span class="sub-chip">${s}
            <button data-accion="eliminar-sub"
              data-cuenta="${cuenta}"
              data-sub="${s}">×</button>
          </span>`).join('');

    return `
      <div class="catalogo-item">
        <div class="catalogo-cuenta">
          <strong>${cuenta}</strong>
          <div style="display:flex;gap:8px">
            <button class="sub-chip add-sub"
              data-accion="agregar-sub"
              data-cuenta="${cuenta}">+ subcuenta</button>
            <button class="btn-icon"
              data-accion="eliminar-cuenta"
              data-cuenta="${cuenta}">✕</button>
          </div>
        </div>
        <div class="catalogo-subs">${subsHTML}</div>
      </div>`;
  }).join('');

  // Eventos delegados
  el.addEventListener('click', async (e) => {
    const btn    = e.target.closest('[data-accion]');
    if (!btn) return;
    const accion  = btn.dataset.accion;
    const cuenta  = btn.dataset.cuenta;
    const sub     = btn.dataset.sub;
    const aux     = btn.dataset.aux;

    if      (accion === 'eliminar-cuenta') await eliminarCuenta(cuenta);
    else if (accion === 'agregar-sub')     await agregarSubcuenta(cuenta);
    else if (accion === 'eliminar-sub')    await eliminarSubcuenta(cuenta, sub);
    else if (accion === 'agregar-aux')     await agregarAuxiliar(cuenta, sub);
    else if (accion === 'eliminar-aux')    await eliminarAuxiliar(cuenta, sub, aux);

    renderCatalogo(state.cuentas);
    poblarSelectCuentas();
  });
}

export function iniciarCatalogo() {
  document.getElementById('btn-agregar-cuenta')
    ?.addEventListener('click', async () => {
      await agregarCuenta();
      renderCatalogo(state.cuentas);
      poblarSelectCuentas();
    });
}