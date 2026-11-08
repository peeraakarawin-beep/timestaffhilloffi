import React, { useState } from 'react';
import { Employee } from '../types';
import {
  Users,
  UserPlus,
  CheckCircle2,
  Smile,
  Mail,
  Phone,
  Briefcase,
  Sparkles,
  Trash2,
  X,
  Camera,
} from 'lucide-react';

interface EmployeeManagerProps {
  employees: Employee[];
  onAddEmployee: (emp: Employee) => void;
  onDeleteEmployee: (empId: string) => void;
}

export const EmployeeManager: React.FC<EmployeeManagerProps> = ({
  employees,
  onAddEmployee,
  onDeleteEmployee,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [department, setDepartment] = useState<string>('Technology');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  );

  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nickname.trim()) return;

    const newEmp: Employee = {
      id: 'emp-' + Date.now(),
      code: `EMP-${Math.floor(100 + employees.length + 1)}`,
      name: name.trim(),
      nickname: nickname.trim(),
      role: role.trim() || 'Team Member',
      department: department || 'General',
      avatar: selectedAvatarUrl,
      enrolledFace: true,
      email: email.trim() || `${nickname.toLowerCase()}@timecute.co`,
      phone: phone.trim() || '08X-XXX-XXXX',
      status: 'active',
    };

    onAddEmployee(newEmp);
    setShowAddModal(false);
    setName('');
    setNickname('');
    setRole('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>ทำเนียบพนักงานและข้อมูลการลงทะเบียนใบหน้า</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            พนักงานทุกคนในระบบสามารถใช้ใบหน้าสแกนเข้า-ออกงานได้ทันที
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-pink-200 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>เพิ่มพนักงานใหม่</span>
        </button>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className="bg-white rounded-3xl p-5 shadow-xs border border-purple-100 hover:border-purple-200 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-100 shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] shadow-xs">
                      <Camera className="w-3 h-3" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-800">{emp.name}</h3>
                      <span className="text-xs font-bold text-pink-600">({emp.nickname})</span>
                    </div>
                    <p className="text-xs text-slate-500">{emp.role}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold text-[10px] border border-purple-100">
                      {emp.code}
                    </span>
                  </div>
                </div>

                {employees.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`ต้องการลบข้อมูลพนักงาน ${emp.name} หรือไม่?`)) {
                        onDeleteEmployee(emp.id);
                      }
                    }}
                    className="p-1.5 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    title="ลบพนักงาน"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Department & contact info */}
              <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-100 text-xs space-y-1.5 text-slate-600">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                  <span>แผนก: {emp.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-pink-500" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{emp.phone}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> ลงทะเบียนใบหน้าแล้ว
              </span>
              <span className="text-slate-400">สถานะ: ปกติ</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-pink-500" />
                <span>ลงทะเบียนพนักงานใหม่</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              {/* Avatar Selector */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                  เลือกรูปประจำตัว (Avatar)
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {avatarPresets.map((uri, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatarUrl(uri)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 shrink-0 transition-transform ${
                        selectedAvatarUrl === uri
                          ? 'border-pink-500 scale-110 shadow-md ring-2 ring-pink-300'
                          : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={uri} alt="Avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    ชื่อ-นามสกุล *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น สมใจ รุ่งเรือง"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    ชื่อเล่น (Nickname) *
                  </label>
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="เช่น จอย"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    ตำแหน่ง (Role)
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="เช่น Graphic Designer"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    แผนก (Department)
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-700"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Design & UX">Design & UX</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance & Ops">Finance & Ops</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  อีเมล (Email)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081-234-5678"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-700"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold shadow-md shadow-pink-200"
                >
                  บันทึกพนักงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
