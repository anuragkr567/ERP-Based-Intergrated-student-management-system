import React, { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
} from 'lucide-react';
import {
  ADMISSIONS_FUNNEL,
  DAX_MEASURES,
  TOP_RECRUITERS,
} from '../data/erpDataset';
import {
  DepartmentCode,
  FeeStatus,
  FilterState,
  ReportPageId,
  StudentRecord,
} from '../types/erp';
import {
  computeAgingBuckets,
  computeCgpaHistogram,
  computeDepartmentBreakdown,
  computeFeeStatusBreakdown,
  computeKpis,
  computeMonthlyTrends,
  computePaymentModes,
  evaluateDaxMeasure,
  formatCurrencyFull,
  formatCurrencyINR,
  isAtRiskStudent,
} from '../utils/analytics';
import {
  AdmissionsFunnelChart,
  AttendanceCgpaScatterChart,
  AttendanceTrendChart,
  CgpaHistogramChart,
  DeptBarComboChart,
  FeeStatusDonutChart,
  PbiKpiCard,
} from './PowerBiCharts';

interface ReportPagesProps {
  allStudents: StudentRecord[];
  filteredStudents: StudentRecord[];
  filters: FilterState;
  onUpdateFilters: (updater: (prev: FilterState) => FilterState) => void;
  onResetFilters: () => void;
  onInspectStudent: (student: StudentRecord) => void;
  onRecordQuickPayment: (studentId: string) => void;
}

const REPORT_PAGES: Array<{ id: ReportPageId; label: string }> = [
  { id: 'overview', label: '01. Executive ERP Overview' },
  { id: 'academics', label: '02. Academic & Attendance' },
  { id: 'finance', label: '03. Finance & Fee Ledger' },
  { id: 'admissions', label: '04. Admissions & Placements' },
];

