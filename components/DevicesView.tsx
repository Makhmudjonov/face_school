
import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Video, Server, Tablet, RefreshCw, X, Save, Loader2, Building2 } from 'lucide-react';
import { Device, School, ApiListResponse } from '../types';

// Helper to flatten tree for dropdowns (duplicated here to keep file independent or could be imported if moved to utils)
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

const MOCK_DEVICES: Device[] = [
  { id: '1', name: 'Kirish - Asosiy', model: 'Hikvision DS-2CD2T87G2-L', ipAddress: '192.168.1.101', status: 'Online', type: 'Camera', location: 'Darvoza', lastSeen: 'Hozir' },
  { id: '2', name: 'Turniket - FaceID', model: 'Hikvision DS-K1T671M', ipAddress: '192.168.1.102', status: 'Online', type: 'Terminal', location: 'Foyeda', lastSeen: 'Hozir' },
  { id: '3', name: 'Oshxona', model: 'Hikvision DS-2CD2143G0-I', ipAddress: '192.168.1.105', status: 'Offline', type: 'Camera', location: 'Oshxona', lastSeen: '15 daq oldin' },
  { id: '4', name: 'Koridor 1-qavat', model: 'Hikvision DS-2CD2043G2-I', ipAddress: '192.168.1.103', status: 'Online', type: 'Camera', location: '1-qavat', lastSeen: 'Hozir' },
  { id: '5', name: 'Main NVR', model: 'Hikvision iDS-7732NXI-I4/16P', ipAddress: '192.168.1.200', status: 'Online', type: 'NVR', location: 'Server', lastSeen: 'Hozir' },
];

