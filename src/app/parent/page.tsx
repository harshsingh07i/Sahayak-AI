"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { BookOpen, DollarSign, LogOut, CheckCircle, Activity, User, Bot, Menu, X, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WordsPullUpMultiStyle } from "@/components/animations/WordsPullUp";
import styles from "./parent.module.css";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import ProfileModal from "@/components/ProfileModal";

export default function ParentDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "parent")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "parent") return <div className={styles.loading}>Loading Sahayak AI...</div>;

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "performance":
        return <PerformancePortal />;
      case "attendance":
        return <AttendanceTracker />;
      case "assignments":
        return <ParentAssignments />;
      case "fees":
        return <FeesPortal />;
      default:
        return <ParentOverview />;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <ProfileModal user={user} isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      {/* Mobile Backdrop */}
      <div 
        className={`${styles.drawerBackdrop} ${isMobileMenuOpen ? styles.mobileOpen : ''}`} 
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <motion.aside 
        className={`${styles.sidebar} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.sidebarHeader}>
          <img src="/logo.png" alt="Logo" width={40} height={40} className={styles.sidebarLogo} />
          <h2>Sahayak AI</h2>
          <span className={styles.roleBadge}>Parent</span>
        </div>
        
        <nav className={styles.navMenu}>
          <button className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`} onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }}>
            <Activity size={20} /> Live Overview
          </button>
          <button className={`${styles.navItem} ${activeTab === 'performance' ? styles.active : ''}`} onClick={() => { setActiveTab('performance'); setIsMobileMenuOpen(false); }}>
            <BookOpen size={20} /> Performance
          </button>
          <button className={`${styles.navItem} ${activeTab === 'assignments' ? styles.active : ''}`} onClick={() => { setActiveTab('assignments'); setIsMobileMenuOpen(false); }}>
            <FileText size={20} /> Assignments
          </button>
          <button className={`${styles.navItem} ${activeTab === 'attendance' ? styles.active : ''}`} onClick={() => { setActiveTab('attendance'); setIsMobileMenuOpen(false); }}>
            <CheckCircle size={20} /> Attendance
          </button>
          <button className={`${styles.navItem} ${activeTab === 'fees' ? styles.active : ''}`} onClick={() => { setActiveTab('fees'); setIsMobileMenuOpen(false); }}>
            <DollarSign size={20} /> Fees
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))', 
            borderRadius: '16px', 
            padding: '1.25rem', 
            marginBottom: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center'
          }}>
            <Bot size={24} style={{ color: '#fff', marginBottom: '0.75rem', margin: '0 auto' }} />
            <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.25rem' }}>Sahayak Pro</h4>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', marginBottom: '1rem' }}>Unlock all advanced AI features and analytics.</p>
            <button style={{ 
              background: '#fff', 
              color: '#78350f', 
              border: 'none', 
              padding: '0.5rem 1rem', 
              borderRadius: '8px', 
              fontSize: '0.75rem', 
              fontWeight: 700,
              width: '100%',
              cursor: 'pointer'
            }}>Get Pro</button>
          </div>
          <div className={styles.userInfo} onClick={() => { setIsProfileOpen(true); setIsMobileMenuOpen(false); }} style={{ cursor: 'pointer' }}>
            <div className={styles.avatar}>{user.email?.charAt(0).toUpperCase()}</div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user.name || "Parent"} <Bot size={12} style={{ opacity: 0.5, marginLeft: '4px' }} /></span>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </motion.aside>

      <motion.main 
        className={styles.mainContent}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className={styles.topHeader}>
          <button className={styles.menuToggle} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <WordsPullUpMultiStyle 
            segments={[{ text: activeTab.replace('-', ' '), className: 'capitalize' }]}
            className="text-3xl font-bold"
          />
        </header>
        <div className={styles.contentArea}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>
    </div>
  );
}

