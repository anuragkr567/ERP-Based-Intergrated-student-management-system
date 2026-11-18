import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DEPARTMENTS } from '../data/erpDataset';
import {
  AcademicYear,
  DepartmentCode,
  PaymentMode,
} from '../types/erp';

export interface NewStudentPayload {
  fullName: string;
  gender: 'Female' | 'Male' | 'Non-Binary';
  departmentCode: DepartmentCode;
  academicYear: AcademicYear;
  semester: number;
  cgpa: number;
  attendancePct: number;
  scholarshipPct: number;
  initialPaidAmount: number;
  paymentMode: PaymentMode;
}

interface EnrollStudentModalProps {
  open: boolean;
  onClose: () => void;
  onEnroll: (payload: NewStudentPayload) => void;
}

export const EnrollStudentModal: React.FC<EnrollStudentModalProps> = ({
  open,
  onClose,
  onEnroll,
}) => {
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'Female' | 'Male' | 'Non-Binary'>('Female');
  const [departmentCode, setDepartmentCode] = useState<DepartmentCode>('CSE');
  const [academicYear, setAcademicYear] = useState<AcademicYear>('2025-26');
  const [semester, setSemester] = useState<number>(1);
  const [cgpa, setCgpa] = useState<string>('8.40');
  const [attendancePct, setAttendancePct] = useState<string>('90.0');
  const [scholarshipPct, setScholarshipPct] = useState<string>('10');
  const [initialPaidAmount, setInitialPaidAmount] = useState<string>('148500');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Net Banking');

  if (!open) return null;

  const selectedDept = DEPARTMENTS.find((d) => d.code === departmentCode)!;
  const netPayable = Math.round(
    selectedDept.baseTuition * (1 - Math.min(100, Math.max(0, Number(scholarshipPct) || 0)) / 100)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    onEnroll({
      fullName: fullName.trim(),
      gender,
      departmentCode,
      academicYear,
      semester,
      cgpa: Math.min(10, Math.max(0, Number(cgpa) || 7.5)),
      attendancePct: Math.min(100, Math.max(0, Number(attendancePct) || 85)),
      scholarshipPct: Math.min(100, Math.max(0, Number(scholarshipPct) || 0)),
      initialPaidAmount: Math.min(netPayable, Math.max(0, Number(initialPaidAmount) || 0)),
      paymentMode,
    });
    setFullName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Enroll New Student into ERP
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Immediately updates Student Directory, Fee Ledger, and Power BI visuals
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Deshmukh"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-[#118DFF]"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Female' | 'Male' | 'Non-Binary')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:border-[#118DFF]"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-Binary">Non-Binary</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Department</label>
              <select
                value={departmentCode}
                onChange={(e) => {
                  const code = e.target.value as DepartmentCode;
                  setDepartmentCode(code);
                  const d = DEPARTMENTS.find((x) => x.code === code)!;
                  const sch = Number(scholarshipPct) || 0;
                  setInitialPaidAmount(String(Math.round(d.baseTuition * (1 - sch / 100))));
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:border-[#118DFF]"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Academic Year</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value as AcademicYear)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:border-[#118DFF]"
              >
                <option value="2025-26">2025-26</option>
                <option value="2024-25">2024-25</option>
                <option value="2023-24">2023-24</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:border-[#118DFF]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Initial CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-md focus:outline-none focus:border-[#118DFF]"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Attendance %</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={attendancePct}
                onChange={(e) => setAttendancePct(e.target.value)}
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-md focus:outline-none focus:border-[#118DFF]"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Scholarship %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={scholarshipPct}
                onChange={(e) => setScholarshipPct(e.target.value)}
                className="w-full px-3 py-2 font-mono border border-slate-300 rounded-md focus:outline-none focus:border-[#118DFF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-md">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Initial Fee Paid (Net Payable: ₹{netPayable.toLocaleString('en-IN')})
              </label>
              <input
                type="number"
                min="0"
                max={netPayable}
                value={initialPaidAmount}
                onChange={(e) => setInitialPaidAmount(e.target.value)}
                className="w-full px-3 py-2 font-mono bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#118DFF]"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Channel</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:border-[#118DFF]"
              >
                <option value="Net Banking">Net Banking</option>
                <option value="UPI Instant">UPI Instant</option>
                <option value="Education Loan">Education Loan</option>
                <option value="Scholarship">Scholarship</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-medium bg-[#118DFF] text-white rounded-md hover:bg-[#0078D4] cursor-pointer"
            >
              Confirm Enrollment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
