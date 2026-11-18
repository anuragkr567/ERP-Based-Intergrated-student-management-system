import {
  AcademicYear,
  AdmissionsFunnelStage,
  CourseEnrollment,
  DaxMeasure,
  DepartmentCode,
  DepartmentMeta,
  FeeStatus,
  PaymentMode,
  RecruiterSummary,
  SchemaRelation,
  SchemaTable,
  StudentRecord,
  StudentStatus,
} from '../types/erp';

export const DEPARTMENTS: DepartmentMeta[] = [
  {
    code: 'CSE',
    name: 'Computer Science',
    facultyLead: 'Dr. Arvind Subramanian',
    annualIntakeCap: 180,
    baseTuition: 165000,
    accentColor: '#118DFF',
  },
  {
    code: 'DSAI',
    name: 'Data Science & AI',
    facultyLead: 'Dr. Meera Deshmukh',
    annualIntakeCap: 120,
    baseTuition: 175000,
    accentColor: '#0E7490',
  },
  {
    code: 'EEE',
    name: 'Electrical Eng.',
    facultyLead: 'Prof. Vikramaditya Rao',
    annualIntakeCap: 120,
    baseTuition: 148000,
    accentColor: '#D97706',
  },
  {
    code: 'MECH',
    name: 'Mechanical Eng.',
    facultyLead: 'Dr. Harpreet Singh Gill',
    annualIntakeCap: 140,
    baseTuition: 142000,
    accentColor: '#4F46E5',
  },
  {
    code: 'BBA',
    name: 'Business Admin',
    facultyLead: 'Prof. Nandini Chatterjee',
    annualIntakeCap: 160,
    baseTuition: 132000,
    accentColor: '#059669',
  },
  {
    code: 'BIOT',
    name: 'Biotechnology',
    facultyLead: 'Dr. Kavita Iyer',
    annualIntakeCap: 90,
    baseTuition: 154000,
    accentColor: '#BE185D',
  },
];

const COURSE_CATALOG: Record<DepartmentCode, Array<{ code: string; name: string; credits: number }>> = {
  CSE: [
    { code: 'CS401', name: 'Distributed Systems', credits: 4 },
    { code: 'CS403', name: 'Database Internals', credits: 4 },
    { code: 'CS407', name: 'Cloud Architecture', credits: 3 },
    { code: 'CS412', name: 'Compiler Design', credits: 4 },
  ],
  DSAI: [
    { code: 'DS302', name: 'Statistical Learning', credits: 4 },
    { code: 'DS305', name: 'Deep Neural Networks', credits: 4 },
    { code: 'DS311', name: 'Data Warehousing & BI', credits: 3 },
    { code: 'DS318', name: 'Applied NLP Systems', credits: 3 },
  ],
  EEE: [
    { code: 'EE301', name: 'Power Electronics', credits: 4 },
    { code: 'EE304', name: 'Control Systems', credits: 4 },
    { code: 'EE309', name: 'Embedded Microcontrollers', credits: 3 },
    { code: 'EE315', name: 'Smart Grid Telemetry', credits: 3 },
  ],
  MECH: [
    { code: 'ME302', name: 'Applied Thermodynamics', credits: 4 },
    { code: 'ME306', name: 'Finite Element Analysis', credits: 4 },
    { code: 'ME310', name: 'Robotics Kinematics', credits: 3 },
    { code: 'ME314', name: 'CAD/CAM Manufacturing', credits: 3 },
  ],
  BBA: [
    { code: 'BA201', name: 'Corporate Finance', credits: 4 },
    { code: 'BA205', name: 'Enterprise Resource Planning', credits: 4 },
    { code: 'BA209', name: 'Supply Chain Analytics', credits: 3 },
    { code: 'BA214', name: 'Strategic Operations', credits: 3 },
  ],
  BIOT: [
    { code: 'BT301', name: 'Molecular Genetics', credits: 4 },
    { code: 'BT304', name: 'Bioprocess Engineering', credits: 4 },
    { code: 'BT308', name: 'Bioinformatics Pipelines', credits: 3 },
    { code: 'BT312', name: 'Immunology & Diagnostics', credits: 3 },
  ],
};

interface SeedStudentSpec {
  fullName: string;
  gender: 'Female' | 'Male' | 'Non-Binary';
  departmentCode: DepartmentCode;
  academicYear: AcademicYear;
  semester: number;
  cgpa: number;
  attendancePct: number;
  feeStatus: FeeStatus;
  paymentMode: PaymentMode;
  scholarshipPct: number;
  daysOverdue: number;
  placementOffered: boolean;
  placementCompany?: string;
  placementPackageLpa?: number;
}

