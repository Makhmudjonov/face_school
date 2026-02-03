
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Users, Briefcase, X, Save, Loader2, Building2 } from 'lucide-react';
import { Department, School } from '../types';

// Helper to flatten school tree
const flattenSchools = (nodes: School[]): School[] => {
  let flat: School[] = [];
  nodes.forEach(node => {
    flat.push(node);
    if (node.children && node.children.length > 0) {
      flat = flat.concat(flattenSchools(node.children));
    }
  });
  return flat;
};

export const DepartmentsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [schools, setSchools] = useState<School[]>([]);

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isSchoolsLoading, setIsSchoolsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDept, setCurrentDept] = useState<Department | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
      name: '',
      school: '', // School ID as string
      headName: ''
  });

  useEffect(() => {
    fetchDepartments();
    fetchSchools();
  }, []);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
        const token = localStorage.getItem('access_token');
        if (token === 'demo_mock_token') {
             setDepartments([
                { id: 1, name: "Ma'muriyat", headName: "Dilshod Akbarov", employeeCount: 5, school: 9 },
                { id: 2, name: "Matematika", headName: "Rustam Sodiqov", employeeCount: 8, school: 9 },
             ]);
             setIsLoading(false);
             return;
        }

        const response = await fetch('https://hik-test.tashmeduni.uz/api/v1/settings/department/list/', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            const mappedDepts = data.data.map((item: any) => ({
                id: item.id,
                name: item.name,
                headName: item.head_name || '',
                employeeCount: item.employee_count || 0,
                school: item.school
            }));
            setDepartments(mappedDepts);
        }
    } catch (error) {
        console.error("Error fetching departments:", error);
    } finally {
        setIsLoading(false);
    }
  };

  const fetchSchools = async () => {
    setIsSchoolsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('https://hik-test.tashmeduni.uz/api/v1/settings/school/list/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const rawData = await response.json();
        const data = rawData.data || [];
        setSchools(flattenSchools(data));
      }
    } catch (error) {
      console.error("Failed to fetch schools", error);
    } finally {
      setIsSchoolsLoading(false);
    }
  };

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.headName && d.headName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (dept?: Department) => {
      setError(null);
      if (dept) {
          setCurrentDept(dept);
          setFormData({
              name: dept.name,
              school: dept.school ? dept.school.toString() : '',
              headName: dept.headName || ''
          });
      } else {
          setCurrentDept(null);
          const defaultSchool = schools.length > 0 ? schools[0].id.toString() : '';
          setFormData({ name: '', school: defaultSchool, headName: '' });
      }
      setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError(null);

      try {
          const token = localStorage.getItem('access_token');
          const isUpdate = !!currentDept;
          const url = isUpdate 
            ? `https://hik-test.tashmeduni.uz/api/v1/settings/department/update/${currentDept.id}/`
            : 'https://hik-test.tashmeduni.uz/api/v1/settings/department/create/';
          
          const method = isUpdate ? 'PATCH' : 'POST';

          const payload = {
              name: formData.name,
              school: parseInt(formData.school)
          };

          const response = await fetch(url, {
              method: method,
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload)
          });

          if (!response.ok) {
             const errData = await response.json().catch(() => ({}));
             throw new Error(errData.detail || "Saqlashda xatolik yuz berdi");
          }

          await fetchDepartments();
          setIsModalOpen(false);
      } catch (err: any) {
          setError(err.message);
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleDelete = async (id: number) => {
      if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
      try {
          const token = localStorage.getItem('access_token');
          const response = await fetch(`https://hik-test.tashmeduni.uz/api/v1/settings/department/${id}/delete/`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) fetchDepartments();
      } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Bo'limlar</h2>
          <p className="text-slate-500 dark:text-slate-400">Tashkilot bo'limlari ro'yxati</p>
        </div>
        <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Bo'lim qo'shish
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Qidiruv..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bo'lim Nomi</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Filial</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Boshliq</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Xodimlar</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Amallar</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredDepts.map((dept) => {
                    const schoolObj = schools.find(s => s.id === dept.school);
                    return (
                    <tr key={dept.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                <Briefcase className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-slate-800 dark:text-white">{dept.name}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            {schoolObj ? schoolObj.name : <span className="text-slate-400">Noma'lum</span>}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                        {dept.headName || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium">
                            {dept.employeeCount}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleOpenModal(dept)} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                                <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(dept.id)} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </td>
                    </tr>
                )})}
                </tbody>
            </table>
            </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">{currentDept ? 'Tahrirlash' : 'Qo\'shish'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Filial</label>
                <select required value={formData.school} onChange={(e) => setFormData({ ...formData, school: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none">
                    <option value="">Tanlang...</option>
                    {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Bo'lim Nomi</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-semibold">Bekor qilish</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
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
