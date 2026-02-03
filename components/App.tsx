
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Login } from './components/Login';
import { DashboardView } from './components/DashboardView';
import { StudentMonitoring } from './components/StudentMonitoring';
import { SettingsView } from './components/SettingsView';
import { BuildingsView } from './components/BuildingsView';
import { StudentsView } from './components/StudentsView';
import { ClassesView } from './components/ClassesView';
import { EmployeesView } from './components/EmployeesView';
import { DepartmentsView } from './components/DepartmentsView';
import { EmployeeMonitoring } from './components/EmployeeMonitoring';
import { AccessControlView } from './components/AccessControlView';
import { LogsView } from './components/LogsView';
import { DevicesView } from './components/DevicesView';
import { UserProfile } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token: string) => {
      if (token === 'demo_mock_token') {
          setUser({
              id: 1,
              username: 'admin',
              firstName: 'Demo',
              lastName: 'Admin',
              email: 'admin@educontrol.uz',
              role: 'admin',
              can_login: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              employee_id: null,
              personId: null,
              phone: '998901234567',
              gender: '1',
              date_of_birth: null,
              age: null,
              groupId: null,
              school: 'Bosh Ofis',
              image: null,
              image_url: null,
              startDate: null,
              endDate: null,
          });
          return;
      }

      try {
          const response = await fetch('https://hik-test.tashmeduni.uz/api/v1/auth/profile/', {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'accept': 'application/json'
              }
          });

          if (response.ok) {
              const userData = await response.json();
              setUser(userData);
          } else {
              if (response.status === 401) {
                  handleLogout();
              }
          }
      } catch (error) {
          console.error("Failed to fetch user profile:", error);
          handleLogout();
      }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    const token = localStorage.getItem('access_token');
    if (token) {
        fetchUserProfile(token);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    setCurrentView('dashboard');
    setUser(null);
  };

  const getPageTitle = (view: string) => {
    switch (view) {
        case 'dashboard': return 'Bosh sahifa';
        case 'student-monitoring': return 'Foydalanuvchilar Nazorati';
        case 'settings': return 'Sozlamalar';
        case 'buildings': return 'Tuzilma va Qurilmalar';
        case 'devices': return 'Qurilmalar';
        case 'students': return 'Foydalanuvchilar Ro\'yxati';
        case 'classes': return 'Guruhlar';
        case 'employees': return 'Xodimlar Ro\'yxati';
        case 'departments': return 'Bo\'limlar';
        case 'employee-monitoring': return 'Xodimlar Nazorati';
        case 'access-control': return 'Eshiklar Nazorati';
        case 'logs': return 'Tizim Loglari';
        default: return 'Nazorat Tizimi';
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'student-monitoring':
        return <StudentMonitoring />;
      case 'settings':
        return <SettingsView 
          user={user} 
          onProfileUpdate={() => fetchUserProfile(localStorage.getItem('access_token')!)} 
        />;
      case 'buildings':
        return <BuildingsView />;
      case 'devices':
        return <DevicesView />;
      case 'students':
        return <StudentsView />;
      case 'classes':
        return <ClassesView />;
      case 'employees':
        return <EmployeesView />;
      case 'departments':
        return <DepartmentsView />;
      case 'employee-monitoring':
        return <EmployeeMonitoring />;
      case 'access-control':
        return <AccessControlView />;
      case 'logs':
        return <LogsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header 
            user={user}
            onLogout={handleLogout}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isDarkMode={isDarkMode}
            toggleTheme={toggleTheme}
            title={getPageTitle(currentView)}
        />

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
            <div className="max-w-7xl mx-auto">
                {renderView()}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
