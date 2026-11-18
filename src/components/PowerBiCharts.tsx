import React, { useState } from 'react';
import {
  AdmissionsFunnelStage,
  DepartmentCode,
  FeeStatus,
  StudentRecord,
} from '../types/erp';
import {
  DeptAggregate,
  formatCurrencyINR,
} from '../utils/analytics';

interface KpiCardProps {
  title: string;
  value: string;
  context: string;
  tone?: 'neutral' | 'positive' | 'warning' | 'danger';
  daxId?: string;
  onInspectDax?: (daxId: string) => void;
}

export const PbiKpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  context,
  tone = 'neutral',
  daxId,
  onInspectDax,
}) => {
  const toneClass =
    tone === 'positive'
      ? 'text-emerald-700'
      : tone === 'warning'
        ? 'text-amber-700'
        : tone === 'danger'
          ? 'text-rose-700'
          : 'text-slate-600';

  return (
    <div className="bg-white border border-slate-200/90 rounded-lg p-4 flex flex-col justify-between transition-colors hover:border-slate-300">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-slate-600 leading-snug">{title}</span>
        {daxId && onInspectDax && (
          <button
            type="button"
            onClick={() => onInspectDax(daxId)}
            title="Inspect DAX Measure"
            className="text-[11px] font-mono text-slate-400 hover:text-[#118DFF] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            fx DAX
          </button>
        )}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
        {value}
      </div>
      <div className={`mt-1.5 text-xs tabular-nums ${toneClass}`}>{context}</div>
    </div>
  );
};

interface DeptBarComboChartProps {
  data: DeptAggregate[];
  activeDepartment: 'All' | DepartmentCode;
  onSelectDepartment: (code: DepartmentCode) => void;
}