const SEED_STUDENTS: SeedStudentSpec[] = [
  { fullName: 'Aarav Sharma', gender: 'Male', departmentCode: 'CSE', academicYear: '2025-26', semester: 7, cgpa: 9.14, attendancePct: 92.4, feeStatus: 'Paid', paymentMode: 'Net Banking', scholarshipPct: 20, daysOverdue: 0, placementOffered: true, placementCompany: 'Atlassian', placementPackageLpa: 28.5 },
  { fullName: 'Ananya Krishnan', gender: 'Female', departmentCode: 'CSE', academicYear: '2025-26', semester: 7, cgpa: 8.85, attendancePct: 89.2, feeStatus: 'Paid', paymentMode: 'UPI Instant', scholarshipPct: 10, daysOverdue: 0, placementOffered: true, placementCompany: 'Microsoft', placementPackageLpa: 26.0 },
  { fullName: 'Rohan Malhotra', gender: 'Male', departmentCode: 'CSE', academicYear: '2025-26', semester: 5, cgpa: 7.42, attendancePct: 78.5, feeStatus: 'Partial', paymentMode: 'Education Loan', scholarshipPct: 0, daysOverdue: 18, placementOffered: false },
  { fullName: 'Ishita Banerjee', gender: 'Female', departmentCode: 'CSE', academicYear: '2025-26', semester: 3, cgpa: 8.62, attendancePct: 91.0, feeStatus: 'Paid', paymentMode: 'Net Banking', scholarshipPct: 15, daysOverdue: 0, placementOffered: false },
  { fullName: 'Kabir Verma', gender: 'Male', departmentCode: 'CSE', academicYear: '2024-25', semester: 5, cgpa: 5.84, attendancePct: 64.2, feeStatus: 'Overdue', paymentMode: 'UPI Instant', scholarshipPct: 0, daysOverdue: 68, placementOffered: false },
  { fullName: 'Sneha Kulkarni', gender: 'Female', departmentCode: 'CSE', academicYear: '2025-26', semester: 8, cgpa: 9.32, attendancePct: 95.1, feeStatus: 'Paid', paymentMode: 'Scholarship', scholarshipPct: 50, daysOverdue: 0, placementOffered: true, placementCompany: 'Google', placementPackageLpa: 34.0 },
  { fullName: 'Devansh Patel', gender: 'Male', departmentCode: 'CSE', academicYear: '2024-25', semester: 6, cgpa: 7.95, attendancePct: 83.4, feeStatus: 'Paid', paymentMode: 'Net Banking', scholarshipPct: 0, daysOverdue: 0, placementOffered: false },
  { fullName: 'Tanvi Nair', gender: 'Female', departmentCode: 'CSE', academicYear: '2023-24', semester: 8, cgpa: 8.48, attendancePct: 88.7, feeStatus: 'Paid', paymentMode: 'Education Loan', scholarshipPct: 10, daysOverdue: 0, placementOffered: true, placementCompany: 'Razorpay', placementPackageLpa: 19.2 },
  { fullName: 'Pranav Joshi', gender: 'Male', departmentCode: 'CSE', academicYear: '2025-26', semester: 1, cgpa: 8.12, attendancePct: 86.3, feeStatus: 'Partial', paymentMode: 'UPI Instant', scholarshipPct: 0, daysOverdue: 12, placementOffered: false },
  { fullName: 'Niharika Reddy', gender: 'Female', departmentCode: 'CSE', academicYear: '2024-25', semester: 7, cgpa: 6.45, attendancePct: 71.8, feeStatus: 'Overdue', paymentMode: 'Net Banking', scholarshipPct: 0, daysOverdue: 45, placementOffered: false },

  { fullName: 'Siddharth Menon', gender: 'Male', departmentCode: 'DSAI', academicYear: '2025-26', semester: 7, cgpa: 9.21, attendancePct: 93.8, feeStatus: 'Paid', paymentMode: 'Scholarship', scholarshipPct: 30, daysOverdue: 0, placementOffered: true, placementCompany: 'Databricks', placementPackageLpa: 31.0 },
  { fullName: 'Riya Chatterjee', gender: 'Female', departmentCode: 'DSAI', academicYear: '2025-26', semester: 5, cgpa: 8.74, attendancePct: 90.4, feeStatus: 'Paid', paymentMode: 'Net Banking', scholarshipPct: 15, daysOverdue: 0, placementOffered: false },
  { fullName: 'Aditya Deshpande', gender: 'Male', departmentCode: 'DSAI', academicYear: '2025-26', semester: 3, cgpa: 7.88, attendancePct: 82.1, feeStatus: 'Paid', paymentMode: 'UPI Instant', scholarshipPct: 0, daysOverdue: 0, placementOffered: false },
  { fullName: 'Mehek Kapoor', gender: 'Female', departmentCode: 'DSAI', academicYear: '2024-25', semester: 7, cgpa: 8.95, attendancePct: 91.6, feeStatus: 'Paid', paymentMode: 'Net Banking', scholarshipPct: 20, daysOverdue: 0, placementOffered: true, placementCompany: 'Snowflake', placementPackageLpa: 24.5 },
  { fullName: 'Yashvardhan Rao', gender: 'Male', departmentCode: 'DSAI', academicYear: '2025-26', semester: 5, cgpa: 6.18, attendancePct: 68.9, feeStatus: 'Overdue', paymentMode: 'Education Loan', scholarshipPct: 0, daysOverdue: 54, placementOffered: false },
  { fullName: 'Pooja Suryavanshi', gender: 'Female', departmentCode: 'DSAI', academicYear: '2023-24', semester: 8, cgpa: 8.54, attendancePct: 87.2, feeStatus: 'Paid', paymentMode: 'UPI Instant', scholarshipPct: 10, daysOverdue: 0, placementOffered: true, placementCompany: 'Fractal Analytics', placementPackageLpa: 15.8 },
  { fullName: 'Karanvir Boparai', gender: 'Male', departmentCode: 'DSAI', academicYear: '2025-26', semester: 1, cgpa: 8.31, attendancePct: 88.5, feeStatus: 'Partial', paymentMode: 'Net Banking', scholarshipPct: 0, daysOverdue: 22, placementOffered: false },
  { fullName: 'Sanya Mirza-Ali', gender: 'Non-Binary', departmentCode: 'DSAI', academicYear: '2024-25', semester: 6, cgpa: 7.64, attendancePct: 79.4, feeStatus: 'Paid', paymentMode: 'Education Loan', scholarshipPct: 0, daysOverdue: 0, placementOffered: false },

  { fullName: 'Arjun Venkatesh', gender: 'Male', departmentCode: 'EEE', academicYear: '2025-26', semester: 7, cgpa: 8.22, attendancePct: 86.1, feeStatus: 'Paid', paymentMode: 'Net Banking', scholarshipPct: 10, daysOverdue: 0, placementOffered: true, placementCompany: 'Texas Instruments', placementPackageLpa: 17.5 },
  { fullName: 'Divya Subhash', gender: 'Female', departmentCode: 'EEE', academicYear: '2025-26', semester: 5, cgpa: 7.91, attendancePct: 84.0, feeStatus: 'Paid', paymentMode: 'UPI Instant', scholarshipPct: 0, daysOverdue: 0, placementOffered: false },
  { fullName: 'Nikhil Gowda', gender: 'Male', departmentCode: 'EEE', academicYear: '2024-25', semester: 6, cgpa: 5.92, attendancePct: 62.5, feeStatus: 'Overdue', paymentMode: 'Education Loan', scholarshipPct: 0, daysOverdue: 74, placementOffered: false },
  { fullName: 'Shruti Mishra', gender: 'Female', departmentCode: 'EEE', academicYear: '2025-26', semester: 3, cgpa: 8.45, attendancePct: 89.7, feeStatus: 'Paid', paymentMode: 'Scholarship', scholarshipPct: 25, daysOverdue: 0, placementOffered: false },
  { fullName: 'Varun Nambiar', gender: 'Male', departmentCode: 'EEE', academicYear: '2023-24', semester: 8, cgpa: 7.56, attendancePct: 80.3, feeStatus: 'Paid', paymentMode: 'Net Banking', scholarshipPct: 0, daysOverdue: 0, placementOffered: true, placementCompany: 'Schneider Electric', placementPackageLpa: 12.4 },
  { fullName: 'Aishwarya Pillai', gender: 'Female', departmentCode: 'EEE', academicYear: '2025-26', semester: 2, cgpa: 8.08, attendancePct: 85.4, feeStatus: 'Partial', paymentMode: 'UPI Instant', scholarshipPct: 0, daysOverdue: 16, placementOffered: false },
  { fullName: 'Harshil Bhatt', gender: 'Male', departmentCode: 'EEE', academicYear: '2024-25', semester: 4, cgpa: 6.84, attendancePct: 74.1, feeStatus: 'Partial', paymentMode: 'Education Loan', scholarshipPct: 0, daysOverdue: 33, placementOffered: false },

  { fullName: 'Vikram Singhania', gender: 'Male', departmentCode: 'MECH', academicYear: '2025-26', semester: 7, cgpa: 7.94, attendancePct: 83.2, feeStatus: 'Paid', paymentMode: 'Net Banking', scholarshipPct: 0, daysOverdue: 0, placementOffered: true, placementCompany: 'Tata Motors', placementPackageLpa: 11.2 },
  { fullName: 'Ritika Sen', gender: 'Female', departmentCode: 'MECH', academicYear: '2025-26', semester: 5, cgpa: 8.67, attendancePct: 91.5, feeStatus: 'Paid', paymentMode: 'Scholarship', scholarshipPct: 25, daysOverdue: 0, placementOffered: false },
  { fullName: 'Manish Tiwari', gender: 'Male', departmentCode: 'MECH', academicYear: '2024-25', semester: 6, cgpa: 5.65, attendancePct: 61.0, feeStatus: 'Overdue', paymentMode: 'UPI Instant', scholarshipPct: 0, daysOverdue: 82, placementOffered: false },
  { fullName: 'Gaurav Choudhary', gender: 'Male', departmentCode: 'MECH', academicYear: '2025-26', semester: 3, cgpa: 7.21, attendancePct: 77.6, feeStatus: 'Partial', paymentMode: 'Education Loan', scholarshipPct: 0, daysOverdue: 26, placementOffered: false },
  { fullName: 'Pallavi Deshpande', gender: 'Female', departmentCode: 'MECH', academicYear: '2023-24', semester: 8, cgpa: 8.15, attendancePct: 86.4, feeStatus: 'Paid', paymentMode: 'Net Banking', scholarshipPct: 10, daysOverdue: 0, placementOffered: true, placementCompany: 'Larsen & Toubro', placementPackageLpa: 10.6 },
  { fullName: 'Saurabh Saxena', gender: 'Male', departmentCode: 'MECH', academicYear: '2025-26', semester: 2, cgpa: 7.52, attendancePct: 80.1, feeStatus: 'Paid', paymentMode: 'UPI Instant', scholarshipPct: 0, daysOverdue: 0, placementOffered: false },
  { fullName: 'Nitin Acharya', gender: 'Male', departmentCode: 'MECH', academicYear: '2024-25', semester: 4, cgpa: 6.72, attendancePct: 72.3, feeStatus: 'Overdue', paymentMode: 'Net Banking', scholarshipPct: 0, daysOverdue: 49, placementOffered: false },
  { fullName: 'Komal Rathore', gender: 'Female', departmentCode: 'MECH', academicYear: '2025-26', semester: 7, cgpa: 8.39, attendancePct: 88.0, feeStatus: 'Paid', paymentMode: 'Education Loan', scholarshipPct: 15, daysOverdue: 0, placementOffered: true, placementCompany: 'Bosch Mobility', placementPackageLpa: 12.0 },

  { fullName: 'Anirudh Agarwal', gender: 'Male', departmentCode: 'BBA', academicYear: '2025-26', semester: 6, cgpa: 8.51, attendancePct: 88.9, feeStatus: 'Paid', paymentMode: 'Net Banking', scholarshipPct: 10, daysOverdue: 0, placementOffered: true, placementCompany: 'Deloitte Consulting', placementPackageLpa: 13.5 },
  { fullName: 'Simran Kaur', gender: 'Female', departmentCode: 'BBA', academicYear: '2025-26', semester: 6, cgpa: 9.02, attendancePct: 94.2, feeStatus: 'Paid', paymentMode: 'Scholarship', scholarshipPct: 35, daysOverdue: 0, placementOffered: true, placementCompany: 'McKinsey & Co.', placementPackageLpa: 18.4 },
  { fullName: 'Tushar Goel', gender: 'Male', departmentCode: 'BBA', academicYear: '2025-26', semester: 4, cgpa: 7.36, attendancePct: 79.8, feeStatus: 'Partial', paymentMode: 'UPI Instant', scholarshipPct: 0, daysOverdue: 19, placementOffered: false },
  { fullName: 'Neha Jindal', gender: 'Female', departmentCode: 'BBA', academicYear: '2024-25', semester: 5, cgpa: 8.19, attendancePct: 85.7, feeStatus: 'Paid', paymentMode: 'Net Banking', scholarshipPct: 0, daysOverdue: 0, placementOffered: false },
  { fullName: 'Raghavendra Hegde', gender: 'Male', departmentCode: 'BBA', academicYear: '2024-25', semester: 3, cgpa: 6.05, attendancePct: 67.4, feeStatus: 'Overdue', paymentMode: 'UPI Instant', scholarshipPct: 0, daysOverdue: 61, placementOffered: false },
  { fullName: 'Kritika Bhardwaj', gender: 'Female', departmentCode: 'BBA', academicYear: '2023-24', semester: 6, cgpa: 8.44, attendancePct: 87.1, feeStatus: 'Paid', paymentMode: 'Education Loan', scholarshipPct: 10, daysOverdue: 0, placementOffered: true, placementCompany: 'EY Parthenon', placementPackageLpa: 14.2 },
  { fullName: 'Zaid Khan', gender: 'Male', departmentCode: 'BBA', academicYear: '2025-26', semester: 2, cgpa: 7.78, attendancePct: 82.6, feeStatus: 'Paid', paymentMode: 'Net Banking', scholarshipPct: 0, daysOverdue: 0, placementOffered: false },
  { fullName: 'Mitali Shah', gender: 'Female', departmentCode: 'BBA', academicYear: '2025-26', semester: 1, cgpa: 8.63, attendancePct: 90.5, feeStatus: 'Paid', paymentMode: 'UPI Instant', scholarshipPct: 15, daysOverdue: 0, placementOffered: false },

  { fullName: 'Drishti Sengupta', gender: 'Female', departmentCode: 'BIOT', academicYear: '2025-26', semester: 7, cgpa: 9.08, attendancePct: 93.1, feeStatus: 'Paid', paymentMode: 'Scholarship', scholarshipPct: 30, daysOverdue: 0, placementOffered: true, placementCompany: 'Biocon Biologics', placementPackageLpa: 11.8 },
  { fullName: 'Omkar Kulkarni', gender: 'Male', departmentCode: 'BIOT', academicYear: '2025-26', semester: 5, cgpa: 7.82, attendancePct: 84.5, feeStatus: 'Paid', paymentMode: 'Education Loan', scholarshipPct: 0, daysOverdue: 0, placementOffered: false },
  { fullName: 'Bhavna Chauhan', gender: 'Female', departmentCode: 'BIOT', academicYear: '2024-25', semester: 6, cgpa: 8.34, attendancePct: 88.2, feeStatus: 'Partial', paymentMode: 'Net Banking', scholarshipPct: 10, daysOverdue: 28, placementOffered: false },
  { fullName: 'Suhasini Prabhu', gender: 'Female', departmentCode: 'BIOT', academicYear: '2023-24', semester: 8, cgpa: 8.71, attendancePct: 90.0, feeStatus: 'Paid', paymentMode: 'Net Banking', scholarshipPct: 15, daysOverdue: 0, placementOffered: true, placementCompany: 'Dr. Reddy Labs', placementPackageLpa: 10.9 },
  { fullName: 'Kunal Deshmukh', gender: 'Male', departmentCode: 'BIOT', academicYear: '2025-26', semester: 3, cgpa: 6.12, attendancePct: 69.5, feeStatus: 'Overdue', paymentMode: 'UPI Instant', scholarshipPct: 0, daysOverdue: 57, placementOffered: false },
  { fullName: 'Farah Siddiqui', gender: 'Female', departmentCode: 'BIOT', academicYear: '2025-26', semester: 2, cgpa: 8.15, attendancePct: 86.8, feeStatus: 'Paid', paymentMode: 'UPI Instant', scholarshipPct: 0, daysOverdue: 0, placementOffered: false },
  { fullName: 'Rishabh Bansal', gender: 'Male', departmentCode: 'BIOT', academicYear: '2024-25', semester: 4, cgpa: 7.45, attendancePct: 79.1, feeStatus: 'Paid', paymentMode: 'Education Loan', scholarshipPct: 0, daysOverdue: 0, placementOffered: false },
];

