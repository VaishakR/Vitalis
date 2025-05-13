import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Patients from './pages/Patients';
import Settings from './pages/Settings';
import VoiceTranscription from './pages/VoiceTranscription';
import Navbar from './components/Navbar';
import EMRReport from './pages/EMRReport';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#E6F3EF] pl-72 pt-6">
        {/* Fixed sidebar */}
        <Navbar />

        {/* Page content area */}
        <main className="pr-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/transcribe/:appointmentId" element={<VoiceTranscription />} />
            <Route path="/emr-report/:reportId" element={<EMRReport />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
