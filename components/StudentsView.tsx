
import React, { useState, useEffect } from 'react';
import { Search, Plus, User, X, Save, Loader2, Upload, Camera, MoreVertical, Phone, Calendar, Building, GraduationCap, Info } from 'lucide-react';
import { Person, School, ClassGroup } from '../types';

const flattenSchools = (nodes: School[]): School[] => {
  let flat: School[] = [];
  nodes.forEach(node => {
    flat.push(node);
    if (node.children) flat = flat.concat(flattenSchools(node.children));
  });
  return flat;
};

const formatDateUz = (dateStr: string | null) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    const monthNames = [
      "yanvar", "fevral", "mart", "aprel", "may", "iyun",
      "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"
    ];
    return `${date.getDate()}-${monthNames[date.getMonth()]} ${date.getFullYear()}-yil`;
  } catch {
    return dateStr;
  }
};

export const StudentsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [classrooms, setClassrooms] = useState<ClassGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State for creation
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    employee_id: '',
    phone: '',
    gender: '1',
    school_id: '', 
    classroom_id: '',
  });
  const [picture, setPicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    try {
      if (token === 'demo_mock_token') {
        setStudents([
          { 
            id: 4, 
            firstName: 'Aziz', 
            lastName: 'Rahimov', 
            employee_id: 'P001', 
            phone: '998901234567', 
            image: null, 
            school_name: 'Bosh Filial', 
            classroom_name: 'A-Guruh' 
          }
        ]);
        setSchools([{ id: 9, name: 'Bosh Filial' }]);
        setClassrooms([{ id: 2, name: 'A-Guruh', studentCount: 20, school: 9 }]);
        return;
      }

      const [schoolsRes, classesRes, studentsRes] = await Promise.all([
        fetch('https://hik-test.tashmeduni.uz/api/v1/settings/school/list/', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('https://hik-test.tashmeduni.uz/api/v1/settings/classroom/list/', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('https://hik-test.tashmeduni.uz/api/v1/auth/pupils/', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (schoolsRes.ok) {
        const d = await schoolsRes.json();
        setSchools(flattenSchools(d.data || []));
      }
      if (classesRes.ok) {
        const d = await classesRes.json();
        setClassrooms(d.data || []);
      }
      if (studentsRes.ok) {
        const d = await studentsRes.json();
        setStudents(d.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentDetail = async (id: number) => {
    setIsDetailLoading(true);
    setIsDetailModalOpen(true);
    const token = localStorage.getItem('access_token');
    try {
      if (token === 'demo_mock_token') {
        setSelectedStudentDetail({
          id: 4,
          employee_id: "demo-id",
          full_name: "Aziz Rahimov",
          firstName: "Aziz",
          lastName: "Rahimov",
          phone: "998901234567",
          gender: "1",
          school: { name: "Bosh Filial" },
          classroom: { name: "A-Guruh" },
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString()
        });
        return;
      }

      const response = await fetch(`https://hik-test.tashmeduni.uz/api/v1/auth/pupils/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedStudentDetail(data);
      } else {
        throw new Error("Ma'lumotlarni yuklashda xatolik");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!picture) {
      setError("Rasm yuklanishi shart");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(startDate.getFullYear() + 10);

      const form = new FormData();
      form.append('firstName', formData.firstName);
      form.append('lastName', formData.lastName);
      form.append('gender', formData.gender);
      form.append('employee_id', formData.employee_id);
      form.append('phone', formData.phone);
      form.append('picture', picture); 
      form.append('school_id', formData.school_id);
      form.append('role', 'pupil');
      form.append('classroom_id', formData.classroom_id);
      form.append('startDate', startDate.toISOString());
      form.append('endDate', endDate.toISOString());

      const response = await fetch('https://hik-test.tashmeduni.uz/api/v1/auth/employee/create/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Saqlashda xatolik yuz berdi");
      }

      setIsModalOpen(false);
      fetchInitialData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s => 
    (s.firstName + ' ' + s.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Foydalanuvchilar</h2>
          <p className="text-slate-500 dark:text-slate-400">Tizimdagi barcha foydalanuvchilar ro'yxati</p>
        </div>
        <button 
          onClick={() => {
            setPreviewUrl(null);
            setPicture(null);
            setError(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Foydalanuvchi qo'shish
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Ism yoki ID bo'yicha qidiruv..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">F.I.SH</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Guruh</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Filial</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredStudents.map((student) => (
                  <tr 
                    key={student.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group"
                    onClick={() => fetchStudentDetail(student.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-200 group-hover:border-primary-500 transition-colors">
                          {student.image ? <img src={student.image} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-slate-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-200 group-hover:text-primary-600 transition-colors">{student.full_name || `${student.firstName} ${student.lastName}`}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">ID: {student.employee_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium border border-blue-100 dark:border-blue-800">
                        {student.classroom_name || 'Noma\'lum guruh'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {student.school_name || 'Noma\'lum filial'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
                        <Info className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Foydalanuvchi ma'lumotlari</h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            {isDetailLoading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
                <p className="text-slate-500 text-sm font-medium">Yuklanmoqda...</p>
              </div>
            ) : selectedStudentDetail && (
              <div className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-full md:w-48 shrink-0 flex flex-col items-center gap-4">
                    <div className="w-40 h-40 rounded-3xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
                      {selectedStudentDetail.image ? (
                        <img src={selectedStudentDetail.image} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-16 h-16 text-slate-300" />
                      )}
                    </div>
                    <div className="text-center">
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                        {selectedStudentDetail.firstName} {selectedStudentDetail.lastName}
                      </h4>
                      <p className="text-sm font-mono text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full mt-2 inline-block">
                        ID: {selectedStudentDetail.employee_id}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Building size={14} /> Filial
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {selectedStudentDetail.school?.name || selectedStudentDetail.school_name || '-'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <GraduationCap size={14} /> Guruh
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {selectedStudentDetail.classroom?.name || selectedStudentDetail.classroom_name || '-'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Phone size={14} /> Telefon
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {selectedStudentDetail.phone || '-'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <User size={14} /> Jinsi
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {selectedStudentDetail.gender === "1" ? "Erkak" : "Ayol"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Calendar size={14} /> Boshlanish sanasi
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {formatDateUz(selectedStudentDetail.startDate)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Calendar size={14} /> Tugash sanasi
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {formatDateUz(selectedStudentDetail.endDate)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                   <button 
                     onClick={() => setIsDetailModalOpen(false)}
                     className="px-8 py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
                   >
                     Yopish
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Yangi foydalanuvchi qo'shish</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4">{error}</div>}
              
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 transition-colors group-hover:border-primary-500">
                    {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-slate-400" />}
                  </div>
                  <label className="absolute bottom-0 right-0 p-1.5 bg-primary-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-primary-700 transition-all active:scale-90">
                    <Upload size={14} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">Rasm yuklang (majburiy)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Ism *</label>
                  <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Familiya *</label>
                  <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">ID *</label>
                  <input type="text" required value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all" placeholder="P0001" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefon *</label>
                  <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all" placeholder="998" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Filial *</label>
                  <select required value={formData.school_id} onChange={e => setFormData({...formData, school_id: e.target.value, classroom_id: ''})} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                    <option value="">Tanlang...</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Guruh *</label>
                  <select required value={formData.classroom_id} onChange={e => setFormData({...formData, classroom_id: e.target.value})} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                    <option value="">Tanlang...</option>
                    {classrooms.filter(c => !formData.school_id || c.school === parseInt(formData.school_id)).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Jins *</label>
                  <select required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                    <option value="1">Erkak</option>
                    <option value="2">Ayol</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-colors">Bekor qilish</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
