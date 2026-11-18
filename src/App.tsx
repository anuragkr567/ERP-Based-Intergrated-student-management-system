import React, { useEffect, useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { DataModelView } from './components/DataModelView';
import {
  EnrollStudentModal,
  NewStudentPayload,
} from './components/EnrollStudentModal';
import { PowerBiExportView } from './components/PowerBiExportView';
import { ReportPages } from './components/ReportPages';
import { StudentErpView } from './components/StudentErpView';
import { buildInitialStudents, DEPARTMENTS } from './data/erpDataset';
import {
  AcademicYear,
  DepartmentCode,
  FeeStatus,
  FilterState,
  PaymentMode,
  StudentRecord,
  StudentStatus,
  WorkspaceTab,
} from './types/erp';
import { filterStudents } from './utils/analytics';

const STORAGE_KEY = 'campuspulse_erp_students_v1';

const DEFAULT_FILTERS: FilterState = {
  academicYear: 'All',
  department: 'All',
  semester: 'All',
  feeStatus: 'All',
  cgpaBucket: null,
};

export default function App() {
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as StudentRecord[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to seed data
    }
    return buildInitialStudents();
  });

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('reports');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [enrollModalOpen, setEnrollModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch {
      // Ignore storage quota errors
    }
  }, [students]);

  const filteredStudents = useMemo(
    () => filterStudents(students, filters),
    [students, filters]
  );

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) ?? null,
    [students, selectedStudentId]
  );

  const hasActiveFilters =
    filters.academicYear !== 'All' ||
    filters.department !== 'All' ||
    filters.semester !== 'All' ||
    filters.feeStatus !== 'All' ||
    filters.cgpaBucket !== null;

  const handleResetFilters = () => setFilters(DEFAULT_FILTERS);

  const handleInspectStudent = (student: StudentRecord) => {
    setSelectedStudentId(student.id);
    setActiveTab('erp');
  };

  const handleRecordPayment = (studentId: string, amount: number, mode: PaymentMode) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const netFee = s.totalBilled - s.scholarshipAmount;
        const newPaid = Math.min(netFee, s.amountPaid + amount);
        const newStatus: FeeStatus =
          newPaid >= netFee ? 'Paid' : newPaid > 0 ? 'Partial' : 'Overdue';
        return {
          ...s,
          amountPaid: newPaid,
          feeStatus: newStatus,
          daysOverdue: newStatus === 'Paid' ? 0 : s.daysOverdue,
          paymentMode: mode,
          transactions: [
            {
              id: `TXN-${Date.now().toString().slice(-6)}`,
              date: new Date().toISOString().slice(0, 10),
              amount,
              mode,
              reference: `UTR${Math.floor(100000 + Math.random() * 900000)}`,
              remarks:
                newStatus === 'Paid' ? 'Final Tuition Settlement' : 'Partial Installment Receipt',
            },
            ...s.transactions,
          ],
        };
      })
    );
  };

  const handleRecordQuickPayment = (studentId: string) => {
    const target = students.find((s) => s.id === studentId);
    if (!target) return;
    const netFee = target.totalBilled - target.scholarshipAmount;
    const due = Math.max(0, netFee - target.amountPaid);
    if (due > 0) {
      handleRecordPayment(studentId, due, 'Net Banking');
    }
  };

  const handleUpdateStudentAcademics = (
    studentId: string,
    updates: { attendancePct: number; cgpa: number; studentStatus: StudentStatus }
  ) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              attendancePct: updates.attendancePct,
              cgpa: updates.cgpa,
              studentStatus: updates.studentStatus,
            }
          : s
      )
    );
  };

  const handleEnrollStudent = (payload: NewStudentPayload) => {
    const dept = DEPARTMENTS.find((d) => d.code === payload.departmentCode)!;
    const nextNum = students.length + 101;
    const id = `STU-${1001 + students.length}`;
    const rollNumber = `ERP-${payload.academicYear.slice(2, 4)}-${payload.departmentCode}-${nextNum}`;
    const nameSlug = payload.fullName.toLowerCase().replace(/[^a-z]+/g, '.');
    const totalBilled = dept.baseTuition;
    const scholarshipAmount = Math.round((totalBilled * payload.scholarshipPct) / 100);
    const netPayable = totalBilled - scholarshipAmount;
    const feeStatus: FeeStatus =
      payload.initialPaidAmount >= netPayable
        ? 'Paid'
        : payload.initialPaidAmount > 0
          ? 'Partial'
          : 'Overdue';

    const studentStatus: StudentStatus =
      payload.attendancePct < 75 || payload.cgpa < 6.0
        ? 'Probation'
        : payload.semester >= 7
          ? 'Graduating'
          : 'Active';

    const newRecord: StudentRecord = {
      id,
      rollNumber,
      fullName: payload.fullName,
      email: `${nameSlug}@campus.edu.in`,
      phone: '+91 9820011223',
      gender: payload.gender,
      departmentCode: payload.departmentCode,
      departmentName: dept.name,
      academicYear: payload.academicYear,
      semester: payload.semester,
      cgpa: payload.cgpa,
      attendancePct: payload.attendancePct,
      creditsEarned: payload.semester * 20,
      creditsRequired: payload.semester * 20,
      totalBilled,
      scholarshipAmount,
      amountPaid: payload.initialPaidAmount,
      feeStatus,
      daysOverdue: feeStatus === 'Paid' ? 0 : 10,
      paymentMode: payload.paymentMode,
      studentStatus,
      advisor: dept.facultyLead,
      placementOffered: false,
      courses: [
        {
          courseCode: `${payload.departmentCode}101`,
          courseName: `${dept.name} Core Foundations`,
          credits: 4,
          grade: payload.cgpa >= 8.5 ? 'A' : 'B+',
          gradePoints: payload.cgpa >= 8.5 ? 9 : 8,
          attendancePct: payload.attendancePct,
        },
      ],
      monthlyAttendance: ['Aug', 'Sep', 'Oct', 'Nov'].map((month) => ({
        month,
        attendancePct: payload.attendancePct,
        classesHeld: 44,
        classesAttended: Math.round((44 * payload.attendancePct) / 100),
      })),
      transactions:
        payload.initialPaidAmount > 0
          ? [
              {
                id: `TXN-${Date.now().toString().slice(-6)}`,
                date: new Date().toISOString().slice(0, 10),
                amount: payload.initialPaidAmount,
                mode: payload.paymentMode,
                reference: `UTR${Math.floor(100000 + Math.random() * 900000)}`,
                remarks: 'Admission Tuition Settlement',
              },
            ]
          : [],
    };

    setStudents((prev) => [newRecord, ...prev]);
  };

  return (
    <div className="h-screen flex flex-col bg-[#F3F2F1] text-slate-900 overflow-hidden">
      {/* Top Bar Contract: 3 Zones (Brand — 4 Nav Links — 1 Primary Action) */}
      <header className="bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between gap-8 shrink-0">
        <a
          href="#reports"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('reports');
          }}
          className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          CampusPulse BI
        </a>

        <nav className="flex items-center gap-6 overflow-x-auto">
          {(
            [
              { id: 'reports', label: 'BI Reports' },
              { id: 'erp', label: 'Student ERP' },
              { id: 'model', label: 'Data Model' },
              { id: 'export', label: 'Power BI Export' },
            ] as const
          ).map((nav) => {
            const isActive = activeTab === nav.id;
            return (
              <button
                key={nav.id}
                type="button"
                onClick={() => setActiveTab(nav.id)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'border-[#F2C811] text-slate-900'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {nav.label}
              </button>
            );
          })}
        </nav>

        <div className="shrink-0">
          <button
            type="button"
            onClick={() => setEnrollModalOpen(true)}
            className="px-4 py-2 text-xs font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Enroll Student
          </button>
        </div>
      </header>

      {/* Contextual Power BI Slicer Ribbon */}
      {(activeTab === 'reports' || activeTab === 'erp') && (
        <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <label htmlFor="slicer-year" className="text-slate-500 font-medium">
                Academic Year
              </label>
              <select
                id="slicer-year"
                value={filters.academicYear}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    academicYear: e.target.value as 'All' | AcademicYear,
                  }))
                }
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 font-medium focus:outline-none focus:border-[#118DFF]"
              >
                <option value="All">All Years</option>
                <option value="2025-26">2025-26</option>
                <option value="2024-25">2024-25</option>
                <option value="2023-24">2023-24</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label htmlFor="slicer-dept" className="text-slate-500 font-medium">
                Department
              </label>
              <select
                id="slicer-dept"
                value={filters.department}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    department: e.target.value as 'All' | DepartmentCode,
                  }))
                }
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 font-medium focus:outline-none focus:border-[#118DFF]"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label htmlFor="slicer-sem" className="text-slate-500 font-medium">
                Semester
              </label>
              <select
                id="slicer-sem"
                value={filters.semester}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    semester: e.target.value === 'All' ? 'All' : Number(e.target.value),
                  }))
                }
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 font-medium focus:outline-none focus:border-[#118DFF]"
              >
                <option value="All">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label htmlFor="slicer-fee" className="text-slate-500 font-medium">
                Fee Status
              </label>
              <select
                id="slicer-fee"
                value={filters.feeStatus}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    feeStatus: e.target.value as 'All' | FeeStatus,
                  }))
                }
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 font-medium focus:outline-none focus:border-[#118DFF]"
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#118DFF] hover:bg-sky-50 rounded transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Slicers
              </button>
            )}
            <span className="text-slate-500 font-mono tabular-nums">
              {filteredStudents.length} / {students.length} cohort
            </span>
          </div>
        </div>
      )}

      {/* Active Workspace Viewport */}
      {activeTab === 'reports' && (
        <ReportPages
          allStudents={students}
          filteredStudents={filteredStudents}
          filters={filters}
          onUpdateFilters={setFilters}
          onResetFilters={handleResetFilters}
          onInspectStudent={handleInspectStudent}
          onRecordQuickPayment={handleRecordQuickPayment}
        />
      )}

      {activeTab === 'erp' && (
        <StudentErpView
          students={filteredStudents}
          selectedStudent={selectedStudent}
          onSelectStudent={(s) => setSelectedStudentId(s ? s.id : null)}
          onRecordPayment={handleRecordPayment}
          onUpdateStudentAcademics={handleUpdateStudentAcademics}
        />
      )}

      {activeTab === 'model' && <DataModelView />}

      {activeTab === 'export' && <PowerBiExportView students={students} />}

      <EnrollStudentModal
        open={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        onEnroll={handleEnrollStudent}
      />
    </div>
  );
}
