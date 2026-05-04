"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";
import { CreditCard, Search, IndianRupee, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, X } from "lucide-react";
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

  return (
    <div>
      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={`glass ${styles.statCard}`} style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
          <span className={styles.statCount} style={{ color: "#1e293b" }}>
            <IndianRupee size={18} style={{ display: 'inline' }} />{totalFees.toLocaleString()}
          </span>
          <span className={styles.statLabel} style={{ color: '#64748b', opacity: 0.7 }}>Total Fees</span>
        </div>
        <div className={`glass ${styles.statCard}`} style={{ background: '#f0fdf4', borderColor: '#dcfce7' }}>
          <span className={styles.statCount} style={{ color: "#16a34a" }}>
            <TrendingUp size={18} style={{ display: 'inline' }} />{totalCollected.toLocaleString()}
          </span>
          <span className={styles.statLabel} style={{ color: '#16a34a', opacity: 0.7 }}>Collected</span>
        </div>
        <div className={`glass ${styles.statCard}`} style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
          <span className={styles.statCount} style={{ color: "#dc2626" }}>
            <TrendingDown size={18} style={{ display: 'inline' }} />{totalBalance.toLocaleString()}
          </span>
          <span className={styles.statLabel} style={{ color: '#dc2626', opacity: 0.7 }}>Outstanding</span>
        </div>
        <div className={`glass ${styles.statCard}`} style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
          <span className={styles.statCount} style={{ color: "#059669" }}>{paidCount}</span>
          <span className={styles.statLabel} style={{ color: '#059669', opacity: 0.7 }}>Fully Paid</span>
        </div>
        <div className={`glass ${styles.statCard}`} style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
          <span className={styles.statCount} style={{ color: "#d97706" }}>{pendingCount}</span>
          <span className={styles.statLabel} style={{ color: '#d97706', opacity: 0.7 }}>Pending</span>
        </div>
      </div>

      {/* Fee Table */}
      <div className="glass" style={{ padding: '2rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={20} className="text-gradient" /> Fee Management
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
            <div className={styles.filterTabs}>
              {["all", "paid", "partial", "pending"].map(s => (
                <button
                  key={s}
                  className={`${styles.filterTab} ${filterStatus === s ? styles.filterTabActive : ""}`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Grade</th>
                <th>Total Fee</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                        <br />
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{s.email}</span>
                      </div>
                    </td>
                    <td><span className={styles.gradeBadge}>{s.grade || "—"}</span></td>
                    <td style={{ fontWeight: 600 }}>₹{s.totalFee.toLocaleString()}</td>
                    <td style={{ color: '#34d399' }}>₹{s.paidAmount.toLocaleString()}</td>
                    <td style={{ color: s.balance > 0 ? '#ef4444' : '#34d399', fontWeight: 600 }}>₹{s.balance.toLocaleString()}</td>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="glass" style={{ padding: '2rem', marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IndianRupee size={20} className="text-gradient" /> Recent Transactions
          </h3>
          <div className={styles.transactionList}>
            {transactions.slice(0, 10).map(t => (
              <div key={t.id} className={styles.transactionItem}>
                <div>
                  <span style={{ fontWeight: 600 }}>{t.studentName}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '0.75rem' }}>
                    {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{t.note}</span>
                  <span style={{ color: '#34d399', fontWeight: 700, fontSize: '1.05rem' }}>+₹{t.amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedStudent && (
        <div className={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
          <div className={`glass ${styles.modal}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Record Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className={styles.modalClose}><X size={20} /></button>
            </div>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              Recording payment for <strong style={{ color: '#1e293b' }}>{selectedStudent.name}</strong>
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Total Fee: ₹{selectedStudent.totalFee.toLocaleString()} | Paid: ₹{selectedStudent.paidAmount.toLocaleString()} | Balance: ₹{selectedStudent.balance.toLocaleString()}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                  placeholder="e.g. Monthly installment"
                />
              </div>
              <button className="btn-primary" onClick={handleRecordPayment} disabled={processing || !paymentAmount} style={{ marginTop: '0.5rem' }}>
                {processing ? "Processing..." : `Record ₹${paymentAmount || "0"} Payment`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Fee Modal */}
      {showFeeSetModal && selectedStudent && (
        <div className={styles.modalOverlay} onClick={() => setShowFeeSetModal(false)}>
          <div className={`glass ${styles.modal}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Set Total Fee</h3>
              <button onClick={() => setShowFeeSetModal(false)} className={styles.modalClose}><X size={20} /></button>
            </div>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              Setting total fee for <strong style={{ color: '#1e293b' }}>{selectedStudent.name}</strong>
            </p>
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
            <button className="btn-primary" onClick={handleSetFee} disabled={processing || !feeAmount} style={{ marginTop: '1.5rem' }}>
              {processing ? "Saving..." : "Save Fee"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
