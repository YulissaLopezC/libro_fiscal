import { state } from './state.js';
import { renderCatalogo } from '../components/catalogo.js';

const rutas = ['dashboard', 'digitacion', 'movimientos', 'resumen', 'catalogo'];

export function navigate(id) {
  if (!rutas.includes(id)) return;

  // Ocultar todas las vistas
  document.querySelectorAll('.view')
    .forEach(v => v.classList.remove('active'));

  // Activar vista seleccionada
  const view = document.getElementById('view-' + id);
  if (view) view.classList.add('active');

  // Marcar nav activo
  document.querySelectorAll('.nav-item')
    .forEach(n => n.classList.toggle('active', n.dataset.view === id));

  // Acciones por vista
  if (id === 'catalogo') renderCatalogo(state.cuentas);
}