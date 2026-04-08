import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CreateBatch from './pages/CreateBatch';
import CreateAssignment from './pages/CreateAssignment';
import AttemptAssignment from './pages/AttemptAssignment';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// New Project Pages
import CodingChallenges from './pages/CodingChallenges';
import OnlineQuizzes from './pages/OnlineQuizzes';
import PracticeAssignments from './pages/PracticeAssignments';
import ViewResults from './pages/ViewResults';
import Performance from './pages/Performance';
import ChallengeDetails from './pages/ChallengeDetails';
import FacultyChallenges from './pages/FacultyChallenges';
import QuizAttempt from './pages/QuizAttempt';
import StudentAssignments from './pages/StudentAssignments';
import FacultyAttendance from './pages/FacultyAttendance';
import AssignmentProgress from './pages/AssignmentProgress';

// ERP Admin Pages
const AdminDashboard = () => <div className="card"><h2>Admin Dashboard</h2><p>Overview of institution stats, admissions, and financials.</p></div>;
const Admissions = () => <div className="card"><h2>Admissions Management</h2><p>Review and approve new student applications.</p></div>;
const FeeManagement = () => <div className="card"><h2>Fee Management</h2><p>Track fee structures and student payments.</p></div>;
const StaffProfiles = () => <div className="card"><h2>Staff & HR</h2><p>Manage faculty and administrative staff details.</p></div>;
const AttendanceTracker = () => <div className="card"><h2>Attendance Tracker</h2><p>Monitor student and staff attendance.</p></div>;

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    console.log('App State:', { user, url: window.location.href });
  }, [user]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <div className="app-container">
        {user && <Sidebar user={user} logout={logout} isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />}
        <div className="main-content">
          {user && <Navbar user={user} toggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />}
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'faculty' ? '/faculty' : '/student'} />} />
              <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'faculty' ? '/faculty' : '/student'} />} />
              
              {/* Admin ERP Routes */}
              <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
              <Route path="/admin/admissions" element={user?.role === 'admin' ? <Admissions /> : <Navigate to="/login" />} />
              <Route path="/admin/fees" element={user?.role === 'admin' ? <FeeManagement /> : <Navigate to="/login" />} />
              <Route path="/admin/staff" element={user?.role === 'admin' ? <StaffProfiles /> : <Navigate to="/login" />} />

              {/* Faculty Routes */}
              <Route path="/faculty" element={user?.role === 'faculty' ? <FacultyDashboard /> : <Navigate to="/login" />} />
              <Route path="/faculty/attendance" element={user?.role === 'faculty' ? <FacultyAttendance /> : <Navigate to="/login" />} />
              <Route path="/faculty/create-batch" element={user?.role === 'faculty' ? <CreateBatch /> : <Navigate to="/login" />} />
              <Route path="/faculty/create-assignment" element={user?.role === 'faculty' ? <CreateAssignment /> : <Navigate to="/login" />} />
              <Route path="/faculty/challenges" element={user?.role === 'faculty' ? <FacultyChallenges /> : <Navigate to="/login" />} />
              <Route path="/faculty/assignment-progress/:id" element={user?.role === 'faculty' ? <AssignmentProgress /> : <Navigate to="/login" />} />
              <Route path="/faculty/results/:id" element={user?.role === 'faculty' ? <ViewResults /> : <Navigate to="/login" />} />

              {/* Student Routes */}
              <Route path="/student" element={user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />} />
              <Route path="/student/coding" element={user?.role === 'student' ? <CodingChallenges /> : <Navigate to="/login" />} />
              <Route path="/student/quizzes" element={user?.role === 'student' ? <OnlineQuizzes /> : <Navigate to="/login" />} />
              <Route path="/student/practice" element={user?.role === 'student' ? <StudentAssignments /> : <Navigate to="/login" />} />
              <Route path="/student/performance" element={user?.role === 'student' ? <Performance /> : <Navigate to="/login" />} />
              <Route path="/student/coding-challenge/:id" element={user?.role === 'student' ? <ChallengeDetails /> : <Navigate to="/login" />} />
              <Route path="/student/quiz/:id" element={user?.role === 'student' ? <QuizAttempt /> : <Navigate to="/login" />} />
              <Route path="/student/attempt/:id" element={user?.role === 'student' ? <AttemptAssignment /> : <Navigate to="/login" />} />

              {/* Default Redirect */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
