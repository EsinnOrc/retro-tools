import React from "react";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from "firebase/auth";
import { auth } from "../firebaseConfig";

const GoogleLogin: React.FC = () => {
  const googleLogin = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user: User = result.user;
      console.log("User logged in with Google:", user);
    } catch (error) {
      console.error("Error logging in with Google:", error);
    }
  };

  return (
    <div>
      <button onClick={googleLogin}>Login with Google</button>
    </div>
  );
};

export default GoogleLogin;
