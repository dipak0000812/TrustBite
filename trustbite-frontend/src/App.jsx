import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import MessDetailPage from './pages/MessDetailPage';
// Note: DiscoveryPage and ProfilePage will be moved/updated next

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/discovery' element={<LandingPage />} /> {/* Temporary redirect */}
        <Route path='/discover' element={<LandingPage />} /> {/* Temporary redirect */}
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path='/mess/:id' element={<MessDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
