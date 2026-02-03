
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  ClipboardCheck, 
  UserCheck, 
  Settings, 
  School,
  Building2,
  ChevronDown,
  ChevronRight,
  List,
  BookOpen,
  Briefcase,
  Key,
  History
} from 'lucide-react';
import { NavItem } from '../types';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Bosh sahifa', icon: LayoutDashboard, view: 'dashboard' },
  { 
    id: 'students-group', 
    label: "O'quvchilar", 
    icon: GraduationCap, 
    children: [
      { id: 'students', label: "O'quvchilar ro'yxati", icon: Users, view: 'students' },
      { id: 'classes', label: "Sinflar", icon: BookOpen, view: 'classes' },
      { id: 'student-monitoring', label: "Davomat nazorati", icon: ClipboardCheck, view: 'student-monitoring' }
    ]
  },
  { 
    id: 'employees-group', 
    label: "Xodimlar", 
    icon: UserCheck, 
    children: [
      { id: 'employees', label: "Xodimlar ro'yxati", icon: List, view: 'employees' },
      { id: 'departments', label: "Bo'limlar", icon: Briefcase, view: 'departments' },
      { id: 'employee-monitoring', label: "Davomat nazorati", icon: ClipboardCheck, view: 'employee-monitoring' }
    ]
  },
  { id: 'access-control', label: 'Eshiklar nazorati', icon: Key, view: 'access-control' },
  { id: 'logs', label: 'Tizim loglari', icon: History, view: 'logs' },
  { id: 'buildings', label: 'Binolar va Qurilmalar', icon: Building2, view: 'buildings' },
  { id: 'devices', label: 'Qurilmalar', icon: Settings, view: 'devices' }, 
  { id: 'settings', label: 'Sozlamalar', icon: Settings, view: 'settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, setIsOpen }) => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  useEffect(() => {
    const activeGroup = navItems.find(item => 
      item.children?.some(child => child.view === currentView)
    );
    if (activeGroup && !expandedGroups.includes(activeGroup.id)) {
      setExpandedGroups(prev => [...prev, activeGroup.id]);
    }
  }, [currentView]);

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => 
      prev.includes(id) ? prev.filter(groupId => groupId !== id) : [...prev, id]
    );
  };

  const isChildActive = (item: NavItem) => item.view === currentView;
  const isGroupActive = (item: NavItem) => item.children?.some(child => child.view === currentView);

  return (
    <>
      <div 
        className={`fixed inset-0 z-20 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-0 shadow-2xl lg:shadow-none flex flex-col border-r border-slate-800 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800 shrink-0">
          <div className="p-1.5 bg-primary-600 rounded-lg shadow-lg shadow-primary-900/50">
            <School className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">EduControl</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Maktab Tizimi</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {navItems.map((item) => {
            if (item.children) {
              const isExpanded = expandedGroups.includes(item.id);
              const active = isGroupActive(item);
              
              return (
                <div key={item.id} className="mb-1">
                  <button
                    onClick={() => toggleGroup(item.id)}
                    className={`flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
                      active || isExpanded
                        ? 'text-white bg-slate-800/80' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className={`w-5 h-5 mr-3 transition-colors ${active ? 'text-primary-400' : 'text-slate-500 group-hover:text-white'}`} />
                      {item.label}
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                  </button>
                  
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded ? 'max-h-48 opacity-100 mt-1' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="ml-3 pl-3 border-l border-slate-700 space-y-1 my-1">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => {
                            setCurrentView(child.view!);
                            setIsOpen(false);
                          }}
                          className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isChildActive(child)
                              ? 'bg-primary-600 text-white shadow-md shadow-primary-900/20' 
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isChildActive(child) ? 'bg-white' : 'bg-slate-500'}`}></span>
                          {child.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            if (item.id === 'devices') return null;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.view!);
                  setIsOpen(false);
                }}
                className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
                  currentView === item.view 
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 transition-colors ${currentView === item.view ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 text-center">
            <p className="text-[10px] text-slate-600">v1.0.0 Beta</p>
        </div>
      </aside>
    </>
  );
};
