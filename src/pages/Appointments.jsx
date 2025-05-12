
import React, { useState } from 'react';
import AppointmentDetails from '../components/AppointmentDetails';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const handleUpdateAppointment = (updatedAppointment) => {
    setAppointments(prev => prev.map(app => 
      app.id === updatedAppointment.id ? updatedAppointment : app
    ));
    setSelectedAppointment(null);
  };

  const handleDeleteAppointment = (appointmentId) => {
    setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    setSelectedAppointment(null);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Appointments</h1>
      
      {/* Appointment list */}
      <div className="mt-4 grid gap-4">
        {appointments.map(appointment => (
          <div 
            key={appointment.id}
            className="p-4 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-50"
            onClick={() => setSelectedAppointment(appointment)}
          >
            <h2 className="text-lg font-semibold">{appointment.title}</h2>
            <p className="text-sm text-gray-600">{appointment.date}</p>
          </div>
        ))}
      </div>
      
      {/* Appointment details modal */}
      {selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onUpdate={handleUpdateAppointment}
          onDelete={handleDeleteAppointment}
        />
      )}
    </div>
  );
};

export default AppointmentsPage;