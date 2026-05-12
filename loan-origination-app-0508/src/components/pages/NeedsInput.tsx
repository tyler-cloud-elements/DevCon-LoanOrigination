import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../layout/Header';
import { Card } from '../ui/Card';
import { useLoanCases } from '../../hooks/useLoanCases';
import type { LoanCase } from '../../types/loan';

const FILTER_CHIPS = [
  { key: 'all', label: 'All' },
  { key: 'sla', label: 'SLA At Risk' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'decisions', label: 'Decisions' },
];

function actionLabel(c: LoanCase) {
  if (c.agentIndicator === 'Rate lock') return 'Rate lock expiring';
  if (c.agentIndicator === 'DTI') return 'Complex income review';
  if (c.agentIndicator === 'Compliance') return 'Compliance flag';
  if (c.agentIndicator === 'Review') return 'Review loan package';
  if (c.slaState === 'At Risk' || c.slaState === '48h') return 'SLA attention needed';
  return 'Outstanding condition';
}

export function NeedsInput() {
  const navigate = useNavigate();
  const { cases, isLoading, refresh, usedFallback } = useLoanCases();
  const [active, setActive] = useState<string>('all');

  const filtered = useMemo(() => {
    const needing = cases.filter(
      (c) => c.agentIndicator !== 'Handled' && c.status !== 'Completed',
    );
    if (active === 'sla') return needing.filter((c) => c.slaState === 'At Risk' || c.slaState === '48h');
    if (active === 'reviews') return needing.filter((c) => c.agentIndicator === 'Review' || c.agentIndicator === 'Compliance');
    if (active === 'decisions') return needing.filter((c) => c.agentIndicator === 'DTI' || c.agentIndicator === 'Rate lock');
    return needing;
  }, [cases, active]);

  return (
    <>
      <Header
        title="Needs My Input"
        subtitle={`${filtered.length} decisions required${usedFallback ? ' · Demo data' : ''}`}
        onRefresh={refresh}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-2 mb-3.5 flex-wrap">
          {FILTER_CHIPS.map((chip) => {
            const isActive = active === chip.key;
            return (
              <button
                key={chip.key}
                onClick={() => setActive(chip.key)}
                className="px-3 py-1 rounded-[16px] text-xs font-medium transition-all"
                style={{
                  background: isActive ? 'var(--blue-bg)' : 'var(--surface)',
                  color: isActive ? 'var(--blue)' : 'var(--fg3)',
                  border: `1px solid ${isActive ? 'var(--blue-bd)' : 'var(--border)'}`,
                }}
              >
                {chip.label}
              </button>
            );
          })}
          <div className="flex-1" />
          <select
            className="px-2.5 py-1 rounded-lg text-xs cursor-pointer"
            style={{
              background: 'var(--surface)',
              color: 'var(--fg2)',
              border: '1px solid var(--border)',
              fontFamily: 'inherit',
            }}
          >
            <option>Sort: Priority</option>
            <option>Sort: SLA</option>
            <option>Sort: Date</option>
          </select>
        </div>

        <Card style={{ overflow: 'auto' }}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Case ID', 'Borrower', 'Amount', 'Stage', 'Action Needed', 'SLA'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3.5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.5px]"
                    style={{
                      color: 'var(--fg4)',
                      background: 'var(--elevated)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-3.5 py-6 text-center text-[13px]" style={{ color: 'var(--fg3)' }}>
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3.5 py-6 text-center text-[13px]" style={{ color: 'var(--fg3)' }}>
                    Nothing pending. Agent is in the driver's seat.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const sla =
                    c.slaState === 'At Risk' || c.slaState === '48h'
                      ? { color: 'var(--amber)', label: `● ${c.slaState === '48h' ? '48h left' : 'At Risk'}` }
                      : { color: 'var(--green)', label: '● On Track' };
                  return (
                    <tr
                      key={c.caseInstanceId}
                      className="cursor-pointer transition-colors"
                      onClick={() => navigate(`/loans/${c.caseInstanceId}?folder=${c.folderKey}`)}
                      onMouseOver={(e) => (e.currentTarget.style.background = 'var(--hover)')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td
                        className="px-3.5 py-2.5 text-[13px] font-semibold"
                        style={{ color: 'var(--blue)', borderBottom: '1px solid var(--border)' }}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          {c.caseId}
                          {c.isReal && (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-full text-[9px] font-semibold uppercase tracking-[0.4px]"
                              style={{
                                background: 'var(--green-bg)',
                                color: 'var(--green)',
                                border: '1px solid var(--green-bd)',
                              }}
                              title="Live UiPath case instance"
                            >
                              <span className="w-1 h-1 rounded-full lp-pulse" style={{ background: 'var(--green)' }} />
                              Live
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-[13px]" style={{ borderBottom: '1px solid var(--border)' }}>
                        {c.borrowerName}
                      </td>
                      <td className="px-3.5 py-2.5 text-[13px]" style={{ borderBottom: '1px solid var(--border)' }}>
                        ${Math.round(c.amount / 1000)}K
                      </td>
                      <td className="px-3.5 py-2.5 text-[13px]" style={{ borderBottom: '1px solid var(--border)' }}>
                        {c.stage}
                      </td>
                      <td
                        className="px-3.5 py-2.5 text-[13px] font-semibold"
                        style={{ borderBottom: '1px solid var(--border)' }}
                      >
                        {actionLabel(c)}
                      </td>
                      <td
                        className="px-3.5 py-2.5 text-[13px]"
                        style={{ color: sla.color, borderBottom: '1px solid var(--border)' }}
                      >
                        {sla.label}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