function gradeFromCgpa(cgpa: number, offset: number): { grade: string; pts: number } {
  const adjusted = Math.min(10, Math.max(4.5, cgpa + offset));
  if (adjusted >= 9.0) return { grade: 'A+', pts: 10 };
  if (adjusted >= 8.2) return { grade: 'A', pts: 9 };
  if (adjusted >= 7.4) return { grade: 'B+', pts: 8 };
  if (adjusted >= 6.5) return { grade: 'B', pts: 7 };
  if (adjusted >= 5.5) return { grade: 'C', pts: 6 };
  return { grade: 'D', pts: 5 };
}

export function buildInitialStudents(): StudentRecord[] {
  return SEED_STUDENTS.map((spec, index) => {
    const dept = DEPARTMENTS.find((d) => d.code === spec.departmentCode)!;
    const yearSuffix = spec.academicYear.slice(2, 4);
    const rollNumber = `ERP-${yearSuffix}-${spec.departmentCode}-${String(101 + index).padStart(3, '0')}`;
    const id = `STU-${String(1001 + index)}`;
    const nameSlug = spec.fullName.toLowerCase().replace(/[^a-z]+/g, '.');

    const totalBilled = dept.baseTuition;
    const scholarshipAmount = Math.round((totalBilled * spec.scholarshipPct) / 100);
    const netPayable = totalBilled - scholarshipAmount;

    let amountPaid = netPayable;
    if (spec.feeStatus === 'Partial') {
      amountPaid = Math.round(netPayable * (0.55 + ((index % 3) * 0.1)));
    } else if (spec.feeStatus === 'Overdue') {
      amountPaid = Math.round(netPayable * (0.2 + ((index % 2) * 0.15)));
    }

    const studentStatus: StudentStatus =
      spec.attendancePct < 75 || spec.cgpa < 6.0
        ? 'Probation'
        : spec.semester >= 7
          ? 'Graduating'
          : 'Active';

    const courses: CourseEnrollment[] = COURSE_CATALOG[spec.departmentCode].map((c, cIdx) => {
      const g = gradeFromCgpa(spec.cgpa, (cIdx % 2 === 0 ? 0.3 : -0.25));
      const cAtt = Number(
        Math.min(99, Math.max(54, spec.attendancePct + (cIdx - 1.5) * 2.1)).toFixed(1)
      );
      return {
        courseCode: c.code,
        courseName: c.name,
        credits: c.credits,
        grade: g.grade,
        gradePoints: g.pts,
        attendancePct: cAtt,
      };
    });

    const months = ['Aug', 'Sep', 'Oct', 'Nov'];
    const monthlyAttendance = months.map((month, mIdx) => {
      const classesHeld = 42 + mIdx * 4;
      const pct = Number(
        Math.min(99, Math.max(52, spec.attendancePct + (mIdx - 1.5) * 1.4)).toFixed(1)
      );
      const classesAttended = Math.round((classesHeld * pct) / 100);
      return { month, attendancePct: pct, classesHeld, classesAttended };
    });

    const transactions =
      amountPaid > 0
        ? [
            {
              id: `TXN-${202600 + index}`,
              date: '2026-08-14',
              amount: amountPaid,
              mode: spec.paymentMode,
              reference: `UTR${884200 + index * 17}`,
              remarks:
                spec.feeStatus === 'Paid'
                  ? 'Full Term Tuition Settlement'
                  : 'First Installment Remittance',
            },
          ]
        : [];

    const creditsRequired = spec.semester * 20;
    const creditsEarned =
      spec.cgpa < 6.0 ? creditsRequired - 6 : creditsRequired;

    return {
      id,
      rollNumber,
      fullName: spec.fullName,
      email: `${nameSlug}@campus.edu.in`,
      phone: `+91 98${String(10000000 + index * 73421).slice(0, 8)}`,
      gender: spec.gender,
      departmentCode: spec.departmentCode,
      departmentName: dept.name,
      academicYear: spec.academicYear,
      semester: spec.semester,
      cgpa: spec.cgpa,
      attendancePct: spec.attendancePct,
      creditsEarned,
      creditsRequired,
      totalBilled,
      scholarshipAmount,
      amountPaid,
      feeStatus: spec.feeStatus,
      daysOverdue: spec.daysOverdue,
      paymentMode: spec.paymentMode,
      studentStatus,
      advisor: dept.facultyLead,
      placementOffered: spec.placementOffered,
      placementCompany: spec.placementCompany,
      placementPackageLpa: spec.placementPackageLpa,
      courses,
      monthlyAttendance,
      transactions,
    };
  });
}

