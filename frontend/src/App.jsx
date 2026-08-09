import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Bounty from './pages/Bounty';
import Home from './pages/Home';
import RobotDashboard from './pages/RobotDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bounty" element={<Bounty />} />
        <Route path="/dashboard/robots" element={<RobotDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
