"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Users, Search, Link2, Trash2, Edit3, X, Check } from "lucide-react";
import styles from "../admin.module.css";

interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  section: string;
  parentEmail: string;
  totalFee: number;
  paidAmount: number;
  balance: number;
  status: string;
  createdAt: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Student>>({});
  const [syncing, setSyncing] = useState<string | null>(null);

  const fetchStudents = async () => {
    const snapshot = await getDocs(collection(db, "students"));
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Student));
    setStudents(data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student record?")) return;
    try {
      await deleteDoc(doc(db, "students", id));
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingId(student.id);
    setEditData({ grade: student.grade, section: student.section, parentEmail: student.parentEmail });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await updateDoc(doc(db, "students", id), {
        grade: editData.grade || "",
        section: editData.section || "",
        parentEmail: editData.parentEmail || "",
      });
      setEditingId(null);
      setEditData({});
      fetchStudents();
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const handleSyncParent = async (student: Student) => {
    if (!student.parentEmail) {
      alert("No parent email assigned to this student.");
      return;
    }
    setSyncing(student.id);
    try {
      // Check if parent exists in preRegisteredUsers
      const snapshot = await getDocs(collection(db, "preRegisteredUsers"));
      const parentExists = snapshot.docs.some(d => d.data().email === student.parentEmail && d.data().role === "parent");

      if (!parentExists) {
        // Auto-register the parent
        const { addDoc } = await import("firebase/firestore");
        await addDoc(collection(db, "preRegisteredUsers"), {
          name: `Parent of ${student.name}`,
          email: student.parentEmail,
          role: "parent",
          linkedStudentEmail: student.email,
          createdAt: new Date().toISOString(),
        });
        alert(`Parent (${student.parentEmail}) has been auto-registered and linked!`);
      } else {
        alert(`Parent (${student.parentEmail}) is already registered.`);
      }
    } catch (error) {
      console.error("Error syncing parent:", error);
    } finally {
      setSyncing(null);
    }
  };

  const grades = [...new Set(students.map(s => s.grade).filter(Boolean))];

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === "all" || s.grade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  return (
    <div>
      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={`glass ${styles.statCard}`} style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}>
          <span className={styles.statCount} style={{ color: "#0284c7" }}>{students.length}</span>
          <span className={styles.statLabel} style={{ color: '#0284c7', opacity: 0.7 }}>Total Students</span>
        </div>
        <div className={`glass ${styles.statCard}`} style={{ background: '#f0fdf4', borderColor: '#dcfce7' }}>
          <span className={styles.statCount} style={{ color: "#16a34a" }}>{grades.length}</span>
          <span className={styles.statLabel} style={{ color: '#16a34a', opacity: 0.7 }}>Grades</span>
        </div>
        <div className={`glass ${styles.statCard}`} style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
          <span className={styles.statCount} style={{ color: "#b45309" }}>{students.filter(s => s.parentEmail).length}</span>
          <span className={styles.statLabel} style={{ color: '#b45309', opacity: 0.7 }}>With Parent Link</span>
        </div>
        <div className={`glass ${styles.statCard}`} style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
          <span className={styles.statCount} style={{ color: "#dc2626" }}>{students.filter(s => !s.parentEmail).length}</span>
          <span className={styles.statLabel} style={{ color: '#dc2626', opacity: 0.7 }}>No Parent Link</span>
        </div>
      </div>

      {/* Table */}
      <div className="glass" style={{ padding: '2rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} className="text-gradient" /> All Students
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className={styles.searchBox}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            {grades.length > 0 && (
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className={styles.input}
                style={{ width: 'auto', padding: '0.5rem 1rem' }}
              >
                <option value="all">All Grades</option>
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            )}
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Grade</th>
                <th>Section</th>
                <th>Parent Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td style={{ color: '#64748b' }}>{s.email}</td>
                    <td>
                      {editingId === s.id ? (
                        <input className={styles.inlineInput} value={editData.grade || ""} onChange={e => setEditData({ ...editData, grade: e.target.value })} />
                      ) : (
                        <span className={styles.gradeBadge}>{s.grade || "—"}</span>
                      )}
                    </td>
                    <td>
                      {editingId === s.id ? (
                        <input className={styles.inlineInput} value={editData.section || ""} onChange={e => setEditData({ ...editData, section: e.target.value })} />
                      ) : (
                        s.section || "—"
                      )}
                    </td>
                    <td>
                      {editingId === s.id ? (
                        <input className={styles.inlineInput} value={editData.parentEmail || ""} onChange={e => setEditData({ ...editData, parentEmail: e.target.value })} />
                      ) : (
                        <span style={{ color: s.parentEmail ? '#1e293b' : '#94a3b8' }}>
                          {s.parentEmail || "Not linked"}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        {editingId === s.id ? (
                          <>
                            <button className={styles.actionBtn} title="Save" onClick={() => handleSaveEdit(s.id)}>
                              <Check size={16} style={{ color: '#34d399' }} />
                            </button>
                            <button className={styles.actionBtn} title="Cancel" onClick={() => setEditingId(null)}>
                              <X size={16} style={{ color: '#ef4444' }} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button className={styles.actionBtn} title="Edit" onClick={() => handleEdit(s)}>
                              <Edit3 size={16} />
                            </button>
                            <button className={styles.actionBtn} title="Sync Parent" onClick={() => handleSyncParent(s)} disabled={syncing === s.id}>
                              <Link2 size={16} style={{ color: syncing === s.id ? '#fbbf24' : undefined }} />
                            </button>
                            <button className={styles.actionBtn} title="Delete" onClick={() => handleDelete(s.id)}>
                              <Trash2 size={16} style={{ color: '#ef4444' }} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
