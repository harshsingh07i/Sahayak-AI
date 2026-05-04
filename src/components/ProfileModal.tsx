"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Save, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import styles from "./ProfileModal.module.css";

interface ProfileModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ user, isOpen, onClose }: ProfileModalProps) {
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name === user.name) return;

    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name: name.trim(),
        updatedAt: new Date(),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Force a page refresh or handle state update in parent
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay}>
          <motion.div 
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <div className={styles.header}>
              <h3>Edit Profile</h3>
              <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
            </div>

            <form onSubmit={handleUpdate} className={styles.form}>
              <div className={styles.inputGroup}>
                <label><User size={16} /> Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Enter your name"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.infoGroup}>
                <label>Email Address</label>
                <p>{user.email}</p>
                <span>Email cannot be changed</span>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={loading || name === user.name}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                {loading ? <><Loader2 className={styles.spin} /> Saving...</> : 
                 success ? "Profile Updated!" : 
                 <><Save size={18} /> Save Changes</>}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
