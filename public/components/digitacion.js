import { state } from '../core/state.js';
import { toast, formatValor, fechaHoy } from '../helpers.js';
import { guardarMovimiento, limpiarFormulario } from '../services/movimientos.js';
import { navigate } from '../core/router.js';
import { buscarProveedores, guardarProveedor } from '../services/proveedores.js';

export function iniciarDigitacion() {
  // Fecha hoy por defecto
  const campoFecha = document.getElementById('campo-fecha');
  if (campoFecha) campoFecha.value = fechaHoy();

  // Autocomplete proveedor
  const inputProv = document.getElementById('campo-proveedor');
  const sugs      = document.getElementById('proveedor-sugerencias');

  // Tipo movimiento
  document.getElementById('tipo-salida')
    ?.addEventListener('click', () => setTipo('SALIDA'));
  document.getElementById('tipo-entrada')
    ?.addEventListener('click', () => setTipo('ENTRADA'));

  // Formato valor
  document.getElementById('campo-valor')
    ?.addEventListener('input', e => formatValor(e.target));

  // Subcuentas dinámicas
  document.getElementById('campo-cuenta')
    ?.addEventListener('change', actualizarSubcuentas);

  // Botones
  document.getElementById('btn-guardar')
    ?.addEventListener('click', async () => {
      const ok = await guardarMovimiento();
      if (ok) {
        limpiarFormulario();
        navigate('movimientos');
      }
    });

  document.getElementById('btn-limpiar')
    ?.addEventListener('click', limpiarFormulario);

  // subcuentas
  document.getElementById('campo-subcuenta')
    ?.addEventListener('change', actualizarAuxiliares);

  inputProv?.addEventListener('input', () => {
    const resultados = buscarProveedores(inputProv.value);
    if (resultados.length === 0) { sugs.style.display = 'none'; return; }
    sugs.style.display = 'block';
    sugs.innerHTML = resultados.map(p => `
      <div class="sug-item" data-id="${p.id}"
        data-nombre="${p.nombre}" data-nit="${p.nit || ''}"
        style="padding:10px 14px;cursor:pointer;font-size:13px;
        border-bottom:1px solid var(--border)">
        <div style="font-weight:600">${p.nombre}</div>
        <div style="font-size:11px;color:var(--muted);
          font-family:'DM Mono',monospace">${p.nit || 'Sin NIT'}</div>
      </div>`).join('');

      sugs.querySelectorAll('.sug-item').forEach(item => {
      item.addEventListener('mouseenter', () =>
        item.style.background = 'var(--surface2)');
      item.addEventListener('mouseleave', () =>
        item.style.background = '');
      item.addEventListener('click', () => {
        inputProv.value = item.dataset.nombre;
        document.getElementById('campo-nit').value = item.dataset.nit;
        document.getElementById('campo-proveedor-id').value = item.dataset.id;
        sugs.style.display = 'none';
      });
    });
  });

  // Cerrar sugerencias al hacer clic afuera
  document.addEventListener('click', e => {
    if (!e.target.closest('#campo-proveedor') &&
        !e.target.closest('#proveedor-sugerencias')) {
      sugs.style.display = 'none';
    }
  });

  // Nuevo proveedor
  document.getElementById('btn-nuevo-proveedor')
  ?.addEventListener('click', async () => {
    const nombre = inputProv.value.trim().toUpperCase();
    const nit    = document.getElementById('campo-nit').value.trim();
    if (!nombre) { toast('Escribe el nombre del proveedor', true); return; }
    const nuevo = await guardarProveedor({ nombre, nit });
    document.getElementById('campo-proveedor-id').value = nuevo.id;
    sugs.style.display = 'none';
    toast('Proveedor guardado ✓');
  });
}

export function poblarSelectCuentas() {
  const sel     = document.getElementById('campo-cuenta');
  const selFilt = document.getElementById('filtro-cuenta');
  if (!sel) return;

  sel.innerHTML = '<option value="">Seleccionar...</option>' +
    Object.keys(state.cuentas)
      .map(c => `<option>${c}</option>`).join('');

  if (selFilt) selFilt.innerHTML =
    '<option value="">Todas las cuentas</option>' +
    Object.keys(state.cuentas)
      .map(c => `<option>${c}</option>`).join('');

  actualizarSubcuentas();
}

export function poblarSelectMetodos() {
  const sel     = document.getElementById('campo-metodo');
  const selFilt = document.getElementById('filtro-metodo');
  if (!sel) return;

  sel.innerHTML = state.metodos
    .map(m => `<option>${m}</option>`).join('');

  if (selFilt) selFilt.innerHTML =
    '<option value="">Todos los métodos</option>' +
    state.metodos.map(m => `<option>${m}</option>`).join('');
}

export function actualizarSubcuentas() {
  const cuenta = document.getElementById('campo-cuenta')?.value;
  const sel    = document.getElementById('campo-subcuenta');
  if (!sel) return;

  if (!cuenta || !state.cuentas[cuenta]) {
    sel.innerHTML = '<option value="">—</option>';
    actualizarAuxiliares();
    return;
  }

  // state.cuentas[cuenta] puede ser objeto {sub:[aux]} o array legacy
  const subcuentas = state.cuentas[cuenta];
  if (Array.isArray(subcuentas)) {
    // estructura vieja: array de strings
    sel.innerHTML = subcuentas
      .map(s => `<option>${s}</option>`).join('');
  } else {
    // estructura nueva: objeto con keys
    sel.innerHTML = Object.keys(subcuentas)
      .map(s => `<option>${s}</option>`).join('');
  }

  actualizarAuxiliares();
}

export function actualizarAuxiliares() {
  const cuenta = document.getElementById('campo-cuenta')?.value;
  const sub    = document.getElementById('campo-subcuenta')?.value;
  const sel    = document.getElementById('campo-auxiliar-sel');
  if (!sel) return;
  if (!cuenta || !sub || !state.cuentas[cuenta]?.[sub]) {
    sel.innerHTML = '<option value="">—</option>';
    return;
  }
  sel.innerHTML = '<option value="">Seleccionar...</option>' +
    state.cuentas[cuenta][sub]
      .map(a => `<option>${a}</option>`).join('');
}

function setTipo(tipo) {
  document.getElementById('campo-tipo').value = tipo;
  document.getElementById('tipo-salida')
    .classList.toggle('active', tipo === 'SALIDA');
  document.getElementById('tipo-entrada')
    .classList.toggle('active', tipo === 'ENTRADA');
}