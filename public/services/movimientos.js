import { db } from '../firebase.js';
import {
  collection, addDoc, deleteDoc, doc,
  query, orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { state } from '../core/state.js';
import { toast, parsearValor, fechaHoy } from '../helpers.js';

export function suscribirMovimientos(onUpdate) {
  if (state.unsubMovimientos) state.unsubMovimientos();

  const q = query(
    collection(db, 'empresas', state.empresaId, 'movimientos'),
    orderBy('fecha', 'desc')
  );

  state.unsubMovimientos = onSnapshot(q, snap => {
    state.movimientos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onUpdate(state.movimientos);
  });
}

export async function guardarMovimiento() {
  const fecha  = document.getElementById('campo-fecha').value;
  const tipo   = document.getElementById('campo-tipo').value;
  const cuenta = document.getElementById('campo-cuenta').value;
  const sub    = document.getElementById('campo-subcuenta').value;
  const aux = document.getElementById('campo-auxiliar-sel')?.value || '';
  const prov   = document.getElementById('campo-proveedor').value.trim().toUpperCase();
  const recibo = document.getElementById('campo-recibo').value.trim().toUpperCase();
  const valor  = parsearValor(document.getElementById('campo-valor').value);
  const metodo = document.getElementById('campo-metodo').value;
  const fact   = document.getElementById('campo-facturado').value.trim();

  if (!fecha || !cuenta || !valor) {
    toast('⚠ Completa fecha, cuenta y valor', true);
    return false;
  }

  const btn = document.getElementById('btn-guardar');
  btn.textContent = 'Guardando...';
  btn.disabled    = true;

  try {
    await addDoc(
      collection(db, 'empresas', state.empresaId, 'movimientos'),
      {
        fecha, tipo, cuenta,
        subcuenta:  sub,
        auxiliar:   aux,
        proveedor:  prov,
        recibo,
        valor,
        metodo,
        facturadoA: fact,
        creadoEn:   serverTimestamp()
      }
    );
    toast('Movimiento guardado ✓');
    return true;
  } catch (e) {
    toast('Error al guardar: ' + e.message, true);
    return false;
  } finally {
    btn.textContent = 'Guardar movimiento';
    btn.disabled    = false;
  }
}

export async function eliminarMovimiento(id) {
  if (!confirm('¿Eliminar este movimiento?')) return;
  await deleteDoc(doc(db, 'empresas', state.empresaId, 'movimientos', id));
  toast('Movimiento eliminado');
}

export function limpiarFormulario() {
  ['campo-auxiliar','campo-proveedor','campo-recibo',
   'campo-valor','campo-facturado'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('campo-fecha').value = fechaHoy();
  document.getElementById('campo-tipo').value  = 'SALIDA';
  document.getElementById('tipo-salida').classList.add('active');
  document.getElementById('tipo-entrada').classList.remove('active');
}