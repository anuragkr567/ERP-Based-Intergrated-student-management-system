import { DEPARTMENTS } from '../data/erpDataset';
import {
  DepartmentCode,
  FeeStatus,
  FilterState,
  PaymentMode,
  StudentRecord,
} from '../types/erp';

export function getCgpaBucket(cgpa: number): string {
  if (cgpa < 6.0) return '<6.0';
  if (cgpa < 7.0) return '6.0-6.9';
  if (cgpa < 8.0) return '7.0-7.9';
  if (cgpa < 9.0) return '8.0-8.9';
  return '9.0+';
}

export function isAtRiskStudent(student: StudentRecord): boolean {
  return student.attendancePct < 75 || student.cgpa < 6.0 || student.feeStatus === 'Overdue';
}

export function filterStudents(students: StudentRecord[], filters: FilterState): StudentRecord[] {
  return students.filter((s) => {
    if (filters.academicYear !== 'All' && s.academicYear !== filters.academicYear) return false;
    if (filters.department !== 'All' && s.departmentCode !== filters.department) return false;
    if (filters.semester !== 'All' && s.semester !== filters.semester) return false;
    if (filters.feeStatus !== 'All' && s.feeStatus !== filters.feeStatus) return false;
    if (filters.cgpaBucket && getCgpaBucket(s.cgpa) !== filters.cgpaBucket) return false;
    return true;
  });
}

export interface ComputedKpis {
  totalStudents: number;
  avgCgpa: number;
  avgAttendance: number;
  atRiskCount: number;
  honorRollCount: number;
  honorRollPct: number;
  passRatePct: number;
  grossBilled: number;
  scholarshipTotal: number;
  netBilled: number;
  totalCollected: number;
  outstandingDues: number;
  collectionRatePct: number;
  graduatingCount: number;
  placedCount: number;
  placementRatePct: number;
  medianPackageLpa: number;
}

export function computeKpis(students: StudentRecord[]): ComputedKpis {
  const totalStudents = students.length;
  if (totalStudents === 0) {
    return {
      totalStudents: 0,
      avgCgpa: 0,
      avgAttendance: 0,
      atRiskCount: 0,
      honorRollCount: 0,
      honorRollPct: 0,
      passRatePct: 0,
      grossBilled: 0,
      scholarshipTotal: 0,
      netBilled: 0,
      totalCollected: 0,
      outstandingDues: 0,
      collectionRatePct: 0,
      graduatingCount: 0,
      placedCount: 0,
      placementRatePct: 0,
      medianPackageLpa: 0,
    };
  }

  const avgCgpa = students.reduce((sum, s) => sum + s.cgpa, 0) / totalStudents;
  const avgAttendance = students.reduce((sum, s) => sum + s.attendancePct, 0) / totalStudents;
  const atRiskCount = students.filter(isAtRiskStudent).length;
  const honorRollCount = students.filter((s) => s.cgpa >= 8.5).length;
  const passCount = students.filter((s) => s.cgpa >= 6.0).length;

  const grossBilled = students.reduce((sum, s) => sum + s.totalBilled, 0);
  const scholarshipTotal = students.reduce((sum, s) => sum + s.scholarshipAmount, 0);
  const netBilled = grossBilled - scholarshipTotal;
  const totalCollected = students.reduce((sum, s) => sum + s.amountPaid, 0);
  const outstandingDues = Math.max(0, netBilled - totalCollected);
  const collectionRatePct = netBilled > 0 ? (totalCollected / netBilled) * 100 : 0;

  const graduating = students.filter((s) => s.semester >= 7);
  const placed = graduating.filter((s) => s.placementOffered);
  const packages = placed
    .map((s) => s.placementPackageLpa ?? 0)
    .filter((p) => p > 0)
    .sort((a, b) => a - b);
  const medianPackageLpa =
    packages.length > 0 ? packages[Math.floor(packages.length / 2)] : 0;

  return {
    totalStudents,
    avgCgpa,
    avgAttendance,
    atRiskCount,
    honorRollCount,
    honorRollPct: (honorRollCount / totalStudents) * 100,
    passRatePct: (passCount / totalStudents) * 100,
    grossBilled,
    scholarshipTotal,
    netBilled,
    totalCollected,
    outstandingDues,
    collectionRatePct,
    graduatingCount: graduating.length,
    placedCount: placed.length,
    placementRatePct: graduating.length > 0 ? (placed.length / graduating.length) * 100 : 0,
    medianPackageLpa,
  };
}

