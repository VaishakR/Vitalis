import { NavLink, Outlet } from 'react-router-dom';
import { 
  User, 
  Lock, 
  Bell, 
  Palette,
  ChevronRight
} from 'lucide-react';

function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl">

      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="grid grid-cols-1 gap-4">
        {/* Navigation Cards */}
        <NavLink 
          to="personal" 
          className={({ isActive }) => 
            `p-5 rounded-xl border hover:shadow-md transition-all ${isActive ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`
          }
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Personal Information</h2>
                <p className="text-sm text-gray-500">Update your profile details</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </NavLink>

        <NavLink 
          to="security" 
          className={({ isActive }) => 
            `p-5 rounded-xl border hover:shadow-md transition-all ${isActive ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`
          }
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg text-green-600">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Security</h2>
                <p className="text-sm text-gray-500">Password and authentication</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </NavLink>

        <NavLink 
          to="notifications" 
          className={({ isActive }) => 
            `p-5 rounded-xl border hover:shadow-md transition-all ${isActive ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`
          }
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Notifications</h2>
                <p className="text-sm text-gray-500">Manage your alerts</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </NavLink>

        <NavLink 
          to="preferences" 
          className={({ isActive }) => 
            `p-5 rounded-xl border hover:shadow-md transition-all ${isActive ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`
          }
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Preferences</h2>
                <p className="text-sm text-gray-500">Appearance and language</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </NavLink>
      </div>

      {/* This will render the nested routes */}
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}

export default SettingsPage;