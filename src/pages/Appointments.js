import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Search
} from 'lucide-react';

function Appointments() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [patientFilter, setPatientFilter] = useState('');
  const navigate = useNavigate();

  const appointments = {
    upcoming: [
      { id: 1, patient: 'John Doe', date: new Date().toISOString().split('T')[0], time: '10:00 AM', type: 'Checkup', status: 'Upcoming' },
      { id: 2, patient: 'Jane Smith', date: new Date().toISOString().split('T')[0], time: '2:00 PM', type: 'Consultation', status: 'Upcoming' },
      { id: 4, patient: 'Alice Johnson', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '9:30 AM', type: 'Follow-up', status: 'Scheduled' },
    ],
    past: [
      { id: 3, patient: 'Robert Brown', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], time: '11:00 AM', type: 'Therapy', status: 'Completed' },
    ],
    cancelled: [
      { id: 5, patient: 'David Wilson', date: new Date(Date.now() - 172800000).toISOString().split('T')[0], time: '3:00 PM', type: 'Consultation', status: 'Cancelled' },
    ],
  };

  const formatDate = (date) => date.toISOString().split('T')[0];

  const filteredAppointments = appointments[selectedTab]
    .filter(a => a.date === formatDate(selectedDate))
    .filter(a => a.patient.toLowerCase().includes(patientFilter.toLowerCase()));

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const renderCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    // Previous month days
    const prevMonthDays = [];
    const prevMonthDaysCount = firstDayOfMonth;
    const prevMonthLastDay = getDaysInMonth(year, month - 1);
    
    for (let i = prevMonthLastDay - prevMonthDaysCount + 1; i <= prevMonthLastDay; i++) {
      prevMonthDays.push(
        <button 
          key={`prev-${i}`} 
          className="p-2 rounded-lg text-sm text-gray-400 hover:bg-gray-50"
          disabled
        >
          {i}
        </button>
      );
    }
    
    // Current month days
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      const hasAppointments = appointments.upcoming.concat(appointments.past, appointments.cancelled)
        .some(a => a.date === formatDate(currentDate));
      const isSelected = i === selectedDate.getDate();
      const isToday = formatDate(currentDate) === formatDate(new Date());
      
      currentMonthDays.push(
        <button
          key={`current-${i}`}
          onClick={() => setSelectedDate(currentDate)}
          className={`p-2 rounded-lg text-sm relative ${
            isSelected 
              ? "bg-emerald-600 text-white" 
              : hasAppointments
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "hover:bg-gray-50 text-gray-700"
          }`}
        >
          {i}
          {hasAppointments && !isSelected && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500"></div>
          )}
          {isToday && !isSelected && (
            <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-600"></div>
          )}
        </button>
      );
    }
    
    // Next month days
    const nextMonthDays = [];
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const remainingDays = 42 - totalDays; // 6 weeks
    
    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push(
        <button 
          key={`next-${i}`} 
          className="p-2 rounded-lg text-sm text-gray-400 hover:bg-gray-50"
          disabled
        >
          {i}
        </button>
      );
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  const handleAppointmentClick = (appointmentId) => {
    navigate(`/transcribe/${appointmentId}`);
  };

  return (
    <div className="flex  p-6 gap-6">
      {/* Calendar Section - Wider */}
      <div className="w-3/4 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Calendar</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(selectedDate.getMonth() - 1);
                setSelectedDate(newDate);
              }}
              className="p-2 rounded-lg hover:bg-gray-50"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <span className="text-lg font-medium text-gray-700">
              {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(selectedDate.getMonth() + 1);
                setSelectedDate(newDate);
              }}
              className="p-2 rounded-lg hover:bg-gray-50"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {renderCalendarDays()}
        </div>

        

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-800">Today</span>
                <CalendarIcon className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-900 mt-1">
                {appointments.upcoming.filter(a => a.date === formatDate(new Date()))?.length || 0}
              </p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-800">Upcoming</span>
                <Clock className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-900 mt-1">
                {appointments.upcoming.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment List Section - Narrower */}
      <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-100 p-6 max-w-md">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6"> {/* Changed to single flex with gap-3 */}
            {/* Tab Buttons */}
            <button
              onClick={() => setSelectedTab('upcoming')}
              className={`py-2 px-4 rounded-lg font-medium text-sm flex-1 ${
                selectedTab === 'upcoming' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Upcoming
            </button>
            
            <button
              onClick={() => setSelectedTab('past')}
              className={`py-2 px-4 rounded-lg font-medium text-sm flex-1 ${
                selectedTab === 'past' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Past
            </button>
            
            <button
              onClick={() => setSelectedTab('cancelled')}
              className={`py-2 px-4 rounded-lg font-medium text-sm flex-1 ${
                selectedTab === 'cancelled' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Cancelled
            </button>

            {/* Compact Add Button */}
            <button
              className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg shadow-sm transition-colors duration-200 w-10 h-10"
              onClick={() => alert('Add Appointment')}
              title="Add Appointment"
            >
              <Plus className="h-4 w-4" />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 ml-0.5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="mt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search patient..."
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>
        </div>

        {/* Filtered Appointment List - Updated with enhanced hover effects */}
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="flex justify-between items-center p-4 border border-emerald-100 rounded-lg cursor-pointer
                         hover:bg-emerald-50 hover:shadow-md transition-all duration-300 transform 
                         hover:-translate-y-0.5 active:bg-emerald-100"
                onClick={() => handleAppointmentClick(appointment.id)}
              >
                <div>
                  <p className="font-semibold text-gray-900">{appointment.patient}</p>
                  <p className="text-sm text-gray-600">{appointment.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{appointment.time}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    appointment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-600">No appointments found</h3>
              <p className="text-gray-500 mt-1">Try selecting a different date or search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Appointments;