// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import {
  FaChartLine,
  FaCalendarAlt,
  FaUserInjured,
  FaCog,
  FaSignOutAlt,
} from 'react-icons/fa';

const navLinks = [
  { name: 'Dashboard', href: '/', icon: FaChartLine },
  { name: 'Appointments', href: '/appointments', icon: FaCalendarAlt },
  { name: 'Patients', href: '/patients', icon: FaUserInjured },
  { name: 'Settings', href: '/settings', icon: FaCog },
];

const Navbar = () => {
  const location = useLocation();
  const doctorName = 'Dr. John Smith';

  const handleLogout = () => {
    alert('Logged out'); // Replace with actual logout logic
  };

  return (
    <div className="fixed top-6 left-6 bottom-6 w-64 z-50 bg-white/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/15 flex flex-col justify-between p-6">
      {/* Header */}
      <div>
        <div className="flex flex-col text-xl font-semibold text-[#0b5e58] mb-8">
          <span>Vitalis</span>
          <span className="text-sm font-normal text-[#0c8378]">Doctor's Dashboard</span>
          <span className="mt-2 text-base font-medium text-[#0c8378]">Welcome, {doctorName}</span>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col space-y-4">
          {navLinks.map(({ name, href, icon: Icon }) => (
            <Link
              key={name}
              to={href}
              className={`flex items-center gap-3 text-[#0c8378] hover:text-[#0b5e58] font-medium tracking-wide transition duration-300 p-2 rounded-lg hover:bg-[#0c8378]/10 ${
                location.pathname === href ? 'bg-[#0c8378]/10 text-[#0b5e58]' : ''
              }`}
            >
              <Icon className="w-5 h-5" />
              {name}
            </Link>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 bg-[#0c8378]/60 text-white shadow-lg border border-white/20 backdrop-blur-md hover:bg-[#0c8378]/80 font-medium tracking-wide transition duration-300 px-4 py-2 rounded-xl"
      >
        <FaSignOutAlt className="w-5 h-5" />
        Logout
      </button>
    </div>
  );
};

export default Navbar;
