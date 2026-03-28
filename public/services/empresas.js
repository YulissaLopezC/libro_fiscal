import { db } from '../firebase.js';
import {
  collection, doc, setDoc, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { state } from '../core/state.js';
import { toast } from '../helpers.js';

export async function cargarEmpresas() {
  const snap = await getDocs(collection(db, 'empresas'));
  state.empresas = [];
  snap.forEach(d => state.empresas.push({ id: d.id, ...d.data() }));

  if (state.empresas.length === 0) {
    await crearEmpresaDefault();
  }
}

async function crearEmpresaDefault() {
  const ref     = doc(collection(db, 'empresas'));
  const empresa = {
    nombre:  'Mi Empresa',
    color:   '#2d7a4f',
    cuentas: {
      'GASTOS': {
        'BEBIDAS':   ['LICORES', 'CERVEZAS', 'GASEOSAS'],
        'ALIMENTOS': ['CARNES', 'VERDURAS', 'VARIOS'],
        'OTROS':     ['HIELO', 'CIGARRILLOS', 'ASEO'],
      },
      'INGRESOS': {
        'VENTAS':         ['LICORES', 'ALIMENTOS'],
        'OTROS INGRESOS': ['VARIOS'],
      },
      'NOMINA': {
        'SALARIOS':    ['FIJO', 'VARIABLE'],
        'PRESTACIONES':['CESANTIAS', 'VACACIONES'],
      },
    },
    metodos: ['CAJA', 'BANCOLOMBIA', 'NEQUI', 'DAVIPLATA', 'TRANSFERENCIA']
  };
  await setDoc(ref, empresa);
  state.empresas.push({ id: ref.id, ...empresa });
}

export async function crearEmpresa() {
  const nombre = prompt('Nombre de la nueva empresa:');
  if (!nombre) return;
  const colores = ['#2d7a4f', '#1a5fa8', '#a8601a'];
  const ref     = doc(collection(db, 'empresas'));
  const empresa = {
    nombre:  nombre.trim(),
    color:   colores[state.empresas.length % 3],
    cuentas: { 'GASTOS': ['OTROS'], 'INGRESOS': ['VENTAS'] },
    metodos: ['CAJA', 'BANCOLOMBIA', 'NEQUI']
  };
  await setDoc(ref, empresa);
  state.empresas.push({ id: ref.id, ...empresa });
  toast('Empresa creada ✓');
}

export async function guardarCuentas() {
  await setDoc(
    doc(db, 'empresas', state.empresaId),
    { cuentas: state.cuentas },
    { merge: true }
  );
}

export async function agregarCuenta() {
  const nombre = prompt('Nombre de la cuenta (ej: GASTOS):');
  if (!nombre) return;
  const key = nombre.trim().toUpperCase();
  state.cuentas[key] = state.cuentas[key] || [];
  await guardarCuentas();
  toast('Cuenta creada ✓');
}

export async function eliminarCuenta(cuenta) {
  if (!confirm(`¿Eliminar la cuenta ${cuenta}?`)) return;
  delete state.cuentas[cuenta];
  await guardarCuentas();
}

export async function agregarSubcuenta(cuenta) {
  const nombre = prompt(`Nueva subcuenta para ${cuenta}:`);
  if (!nombre) return;
  state.cuentas[cuenta].push(nombre.trim().toUpperCase());
  await guardarCuentas();
  toast('Subcuenta agregada ✓');
}

export async function eliminarSubcuenta(cuenta, sub) {
  state.cuentas[cuenta] = state.cuentas[cuenta].filter(s => s !== sub);
  await guardarCuentas();
}

export async function agregarAuxiliar(cuenta, subcuenta) {
  const nombre = prompt(`Nueva auxiliar para ${cuenta} › ${subcuenta}:`);
  if (!nombre) return;
  if (!state.cuentas[cuenta][subcuenta]) {
    state.cuentas[cuenta][subcuenta] = [];
  }
  state.cuentas[cuenta][subcuenta].push(nombre.trim().toUpperCase());
  await guardarCuentas();
  toast('Auxiliar agregada ✓');
}

export async function eliminarAuxiliar(cuenta, subcuenta, aux) {
  state.cuentas[cuenta][subcuenta] =
    state.cuentas[cuenta][subcuenta].filter(a => a !== aux);
  await guardarCuentas();
}

export async function migrarCuentasLegacy() {
  let cambios = false;
  Object.keys(state.cuentas).forEach(cuenta => {
    const subcuentas = state.cuentas[cuenta];
    if (Array.isArray(subcuentas)) {
      // Formato viejo: ['BEBIDAS', 'OTROS'] → nuevo: {BEBIDAS:[], OTROS:[]}
      const nuevo = {};
      subcuentas.forEach(s => { nuevo[s] = []; });
      state.cuentas[cuenta] = nuevo;
      cambios = true;
    } else {
      // Ya es objeto, revisar si sus valores son arrays (correcto)
      Object.keys(subcuentas).forEach(sub => {
        if (!Array.isArray(subcuentas[sub])) {
          subcuentas[sub] = [];
          cambios = true;
        }
      });
    }
  });
  if (cambios) await guardarCuentas();
}