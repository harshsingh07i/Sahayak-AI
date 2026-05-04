"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Users, Trash2, PlusCircle, Search } from "lucide-react";
import styles from "./admin.module.css";

export default function AdminPortal() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"teacher" | "student" | "parent" | "admin">("student");
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPreRegisteredUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "preRegisteredUsers"));
    const users = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    setUsersList(users);
  };

  useEffect(() => {
    fetchPreRegisteredUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    
    setIsSubmitting(true);
    try {
      const userData: any = {
        email,
        name,
        role,
        createdAt: new Date().toISOString()
      };

      // Add student-specific fields
      if (role === "student") {
        userData.grade = grade;
        userData.section = section;
        userData.parentEmail = parentEmail;
        userData.totalFee = 0;
        userData.paidAmount = 0;
      }

      await addDoc(collection(db, "preRegisteredUsers"), userData);
      
      // Also create a student record for fee tracking
      if (role === "student") {
        await addDoc(collection(db, "students"), {
          name,
          email,
          grade,
          section,
          parentEmail,
          totalFee: 0,
          paidAmount: 0,
          balance: 0,
          status: "pending",
          createdAt: new Date().toISOString()
        });
      }

      // Reset form
      setEmail("");
      setName("");
      setGrade("");
      setSection("");
      setParentEmail("");
      fetchPreRegisteredUsers();
    } catch (error) {
      console.error("Error adding user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, "preRegisteredUsers", id));
      fetchPreRegisteredUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const filteredUsers = usersList.filter(u => {
    const matchesRole = filterRole === "all" || u.role === filterRole;
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const roleCounts = {
    all: usersList.length,
    student: usersList.filter(u => u.role === "student").length,
    teacher: usersList.filter(u => u.role === "teacher").length,
    parent: usersList.filter(u => u.role === "parent").length,
    admin: usersList.filter(u => u.role === "admin").length,
  };

  return (
    <div className={styles.grid}>
      {/* Stats Row */}
      <div className={styles.statsRow}>
        {[
          { label: "Total Users", count: roleCounts.all, color: "#1e293b", bg: "#f1f5f9", border: "#e2e8f0" },
          { label: "Students", count: roleCounts.student, color: "#0284c7", bg: "#f0f9ff", border: "#bae6fd" },
          { label: "Teachers", count: roleCounts.teacher, color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
          { label: "Parents", count: roleCounts.parent, color: "#16a34a", bg: "#f0fdf4", border: "#dcfce7" },
          { label: "Admins", count: roleCounts.admin, color: "#db2777", bg: "#fdf2f8", border: "#fbcfe8" },
        ].map((stat) => (
          <div key={stat.label} className={`glass ${styles.statCard}`} style={{ background: stat.bg, borderColor: stat.border }}>
            <span className={styles.statCount} style={{ color: stat.color }}>{stat.count}</span>
            <span className={styles.statLabel} style={{ color: stat.color, opacity: 0.7 }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Add User Form */}
      <div className="glass" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={20} className="text-gradient" /> Pre-Register User
        </h3>
        <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Pre-assign a role to an email. When they sign in with Google, they will automatically get this role.
        </p>
        
        <form onSubmit={handleAddUser} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label className={styles.label}>Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input} 
                placeholder="John Doe"
                required
              />
            </div>
            
            <div className={styles.formField}>
              <label className={styles.label}>Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input} 
                placeholder="user@school.com"
                required
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Role</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className={styles.input}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="parent">Parent</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Student-specific fields */}
          {role === "student" && (
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.label}>Grade / Class</label>
                <input 
                  type="text" 
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className={styles.input} 
                  placeholder="e.g. 10th"
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.label}>Section</label>
                <input 
                  type="text" 
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className={styles.input} 
                  placeholder="e.g. A"
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.label}>Parent Email (for sync)</label>
                <input 
                  type="email" 
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className={styles.input} 
                  placeholder="parent@email.com"
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
            {isSubmitting ? "Adding..." : "Add User"}
          </button>
        </form>
      </div>

      {/* List of Users */}
      <div className="glass" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} className="text-gradient" /> Pre-Registered Users
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className={styles.searchBox}>
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.filterTabs}>
              {["all", "student", "teacher", "parent", "admin"].map(r => (
                <button 
                  key={r}
                  className={`${styles.filterTab} ${filterRole === r ? styles.filterTabActive : ""}`}
                  onClick={() => setFilterRole(r)}
                >
                  {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className={styles.userList}>
          {filteredUsers.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No users found.</p>
          ) : (
            filteredUsers.map((u) => (
              <div key={u.id} className={styles.userItem}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>{u.name}</h4>
                  <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {u.email} • <span className={styles.roleBadge} data-role={u.role}>{u.role}</span>
                  </p>
                  {u.grade && (
                    <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      Grade: {u.grade} {u.section && `| Section: ${u.section}`} {u.parentEmail && `| Parent: ${u.parentEmail}`}
                    </p>
                  )}
                </div>
                <button onClick={() => handleDeleteUser(u.id)} className={styles.deleteBtn}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
