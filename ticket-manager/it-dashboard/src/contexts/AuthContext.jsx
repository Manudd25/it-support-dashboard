import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase"; // your firebase config file

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Updated: Check both 'users' and 'admins' collections
  async function fetchUserRole(uid) {
    const userDocRef = doc(db, "users", uid);
    const adminDocRef = doc(db, "admins", uid);

    const userSnap = await getDoc(userDocRef);
    const adminSnap = await getDoc(adminDocRef);

    if (adminSnap.exists()) {
      return "admin";
    } else if (userSnap.exists()) {
      return userSnap.data().role || "employee";
    } else {
      // Default to user and create user doc
      await setDoc(userDocRef, { role: "employee" });
      return "employee";
    }
  }

  // ✅ useEffect to observe auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        const role = await fetchUserRole(user.uid);
        setUserRole(role);
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [auth]);

  // ✅ Login
  async function login(email, password) {
    setLoading(true);
    await signInWithEmailAndPassword(auth, email, password);
    setLoading(false);
  }

  // ✅ Register (new users are added to "users" with role "user")
  async function register(email, password) {
    setLoading(true);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    await setDoc(doc(db, "users", uid), { role: "employee" });
    setLoading(false);
  }

  // ✅ Logout
  function logout() {
    return signOut(auth);
  }

  const value = {
    currentUser,
    userRole,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
