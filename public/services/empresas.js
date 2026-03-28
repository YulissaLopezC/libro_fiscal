import { db } from '../firebase.js';
import {
  collection, doc, setDoc, getDocs, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { toast } from '../helpers.js';
import { seleccionarEmpresa } from '../app.js';

export let empresas = [];
export let empresaActual = null;

// ── CARGAR EMPRESAS ───────────────────────────────────────────
export async function cargarEmpresas() {
  const snap = await getDocs(collection(db, 'empresas'));
  empresas = [];
  snap.forEach(d => empresas.push({ id: d.id, ...d.data() }));

  if (empresas.length === 0) {
    await crearEmpresaDefault();
  }

  renderEmpresasList();
  if (empresas.length > 0) seleccionarEmpresa(empresas[0].id);
}

// ── EMPRESA DEFAULT (primera vez) ────────────────────────────
async function crearEmpresaDefault() {
  const ref = doc(collection(db, 'empresas'));
  const empresa = {
    nombre: 'Mi Empresa',
    color: '#2d7a4f',
    cuentas: {
      'GASTOS':   ['BEBIDAS', 'ALIMENTOS', 'SERVICIOS', 'OTROS'],
      'INGRESOS': ['VENTAS', 'OTROS INGRESOS'],
      'NOMINA':   ['SALARIOS', 'PRESTACIONES'],
    },
    metodos: ['CAJA', 'BANCOLOMBIA', 'NEQUI', 'DAVIPLATA', 'TRANSFERENCIA']
  };
  await setDoc(ref, empresa);
  empresas.push({ id: ref.id, ...empresa });
}

// ── CREAR EMPRESA ─────────────────────────────────────────────
export async function crearEmpresa() {
  const nombre = prompt('Nombre de la nueva empresa:');
  if (!nombre) return;
  const colores = ['#2d7a4f', '#1a5fa8', '#a8601a'];
  const ref = doc(collection(db, 'empresas'));
  const empresa = {
    nombre: nombre.trim(),
    color: colores[empresas.length % 3],
    cuentas: { 'GASTOS': ['OTROS'], 'INGRESOS': ['VENTAS'] },
    metodos: ['CAJA', 'BANCOLOMBIA', 'NEQUI']
  };
  await setDoc(ref, empresa);
  empresas.push({ id: ref.id, ...empresa });
  renderEmpresasList();
  seleccionarEmpresa(ref.id);
  toast('Empresa creada ✓');
}

// ── RENDER LISTA SIDEBAR ──────────────────────────────────────
export function renderEmpresasList() {
  const ul = document.getElementById('empresas-list');
  ul.innerHTML = '';
  empresas.forEach(emp => {
    const btn = document.createElement('button');
    btn.className = 'empresa-btn';
    btn.dataset.id = emp.id;
    btn.innerHTML = `
      <span class="empresa-dot" style="background:${emp.color}"></span>
      ${emp.nombre}
    `;
    btn.onclick = () => seleccionarEmpresa(emp.id);
    ul.appendChild(btn);
  });
}

// ── CATÁLOGO DE CUENTAS ───────────────────────────────────────
export async function agregarCuenta(empresaId, cuentas) {
  const nombre = prompt('Nombre de la cuenta (ej: GASTOS):');
  if (!nombre) return cuentas;
  const key = nombre.trim().toUpperCase();
  cuentas[key] = cuentas[key] || [];
  await guardarCuentas(empresaId, cuentas);
  toast('Cuenta creada ✓');
  return cuentas;
}

export async function eliminarCuenta(empresaId, cuentas, cuenta) {
  if (!confirm(`¿Eliminar la cuenta ${cuenta}?`)) return cuentas;
  delete cuentas[cuenta];
  await guardarCuentas(empresaId, cuentas);
  return cuentas;
}

export async function agregarSubcuenta(empresaId, cuentas, cuenta) {
  const nombre = prompt(`Nueva subcuenta para ${cuenta}:`);
  if (!nombre) return cuentas;
  cuentas[cuenta].push(nombre.trim().toUpperCase());
  await guardarCuentas(empresaId, cuentas);
  toast('Subcuenta agregada ✓');
  return cuentas;
}

export async function eliminarSubcuenta(empresaId, cuentas, cuenta, sub) {
  cuentas[cuenta] = cuentas[cuenta].filter(s => s !== sub);
  await guardarCuentas(empresaId, cuentas);
  return cuentas;
}

async function guardarCuentas(empresaId, cuentas) {
  await setDoc(doc(db, 'empresas', empresaId), { cuentas }, { merge: true });
}