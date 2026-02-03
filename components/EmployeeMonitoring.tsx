
import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, Smile, Meh, Frown, LogIn, LogOut, Loader2, Calendar, RefreshCw, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { AttendanceLog } from '../types';

export const EmployeeMonitoring: React.FC = () => {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAttendance();
  }, [page, date]);

  const fetchAttendance = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    
    const query = new URLSearchParams();
    query.append('page', page.toString());
    query.append('page_size', pageSize.toString());
    query.append('log_date', date);
    if (searchTerm) query.append('search', searchTerm);

    try {
      if (token === 'demo_mock_token') {
        setTimeout(() => {
            setLogs([
                {
                  "employee_id": 8,
                  "employee_name": "Miraziz Maxmudjonov",
                  "log_date": date,
                  "first_entry": `${date}T08:21:36+05:00`,
                  "last_exit": `${date}T18:00:00+05:00`,
                  "status": "late",
                  "entered_face_mood": "charchagan",
                  "total_logs": 12,
                  "worked_hours": 8.5
                },
                {
                  "employee_id": 9,
                  "employee_name": "Test Xodim",
                  "log_date": date,
                  "first_entry": `${date}T07:55:00+05:00`,
                  "last_exit": `${date}T17:05:00+05:00`,
                  "status": "ontime",
                  "entered_face_mood": "xursand",
                  "total_logs": 4,
                  "worked_hours": 9.1
                }
            ]);
            setTotalElements(2);
            setIsLoading(false);
        }, 600);
        return;
      }

      const response = await fetch(`https://hik-test.tashmeduni.uz/api/v1/events/teachers/attendance/list/?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.data || []);
        setTotalElements(data.total_elements || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAttendance();
  };

  const formatTime = (isoString: string | null) => {
      if (!isoString) return '-';
      return new Date(isoString).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getMoodIcon = (mood: string | null) => {
    if (!mood) return <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400"><User size={16} /></div>;
    const m = mood.toLowerCase();
    if (m.includes('happy') || m.includes('xursand')) return <Smile className="w-5 h-5 text-emerald-500" />;
    if (m.includes('neutral') || m.includes('oddiy')) return <Meh className="w-5 h-5 text-amber-500" />;
    if (m.includes('sad') || m.includes('charchagan') || m.includes('tired')) return <Frown className="w-5 h-5 text-red-500" />;
    return <Meh className="w-5 h-5 text-slate-400" />;
  };

  const getStatusBadge = (status: string | null) => {
      if (!status) return <span className="text-slate-400">-</span>;
      const s = status.toLowerCase();
      if (s === 'late') return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">Kechikkan</span>;
      if (s === 'ontime' || s === 'present') return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">Vaqtida</span>;
      if (s === 'absent') return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 border border-red-200">Kelmadi</span>;
      return <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 capitalize">{s}</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Xodimlar Nazorati</h2>
          <p className="text-slate-500 dark:text-slate-400">Kunlik davomat va ish vaqti hisoboti</p>
        </div>
        <button 
            onClick={fetchAttendance}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 transition-all font-semibold shadow-sm"
        >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Yangilash
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Xodim ismini qidiring..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="relative w-full md:w-48">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                    type="date" 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>
            <button 
                type="submit"
                className="px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
            >
                Qidirish
            </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Xodim</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1">
                        <LogIn className="w-3.5 h-3.5" /> Kelish
                    </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                     <div className="flex items-center gap-1">
                        <LogOut className="w-3.5 h-3.5" /> Ketish
                    </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Ish vaqti</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Kayfiyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto" />
                        <p className="mt-2 text-sm text-slate-500">Yuklanmoqda...</p>
                    </td>
                  </tr>
              ) : logs.length > 0 ? logs.map((log, index) => (
                <tr key={`${log.employee_id}-${index}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs border border-purple-100 dark:border-purple-800">
                        {log.employee_name ? log.employee_name.charAt(0) : '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{log.employee_name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">ID: {log.employee_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(log.status)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded">
                        {formatTime(log.first_entry)}
                    </span>
                  </td>
                   <td className="px-6 py-4">
                     <span className="font-mono text-sm font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                        {formatTime(log.last_exit)}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <div className="flex flex-col items-center">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{log.worked_hours || 0} soat</span>
                        <span className="text-[10px] text-slate-400">{log.total_logs} ta log</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex justify-center" title={log.entered_face_mood || ''}>
                        {getMoodIcon(log.entered_face_mood)}
                     </div>
                  </td>
                </tr>
              )) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-slate-500">
                        Ma'lumot topilmadi
                    </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="text-sm text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-900 dark:text-white">{totalElements}</span> tadan <span className="font-bold text-slate-900 dark:text-white">{(page - 1) * pageSize + 1}</span> - <span className="font-bold text-slate-900 dark:text-white">{Math.min(page * pageSize, totalElements)}</span> ko'rsatilmoqda
           </div>
           
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300">
                Sahifa {page}
              </div>

              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= totalElements}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
