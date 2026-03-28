import { auth } from '../firebase.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { toast } from '../helpers.js';
import { iniciarApp } from '../app.js';
import { state } from '../core/state.js';

export async function loginHandler() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  const btn   = document.getElementById('login-btn');
  const err   = document.getElementById('login-error');

  err.textContent  = '';
  btn.textContent  = 'Entrando...';
  btn.disabled     = true;

  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (e) {
    err.textContent = 'Correo o contraseña incorrectos';
    btn.textContent = 'Entrar';
    btn.disabled    = false;
  }
}

export async function logoutHandler() {
  // Detener suscripción de movimientos
  if (state.unsubMovimientos) {
    state.unsubMovimientos();
    state.unsubMovimientos = null;
  }

  // Resetear estado
  state.empresaId   = null;
  state.empresas    = [];
  state.movimientos = [];
  state.proveedores = [];

  // Resetear UI del login
  document.getElementById('login-email').value   = '';
  document.getElementById('login-pass').value    = '';
  document.getElementById('login-error').textContent = '';
  document.getElementById('login-btn').textContent   = 'Entrar';
  document.getElementById('login-btn').disabled      = false;

  // Resetear vistas para que no se dupliquen al volver a entrar
  const appViews = document.getElementById('app-views');
  if (appViews) appViews.innerHTML = '';

  await signOut(auth);
}

export function iniciarAuthObserver() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      document.getElementById('screen-login').style.display = 'none';
      document.getElementById('screen-app').style.display  = 'grid';
      document.getElementById('user-email').textContent     = user.email;
      await iniciarApp();
    } else {
      document.getElementById('screen-login').style.display = 'flex';
      document.getElementById('screen-app').style.display  = 'none';
    }
  });
}