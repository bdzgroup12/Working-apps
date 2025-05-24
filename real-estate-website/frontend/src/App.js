import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PropertyListings from './pages/PropertyListings';
import RegionalGuides from './pages/RegionalGuides';
import Agencies from './pages/Agencies';
import News from './pages/News';
import Testimonials from './pages/Testimonials';
import Contact from './pages/Contact';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import VerifyEmailPage from './pages/VerifyEmailPage';
import UsersManagement from './pages/UsersManagement';
import ProfilePage from './pages/ProfilePage';
import RegionsPage from './pages/RegionsPage';
import AgenciesPage from './pages/AgenciesPage';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/properties" element={<PropertyListings />} />
        <Route path="/regional-guides" element={<RegionalGuides />} />
        <Route path="/agencies" element={<Agencies />} />
        <Route path="/news" element={<News />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        
        {/* Dashboard routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/properties" element={<PropertyListings />} />
        <Route path="/dashboard/regions" element={<RegionsPage />} />
        <Route path="/dashboard/agencies" element={<AgenciesPage />} />
        <Route path="/dashboard/users" element={<UsersManagement />} />
        <Route path="/dashboard/leads" element={<Dashboard />} />
        <Route path="/dashboard/settings" element={<Settings />} />
        <Route path="/dashboard/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;
