import { useState } from "react";
import { Button } from "../ui/button";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { LoginForm } from "../auth/login-form";
import { BarChart3, Users, Calendar, Settings, DollarSign, Home, Server } from "lucide-react";

export function AdminDashboard() {
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
          <h1 className="text-2xl font-bold text-brand">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Welcome, {user?.displayName || "Admin"}
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
                onClick={() => setActiveTab("staff")}
                className={`flex items-center py-4 border-b-2 ${activeTab === "staff" ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                <Users className="h-5 w-5 mr-2" />
                Staff
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("patients")}
                className={`flex items-center py-4 border-b-2 ${activeTab === "patients" ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                <Users className="h-5 w-5 mr-2" />
                Patients
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("schedule")}
                className={`flex items-center py-4 border-b-2 ${activeTab === "schedule" ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                <Calendar className="h-5 w-5 mr-2" />
                Schedule
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("reports")}
                className={`flex items-center py-4 border-b-2 ${activeTab === "reports" ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                Reports
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("billing")}
                className={`flex items-center py-4 border-b-2 ${activeTab === "billing" ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                <DollarSign className="h-5 w-5 mr-2" />
                Billing
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("system")}
                className={`flex items-center py-4 border-b-2 ${activeTab === "system" ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-700"}`}
              >
                <Server className="h-5 w-5 mr-2" />
                System
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">Total Patients</h3>
            <p className="text-3xl font-bold text-brand mt-2">1,248</p>
            <p className="text-sm text-green-600 mt-1">↑ 8% from last month</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">Total Doctors</h3>
            <p className="text-3xl font-bold text-brand mt-2">36</p>
            <p className="text-sm text-green-600 mt-1">↑ 2 new this month</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">Appointments</h3>
            <p className="text-3xl font-bold text-brand mt-2">284</p>
            <p className="text-sm text-gray-600 mt-1">This week</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium text-gray-900">Revenue</h3>
            <p className="text-3xl font-bold text-brand mt-2">AED 156,420</p>
            <p className="text-sm text-green-600 mt-1">↑ 12% from last month</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Staff Management Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Staff Management</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Doctors</h3>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Nurses</h3>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Receptionists</h3>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Administrators</h3>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
            </div>
            <Button className="w-full mt-6 bg-brand hover:bg-brand/90">
              Add New Staff Member
            </Button>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-brand pl-4 py-2">
                <p className="font-medium">New Doctor Registered</p>
                <p className="text-sm text-gray-600">Dr. Mariam Al Shamsi - Pediatrics</p>
                <p className="text-xs text-gray-500">Today, 9:45 AM</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="font-medium">System Update Completed</p>
                <p className="text-sm text-gray-600">Electronic Health Records v2.4</p>
                <p className="text-xs text-gray-500">Yesterday, 11:30 PM</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <p className="font-medium">Billing System Alert</p>
                <p className="text-sm text-gray-600">Insurance integration needs attention</p>
                <p className="text-xs text-gray-500">Yesterday, 2:15 PM</p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4 py-2">
                <p className="font-medium">Staff Meeting Scheduled</p>
                <p className="text-sm text-gray-600">Quarterly review - Conference Room A</p>
                <p className="text-xs text-gray-500">Mar 15, 10:00 AM</p>
              </div>
            </div>
            <Button className="w-full mt-4 bg-brand hover:bg-brand/90">
              View All Activity
            </Button>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button className="bg-brand hover:bg-brand/90 h-auto py-4 flex flex-col items-center">
                <span className="text-lg mb-1">👥</span>
                <span>Manage Users</span>
              </Button>
              <Button className="bg-brand hover:bg-brand/90 h-auto py-4 flex flex-col items-center">
                <span className="text-lg mb-1">📊</span>
                <span>Reports</span>
              </Button>
              <Button className="bg-brand hover:bg-brand/90 h-auto py-4 flex flex-col items-center">
                <span className="text-lg mb-1">⚙️</span>
                <span>Settings</span>
              </Button>
              <Button className="bg-brand hover:bg-brand/90 h-auto py-4 flex flex-col items-center">
                <span className="text-lg mb-1">💰</span>
                <span>Billing</span>
              </Button>
              <Button className="bg-brand hover:bg-brand/90 h-auto py-4 flex flex-col items-center">
                <span className="text-lg mb-1">📅</span>
                <span>Schedules</span>
              </Button>
              <Button className="bg-brand hover:bg-brand/90 h-auto py-4 flex flex-col items-center">
                <span className="text-lg mb-1">🏥</span>
                <span>Facilities</span>
              </Button>
            </div>
          </div>
        </div>

        {/* System Status Section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <p className="font-medium">EHR System</p>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Operational</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Last updated: 10 minutes ago</p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <p className="font-medium">Appointment System</p>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Operational</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Last updated: 15 minutes ago</p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <p className="font-medium">Billing System</p>
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Maintenance</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Scheduled: Today, 11 PM - 2 AM</p>
            </div>
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <p className="font-medium">Lab Integration</p>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Operational</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Last updated: 30 minutes ago</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 