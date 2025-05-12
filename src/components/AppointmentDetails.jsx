import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, Activity, ArrowLeft, Edit, Save, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const AppointmentDetails = ({ appointment, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    patientName: appointment?.patientName || '',
    date: appointment?.date || '',
    time: appointment?.time || '',
    duration: appointment?.duration || 30,
    reason: appointment?.reason || '',
    notes: appointment?.notes || '',
    status: appointment?.status || 'scheduled'
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = () => {
    onUpdate({ ...appointment, ...formData });
    setIsEditing(false);
  };
  
  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    { value: 'no-show', label: 'No Show', color: 'bg-yellow-100 text-yellow-800' }
  ];
  
  const getStatusBadge = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusOption?.color || 'bg-gray-100 text-gray-800'}`}>
        {statusOption?.label || 'Unknown'}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-4 flex justify-between items-center text-white">
          <button 
            onClick={onClose} 
            className="rounded-full p-2 hover:bg-emerald-700 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold">Appointment Details</h2>
          <div className="flex space-x-2">
            {isEditing ? (
              <button 
                onClick={handleSubmit} 
                className="rounded-full p-2 hover:bg-emerald-700 transition-colors"
                aria-label="Save changes"
              >
                <Save size={20} />
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="rounded-full p-2 hover:bg-emerald-700 transition-colors"
                  aria-label="Edit appointment"
                >
                  <Edit size={20} />
                </button>
                <button 
                  onClick={() => onDelete(appointment.id)} 
                  className="rounded-full p-2 hover:bg-red-500 transition-colors"
                  aria-label="Delete appointment"
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Patient Name</label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason for Visit</label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center">
                <User className="text-gray-400 mr-3" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="font-medium">{appointment.patientName}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="text-gray-400 mr-3" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-medium">
                    {appointment.date}, {appointment.time} ({appointment.duration} minutes)
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Activity className="text-gray-400 mr-3" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Reason for Visit</p>
                  <p className="font-medium">{appointment.reason}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="text-gray-400 mr-3" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  {getStatusBadge(appointment.status)}
                </div>
              </div>
              
              {appointment.notes && (
                <div className="flex">
                  <FileText className="text-gray-400 mr-3 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="whitespace-pre-wrap">{appointment.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;