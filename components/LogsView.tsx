
import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  RefreshCw, 
  LogIn, 
  LogOut, 
  User, 
  Monitor, 
  Calendar,
  Smile,
  Meh,
  Frown,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Activity
} from 'lucide-react';
import { EventLog } from '../types';

export const LogsView: React.FC = () => {
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    employeeId: '',
    deviceId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchLogs();
  }, [page, filters]); 

  const fetchLogs = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    
    const query = new URLSearchParams();
    query.append('page', page.toString());
    query.append('page_size', pageSize.toString());
    if (searchTerm) query.append('search', searchTerm);
    if (filters.employeeId) query.append('employee', filters.employeeId);
    if (filters.deviceId) query.append('entered_device', filters.deviceId);
    if (filters.startDate) query.append('start_date', filters.startDate);
    if (filters.endDate) query.append('end_date', filters.endDate);

    try {
      if (token === 'demo_mock_token') {
        setTimeout(() => {
          setLogs([
            {
              id: 533,
              entered_ipAddress: "192.168.14.15",
              leaved_ipAddress: null,
              subEventType: 75,
              userType: "normal",
              enter_dateTime: new Date().toISOString(),
              leave_dateTime: null,
              entered_face_mood: "charchagan",
              entered_face_confidence: 32.01,
              entered_emotion: "fear",
              status: "pending",
              employee: 8,
              entered_device: 3,
              leaved_device: null
            },
            {
              id: 530,
              entered_ipAddress: "192.168.14.15",
              leaved_ipAddress: null,
              subEventType: 75,
              userType: "normal",
              enter_dateTime: new Date(Date.now() - 3600000).toISOString(),
              leave_dateTime: null,
              entered_face_mood: "xursand",
              entered_face_confidence: 92.60,
              entered_emotion: "happy",
              status: "success",
              employee: 8,
              entered_device: 3,
              leaved_device: null
            }
          ]);
          setTotalElements(533);
          setIsLoading(false);
        }, 600);
        return;
      }

      const response = await fetch(`https://hik-test.tashmeduni.uz/api/v1/events/logs/list/?${query.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.data || []);
        setTotalElements(data.total_elements || 0);
        if (data.page_size) setPageSize(data.page_size);
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
    fetchLogs();
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const formatDateUz = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const monthNames = [
      "yanvar", "fevral", "mart", "aprel", "may", "iyun",
      "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"
    ];
    return `${date.getDate()}-${monthNames[date.getMonth()]} ${date.getFullYear()}-yil`;
  };

  const getEmotionIcon = (emotion: string | null) => {
    if (!emotion) return <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400"><User size={16} /></div>;
    
    const e = emotion.toLowerCase();
    if (e.includes('happy') || e.includes('joy') || e.includes('xursand')) 
        return <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400"><Smile size={18} /></div>;
    if (e.includes('sad') || e.includes('fear') || e.includes('angry') || e.includes('charchagan')) 
        return <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400"><Frown size={18} /></div>;
    
    return <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400"><Meh size={18} /></div>;
  };

  const getStatusBadge = (status: string | null) => {
      if (!status) return null;
      const s = status.toLowerCase();
      if (s === 'pending') return <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-100 text-amber-700 border border-amber-200">Kutilmoqda</span>;
      if (s === 'success' || s === 'normal') return <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">Tasdiqlandi</span>;
      return <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-600 border border-slate-200">{status}</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <History className="text-primary-600" /> Tizim Loglari
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Kirish va chiqish monitoringi arxivi</p>
        </div>
        <button 
          onClick={() => { setPage(1); fetchLogs(); }}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-50 transition-all font-semibold shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Yangilash
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Qidiruv..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2.5 border rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors ${showFilters ? 'bg-primary-50 border-primary-200 text-primary-600 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-400' : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'}`}
            >
                <Filter size={16} /> Filterlar
                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
        </form>

        {/* Collapsible Filters */}
        {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-2">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Xodim ID</label>
                    <input 
                        type="text" 
                        placeholder="ID kiriting"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                        value={filters.employeeId}
                        onChange={e => setFilters({...filters, employeeId: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Qurilma ID</label>
                    <input 
                        type="text" 
                        placeholder="ID kiriting"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                        value={filters.deviceId}
                        onChange={e => setFilters({...filters, deviceId: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Boshlanish Sanasi</label>
                    <input 
                        type="date" 
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                        value={filters.startDate}
                        onChange={e => setFilters({...filters, startDate: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Tugash Sanasi</label>
                    <input 
                        type="date" 
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                        value={filters.endDate}
                        onChange={e => setFilters({...filters, endDate: e.target.value})}
                    />
                </div>
                <div className="sm:col-span-2 md:col-span-4 flex justify-end">
                    <button 
                        onClick={() => {
                            setFilters({ employeeId: '', deviceId: '', startDate: '', endDate: '' });
                            setPage(1);
                        }}
                        className="text-xs text-red-500 font-bold hover:underline"
                    >
                        Filterni tozalash
                    </button>
                </div>
            </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Vaqt / ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Xodim</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Qurilma / IP</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Yuz Holati (AI)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto" />
                    <p className="mt-2 text-sm text-slate-500">Loglar yuklanmoqda...</p>
                  </td>
                </tr>
              ) : logs.length > 0 ? logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 dark:text-white">
                            {formatTime(log.enter_dateTime)}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDateUz(log.enter_dateTime)}
                        </span>
                        <span className="text-[9px] text-slate-300 dark:text-slate-600 mt-1">LOG #{log.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                            {log.employee || '?'}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Xodim ID: {log.employee}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{log.userType || 'normal'}</p>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                            <Monitor size={14} className="text-slate-400" />
                            <span>Qurilma ID: {log.entered_device || log.leaved_device || '-'}</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-xs font-mono text-slate-500 dark:text-slate-400">
                            {log.entered_ipAddress || log.leaved_ipAddress || 'IP yo\'q'}
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1">
                       <div className="flex items-center gap-2">
                           {getEmotionIcon(log.entered_emotion)}
                           <div className="text-left">
                               <p className="text-xs font-bold text-slate-700 dark:text-slate-200 capitalize">{log.entered_face_mood || log.entered_emotion || 'N/A'}</p>
                               {log.entered_face_confidence && (
                                   <p className="text-[10px] text-slate-500">{log.entered_face_confidence.toFixed(1)}% ishonch</p>
                               )}
                           </div>
                       </div>
                       {/* Confidence Bar */}
                       {log.entered_face_confidence && (
                           <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                               <div 
                                 className={`h-full rounded-full ${log.entered_face_confidence > 80 ? 'bg-emerald-500' : log.entered_face_confidence > 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                 style={{ width: `${log.entered_face_confidence}%` }}
                               ></div>
                           </div>
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(log.status)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-500">Hodisalar topilmadi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination */}
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
