import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

export const TIERS = {
  free: { label: "Free", limit: 3, price: "$0" },
  pro: { label: "Pro", limit: 30, price: "$4.99/mo" },
  expert: { label: "Expert", limit: Infinity, price: "$9.99/mo" },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const now = new Date();
      const newData = { tier: "free", diagnosesUsed: 0, resetMonth: now.getMonth(), resetYear: now.getFullYear() };
      await setDoc(ref, newData);
      setUserData(newData);
    } else {
      const data = snap.data();
      const now = new Date();
      if (data.resetMonth !== now.getMonth() || data.resetYear !== now.getFullYear()) {
        const reset = { ...data, diagnosesUsed: 0, resetMonth: now.getMonth(), resetYear: now.getFullYear() };
        await setDoc(ref, reset);
        setUserData(reset);
      } else {
        setUserData(data);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) await fetchUserData(u.uid);
      else setUserData(null);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const refreshUserData = () => user && fetchUserData(user.uid);

  return (
    <AuthContext.Provider value={{ user, userData, loading, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
