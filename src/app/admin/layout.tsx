"use client";

import Link from "next/link";
import { Shield, Users, UserPlus, CreditCard, Search } from "lucide-react";
import styles from "./admin.module.css";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src="/logo.png" alt="Logo" width={36} height={36} style={{ borderRadius: 8 }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>Admin Portal</h2>
          </div>
          <nav className={styles.navLinks}>
            <Link href="/admin" className={pathname === "/admin" ? styles.activeLink : styles.link}>
              <UserPlus size={16} /> Manage Users
            </Link>
            <Link href="/admin/students" className={pathname === "/admin/students" ? styles.activeLink : styles.link}>
              <Users size={16} /> Students
            </Link>
            <Link href="/admin/fees" className={pathname === "/admin/fees" ? styles.activeLink : styles.link}>
              <CreditCard size={16} /> Fees
            </Link>
          </nav>
        </div>
      </header>

      <main className={`container ${styles.main}`}>
        {children}
      </main>
    </div>
  );
}
