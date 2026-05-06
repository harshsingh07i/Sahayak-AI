"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { BookOpen, FileText, Bot, DollarSign, LogOut, CheckCircle, Activity, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WordsPullUpMultiStyle } from "@/components/animations/WordsPullUp";
import styles from "./student.module.css";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";
import AIToolRunner from "@/components/AIToolRunner";
import ProfileModal from "@/components/ProfileModal";

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "student")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "student") return <div className={styles.loading}>Loading Sahayak AI...</div>;

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "ai-tools":
        return <StudentAITools />;
      case "assignments":
        return <StudentAssignments />;
      case "results":
        return <ResultsPortal />;
      case "fees":
        return <FeesPortal />;
      default:
        return <StudentOverview />;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <ProfileModal user={user} isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      {isMobileMenuOpen && (
        <div className={styles.drawerBackdrop} onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <motion.aside 
        className={`${styles.sidebar} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.sidebarHeader}>
          <img src="/logo.png" alt="Logo" width={40} height={40} className={styles.sidebarLogo} />
          <h2>Sahayak AI</h2>
          <span className={styles.roleBadge}>Student</span>
        </div>
        
        <nav className={styles.navMenu}>
          <button className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`} onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }}>
            <Activity size={20} /> Live Feed
          </button>
          <button className={`${styles.navItem} ${activeTab === 'ai-tools' ? styles.active : ''}`} onClick={() => { setActiveTab('ai-tools'); setIsMobileMenuOpen(false); }}>
            <Bot size={20} /> Study Tools
          </button>
          <button className={`${styles.navItem} ${activeTab === 'assignments' ? styles.active : ''}`} onClick={() => { setActiveTab('assignments'); setIsMobileMenuOpen(false); }}>
            <FileText size={20} /> Assignments
          </button>
          <button className={`${styles.navItem} ${activeTab === 'results' ? styles.active : ''}`} onClick={() => { setActiveTab('results'); setIsMobileMenuOpen(false); }}>
            <CheckCircle size={20} /> Results
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
              color: '#1e1b4b', 
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
              <span className={styles.userName}>{user.name || "Student"} <Bot size={12} style={{ opacity: 0.5, marginLeft: '4px' }} /></span>
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

function StudentOverview() {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<string>("Not marked yet");
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch attendance for today
      const today = new Date().toISOString().split('T')[0];
      const attQ = query(collection(db, "attendance"), where("studentId", "==", user?.uid), where("date", "==", today));
      const attSnap = await getDocs(attQ);
      if (!attSnap.empty) {
        setAttendance(attSnap.docs[0].data().status === 'present' ? "Marked Present Today" : "Marked Absent Today");
      }

      // Fetch student grade first
      const stuQ = query(collection(db, "students"), where("email", "==", user?.email));
      const stuSnap = await getDocs(stuQ);
      if (!stuSnap.empty) {
        const grade = stuSnap.docs[0].data().grade;
        // Fetch recent assignments for this grade
        const assQ = query(collection(db, "assignments"), where("grade", "==", grade), orderBy("timestamp", "desc"), limit(2));
        const assSnap = await getDocs(assQ);
        setAssignments(assSnap.docs.map(d => d.data()));
      }
    };
    if (user) fetchStats();
  }, [user]);

  return (
    <div className="fade-in">
      <div className={`glass`} style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ color: '#1e293b' }}>Good Morning, {user?.name?.split(' ')[0] || 'Student'}!</h2>
        <p style={{ color: '#64748b' }}>Here is your live feed for today.</p>
      </div>
      <div className={styles.feedGrid}>
        <div className={`glass ${styles.feedCard}`} style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0284c7' }}>
            <Activity size={18}/> Live Quizzes
          </h3>
          <p style={{ marginTop: '1rem', color: '#0284c7' }}>No live quizzes running right now.</p>
        </div>
        <div className={`glass ${styles.feedCard}`} style={{ background: '#fef3c7', borderColor: '#fde68a' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309' }}>
            <FileText size={18}/> Due Assignments
          </h3>
          {assignments.length > 0 ? (
            <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem', color: '#b45309' }}>
              {assignments.map((ass, i) => (
                <li key={i} style={{ marginBottom: '0.5rem' }}>{ass.title} - Due {ass.dueDate}</li>
              ))}
            </ul>
          ) : (
            <p style={{ marginTop: '1rem', color: '#b45309' }}>No assignments due.</p>
          )}
        </div>
        <div className={`glass ${styles.feedCard}`} style={{ background: '#f0fdf4', borderColor: '#dcfce7' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a' }}>
            <CheckCircle size={18}/> Attendance Status
          </h3>
          <p style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 600, color: '#16a34a' }}>{attendance}</p>
        </div>
      </div>
    </div>
  );
}

