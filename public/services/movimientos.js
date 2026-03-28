import { db } from './firebase.js';
import {
  collection, addDoc, deleteDoc, doc,
  query, orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { toast, parsearValor, fechaHoy } from './helpers.js';
import { renderMovimientos, renderDashboard, renderResumen } from './ui.js';

export let movimientos = [];
export let unsubMovimientos = null;

// ── SUSCRIBIR EN TIEMPO REAL ──────────────────────────────────
export function suscribirMovimientos(empresaId) {
  if (unsubMovimientos) unsubMovimientos();

  const q = query(
    collection(db, 'empresas', empresaId, 'movimientos'),
    orderBy('fecha', 'desc')
  );

  unsubMovimientos = onSnapshot(q, snap => {
    movimientos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderDashboard(movimientos);
    renderMovimientos(movimientos);
    renderResumen(movimientos);
  });
}

// ── GUARDAR MOVIMIENTO ────────────────────────────────────────
export async function guardarMovimiento(empresaId) {
  const fecha    = document.getElementById('campo-fecha').value;
  const tipo     = document.getElementById('campo-tipo').value;
  const cuenta   = document.getElementById('campo-cuenta').value;
  const sub      = document.getElementById('campo-subcuenta').value;
  const aux      = document.getElementById('campo-auxiliar').value.trim().toUpperCase();
  const prov     = document.getElementById('campo-proveedor').value.trim().toUpperCase();
  const recibo   = document.getElementById('campo-recibo').value.trim().toUpperCase();
  const valor    = parsearValor(document.getElementById('campo-valor').value);
  const metodo   = document.getElementById('campo-metodo').value;
  const factura  = document.getElementById('campo-facturado').value.trim();

  if (!fecha || !cuenta || !valor) {
    toast('⚠ Completa fecha, cuenta y valor', true);
    return;
  }

  const btn = document.getElementById('btn-guardar');
  btn.textContent = 'Guardando...';
  btn.disabled = true;

  try {
    await addDoc(collection(db, 'empresas', empresaId, 'movimientos'), {
      fecha, tipo, cuenta,
      subcuenta:  sub,
      auxiliar:   aux,
      proveedor:  prov,
      recibo,
      valor,
      metodo,
      facturadoA: factura,
      creadoEn:   serverTimestamp()
    });
    limpiarFormulario();
    toast('Movimiento guardado ✓');
  } catch (e) {
    toast('Error al guardar: ' + e.message, true);
  }

  btn.textContent = 'Guardar movimiento';
  btn.disabled = false;
}

// ── ELIMINAR MOVIMIENTO ───────────────────────────────────────
export async function eliminarMovimiento(empresaId, id) {
  if (!confirm('¿Eliminar este movimiento?')) return;
  await deleteDoc(doc(db, 'empresas', empresaId, 'movimientos', id));
  toast('Movimiento eliminado');
}

// ── LIMPIAR FORMULARIO ────────────────────────────────────────
export function limpiarFormulario() {
  ['campo-auxiliar', 'campo-proveedor', 'campo-recibo',
   'campo-valor', 'campo-facturado'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('campo-fecha').value = fechaHoy();
  document.getElementById('campo-tipo').value  = 'SALIDA';
  document.getElementById('tipo-salida').classList.add('active');
  document.getElementById('tipo-entrada').classList.remove('active');
}