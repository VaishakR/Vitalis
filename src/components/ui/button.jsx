import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Patients from './pages/Patients';
import Settings from './pages/Settings';
import VoiceTranscription from './pages/VoiceTranscription'; // Make sure this points to your newly created file
import EMRFormWrapper from './pages/EMRFormWrapper';  // Make sure this points to your newly created file
import Navbar from './components/Navbar';

export function Button({ 
  children, 
  className, 
  variant = 'default', 
  size = 'default', 
  onClick, 
  disabled = false,
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    default: "bg-slate-900 text-white hover:bg-slate-800",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-100",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    ghost: "hover:bg-slate-100 hover:text-slate-900",
    link: "text-slate-900 underline-offset-4 hover:underline"
  };
  
  const sizes = {
    default: "h-10 py-2 px-4 text-sm",
    sm: "h-9 px-3 rounded-md text-xs",
    lg: "h-11 px-8 rounded-md"
  };
  
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}