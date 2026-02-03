
import React, { useState, useEffect } from 'react';
import { Bell, Lock, User, Globe, Moon, Camera, Upload, Save, Loader2, CheckCircle, AlertCircle, Phone } from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsViewProps {
  user: UserProfile | null;
  onProfileUpdate: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onProfileUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '1',
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.image_url || null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '1',
      });
      setPreviewUrl(user.image_url);
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('access_token');
    
    // Demo mode bypass
    if (token === 'demo_mock_token') {
        setTimeout(() => {
            setSuccess("Profil muvaffaqiyatli yangilandi (Demo)");
            setIsLoading(false);
            onProfileUpdate();
        }, 1000);
        return;
    }

    try {
      const form = new FormData();
      form.append('firstName', formData.firstName);
      form.append('lastName', formData.lastName);
      form.append('email', formData.email);
      if (formData.phone) form.append('phone', formData.phone);
      form.append('gender', formData.gender);
      
      if (profilePicture) {
        form.append('image', profilePicture);
      }

      const response = await fetch('https://hik-test.tashmeduni.uz/api/v1/auth/profile/update/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: form
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Ma'lumotlarni saqlashda xatolik yuz berdi");
      }

      setSuccess("Profil muvaffaqiyatli yangilandi!");
      onProfileUpdate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Sozlamalar</h2>
        <p className="text-slate-500 dark:text-slate-400">Tizim va profil sozlamalarini boshqaring</p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          {/* Section 1: Profile */}
          <div className="p-6 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl group-hover:scale-105 transition-transform duration-300">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-slate-300" />
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 p-2.5 bg-primary-600 text-white rounded-xl cursor-pointer shadow-lg hover:bg-primary-700 transition-all hover:scale-110 active:scale-95">
                  <Camera size={18} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Profil rasmi</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Tizimdagi rasmingizni yangilang. JPG, PNG formatlari tavsiya etiladi.</p>
                <div className="pt-2">
                  <span className="px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-wider">
                    {user?.role || 'Admin'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Ism</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all" 
                    placeholder="Ismingiz"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Familiya</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all"
                    placeholder="Familiyangiz"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email manzil</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all"
                    placeholder="email@misol.uz"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Telefon</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all"
                    placeholder="998901234567"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Jins</label>
                <select 
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white transition-all"
                >
                  <option value="1">Erkak</option>
                  <option value="2">Ayol</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
            <button 
              type="button" 
              className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold transition-colors"
            >
              Bekor qilish
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="px-8 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-bold transition-all shadow-lg shadow-primary-500/20 active:scale-95 disabled:opacity-70 flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Saqlash
            </button>
          </div>
        </div>

        {/* Section 2: Notifications & Appearance (Still Mock UI) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-500" />
              Tizim bildirishnomalari
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">SMS xabarnomalar</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Ota-onalarga avtomatik SMS yuborish</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Email hisobotlar</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Haftalik davomat hisobotini emailga olish</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary-500" />
              Xavfsizlik
            </h3>
            <button type="button" className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Parolni o'zgartirish
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