export const DeptBarComboChart: React.FC<DeptBarComboChartProps> = ({
  data,
  activeDepartment,
  onSelectDepartment,
}) => {
  const [hoveredCode, setHoveredCode] = useState<DepartmentCode | null>(null);
  const maxCollected = Math.max(...data.map((d) => d.collected + d.pending), 100000);

  return (
    <div className="bg-white border border-slate-200/90 rounded-lg p-4 flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Tuition Revenue & Headcount by Department
          </h3>
          <p className="text-xs text-slate-500">
            Click a department bar to cross-filter the report canvas
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-600 shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#118DFF] inline-block" />
            Collected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-200 inline-block" />
            Pending
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-[220px] flex flex-col justify-end">
        <div className="grid grid-cols-6 gap-3 items-end h-[180px] pt-4 border-b border-slate-200 pb-2">
          {data.map((dept) => {
            const totalDept = dept.collected + dept.pending;
            const totalHeightPct = maxCollected > 0 ? (totalDept / maxCollected) * 100 : 0;
            const collectedSharePct = totalDept > 0 ? (dept.collected / totalDept) * 100 : 0;
            const isSelected = activeDepartment === 'All' || activeDepartment === dept.code;
            const isHovered = hoveredCode === dept.code;

            return (
              <button
                key={dept.code}
                type="button"
                onClick={() => onSelectDepartment(dept.code)}
                onMouseEnter={() => setHoveredCode(dept.code)}
                onMouseLeave={() => setHoveredCode(null)}
                className="group relative flex flex-col items-center justify-end h-full cursor-pointer focus:outline-none"
              >
                {isHovered && (
                  <div className="absolute -top-2 z-20 -translate-y-full bg-slate-900 text-white text-[11px] rounded px-2.5 py-1.5 shadow-md whitespace-nowrap pointer-events-none tabular-nums">
                    <div className="font-semibold">{dept.name}</div>
                    <div>Headcount: {dept.headcount} · Avg CGPA: {dept.avgCgpa.toFixed(2)}</div>
                    <div>Collected: {formatCurrencyINR(dept.collected)}</div>
                    <div>Pending: {formatCurrencyINR(dept.pending)}</div>
                  </div>
                )}

                <span className="text-[11px] font-mono text-slate-500 mb-1 tabular-nums">
                  {dept.headcount}
                </span>

                <div
                  className={`w-full max-w-[44px] rounded-t-sm overflow-hidden flex flex-col justify-end transition-opacity duration-150 ${
                    isSelected ? 'opacity-100' : 'opacity-30'
                  }`}
                  style={{ height: `${Math.max(8, totalHeightPct)}%` }}
                >
                  <div
                    className="w-full bg-slate-200 transition-all"
                    style={{ height: `${100 - collectedSharePct}%` }}
                  />
                  <div
                    className="w-full bg-[#118DFF] group-hover:bg-[#0078D4] transition-colors"
                    style={{ height: `${collectedSharePct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-6 gap-3 pt-2">
          {data.map((dept) => {
            const isActive = activeDepartment === dept.code;
            return (
              <button
                key={dept.code}
                type="button"
                onClick={() => onSelectDepartment(dept.code)}
                className={`text-center cursor-pointer transition-colors ${
                  isActive ? 'text-[#118DFF] font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="text-xs font-mono">{dept.code}</div>
                <div className="text-[11px] text-slate-400 tabular-nums truncate">
                  {formatCurrencyINR(dept.collected)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface FeeStatusDonutChartProps {
  data: Array<{ status: FeeStatus; count: number; amount: number; color: string }>;
  activeStatus: 'All' | FeeStatus;
  onSelectStatus: (status: FeeStatus) => void;
}

export const FeeStatusDonutChart: React.FC<FeeStatusDonutChartProps> = ({
  data,
  activeStatus,
  onSelectStatus,
}) => {
  const totalCount = data.reduce((sum, d) => sum + d.count, 0);
  const radius = 56;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;

  return (
    <div className="bg-white border border-slate-200/90 rounded-lg p-4 flex flex-col h-full">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Fee Ledger Compliance</h3>
        <p className="text-xs text-slate-500">Click a ring segment to filter status</p>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6">
        <div className="relative w-36 h-36 shrink-0">
          <svg viewBox="0 0 144 144" className="w-full h-full -rotate-90">
            {totalCount === 0 ? (
              <circle
                cx="72"
                cy="72"
                r={radius}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="20"
              />
            ) : (
              data.map((slice) => {
                const fraction = slice.count / totalCount;
                const dashLength = fraction * circumference;
                const dashOffset = -cumulativeOffset;
                cumulativeOffset += dashLength;

                const isSelected = activeStatus === 'All' || activeStatus === slice.status;

                return (
                  <circle
                    key={slice.status}
                    cx="72"
                    cy="72"
                    r={radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth="20"
                    strokeDasharray={`${dashLength} ${circumference}`}
                    strokeDashoffset={dashOffset}
                    onClick={() => onSelectStatus(slice.status)}
                    className={`cursor-pointer transition-opacity duration-150 ${
                      isSelected ? 'opacity-100' : 'opacity-25'
                    }`}
                  />
                );
              })
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-semibold text-slate-900 tabular-nums">{totalCount}</span>
            <span className="text-[11px] text-slate-500">Accounts</span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-2.5">
          {data.map((item) => {
            const pct = totalCount > 0 ? ((item.count / totalCount) * 100).toFixed(1) : '0.0';
            const isSelected = activeStatus === 'All' || activeStatus === item.status;
            return (
              <button
                key={item.status}
                type="button"
                onClick={() => onSelectStatus(item.status)}
                className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded-md border transition-colors cursor-pointer ${
                  activeStatus === item.status
                    ? 'border-slate-400 bg-slate-50'
                    : 'border-transparent hover:bg-slate-50'
                } ${isSelected ? 'opacity-100' : 'opacity-45'}`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-medium text-slate-800">{item.status}</span>
                </div>
                <div className="text-xs text-slate-600 font-mono tabular-nums">
                  {item.count} ({pct}%)
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface AttendanceTrendChartProps {
  data: Array<{
    month: string;
    avgAttendance: number;
    targetAttendance: number;
    feeCashflowLakhs: number;
  }>;
}

export const AttendanceTrendChart: React.FC<AttendanceTrendChartProps> = ({ data }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const width = 420;
  const height = 175;
  const padX = 36;
  const padY = 22;

  const minVal = 65;
  const maxVal = 100;

  const getX = (idx: number) =>
    padX + (idx / Math.max(1, data.length - 1)) * (width - padX * 2);
  const getY = (val: number) =>
    height - padY - ((Math.min(maxVal, Math.max(minVal, val)) - minVal) / (maxVal - minVal)) * (height - padY * 2);

  const linePoints = data.map((d, idx) => `${getX(idx)},${getY(d.avgAttendance)}`).join(' ');
  const targetY = getY(82);

  const areaPath =
    data.length > 0
      ? `M ${getX(0)},${height - padY} ` +
        data.map((d, idx) => `L ${getX(idx)},${getY(d.avgAttendance)}`).join(' ') +
        ` L ${getX(data.length - 1)},${height - padY} Z`
      : '';

  return (
    <div className="bg-white border border-slate-200/90 rounded-lg p-4 flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Term Attendance Compliance Trend
          </h3>
          <p className="text-xs text-slate-500">Monthly actual vs. 82.0% institutional target</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-600 shrink-0">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#0E7490] inline-block" />
            Actual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-amber-600 inline-block" />
            Target (82%)
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[185px] overflow-visible">
          {[70, 80, 90, 100].map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#F1F5F9" strokeWidth="1" />
                <text
                  x={padX - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          <line
            x1={padX}
            y1={targetY}
            x2={width - padX}
            y2={targetY}
            stroke="#D97706"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />

          {areaPath && <path d={areaPath} fill="#0E7490" fillOpacity="0.08" />}

          {data.length > 1 && (
            <polyline
              fill="none"
              stroke="#0E7490"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={linePoints}
            />
          )}

          {data.map((d, idx) => {
            const cx = getX(idx);
            const cy = getY(d.avgAttendance);
            const isHovered = hoverIdx === idx;
            return (
              <g
                key={d.month}
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5.5 : 4}
                  fill="#FFFFFF"
                  stroke="#0E7490"
                  strokeWidth="2.2"
                />
                <text
                  x={cx}
                  y={cy - 10}
                  textAnchor="middle"
                  className="text-[10px] font-mono font-medium fill-slate-700"
                >
                  {d.avgAttendance.toFixed(1)}%
                </text>
                <text
                  x={cx}
                  y={height - 4}
                  textAnchor="middle"
                  className="text-[11px] fill-slate-600 font-medium"
                >
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

interface CgpaHistogramChartProps {
  data: Array<{ bucket: string; count: number; color: string }>;
  activeBucket: string | null;
  onSelectBucket: (bucket: string) => void;
}

export const CgpaHistogramChart: React.FC<CgpaHistogramChartProps> = ({
  data,
  activeBucket,
  onSelectBucket,
}) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-white border border-slate-200/90 rounded-lg p-4 flex flex-col h-full">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900">CGPA Band Distribution</h3>
        <p className="text-xs text-slate-500">Click any grade band to filter cohort analytics</p>
      </div>

      <div className="flex-1 flex flex-col justify-end min-h-[190px]">
        <div className="grid grid-cols-5 gap-3 items-end h-[155px] border-b border-slate-200 pb-2">
          {data.map((item) => {
            const hPct = (item.count / maxCount) * 100;
            const isSelected = activeBucket === null || activeBucket === item.bucket;
            return (
              <button
                key={item.bucket}
                type="button"
                onClick={() => onSelectBucket(item.bucket)}
                className="flex flex-col items-center justify-end h-full cursor-pointer group focus:outline-none"
              >
                <span className="text-xs font-mono text-slate-600 mb-1 tabular-nums">
                  {item.count}
                </span>
                <div
                  className={`w-full max-w-[48px] rounded-t-sm transition-opacity duration-150 ${
                    isSelected ? 'opacity-100' : 'opacity-25'
                  }`}
                  style={{
                    height: `${Math.max(item.count > 0 ? 10 : 2, hPct)}%`,
                    backgroundColor: item.color,
                  }}
                />
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-5 gap-3 pt-2">
          {data.map((item) => (
            <button
              key={item.bucket}
              type="button"
              onClick={() => onSelectBucket(item.bucket)}
              className={`text-xs font-mono text-center cursor-pointer ${
                activeBucket === item.bucket
                  ? 'text-[#118DFF] font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.bucket}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface AttendanceCgpaScatterProps {
  students: StudentRecord[];
  onInspectStudent: (student: StudentRecord) => void;
}

export const AttendanceCgpaScatterChart: React.FC<AttendanceCgpaScatterProps> = ({
  students,
  onInspectStudent,
}) => {
  const [hovered, setHovered] = useState<StudentRecord | null>(null);
  const width = 460;
  const height = 220;
  const padL = 38;
  const padR = 16;
  const padT = 16;
  const padB = 28;

  const minAtt = 55;
  const maxAtt = 100;
  const minCgpa = 5.0;
  const maxCgpa = 10.0;

  const getX = (att: number) =>
    padL + ((Math.min(maxAtt, Math.max(minAtt, att)) - minAtt) / (maxAtt - minAtt)) * (width - padL - padR);
  const getY = (cgpa: number) =>
    height - padB - ((Math.min(maxCgpa, Math.max(minCgpa, cgpa)) - minCgpa) / (maxCgpa - minCgpa)) * (height - padT - padB);

  const riskAttX = getX(75);
  const riskCgpaY = getY(6.0);

  return (
    <div className="bg-white border border-slate-200/90 rounded-lg p-4 flex flex-col h-full relative">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Attendance vs. CGPA Correlation
          </h3>
          <p className="text-xs text-slate-500">
            Dashed axes mark 75% attendance and 6.0 CGPA early-warning thresholds
          </p>
        </div>
        <div className="text-xs text-slate-500 tabular-nums shrink-0">
          {students.length} students plotted
        </div>
      </div>

      <div className="relative flex-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[225px]">
          <rect
            x={padL}
            y={padT}
            width={Math.max(0, riskAttX - padL)}
            height={height - padB - padT}
            fill="#DC2626"
            fillOpacity="0.05"
          />

          {[6, 7, 8, 9, 10].map((cg) => {
            const y = getY(cg);
            return (
              <g key={cg}>
                <line x1={padL} y1={y} x2={width - padR} y2={y} stroke="#F1F5F9" strokeWidth="1" />
                <text x={padL - 6} y={y + 3} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                  {cg.toFixed(1)}
                </text>
              </g>
            );
          })}

          {[60, 75, 90, 100].map((att) => {
            const x = getX(att);
            return (
              <text key={att} x={x} y={height - 8} textAnchor="middle" className="text-[10px] fill-slate-400 font-mono">
                {att}%
              </text>
            );
          })}

          <line
            x1={riskAttX}
            y1={padT}
            x2={riskAttX}
            y2={height - padB}
            stroke="#DC2626"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <line
            x1={padL}
            y1={riskCgpaY}
            x2={width - padR}
            y2={riskCgpaY}
            stroke="#DC2626"
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {students.map((s) => {
            const isRisk = s.attendancePct < 75 || s.cgpa < 6.0;
            const cx = getX(s.attendancePct);
            const cy = getY(s.cgpa);
            const isHover = hovered?.id === s.id;
            return (
              <circle
                key={s.id}
                cx={cx}
                cy={cy}
                r={isHover ? 6.5 : 4.5}
                fill={isRisk ? '#DC2626' : '#118DFF'}
                fillOpacity={isHover ? 1 : 0.8}
                stroke="#FFFFFF"
                strokeWidth="1.2"
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onInspectStudent(s)}
                className="cursor-pointer transition-all"
              />
            );
          })}
        </svg>

        {hovered && (
          <div className="absolute top-2 right-2 bg-slate-900 text-white text-xs rounded px-3 py-2 shadow-md pointer-events-none tabular-nums">
            <div className="font-semibold">{hovered.fullName}</div>
            <div className="text-slate-300 font-mono text-[11px]">
              {hovered.rollNumber} · {hovered.departmentCode}
            </div>
            <div className="mt-1">
              CGPA: {hovered.cgpa.toFixed(2)} · Attendance: {hovered.attendancePct.toFixed(1)}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface AdmissionsFunnelChartProps {
  stages: AdmissionsFunnelStage[];
}

export const AdmissionsFunnelChart: React.FC<AdmissionsFunnelChartProps> = ({ stages }) => {
  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="bg-white border border-slate-200/90 rounded-lg p-4 flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Admissions Conversion Funnel
        </h3>
        <p className="text-xs text-slate-500">
          Applicant progression from inquiry to tuition-confirmed enrollment
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-3">
        {stages.map((stage, idx) => {
          const widthPct = Math.max(18, (stage.count / maxCount) * 100);
          const shades = ['#0F172A', '#1E3A8A', '#0369A1', '#0284C7', '#118DFF'];
          return (
            <div key={stage.stage} className="grid grid-cols-12 items-center gap-3">
              <div className="col-span-4 text-xs font-medium text-slate-700 truncate">
                {stage.stage}
              </div>
              <div className="col-span-6 flex items-center">
                <div
                  className="h-7 rounded-sm flex items-center px-2.5 text-xs font-mono text-white tabular-nums transition-all"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: shades[idx % shades.length],
                  }}
                >
                  {stage.count.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="col-span-2 text-right text-xs font-mono text-slate-600 tabular-nums">
                {stage.conversionPct.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
