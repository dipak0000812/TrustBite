import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import DiscoveryPage from './pages/DiscoveryPage';
import MessDetailPage from './pages/MessDetailPage';
import FavouritesPage from './pages/FavouritesPage';
import useStore from './store/useStore';

export default function App() {
  const checkAuth = useStore(s => s.checkAuth);

  // Validate token on app mount
  useEffect(() => { checkAuth(); }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/discover' element={<DiscoveryPage />} />
        <Route path='/discovery' element={<DiscoveryPage />} />
        <Route path='/mess/:id' element={<MessDetailPage />} />

        {/* Protected — any authenticated user */}
        <Route path='/dashboard' element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        {/* Protected — students only */}
        <Route path='/favourites' element={
          <ProtectedRoute roles={['student']}><FavouritesPage /></ProtectedRoute>
        } />

        {/* Protected — admin only */}
        <Route path='/admin' element={
          <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
