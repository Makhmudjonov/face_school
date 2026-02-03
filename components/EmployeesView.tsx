
import React, { useState, useEffect } from 'react';
import { Search, Plus, UserCheck, X, Save, Loader2, Upload, Camera, Briefcase, MoreVertical, Phone, Calendar, Building, Info, User } from 'lucide-react';
import { Person, School, Department } from '../types';

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

export const EmployeesView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEmployeeDetail, setSelectedEmployeeDetail] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    employee_id: '',
    phone: '',
    gender: '1',
    school_id: '', 
    department_id: '',
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
        setEmployees([
          { 
            id: 5, 
            firstName: 'Dilshod', 
            lastName: 'Akbarov', 
            full_name: 'Dilshod Akbarov',
            employee_id: 'E001', 
            phone: '998901112233', 
            image: null, 
            school_name: 'Bosh Filial', 
            department_name: 'Ma\'muriyat' 
          }
        ]);
        setSchools([{ id: 9, name: 'Bosh Filial' }]);
        setDepartments([{ id: 1, name: 'Ma\'muriyat', employeeCount: 5, school: 9 }]);
        return;
      }

      const [schoolsRes, deptsRes, empRes] = await Promise.all([
        fetch('https://hik-test.tashmeduni.uz/api/v1/settings/school/list/', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('https://hik-test.tashmeduni.uz/api/v1/settings/department/list/', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('https://hik-test.tashmeduni.uz/api/v1/auth/teachers/', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (schoolsRes.ok) {
        const d = await schoolsRes.json();
        setSchools(flattenSchools(d.data || []));
      }
      if (deptsRes.ok) {
        const d = await deptsRes.json();
        setDepartments(d.data || []);
      }
      if (empRes.ok) {
        const d = await empRes.json();
        setEmployees(d.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployeeDetail = async (id: number) => {
    setIsDetailLoading(true);
    setIsDetailModalOpen(true);
    const token = localStorage.getItem('access_token');
    try {
      if (token === 'demo_mock_token') {
        setSelectedEmployeeDetail({
          id: 5,
          employee_id: "demo-id",
          full_name: "Dilshod Akbarov",
          firstName: "Dilshod",
          lastName: "Akbarov",
          phone: "998901112233",
          gender: "1",
          school: { name: "Bosh Filial" },
          department: { name: "Ma'muriyat" },
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString()
        });
        return;
      }

      const response = await fetch(`https://hik-test.tashmeduni.uz/api/v1/auth/teachers/${id}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedEmployeeDetail(data);
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
      setError("Xodim rasmi yuklanishi shart");
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
      form.append('role', 'teacher');
      form.append('department_id', formData.department_id);
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

  const filteredEmployees = employees.filter(e => 
    (e.firstName + ' ' + e.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.employee_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Xodimlar</h2>
          <p className="text-slate-500 dark:text-slate-400">Tashkilot o'qituvchilari va ma'muriyat</p>
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
          Xodim qo'shish
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Ism yoki ID bo'yicha qidiruv..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
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
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Xodim</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bo'lim</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Filial</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredEmployees.map((emp) => (
                  <tr 
                    key={emp.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group"
                    onClick={() => fetchEmployeeDetail(emp.id)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center overflow-hidden border border-purple-200 dark:border-purple-800 group-hover:border-primary-500 transition-colors">
                          {emp.image ? <img src={emp.image} className="w-full h-full object-cover" /> : <UserCheck className="w-5 h-5 text-purple-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-200 group-hover:text-primary-600 transition-colors">{emp.full_name || `${emp.firstName} ${emp.lastName}`}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">ID: {emp.employee_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        {emp.department_name || 'Noma\'lum bo\'lim'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {emp.school_name || 'Noma\'lum filial'}
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
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Xodim ma'lumotlari</h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            {isDetailLoading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
                <p className="text-slate-500 text-sm font-medium">Yuklanmoqda...</p>
              </div>
            ) : selectedEmployeeDetail && (
              <div className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-full md:w-48 shrink-0 flex flex-col items-center gap-4">
                    <div className="w-40 h-40 rounded-3xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl">
                      {selectedEmployeeDetail.image ? (
                        <img src={selectedEmployeeDetail.image} className="w-full h-full object-cover" />
                      ) : (
                        <UserCheck className="w-16 h-16 text-slate-300" />
                      )}
                    </div>
                    <div className="text-center">
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                        {selectedEmployeeDetail.firstName} {selectedEmployeeDetail.lastName}
                      </h4>
                      <p className="text-sm font-mono text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full mt-2 inline-block">
                        ID: {selectedEmployeeDetail.employee_id}
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Building size={14} /> Filial
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {selectedEmployeeDetail.school?.name || selectedEmployeeDetail.school_name || '-'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Briefcase size={14} /> Bo'lim
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {selectedEmployeeDetail.department?.name || selectedEmployeeDetail.department_name || '-'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Phone size={14} /> Telefon
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {selectedEmployeeDetail.phone || '-'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <User size={14} /> Jinsi
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {selectedEmployeeDetail.gender === "1" ? "Erkak" : "Ayol"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Calendar size={14} /> Ish boshlagan sana
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {formatDateUz(selectedEmployeeDetail.startDate)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <Calendar size={14} /> Shartnoma tugash sanasi
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {formatDateUz(selectedEmployeeDetail.endDate)}
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
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Yangi xodim qo'shish</h3>
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
                <p className="text-xs text-slate-500 mt-2 font-medium">Xodim rasmi yuklang (majburiy)</p>
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
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Xodim ID *</label>
                  <input type="text" required value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefon *</label>
                  <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all" placeholder="998" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Filial *</label>
                  <select required value={formData.school_id} onChange={e => setFormData({...formData, school_id: e.target.value, department_id: ''})} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                    <option value="">Tanlang...</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Bo'lim *</label>
                  <select required value={formData.department_id} onChange={e => setFormData({...formData, department_id: e.target.value})} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all">
                    <option value="">Tanlang...</option>
                    {departments.filter(d => !formData.school_id || d.school === parseInt(formData.school_id)).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
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
