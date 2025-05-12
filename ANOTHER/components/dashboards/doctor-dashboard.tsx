import { useState } from "react";
import { Button } from "../ui/button";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { LoginForm } from "../auth/login-form";
import { 
  Calendar, 
  ClipboardList, 
  Home, 
  Settings, 
  Users, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  Plus,
  FileText,
  Bell,
  Mail
} from "lucide-react";
import { SessionPage } from "../session/session-page";

interface Appointment {
  time: string;
  name: string;
  type: string;
  status: string;
}

interface AppointmentData {
  [key: string]: Appointment[];
}

export function DoctorDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedOut, setIsSignedOut] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const user = auth.currentUser;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [patientFilter, setPatientFilter] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [activeSession, setActiveSession] = useState<{
    patientName: string;
    appointmentTime: string;
    appointmentType: string;
  } | null>(null);

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

  const getDummyAppointments = (date: Date) => {
    // This is dummy data - in real app, this would come from an API
    const dummyData: AppointmentData = {
      "2025-03-15": [
        { time: "10:00 AM", name: "Ahmed Al Mansouri", type: "Follow-up", status: "Upcoming" },
        { time: "11:30 AM", name: "Fatima Al Zaabi", type: "New Patient", status: "Upcoming" },
      ],
      "2025-03-16": [
        { time: "09:00 AM", name: "Sara Al Qasimi", type: "Follow-up", status: "Upcoming" },
        { time: "02:00 PM", name: "Khalid Al Mazrouei", type: "Consultation", status: "Scheduled" },
      ],
      "2025-03-18": [
        { time: "10:30 AM", name: "Mohammed Al Hashimi", type: "Follow-up", status: "Upcoming" },
      ],
    };

    const dateString = date.toISOString().split('T')[0];
    return dummyData[dateString] || [];
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Today's Appointments</h3>
                  <Calendar className="h-5 w-5 text-brand" />
                </div>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-green-600 mt-1">↑ 2 more than yesterday</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Pending Reports</h3>
                  <ClipboardList className="h-5 w-5 text-brand" />
                </div>
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="text-sm text-red-600 mt-1">↓ 3 from yesterday</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Total Patients</h3>
                  <Users className="h-5 w-5 text-brand" />
                </div>
                <p className="text-2xl font-bold text-gray-900">248</p>
                <p className="text-sm text-green-600 mt-1">↑ 12 new this month</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Next Appointment</h3>
                  <Clock className="h-5 w-5 text-brand" />
                </div>
                <p className="text-2xl font-bold text-gray-900">10:30 AM</p>
                <p className="text-sm text-gray-600 mt-1">Ahmed Al Mansouri</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Schedule */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Ahmed Al Mansouri</p>
                        <p className="text-sm text-gray-500">10:00 AM - Follow-up</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Cardiology</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Fatima Al Zaabi</p>
                        <p className="text-sm text-gray-500">11:30 AM - New Patient</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Cardiology</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Mohammed Al Hashimi</p>
                        <p className="text-sm text-gray-500">2:00 PM - Consultation</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Cardiology</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100">
                  <Button className="w-full bg-brand hover:bg-brand/90 rounded-lg">
                    View Full Schedule
                  </Button>
                </div>
              </div>

              {/* Recent Patients */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Patients</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Sara Al Qasimi</p>
                        <p className="text-sm text-gray-500">Last visit: Yesterday</p>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-full">
                        View
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Khalid Al Mazrouei</p>
                        <p className="text-sm text-gray-500">Last visit: 3 days ago</p>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-full">
                        View
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Aisha Al Suwaidi</p>
                        <p className="text-sm text-gray-500">Last visit: 1 week ago</p>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-full">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100">
                  <Button className="w-full bg-brand hover:bg-brand/90 rounded-lg">
                    View All Patients
                  </Button>
                </div>
              </div>

              {/* Tasks */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">Review lab results for Ahmed Al Mansouri</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">Complete medical report for insurance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm text-gray-600">Follow up with hospital about referral</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm text-gray-600">Prepare presentation for medical conference</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm text-gray-600">Review new treatment guidelines</span>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add new task..." 
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                    <Button className="bg-brand hover:bg-brand/90 rounded-lg">
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Practice Statistics */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Practice Statistics</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Patients This Week</p>
                    <p className="text-2xl font-bold text-gray-900">24</p>
                    <p className="text-xs text-green-600 mt-1">↑ 12% from last week</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Avg. Appointment Time</p>
                    <p className="text-2xl font-bold text-gray-900">28 min</p>
                    <p className="text-xs text-red-600 mt-1">↓ 5% from last week</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Prescriptions Issued</p>
                    <p className="text-2xl font-bold text-gray-900">18</p>
                    <p className="text-xs text-gray-500 mt-1">Same as last week</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Referrals Made</p>
                    <p className="text-2xl font-bold text-gray-900">7</p>
                    <p className="text-xs text-green-600 mt-1">↑ 16% from last week</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case "patients":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand w-80"
                  />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>
              <Button className="bg-brand hover:bg-brand/90">
                <Plus className="h-4 w-4 mr-2" />
                Add New Patient
              </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Name</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Age</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Last Visit</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { name: "Ahmed Al Mansouri", age: 45, lastVisit: "Today", status: "Active" },
                      { name: "Fatima Al Zaabi", age: 32, lastVisit: "Yesterday", status: "Active" },
                      { name: "Mohammed Al Hashimi", age: 28, lastVisit: "2 days ago", status: "Pending" },
                      { name: "Sara Al Qasimi", age: 39, lastVisit: "1 week ago", status: "Active" },
                      { name: "Khalid Al Mazrouei", age: 52, lastVisit: "2 weeks ago", status: "Inactive" },
                    ].map((patient, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{patient.name}</div>
                        </td>
                        <td className="p-4 text-gray-600">{patient.age}</td>
                        <td className="p-4 text-gray-600">{patient.lastVisit}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            patient.status === "Active" ? "bg-green-100 text-green-800" :
                            patient.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {patient.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <FileText className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Mail className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Bell className="h-4 w-4 text-gray-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Showing 5 of 248 patients</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm">Next</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "appointments":
        const appointments = getDummyAppointments(selectedDate);
        const filteredAppointments = appointments.filter((apt: Appointment) => 
          apt.name.toLowerCase().includes(patientFilter.toLowerCase()) &&
          (filterType === "all" || apt.status.toLowerCase() === filterType.toLowerCase())
        );

        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">Appointments Calendar</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search patient name..."
                      value={patientFilter}
                      onChange={(e) => setPatientFilter(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand w-60"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  >
                    <option value="all">All Status</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <Button className="bg-brand hover:bg-brand/90 ml-4">
                  <Plus className="h-4 w-4 mr-2" />
                  New Appointment
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
                {/* Quick Stats - New Format */}
                <div className="grid grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-500">Today's Appointments</h3>
                      <Calendar className="h-5 w-5 text-brand" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                    <p className="text-sm text-green-600 mt-1">↑ 2 more than yesterday</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-500">Pending Reports</h3>
                      <ClipboardList className="h-5 w-5 text-brand" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">5</p>
                    <p className="text-sm text-red-600 mt-1">↓ 3 from yesterday</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-500">Total Patients</h3>
                      <Users className="h-5 w-5 text-brand" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">248</p>
                    <p className="text-sm text-green-600 mt-1">↑ 12 new this month</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-500">Next Appointment</h3>
                      <Clock className="h-5 w-5 text-brand" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">10:30 AM</p>
                    <p className="text-sm text-gray-600 mt-1">Ahmed Al Mansouri</p>
                  </div>
                </div>

                {/* Calendar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const newDate = new Date(selectedDate);
                          newDate.setMonth(selectedDate.getMonth() - 1);
                          setSelectedDate(newDate);
                        }}
                      >
                        Previous
                      </Button>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const newDate = new Date(selectedDate);
                          newDate.setMonth(selectedDate.getMonth() + 1);
                          setSelectedDate(newDate);
                        }}
                      >
                        Next
                      </Button>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day} className="text-sm font-medium text-gray-500 py-2">{day}</div>
                      ))}
                      {Array.from({ length: 31 }, (_, i) => {
                        const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i + 1);
                        const hasAppointments = getDummyAppointments(currentDate).length > 0;
                        const isSelected = i + 1 === selectedDate.getDate();
                        const isToday = new Date().toDateString() === currentDate.toDateString();

                        return (
                          <button
                            key={i}
                            onClick={() => setSelectedDate(currentDate)}
                            className={`p-2 rounded-lg text-sm relative ${
                              isSelected 
                                ? "bg-brand text-white" 
                                : hasAppointments
                                ? "bg-green-50 text-green-700 hover:bg-green-100"
                                : "hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            {i + 1}
                            {hasAppointments && !isSelected && (
                              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-green-500"></div>
                            )}
                            {isToday && !isSelected && (
                              <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-brand"></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Today's Appointments */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Appointments for {selectedDate.toLocaleDateString()}
                  </h3>
                  <div className="space-y-4">
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((appointment: Appointment, index: number) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{appointment.time}</p>
                              <p className="text-sm text-gray-600">{appointment.name}</p>
                              <p className="text-xs text-gray-500">{appointment.type}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              appointment.status === "Upcoming" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs w-full"
                              onClick={() => {
                                // Handle patient details view
                              }}
                            >
                              Patient Details
                            </Button>
                            {appointment.status === "Upcoming" && (
                              <Button 
                                className="text-xs w-full bg-green-600 hover:bg-green-700 text-white"
                                size="sm"
                                onClick={() => {
                                  setActiveSession({
                                    patientName: appointment.name,
                                    appointmentTime: appointment.time,
                                    appointmentType: appointment.type
                                  });
                                }}
                              >
                                Start Session
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        No appointments found for this date
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "records":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search medical records..."
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand w-80"
                  />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filter Records
                </Button>
              </div>
              <Button className="bg-brand hover:bg-brand/90">
                <Plus className="h-4 w-4 mr-2" />
                New Record
              </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Patient Name</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Record Type</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { name: "Ahmed Al Mansouri", type: "Lab Results", date: "Today", status: "Pending Review" },
                      { name: "Fatima Al Zaabi", type: "Prescription", date: "Yesterday", status: "Completed" },
                      { name: "Mohammed Al Hashimi", type: "Medical History", date: "2 days ago", status: "Completed" },
                      { name: "Sara Al Qasimi", type: "Lab Results", date: "1 week ago", status: "Completed" },
                      { name: "Khalid Al Mazrouei", type: "Prescription", date: "2 weeks ago", status: "Completed" },
                    ].map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{record.name}</div>
                        </td>
                        <td className="p-4 text-gray-600">{record.type}</td>
                        <td className="p-4 text-gray-600">{record.date}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            record.status === "Completed" ? "bg-green-100 text-green-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <FileText className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Mail className="h-4 w-4 text-gray-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="max-w-3xl space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.displayName || ""}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email || ""}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                  <input
                    type="text"
                    defaultValue="Cardiology"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                </div>
                <Button className="bg-brand hover:bg-brand/90 mt-4">
                  Save Changes
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Email Notifications</p>
                    <p className="text-sm text-gray-500">Receive email about your appointments</p>
                  </div>
                  <div className="h-6 w-11 rounded-full bg-brand relative cursor-pointer">
                    <div className="h-4 w-4 rounded-full bg-white absolute top-1 right-1"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">SMS Notifications</p>
                    <p className="text-sm text-gray-500">Receive SMS about your appointments</p>
                  </div>
                  <div className="h-6 w-11 rounded-full bg-gray-200 relative cursor-pointer">
                    <div className="h-4 w-4 rounded-full bg-white absolute top-1 left-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {activeSession ? (
        <SessionPage 
          patientName={activeSession.patientName}
          appointmentTime={activeSession.appointmentTime}
          appointmentType={activeSession.appointmentType}
          onClose={() => setActiveSession(null)}
        />
      ) : (
        <div className="min-h-screen flex flex-col w-full">
          {/* Header */}
          <header className="bg-white shadow-sm w-full sticky top-0 z-10">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-brand">Vitalis</h1>
                <span className="text-gray-400">|</span>
                <span className="text-gray-600">Doctor Dashboard</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Online</span>
                </div>
                <span className="text-gray-600">
                  Dr. {user?.displayName || "User"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="rounded-full"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          {/* Navigation Bar */}
          <div className="bg-white shadow-sm border-t w-full sticky top-[72px] z-10">
            <nav className="w-full px-4 sm:px-6 lg:px-8">
              <ul className="flex space-x-8">
                <li>
                  <button 
                    onClick={() => setActiveTab("dashboard")}
                    className={`flex items-center py-4 border-b-2 transition-colors ${
                      activeTab === "dashboard" 
                        ? "border-brand text-brand" 
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Home className="h-5 w-5 mr-2" />
                    Dashboard
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab("patients")}
                    className={`flex items-center py-4 border-b-2 transition-colors ${
                      activeTab === "patients" 
                        ? "border-brand text-brand" 
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Patients
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab("appointments")}
                    className={`flex items-center py-4 border-b-2 transition-colors ${
                      activeTab === "appointments" 
                        ? "border-brand text-brand" 
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Appointments
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab("records")}
                    className={`flex items-center py-4 border-b-2 transition-colors ${
                      activeTab === "records" 
                        ? "border-brand text-brand" 
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <ClipboardList className="h-5 w-5 mr-2" />
                    Medical Records
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab("settings")}
                    className={`flex items-center py-4 border-b-2 transition-colors ${
                      activeTab === "settings" 
                        ? "border-brand text-brand" 
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    Settings
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">
            {renderTabContent()}
          </main>
        </div>
      )}
    </>
  );
} 