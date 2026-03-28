import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDL0yLfwYChFEpxrU6JME2O2lumZSCPXL0",
  authDomain: "libro-fiscal-121c9.firebaseapp.com",
  projectId: "libro-fiscal-121c9",
  storageBucket: "libro-fiscal-121c9.firebasestorage.app",
  messagingSenderId: "39139916971",
  appId: "1:39139916971:web:6bf23ae349a5d5fe87cbee"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);