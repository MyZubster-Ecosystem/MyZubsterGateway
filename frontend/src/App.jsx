import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Bounty from './pages/Bounty';
import Home from './pages/Home';
import UrbanGardenDashboard from './pages/UrbanGardenDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import TransactionHistory from './pages/TransactionHistory';
<<<<<<< HEAD
import ComplianceDashboard from './pages/ComplianceDashboard';
=======
import AdminDashboard from './pages/AdminDashboard';
import ApiDocs from './pages/ApiDocs';
<<<<<<< HEAD
>>>>>>> origin/main
=======
import ComplianceDashboard from './pages/ComplianceDashboard';
>>>>>>> main

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bounty" element={<Bounty />} />
        <Route path="/garden" element={<UrbanGardenDashboard />} />
        <Route path="/hospital" element={<HospitalDashboard />} />
        <Route path="/transactions" element={<TransactionHistory />} />
<<<<<<< HEAD
        <Route path="/compliance" element={<ComplianceDashboard />} />
=======
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/api-docs" element={<ApiDocs />} />
<<<<<<< HEAD
>>>>>>> origin/main
=======
        <Route path="/compliance" element={<ComplianceDashboard />} />
>>>>>>> main
      </Routes>
    </BrowserRouter>
  );
}

export default App;
