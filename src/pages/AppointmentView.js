import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

function AppointmentView() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="ml-1">Back</span>
        </button>
        
        <h1 className="text-2xl font-bold mb-4">Appointment Details</h1>
        <p className="text-gray-600">Appointment ID: {appointmentId}</p>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-center text-gray-500">This is a placeholder for appointment details.</p>
        </div>
      </div>
    </div>
  );
}

export default AppointmentView;