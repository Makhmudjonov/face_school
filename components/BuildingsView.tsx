import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Loader2, Save, X, Trash2, AlertTriangle, WifiOff, FolderPlus, ChevronRight, ChevronDown, MapPin, CornerDownRight, ScanFace, Layers, Users, Key, Search } from 'lucide-react';
import { School, Device } from '../types';

// Helper to flatten tree for dropdowns
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

// Recursive Component for Tree Items
const BuildingItem: React.FC<{
  node: School;
  onEdit: (school: School) => void;
  onDelete: (school: School) => void;
  onAddChild: (parent: School) => void;
  onAddDevice: (parent: School) => void;
  onEditDevice: (device: Device, parent: School) => void;
  onDeleteDevice: (device: Device) => void;
  onViewDeviceUsers: (device: Device) => void;
  depth?: number;
}> = ({ node, onEdit, onDelete, onAddChild, onAddDevice, onEditDevice, onDeleteDevice, onViewDeviceUsers, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(depth === 0); // Open root by default
  const hasChildren = node.children && node.children.length > 0;
  const hasDevices = node.devices && node.devices.length > 0;
  const isRoot = depth === 0;

  const handleToggle = () => {
    if (hasChildren || hasDevices) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`transition-all select-none`}>
      {/* Node Card/Row */}
      <div 
        onClick={handleToggle}
        className={`
          relative flex items-center justify-between p-3 
          ${isRoot 
            ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm mb-2 z-10' 
            : 'bg-white dark:bg-slate-800 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50'}
          group transition-colors
          ${(hasChildren || hasDevices) ? 'cursor-pointer' : ''}
        `}
        style={{ paddingLeft: `${isRoot ? 16 : (depth * 24) + 16}px` }}
      >
        {/* Connection Lines for deeply nested items */}
        {!isRoot && (
            <div 
                className="absolute left-0 top-0 bottom-0 border-l border-slate-200 dark:border-slate-700" 
                style={{ left: `${(depth * 24) - 10}px` }} 
            />
        )}

        <div className="flex items-center gap-3 overflow-hidden flex-1">
            {/* Toggle Button or Spacer */}
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
                {(hasChildren || hasDevices) ? (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                ) : (
                    <span className="w-4" /> // Spacer
                )}
            </div>

            {/* Icon Wrapper */}
            <div className={`
                shrink-0 flex items-center justify-center rounded-lg transition-colors
                ${isRoot ? 'w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'w-8 h-8 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}
            `}>
                {isRoot ? <Building2 size={20} /> : <MapPin size={16} />}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <h3 className={`font-bold truncate ${isRoot ? 'text-slate-800 dark:text-slate-100 text-base' : 'text-slate-700 dark:text-slate-200 text-sm'}`}>
                        {node.name}
                    </h3>
                    {node.code && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400">
                            {node.code}
                        </span>
                    )}
                </div>
            </div>

            {/* Stats (Badges) */}
            <div className="hidden sm:flex items-center gap-3 mr-4">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600" title="Ichki hududlar soni">
                    <Layers size={14} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{node.children?.length || 0}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600" title="Bog'langan qurilmalar soni">
                    <ScanFace size={14} className="text-slate-400" />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{node.devices?.length || node.device_count || 0}</span>
                </div>
            </div>
        </div>

        {/* Actions */}
        <div 
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()} // Prevent row toggle when clicking actions
        >
             <button 
                onClick={() => onAddDevice(node)}
                className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                title="Shu yerga qurilma qo'shish"
            >
                <ScanFace size={16} />
            </button>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
            <button 
                onClick={() => onAddChild(node)}
                className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Ichki hudud qo'shish"
            >
                <FolderPlus size={16} />
            </button>
            <button 
                onClick={() => onEdit(node)}
                className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Tahrirlash"
            >
                <Edit size={16} />
            </button>
            <button 
                onClick={() => onDelete(node)}
                className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="O'chirish"
            >
                <Trash2 size={16} />
            </button>
        </div>
      </div>

      {/* Children Container (Devices + Sub-Buildings) */}
      {isOpen && (
          <div className="relative">
              {/* Vertical Guide Line for Tree */}
              {isRoot && <div className="absolute left-[38px] top-0 bottom-2 w-px bg-slate-200 dark:bg-slate-700 z-0" />}
              
              <div className="relative z-10">
                  {/* RENDER DEVICES FIRST */}
                  {node.devices && node.devices.map((device) => (
                      <div 
                        key={`dev-${device.id}`}
                        className="relative flex items-center justify-between p-2 pl-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50/80 dark:hover:bg-slate-700/30 group transition-colors"
                        style={{ paddingLeft: `${(depth + 1) * 24 + 16}px` }}
                      >
                         <div className="absolute left-0 top-0 bottom-0 border-l border-slate-200 dark:border-slate-700" style={{ left: `${((depth + 1) * 24) - 10}px` }} />
                         
                         <div className="flex items-center gap-3 overflow-hidden flex-1">
                            {/* Spacer for tree alignment */}
                            <div className="w-6 h-6 shrink-0" /> 
                            
                            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                <ScanFace size={16} />
                            </div>
                            
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{device.name}</h4>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${device.type === 'IN' || !device.type ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800'}`}>
                                        {device.type || device.deviceCategory || 'Terminal'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span>{device.ipAddress || 'IP mavjud emas'}</span>
                                    {device.status && (
                                        <>
                                            <span>•</span>
                                            <span className={device.status === 'Online' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>{device.status}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                         </div>

                         {/* Device Actions */}
                         <div className="flex items-center gap-1">
                            <button 
                                onClick={() => onViewDeviceUsers(device)}
                                className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-1"
                                title="Foydalanuvchilar"
                            >
                                <Users size={16} />
                            </button>
                            <button 
                                onClick={() => onEditDevice(device, node)}
                                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                title="Qurilmani Tahrirlash"
                            >
                                <Edit size={16} />
                            </button>
                            <button 
                                onClick={() => onDeleteDevice(device)}
                                className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Qurilmani O'chirish"
                            >
                                <Trash2 size={16} />
                            </button>
                         </div>
                      </div>
                  ))}

                  {/* RENDER SUB-BUILDINGS */}
                  {node.children && node.children.map((child) => (
                      <BuildingItem 
                        key={child.id} 
                        node={child} 
                        depth={depth + 1}
                        onEdit={onEdit} 
                        onDelete={onDelete} 
                        onAddChild={onAddChild} 
                        onAddDevice={onAddDevice}
                        onEditDevice={onEditDevice}
                        onDeleteDevice={onDeleteDevice}
                        onViewDeviceUsers={onViewDeviceUsers}
                      />
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export const BuildingsView: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [flatSchools, setFlatSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  // Building Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', parentAreaID: '-1' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Device Form Modal state
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [selectedSchoolForDevice, setSelectedSchoolForDevice] = useState<School | null>(null);
  const [currentDevice, setCurrentDevice] = useState<Device | null>(null);
  const [deviceFormData, setDeviceFormData] = useState({
      name: '',
      ipAddress: '',
      userName: '',
      password: '',
      type: 'IN',
      ezvizSerialNo: '',
      ezvizVerifyCode: ''
  });

  // Delete Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'school' | 'device', data: any } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Device Users Modal
  const [isDeviceUsersModalOpen, setIsDeviceUsersModalOpen] = useState(false);
  const [selectedDeviceForUsers, setSelectedDeviceForUsers] = useState<Device | null>(null);
  const [deviceUsers, setDeviceUsers] = useState<any[]>([]); // Mock users

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const token = localStorage.getItem('access_token');
      // Demo rejim
      if (token === 'demo_mock_token') {
          useMockData();
          setLoading(false);
          return;
      }

      const response = await fetch('https://hik-test.tashmeduni.uz/api/v1/settings/school/list/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Ma\'lumotlarni yuklashda xatolik');
      }

      const rawData = await response.json();
      const data = rawData.data || [];
      setSchools(data);
      setFlatSchools(flattenSchools(data));
      setIsOfflineMode(false);
    } catch (err: any) {
      console.warn("API Error, falling back to mock data:", err);
      useMockData();
      setIsOfflineMode(true);
      setError(null); 
    } finally {
      setLoading(false);
    }
  };

  const useMockData = () => {
      // User provided mock structure
      const mockData: School[] = [
        {
            "id": 9,
            "name": "12311 (Asosiy Bino)",
            "area_id": "ad7cf58ac8f940b5b9a408957b36ec41",
            "parentAreaID": "-1",
            "created_at": "2026-02-01T04:48:36.897155+05:00",
            "updated_at": "2026-02-01T04:48:36.897197+05:00",
            "has_children": true,
            "device_count": 1,
            "level": 0,
            "children": [
              {
                "id": 10,
                "name": "12312h (1-qavat)",
                "area_id": "84363c0035944b33a26da0bfa29e24a5",
                "parentAreaID": "ad7cf58ac8f940b5b9a408957b36ec41",
                "created_at": "2026-02-01T04:48:44.868694+05:00",
                "updated_at": "2026-02-01T04:48:44.868715+05:00",
                "has_children": true,
                "device_count": 0,
                "level": 1,
                "children": [
                  {
                    "id": 11,
                    "name": "sfdffds (Sinf xona)",
                    "area_id": "dc3efb7c1e144842a2c5630378bfce43",
                    "parentAreaID": "84363c0035944b33a26da0bfa29e24a5",
                    "created_at": "2026-02-01T05:15:26.502033+05:00",
                    "updated_at": "2026-02-01T05:15:26.502084+05:00",
                    "has_children": false,
                    "device_count": 0,
                    "level": 2,
                    "children": [],
                    "devices": []
                  }
                ],
                "devices": []
              }
            ],
            "devices": [
              {
                "id": 2,
                "name": "Test uchun",
                "hikcentral_device_id": "70ac6924fb514f50adaf78e43cabf56d",
                "ezvizSerialNo": "FS1264438",
                "ipAddress": "192.168.14.15",
                "deviceCategory": null,
                "type": "IN",
                "status": "Online"
              }
            ]
        }
      ];
      setSchools(mockData);
      setFlatSchools(flattenSchools(mockData));
  };

  // --- DELETE LOGIC ---

  const confirmDeleteSchool = (school: School) => {
    setItemToDelete({ type: 'school', data: school });
    setIsDeleteModalOpen(true);
    setError(null);
  };

  const confirmDeleteDevice = (device: Device) => {
      setItemToDelete({ type: 'device', data: device });
      setIsDeleteModalOpen(true);
      setError(null);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      const token = localStorage.getItem('access_token');
      
      if (token === 'demo_mock_token' || isOfflineMode) {
          await new Promise(r => setTimeout(r, 600)); 
          setItemToDelete(null);
          setIsDeleteModalOpen(false);
          fetchSchools(); 
          return;
      }

      let url = '';
      if (itemToDelete.type === 'school') {
          url = `https://hik-test.tashmeduni.uz/api/v1/settings/school/create/${itemToDelete.data.id}/delete_school/`;
      } else {
          url = `https://hik-test.tashmeduni.uz/api/v1/devices/${itemToDelete.data.id}/delete/`;
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json'
        }
      });

      if (response.ok) {
        setItemToDelete(null);
        setIsDeleteModalOpen(false);
        fetchSchools(); 
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || "O'chirishda xatolik yuz berdi");
      }
    } catch (err: any) {
      if (err.message.includes('Failed to fetch')) {
         setIsOfflineMode(true);
         setItemToDelete(null);
         setIsDeleteModalOpen(false);
      } else {
         setError(err.message);
         setIsDeleteModalOpen(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // --- SCHOOL FORM LOGIC ---

  const handleOpenModal = (schoolToEdit?: School, parentAreaID: string = '-1') => {
    setFormError(null);
    if (schoolToEdit) {
      setCurrentSchool(schoolToEdit);
      setFormData({ 
          name: schoolToEdit.name, 
          code: schoolToEdit.code || '', 
          parentAreaID: schoolToEdit.parentAreaID || '-1' 
      });
    } else {
      setCurrentSchool(null);
      setFormData({ name: '', code: '', parentAreaID: parentAreaID });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    const token = localStorage.getItem('access_token');

    if (token === 'demo_mock_token' || isOfflineMode) {
        await new Promise(r => setTimeout(r, 600));
        setIsModalOpen(false);
        alert("Demo rejimda ma'lumotlar saqlandi");
        setIsSubmitting(false);
        return;
    }

    try {
      const isUpdate = !!currentSchool;
      const url = isUpdate
        ? `https://hik-test.tashmeduni.uz/api/v1/settings/school/update/${currentSchool.id}/`
        : 'https://hik-test.tashmeduni.uz/api/v1/settings/school/create/';
      
      const method = isUpdate ? 'PUT' : 'POST';

      const bodyPayload = isUpdate 
        ? { name: formData.name, code: formData.code }
        : { 
            name: formData.name, 
            code: formData.code, 
            parentAreaID: formData.parentAreaID
          };

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'X-CSRFToken': '0DdmJZNi4SoTNJ2KJh5irlzSB9OU7xHT4ZsgTmYxExlFvf3xvl2CBTP3WjkSwioo'
        },
        body: JSON.stringify(bodyPayload)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || 'Saqlashda xatolik yuz berdi');
      }

      await fetchSchools(); 
      setIsModalOpen(false);
    } catch (err: any) {
       if (err.message.includes('Failed to fetch')) {
          setIsOfflineMode(true);
          setIsModalOpen(false);
       } else {
          setFormError(err.message);
       }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- DEVICE FORM LOGIC ---

  const handleOpenDeviceModal = (school: School) => {
      setSelectedSchoolForDevice(school);
      setCurrentDevice(null);
      setDeviceFormData({
          name: '',
          ipAddress: '',
          userName: '',
          password: '',
          type: 'IN',
          ezvizSerialNo: '',
          ezvizVerifyCode: ''
      });
      setIsDeviceModalOpen(true);
      setFormError(null);
  };

  const handleEditDevice = (device: Device, parent: School) => {
      setSelectedSchoolForDevice(parent);
      setCurrentDevice(device);
      setDeviceFormData({
          name: device.name,
          ipAddress: device.ipAddress || '',
          userName: device.userName || '',
          password: device.password || '',
          type: (device.type === 'IN' || device.type === 'OUT') ? device.type : 'IN',
          ezvizSerialNo: device.ezvizSerialNo || '',
          ezvizVerifyCode: device.ezvizVerifyCode || ''
      });
      setIsDeviceModalOpen(true);
      setFormError(null);
  };

  const handleDeviceSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedSchoolForDevice) return;
      
      setIsSubmitting(true);
      setFormError(null);

      try {
          const token = localStorage.getItem('access_token');
          
          if (token === 'demo_mock_token' || isOfflineMode) {
              await new Promise(r => setTimeout(r, 1000));
              alert(currentDevice ? "Qurilma yangilandi (Demo)" : "Qurilma qo'shildi (Demo)");
              setIsDeviceModalOpen(false);
              return;
          }

          const isUpdate = !!currentDevice;
          const url = isUpdate 
             ? `https://hik-test.tashmeduni.uz/api/v1/devices/${currentDevice.id}/update/`
             : 'https://hik-test.tashmeduni.uz/api/v1/devices/create/';
          
          const method = isUpdate ? 'PUT' : 'POST';

          const payload = {
              ...deviceFormData,
              school: selectedSchoolForDevice.id 
          };

          const response = await fetch(url, {
              method: method,
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                  'accept': 'application/json',
                  'X-CSRFToken': 'xbzf0YL6lAnGwRfO1S66v2WkgQqf5bq25Mxy5YzYRfcic59cHebn4pmHFIYywFHO'
              },
              body: JSON.stringify(payload)
          });

          if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.detail || errorData.message || 'Qurilma saqlashda xatolik');
          }

          alert(isUpdate ? "Qurilma yangilandi" : "Qurilma muvaffaqiyatli qo'shildi!");
          setIsDeviceModalOpen(false);
          fetchSchools(); 
      } catch (err: any) {
          setFormError(err.message);
      } finally {
          setIsSubmitting(false);
      }
  };

  // --- DEVICE USERS LOGIC ---

  const handleViewDeviceUsers = (device: Device) => {
      setSelectedDeviceForUsers(device);
      // Mock Users Data Generation based on device ID
      const mockUsers = [
          { id: 101, name: 'Aziz Rahimov', role: 'Student', image: null },
          { id: 102, name: 'Malika Karimova', role: 'Student', image: null },
          { id: 201, name: 'Dilshod Akbarov', role: 'Teacher', image: null },
      ];
      setDeviceUsers(mockUsers);
      setIsDeviceUsersModalOpen(true);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Binolar va Qurilmalar</h2>
          <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
             Tashkilot tuzilmasi, joylashuvlar va biriktirilgan qurilmalar
             {isOfflineMode && (
                 <span className="text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                     <WifiOff className="w-3 h-3" /> Offline (Demo)
                 </span>
             )}
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal(undefined, '-1')}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm text-sm font-medium"
        >
            <Plus className="w-4 h-4" />
            Asosiy Bino Qo'shish
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center gap-2 animate-fade-in">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Tree View Container */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden p-2">
        {schools.map((school) => (
            <BuildingItem 
                key={school.id} 
                node={school} 
                onEdit={(s) => handleOpenModal(s)}
                onDelete={confirmDeleteSchool}
                onAddChild={(parent) => handleOpenModal(undefined, parent.area_id)}
                onAddDevice={handleOpenDeviceModal}
                onEditDevice={handleEditDevice}
                onDeleteDevice={confirmDeleteDevice}
                onViewDeviceUsers={handleViewDeviceUsers}
            />
        ))}
        
        {schools.length === 0 && !loading && (
             <div className="py-12 text-center border-dashed dark:border-slate-700">
                <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">Binolar mavjud emas</p>
                <p className="text-sm text-slate-400 dark:text-slate-500">Yangi bino qo'shish uchun yuqoridagi tugmani bosing</p>
             </div>
        )}
      </div>

      {/* Building Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {currentSchool ? 'Binoni tahrirlash' : 'Yangi bino/hudud qo\'shish'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                 <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
                   {formError}
                 </div>
              )}

              {!currentSchool && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl mb-4">
                      <label className="block text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-2">
                        Joylashuv (Ota bino)
                      </label>
                      <select
                        value={formData.parentAreaID}
                        onChange={(e) => setFormData({ ...formData, parentAreaID: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 dark:text-white"
                      >
                        <option value="-1">⚡ Asosiy Bino (Hech qayerga kirmaydi)</option>
                        {flatSchools.map(option => (
                           <option key={option.id} value={option.area_id || option.id}>
                              {option.level ? '—'.repeat(option.level) + ' ' : ''}↳ {option.name}
                           </option>
                        ))}
                      </select>
                  </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Bino nomi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="Masalan: 10-maktab yoki 2-qavat"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Bino kodi
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="Masalan: BLK-1 (Ixtiyoriy)"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
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
            </form>
          </div>
        </div>
      )}

      {/* Device Creation/Edit Modal */}
      {isDeviceModalOpen && selectedSchoolForDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/50 shrink-0">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                 <ScanFace className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                 {currentDevice ? 'Qurilmani Tahrirlash' : 'Yangi qurilma qo\'shish'}
              </h3>
              <button 
                onClick={() => setIsDeviceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6">
                <form id="createDeviceForm" onSubmit={handleDeviceSubmit} className="space-y-4">
                  {formError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
                      {formError}
                    </div>
                  )}

                  {/* Read-only School Selection */}
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl">
                      <label className="block text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-1">
                        Tanlangan Bino
                      </label>
                      <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-medium">
                          <MapPin className="w-4 h-4" />
                          {selectedSchoolForDevice.name}
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Qurilma Nomi <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={deviceFormData.name}
                          onChange={(e) => setDeviceFormData({ ...deviceFormData, name: e.target.value })}
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
                          value={deviceFormData.ipAddress}
                          onChange={(e) => setDeviceFormData({ ...deviceFormData, ipAddress: e.target.value })}
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
                          value={deviceFormData.userName}
                          onChange={(e) => setDeviceFormData({ ...deviceFormData, userName: e.target.value })}
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
                          value={deviceFormData.password}
                          onChange={(e) => setDeviceFormData({ ...deviceFormData, password: e.target.value })}
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
                        value={deviceFormData.type}
                        onChange={(e) => setDeviceFormData({ ...deviceFormData, type: e.target.value })}
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
                              value={deviceFormData.ezvizSerialNo}
                              onChange={(e) => setDeviceFormData({ ...deviceFormData, ezvizSerialNo: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                              Tasdiqlash Kodi (Verify Code)
                            </label>
                            <input
                              type="text"
                              value={deviceFormData.ezvizVerifyCode}
                              onChange={(e) => setDeviceFormData({ ...deviceFormData, ezvizVerifyCode: e.target.value })}
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
                  onClick={() => setIsDeviceModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  form="createDeviceForm"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all scale-100 p-6">
             <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{itemToDelete?.type === 'school' ? "Binoni o'chirish" : "Qurilmani o'chirish"}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                    Haqiqatan ham <span className="font-semibold text-slate-800 dark:text-slate-200">"{itemToDelete?.data?.name}"</span> ni o'chirmoqchimisiz?
                </p>
                <div className="flex gap-3 w-full">
                    <button 
                        onClick={() => setIsDeleteModalOpen(false)}
                        className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                    >
                        Bekor qilish
                    </button>
                    <button 
                        onClick={executeDelete}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "O'chirish"}
                    </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Device Users Modal */}
      {isDeviceUsersModalOpen && selectedDeviceForUsers && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
               <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/50 shrink-0">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                          <Users className="w-6 h-6" />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Qurilma Foydalanuvchilari</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{selectedDeviceForUsers.name}</p>
                      </div>
                  </div>
                  <button 
                    onClick={() => setIsDeviceUsersModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
               </div>
               
               <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-700/30">
                  <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="text" 
                        placeholder="Foydalanuvchi qidirish..." 
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                  </div>
               </div>

               <div className="overflow-y-auto p-2">
                  {deviceUsers.length > 0 ? (
                      <div className="space-y-1">
                          {deviceUsers.map(user => (
                              <div key={user.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold text-xs border border-slate-300 dark:border-slate-600">
                                          {user.image ? <img src={user.image} className="w-full h-full object-cover rounded-full" /> : user.name[0]}
                                      </div>
                                      <div>
                                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                                          <p className="text-xs text-slate-500 dark:text-slate-400">{user.role} • ID: {user.id}</p>
                                      </div>
                                  </div>
                                  <button className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-2">
                                      <Trash2 size={16} />
                                  </button>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="py-12 text-center text-slate-400">
                          <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Foydalanuvchilar topilmadi</p>
                      </div>
                  )}
               </div>

               <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/50 text-center">
                  <button 
                    onClick={() => setIsDeviceUsersModalOpen(false)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                  >
                    Yopish
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};