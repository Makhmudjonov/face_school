
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ChevronRight, 
  DoorOpen, 
  ShieldCheck, 
  Loader2, 
  CheckSquare, 
  Square,
  User,
  GraduationCap,
  Briefcase,
  Save,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { AccessLevel, AccessResource } from '../types';

export const AccessControlView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pupils' | 'teachers'>('pupils');
  const [searchTerm, setSearchTerm] = useState('');
  const [people, setPeople] = useState<any[]>([]);
  const [accessLevels, setAccessLevels] = useState<AccessLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // We store the unique database ID for local selection state, 
  // but we'll use personId for the API call.
  const [selectedPeopleIds, setSelectedPeopleIds] = useState<Set<number>>(new Set());
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    fetchInitialData();
    // Clear selection when switching tabs to avoid ID collisions if any
    setSelectedPeopleIds(new Set());
  }, [activeTab]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    try {
      if (token === 'demo_mock_token') {
        setAccessLevels([
          {
            id: "673694262462229504",
            name: "10-maktab (Asosiy)",
            remark: "",
            usageType: 0,
            areaInfo: { id: "", name: "" },
            timeSchedule: { id: "1", name: "DefaultTemplate" },
            associateResList: [
              {
                id: "a7d7ae9922d243338791251f25d46bd6",
                name: "Asosiy kirish 1",
                type: 0,
                areaInfo: { id: "675d0f5bbecc4322add8f03cdbe61d0c", name: "Asosiy hudud" }
              }
            ]
          }
        ]);
        setPeople([
            { id: 1, firstName: 'Aziz', lastName: 'Rahimov', employee_id: 'P001', personId: '100001', role: 'pupil' },
            { id: 2, firstName: 'Malika', lastName: 'Karimova', employee_id: 'P002', personId: '100002', role: 'pupil' }
        ]);
        setIsLoading(false);
        return;
      }

      const endpoint = activeTab === 'pupils' ? '/api/v1/auth/pupils/' : '/api/v1/auth/teachers/';
      const [peopleRes, levelsRes] = await Promise.all([
        fetch(`https://hik-test.tashmeduni.uz${endpoint}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('https://hik-test.tashmeduni.uz/api/v1/auth/employee/access/level/list/', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (peopleRes.ok) {
        const d = await peopleRes.json();
        setPeople(d.data || []);
      }
      if (levelsRes.ok) {
        const d = await levelsRes.json();
        setAccessLevels(d.data || []);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Ma\'lumotlarni yuklashda xatolik yuz berdi' });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePerson = (id: number) => {
    const next = new Set(selectedPeopleIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPeopleIds(next);
  };

  const toggleLevel = (id: string) => {
    const next = new Set(selectedLevels);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedLevels(next);
  };

  const handleSelectAllPeople = () => {
    if (selectedPeopleIds.size === filteredPeople.length) {
      setSelectedPeopleIds(new Set());
    } else {
      setSelectedPeopleIds(new Set(filteredPeople.map(p => p.id)));
    }
  };

  const handleSave = async () => {
    if (selectedPeopleIds.size === 0 || selectedLevels.size === 0) {
      setMessage({ type: 'error', text: 'Iltimos, foydalanuvchilar va kamida bitta ruxsat darajasini tanlang' });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    const token = localStorage.getItem('access_token');

    // Extract personId for the selected users
    const selectedPersonIds = people
      .filter(p => selectedPeopleIds.has(p.id))
      .map(p => p.personId)
      .filter(pid => !!pid); // Ensure we only have non-null personIds

    if (selectedPersonIds.length === 0) {
      setMessage({ type: 'error', text: 'Tanlangan foydalanuvchilarning Person ID ma\'lumoti topilmadi' });
      setIsSaving(false);
      return;
    }

    const payload = {
      personId: selectedPersonIds,
      accessLevelIdList: Array.from(selectedLevels)
    };

    try {
        if (token === 'demo_mock_token') {
            await new Promise(r => setTimeout(r, 1500));
            setMessage({ type: 'success', text: `${selectedPersonIds.length} ta foydalanuvchiga muvaffaqiyatli ruxsat berildi!` });
            setSelectedPeopleIds(new Set());
            setSelectedLevels(new Set());
            return;
        }

        const response = await fetch('https://hik-test.tashmeduni.uz/api/v1/auth/employee/access-level/person/create/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || errData.message || "Saqlashda xatolik yuz berdi");
        }

        setMessage({ type: 'success', text: 'Ruxsatlar muvaffaqiyatli saqlandi!' });
        setSelectedPeopleIds(new Set());
        setSelectedLevels(new Set());
    } catch (err: any) {
        setMessage({ type: 'error', text: err.message });
    } finally {
        setIsSaving(false);
    }
  };

  const filteredPeople = people.filter(p => 
    (p.full_name || `${p.firstName} ${p.lastName}`).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.employee_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Eshiklar Nazorati</h2>
          <p className="text-slate-500 dark:text-slate-400">Foydalanuvchilarni kirish nuqtalariga biriktirish</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving || selectedPeopleIds.size === 0 || selectedLevels.size === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 font-bold disabled:opacity-50 disabled:grayscale"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Ruxsatlarni saqlash
        </button>
      </div>

      {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' : 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'}`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-semibold">{message.text}</span>
              <button onClick={() => setMessage(null)} className="ml-auto text-xs font-bold uppercase tracking-wider hover:underline">Yopish</button>
          </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* Left Side: People List */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 space-y-4">
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('pupils')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'pupils' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary-600' : 'text-slate-500'}`}
              >
                <GraduationCap size={16} /> O'quvchilar
              </button>
              <button 
                onClick={() => setActiveTab('teachers')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'teachers' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary-600' : 'text-slate-500'}`}
              >
                <Briefcase size={16} /> Xodimlar
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Ism yoki ID bo'yicha qidiruv..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between px-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tanlanganlar: {selectedPeopleIds.size} / {filteredPeople.length}</p>
                <button 
                  onClick={handleSelectAllPeople}
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  {selectedPeopleIds.size === filteredPeople.length ? 'Barchasini bekor qilish' : 'Barchasini tanlash'}
                </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            {isLoading ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
            ) : filteredPeople.map(p => (
              <div 
                key={p.id}
                onClick={() => togglePerson(p.id)}
                className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all border ${selectedPeopleIds.has(p.id) ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
              >
                <div className="shrink-0">
                  {selectedPeopleIds.has(p.id) ? <CheckSquare className="text-primary-600" size={20} /> : <Square className="text-slate-300 dark:text-slate-600" size={20} />}
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-slate-600">
                  {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-slate-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{p.full_name || `${p.firstName} ${p.lastName}`}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">ID: {p.employee_id}</p>
                </div>
                {!p.personId && (
                  <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase">No PID</span>
                )}
              </div>
            ))}
            
            {!isLoading && filteredPeople.length === 0 && (
                <div className="h-40 flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Users size={32} strokeWidth={1.5} />
                    <p className="text-sm">Foydalanuvchilar topilmadi</p>
                </div>
            )}
          </div>
        </div>

        {/* Right Side: Access Levels List */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <DoorOpen size={18} className="text-primary-500" /> Kirish Darajalari (Eshiklar)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ruxsat darajasini yoki guruhni tanlang</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            {isLoading ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
            ) : accessLevels.map(level => (
              <div key={level.id} className="space-y-2">
                <div 
                  onClick={() => toggleLevel(level.id)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border-2 ${selectedLevels.has(level.id) ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-900 border-transparent hover:border-slate-200 dark:hover:border-slate-700'}`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className={selectedLevels.has(level.id) ? 'text-emerald-600' : 'text-slate-400'} size={20} />
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{level.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{level.timeSchedule?.name || 'Default'}</p>
                    </div>
                  </div>
                  {selectedLevels.has(level.id) ? <CheckSquare className="text-emerald-600" size={18} /> : <Square className="text-slate-300 dark:text-slate-600" size={18} />}
                </div>
                
                {/* Door details */}
                <div className="ml-6 space-y-1">
                  {level.associateResList?.map(res => (
                    <div key={res.id} className="flex items-center gap-2 p-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg border border-slate-100 dark:border-slate-700/50">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-400"></div>
                      <span className="truncate">{res.name}</span>
                      <span className="ml-auto text-[9px] bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700 shadow-sm">{res.areaInfo?.name || 'Hudud'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {!isLoading && accessLevels.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                    <DoorOpen size={32} strokeWidth={1} />
                    <p className="text-sm font-medium">Ruxsat darajalari mavjud emas</p>
                </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Tanlandi: <span className="text-emerald-600">{selectedLevels.size}</span> ta guruh
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