export const DevicesView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [devices, setDevices] = useState<Device[]>(MOCK_DEVICES);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [isSchoolsLoading, setIsSchoolsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    ipAddress: '',
    userName: '',
    password: '',
    type: 'IN',
    school: '', // ID string
    ezvizSerialNo: '',
    ezvizVerifyCode: ''
  });

  const fetchSchools = async () => {
    setIsSchoolsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (token === 'demo_mock_token') {
          setSchools([
             { id: 1, name: '10-maktab (Asosiy)', code: 'SCH-10' },
             { id: 2, name: '10-maktab (Sport zal)', code: 'SCH-10-GYM' }
          ]);
          return;
      }

      const response = await fetch('https://hik-test.tashmeduni.uz/api/v1/settings/school/list/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json'
        }
      });

      if (response.ok) {
        const rawData = await response.json();
        // The API now returns a tree structure, so we must flatten it for the dropdown
        const data = rawData.data || [];
        const flatList = flattenSchools(data);
        setSchools(flatList);
      }
    } catch (error) {
      console.error("Failed to fetch schools", error);
    } finally {
      setIsSchoolsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    fetchSchools();
    setFormData({
        name: '',
        ipAddress: '',
        userName: '',
        password: '',
        type: 'IN',
        school: '',
        ezvizSerialNo: '',
        ezvizVerifyCode: ''
    });
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    if (!formData.school) {
        setFormError("Iltimos, binoni tanlang");
        setIsSubmitting(false);
        return;
    }

    try {
        const token = localStorage.getItem('access_token');
        
        // Demo mode
        if (token === 'demo_mock_token') {
            await new Promise(r => setTimeout(r, 1000));
            setDevices(prev => [...prev, {
                id: Date.now().toString(),
                name: formData.name,
                model: 'Hikvision Demo',
                ipAddress: formData.ipAddress,
                status: 'Online',
                type: 'Terminal',
                location: schools.find(s => s.id.toString() === formData.school)?.name || 'Unknown',
                lastSeen: 'Hozir'
            }]);
            setIsModalOpen(false);
            return;
        }

        const payload = {
            ...formData,
            school: parseInt(formData.school)
        };

        const response = await fetch('https://hik-test.tashmeduni.uz/api/v1/devices/create/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'accept': 'application/json',
                'X-CSRFToken': 'xbzf0YL6lAnGwRfO1S66v2WkgQqf5bq25Mxy5YzYRfcic59cHebn4pmHFIYywFHO' // As requested
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Qurilma yaratishda xatolik');
        }

        // Success
        setIsModalOpen(false);
        // Refresh list logic would go here if we had a list endpoint.
        // For now, update mock state or notify user
        alert("Qurilma muvaffaqiyatli qo'shildi!");

    } catch (err: any) {
        setFormError(err.message);
    } finally {
        setIsSubmitting(false);
    }
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = (device.name + ' ' + device.model + ' ' + device.ipAddress).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || device.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Camera': return <Video className="w-5 h-5 text-blue-500" />;
      case 'Terminal': return <Tablet className="w-5 h-5 text-purple-500" />;
      case 'NVR': return <Server className="w-5 h-5 text-slate-500" />;
      default: return <Video className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Qurilmalar</h2>
          <p className="text-slate-500 dark:text-slate-400">Hikvision kameralar va terminallar boshqaruvi</p>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-sm font-medium">
                <RefreshCw className="w-4 h-4" />
                Yangilash
            </button>
            <button 
                onClick={handleOpenModal}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm text-sm font-medium"
            >
                <Plus className="w-4 h-4" />
                Qurilma qo'shish
            </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Qurilma nomi, IP yoki model bo'yicha qidiring..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-48">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <select 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white cursor-pointer"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">Barcha turlar</option>
            <option value="Camera">Kameralar</option>
            <option value="Terminal">Terminallar</option>
            <option value="NVR">NVR</option>
          </select>
        </div>
      </div>

      {/* Grid View for Devices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDevices.map((device) => (
            <div key={device.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                 <div className={`absolute top-0 right-0 p-3`}>
                    <span className={`flex h-3 w-3 rounded-full ${device.status === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}>
                        <span className={`animate-ping absolute inline-flex h-3 w-3 rounded-full opacity-75 ${device.status === 'Online' ? 'bg-green-400' : 'hidden'}`}></span>
                    </span>
                 </div>
                 
                 <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600 group-hover:border-slate-200 dark:group-hover:border-slate-500 transition-colors">
                        {getTypeIcon(device.type)}
                    </div>
                 </div>

                 <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 truncate" title={device.name}>{device.name}</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-mono text-xs">{device.model}</p>

                 <div className="space-y-2 mb-4">
                     <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">IP Manzil:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-600 text-xs">{device.ipAddress}</span>
                     </div>
                     <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Joylashuv:</span>
                        <span className="text-slate-700 dark:text-slate-200 font-medium">{device.location}</span>
                     </div>
                 </div>
                 
                 <div className="pt-4 border-t border-slate-50 dark:border-slate-700 flex gap-2">
                    <button className="flex-1 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors border border-slate-200 dark:border-slate-600">
                        Sozlash
                    </button>
                    <button className="flex-1 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 rounded-lg transition-colors shadow-sm">
                        Ko'rish
                    </button>
                 </div>
            </div>
        ))}
        {filteredDevices.length === 0 && (
            <div className="col-span-full p-8 text-center text-slate-500 dark:text-slate-400">
                Qurilmalar topilmadi.
            </div>
        )}
      </div>

      {/* Create Device Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/50 shrink-0">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Yangi qurilma qo'shish</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6">
                <form id="createDeviceForm" onSubmit={handleSubmit} className="space-y-4">
                  {formError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
                      {formError}
                    </div>
                  )}

                  <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Bino (Maktab) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                          <select
                            required
                            value={formData.school}
                            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white cursor-pointer"
                            disabled={isSchoolsLoading}
                          >
                            <option value="">Tanlang...</option>
                            {schools.map(school => (
                                <option key={school.id} value={school.id}>{school.name}</option>
                            ))}
                          </select>
                          <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                      </div>
                      {isSchoolsLoading && <p className="text-xs text-primary-500 mt-1">Binolar yuklanmoqda...</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Qurilma Nomi <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          placeholder="Masalan: Kirish darvoza"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          IP Manzil <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.ipAddress}
                          onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                          className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          placeholder="192.168.1.xxx"
                        />
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Login (Username) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.userName}
                          onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                          className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          placeholder="admin"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Parol <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          placeholder="••••••"
                        />
                      </div>
                  </div>

                  <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Turi (Type)
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      >
                        <option value="IN">Kirish (IN)</option>
                        <option value="OUT">Chiqish (OUT)</option>
                      </select>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">Qo'shimcha (Ezviz)</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                              Serial Raqami
                            </label>
                            <input
                              type="text"
                              value={formData.ezvizSerialNo}
                              onChange={(e) => setFormData({ ...formData, ezvizSerialNo: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                              Tasdiqlash Kodi (Verify Code)
                            </label>
                            <input
                              type="text"
                              value={formData.ezvizVerifyCode}
                              onChange={(e) => setFormData({ ...formData, ezvizVerifyCode: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                      </div>
                  </div>
                </form>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/50 shrink-0 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  form="createDeviceForm"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Saqlash
                    </>
                  )}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
