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
import ViewResults from './pages/ViewResults';
import Performance from './pages/Performance';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

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
      <div className="app-container" style={{ display: 'flex', minHeight: '100vh' }}>
        {user && <Sidebar user={user} logout={logout} />}
        <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {user && <Navbar user={user} />}
          <div className="page-content" style={{ padding: '2rem', flex: 1 }}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to={user.role === 'faculty' ? '/faculty' : '/student'} />} />
              <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to={user.role === 'faculty' ? '/faculty' : '/student'} />} />
              
              {/* Faculty Routes */}
              <Route path="/faculty" element={user?.role === 'faculty' ? <FacultyDashboard /> : <Navigate to="/login" />} />
              <Route path="/faculty/create-batch" element={user?.role === 'faculty' ? <CreateBatch /> : <Navigate to="/login" />} />
              <Route path="/faculty/create-assignment" element={user?.role === 'faculty' ? <CreateAssignment /> : <Navigate to="/login" />} />
              <Route path="/faculty/results/:id" element={user?.role === 'faculty' ? <ViewResults /> : <Navigate to="/login" />} />

              <Route path="/student" element={user?.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />} />
              <Route path="/student/performance" element={user?.role === 'student' ? <Performance /> : <Navigate to="/login" />} />
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
