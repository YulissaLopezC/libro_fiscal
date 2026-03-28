import { cargarEmpresas, crearEmpresa, empresas,
  agregarCuenta, eliminarCuenta,
  agregarSubcuenta, eliminarSubcuenta,
  renderEmpresasList } from './services/empresas.js';

import { suscribirMovimientos, guardarMovimiento,
  eliminarMovimiento, limpiarFormulario } from './movimientos.js';

import { poblarSelectCuentas, poblarSelectMetodos,
  actualizarSubcuentas, renderCatalogo,
  showView } from './ui.js';

import { formatValor, exportarCSV, fechaHoy } from './helpers.js';

import { logoutHandler } from './auth.js';
import { cargarVista } from './core/viewsLoader.js'; // 🔥 NUEVO

// ── ESTADO ───────────────────────────────────────────────────
let empresaId  = null;
let cuentas    = {};
let metodos    = [];

// ── INICIAR APP ──────────────────────────────────────────────
export async function iniciarApp() {
  await cargarEmpresas();
  registrarEventos();
}

// ── SELECCIONAR EMPRESA ──────────────────────────────────────
export async function seleccionarEmpresa(id) {
  empresaId = id;

  const emp = empresas.find(e => e.id === id);
  cuentas   = emp.cuentas || {};
  metodos   = emp.metodos || [];

  // Sidebar activo
  document.querySelectorAll('.empresa-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.id === id)
  );

  // Nombre en UI
  document.querySelectorAll('.empresa-nombre')
    .forEach(el => el.textContent = emp.nombre);

  // Selects
  poblarSelectCuentas(cuentas);
  poblarSelectMetodos(metodos);

  // Suscripción datos
  suscribirMovimientos(id);
}

// ── EVENTOS ──────────────────────────────────────────────────
function registrarEventos() {

  // Enter login
  document.getElementById('login-pass')
    ?.addEventListener('keydown', e => {
      if (e.key === 'Enter') window.APP.login();
    });

  // Fecha default
  const fecha = document.getElementById('campo-fecha');
  if (fecha) fecha.value = fechaHoy();

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
    ?.addEventListener('change', () => actualizarSubcuentas(cuentas));

  // Filtros
  ['filtro-tipo', 'filtro-metodo', 'filtro-cuenta'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => {
      import('./movimientos.js').then(m =>
        import('./ui.js').then(ui =>
          ui.renderMovimientos(m.movimientos)
        )
      );
    });
  });
}

// ── TIPO ─────────────────────────────────────────────────────
function setTipo(tipo) {
  document.getElementById('campo-tipo').value = tipo;

  document.getElementById('tipo-salida')
    ?.classList.toggle('active', tipo === 'SALIDA');

  document.getElementById('tipo-entrada')
    ?.classList.toggle('active', tipo === 'ENTRADA');
}

// ── CATÁLOGO ────────────────────────────────────────────────
async function _agregarCuenta() {
  cuentas = await agregarCuenta(empresaId, cuentas);
  poblarSelectCuentas(cuentas);
  renderCatalogo(cuentas);
}

async function _eliminarCuenta(cuenta) {
  cuentas = await eliminarCuenta(empresaId, cuentas, cuenta);
  poblarSelectCuentas(cuentas);
  renderCatalogo(cuentas);
}

async function _agregarSub(cuenta) {
  cuentas = await agregarSubcuenta(empresaId, cuentas, cuenta);
  poblarSelectCuentas(cuentas);
  renderCatalogo(cuentas);
}

async function _eliminarSub(cuenta, sub) {
  cuentas = await eliminarSubcuenta(empresaId, cuentas, cuenta, sub);
  poblarSelectCuentas(cuentas);
  renderCatalogo(cuentas);
}

// ── API GLOBAL ───────────────────────────────────────────────
window.APP = {

  login: () =>
    import('./auth.js').then(a => a.loginHandler()),

  logout: () => logoutHandler(),

  crearEmpresa: () => crearEmpresa(),

  guardar: () => guardarMovimiento(empresaId),

  eliminar: (id) => eliminarMovimiento(empresaId, id),

  limpiar: () => limpiarFormulario(),

  // 🔥 CAMBIO IMPORTANTE
  mostrar: async (id) => {
    await cargarVista(id, 'app-content'); // carga HTML dinámico
    showView(id); // mantiene tu lógica actual
    registrarEventos(); // vuelve a bindear eventos
  },

  agregarCuenta: () => _agregarCuenta(),

  eliminarCuenta: (c) => _eliminarCuenta(c),

  agregarSub: (c) => _agregarSub(c),

  eliminarSub: (c, s) => _eliminarSub(c, s),

  exportar: () => {
    import('./movimientos.js').then(m => {
      const emp = empresas.find(e => e.id === empresaId);
      exportarCSV(m.movimientos, emp?.nombre || 'empresa');
    });
  },

  filtrar: () => {
    import('./movimientos.js').then(m =>
      import('./ui.js').then(ui =>
        ui.renderMovimientos(m.movimientos)
      )
    );
  },

  catalogoVista: async () => {
    await cargarVista('catalogo', 'app-content');
    showView('catalogo');
    renderCatalogo(cuentas);
  }
};