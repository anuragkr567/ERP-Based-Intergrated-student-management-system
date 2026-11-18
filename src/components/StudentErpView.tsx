import React, { useMemo, useState } from 'react';
import { Download, Search, X } from 'lucide-react';
import { PaymentMode, StudentRecord, StudentStatus } from '../types/erp';
import { formatCurrencyFull, studentsToCsv, triggerDownload } from '../utils/analytics';

interface StudentErpViewProps {
  students: StudentRecord[];
  selectedStudent: StudentRecord | null;
  onSelectStudent: (student: StudentRecord | null) => void;
  onRecordPayment: (studentId: string, amount: number, mode: PaymentMode) => void;
  onUpdateStudentAcademics: (
    studentId: string,
    updates: { attendancePct: number; cgpa: number; studentStatus: StudentStatus }
  ) => void;
}

export const StudentErpView: React.FC<StudentErpViewProps> = ({
  students,
  selectedStudent,
  onSelectStudent,
  onRecordPayment,
  onUpdateStudentAcademics,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | StudentStatus>('All');
  const [drawerTab, setDrawerTab] = useState<'overview' | 'academics' | 'fees'>('overview');

  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<PaymentMode>('UPI Instant');

  const [editAttendance, setEditAttendance] = useState('');
  const [editCgpa, setEditCgpa] = useState('');
  const [editStatus, setEditStatus] = useState<StudentStatus>('Active');

  const displayedStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return students.filter((s) => {
      if (statusFilter !== 'All' && s.studentStatus !== statusFilter) return false;
      if (!q) return true;
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.departmentCode.toLowerCase().includes(q) ||
        s.advisor.toLowerCase().includes(q)
      );
    });
  }, [students, searchQuery, statusFilter]);

  const openDrawer = (student: StudentRecord) => {
    onSelectStudent(student);
    setDrawerTab('overview');
    const netFee = student.totalBilled - student.scholarshipAmount;
    const due = Math.max(0, netFee - student.amountPaid);
    setPayAmount(due > 0 ? String(due) : '');
    setEditAttendance(String(student.attendancePct));
    setEditCgpa(String(student.cgpa));
    setEditStatus(student.studentStatus);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const numeric = Number(payAmount);
    if (!Number.isFinite(numeric) || numeric <= 0) return;
    onRecordPayment(selectedStudent.id, numeric, payMode);
    setPayAmount('');
  };

  const handleAcademicsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const att = Math.min(100, Math.max(0, Number(editAttendance)));
    const cg = Math.min(10, Math.max(0, Number(editCgpa)));
    if (!Number.isFinite(att) || !Number.isFinite(cg)) return;
    onUpdateStudentAcademics(selectedStudent.id, {
      attendancePct: Number(att.toFixed(1)),
      cgpa: Number(cg.toFixed(2)),
      studentStatus: editStatus,
    });
  };

  const handleExportCsv = () => {
    triggerDownload(
      'CampusPulse_Student_ERP.csv',
      studentsToCsv(displayedStudents),
      'text/csv;charset=utf-8;'
    );
  };

  return (
    <div className="flex-1 overflow-y-auto pbi-scroll p-5 relative">
      <div className="max-w-[1360px] mx-auto space-y-4">
        {/* Toolbar */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student name, roll number, email, or advisor..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#118DFF]"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md w-fit">
              {(['All', 'Active', 'Probation', 'Graduating'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              {displayedStudents.length} records
            </span>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export Filtered CSV
            </button>
          </div>
        </div>

        {/* ERP Directory Grid */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          {displayedStudents.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-slate-800">No matching students found</p>
              <p className="text-xs text-slate-500 mt-1">
                Try clearing your search query or switching status tabs.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 px-4 font-medium">Roll Number</th>
                    <th className="py-2.5 px-3 font-medium">Student Name</th>
                    <th className="py-2.5 px-3 font-medium">Department</th>
                    <th className="py-2.5 px-3 font-medium text-right">Sem</th>
                    <th className="py-2.5 px-3 font-medium text-right">CGPA</th>
                    <th className="py-2.5 px-3 font-medium text-right">Attendance</th>
                    <th className="py-2.5 px-3 font-medium text-right">Balance Due</th>
                    <th className="py-2.5 px-3 font-medium">Fee Status</th>
                    <th className="py-2.5 px-3 font-medium">Academic State</th>
                    <th className="py-2.5 px-4 font-medium text-right">ERP File</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 tabular-nums">
                  {displayedStudents.map((s) => {
                    const netFee = s.totalBilled - s.scholarshipAmount;
                    const balanceDue = Math.max(0, netFee - s.amountPaid);
                    const isSelected = selectedStudent?.id === s.id;
                    return (
                      <tr
                        key={s.id}
                        onClick={() => openDrawer(s)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-sky-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                          {s.rollNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-900">{s.fullName}</div>
                          <div className="text-[11px] text-slate-400">{s.email}</div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                          {s.departmentCode} · {s.academicYear}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                          {s.semester}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-mono font-medium ${
                            s.cgpa < 6.0 ? 'text-rose-700' : 'text-slate-900'
                          }`}
                        >
                          {s.cgpa.toFixed(2)}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-mono ${
                            s.attendancePct < 75 ? 'text-rose-700 font-medium' : 'text-slate-700'
                          }`}
                        >
                          {s.attendancePct.toFixed(1)}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                          {formatCurrencyFull(balanceDue)}
                        </td>
                        <td className="py-2.5 px-3 font-medium">
                          <span
                            className={
                              s.feeStatus === 'Paid'
                                ? 'text-emerald-700'
                                : s.feeStatus === 'Partial'
                                  ? 'text-amber-700'
                                  : 'text-rose-700'
                            }
                          >
                            {s.feeStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{s.studentStatus}</td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDrawer(s);
                            }}
                            className="text-xs font-medium text-[#118DFF] hover:underline cursor-pointer"
                          >
                            Open 360°
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Student 360 ERP Slide-Over Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/25">
          <div className="w-full max-w-xl bg-white h-full border-l border-slate-200 shadow-xl flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-slate-500">
                  {selectedStudent.rollNumber} · {selectedStudent.id}
                </div>
                <h2 className="text-lg font-semibold text-slate-900 mt-0.5">
                  {selectedStudent.fullName}
                </h2>
                <div className="text-xs text-slate-500 mt-0.5">
                  {selectedStudent.departmentName} · Semester {selectedStudent.semester} · Advisor:{' '}
                  {selectedStudent.advisor}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectStudent(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Sub-tabs */}
            <div className="px-5 border-b border-slate-200 flex items-center gap-6 text-xs font-medium">
              {(
                [
                  { id: 'overview', label: 'Profile & Status' },
                  { id: 'academics', label: 'Transcript & Attendance' },
                  { id: 'fees', label: 'Fee Ledger & Receipts' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDrawerTab(tab.id)}
                  className={`py-3 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    drawerTab === tab.id
                      ? 'border-[#118DFF] text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto pbi-scroll p-5 space-y-5">
              {drawerTab === 'overview' && (
                <>
                  <div className="grid grid-cols-3 gap-3 tabular-nums">
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-md">
                      <div className="text-[11px] text-slate-500">Cumulative GPA</div>
                      <div className="text-xl font-semibold text-slate-900 mt-0.5">
                        {selectedStudent.cgpa.toFixed(2)}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-md">
                      <div className="text-[11px] text-slate-500">Attendance</div>
                      <div className="text-xl font-semibold text-slate-900 mt-0.5">
                        {selectedStudent.attendancePct.toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-md">
                      <div className="text-[11px] text-slate-500">Credits Earned</div>
                      <div className="text-xl font-semibold text-slate-900 mt-0.5">
                        {selectedStudent.creditsEarned}/{selectedStudent.creditsRequired}
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-md divide-y divide-slate-100 text-xs">
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-slate-500">University Email</span>
                      <span className="font-mono text-slate-800">{selectedStudent.email}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-slate-500">Contact Number</span>
                      <span className="font-mono text-slate-800">{selectedStudent.phone}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-slate-500">Cohort Academic Year</span>
                      <span className="font-mono text-slate-800">{selectedStudent.academicYear}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-slate-500">Academic Standing</span>
                      <span className="font-medium text-slate-900">{selectedStudent.studentStatus}</span>
                    </div>
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="text-slate-500">Campus Placement</span>
                      <span className="font-medium text-slate-900">
                        {selectedStudent.placementOffered
                          ? `${selectedStudent.placementCompany} (₹${selectedStudent.placementPackageLpa} LPA)`
                          : 'Not yet placed / In progress'}
                      </span>
                    </div>
                  </div>

                  {/* Live Academic Update Form */}
                  <form
                    onSubmit={handleAcademicsSubmit}
                    className="border border-slate-200 rounded-md p-4 space-y-3"
                  >
                    <h4 className="text-xs font-semibold text-slate-900">
                      Update ERP Academic Standing
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">
                          Attendance %
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={editAttendance}
                          onChange={(e) => setEditAttendance(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:outline-none focus:border-[#118DFF]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">CGPA</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={editCgpa}
                          onChange={(e) => setEditCgpa(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:outline-none focus:border-[#118DFF]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Status</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as StudentStatus)}
                          className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:border-[#118DFF]"
                        >
                          <option value="Active">Active</option>
                          <option value="Probation">Probation</option>
                          <option value="Graduating">Graduating</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 text-xs font-medium bg-slate-900 text-white rounded hover:bg-slate-800 cursor-pointer"
                    >
                      Save Academic Update
                    </button>
                  </form>
                </>
              )}

              {drawerTab === 'academics' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 mb-2">
                      Enrolled Course Transcript
                    </h4>
                    <table className="w-full text-left border-collapse text-xs border border-slate-200 rounded">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                          <th className="py-2 px-3 font-medium">Code</th>
                          <th className="py-2 px-2 font-medium">Course Title</th>
                          <th className="py-2 px-2 font-medium text-right">Credits</th>
                          <th className="py-2 px-2 font-medium text-right">Att %</th>
                          <th className="py-2 px-3 font-medium text-right">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 tabular-nums">
                        {selectedStudent.courses.map((c) => (
                          <tr key={c.courseCode}>
                            <td className="py-2 px-3 font-mono text-slate-600">{c.courseCode}</td>
                            <td className="py-2 px-2 text-slate-900">{c.courseName}</td>
                            <td className="py-2 px-2 text-right font-mono">{c.credits}</td>
                            <td className="py-2 px-2 text-right font-mono">
                              {c.attendancePct.toFixed(1)}%
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900">
                              {c.grade}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 mb-2">
                      Monthly Biometric & LMS Attendance Log
                    </h4>
                    <table className="w-full text-left border-collapse text-xs border border-slate-200 rounded">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                          <th className="py-2 px-3 font-medium">Month</th>
                          <th className="py-2 px-2 font-medium text-right">Scheduled</th>
                          <th className="py-2 px-2 font-medium text-right">Attended</th>
                          <th className="py-2 px-3 font-medium text-right">Compliance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 tabular-nums">
                        {selectedStudent.monthlyAttendance.map((m) => (
                          <tr key={m.month}>
                            <td className="py-2 px-3 font-medium text-slate-800">{m.month} 2026</td>
                            <td className="py-2 px-2 text-right font-mono">{m.classesHeld}</td>
                            <td className="py-2 px-2 text-right font-mono">{m.classesAttended}</td>
                            <td
                              className={`py-2 px-3 text-right font-mono font-medium ${
                                m.attendancePct < 75 ? 'text-rose-700' : 'text-emerald-700'
                              }`}
                            >
                              {m.attendancePct.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {drawerTab === 'fees' && (
                <div className="space-y-4">
                  {(() => {
                    const netFee =
                      selectedStudent.totalBilled - selectedStudent.scholarshipAmount;
                    const balanceDue = Math.max(0, netFee - selectedStudent.amountPaid);
                    return (
                      <>
                        <div className="border border-slate-200 rounded-md divide-y divide-slate-100 text-xs tabular-nums">
                          <div className="flex justify-between px-4 py-2.5">
                            <span className="text-slate-500">Gross Term Tuition</span>
                            <span className="font-mono text-slate-800">
                              {formatCurrencyFull(selectedStudent.totalBilled)}
                            </span>
                          </div>
                          <div className="flex justify-between px-4 py-2.5">
                            <span className="text-slate-500">Scholarship Offset</span>
                            <span className="font-mono text-emerald-700">
                              -{formatCurrencyFull(selectedStudent.scholarshipAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between px-4 py-2.5">
                            <span className="text-slate-500">Amount Collected</span>
                            <span className="font-mono text-slate-900 font-medium">
                              {formatCurrencyFull(selectedStudent.amountPaid)}
                            </span>
                          </div>
                          <div className="flex justify-between px-4 py-2.5 bg-slate-50">
                            <span className="font-semibold text-slate-900">Outstanding Balance</span>
                            <span
                              className={`font-mono font-semibold ${
                                balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'
                              }`}
                            >
                              {formatCurrencyFull(balanceDue)}
                            </span>
                          </div>
                        </div>

                        {balanceDue > 0 && (
                          <form
                            onSubmit={handlePaymentSubmit}
                            className="border border-slate-200 rounded-md p-4 space-y-3"
                          >
                            <h4 className="text-xs font-semibold text-slate-900">
                              Record Fee Receipt
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] text-slate-500 mb-1">
                                  Amount (INR)
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max={balanceDue}
                                  value={payAmount}
                                  onChange={(e) => setPayAmount(e.target.value)}
                                  required
                                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:outline-none focus:border-[#118DFF]"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-slate-500 mb-1">
                                  Payment Rail
                                </label>
                                <select
                                  value={payMode}
                                  onChange={(e) => setPayMode(e.target.value as PaymentMode)}
                                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:border-[#118DFF]"
                                >
                                  <option value="UPI Instant">UPI Instant</option>
                                  <option value="Net Banking">Net Banking</option>
                                  <option value="Education Loan">Education Loan</option>
                                  <option value="Scholarship">Scholarship</option>
                                </select>
                              </div>
                            </div>
                            <button
                              type="submit"
                              className="px-3.5 py-1.5 text-xs font-medium bg-[#118DFF] text-white rounded hover:bg-[#0078D4] cursor-pointer"
                            >
                              Post Receipt to Ledger
                            </button>
                          </form>
                        )}

                        <div>
                          <h4 className="text-xs font-semibold text-slate-900 mb-2">
                            Posted Fee Vouchers
                          </h4>
                          {selectedStudent.transactions.length === 0 ? (
                            <p className="text-xs text-slate-500">No fee receipts posted yet.</p>
                          ) : (
                            <div className="space-y-2">
                              {selectedStudent.transactions.map((tx) => (
                                <div
                                  key={tx.id}
                                  className="p-3 border border-slate-200 rounded-md flex items-center justify-between text-xs tabular-nums"
                                >
                                  <div>
                                    <div className="font-medium text-slate-900">{tx.remarks}</div>
                                    <div className="text-[11px] font-mono text-slate-500">
                                      {tx.id} · {tx.date} · {tx.mode} · {tx.reference}
                                    </div>
                                  </div>
                                  <div className="font-mono font-semibold text-emerald-700">
                                    {formatCurrencyFull(tx.amount)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