export interface DeptAggregate {
  code: DepartmentCode;
  name: string;
  color: string;
  headcount: number;
  avgCgpa: number;
  avgAttendance: number;
  collected: number;
  pending: number;
  atRisk: number;
  placedCount: number;
  avgPackageLpa: number;
}

export function computeDepartmentBreakdown(students: StudentRecord[]): DeptAggregate[] {
  return DEPARTMENTS.map((dept) => {
    const group = students.filter((s) => s.departmentCode === dept.code);
    const headcount = group.length;
    const avgCgpa = headcount > 0 ? group.reduce((sum, s) => sum + s.cgpa, 0) / headcount : 0;
    const avgAttendance =
      headcount > 0 ? group.reduce((sum, s) => sum + s.attendancePct, 0) / headcount : 0;
    const collected = group.reduce((sum, s) => sum + s.amountPaid, 0);
    const netBilled = group.reduce((sum, s) => sum + (s.totalBilled - s.scholarshipAmount), 0);
    const pending = Math.max(0, netBilled - collected);
    const atRisk = group.filter(isAtRiskStudent).length;
    const placed = group.filter((s) => s.placementOffered);
    const avgPackageLpa =
      placed.length > 0
        ? placed.reduce((sum, s) => sum + (s.placementPackageLpa ?? 0), 0) / placed.length
        : 0;

    return {
      code: dept.code,
      name: dept.name,
      color: dept.accentColor,
      headcount,
      avgCgpa,
      avgAttendance,
      collected,
      pending,
      atRisk,
      placedCount: placed.length,
      avgPackageLpa,
    };
  });
}

export function computeFeeStatusBreakdown(students: StudentRecord[]): Array<{
  status: FeeStatus;
  count: number;
  amount: number;
  color: string;
}> {
  const statuses: Array<{ status: FeeStatus; color: string }> = [
    { status: 'Paid', color: '#16A34A' },
    { status: 'Partial', color: '#D97706' },
    { status: 'Overdue', color: '#DC2626' },
  ];

  return statuses.map(({ status, color }) => {
    const group = students.filter((s) => s.feeStatus === status);
    const amount = group.reduce((sum, s) => sum + (s.totalBilled - s.scholarshipAmount), 0);
    return { status, count: group.length, amount, color };
  });
}

export function computeMonthlyTrends(students: StudentRecord[]): Array<{
  month: string;
  avgAttendance: number;
  targetAttendance: number;
  feeCashflowLakhs: number;
}> {
  const months = ['Aug', 'Sep', 'Oct', 'Nov'];
  const cashflowWeights = [0.44, 0.26, 0.18, 0.12];

  const totalCollected = students.reduce((sum, s) => sum + s.amountPaid, 0);

  return months.map((month, idx) => {
    const records = students.map((s) => s.monthlyAttendance[idx]?.attendancePct ?? s.attendancePct);
    const avgAttendance =
      records.length > 0 ? records.reduce((a, b) => a + b, 0) / records.length : 0;
    const feeCashflowLakhs = Number(((totalCollected * cashflowWeights[idx]) / 100000).toFixed(2));
    return {
      month,
      avgAttendance: Number(avgAttendance.toFixed(1)),
      targetAttendance: 82.0,
      feeCashflowLakhs,
    };
  });
}

export function computeCgpaHistogram(students: StudentRecord[]): Array<{
  bucket: string;
  count: number;
  color: string;
}> {
  const buckets = [
    { bucket: '<6.0', color: '#DC2626' },
    { bucket: '6.0-6.9', color: '#D97706' },
    { bucket: '7.0-7.9', color: '#0284C7' },
    { bucket: '8.0-8.9', color: '#118DFF' },
    { bucket: '9.0+', color: '#16A34A' },
  ];

  return buckets.map((b) => ({
    bucket: b.bucket,
    count: students.filter((s) => getCgpaBucket(s.cgpa) === b.bucket).length,
    color: b.color,
  }));
}

