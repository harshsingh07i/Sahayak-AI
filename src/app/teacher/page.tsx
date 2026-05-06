"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Users, FileText, Bot, DollarSign, LogOut, CheckCircle, XCircle, Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WordsPullUpMultiStyle } from "@/components/animations/WordsPullUp";
import styles from "./teacher.module.css";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, where, serverTimestamp } from "firebase/firestore";
import AIToolRunner from "@/components/AIToolRunner";
import ProfileModal from "@/components/ProfileModal";

export default function TeacherDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "teacher")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "teacher") return <div className={styles.loading}>Loading Sahayak AI...</div>;

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "attendance":
        return <AttendancePortal />;
      case "ai-tools":
        return <AIToolsHub />;
      case "assignments":
        return <AssignmentsManager />;
      case "fees":
        return <FeesDashboard />;
      default:
        return <TeacherOverview />;
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
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.sidebarHeader}>
          <img src="/logo.png" alt="Logo" width={40} height={40} className={styles.sidebarLogo} />
          <h2>Sahayak AI</h2>
          <span className={styles.roleBadge}>Teacher</span>
        </div>
        
        <nav className={styles.navMenu}>
          <button className={`${styles.navItem} ${activeTab === 'overview' ? styles.active : ''}`} onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }}>
            <Users size={20} /> Overview
          </button>
          <button className={`${styles.navItem} ${activeTab === 'attendance' ? styles.active : ''}`} onClick={() => { setActiveTab('attendance'); setIsMobileMenuOpen(false); }}>
            <CheckCircle size={20} /> Attendance
          </button>
          <button className={`${styles.navItem} ${activeTab === 'ai-tools' ? styles.active : ''}`} onClick={() => { setActiveTab('ai-tools'); setIsMobileMenuOpen(false); }}>
            <Bot size={20} /> AI Tools Hub
          </button>
          <button className={`${styles.navItem} ${activeTab === 'assignments' ? styles.active : ''}`} onClick={() => { setActiveTab('assignments'); setIsMobileMenuOpen(false); }}>
            <FileText size={20} /> Assignments
          </button>
          <button className={`${styles.navItem} ${activeTab === 'fees' ? styles.active : ''}`} onClick={() => { setActiveTab('fees'); setIsMobileMenuOpen(false); }}>
            <DollarSign size={20} /> Fees Tracker
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
              color: '#0c4a6e', 
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
              <span className={styles.userName}>{user.name || "Teacher"} <Bot size={12} style={{ opacity: 0.5, marginLeft: '4px' }} /></span>
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

function TeacherOverview() {
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const snapshot = await getDocs(collection(db, "students"));
      setStudentCount(snapshot.size);
    };
    fetchCount();
  }, []);

  return (
    <div className="fade-in">
      <div className={styles.statsGrid}>
        <div className={`glass ${styles.statCard}`} style={{ background: '#ffe4e6', borderColor: '#fecdd3' }}>
          <h3 style={{ color: '#e11d48' }}>Total Students</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#e11d48' }}>{studentCount}</p>
        </div>
        <div className={`glass ${styles.statCard}`} style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
          <h3 style={{ color: '#ea580c' }}>Today&apos;s Attendance</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ea580c' }}>--</p>
        </div>
        <div className={`glass ${styles.statCard}`} style={{ background: '#f0fdf4', borderColor: '#dcfce7' }}>
          <h3 style={{ color: '#16a34a' }}>Pending Assignments</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: '#16a34a' }}>--</p>
        </div>
      </div>
      <div className={`glass`} style={{ marginTop: '2rem', padding: '2rem' }}>
        <h2 style={{ color: '#1e293b' }}>Recent Activity</h2>
        <p style={{ color: '#64748b', marginTop: '1rem' }}>No recent activity to show.</p>
      </div>
    </div>
  );
}

