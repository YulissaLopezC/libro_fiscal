import { state } from '../core/state.js';
import { crearEmpresa } from '../services/empresas.js';
import { navigate } from '../core/router.js';

export function renderSidebar() {
  renderEmpresasList();
}

export function renderEmpresasList() {
  const ul = document.getElementById('empresas-list');
  if (!ul) return;
  ul.innerHTML = '';
  state.empresas.forEach(emp => {
    const btn = document.createElement('button');
    btn.className    = 'empresa-btn';
    btn.dataset.id   = emp.id;
    btn.innerHTML    = `
      <span class="empresa-dot" style="background:${emp.color}"></span>
      ${emp.nombre}
    `;
    btn.classList.toggle('active', emp.id === state.empresaId);
    btn.onclick = () => window.APP.seleccionarEmpresa(emp.id);
    ul.appendChild(btn);
  });

  // Botón nueva empresa
  const addBtn = document.createElement('button');
  addBtn.className = 'add-empresa-btn';
  addBtn.textContent = '+ Nueva empresa';
  addBtn.onclick = async () => {
    await crearEmpresa();
    renderEmpresasList();
    const ultima = state.empresas[state.empresas.length - 1];
    if (ultima) window.APP.seleccionarEmpresa(ultima.id);
  };
  ul.appendChild(addBtn);
}

export function actualizarNombreEmpresa() {
  const emp = state.getEmpresa();
  document.querySelectorAll('.empresa-nombre')
    .forEach(el => el.textContent = emp?.nombre || '—');
}