export const ADMISSIONS_FUNNEL: AdmissionsFunnelStage[] = [
  { stage: 'Applications Received', count: 4280, conversionPct: 100 },
  { stage: 'Entrance Shortlisted', count: 2140, conversionPct: 50.0 },
  { stage: 'Faculty Interviewed', count: 1320, conversionPct: 30.8 },
  { stage: 'Admission Offered', count: 960, conversionPct: 22.4 },
  { stage: 'Tuition Enrolled', count: 790, conversionPct: 18.5 },
];

export const TOP_RECRUITERS: RecruiterSummary[] = [
  { company: 'Google', sector: 'Cloud & AI', offersCount: 8, medianPackageLpa: 34.0, primaryDept: 'CSE' },
  { company: 'Databricks', sector: 'Data Platform', offersCount: 6, medianPackageLpa: 31.0, primaryDept: 'DSAI' },
  { company: 'Atlassian', sector: 'Enterprise SaaS', offersCount: 11, medianPackageLpa: 28.5, primaryDept: 'CSE' },
  { company: 'Microsoft', sector: 'Software Systems', offersCount: 14, medianPackageLpa: 26.0, primaryDept: 'CSE' },
  { company: 'McKinsey & Co.', sector: 'Management Consulting', offersCount: 9, medianPackageLpa: 18.4, primaryDept: 'BBA' },
  { company: 'Texas Instruments', sector: 'Semiconductors', offersCount: 10, medianPackageLpa: 17.5, primaryDept: 'EEE' },
  { company: 'Bosch Mobility', sector: 'Automotive Systems', offersCount: 12, medianPackageLpa: 12.0, primaryDept: 'MECH' },
  { company: 'Biocon Biologics', sector: 'Life Sciences', offersCount: 7, medianPackageLpa: 11.8, primaryDept: 'BIOT' },
];

