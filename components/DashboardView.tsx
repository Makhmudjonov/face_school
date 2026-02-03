
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  TrendingUp, 
  Clock, 
  Building2,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Smile,
  Meh,
  Frown,
  UserX,
  LogIn,
  LogOut
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart, 
  Pie, 
  Cell
} from 'recharts';
import { DashboardStats, School } from '../types';

// Flatten helper (reused)
const flattenSchools = (nodes: School[]): School[] => {
  let flat: School[] = [];
  nodes.forEach(node => {
    flat.push(node);
    if (node.children) flat = flat.concat(flattenSchools(node.children));
  });
  return flat;
};

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700">
        <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs font-medium" style={{ color: entry.color }}>
            {entry.name}: {entry.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const DashboardView: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeActivityTab, setActiveActivityTab] = useState<'entered' | 'leaved'>('entered');

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [selectedSchoolId]);

  const fetchSchools = async () => {
    const token = localStorage.getItem('access_token');
    try {
      if (token === 'demo_mock_token') {
          setSchools([{ id: 1, name: "10-maktab" }, { id: 2, name: "15-maktab" }]);
          return;
      }
      const response = await fetch('https://hik-test.tashmeduni.uz/api/v1/settings/school/list/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const d = await response.json();
        setSchools(flattenSchools(d.data || []));
      }
    } catch (e) { console.error(e); }
  };

  const fetchStats = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    
    // Build URL with query param
    let url = 'https://hik-test.tashmeduni.uz/api/v1/events/api/dashboard/stats/';
    if (selectedSchoolId) {
        url += `?school=${selectedSchoolId}`;
    }

    try {
      // Demo logic
      if (token === 'demo_mock_token') {
         setTimeout(() => {
             setStats({
                total_students: { value: 1245, trend_value: 12, trend_label: 'bu oy', trend_type: 'up' },
                total_employees: { value: 84, trend_value: null, trend_label: 'Stabil', trend_type: 'stable' },
                today_attendance: { value: 96.4, trend_value: 2.1, trend_label: 'kechagiga qaraganda', trend_type: 'up' },
                today_late: { value: 18, trend_value: -5, trend_label: 'kechagiga qaraganda', trend_type: 'down' }, // down for late is good usually, depends on UI logic
                mood_stats: {
                    xursand: { count: 800, percentage: 65 },
                    oddiy: { count: 300, percentage: 25 },
                    charchagan: { count: 100, percentage: 8 },
                    no_face: { count: 45, percentage: 2 },
                    total_detected: 1200,
                    total: 1245
                },
                weekly_chart: [
                    { day: 'Dush', percentage: 95 },
                    { day: 'Sesh', percentage: 93 },
                    { day: 'Chor', percentage: 96 },
                    { day: 'Pay', percentage: 91 },
                    { day: 'Juma', percentage: 94 },
                    { day: 'Shan', percentage: 88 },
                ],
                weekly_mood_chart: [
                    { day: 'Dush', xursand: 60, oddiy: 30, charchagan: 10, no_face: 0 },
                    { day: 'Sesh', xursand: 55, oddiy: 35, charchagan: 10, no_face: 0 },
                    { day: 'Chor', xursand: 70, oddiy: 20, charchagan: 10, no_face: 0 },
                    { day: 'Pay', xursand: 50, oddiy: 40, charchagan: 10, no_face: 0 },
                    { day: 'Juma', xursand: 80, oddiy: 15, charchagan: 5, no_face: 0 },
                    { day: 'Shan', xursand: 40, oddiy: 40, charchagan: 20, no_face: 0 },
                ],
                entered_users: [
                    { employee_id: 8, employee_name: "Aziz Rahimov", initials: "AR", school_name: "10-maktab", status: "late", mood: "HAPPY", mood_confidence: 90, enter_time: "08:15", leave_time: null },
                    { employee_id: 9, employee_name: "Malika Karimova", initials: "MK", school_name: "10-maktab", status: "ontime", mood: "NEUTRAL", mood_confidence: 85, enter_time: "07:50", leave_time: null }
                ],
                leaved_users: [],
                status: null, mood: null
             });
             setIsLoading(false);
         }, 800);
         return;
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (type: string) => {
    switch (type) {
      case 'up': return <ArrowUpRight className="w-4 h-4" />;
      case 'down': return <ArrowDownRight className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = (type: string, isLateMetric: boolean = false) => {
      // For late metrics, 'down' is usually good (green), 'up' is bad (red)
      // For others, 'up' is good (green), 'down' is bad (red)
      
      if (type === 'stable') return 'text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300';

      if (isLateMetric) {
          return type === 'down' 
            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' 
            : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      }

      return type === 'up' 
        ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400' 
        : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
  };

  const getMoodColor = (mood: string | null) => {
      if (!mood) return 'text-slate-400';
      const m = mood.toLowerCase();
      if (m.includes('happy') || m.includes('xursand')) return 'text-emerald-500';
      if (m.includes('neutral') || m.includes('oddiy')) return 'text-amber-500';
      if (m.includes('sad') || m.includes('charchagan') || m.includes('tired')) return 'text-red-500';
      return 'text-slate-400';
  };

  const getMoodIcon = (mood: string | null) => {
    if (!mood) return <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700" />;
    const m = mood.toLowerCase();
    if (m.includes('happy') || m.includes('xursand')) return <Smile className="w-4 h-4 text-emerald-500" />;
    if (m.includes('neutral') || m.includes('oddiy')) return <Meh className="w-4 h-4 text-amber-500" />;
    if (m.includes('sad') || m.includes('charchagan') || m.includes('tired')) return <Frown className="w-4 h-4 text-red-500" />;
    return <Meh className="w-4 h-4 text-slate-400" />;
  };

  // Pie Chart Data Prep
  const pieData = stats ? [
    { name: 'Xursand', value: stats.mood_stats.xursand.percentage, color: '#10b981' },
    { name: 'Oddiy', value: stats.mood_stats.oddiy.percentage, color: '#f59e0b' },
    { name: 'Charchagan', value: stats.mood_stats.charchagan.percentage, color: '#ef4444' },
    { name: 'Aniqlanmadi', value: stats.mood_stats.no_face.percentage, color: '#94a3b8' },
  ].filter(i => i.value > 0) : [];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Bosh sahifa</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Real vaqt rejimida maktab ko'rsatkichlari</p>
        </div>
        <div className="flex items-center gap-3">
             <div className="relative min-w-[200px]">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer text-slate-900 dark:text-white"
                    value={selectedSchoolId}
                    onChange={(e) => setSelectedSchoolId(e.target.value)}
                >
                    <option value="">Barcha maktablar</option>
                    {schools.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
             </div>
             <button 
                onClick={fetchStats}
                className="p-2 bg-slate-50 dark:bg-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300 transition-colors"
                title="Yangilash"
             >
                 <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
             </button>
        </div>
      </div>

      {isLoading && !stats ? (
          <div className="h-64 flex items-center justify-center">
              <RefreshCw className="w-10 h-10 animate-spin text-primary-500" />
          </div>
      ) : stats ? (
        <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* O'quvchilar */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 group hover:border-blue-200 dark:hover:border-blue-800 transition-all">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                        <GraduationCap size={24} />
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${getTrendColor(stats.total_students.trend_type)}`}>
                        {getTrendIcon(stats.total_students.trend_type)}
                        {stats.total_students.trend_value ? `${stats.total_students.trend_value > 0 ? '+' : ''}${stats.total_students.trend_value}` : ''}
                    </span>
                </div>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{stats.total_students.value}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Jami O'quvchilar</p>
                <p className="text-xs text-slate-400 mt-2">{stats.total_students.trend_label}</p>
            </div>

            {/* Xodimlar */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 group hover:border-purple-200 dark:hover:border-purple-800 transition-all">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-2xl text-purple-600 dark:text-purple-400">
                        <Users size={24} />
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${getTrendColor(stats.total_employees.trend_type)}`}>
                        {getTrendIcon(stats.total_employees.trend_type)}
                        {stats.total_employees.trend_value}
                    </span>
                </div>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{stats.total_employees.value}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Jami Xodimlar</p>
                <p className="text-xs text-slate-400 mt-2">{stats.total_employees.trend_label}</p>
            </div>

            {/* Davomat */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 group hover:border-emerald-200 dark:hover:border-emerald-800 transition-all">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400">
                        <TrendingUp size={24} />
                    </div>
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${getTrendColor(stats.today_attendance.trend_type)}`}>
                        {getTrendIcon(stats.today_attendance.trend_type)}
                        {stats.today_attendance.trend_value}%
                    </span>
                </div>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{stats.today_attendance.value}%</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Bugungi Davomat</p>
                <p className="text-xs text-slate-400 mt-2">{stats.today_attendance.trend_label}</p>
            </div>

            {/* Kechikkanlar */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 group hover:border-amber-200 dark:hover:border-amber-800 transition-all">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-2xl text-amber-600 dark:text-amber-400">
                        <Clock size={24} />
                    </div>
                    {/* Note: For late students, 'down' trend type usually means improvement (green), handled in helper */}
                    <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${getTrendColor(stats.today_late.trend_type, true)}`}>
                        {getTrendIcon(stats.today_late.trend_type)}
                        {stats.today_late.trend_value}
                    </span>
                </div>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{stats.today_late.value}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Kechikkanlar</p>
                <p className="text-xs text-slate-400 mt-2">{stats.today_late.trend_label}</p>
            </div>
        </div>

        {/* Charts Section Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Attendance */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-500" />
                    Haftalik Davomat Dinamikasi
                </h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.weekly_chart} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[0, 100]} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="percentage" name="Davomat" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAttendance)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Mood Distribution (Donut Chart) */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                    <Smile className="w-5 h-5 text-emerald-500" />
                    Bugungi Kayfiyat Tahlili
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Yuzni aniqlash orqali emotsional holat</p>
                
                <div className="flex-1 min-h-[250px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center -mt-4">
                        <span className="text-2xl font-bold text-slate-800 dark:text-white block">{stats.mood_stats.total_detected}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Aniqlangan</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Charts Section Row 2 & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Weekly Mood Trend (Stacked Bar) */}
             <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <Smile className="w-5 h-5 text-purple-500" />
                    Haftalik Kayfiyat Trendi
                </h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.weekly_mood_chart} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="xursand" name="Xursand" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} barSize={30} />
                            <Bar dataKey="oddiy" name="Oddiy" stackId="a" fill="#f59e0b" barSize={30} />
                            <Bar dataKey="charchagan" name="Charchagan" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
             </div>

             {/* Recent Activity Feed */}
             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-[420px]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">So'nggi faollik</h3>
                    <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                        <button 
                            onClick={() => setActiveActivityTab('entered')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeActivityTab === 'entered' ? 'bg-white dark:bg-slate-600 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}
                        >
                            Kirganlar
                        </button>
                        <button 
                            onClick={() => setActiveActivityTab('leaved')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeActivityTab === 'leaved' ? 'bg-white dark:bg-slate-600 shadow text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}
                        >
                            Chiqqanlar
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                    {(activeActivityTab === 'entered' ? stats.entered_users : stats.leaved_users).map((user, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${activeActivityTab === 'entered' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                {user.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user.employee_name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    {user.school_name}
                                    {user.status === 'late' && <span className="text-red-500 font-bold">• Kechikdi</span>}
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                                    {activeActivityTab === 'entered' ? user.enter_time : user.leave_time}
                                </p>
                                <div className="flex justify-end mt-1">
                                    {getMoodIcon(user.mood)}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {(activeActivityTab === 'entered' ? stats.entered_users : stats.leaved_users).length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <UserX size={32} strokeWidth={1.5} className="mb-2 opacity-50" />
                            <p className="text-sm">Ma'lumot topilmadi</p>
                        </div>
                    )}
                </div>
             </div>
        </div>
        </>
      ) : null}
    </div>
  );
};
