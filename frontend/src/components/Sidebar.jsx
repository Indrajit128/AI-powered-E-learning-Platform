import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, PlusCircle, BarChart2, LogOut, Users, X } from 'lucide-react';

const Sidebar = ({ user, logout, isOpen, setIsOpen }) => {
  const location = useLocation();
  const isFaculty = user.role === 'faculty';

  const menuItems = user.role === 'admin'
    ? [
        { name: 'Admin Dashboard', path: '/admin', icon: <Home size={20} /> },
        { name: 'Admissions', path: '/admin/admissions', icon: <Users size={20} /> },
        { name: 'Fee Management', path: '/admin/fees', icon: <BarChart2 size={20} /> },
        { name: 'Staff Profiles', path: '/admin/staff', icon: <Users size={20} /> },
      ]
    : isFaculty 
    ? [
        { name: 'Dashboard', path: '/faculty', icon: <Home size={20} /> },
        { name: 'Create Batch', path: '/faculty/create-batch', icon: <Users size={20} /> },
        { name: 'Attendance', path: '/faculty/attendance', icon: <BarChart2 size={20} /> },
        { name: 'New Assignment', path: '/faculty/create-assignment', icon: <PlusCircle size={20} /> },
      ]
    : [
        { name: 'Dashboard', path: '/student', icon: <Home size={20} /> },
        { name: 'Coding Challenges', path: '/student/coding', icon: <PlusCircle size={20} /> },
        { name: 'Online Quizzes', path: '/student/quizzes', icon: <BookOpen size={20} /> },
        { name: 'Practice Assignments', path: '/student/practice', icon: <PlusCircle size={20} /> },
        { name: 'My Performance', path: '/student/performance', icon: <BarChart2 size={20} /> },
      ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}></div>
      <div className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem' }}>
          <div className="logo" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
            Mentordeskk
          </div>
          {isOpen && (
            <button className="mobile-menu-btn" onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>
          )}
        </div>
      
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {menuItems.map(item => (
          <Link 
            key={item.name} 
            to={item.path} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '0.75rem 1rem',
              textDecoration: 'none',
              color: location.pathname === item.path ? 'var(--primary)' : 'var(--text-muted)',
              background: location.pathname === item.path ? '#4f46e510' : 'transparent',
              borderRadius: '8px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            {item.icon} {item.name}
          </Link>
        ))}
      </nav>

      <button className="logout-btn" onClick={logout} style={{
        background: '#fee2e2',
        color: '#ef4444',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        border: 'none',
        borderRadius: '8px',
        padding: '0.75rem',
        cursor: 'pointer'
      }}>
        <LogOut size={18} /> Logout
      </button>
    </div>
    </>
  );
};

export default Sidebar;
