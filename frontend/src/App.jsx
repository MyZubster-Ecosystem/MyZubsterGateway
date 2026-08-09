import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import LanguageSwitcher from './components/LanguageSwitcher/LanguageSwitcher.jsx';
import Bounty from './pages/Bounty';
import Home from './pages/Home';
import UrbanGardenDashboard from './pages/UrbanGardenDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import TransactionHistory from './pages/TransactionHistory';
import AdminDashboard from './pages/AdminDashboard';
import ApiDocs from './pages/ApiDocs';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="app-container">
          <div className="lang-switcher-bar">
            <LanguageSwitcher />
          </div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/bounty" element={<Bounty />} />
            <Route path="/garden" element={<UrbanGardenDashboard />} />
            <Route path="/hospital" element={<HospitalDashboard />} />
            <Route path="/transactions" element={<TransactionHistory />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/api-docs" element={<ApiDocs />} />
          </Routes>
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;