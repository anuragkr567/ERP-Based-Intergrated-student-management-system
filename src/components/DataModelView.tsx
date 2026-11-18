import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { SCHEMA_RELATIONS, SCHEMA_TABLES } from '../data/erpDataset';
import { SchemaTable } from '../types/erp';

export const DataModelView: React.FC = () => {
  const [selectedTableId, setSelectedTableId] = useState<string>('Fact_FeeLedger');
  const selectedTable: SchemaTable =
    SCHEMA_TABLES.find((t) => t.id === selectedTableId) ?? SCHEMA_TABLES[0];

  const relatedEdges = SCHEMA_RELATIONS.filter(
    (r) => r.fromTable === selectedTable.id || r.toTable === selectedTable.id
  );

  // Center coordinates for SVG relationship lines
  const getCenter = (t: SchemaTable) => ({
    cx: t.x + 115,
    cy: t.y + 85,
  });

  return (
    <div className="flex-1 overflow-y-auto pbi-scroll p-5">
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Interactive Star Schema Diagram Canvas */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-5 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Power BI Star Schema Data Model
              </h2>
              <p className="text-xs text-slate-500">
                Click any Fact or Dimension table node to inspect keys, cardinality (1:*), and columns
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600 shrink-0">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#0F172A] inline-block" />
                Fact Table
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#118DFF] inline-block" />
                Dimension Table
              </span>
            </div>
          </div>

          <div className="relative bg-[#F8FAFC] border border-slate-200 rounded-md overflow-x-auto p-4 min-h-[500px]">
            <div className="relative min-w-[920px] h-[480px]">
              {/* SVG Relationship Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {SCHEMA_RELATIONS.map((rel) => {
                  const fromT = SCHEMA_TABLES.find((t) => t.id === rel.fromTable);
                  const toT = SCHEMA_TABLES.find((t) => t.id === rel.toTable);
                  if (!fromT || !toT) return null;
                  const p1 = getCenter(fromT);
                  const p2 = getCenter(toT);
                  const isHighlighted =
                    rel.fromTable === selectedTable.id || rel.toTable === selectedTable.id;

                  const midX = (p1.cx + p2.cx) / 2;
                  const midY = (p1.cy + p2.cy) / 2;

                  return (
                    <g key={`${rel.fromTable}-${rel.toTable}-${rel.fromColumn}`}>
                      <line
                        x1={p1.cx}
                        y1={p1.cy}
                        x2={p2.cx}
                        y2={p2.cy}
                        stroke={isHighlighted ? '#118DFF' : '#CBD5E1'}
                        strokeWidth={isHighlighted ? 2.2 : 1.3}
                      />
                      <rect
                        x={midX - 18}
                        y={midY - 9}
                        width={36}
                        height={18}
                        rx={3}
                        fill="#FFFFFF"
                        stroke={isHighlighted ? '#118DFF' : '#CBD5E1'}
                      />
                      <text
                        x={midX}
                        y={midY + 3}
                        textAnchor="middle"
                        className={`text-[10px] font-mono ${
                          isHighlighted ? 'fill-[#118DFF] font-semibold' : 'fill-slate-500'
                        }`}
                      >
                        {rel.cardinality}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Table Cards */}
              {SCHEMA_TABLES.map((table) => {
                const isSelected = table.id === selectedTable.id;
                const isFact = table.kind === 'Fact';
                return (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => setSelectedTableId(table.id)}
                    style={{ left: `${table.x}px`, top: `${table.y}px` }}
                    className={`absolute w-[230px] text-left bg-white rounded-md border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#118DFF] ring-2 ring-[#118DFF]/20 z-10'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div
                      className={`px-3 py-2 rounded-t-[5px] flex items-center justify-between text-white ${
                        isFact ? 'bg-[#0F172A]' : 'bg-[#118DFF]'
                      }`}
                    >
                      <span className="text-xs font-mono font-semibold truncate">
                        {table.name}
                      </span>
                      <span className="text-[10px] opacity-85 shrink-0">{table.kind}</span>
                    </div>
                    <div className="p-2.5 space-y-1">
                      {table.columns.slice(0, 5).map((col) => (
                        <div
                          key={col.name}
                          className="flex items-center justify-between text-[11px] text-slate-700"
                        >
                          <span className="flex items-center gap-1.5 font-mono truncate">
                            {col.keyType && (
                              <KeyRound
                                className={`w-3 h-3 shrink-0 ${
                                  col.keyType === 'PK' ? 'text-amber-600' : 'text-sky-600'
                                }`}
                              />
                            )}
                            {col.name}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                            {col.dataType}
                          </span>
                        </div>
                      ))}
                      {table.columns.length > 5 && (
                        <div className="text-[10px] text-slate-400 pt-0.5 font-mono">
                          +{table.columns.length - 5} more fields
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Table Inspector */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-lg p-5 flex flex-col space-y-5">
          <div>
            <div className="text-xs font-mono text-slate-500">
              {selectedTable.kind} Table · {selectedTable.rowCountLabel}
            </div>
            <h3 className="text-base font-semibold font-mono text-slate-900 mt-0.5">
              {selectedTable.name}
            </h3>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-800 mb-2">Schema Columns</h4>
            <div className="border border-slate-200 rounded-md divide-y divide-slate-100">
              {selectedTable.columns.map((col) => (
                <div key={col.name} className="px-3 py-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium text-slate-900">
                      {col.name}
                      {col.keyType && (
                        <span className="ml-1.5 text-[10px] text-amber-700">
                          [{col.keyType}]
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{col.dataType}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{col.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-800 mb-2">
              Active Model Relationships ({relatedEdges.length})
            </h4>
            <div className="space-y-2">
              {relatedEdges.map((edge) => (
                <div
                  key={`${edge.fromTable}-${edge.toTable}-${edge.fromColumn}`}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs space-y-1"
                >
                  <div className="font-mono text-slate-900">
                    {edge.fromTable}[{edge.fromColumn}] → {edge.toTable}[{edge.toColumn}]
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Cardinality: {edge.cardinality} · Cross-filter direction: {edge.crossFilter}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