export function computePaymentModes(students: StudentRecord[]): Array<{
  mode: PaymentMode;
  count: number;
  amount: number;
}> {
  const modes: PaymentMode[] = ['Net Banking', 'UPI Instant', 'Education Loan', 'Scholarship'];
  return modes.map((mode) => {
    const group = students.filter((s) => s.paymentMode === mode);
    return {
      mode,
      count: group.length,
      amount: group.reduce((sum, s) => sum + s.amountPaid, 0),
    };
  });
}

export function computeAgingBuckets(students: StudentRecord[]): Array<{
  label: string;
  count: number;
  balance: number;
}> {
  const ranges = [
    { label: 'Current (0d)', min: 0, max: 0 },
    { label: '1-30 Days', min: 1, max: 30 },
    { label: '31-60 Days', min: 31, max: 60 },
    { label: '60+ Days Critical', min: 61, max: 9999 },
  ];

  return ranges.map((r) => {
    const group = students.filter((s) => {
      const due = Math.max(0, s.totalBilled - s.scholarshipAmount - s.amountPaid);
      if (r.min === 0 && r.max === 0) return due === 0;
      return due > 0 && s.daysOverdue >= r.min && s.daysOverdue <= r.max;
    });
    const balance = group.reduce(
      (sum, s) => sum + Math.max(0, s.totalBilled - s.scholarshipAmount - s.amountPaid),
      0
    );
    return { label: r.label, count: group.length, balance };
  });
}

export function formatCurrencyINR(value: number): string {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function evaluateDaxMeasure(measureId: string, kpis: ComputedKpis): string {
  switch (measureId) {
    case 'total_students':
      return String(kpis.totalStudents);
    case 'avg_cgpa':
      return kpis.avgCgpa.toFixed(2);
    case 'attendance_compliance':
      return `${kpis.avgAttendance.toFixed(1)}%`;
    case 'at_risk_students':
      return String(kpis.atRiskCount);
    case 'honor_roll_pct':
      return `${kpis.honorRollPct.toFixed(1)}%`;
    case 'total_billed':
      return formatCurrencyINR(kpis.netBilled);
    case 'total_collected':
      return formatCurrencyINR(kpis.totalCollected);
    case 'outstanding_dues':
      return formatCurrencyINR(kpis.outstandingDues);
    case 'fee_collection_rate':
      return `${kpis.collectionRatePct.toFixed(1)}%`;
    case 'placement_rate':
      return `${kpis.placementRatePct.toFixed(1)}%`;
    default:
      return '-';
  }
}

export function triggerDownload(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function studentsToCsv(students: StudentRecord[]): string {
  const headers = [
    'StudentKey',
    'RollNumber',
    'FullName',
    'Email',
    'Gender',
    'DepartmentCode',
    'DepartmentName',
    'AcademicYear',
    'Semester',
    'CGPA',
    'AttendancePct',
    'TotalBilled',
    'ScholarshipAmount',
    'AmountPaid',
    'BalanceDue',
    'FeeStatus',
    'DaysOverdue',
    'StudentStatus',
    'PlacementOffered',
    'PlacementCompany',
    'PlacementPackageLPA',
  ];
  const rows = students.map((s) => {
    const balanceDue = Math.max(0, s.totalBilled - s.scholarshipAmount - s.amountPaid);
    return [
      s.id,
      s.rollNumber,
      `"${s.fullName}"`,
      s.email,
      s.gender,
      s.departmentCode,
      `"${s.departmentName}"`,
      s.academicYear,
      s.semester,
      s.cgpa.toFixed(2),
      s.attendancePct.toFixed(1),
      s.totalBilled,
      s.scholarshipAmount,
      s.amountPaid,
      balanceDue,
      s.feeStatus,
      s.daysOverdue,
      s.studentStatus,
      s.placementOffered ? 'TRUE' : 'FALSE',
      `"${s.placementCompany ?? ''}"`,
      s.placementPackageLpa ?? '',
    ].join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}
