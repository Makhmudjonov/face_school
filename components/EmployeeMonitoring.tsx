
import React, { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock, Smile, Meh, Frown, LogIn, LogOut } from 'lucide-react';
import { Employee, AttendanceStatus, Mood } from '../types';

// Fix: id must be a number as defined in Person interface
const MOCK_EMPLOYEES: Employee[] = [
  { id: 1, firstName: 'Dilshod', lastName: 'Akbarov', position: 'Direktor', phone: '+998901112233', status: 'Active', checkIn: '07:30', mood: Mood.HAPPY } as any,
  { id: 2, firstName: 'Shahlo', lastName: 'Yusupova', position: "O'quv ishlari bo'yicha o'rinbosar", phone: '+998902223344', status: 'Active', checkIn: '07:45', mood: Mood.NEUTRAL } as any,
  { id: 3, firstName: 'Rustam', lastName: 'Sodiqov', position: "Matematika o'qituvchisi", phone: '+998903334455', status: 'Active', checkIn: '07:55', checkOut: '14:00', mood: Mood.HAPPY } as any,
  { id: 4, firstName: 'Nargiza', lastName: 'Qosimova', position: "Ingliz tili o'qituvchisi", phone: '+998904445566', status: 'OnLeave', mood: Mood.NEUTRAL } as any,
  { id: 5, firstName: 'Jasur', lastName: 'Karimov', position: "Jismoniy tarbiya o'qituvchisi", phone: '+998905556677', status: 'Active', checkIn: '08:05', mood: Mood.TIRED } as any,
];

export const EmployeeMonitoring: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus>>({});

  const handleStatusChange = (empId: string, status: AttendanceStatus) => {
    setAttendanceState(prev => ({ ...prev, [empId]: status }));
  };

  const filteredEmployees = MOCK_EMPLOYEES.filter(emp => {
    const matchesSearch = (emp.firstName + ' ' + emp.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (emp.position || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getMoodIcon = (mood?: Mood) => {
    switch (mood) {
      case Mood.HAPPY: return <Smile className="w-5 h-5 text-green-500" />;
      case Mood.NEUTRAL: return <Meh className="w-5 h-5 text-yellow-500" />;
      case Mood.TIRED: 
      case Mood.SAD: return <Frown className="w-5 h-5 text-orange-500" />;
      case Mood.ANGRY: return <Frown className="w-5 h-5 text-red-500" />;
      default: return <Meh className="w-5 h-5 text-slate-300" />;
    }
  };

  const getMoodLabel = (mood?: Mood) => {
    switch (mood) {
        case Mood.HAPPY: return 'Xursand';
        case Mood.NEUTRAL: return 'Oddiy';
        case Mood.TIRED: return 'Charchagan';
        case Mood.SAD: return 'Xafa';
        case Mood.ANGRY: return 'Jahldor';
        default: return 'Noma\'lum';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Xodimlar Nazorati</h2>
          <p className="text-slate-500 dark:text-slate-400">Davomat va kayfiyat monitoringi</p>
        </div>
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm text-sm font-medium">
                Hisobotni yuklash
            </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Xodim ismini yoki lavozimini qidiring..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Xodim</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lavozim</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                        <LogIn className="w-3.5 h-3.5" /> Kelish Vaqti
                    </div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                     <div className="flex items-center gap-1">
                        <LogOut className="w-3.5 h-3.5" /> Ketish Vaqti
                    </div>
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Yuz Holati</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs border border-purple-200 dark:border-purple-800">
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">ID: #{emp.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {emp.position}
                  </td>
                  <td className="px-6 py-4">
                    {emp.checkIn ? (
                        <span className={`font-mono text-sm ${emp.checkIn > '08:00' ? 'text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded' : 'text-green-700 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded'}`}>
                            {emp.checkIn}
                        </span>
                    ) : (
                        <span className="text-slate-400 text-sm">-</span>
                    )}
                  </td>
                   <td className="px-6 py-4">
                     <span className="font-mono text-sm text-slate-600 dark:text-slate-300">
                        {emp.checkOut || '-'}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center justify-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700 w-fit mx-auto">
                        {getMoodIcon(emp.mood)}
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{getMoodLabel(emp.mood)}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                        <button 
                            onClick={() => handleStatusChange(emp.id.toString(), AttendanceStatus.PRESENT)}
                            className={`p-1.5 rounded-md transition-all ${attendanceState[emp.id.toString()] === AttendanceStatus.PRESENT || (!attendanceState[emp.id.toString()] && emp.checkIn) ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'text-slate-300 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-green-500'}`}
                            title="Bor"
                        >
                            <CheckCircle className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => handleStatusChange(emp.id.toString(), AttendanceStatus.LATE)}
                            className={`p-1.5 rounded-md transition-all ${attendanceState[emp.id.toString()] === AttendanceStatus.LATE || (!attendanceState[emp.id.toString()] && emp.checkIn && emp.checkIn > '08:00') ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : 'text-slate-300 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-yellow-500'}`}
                            title="Kechikdi"
                        >
                            <Clock className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => handleStatusChange(emp.id.toString(), AttendanceStatus.ABSENT)}
                            className={`p-1.5 rounded-md transition-all ${attendanceState[emp.id.toString()] === AttendanceStatus.ABSENT ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'text-slate-300 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-red-500'}`}
                            title="Yo'q"
                        >
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEmployees.length === 0 && (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  Xodimlar topilmadi.
              </div>
          )}
        </div>
      </div>
    </div>
  );
};
