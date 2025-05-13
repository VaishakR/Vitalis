import React from 'react';
import { useNavigate } from 'react-router-dom';
import EMRForm from '../components/emr/EMRForm';

function EMRFormWrapper() {
  const navigate = useNavigate();
  
  // You might get this data from sessionStorage
  const emrData = JSON.parse(sessionStorage.getItem('emrData')) || {};
  const patientInfo = JSON.parse(sessionStorage.getItem('patientInfo')) || {
    patientName: "John Doe",
    appointmentTime: "10:00 AM, May 15, 2023",
    appointmentType: "Follow-up"
  };
  
  const handleClose = () => {
    navigate('/appointments');
  };
  
  const handleSave = (data) => {
    // Save the EMR data
    console.log('EMR data saved:', data);
    sessionStorage.setItem('emrData', JSON.stringify(data));
    alert('EMR data saved successfully!');
    navigate('/appointments');
  };
  
  return (
    <EMRForm
      patientName={patientInfo.patientName}
      appointmentTime={patientInfo.appointmentTime}
      appointmentType={patientInfo.appointmentType}
      initialEMRData={emrData}
      currentVitals={emrData.currentVitalsData || {}}
      onClose={handleClose}
      onSave={handleSave}
    />
  );
}

export default EMRFormWrapper;