export const DAX_MEASURES: DaxMeasure[] = [
  {
    id: 'total_students',
    name: 'Total Enrolled Students',
    table: 'Fact_Enrollments',
    category: 'Enrollment',
    formula: 'Total Enrolled Students = DISTINCTCOUNT(Fact_Enrollments[StudentKey])',
    description: 'Counts unique enrolled students across active slicer context.',
    format: 'integer',
  },
  {
    id: 'avg_cgpa',
    name: 'Average CGPA',
    table: 'Fact_ExamResults',
    category: 'Academics',
    formula: 'Average CGPA = AVERAGEX(Dim_Student, CALCULATE(AVERAGE(Fact_ExamResults[SemesterGPA])))',
    description: 'Mean cumulative grade point average across filtered student cohort.',
    format: 'decimal',
  },
  {
    id: 'attendance_compliance',
    name: 'Attendance Compliance %',
    table: 'Fact_Attendance',
    category: 'Academics',
    formula: 'Attendance Compliance % = DIVIDE(SUM(Fact_Attendance[ClassesAttended]), SUM(Fact_Attendance[ClassesHeld]), 0)',
    description: 'Weighted ratio of attended sessions to total scheduled sessions.',
    format: 'percent',
  },
  {
    id: 'at_risk_students',
    name: 'At-Risk Cohort Count',
    table: 'Fact_Attendance',
    category: 'Academics',
    formula: 'At-Risk Cohort Count = CALCULATE([Total Enrolled Students], FILTER(Dim_Student, [Attendance Compliance %] < 0.75 || [Average CGPA] < 6.0))',
    description: 'Early-warning ERP flag for students below 75% attendance or 6.0 CGPA.',
    format: 'integer',
  },
  {
    id: 'honor_roll_pct',
    name: 'Honor Roll Share %',
    table: 'Fact_ExamResults',
    category: 'Academics',
    formula: 'Honor Roll Share % = DIVIDE(CALCULATE([Total Enrolled Students], Dim_Student[CGPA] >= 8.5), [Total Enrolled Students], 0)',
    description: 'Proportion of filtered students maintaining CGPA 8.50 or higher.',
    format: 'percent',
  },
  {
    id: 'total_billed',
    name: 'Net Tuition Billed',
    table: 'Fact_FeeLedger',
    category: 'Finance',
    formula: 'Net Tuition Billed = SUMX(Fact_FeeLedger, Fact_FeeLedger[GrossTuition] - Fact_FeeLedger[ScholarshipAmount])',
    description: 'Total billed tuition revenue after deducting merit/need scholarships.',
    format: 'currency',
  },
  {
    id: 'total_collected',
    name: 'Tuition Collected',
    table: 'Fact_FeeLedger',
    category: 'Finance',
    formula: 'Tuition Collected = SUM(Fact_FeeLedger[AmountPaid])',
    description: 'Verified ERP fee receipts posted to university treasury.',
    format: 'currency',
  },
  {
    id: 'outstanding_dues',
    name: 'Outstanding Receivables',
    table: 'Fact_FeeLedger',
    category: 'Finance',
    formula: 'Outstanding Receivables = [Net Tuition Billed] - [Tuition Collected]',
    description: 'Uncollected tuition balance across partial and overdue accounts.',
    format: 'currency',
  },
  {
    id: 'fee_collection_rate',
    name: 'Fee Collection Rate %',
    table: 'Fact_FeeLedger',
    category: 'Finance',
    formula: 'Fee Collection Rate % = DIVIDE([Tuition Collected], [Net Tuition Billed], 0)',
    description: 'Treasury collection efficiency against net billable tuition.',
    format: 'percent',
  },
  {
    id: 'placement_rate',
    name: 'Final-Year Placement %',
    table: 'Fact_Placements',
    category: 'Placements',
    formula: 'Final-Year Placement % = DIVIDE(CALCULATE([Total Enrolled Students], Dim_Student[PlacementOffered] = TRUE()), CALCULATE([Total Enrolled Students], Dim_Student[Semester] >= 7), 0)',
    description: 'Share of eligible graduating cohort (Sem 7–8) with confirmed offers.',
    format: 'percent',
  },
];