function ParentOverview() {
  const { user } = useAuth();
  const [childData, setChildData] = useState<any>(null);
  const [attendance, setAttendance] = useState<string>("Not marked yet");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildStats = async () => {
      try {
        // Find student linked to this parent
        const stuQ = query(collection(db, "students"), where("parentEmail", "==", user?.email));
        const stuSnap = await getDocs(stuQ);
        if (!stuSnap.empty) {
          const child = stuSnap.docs[0].data();
          setChildData(child);
          const childId = stuSnap.docs[0].id;

          // Fetch attendance for today
          const today = new Date().toISOString().split('T')[0];
          const attQ = query(collection(db, "attendance"), where("studentId", "==", childId), where("date", "==", today));
          const attSnap = await getDocs(attQ);
          if (!attSnap.empty) {
            setAttendance(attSnap.docs[0].data().status === 'present' ? "Marked Present Today" : "Marked Absent Today");
          }
        }
      } catch (err) {
        console.error("Error fetching child stats:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchChildStats();
  }, [user]);

  if (loading) return <div className="glass" style={{ padding: '2rem' }}>Loading child data...</div>;

  return (
    <div className="fade-in">
      <div className={`glass`} style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ color: '#1e293b' }}>Welcome to the Parent Portal</h2>
        <p style={{ color: '#64748b' }}>Here is the live feed for your child.</p>
        
        <div className={styles.childProfile}>
          <User size={32} style={{ color: '#d97706' }} />
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#1e293b' }}>Linked Student: {childData?.name || "No child linked"}</h3>
            <p style={{ color: '#92400e' }}>Grade {childData?.grade || "—"}</p>
          </div>
        </div>
      </div>
      <div className={styles.feedGrid}>
        <div className={`glass ${styles.feedCard}`} style={{ background: '#f0fdf4', borderColor: '#dcfce7' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a' }}>
            <CheckCircle size={18}/> Today's Attendance
          </h3>
          <p style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 600, color: '#16a34a' }}>{attendance}</p>
        </div>
        <div className={`glass ${styles.feedCard}`} style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309' }}>
            <BookOpen size={18}/> Recent Grades
          </h3>
          <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem', color: '#b45309' }}>
            <li style={{ marginBottom: '0.5rem' }}>Math Quiz: <span style={{ fontWeight: 700 }}>--</span></li>
            <li>Science Project: <span style={{ fontWeight: 700 }}>--</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function PerformancePortal() {
  return (
    <div className={`glass fade-in`} style={{ padding: '2rem' }}>
      <h2>Performance Analytics</h2>
      <p style={{ color: '#64748b' }}>View your child's academic progress over time.</p>
    </div>
  );
}

function AttendanceTracker() {
  return (
    <div className={`glass fade-in`} style={{ padding: '2rem' }}>
      <h2>Attendance History</h2>
      <p style={{ color: '#64748b' }}>Detailed monthly attendance records.</p>
    </div>
  );
}

function ParentAssignments() {
  const { user } = useAuth();
  const [childData, setChildData] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const stuQ = query(collection(db, "students"), where("parentEmail", "==", user?.email));
        const stuSnap = await getDocs(stuQ);
        if (!stuSnap.empty) {
          const child = stuSnap.docs[0].data();
          const childId = stuSnap.docs[0].id;
          setChildData(child);

          // Fetch assignments for child's grade
          const assQ = query(collection(db, "assignments"), where("grade", "==", child.grade), orderBy("timestamp", "desc"));
          const assSnap = await getDocs(assQ);
          setAssignments(assSnap.docs.map(d => ({ id: d.id, ...d.data() })));

          // Fetch child's submissions
          const subQ = query(collection(db, "submissions"), where("studentId", "==", childId));
          const subSnap = await getDocs(subQ);
          const subMap: Record<string, boolean> = {};
          subSnap.forEach(doc => {
            subMap[doc.data().assignmentId] = true;
          });
          setSubmissions(subMap);
        }
      } catch (err) {
        console.error("Error fetching assignments:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchAssignments();
  }, [user]);

  return (
    <div className={`glass fade-in`} style={{ padding: '2rem' }}>
      <h2>Child's Assignments</h2>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Track academic tasks and completion status for {childData?.name || "your child"}.</p>
      
      {loading ? <p>Loading assignments...</p> : (
        <div className={styles.assignmentList}>
          {assignments.map((ass) => (
            <div key={ass.id} className={styles.assignmentCard}>
              <div>
                <h4 style={{ fontWeight: 700 }}>{ass.title}</h4>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>{ass.description}</p>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>Teacher: {ass.teacherName} | Due: {ass.dueDate}</p>
              </div>
              <div>
                {submissions[ass.id] ? (
                  <span className={`${styles.statusBadge} ${styles.statusDone}`}>Completed</span>
                ) : (
                  <span className={`${styles.statusBadge} ${styles.statusPending}`}>Pending</span>
                )}
              </div>
            </div>
          ))}
          {assignments.length === 0 && <p style={{ color: '#64748b' }}>No assignments found for Grade {childData?.grade}.</p>}
        </div>
      )}
    </div>
  );
}


function FeesPortal() {
  const { user } = useAuth();
  const [feeData, setFeeData] = useState<any>(null);
  const [feeLoading, setFeeLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const { collection, query, where, getDocs } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase");
        // Find student linked to this parent
        const q = query(collection(db, "students"), where("parentEmail", "==", user?.email));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setFeeData(snapshot.docs[0].data());
        }
      } catch (err) {
        console.error("Error fetching fee data:", err);
      } finally {
        setFeeLoading(false);
      }
    };
    if (user?.email) fetchFees();
  }, [user]);

  if (feeLoading) return <div className={`glass fade-in`} style={{ padding: '2rem' }}><p>Loading fee data...</p></div>;

  return (
    <div className="fade-in">
      <div className={`glass`} style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h2>Fees Portal</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>View your child&apos;s fee payment status.</p>
      </div>
      {feeData ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Student</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{feeData.name}</p>
          </div>
          <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Total Fee</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800 }}>₹{(feeData.totalFee || 0).toLocaleString()}</p>
          </div>
          <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Paid</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>₹{(feeData.paidAmount || 0).toLocaleString()}</p>
          </div>
          <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Balance</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: (feeData.totalFee - feeData.paidAmount) > 0 ? '#ef4444' : '#34d399' }}>₹{((feeData.totalFee || 0) - (feeData.paidAmount || 0)).toLocaleString()}</p>
          </div>
        </div>
      ) : (
        <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#64748b' }}>No linked student fee records found. Contact admin to sync your account.</p>
        </div>
      )}
    </div>
  );
}
