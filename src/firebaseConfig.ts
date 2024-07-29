import { initializeApp, FirebaseApp } from "firebase/app";
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

const app: FirebaseApp = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

export { db, auth };
