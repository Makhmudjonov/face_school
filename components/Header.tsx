import React, { useState, useRef, useEffect } from 'react';
import { Menu, Sun, Moon, LogOut, User, Bell, ChevronDown } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  onLogout: () => void;
  toggleSidebar: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  onLogout, 
  toggleSidebar, 
  isDarkMode, 
  toggleTheme,
  title
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-20 transition-colors duration-200 sticky top-0">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-slate-800 dark:text-white hidden sm:block">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-full transition-colors"
          title={isDarkMode ? "Yorug' rejim" : "Tungi rejim"}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        {/* Notification */}
        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-full transition-colors relative">
           <Bell className="w-5 h-5" />
           <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
        </button>

        {/* Vertical Divider */}
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xs overflow-hidden border border-primary-200 dark:border-primary-800">
              {user?.image_url ? (
                  <img src={user.image_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                  <span>{user?.firstName ? user.firstName[0].toUpperCase() : (user?.username?.[0]?.toUpperCase() || 'A')}</span>
              )}
            </div>
            <div className="hidden md:block text-left">
               <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-none">
                 {user?.firstName} {user?.lastName}
               </p>
               <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize leading-none">
                 {user?.role}
               </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''} hidden md:block`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 transform origin-top-right transition-all">
                 <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 md:hidden">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                      {user?.role}
                    </p>
                 </div>
                 
                 <div className="px-2 py-1">
                    <button className="flex items-center w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium">
                       <User className="w-4 h-4 mr-3" />
                       Mening Profilim
                    </button>
                    <button className="flex items-center w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium">
                       <Bell className="w-4 h-4 mr-3" />
                       Xabarnomalar
                    </button>
                 </div>
                 
                 <div className="border-t border-slate-100 dark:border-slate-800 my-1 mx-2"></div>
                 
                 <div className="px-2 py-1">
                    <button 
                      onClick={onLogout}
                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
                    >
                       <LogOut className="w-4 h-4 mr-3" />
                       Tizimdan chiqish
                    </button>
                 </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};