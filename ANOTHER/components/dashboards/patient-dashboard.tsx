import { useState } from "react";
import { Button } from "../ui/button";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { LoginForm } from "../auth/login-form";
import { Calendar, FileText, Home, Settings, User, Activity } from "lucide-react";

export function PatientDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedOut, setIsSignedOut] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const user = auth.currentUser;

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut(auth);
      setIsSignedOut(true);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSignedOut) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      {/* Header */}
      <header className="bg-white shadow-sm w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-brand">Patient Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Welcome, {user?.displayName || "Patient"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={isLoading}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <div className="bg-white shadow-sm border-t w-full">
        <nav className="w-full px-4 sm:px-6 lg:px-8">
          <ul className="flex space-x-8">
            <li>
              <button 
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center py-4 border-b-2 ${activeTab === "dashboard" ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                <Home className="h-5 w-5 mr-2" />
                Dashboard
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("appointments")}
                className={`flex items-center py-4 border-b-2 ${activeTab === "appointments" ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Appointments
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("records")}
                className={`flex items-center py-4 border-b-2 ${activeTab === "records" ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                <FileText className="h-5 w-5 mr-2" />
                Medical Records
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("health")}
                className={`flex items-center py-4 border-b-2 ${activeTab === "health" ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                <Activity className="h-5 w-5 mr-2" />
                Health Metrics
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("profile")}
                className={`flex items-center py-4 border-b-2 ${activeTab === "profile" ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                <User className="h-5 w-5 mr-2" />
                Profile
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Appointments Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-brand pl-4 py-2">
                <p className="font-medium">Dr. Sarah Johnson</p>
                <p className="text-sm text-gray-600">Cardiology</p>
                <p className="text-sm text-gray-600">Tomorrow, 10:00 AM</p>
              </div>
              <div className="border-l-4 border-gray-300 pl-4 py-2">
                <p className="font-medium">Dr. Michael Chen</p>
                <p className="text-sm text-gray-600">General Checkup</p>
                <p className="text-sm text-gray-600">May 15, 2:30 PM</p>
              </div>
            </div>
            <Button className="w-full mt-4 bg-brand hover:bg-brand/90">
              Schedule New Appointment
            </Button>
          </div>

          {/* Medical Records Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Medical Records</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <span>Blood Test Results</span>
                <span className="text-sm text-gray-500">Apr 12, 2023</span>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <span>Annual Physical</span>
                <span className="text-sm text-gray-500">Jan 5, 2023</span>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <span>Vaccination Record</span>
                <span className="text-sm text-gray-500">Nov 20, 2022</span>
              </div>
            </div>
            <Button className="w-full mt-4 bg-brand hover:bg-brand/90">
              View All Records
            </Button>
          </div>

          {/* Prescriptions Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Prescriptions</h2>
            <div className="space-y-4">
              <div className="border p-3 rounded">
                <p className="font-medium">Amoxicillin</p>
                <p className="text-sm text-gray-600">500mg, 3 times daily</p>
                <p className="text-sm text-gray-600">Refills: 1</p>
                <p className="text-sm text-gray-600">Expires: May 30, 2023</p>
              </div>
              <div className="border p-3 rounded">
                <p className="font-medium">Lisinopril</p>
                <p className="text-sm text-gray-600">10mg, once daily</p>
                <p className="text-sm text-gray-600">Refills: 3</p>
                <p className="text-sm text-gray-600">Expires: Dec 15, 2023</p>
              </div>
            </div>
            <Button className="w-full mt-4 bg-brand hover:bg-brand/90">
              Request Refill
            </Button>
          </div>
        </div>

        {/* Health Metrics Section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Health Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">Blood Pressure</p>
              <p className="text-2xl font-bold text-brand">120/80</p>
              <p className="text-xs text-gray-500">Last updated: 2 days ago</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">Heart Rate</p>
              <p className="text-2xl font-bold text-brand">72 bpm</p>
              <p className="text-xs text-gray-500">Last updated: 2 days ago</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">Weight</p>
              <p className="text-2xl font-bold text-brand">68 kg</p>
              <p className="text-xs text-gray-500">Last updated: 1 week ago</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">Blood Glucose</p>
              <p className="text-2xl font-bold text-brand">95 mg/dL</p>
              <p className="text-xs text-gray-500">Last updated: 3 days ago</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 