function StudentAITools() {
  const [activeTool, setActiveTool] = useState<any>(null);

  const tools = [
    { id: "eli5", name: "Concept Explainer (ELI5)", desc: "Get simplified explanations for complex topics.", placeholder: "What concept should I explain? (e.g., Quantum Computing)" },
    { id: "essay_outliner", name: "Essay Outliner", desc: "Structure your thoughts before writing.", placeholder: "What is your essay topic?" },
    { id: "ai_tutor", name: "Personal AI Tutor", desc: "Chat with Sahayak to solve doubts.", placeholder: "Ask me a question..." },
  ];

  if (activeTool) {
    return <AIToolRunner toolName={activeTool.name} toolType={activeTool.id} placeholder={activeTool.placeholder} onBack={() => setActiveTool(null)} />;
  }

  return (
    <div className="fade-in">
      <div className={styles.aiToolsGrid}>
        {tools.map(tool => (
          <div key={tool.name} className={`glass ${styles.toolCard}`}>
            <Bot size={32} className="text-gradient" style={{ marginBottom: '1rem' }} />
            <h3>{tool.name}</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>{tool.desc}</p>
            <button className="btn-secondary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={() => setActiveTool(tool)}>Launch Tool</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentAssignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [selectedAss, setSelectedAss] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const stuQ = query(collection(db, "students"), where("email", "==", user?.email));
      const stuSnap = await getDocs(stuQ);
      if (!stuSnap.empty) {
        const grade = stuSnap.docs[0].data().grade;
        const assQ = query(collection(db, "assignments"), where("grade", "==", grade), orderBy("timestamp", "desc"));
        const assSnap = await getDocs(assQ);
        setAssignments(assSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }

      // Fetch my submissions
      const subQ = query(collection(db, "submissions"), where("studentId", "==", user?.uid));
      const subSnap = await getDocs(subQ);
      const subMap: Record<string, boolean> = {};
      subSnap.forEach(doc => {
        subMap[doc.data().assignmentId] = true;
      });
      setSubmissions(subMap);
    } catch (err) {
      console.error("Error fetching assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleSubmit = async () => {
    if (!submissionText || !selectedAss) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "submissions"), {
        assignmentId: selectedAss.id,
        assignmentTitle: selectedAss.title,
        teacherId: selectedAss.teacherId,
        studentId: user?.uid,
        studentName: user?.name || user?.email,
        content: submissionText,
        timestamp: serverTimestamp()
      });
      alert("Work submitted successfully!");
      setSubmissionText("");
      setSelectedAss(null);
      fetchData();
    } catch (err) {
      console.error("Error submitting work:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`glass fade-in`} style={{ padding: '2rem' }}>
      <h2>My Assignments</h2>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Upload your completed work to mark it as done.</p>
      
      {loading ? <p>Loading assignments...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {assignments.map((ass) => (
            <div key={ass.id} className="glass" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h4 style={{ fontWeight: 700 }}>{ass.title}</h4>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>{ass.description}</p>
                <p style={{ fontSize: '0.8rem', color: '#dc2626', marginTop: '0.5rem' }}>Due: {ass.dueDate}</p>
              </div>
              {submissions[ass.id] ? (
                <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={18} /> Submitted
                </span>
              ) : (
                <button className="btn-secondary" onClick={() => setSelectedAss(ass)}>Submit Work</button>
              )}
            </div>
          ))}
          {assignments.length === 0 && <p style={{ color: '#64748b' }}>No assignments found for your grade.</p>}
        </div>
      )}

      <AnimatePresence>
        {selectedAss && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={styles.submissionArea}
          >
            <h3>Submitting: {selectedAss.title}</h3>
            <textarea 
              placeholder="Paste your work here or add a note for the teacher..."
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Send Submission"}
              </button>
              <button className="btn-secondary" onClick={() => setSelectedAss(null)}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultsPortal() {
  return (
    <div className={`glass fade-in`} style={{ padding: '2rem' }}>
      <h2>Exam & Quiz Results</h2>
      <p style={{ color: '#64748b' }}>Your grades will appear here once the teacher publishes them.</p>
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
        const q = query(collection(db, "students"), where("email", "==", user?.email));
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
        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>View your fee payment status.</p>
      </div>
      {feeData ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
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
          <p style={{ color: '#64748b' }}>No fee records found for your account. Contact admin.</p>
        </div>
      )}
    </div>
  );
}
