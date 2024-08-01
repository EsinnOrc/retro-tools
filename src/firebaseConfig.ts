import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAdb6gpW910-Nv8FGNOm5v0eLUYuAPuOgQ",
  authDomain: "retrotool-efa98.firebaseapp.com",
  projectId: "retrotool-efa98",
  storageBucket: "retrotool-efa98.appspot.com",
  messagingSenderId: "542174744827",
  appId: "1:542174744827:web:34323c62e59a797082e05e",
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} else {
  app = getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
}

export { db, auth };
