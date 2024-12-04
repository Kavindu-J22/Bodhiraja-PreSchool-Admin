import { BrowserRouter, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute'; 
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Feedback from './pages/Feedback';
import Admissions from './pages/Admissions';
import Students from './pages/Students';
import Studentreg from './pages/Studentreg';
import './firebase';
import Teachers from './pages/Teachers';
import Teacherreg from './pages/Teacherreg';
import Payment from './pages/Payment';
import Events from './pages/Events';
import Learning from './pages/Learning';
import Timetable from './pages/Timetable';
import Staffs from './pages/Staffs';
import Login from './pages/Login';

function MainContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className='main d-flex'>
      {!isLoginPage && (
        <div className='sidebarWrapper'>
          <Sidebar />
        </div>
      )}
      <div className='content'>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
          <Route path="/admissions" element={<ProtectedRoute><Admissions /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
          <Route path="/studentreg" element={<ProtectedRoute><Studentreg /></ProtectedRoute>} />
          <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
          <Route path="/teacherreg" element={<ProtectedRoute><Teacherreg /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
          <Route path="/learning" element={<ProtectedRoute><Learning /></ProtectedRoute>} />
          <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
          <Route path="/staffs" element={<ProtectedRoute><Staffs /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect from root to login */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        {/* Protected Routes */}
        <Route path="*" element={<>
          <Header />
          <MainContent />
        </>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
