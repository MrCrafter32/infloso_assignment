import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import VerifyEmail from './pages/VerifyEmail'
import ProtectedRoute from './components/ProtectedRoute'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
function App() {
  return (
    <>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
    </>
  )
}

export default App