export const SCHEMA_TABLES: SchemaTable[] = [
  {
    id: 'Dim_Department',
    name: 'Dim_Department',
    kind: 'Dimension',
    rowCountLabel: '6 rows',
    x: 40,
    y: 40,
    columns: [
      { name: 'DepartmentCode', dataType: 'Text', keyType: 'PK', description: 'Unique faculty code (CSE, DSAI, etc.)' },
      { name: 'DepartmentName', dataType: 'Text', description: 'Academic department title' },
      { name: 'FacultyLead', dataType: 'Text', description: 'Dean / Head of Department' },
      { name: 'BaseTuition', dataType: 'Currency', description: 'Standard annual fee schedule' },
    ],
  },
  {
    id: 'Dim_Student',
    name: 'Dim_Student',
    kind: 'Dimension',
    rowCountLabel: '48+ rows',
    x: 40,
    y: 290,
    columns: [
      { name: 'StudentKey', dataType: 'Text', keyType: 'PK', description: 'ERP unique student ID' },
      { name: 'RollNumber', dataType: 'Text', description: 'University registration code' },
      { name: 'FullName', dataType: 'Text', description: 'Student legal name' },
      { name: 'DepartmentCode', dataType: 'Text', keyType: 'FK', description: 'Links to Dim_Department' },
      { name: 'Semester', dataType: 'Whole Number', description: 'Active academic semester (1-8)' },
      { name: 'StudentStatus', dataType: 'Text', description: 'Active / Probation / Graduating' },
    ],
  },
  {
    id: 'Dim_Date',
    name: 'Dim_Date',
    kind: 'Dimension',
    rowCountLabel: '1,095 rows',
    x: 680,
    y: 40,
    columns: [
      { name: 'DateKey', dataType: 'Date', keyType: 'PK', description: 'Calendar primary date key' },
      { name: 'AcademicYear', dataType: 'Text', description: 'Term label (2025-26, 2024-25)' },
      { name: 'MonthName', dataType: 'Text', description: 'Calendar month abbreviation' },
      { name: 'TermQuarter', dataType: 'Text', description: 'Fiscal & academic quarter' },
    ],
  },
  {
    id: 'Dim_Course',
    name: 'Dim_Course',
    kind: 'Dimension',
    rowCountLabel: '24 rows',
    x: 680,
    y: 290,
    columns: [
      { name: 'CourseCode', dataType: 'Text', keyType: 'PK', description: 'Syllabus course identifier' },
      { name: 'CourseName', dataType: 'Text', description: 'Official course title' },
      { name: 'DepartmentCode', dataType: 'Text', keyType: 'FK', description: 'Owning academic department' },
      { name: 'Credits', dataType: 'Whole Number', description: 'Credit weight (3 or 4)' },
    ],
  },
  {
    id: 'Fact_FeeLedger',
    name: 'Fact_FeeLedger',
    kind: 'Fact',
    rowCountLabel: '144+ rows',
    x: 350,
    y: 40,
    columns: [
      { name: 'LedgerID', dataType: 'Text', keyType: 'PK', description: 'ERP voucher / invoice ID' },
      { name: 'StudentKey', dataType: 'Text', keyType: 'FK', description: 'Links to Dim_Student' },
      { name: 'DepartmentCode', dataType: 'Text', keyType: 'FK', description: 'Links to Dim_Department' },
      { name: 'DateKey', dataType: 'Date', keyType: 'FK', description: 'Billing / receipt date' },
      { name: 'GrossTuition', dataType: 'Currency', description: 'Total term fee billed' },
      { name: 'ScholarshipAmount', dataType: 'Currency', description: 'Waiver / grant offset' },
      { name: 'AmountPaid', dataType: 'Currency', description: 'Verified cash collected' },
    ],
  },
  {
    id: 'Fact_Attendance',
    name: 'Fact_Attendance',
    kind: 'Fact',
    rowCountLabel: '1,920+ rows',
    x: 350,
    y: 290,
    columns: [
      { name: 'AttendanceKey', dataType: 'Text', keyType: 'PK', description: 'Session log composite key' },
      { name: 'StudentKey', dataType: 'Text', keyType: 'FK', description: 'Links to Dim_Student' },
      { name: 'CourseCode', dataType: 'Text', keyType: 'FK', description: 'Links to Dim_Course' },
      { name: 'DateKey', dataType: 'Date', keyType: 'FK', description: 'Month / session date' },
      { name: 'ClassesHeld', dataType: 'Whole Number', description: 'Scheduled lectures' },
      { name: 'ClassesAttended', dataType: 'Whole Number', description: 'Biometric / LMS check-ins' },
    ],
  },
];

