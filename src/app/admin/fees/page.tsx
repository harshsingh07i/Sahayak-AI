"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";
import { CreditCard, Search, IndianRupee, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, X, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
}

interface Transaction {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  date: string;
  note: string;
}

export default function FeesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFeeSetModal, setShowFeeSetModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchStudents = async () => {
    const snapshot = await getDocs(collection(db, "students"));
    const data = snapshot.docs.map(d => {
      const raw = d.data();
      return {
        id: d.id,
        name: raw.name || "",
        email: raw.email || "",
        grade: raw.grade || "",
        section: raw.section || "",
        parentEmail: raw.parentEmail || "",
        totalFee: raw.totalFee || 0,
        paidAmount: raw.paidAmount || 0,
        balance: (raw.totalFee || 0) - (raw.paidAmount || 0),
        status: (raw.totalFee || 0) <= (raw.paidAmount || 0) && (raw.totalFee || 0) > 0 ? "paid" : (raw.paidAmount || 0) > 0 ? "partial" : "pending",
      } as Student;
    });
    setStudents(data);
  };

  const fetchTransactions = async () => {
    const snapshot = await getDocs(collection(db, "feeTransactions"));
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(data);
  };

  useEffect(() => {
    fetchStudents();
    fetchTransactions();
  }, []);

  const handleSetFee = async () => {
    if (!selectedStudent || !feeAmount) return;
    setProcessing(true);
    try {
      const totalFee = parseFloat(feeAmount);
      await updateDoc(doc(db, "students", selectedStudent.id), {
        totalFee,
        balance: totalFee - selectedStudent.paidAmount,
      });
      setShowFeeSetModal(false);
      setFeeAmount("");
      setSelectedStudent(null);
      fetchStudents();
    } catch (error) {
      console.error("Error setting fee:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedStudent || !paymentAmount) return;
    setProcessing(true);
    try {
      const amount = parseFloat(paymentAmount);
      const newPaid = selectedStudent.paidAmount + amount;
      const newBalance = selectedStudent.totalFee - newPaid;

      await updateDoc(doc(db, "students", selectedStudent.id), {
        paidAmount: newPaid,
        balance: newBalance,
        status: newBalance <= 0 && selectedStudent.totalFee > 0 ? "paid" : "partial",
      });

      await addDoc(collection(db, "feeTransactions"), {
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        amount,
        date: new Date().toISOString(),
        note: paymentNote || "Payment recorded",
      });

      setShowPaymentModal(false);
      setPaymentAmount("");
      setPaymentNote("");
      setSelectedStudent(null);
      fetchStudents();
      fetchTransactions();
    } catch (error) {
      console.error("Error recording payment:", error);
    } finally {
      setProcessing(false);
    }
  };

  const totalFees = students.reduce((sum, s) => sum + s.totalFee, 0);
  const totalCollected = students.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalBalance = students.reduce((sum, s) => sum + s.balance, 0);
  const paidCount = students.filter(s => s.status === "paid").length;
  const pendingCount = students.filter(s => s.status === "pending").length;

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      {/* Stats */}
      <motion.div className={styles.statsRow} variants={itemVariants}>
        <div className={`glass ${styles.statCard}`} style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
          <span className={styles.statCount} style={{ color: "#1e293b" }}>
            <IndianRupee size={22} />{totalFees.toLocaleString()}
          </span>
          <span className={styles.statLabel}>Total Dues</span>
        </div>
        <div className={`glass ${styles.statCard}`} style={{ background: '#f0fdf4', borderColor: '#dcfce7' }}>
          <span className={styles.statCount} style={{ color: "#16a34a" }}>
            <TrendingUp size={22} />{totalCollected.toLocaleString()}
          </span>
          <span className={styles.statLabel}>Collected</span>
        </div>
        <div className={`glass ${styles.statCard}`} style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
          <span className={styles.statCount} style={{ color: "#dc2626" }}>
            <TrendingDown size={22} />{totalBalance.toLocaleString()}
          </span>
          <span className={styles.statLabel}>Outstanding</span>
        </div>
        <div className={`glass ${styles.statCard}`} style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
          <span className={styles.statCount} style={{ color: "#059669" }}>{paidCount}</span>
          <span className={styles.statLabel}>Fully Paid</span>
        </div>
      </motion.div>

      {/* Fee Table */}
      <motion.div className="glass" style={{ padding: '2rem', marginTop: '2rem' }} variants={itemVariants}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem', fontWeight: 800 }}>
            <CreditCard size={24} className="text-gradient" /> Fee Management
          </h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className={styles.searchBox}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
                style={{ width: '200px' }}
              />
            </div>
            <div className={styles.filterTabs}>
              <Filter size={14} style={{ marginLeft: '0.5rem', opacity: 0.5 }} />
              {["all", "paid", "partial", "pending"].map(s => (
                <button
                  key={s}
                  className={`${styles.filterTab} ${filterStatus === s ? styles.filterTabActive : ""}`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student Details</th>
                <th>Grade</th>
                <th>Total Fee</th>
                <th>Paid Amount</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredStudents.length === 0 ? (
                  <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: '4rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <Search size={40} style={{ opacity: 0.2 }} />
                        No students found matching your criteria.
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  filteredStudents.map((s) => (
                    <motion.tr 
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      layout
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className={styles.avatar} style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
                            {s.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: '#1e293b' }}>{s.name}</span>
                            <br />
                            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{s.email}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className={styles.gradeBadge}>{s.grade || "—"}</span></td>
                      <td style={{ fontWeight: 700 }}>₹{s.totalFee.toLocaleString()}</td>
                      <td style={{ color: '#10b981', fontWeight: 600 }}>₹{s.paidAmount.toLocaleString()}</td>
                      <td style={{ color: s.balance > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>₹{s.balance.toLocaleString()}</td>
                      <td>
                        <span className={styles.statusBadge} data-status={s.status}>
                          {s.status === "paid" && <CheckCircle2 size={14} />}
                          {s.status === "partial" && <AlertCircle size={14} />}
                          {s.status === "pending" && <AlertCircle size={14} />}
                          {s.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button
                            className={styles.actionBtnPrimary}
                            onClick={() => { setSelectedStudent(s); setFeeAmount(String(s.totalFee || "")); setShowFeeSetModal(true); }}
                          >
                            Set Fee
                          </button>
                          <button
                            className={styles.actionBtnSuccess}
                            onClick={() => { setSelectedStudent(s); setShowPaymentModal(true); }}
                            disabled={s.totalFee <= 0}
                          >
                            + Pay
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <AnimatePresence>
        {transactions.length > 0 && (
          <motion.div 
            className="glass" 
            style={{ padding: '2rem', marginTop: '2rem' }}
            variants={itemVariants}
          >
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800 }}>
              <IndianRupee size={22} className="text-gradient" /> Recent Transactions
            </h3>
            <div className={styles.transactionList}>
              {transactions.slice(0, 8).map((t, idx) => (
                <motion.div 
                  key={t.id} 
                  className={styles.transactionItem}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#ecfdf5', color: '#059669', padding: '0.5rem', borderRadius: '8px' }}>
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, color: '#1e293b' }}>{t.studentName}</span>
                      <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                        {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>{t.note}</span>
                    <span style={{ color: '#10b981', fontWeight: 800, fontSize: '1.1rem' }}>+₹{t.amount.toLocaleString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showPaymentModal && selectedStudent && (
          <motion.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div 
              className={`glass ${styles.modal}`} 
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <div className={styles.modalHeader}>
                <h3 style={{ fontWeight: 800 }}>Record Payment</h3>
                <button onClick={() => setShowPaymentModal(false)} className={styles.modalClose}><X size={20} /></button>
              </div>
              <div style={{ padding: '1rem 0' }}>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                  Recording payment for <strong style={{ color: '#1e293b' }}>{selectedStudent.name}</strong>
                </p>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Total Fee:</span>
                    <span style={{ fontWeight: 600 }}>₹{selectedStudent.totalFee.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Already Paid:</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>₹{selectedStudent.paidAmount.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px dashed #cbd5e1' }}>
                    <span style={{ fontWeight: 700 }}>Due Balance:</span>
                    <span style={{ color: '#ef4444', fontWeight: 800 }}>₹{selectedStudent.balance.toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label className={styles.label}>Payment Amount (₹)</label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className={styles.input}
                      placeholder="Enter amount"
                      min="1"
                      max={selectedStudent.balance}
                    />
                  </div>
                  <div>
                    <label className={styles.label}>Note (optional)</label>
                    <input
                      type="text"
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      className={styles.input}
                      placeholder="e.g. Cash, UPI, Installment"
                    />
                  </div>
                  <button 
                    className="btn-primary" 
                    onClick={handleRecordPayment} 
                    disabled={processing || !paymentAmount} 
                    style={{ marginTop: '0.5rem', height: '3.5rem', fontSize: '1rem' }}
                  >
                    {processing ? "Processing..." : `Record ₹${paymentAmount || "0"} Payment`}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showFeeSetModal && selectedStudent && (
          <motion.div 
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFeeSetModal(false)}
          >
            <motion.div 
              className={`glass ${styles.modal}`} 
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <div className={styles.modalHeader}>
                <h3 style={{ fontWeight: 800 }}>Set Total Fee</h3>
                <button onClick={() => setShowFeeSetModal(false)} className={styles.modalClose}><X size={20} /></button>
              </div>
              <div style={{ padding: '1rem 0' }}>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                  Updating total fee for <strong style={{ color: '#1e293b' }}>{selectedStudent.name}</strong>
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label className={styles.label}>Total Fee Amount (₹)</label>
                    <input
                      type="number"
                      value={feeAmount}
                      onChange={(e) => setFeeAmount(e.target.value)}
                      className={styles.input}
                      placeholder="e.g. 50000"
                      min="0"
                    />
                  </div>
                  <button 
                    className="btn-primary" 
                    onClick={handleSetFee} 
                    disabled={processing || !feeAmount} 
                    style={{ marginTop: '1.5rem', height: '3.5rem', fontSize: '1rem' }}
                  >
                    {processing ? "Saving..." : "Update Total Fee"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

