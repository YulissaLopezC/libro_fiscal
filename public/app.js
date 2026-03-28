import { iniciarAuthObserver, logoutHandler,
  loginHandler } from './services/auth.js';
import { cargarEmpresas, migrarCuentasLegacy } from './services/empresas.js';
import { suscribirMovimientos } from './services/movimientos.js';
import { cargarVistas } from './core/viewsloader.js';
import { navigate } from './core/router.js';
import { state } from './core/state.js';
import { renderSidebar, renderEmpresasList,
  actualizarNombreEmpresa } from './components/sidebar.js';
import { renderDashboard } from './components/dashboard.js';
import { renderMovimientos } from './components/movimientos.js';
import { renderResumen } from './components/resumen.js';
import { iniciarDigitacion, poblarSelectCuentas,
  poblarSelectMetodos } from './components/digitacion.js';
import { exportarCSV } from './helpers.js';
import { cargarProveedores } from './services/proveedores.js';
import { renderCatalogo, iniciarCatalogo } from './components/catalogo.js';
// ── ARRANQUE ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  iniciarAuthObserver();
});

export async function iniciarApp() {
  await cargarVistas();
  await cargarEmpresas();
  renderSidebar();
  iniciarDigitacion();
  iniciarCatalogo();
  registrarEventosGlobales();

  if (state.empresas.length > 0) {
    await seleccionarEmpresa(state.empresas[0].id);
  }
}

// ── SELECCIONAR EMPRESA ───────────────────────────────────────
export async function seleccionarEmpresa(id) {
  const emp = state.empresas.find(e => e.id === id);
  if (!emp) return;

  state.setEmpresa(id, emp);
  await migrarCuentasLegacy(); 
  // UI
  document.querySelectorAll('.empresa-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.id === id));
  actualizarNombreEmpresa();
  poblarSelectCuentas();
  poblarSelectMetodos();
  await cargarProveedores();
  // Datos en tiempo real
  suscribirMovimientos(() => {
    renderDashboard();
    renderMovimientos();
    renderResumen();
  });
}

// ── EVENTOS GLOBALES ──────────────────────────────────────────
function registrarEventosGlobales() {
  // Enter en login
  document.getElementById('login-pass')
    ?.addEventListener('keydown', e => {
      if (e.key === 'Enter') loginHandler();
    });

  // Exportar
  document.getElementById('btn-exportar')
    ?.addEventListener('click', () => {
      const emp = state.getEmpresa();
      exportarCSV(state.movimientos, emp?.nombre || 'empresa');
    });
}



// ── API GLOBAL (para onclick en HTML) ────────────────────────
window.APP = {
  login:            () => loginHandler(),
  logout:           () => logoutHandler(),
  seleccionarEmpresa,
  navegar:          (id) => navigate(id),
};