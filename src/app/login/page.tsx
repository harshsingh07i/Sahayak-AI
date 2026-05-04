"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { GraduationCap, BookOpen, Users, ArrowRight } from "lucide-react";
import styles from "./login.module.css";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [needsRole, setNeedsRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"teacher" | "student" | "parent" | null>(null);

  // If user is already fully authenticated with a role, redirect them
  useEffect(() => {
    if (user && user.role) {
      router.push(`/${user.role}`);
    }
  }, [user, router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Check if user exists in Firestore
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role) {
          router.push(`/${userData.role}`);
        } else {
          setNeedsRole(true);
        }
      } else {
        // Check if they are pre-registered by the Admin
        const q = query(collection(db, "preRegisteredUsers"), where("email", "==", firebaseUser.email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // User was pre-registered, assign the role automatically
          const preRegData = querySnapshot.docs[0].data();
          await setDoc(userDocRef, {
            email: firebaseUser.email,
            name: firebaseUser.displayName || preRegData.name,
            role: preRegData.role,
            createdAt: new Date(),
          });
          router.push(`/${preRegData.role}`);
        } else {
          // Not pre-registered, show role selection
          setNeedsRole(true);
        }
      }
    } catch (error) {
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelection = async () => {
    if (!selectedRole || !auth.currentUser) return;
    setLoading(true);
    try {
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        email: auth.currentUser.email,
        name: auth.currentUser.displayName,
        role: selectedRole,
        createdAt: new Date(),
      }, { merge: true });

      // After role is set, route them
      router.push(`/${selectedRole}`);
    } catch (error) {
      console.error("Error setting role:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className="bg-noise" style={{ position: 'absolute', top:0, left:0, right:0, bottom:0, opacity: 0.15, pointerEvents: 'none', zIndex: 0 }} />
      <motion.div 
        className={styles.loginCard}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ zIndex: 1 }}
      >
        <div className={styles.logo}>
          <img src="/logo.png" alt="Sahayak Logo" width={50} height={50} className={styles.logoImg} />
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Sahayak AI</h1>
        </div>
        
        {!needsRole ? (
          <>
            <p className={styles.subtitle}>Welcome back to your AI teaching partner</p>
            <button 
              className={styles.googleBtn} 
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={24} height={24} />
              {loading ? "Signing in..." : "Sign in with Google"}
            </button>
            <div className={styles.divider}>or continue with email</div>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Email Address" className={styles.input} />
              <input type="password" placeholder="Password" className={styles.input} />
              <button className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
                Sign In
              </button>
            </form>
          </>
        ) : (
          <div className="fade-in">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>Choose Your Role</h2>
            <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>How will you be using Sahayak AI?</p>
            
            <div className={styles.roleGrid}>
              <div 
                className={`${styles.roleCard} ${selectedRole === 'teacher' ? styles.selected : ''}`}
                onClick={() => setSelectedRole('teacher')}
              >
                <Users size={32} className="text-gradient" />
                <h3>Teacher</h3>
                <p>Manage classes & tools</p>
              </div>
              <div 
                className={`${styles.roleCard} ${selectedRole === 'student' ? styles.selected : ''}`}
                onClick={() => setSelectedRole('student')}
              >
                <GraduationCap size={32} className="text-gradient" />
                <h3>Student</h3>
                <p>Learn & complete tasks</p>
              </div>
              <div 
                className={`${styles.roleCard} ${selectedRole === 'parent' ? styles.selected : ''}`}
                onClick={() => setSelectedRole('parent')}
              >
                <BookOpen size={32} className="text-gradient" />
                <h3>Parent</h3>
                <p>Monitor progress</p>
              </div>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '2rem' }}
              disabled={!selectedRole || loading}
              onClick={handleRoleSelection}
            >
              {loading ? "Setting up..." : "Complete Setup"} <ArrowRight size={18} />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
