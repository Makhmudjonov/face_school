
import React, { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock, Smile, Meh, Frown, LogIn, LogOut } from 'lucide-react';
import { Student, AttendanceStatus, Mood } from '../types';

// Mock Data with Times and Moods
// Fix: id must be a number as defined in Person interface
const MOCK_STUDENTS: Student[] = [
  { id: 1, firstName: 'Aziz', lastName: 'Rahimov', class: '11-A', parentPhone: '+998901234567', attendanceRate: 98, checkIn: '07:45', checkOut: '13:15', mood: Mood.HAPPY } as any,
  { id: 2, firstName: 'Malika', lastName: 'Karimova', class: '11-A', parentPhone: '+998901234568', attendanceRate: 92, checkIn: '07:55', mood: Mood.NEUTRAL } as any,
  { id: 3, firstName: 'Jamshid', lastName: 'Sobirov', class: '11-B', parentPhone: '+998901234569', attendanceRate: 85, checkIn: '08:15', mood: Mood.TIRED } as any,
  { id: 4, firstName: 'Sevara', lastName: 'Tursunova', class: '10-A', parentPhone: '+998901234570', attendanceRate: 95, checkIn: '07:50', checkOut: '13:10', mood: Mood.HAPPY } as any,
  { id: 5, firstName: 'Bobur', lastName: 'Aliyev', class: '10-A', parentPhone: '+998901234571', attendanceRate: 100, checkIn: '07:30', mood: Mood.HAPPY } as any,
];

export const StudentMonitoring: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedMood, setSelectedMood] = useState('All');
  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus>>({});

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceState(prev => ({ ...prev, [studentId]: status }));
  };

  const filteredStudents = MOCK_STUDENTS.filter(student => {
    const matchesSearch = (student.firstName + ' ' + student.lastName).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'All' || student.class === selectedClass;
    const matchesMood = selectedMood === 'All' || student.mood === selectedMood;
    return matchesSearch && matchesClass && matchesMood;
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">O'quvchilar Nazorati</h2>
          <p className="text-slate-500 dark:text-slate-400">Real vaqt rejimida davomat va holat tahlili</p>
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
            placeholder="O'quvchi ismini qidiring..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white cursor-pointer"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
            >
                <option value="All">Barcha sinflar</option>
                <option value="11-A">11-A</option>
                <option value="11-B">11-B</option>
                <option value="10-A">10-A</option>
            </select>
        </div>
        <div className="relative w-full sm:w-48">
            <Smile className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white cursor-pointer"
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
            >
                <option value="All">Barcha holatlar</option>
                <option value={Mood.HAPPY}>Xursand</option>
                <option value={Mood.NEUTRAL}>Oddiy</option>
                <option value={Mood.TIRED}>Charchagan</option>
                <option value={Mood.SAD}>Xafa</option>
                <option value={Mood.ANGRY}>Jahldor</option>
            </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">O'quvchi</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sinf</th>
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
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 overflow-hidden border border-slate-200 dark:border-slate-600">
                        {/* Placeholder for actual face image captured by camera */}
                        {/* Fix: use optional chaining for names just in case */}
                        <span className="text-xs font-bold">{student.firstName?.[0]}{student.lastName?.[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{student.firstName} {student.lastName}</p>
                        {/* Fix: convert id to string before calling padStart */}
                        <p className="text-xs text-slate-500 dark:text-slate-400">ID: #{student.id.toString().padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-600">
                      {student.class}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {student.checkIn ? (
                        <span className={`font-mono text-sm ${student.checkIn > '08:00' ? 'text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded' : 'text-green-700 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded'}`}>
                            {student.checkIn}
                        </span>
                    ) : (
                        <span className="text-slate-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                     <span className="font-mono text-sm text-slate-600 dark:text-slate-300">
                        {student.checkOut || '-'}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center justify-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700 w-fit mx-auto">
                        {getMoodIcon(student.mood)}
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{getMoodLabel(student.mood)}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                        <button 
                            onClick={() => handleStatusChange(student.id.toString(), AttendanceStatus.PRESENT)}
                            className={`p-1.5 rounded-md transition-all ${attendanceState[student.id.toString()] === AttendanceStatus.PRESENT || (!attendanceState[student.id.toString()] && student.checkIn) ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'text-slate-300 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-green-500'}`}
                            title="Bor"
                        >
                            <CheckCircle className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => handleStatusChange(student.id.toString(), AttendanceStatus.LATE)}
                            className={`p-1.5 rounded-md transition-all ${attendanceState[student.id.toString()] === AttendanceStatus.LATE || (!attendanceState[student.id.toString()] && student.checkIn && student.checkIn > '08:00') ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : 'text-slate-300 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-yellow-500'}`}
                            title="Kechikdi"
                        >
                            <Clock className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => handleStatusChange(student.id.toString(), AttendanceStatus.ABSENT)}
                            className={`p-1.5 rounded-md transition-all ${attendanceState[student.id.toString()] === AttendanceStatus.ABSENT ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'text-slate-300 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-red-500'}`}
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
          {filteredStudents.length === 0 && (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  Hech qanday o'quvchi topilmadi.
              </div>
          )}
        </div>
      </div>
    </div>
  );
};