export const SCHEMA_RELATIONS: SchemaRelation[] = [
  { fromTable: 'Dim_Student', fromColumn: 'StudentKey', toTable: 'Fact_FeeLedger', toColumn: 'StudentKey', cardinality: '1:*', crossFilter: 'Single' },
  { fromTable: 'Dim_Department', fromColumn: 'DepartmentCode', toTable: 'Fact_FeeLedger', toColumn: 'DepartmentCode', cardinality: '1:*', crossFilter: 'Single' },
  { fromTable: 'Dim_Date', fromColumn: 'DateKey', toTable: 'Fact_FeeLedger', toColumn: 'DateKey', cardinality: '1:*', crossFilter: 'Single' },
  { fromTable: 'Dim_Student', fromColumn: 'StudentKey', toTable: 'Fact_Attendance', toColumn: 'StudentKey', cardinality: '1:*', crossFilter: 'Single' },
  { fromTable: 'Dim_Course', fromColumn: 'CourseCode', toTable: 'Fact_Attendance', toColumn: 'CourseCode', cardinality: '1:*', crossFilter: 'Single' },
  { fromTable: 'Dim_Date', fromColumn: 'DateKey', toTable: 'Fact_Attendance', toColumn: 'DateKey', cardinality: '1:*', crossFilter: 'Single' },
];

export const POWER_QUERY_M_SCRIPT = `let
    // Connect Power BI Desktop to CampusPulse ERP Export CSV or API Endpoint
    Source = Csv.Document(File.Contents("C:\\CampusPulse_ERP\\Fact_FeeLedger.csv"),[Delimiter=",", Columns=9, Encoding=65001, QuoteStyle=QuoteStyle.None]),
    PromotedHeaders = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    TypedColumns = Table.TransformColumnTypes(PromotedHeaders, {
        {"StudentKey", type text},
        {"RollNumber", type text},
        {"DepartmentCode", type text},
        {"AcademicYear", type text},
        {"TotalBilled", Currency.Type},
        {"ScholarshipAmount", Currency.Type},
        {"AmountPaid", Currency.Type},
        {"DaysOverdue", Int64.Type},
        {"FeeStatus", type text}
    }),
    AddedNetPayable = Table.AddColumn(TypedColumns, "NetPayable", each [TotalBilled] - [ScholarshipAmount], Currency.Type),
    AddedBalanceDue = Table.AddColumn(AddedNetPayable, "BalanceDue", each [NetPayable] - [AmountPaid], Currency.Type)
in
    AddedBalanceDue`;
