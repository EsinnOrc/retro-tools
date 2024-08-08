import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { db } from "../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export const googleLogin = async (): Promise<void> => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (user) {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date(),
      });
    }

    console.log("User logged in and data saved:", user);
    return Promise.resolve();
  } catch (error) {
    console.error("Error logging in with Google:", error);
    return Promise.reject(error);
  }
};
