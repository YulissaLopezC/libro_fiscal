import { auth } from './firebase.js';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { toast } from './helpers.js';
import { iniciarApp } from './app.js';

// ── LOGIN ─────────────────────────────────────────────────────
export async function loginHandler() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  const btn   = document.getElementById('login-btn');
  const err   = document.getElementById('login-error');

  err.textContent = '';
  btn.textContent = 'Entrando...';
  btn.disabled = true;

  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (e) {
    err.textContent = 'Correo o contraseña incorrectos';
    btn.textContent = 'Entrar';
    btn.disabled = false;
  }
}

// ── LOGOUT ────────────────────────────────────────────────────
export async function logoutHandler() {
  await signOut(auth);
}

// ── OBSERVER ─────────────────────────────────────────────────
export function iniciarAuthObserver() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      document.getElementById('screen-login').style.display = 'none';
      document.getElementById('screen-app').style.display  = 'grid';
      document.getElementById('user-email').textContent = user.email;
      iniciarApp();
    } else {
      document.getElementById('screen-login').style.display = 'flex';
      document.getElementById('screen-app').style.display  = 'none';
    }
  });
}