export type DepartmentCode = 'CSE' | 'MECH' | 'BBA' | 'BIOT' | 'EEE' | 'DSAI';

export type AcademicYear = '2025-26' | '2024-25' | '2023-24';

export type FeeStatus = 'Paid' | 'Partial' | 'Overdue';

export type StudentStatus = 'Active' | 'Probation' | 'Graduating';

export type PaymentMode = 'Net Banking' | 'UPI Instant' | 'Education Loan' | 'Scholarship';

export type WorkspaceTab = 'reports' | 'erp' | 'model' | 'export';

export type ReportPageId = 'overview' | 'academics' | 'finance' | 'admissions';

export interface CourseEnrollment {
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string;
  gradePoints: number;
  attendancePct: number;
}

export interface MonthlyAttendance {
  month: string;
  attendancePct: number;
  classesHeld: number;
  classesAttended: number;
}

export interface FeeTransaction {
  id: string;
  date: string;
  amount: number;
  mode: PaymentMode;
  reference: string;
  remarks: string;
}

export interface StudentRecord {
  id: string;
  rollNumber: string;
  fullName: string;
  email: string;
  phone: string;
  gender: 'Female' | 'Male' | 'Non-Binary';
  departmentCode: DepartmentCode;
  departmentName: string;
  academicYear: AcademicYear;
  semester: number;
  cgpa: number;
  attendancePct: number;
  creditsEarned: number;
  creditsRequired: number;
  totalBilled: number;
  scholarshipAmount: number;
  amountPaid: number;
  feeStatus: FeeStatus;
  daysOverdue: number;
  paymentMode: PaymentMode;
  studentStatus: StudentStatus;
  advisor: string;
  placementOffered: boolean;
  placementCompany?: string;
  placementPackageLpa?: number;
  courses: CourseEnrollment[];
  monthlyAttendance: MonthlyAttendance[];
  transactions: FeeTransaction[];
}

export interface DepartmentMeta {
  code: DepartmentCode;
  name: string;
  facultyLead: string;
  annualIntakeCap: number;
  baseTuition: number;
  accentColor: string;
}

export interface AdmissionsFunnelStage {
  stage: string;
  count: number;
  conversionPct: number;
}

export interface RecruiterSummary {
  company: string;
  sector: string;
  offersCount: number;
  medianPackageLpa: number;
  primaryDept: DepartmentCode;
}

export interface FilterState {
  academicYear: 'All' | AcademicYear;
  department: 'All' | DepartmentCode;
  semester: 'All' | number;
  feeStatus: 'All' | FeeStatus;
  cgpaBucket: string | null;
}

export interface DaxMeasure {
  id: string;
  name: string;
  table: string;
  category: 'Enrollment' | 'Academics' | 'Finance' | 'Placements';
  formula: string;
  description: string;
  format: 'integer' | 'decimal' | 'percent' | 'currency';
}

export interface SchemaColumn {
  name: string;
  dataType: string;
  keyType?: 'PK' | 'FK';
  description: string;
}

export interface SchemaTable {
  id: string;
  name: string;
  kind: 'Fact' | 'Dimension';
  rowCountLabel: string;
  x: number;
  y: number;
  columns: SchemaColumn[];
}

export interface SchemaRelation {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  cardinality: '1:*' | '*:1';
  crossFilter: 'Single' | 'Both';
}