function AttendancePortal() {
  const [students, setStudents] = useState<any[]>([]);
  const [markedList, setMarkedList] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStudents = async () => {
      const snapshot = await getDocs(collection(db, "students"));
      setStudents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };
    fetchStudents();
  }, []);

  const handleMark = async (studentId: string, name: string, status: 'present' | 'absent') => {
    setMarkedList(prev => ({ ...prev, [studentId]: status }));
    try {
      await addDoc(collection(db, "attendance"), {
        studentId,
        studentName: name,
        status,
        date: new Date().toISOString().split('T')[0],
        teacherId: user?.uid,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error("Error marking attendance:", err);
    }
  };

  if (loading) return <div className="glass" style={{ padding: '2rem' }}>Loading students...</div>;

  return (
    <div className={`glass fade-in`} style={{ padding: '2rem' }}>
      <h2>Mark Attendance</h2>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Live updates are sent to students and parents.</p>
      
      <div className={styles.attendanceList}>
        {students.map(student => (
          <div key={student.id} className={styles.attendanceItem}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600 }}>{student.name}</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Grade {student.grade}</span>
            </div>
            <div className={styles.attendanceActions}>
              <button 
                className={styles.btnPresent} 
                onClick={() => handleMark(student.id, student.name, 'present')}
                disabled={markedList[student.id] === 'present'}
                style={{ opacity: markedList[student.id] === 'present' ? 1 : markedList[student.id] ? 0.3 : 1 }}
              >
                <CheckCircle size={16}/> Present
              </button>
              <button 
                className={styles.btnAbsent} 
                onClick={() => handleMark(student.id, student.name, 'absent')}
                disabled={markedList[student.id] === 'absent'}
                style={{ opacity: markedList[student.id] === 'absent' ? 1 : markedList[student.id] ? 0.3 : 1 }}
              >
                <XCircle size={16}/> Absent
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIToolsHub() {
  const [activeTool, setActiveTool] = useState<any>(null);

  const tools = [
    { id: "quiz", name: "Quiz Generator", desc: "Create interactive quizzes instantly.", placeholder: "Enter a topic (e.g., Photosynthesis in Plants)" },
    { id: "lesson_plan", name: "Lesson Plan Creator", desc: "Structure your daily teaching.", placeholder: "Enter topic and class grade (e.g., Grade 8 Physics - Gravity)" },
    { id: "story", name: "Story Generator", desc: "Multi-language educational stories.", placeholder: "What should the educational story be about?" },
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

function AssignmentsManager() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [grade, setGrade] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const { user } = useAuth();

  const fetchAssignments = async () => {
    const q = query(collection(db, "assignments"), where("teacherId", "==", user?.uid), orderBy("timestamp", "desc"));
    const snap = await getDocs(q);
    setRecentAssignments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const fetchSubmissions = async () => {
    const q = query(
      collection(db, "submissions"), 
      where("teacherId", "==", user?.uid),
      orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);
    setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    if (user) {
      fetchAssignments();
      fetchSubmissions();
    }
  }, [user]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !grade || !dueDate) return;
    setUploading(true);
    try {
      await addDoc(collection(db, "assignments"), {
        title,
        description: desc,
        grade,
        dueDate,
        teacherId: user?.uid,
        teacherName: user?.name,
        timestamp: serverTimestamp()
      });
      setTitle("");
      setDesc("");
      setGrade("");
      setDueDate("");
      alert("Assignment uploaded successfully!");
      fetchAssignments();
    } catch (err) {
      console.error("Error uploading assignment:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fade-in">
      <div className={`glass`} style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2>Create New Assignment</h2>
          <p style={{ color: '#64748b' }}>Assignments will be synced to all students in the selected grade.</p>
        </div>

        <form onSubmit={handleUpload} className={styles.aiToolsGrid} style={{ gridTemplateColumns: '1fr' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" placeholder="Assignment Title" value={title} 
              onChange={e => setTitle(e.target.value)} className={styles.toolCard} 
              style={{ width: '100%', padding: '1rem', background: '#f8fafc' }}
            />
            <textarea 
              placeholder="Description / Instructions" value={desc} 
              onChange={e => setDesc(e.target.value)} className={styles.toolCard}
              style={{ width: '100%', padding: '1rem', background: '#f8fafc', minHeight: '100px' }}
            />
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <input 
                type="text" placeholder="Grade (e.g. 10th)" value={grade} 
                onChange={e => setGrade(e.target.value)} className={styles.toolCard}
                style={{ flex: 1, minWidth: '150px', padding: '1rem', background: '#f8fafc' }}
              />
              <input 
                type="date" value={dueDate} 
                onChange={e => setDueDate(e.target.value)} className={styles.toolCard}
                style={{ flex: 1, minWidth: '150px', padding: '1rem', background: '#f8fafc' }}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={uploading} style={{ padding: '1rem' }}>
              {uploading ? "Uploading..." : "Publish Assignment"}
            </button>
          </div>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="glass" style={{ padding: '2rem' }}>
          <h3>Recent Uploads</h3>
          <div className={styles.submissionList}>
            {recentAssignments.map(ass => (
              <div key={ass.id} className={styles.submissionItem}>
                <div className={styles.submissionInfo}>
                  <h4>{ass.title}</h4>
                  <p>Grade: {ass.grade} | Due: {ass.dueDate}</p>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </div>
            ))}
            {recentAssignments.length === 0 && <p style={{ color: '#64748b' }}>No assignments uploaded yet.</p>}
          </div>
        </div>

        <div className="glass" style={{ padding: '2rem' }}>
          <h3>Student Submissions</h3>
          <div className={styles.submissionList}>
            {submissions.map(sub => (
              <div key={sub.id} className={styles.submissionItem}>
                <div className={styles.submissionInfo}>
                  <h4>{sub.studentName}</h4>
                  <p>Assignment: {sub.assignmentTitle}</p>
                  <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>{new Date(sub.timestamp?.seconds * 1000).toLocaleDateString()}</p>
                </div>
                <span className={styles.submissionStatus}>Submitted</span>
              </div>
            ))}
            {submissions.length === 0 && <p style={{ color: '#64748b' }}>No submissions received yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeesDashboard() {
  return (
    <div className={`glass fade-in`} style={{ padding: '2rem' }}>
      <h2>Fees Tracking</h2>
      <p style={{ color: '#64748b', marginTop: '1rem' }}>Monitor who has submitted fees and who has pending dues.</p>
    </div>
  );
}
