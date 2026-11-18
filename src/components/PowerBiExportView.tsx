import React, { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import {
  DAX_MEASURES,
  DEPARTMENTS,
  POWER_QUERY_M_SCRIPT,
} from '../data/erpDataset';
import { StudentRecord } from '../types/erp';
import { studentsToCsv, triggerDownload } from '../utils/analytics';

interface PowerBiExportViewProps {
  students: StudentRecord[];
}

export const PowerBiExportView: React.FC<PowerBiExportViewProps> = ({ students }) => {
  const [copiedM, setCopiedM] = useState(false);
  const [copiedDaxAll, setCopiedDaxAll] = useState(false);

  const downloadDimDepartment = () => {
    const headers = 'DepartmentCode,DepartmentName,FacultyLead,AnnualIntakeCap,BaseTuition';
    const rows = DEPARTMENTS.map(
      (d) =>
        `${d.code},"${d.name}","${d.facultyLead}",${d.annualIntakeCap},${d.baseTuition}`
    );
    triggerDownload(
      'Dim_Department.csv',
      [headers, ...rows].join('\n'),
      'text/csv;charset=utf-8;'
    );
  };

  const downloadDimStudent = () => {
    triggerDownload(
      'Dim_Student_ERP.csv',
      studentsToCsv(students),
      'text/csv;charset=utf-8;'
    );
  };

  const downloadFactFeeLedger = () => {
    const headers =
      'LedgerID,StudentKey,RollNumber,DepartmentCode,AcademicYear,TotalBilled,ScholarshipAmount,AmountPaid,BalanceDue,FeeStatus,DaysOverdue,PaymentMode';
    const rows = students.map((s, idx) => {
      const due = Math.max(0, s.totalBilled - s.scholarshipAmount - s.amountPaid);
      return [
        `LED-${202600 + idx}`,
        s.id,
        s.rollNumber,
        s.departmentCode,
        s.academicYear,
        s.totalBilled,
        s.scholarshipAmount,
        s.amountPaid,
        due,
        s.feeStatus,
        s.daysOverdue,
        `"${s.paymentMode}"`,
      ].join(',');
    });
    triggerDownload(
      'Fact_FeeLedger.csv',
      [headers, ...rows].join('\n'),
      'text/csv;charset=utf-8;'
    );
  };

  const downloadFactAttendance = () => {
    const headers =
      'AttendanceKey,StudentKey,DepartmentCode,Month,ClassesHeld,ClassesAttended,AttendancePct';
    const rows: string[] = [];
    students.forEach((s) => {
      s.monthlyAttendance.forEach((m) => {
        rows.push(
          [
            `${s.id}-${m.month}`,
            s.id,
            s.departmentCode,
            m.month,
            m.classesHeld,
            m.classesAttended,
            m.attendancePct,
          ].join(',')
        );
      });
    });
    triggerDownload(
      'Fact_Attendance.csv',
      [headers, ...rows].join('\n'),
      'text/csv;charset=utf-8;'
    );
  };

  const downloadJsonBundle = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      departments: DEPARTMENTS,
      students,
      daxMeasures: DAX_MEASURES,
    };
    triggerDownload(
      'CampusPulse_ERP_Model.json',
      JSON.stringify(payload, null, 2),
      'application/json;charset=utf-8;'
    );
  };

  const fullDaxScript = DAX_MEASURES.map(
    (m) => `// ${m.description}\n${m.formula}`
  ).join('\n\n');

  const handleCopyM = () => {
    navigator.clipboard?.writeText(POWER_QUERY_M_SCRIPT);
    setCopiedM(true);
    setTimeout(() => setCopiedM(false), 1800);
  };

  const handleCopyAllDax = () => {
    navigator.clipboard?.writeText(fullDaxScript);
    setCopiedDaxAll(true);
    setTimeout(() => setCopiedDaxAll(false), 1800);
  };

  return (
    <div className="flex-1 overflow-y-auto pbi-scroll p-5">
      <div className="max-w-[1200px] mx-auto space-y-5">
        {/* Export Header */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Power BI Desktop Integration Kit
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Download live Star-Schema CSV tables reflecting your current ERP edits, plus ready-to-paste Power Query (M) and DAX measures for Microsoft Power BI Desktop (.pbix).
            </p>
          </div>
          <button
            type="button"
            onClick={downloadJsonBundle}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download Full JSON Bundle
          </button>
        </div>

        {/* Downloadable Star Schema Tables */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-mono text-[#118DFF]">Dimension Table</div>
              <h3 className="text-sm font-semibold font-mono text-slate-900 mt-0.5">
                Dim_Student_ERP
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {students.length} live student profiles, CGPA, advisor, and placement status.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadDimStudent}
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-300 rounded-md hover:bg-slate-50 text-slate-800 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-mono text-[#118DFF]">Dimension Table</div>
              <h3 className="text-sm font-semibold font-mono text-slate-900 mt-0.5">
                Dim_Department
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {DEPARTMENTS.length} academic faculties, intake caps, and base fee schedules.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadDimDepartment}
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-300 rounded-md hover:bg-slate-50 text-slate-800 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-mono text-slate-700">Fact Table</div>
              <h3 className="text-sm font-semibold font-mono text-slate-900 mt-0.5">
                Fact_FeeLedger
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {students.length} fee ledger rows with scholarships, payments, and aging.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadFactFeeLedger}
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-300 rounded-md hover:bg-slate-50 text-slate-800 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-mono text-slate-700">Fact Table</div>
              <h3 className="text-sm font-semibold font-mono text-slate-900 mt-0.5">
                Fact_Attendance
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {students.length * 4} monthly session logs for time-intelligence attendance trends.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadFactAttendance}
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-300 rounded-md hover:bg-slate-50 text-slate-800 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV
            </button>
          </div>
        </div>

        {/* Code Scripts: DAX Library & Power Query M */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  DAX Measures Library ({DAX_MEASURES.length} Measures)
                </h3>
                <p className="text-xs text-slate-500">
                  Paste directly into Power BI Desktop Model View
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyAllDax}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-300 rounded hover:bg-slate-50 cursor-pointer"
              >
                {copiedDaxAll ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy All DAX
                  </>
                )}
              </button>
            </div>
            <pre className="flex-1 bg-slate-950 text-slate-100 rounded-md p-3.5 text-[11px] font-mono overflow-auto max-h-[300px] leading-relaxed pbi-scroll">
              {fullDaxScript}
            </pre>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Power Query (M) ETL Script
                </h3>
                <p className="text-xs text-slate-500">
                  Paste into Advanced Editor for automated NetPayable & BalanceDue columns
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyM}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-300 rounded hover:bg-slate-50 cursor-pointer"
              >
                {copiedM ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy M Script
                  </>
                )}
              </button>
            </div>
            <pre className="flex-1 bg-slate-950 text-slate-100 rounded-md p-3.5 text-[11px] font-mono overflow-auto max-h-[300px] leading-relaxed pbi-scroll">
              {POWER_QUERY_M_SCRIPT}
            </pre>
          </div>
        </div>

        {/* 4-Step Power BI Desktop Setup Guide */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">
            Power BI Desktop (.pbix) Quick Deployment Workflow
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded">
              <div className="font-semibold text-slate-900">01. Ingest ERP Tables</div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Download the four Star-Schema CSV tables above and import them via Get Data → Text/CSV in Power BI Desktop.
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded">
              <div className="font-semibold text-slate-900">02. Transform in Power Query</div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Apply the Power Query M script to compute NetPayable and BalanceDue columns with currency typing.
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded">
              <div className="font-semibold text-slate-900">03. Wire Star Relationships</div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Link StudentKey and DepartmentCode in Model View using 1:* single-direction relationships.
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded">
              <div className="font-semibold text-slate-900">04. Load DAX & Publish</div>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Create a _Measures table, paste the DAX formulas above, bind visuals, and publish to Power BI Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
