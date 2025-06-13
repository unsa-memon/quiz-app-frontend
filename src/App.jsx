import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Profile from './pages/Profile'
import QuizPage from './pages/QuizPage'
import QuizResults from './pages/QuizResults'
import CreateQuiz from './pages/CreateQuiz'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

// Protected route for admin
const ProtectedAdminRoute = () => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  return isAdmin ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

function App() {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  
  return (
    <div className="min-h-screen bg-gray-100">
      {!isAdmin && <Navbar />}
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={localStorage.getItem('token') ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/signup" element={localStorage.getItem('token') ? <Navigate to="/" replace /> : <Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Admin routes */}
        <Route path="/admin/login" element={
          localStorage.getItem('isAdmin') === 'true' 
            ? <Navigate to="/admin/dashboard" replace /> 
            : <AdminLogin />
        } />
        
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/quiz/:id" element={<QuizPage />} />
          <Route path="/quiz/attempt/:attemptId/results" element={<QuizResults />} />
          <Route path="/create-quiz" element={<CreateQuiz />} />
        </Route>
        
        {/* Redirect any unknown routes to home or login */}
        <Route path="*" element={
          localStorage.getItem('token') 
            ? localStorage.getItem('isAdmin') === 'true'
              ? <Navigate to="/admin/dashboard" replace />
              : <Navigate to="/" replace />
            : <Navigate to="/login" replace />
        } />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
    </div>
  )
}

export default App