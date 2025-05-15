// src/components/Navbar.jsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const doctorName = 'Dr. John Smith';
  const [activeLink, setActiveLink] = useState(() => {
    // Initialize active link based on current location
    const current = navLinks.find(link => link.href === location.pathname);
    return current ? current.name : 'Dashboard';
  });

  const handleLogout = () => {
    alert('Logged out'); // Replace with actual logout logic
  };

  const handleNavigation = (name, href) => {
    setActiveLink(name);
    navigate(href);
  };

  return (
    <div className="fixed top-6 left-6 bottom-6 w-64 z-50 bg-[#5eb9ae]/70 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/15 flex flex-col justify-between p-6">
      {/* Top Section */}
      <div>
        <div className="flex items-center gap-3 text-2xl font-bold text-white">
          Vitalis
        </div>
        <div className="text-white text-sm mt-1 text-left">Doctor's dashboard</div>
        <div className="border-b border-white/30 my-4"></div>
        <div className="mb-8"></div>
        
        {/* Navigation Links */}
        <div className="flex flex-col space-y-4">
          {navLinks.map(({ name, href, icon: Icon }) => (
            <button
              key={name}
              onClick={() => handleNavigation(name, href)}
              className={`flex items-center gap-3 font-medium tracking-wide transition duration-300 p-2 rounded-lg ${
                activeLink === name
                  ? 'text-[#0b5e58] bg-white' // Active state styles
                  : 'text-white hover:text-[#0b5e58] hover:bg-white/30' // Inactive state styles
              }`}
            >
              <Icon className="w-5 h-5" />
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 bg-[#0c8378]/80 text-white shadow-lg border border-white/20 backdrop-blur-md hover:bg-[#0c8378]/90 font-medium tracking-wide transition duration-300 px-4 py-2 rounded-xl"
      >
        <FaSignOutAlt className="w-5 h-5" />
        Logout
      </button>
    </div>
  );
};

export default Navbar;
