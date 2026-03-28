import { db } from '../firebase.js';
import {
  collection, doc, setDoc, getDocs, query, where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { state } from '../core/state.js';
import { toast } from '../helpers.js';

// ── CARGAR PROVEEDORES ────────────────────────────────────────
export async function cargarProveedores() {
  const snap = await getDocs(
    collection(db, 'empresas', state.empresaId, 'proveedores')
  );
  state.proveedores = [];
  snap.forEach(d => state.proveedores.push({ id: d.id, ...d.data() }));
}

// ── GUARDAR PROVEEDOR ─────────────────────────────────────────
export async function guardarProveedor(proveedor) {
  const ref = doc(
    collection(db, 'empresas', state.empresaId, 'proveedores')
  );
  await setDoc(ref, proveedor);
  state.proveedores.push({ id: ref.id, ...proveedor });
  toast('Proveedor guardado ✓');
  return { id: ref.id, ...proveedor };
}

// ── BUSCAR PROVEEDOR ──────────────────────────────────────────
export function buscarProveedores(termino) {
  if (!termino || termino.length < 2) return [];
  const t = termino.toLowerCase();
  return (state.proveedores || []).filter(p =>
    p.nombre?.toLowerCase().includes(t) ||
    p.nit?.toLowerCase().includes(t)
  );
}