export const ReportPages: React.FC<ReportPagesProps> = ({
  allStudents,
  filteredStudents,
  filters,
  onUpdateFilters,
  onResetFilters,
  onInspectStudent,
  onRecordQuickPayment,
}) => {
  const [activePage, setActivePage] = useState<ReportPageId>('overview');
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(true);
  const [selectedDaxId, setSelectedDaxId] = useState<string>('fee_collection_rate');
  const [copiedDax, setCopiedDax] = useState<boolean>(false);
  const [sortField, setSortField] = useState<'headcount' | 'avgCgpa' | 'avgAttendance' | 'collected'>('collected');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const kpis = useMemo(() => computeKpis(filteredStudents), [filteredStudents]);
  const deptBreakdown = useMemo(
    () => computeDepartmentBreakdown(filteredStudents),
    [filteredStudents]
  );
  const feeBreakdown = useMemo(
    () => computeFeeStatusBreakdown(filteredStudents),
    [filteredStudents]
  );
  const monthlyTrends = useMemo(
    () => computeMonthlyTrends(filteredStudents),
    [filteredStudents]
  );
  const cgpaHistogram = useMemo(
    () => computeCgpaHistogram(filteredStudents),
    [filteredStudents]
  );
  const paymentModes = useMemo(
    () => computePaymentModes(filteredStudents),
    [filteredStudents]
  );
  const agingBuckets = useMemo(
    () => computeAgingBuckets(filteredStudents),
    [filteredStudents]
  );

  const sortedDeptBreakdown = useMemo(() => {
    const copy = [...deptBreakdown];
    copy.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return sortAsc ? valA - valB : valB - valA;
    });
    return copy;
  }, [deptBreakdown, sortField, sortAsc]);

  const atRiskList = useMemo(
    () =>
      filteredStudents
        .filter(isAtRiskStudent)
        .sort((a, b) => a.attendancePct - b.attendancePct),
    [filteredStudents]
  );

  const pendingFeeAccounts = useMemo(
    () =>
      filteredStudents
        .filter((s) => s.feeStatus !== 'Paid')
        .sort((a, b) => b.daysOverdue - a.daysOverdue),
    [filteredStudents]
  );

  const toggleDeptFilter = (code: DepartmentCode) => {
    onUpdateFilters((prev) => ({
      ...prev,
      department: prev.department === code ? 'All' : code,
    }));
  };

  const toggleFeeFilter = (status: FeeStatus) => {
    onUpdateFilters((prev) => ({
      ...prev,
      feeStatus: prev.feeStatus === status ? 'All' : status,
    }));
  };

  const toggleCgpaBucket = (bucket: string) => {
    onUpdateFilters((prev) => ({
      ...prev,
      cgpaBucket: prev.cgpaBucket === bucket ? null : bucket,
    }));
  };

  const handleInspectDax = (daxId: string) => {
    setSelectedDaxId(daxId);
    setInspectorOpen(true);
  };

  const selectedMeasure =
    DAX_MEASURES.find((m) => m.id === selectedDaxId) ?? DAX_MEASURES[0];

  const handleCopyDax = () => {
    navigator.clipboard?.writeText(selectedMeasure.formula);
    setCopiedDax(true);
    setTimeout(() => setCopiedDax(false), 1800);
  };

  const handleSortDept = (field: 'headcount' | 'avgCgpa' | 'avgAttendance' | 'collected') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const hasActiveFilters =
    filters.academicYear !== 'All' ||
    filters.department !== 'All' ||
    filters.semester !== 'All' ||
    filters.feeStatus !== 'All' ||
    filters.cgpaBucket !== null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Main Power BI Report Canvas */}
        <div className="flex-1 overflow-y-auto pbi-scroll p-5 space-y-4">
          {filteredStudents.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center max-w-lg mx-auto my-12">
              <h3 className="text-base font-semibold text-slate-900">
                No Student Records Match Current Slicers
              </h3>
              <p className="text-sm text-slate-500 mt-1.5">
                Adjust or clear your active Power BI report slicers to view aggregated ERP metrics.
              </p>
              <button
                type="button"
                onClick={onResetFilters}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* PAGE 1: EXECUTIVE OVERVIEW */}
              {activePage === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
                    <PbiKpiCard
                      title="Total Enrolled Students"
                      value={String(kpis.totalStudents)}
                      context={`Out of ${allStudents.length} campus ERP records`}
                      daxId="total_students"
                      onInspectDax={handleInspectDax}
                    />
                    <PbiKpiCard
                      title="Average CGPA"
                      value={kpis.avgCgpa.toFixed(2)}
                      context={`${kpis.honorRollCount} students in Honor Roll (8.5+)`}
                      tone="positive"
                      daxId="avg_cgpa"
                      onInspectDax={handleInspectDax}
                    />
                    <PbiKpiCard
                      title="Attendance Compliance"
                      value={`${kpis.avgAttendance.toFixed(1)}%`}
                      context="Institutional benchmark: 82.0%"
                      tone={kpis.avgAttendance >= 82 ? 'positive' : 'warning'}
                      daxId="attendance_compliance"
                      onInspectDax={handleInspectDax}
                    />
                    <PbiKpiCard
                      title="Fee Collection Rate"
                      value={`${kpis.collectionRatePct.toFixed(1)}%`}
                      context={`${formatCurrencyINR(kpis.totalCollected)} collected`}
                      tone={kpis.collectionRatePct >= 85 ? 'positive' : 'warning'}
                      daxId="fee_collection_rate"
                      onInspectDax={handleInspectDax}
                    />
                    <PbiKpiCard
                      title="At-Risk Cohort"
                      value={String(kpis.atRiskCount)}
                      context="Flagged: <75% attendance, <6.0 CGPA, or overdue"
                      tone={kpis.atRiskCount > 0 ? 'danger' : 'positive'}
                      daxId="at_risk_students"
                      onInspectDax={handleInspectDax}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-7">
                      <DeptBarComboChart
                        data={deptBreakdown}
                        activeDepartment={filters.department}
                        onSelectDepartment={toggleDeptFilter}
                      />
                    </div>
                    <div className="lg:col-span-5">
                      <FeeStatusDonutChart
                        data={feeBreakdown}
                        activeStatus={filters.feeStatus}
                        onSelectStatus={toggleFeeFilter}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-5">
                      <AttendanceTrendChart data={monthlyTrends} />
                    </div>
                    <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-lg p-4 flex flex-col">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">
                            Departmental Performance Matrix
                          </h3>
                          <p className="text-xs text-slate-500">
                            Click column headers to sort or click a department row to cross-filter
                          </p>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500">
                              <th className="py-2 pr-3 font-medium">Department</th>
                              <th className="py-2 px-2 font-medium text-right">
                                <button
                                  type="button"
                                  onClick={() => handleSortDept('headcount')}
                                  className="hover:text-slate-900 cursor-pointer"
                                >
                                  Students {sortField === 'headcount' ? (sortAsc ? '↑' : '↓') : ''}
                                </button>
                              </th>
                              <th className="py-2 px-2 font-medium text-right">
                                <button
                                  type="button"
                                  onClick={() => handleSortDept('avgCgpa')}
                                  className="hover:text-slate-900 cursor-pointer"
                                >
                                  Avg CGPA {sortField === 'avgCgpa' ? (sortAsc ? '↑' : '↓') : ''}
                                </button>
                              </th>
                              <th className="py-2 px-2 font-medium text-right">
                                <button
                                  type="button"
                                  onClick={() => handleSortDept('avgAttendance')}
                                  className="hover:text-slate-900 cursor-pointer"
                                >
                                  Attendance {sortField === 'avgAttendance' ? (sortAsc ? '↑' : '↓') : ''}
                                </button>
                              </th>
                              <th className="py-2 px-2 font-medium text-right">
                                <button
                                  type="button"
                                  onClick={() => handleSortDept('collected')}
                                  className="hover:text-slate-900 cursor-pointer"
                                >
                                  Collected {sortField === 'collected' ? (sortAsc ? '↑' : '↓') : ''}
                                </button>
                              </th>
                              <th className="py-2 pl-2 font-medium text-right">At-Risk</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 tabular-nums">
                            {sortedDeptBreakdown.map((row) => {
                              const isActive = filters.department === row.code;
                              return (
                                <tr
                                  key={row.code}
                                  onClick={() => toggleDeptFilter(row.code)}
                                  className={`cursor-pointer transition-colors ${
                                    isActive
                                      ? 'bg-sky-50/70'
                                      : 'hover:bg-slate-50'
                                  }`}
                                >
                                  <td className="py-2.5 pr-3 font-medium text-slate-900">
                                    <span>{row.name}</span>
                                    <span className="text-slate-400 font-mono ml-1.5">
                                      {row.code}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                                    {row.headcount}
                                  </td>
                                  <td className="py-2.5 px-2 text-right font-mono text-slate-800">
                                    {row.avgCgpa.toFixed(2)}
                                  </td>
                                  <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                                    {row.avgAttendance.toFixed(1)}%
                                  </td>
                                  <td className="py-2.5 px-2 text-right font-mono text-slate-800">
                                    {formatCurrencyINR(row.collected)}
                                  </td>
                                  <td className="py-2.5 pl-2 text-right font-mono">
                                    <span
                                      className={
                                        row.atRisk > 0 ? 'text-rose-700 font-medium' : 'text-slate-500'
                                      }
                                    >
                                      {row.atRisk}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 2: ACADEMIC & ATTENDANCE ANALYTICS */}
              {activePage === 'academics' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                    <PbiKpiCard
                      title="Cohort Pass Rate"
                      value={`${kpis.passRatePct.toFixed(1)}%`}
                      context="Students holding CGPA >= 6.00"
                      tone="positive"
                    />
                    <PbiKpiCard
                      title="Honor Roll Share"
                      value={`${kpis.honorRollPct.toFixed(1)}%`}
                      context={`${kpis.honorRollCount} students at CGPA 8.50+`}
                      daxId="honor_roll_pct"
                      onInspectDax={handleInspectDax}
                    />
                    <PbiKpiCard
                      title="Mean Attendance"
                      value={`${kpis.avgAttendance.toFixed(1)}%`}
                      context="Biometric & LMS lecture telemetry"
                      daxId="attendance_compliance"
                      onInspectDax={handleInspectDax}
                    />
                    <PbiKpiCard
                      title="Academic / Attendance Alerts"
                      value={String(atRiskList.length)}
                      context="Requires faculty advisor intervention"
                      tone={atRiskList.length > 0 ? 'danger' : 'positive'}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-5">
                      <CgpaHistogramChart
                        data={cgpaHistogram}
                        activeBucket={filters.cgpaBucket}
                        onSelectBucket={toggleCgpaBucket}
                      />
                    </div>
                    <div className="lg:col-span-7">
                      <AttendanceCgpaScatterChart
                        students={filteredStudents}
                        onInspectStudent={onInspectStudent}
                      />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-lg p-4">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          Early Warning Academic & Attendance Watchlist
                        </h3>
                        <p className="text-xs text-slate-500">
                          Students below 75% attendance, below 6.0 CGPA, or with overdue tuition
                        </p>
                      </div>
                      <span className="text-xs font-mono text-slate-500 tabular-nums">
                        {atRiskList.length} flagged
                      </span>
                    </div>

                    {atRiskList.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-500">
                        No students meet early-warning risk thresholds in the current filter selection.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500">
                              <th className="py-2 pr-3 font-medium">Roll Number</th>
                              <th className="py-2 px-2 font-medium">Student</th>
                              <th className="py-2 px-2 font-medium">Dept / Sem</th>
                              <th className="py-2 px-2 font-medium text-right">Attendance</th>
                              <th className="py-2 px-2 font-medium text-right">CGPA</th>
                              <th className="py-2 px-2 font-medium">Advisor</th>
                              <th className="py-2 pl-2 font-medium text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 tabular-nums">
                            {atRiskList.map((s) => (
                              <tr key={s.id} className="hover:bg-slate-50">
                                <td className="py-2.5 pr-3 font-mono text-slate-600">
                                  {s.rollNumber}
                                </td>
                                <td className="py-2.5 px-2 font-medium text-slate-900">
                                  {s.fullName}
                                </td>
                                <td className="py-2.5 px-2 text-slate-600">
                                  {s.departmentCode} · Sem {s.semester}
                                </td>
                                <td
                                  className={`py-2.5 px-2 text-right font-mono ${
                                    s.attendancePct < 75
                                      ? 'text-rose-700 font-semibold'
                                      : 'text-slate-700'
                                  }`}
                                >
                                  {s.attendancePct.toFixed(1)}%
                                </td>
                                <td
                                  className={`py-2.5 px-2 text-right font-mono ${
                                    s.cgpa < 6.0 ? 'text-rose-700 font-semibold' : 'text-slate-800'
                                  }`}
                                >
                                  {s.cgpa.toFixed(2)}
                                </td>
                                <td className="py-2.5 px-2 text-slate-600">{s.advisor}</td>
                                <td className="py-2.5 pl-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => onInspectStudent(s)}
                                    className="text-xs font-medium text-[#118DFF] hover:underline cursor-pointer"
                                  >
                                    Inspect 360°
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PAGE 3: FINANCE & FEE LEDGER */}
              {activePage === 'finance' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
                    <PbiKpiCard
                      title="Gross Tuition Billed"
                      value={formatCurrencyINR(kpis.grossBilled)}
                      context="Before institutional scholarships"
                    />
                    <PbiKpiCard
                      title="Scholarships Granted"
                      value={formatCurrencyINR(kpis.scholarshipTotal)}
                      context="Merit & need-based waivers"
                    />
                    <PbiKpiCard
                      title="Tuition Collected"
                      value={formatCurrencyINR(kpis.totalCollected)}
                      context="Posted to ERP general ledger"
                      tone="positive"
                      daxId="total_collected"
                      onInspectDax={handleInspectDax}
                    />
                    <PbiKpiCard
                      title="Outstanding Dues"
                      value={formatCurrencyINR(kpis.outstandingDues)}
                      context={`${pendingFeeAccounts.length} open student balances`}
                      tone={kpis.outstandingDues > 0 ? 'warning' : 'positive'}
                      daxId="outstanding_dues"
                      onInspectDax={handleInspectDax}
                    />
                    <PbiKpiCard
                      title="Collection Efficiency"
                      value={`${kpis.collectionRatePct.toFixed(1)}%`}
                      context="Collected / Net billable tuition"
                      daxId="fee_collection_rate"
                      onInspectDax={handleInspectDax}
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Receivables Aging Schedule
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">
                        Outstanding tuition balance categorized by days past due date
                      </p>
                      <div className="space-y-3">
                        {agingBuckets.map((b) => {
                          const maxBal = Math.max(...agingBuckets.map((x) => x.balance), 1);
                          const pct = (b.balance / maxBal) * 100;
                          const isCritical = b.label.includes('60+');
                          return (
                            <div key={b.label} className="space-y-1">
                              <div className="flex items-center justify-between text-xs tabular-nums">
                                <span className="font-medium text-slate-800">
                                  {b.label}{' '}
                                  <span className="text-slate-400 font-mono">
                                    ({b.count} accts)
                                  </span>
                                </span>
                                <span className="font-mono text-slate-800">
                                  {formatCurrencyFull(b.balance)}
                                </span>
                              </div>
                              <div className="h-2.5 bg-slate-100 rounded-sm overflow-hidden">
                                <div
                                  className={`h-full rounded-sm ${
                                    isCritical ? 'bg-rose-600' : 'bg-[#118DFF]'
                                  }`}
                                  style={{ width: `${Math.max(b.balance > 0 ? 4 : 0, pct)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Treasury Collection by Payment Channel
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">
                        Settlement volume across digital rails, bank loans, and scholarships
                      </p>
                      <div className="space-y-3">
                        {paymentModes.map((pm) => {
                          const share =
                            kpis.totalCollected > 0 ? (pm.amount / kpis.totalCollected) * 100 : 0;
                          return (
                            <div key={pm.mode} className="space-y-1">
                              <div className="flex items-center justify-between text-xs tabular-nums">
                                <span className="font-medium text-slate-800">
                                  {pm.mode}{' '}
                                  <span className="text-slate-400 font-mono">
                                    ({pm.count} students)
                                  </span>
                                </span>
                                <span className="font-mono text-slate-800">
                                  {formatCurrencyINR(pm.amount)} ({share.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="h-2.5 bg-slate-100 rounded-sm overflow-hidden">
                                <div
                                  className="h-full bg-[#0E7490] rounded-sm"
                                  style={{ width: `${Math.max(pm.amount > 0 ? 4 : 0, share)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-lg p-4">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          Open Receivables & Overdue Installments
                        </h3>
                        <p className="text-xs text-slate-500">
                          Settle balances directly to update ERP ledger and Power BI visuals in real time
                        </p>
                      </div>
                      <span className="text-xs font-mono text-slate-500 tabular-nums">
                        {pendingFeeAccounts.length} pending
                      </span>
                    </div>

                    {pendingFeeAccounts.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-500">
                        All filtered student accounts are 100% settled.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500">
                              <th className="py-2 pr-3 font-medium">Roll Number</th>
                              <th className="py-2 px-2 font-medium">Student</th>
                              <th className="py-2 px-2 font-medium">Status</th>
                              <th className="py-2 px-2 font-medium text-right">Net Fee</th>
                              <th className="py-2 px-2 font-medium text-right">Paid</th>
                              <th className="py-2 px-2 font-medium text-right">Balance Due</th>
                              <th className="py-2 px-2 font-medium text-right">Overdue</th>
                              <th className="py-2 pl-2 font-medium text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 tabular-nums">
                            {pendingFeeAccounts.map((s) => {
                              const netFee = s.totalBilled - s.scholarshipAmount;
                              const balance = Math.max(0, netFee - s.amountPaid);
                              return (
                                <tr key={s.id} className="hover:bg-slate-50">
                                  <td className="py-2.5 pr-3 font-mono text-slate-600">
                                    {s.rollNumber}
                                  </td>
                                  <td className="py-2.5 px-2 font-medium text-slate-900">
                                    {s.fullName}
                                  </td>
                                  <td className="py-2.5 px-2">
                                    <span
                                      className={`font-medium ${
                                        s.feeStatus === 'Overdue'
                                          ? 'text-rose-700'
                                          : 'text-amber-700'
                                      }`}
                                    >
                                      {s.feeStatus}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                                    {formatCurrencyFull(netFee)}
                                  </td>
                                  <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                                    {formatCurrencyFull(s.amountPaid)}
                                  </td>
                                  <td className="py-2.5 px-2 text-right font-mono font-semibold text-slate-900">
                                    {formatCurrencyFull(balance)}
                                  </td>
                                  <td className="py-2.5 px-2 text-right font-mono text-slate-600">
                                    {s.daysOverdue}d
                                  </td>
                                  <td className="py-2.5 pl-2 text-right space-x-3">
                                    <button
                                      type="button"
                                      onClick={() => onRecordQuickPayment(s.id)}
                                      className="text-xs font-medium text-emerald-700 hover:underline cursor-pointer"
                                    >
                                      Settle Full
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onInspectStudent(s)}
                                      className="text-xs font-medium text-[#118DFF] hover:underline cursor-pointer"
                                    >
                                      View
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
              )}

              {/* PAGE 4: ADMISSIONS & PLACEMENTS */}
              {activePage === 'admissions' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                    <PbiKpiCard
                      title="Total Applicants"
                      value="4,280"
                      context="2025-26 centralized admissions cycle"
                    />
                    <PbiKpiCard
                      title="Offer-to-Enroll Yield"
                      value="82.3%"
                      context="790 enrolled of 960 offers extended"
                      tone="positive"
                    />
                    <PbiKpiCard
                      title="Graduating Placement %"
                      value={`${kpis.placementRatePct.toFixed(1)}%`}
                      context={`${kpis.placedCount} of ${kpis.graduatingCount} final-year students`}
                      tone="positive"
                      daxId="placement_rate"
                      onInspectDax={handleInspectDax}
                    />
                    <PbiKpiCard
                      title="Median CTC Package"
                      value={kpis.medianPackageLpa > 0 ? `₹${kpis.medianPackageLpa.toFixed(1)} LPA` : 'N/A'}
                      context="Across confirmed campus offers"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-6">
                      <AdmissionsFunnelChart stages={ADMISSIONS_FUNNEL} />
                    </div>
                    <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-slate-900">
                        Placement Outcomes by Department
                      </h3>
                      <p className="text-xs text-slate-500 mb-3">
                        Confirmed offers and mean compensation packages in filtered cohort
                      </p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500">
                              <th className="py-2 pr-3 font-medium">Department</th>
                              <th className="py-2 px-2 font-medium text-right">Placed</th>
                              <th className="py-2 pl-2 font-medium text-right">Avg Package</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 tabular-nums">
                            {deptBreakdown.map((d) => (
                              <tr key={d.code} className="hover:bg-slate-50">
                                <td className="py-2.5 pr-3 font-medium text-slate-900">
                                  {d.name}{' '}
                                  <span className="text-slate-400 font-mono">{d.code}</span>
                                </td>
                                <td className="py-2.5 px-2 text-right font-mono text-slate-800">
                                  {d.placedCount}
                                </td>
                                <td className="py-2.5 pl-2 text-right font-mono text-slate-800">
                                  {d.avgPackageLpa > 0 ? `₹${d.avgPackageLpa.toFixed(1)} LPA` : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Top Campus Recruiting Partners
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                      Corporate hiring partners integrated with Career Services ERP
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500">
                            <th className="py-2 pr-3 font-medium">Recruiter</th>
                            <th className="py-2 px-2 font-medium">Industry Sector</th>
                            <th className="py-2 px-2 font-medium">Primary Faculty</th>
                            <th className="py-2 px-2 font-medium text-right">Offers Made</th>
                            <th className="py-2 pl-2 font-medium text-right">Median Package</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 tabular-nums">
                          {TOP_RECRUITERS.map((rec) => (
                            <tr key={rec.company} className="hover:bg-slate-50">
                              <td className="py-2.5 pr-3 font-medium text-slate-900">
                                {rec.company}
                              </td>
                              <td className="py-2.5 px-2 text-slate-600">{rec.sector}</td>
                              <td className="py-2.5 px-2 font-mono text-slate-600">
                                {rec.primaryDept}
                              </td>
                              <td className="py-2.5 px-2 text-right font-mono text-slate-800">
                                {rec.offersCount}
                              </td>
                              <td className="py-2.5 pl-2 text-right font-mono font-medium text-slate-900">
                                ₹{rec.medianPackageLpa.toFixed(1)} LPA
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Collapsible Power BI Right Pane: Active Filters + DAX Measure Inspector */}
        {inspectorOpen ? (
          <aside className="hidden lg:flex flex-col w-[300px] shrink-0 bg-white border-l border-slate-200 overflow-y-auto pbi-scroll">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-900">
                Filters & DAX Inspector
              </span>
              <button
                type="button"
                onClick={() => setInspectorOpen(false)}
                title="Collapse Pane"
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <PanelRightClose className="w-4 h-4" />
              </button>
            </div>

            {/* Active Filters Section */}
            <div className="p-4 border-b border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Filters on this page
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={onResetFilters}
                    className="text-[11px] font-medium text-[#118DFF] hover:underline cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between py-1 px-2.5 bg-slate-50 rounded border border-slate-200/70">
                  <span className="text-slate-500">Academic Year</span>
                  <span className="font-mono font-medium text-slate-900">
                    {filters.academicYear}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 px-2.5 bg-slate-50 rounded border border-slate-200/70">
                  <span className="text-slate-500">Department</span>
                  <span className="font-mono font-medium text-slate-900">
                    {filters.department}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 px-2.5 bg-slate-50 rounded border border-slate-200/70">
                  <span className="text-slate-500">Semester</span>
                  <span className="font-mono font-medium text-slate-900">
                    {filters.semester === 'All' ? 'All' : `Sem ${filters.semester}`}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 px-2.5 bg-slate-50 rounded border border-slate-200/70">
                  <span className="text-slate-500">Fee Status</span>
                  <span className="font-mono font-medium text-slate-900">
                    {filters.feeStatus}
                  </span>
                </div>
                {filters.cgpaBucket && (
                  <div className="flex items-center justify-between py-1 px-2.5 bg-sky-50 rounded border border-sky-200">
                    <span className="text-sky-700">CGPA Band</span>
                    <span className="font-mono font-medium text-sky-900">
                      {filters.cgpaBucket}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* DAX Measures Explorer */}
            <div className="p-4 space-y-3 flex-1">
              <div>
                <span className="text-xs font-semibold text-slate-700">
                  Semantic Model DAX Measures
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select a measure to inspect formula & live evaluated value
                </p>
              </div>

              <div className="space-y-1 max-h-[210px] overflow-y-auto pbi-scroll pr-1">
                {DAX_MEASURES.map((m) => {
                  const isActive = m.id === selectedMeasure.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedDaxId(m.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate pr-2">{m.name}</span>
                      <span
                        className={`font-mono text-[11px] shrink-0 tabular-nums ${
                          isActive ? 'text-[#F2C811]' : 'text-slate-500'
                        }`}
                      >
                        {evaluateDaxMeasure(m.id, kpis)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
                    {selectedMeasure.table}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyDax}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    {copiedDax ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy DAX
                      </>
                    )}
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-slate-800 whitespace-pre-wrap break-words leading-relaxed bg-white border border-slate-200/80 rounded p-2">
                  {selectedMeasure.formula}
                </pre>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {selectedMeasure.description}
                </p>
              </div>
            </div>
          </aside>
        ) : (
          <div className="hidden lg:flex flex-col items-center py-3 px-1.5 bg-white border-l border-slate-200">
            <button
              type="button"
              onClick={() => setInspectorOpen(true)}
              title="Open Filters & DAX Inspector"
              className="p-1.5 text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <PanelRightOpen className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Power BI Report Page Tabs */}
      <div className="bg-white border-t border-slate-200 px-4 flex items-center justify-between overflow-x-auto shrink-0">
        <div className="flex items-center">
          {REPORT_PAGES.map((page) => {
            const isActive = activePage === page.id;
            return (
              <button
                key={page.id}
                type="button"
                onClick={() => setActivePage(page.id)}
                className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'border-[#F2C811] text-slate-900 bg-slate-50/70'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {page.label}
              </button>
            );
          })}
        </div>
        <div className="hidden sm:block text-[11px] font-mono text-slate-400 whitespace-nowrap shrink-0 tabular-nums">
          Showing {filteredStudents.length} of {allStudents.length} students
        </div>
      </div>
    </div>
  );
};
