"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Users, UserPlus, CreditCard, Menu, X, LogOut, Bot } from "lucide-react";
import styles from "./admin.module.css";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  const navItems = [
    { href: "/admin", label: "Manage Users", icon: UserPlus },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/admin/fees", label: "Fees Management", icon: CreditCard },
  ];

  return (
    <div className={styles.dashboardContainer}>
      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className={styles.drawerBackdrop} 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        className={`${styles.sidebar} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className={styles.sidebarHeader}>
          <img src="/logo.png" alt="Logo" width={40} height={40} className={styles.sidebarLogo} />
          <h2>Sahayak AI</h2>
          <span className={styles.roleBadge}>Admin</span>
        </div>
        
        <nav className={styles.navMenu}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={20} /> {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <header className={styles.topHeader}>
          <button className={styles.menuToggle} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className={styles.headerInfo}>
            <h1 className="text-gradient" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {navItems.find(i => i.href === pathname)?.label || "Admin Portal"}
            </h1>
          </div>
          <div className={styles.adminBadge}>
            <Shield size={14} /> System Administrator
          </div>
        </header>

        <div className={styles.contentArea}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

