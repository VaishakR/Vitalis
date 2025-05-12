import React from 'react';
import './Dashboard.css';
import { FaCalendarCheck, FaUserInjured, FaChartLine, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();

  const handleAppointmentClick = (appointmentId) => {
    navigate(`/transcribe/${appointmentId}`);
  };

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>
      
      <div className="stats-container">
      <div className="stat-card">
          <div className="stat-icon">
            <FaChartLine />
          </div>
          <div className="stat-info">
            <h3>Appointments Completed</h3>
            <p className="stat-value">5 / 8</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaUserInjured />
          </div>
          <div className="stat-info">
            <h3>Patients Waiting Now</h3>
            <p className="stat-value">3</p>
          </div>
        </div>



        <div className="stat-card">
          <div className="stat-icon">
            <FaCalendarCheck />
          </div>
          <div className="stat-info">
            <h3>Next Appointment In</h3>
            <p className="stat-value">12 min</p>
          </div>
        </div>
      </div>

      
      <div className="dashboard-content">
        <div className="upcoming-appointments card">
          <h2>Upcoming Appointments</h2>
          <div className="appointment-list">
            <div 
              className="appointment-item cursor-pointer hover:bg-emerald-50 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:bg-emerald-100" 
              onClick={() => handleAppointmentClick('app1')}
            >
              <div className="appointment-time">10:00 AM</div>
              <div className="appointment-details">
                <h3>John Doe</h3>
                <p>General Checkup</p>
              </div>
              <div className="appointment-status">Confirmed</div>
            </div>
            
            <div 
              className="appointment-item cursor-pointer hover:bg-emerald-50 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:bg-emerald-100"
              onClick={() => handleAppointmentClick('app2')}
            >
              <div className="appointment-time">11:30 AM</div>
              <div className="appointment-details">
                <h3>Jane Smith</h3>
                <p>Follow-up</p>
              </div>
              <div className="appointment-status">Confirmed</div>
            </div>
            
            <div 
              className="appointment-item cursor-pointer hover:bg-emerald-50 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 active:bg-emerald-100"
              onClick={() => handleAppointmentClick('app3')}
            >
              <div className="appointment-time">2:00 PM</div>
              <div className="appointment-details">
                <h3>Robert Johnson</h3>
                <p>Blood Test Results</p>
              </div>
              <div className="appointment-status">Pending</div>
            </div>
          </div>
        </div>
        
        <div className="patient-analytics card">
          <h2>Patient Analytics</h2>
          <div className="analytics-chart">
            <div className="chart-placeholder">
              <div className="bar" style={{ height: '60%' }}></div>
              <div className="bar" style={{ height: '80%' }}></div>
              <div className="bar" style={{ height: '40%' }}></div>
              <div className="bar" style={{ height: '70%' }}></div>
              <div className="bar" style={{ height: '50%' }}></div>
              <div className="bar" style={{ height: '90%' }}></div>
              <div className="bar" style={{ height: '75%' }}></div>
            </div>
            <div className="chart-labels">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="notifications card">
        <h2>Recent Notifications</h2>
        <div className="notification-list">
          <div className="notification-item">
            <div className="notification-icon">
              <FaBell />
            </div>
            <div className="notification-content">
              <p>New appointment request from <strong>Emily Wilson</strong></p>
              <span className="notification-time">10 minutes ago</span>
            </div>
          </div>
          
          <div className="notification-item">
            <div className="notification-icon">
              <FaBell />
            </div>
            <div className="notification-content">
              <p>Lab results for <strong>Michael Brown</strong> are ready</p>
              <span className="notification-time">1 hour ago</span>
            </div>
          </div>
          
          <div className="notification-item">
            <div className="notification-icon">
              <FaBell />
            </div>
            <div className="notification-content">
              <p><strong>Sarah Johnson</strong> canceled her appointment</p>
              <span className="notification-time">Yesterday</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
