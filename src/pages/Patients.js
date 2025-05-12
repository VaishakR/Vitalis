import React, { useState } from 'react';
import { FaMars, FaVenus } from 'react-icons/fa';

const mockPatients = [
  { id: 'P001', name: 'John Doe', age: 45, gender: 'Male', lastVisit: '2025-04-20' },
  { id: 'P002', name: 'Jane Smith', age: 32, gender: 'Female', lastVisit: '2025-04-15' },
  { id: 'P003', name: 'Alice Johnson', age: 54, gender: 'Female', lastVisit: '2025-03-10' },
  { id: 'P004', name: 'Michael Lee', age: 29, gender: 'Male', lastVisit: '2025-05-01' }
];

function Patients() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 gap-6">
    <div className="appointments-container">
      <h1 className="page-title">Patients</h1>

      <input
        type="text"
        placeholder="Search by Name or ID"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: '100%',
          padding: '14px 20px',
          marginBottom: '25px',
          fontSize: '16px',
          borderRadius: '8px',
          border: '1px solid #ccc',
          outline: 'none'
        }}
      />

      <div className="appointments-list">
        {filteredPatients.map((patient) => (
          <div key={patient.id} className="appointment-item" style={{ padding: '20px', minHeight: '120px' }}>
            <div className="appointment-details">
              <span className="patient-name" style={{ fontSize: '18px', fontWeight: '600' }}>
                {patient.name}
              </span>
              <span className="appointment-date-time" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                <span>ID: {patient.id}</span>
                <span>Age: {patient.age}</span>
                <span>
                  {patient.gender === 'Male' ? <FaMars color="#2196f3" /> : <FaVenus color="#e91e63" />}
                </span>
              </span>
              <span className="appointment-type" style={{ fontSize: '14px', color: '#666' }}>
                Last Visit: {patient.lastVisit}
              </span>
            </div>
            <div className="appointment-status">
              <span className="status-label">Active</span>
            </div>
          </div>
        ))}

        {filteredPatients.length === 0 && (
          <div className="card">No matching patients found.</div>
        )}
      </div>
    </div>
    </div>
  );
}

export default Patients;
