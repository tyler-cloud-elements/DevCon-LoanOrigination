import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../layout/Header';
import { Card } from '../ui/Card';
import { useLoanCases } from '../../hooks/useLoanCases';

interface SLARow {
  caseId: string;
  borrower: string;
  amount: string;
  stage: string;
  metric: string;
  timeLeft: string;
  timeColor: string;
  blocker: string;
}

const HARDCODED_SLA: SLARow[] = [
  {
    caseId: 'LA-2026-00839',
    borrower: 'Marcus Johnson',
    amount: '$580K',
    stage: 'Closing',
    metric: 'Rate-lock expiry',
    timeLeft: '● 48h',
    timeColor: 'var(--red)',
    blocker: 'Manager approval required',
  },
  {
    caseId: 'LA-2026-00816',
    borrower: 'Priyanka Rao',
    amount: '$610K',
    stage: 'Underwriting',
    metric: 'Decision SLA',
    timeLeft: '● Today',
    timeColor: 'var(--red)',
    blocker: 'Manual decline review',
  },
  {
    caseId: 'LA-2026-00841',
    borrower: 'Wei Zhang',
    amount: '$320K',
    stage: 'Underwriting',
    metric: 'Underwriting day 8 of 7',
    timeLeft: '● Overdue 1d',
    timeColor: 'var(--amber)',
    blocker: 'Complex income classification',
  },
  {
    caseId: 'LA-2026-00874',
    borrower: 'Kenji Yamamoto',
    amount: '$725K',
    stage: 'Closing',
    metric: 'Funding SLA',
    timeLeft: '● 3d left',
    timeColor: 'var(--amber)',
    blocker: 'Wire instructions pending',
  },
  {
    caseId: 'LA-2026-00880',
    borrower: 'Tomas Reyes',
    amount: '$445K',
    stage: 'Processing',
    metric: 'Processing day 9 of 7',
    timeLeft: '● Overdue 2d',
    timeColor: 'var(--amber)',
    blocker: 'Borrower missing pay stubs',
  },
  {
    caseId: 'LA-2026-00824',
    borrower: 'Zainab Ahmed',
    amount: '$285K',
    stage: 'Underwriting',
    metric: 'Appraisal re-review SLA',
    timeLeft: '● 4d left',
    timeColor: 'var(--amber)',
    blocker: 'Appraiser disputing comps',
  },
];

const FILTERS = [
  { key: 'all', label: 'All', count: 6 },
  { key: 'today', label: 'Breach today', count: 2 },
  { key: 'week', label: 'Breach this week', count: 4 },
];

export function SLARisk() {
  const navigate = useNavigate();
  const { cases, refresh } = useLoanCases();
  const [active, setActive] = useState('all');

  const liveAtRisk = useMemo(
    () => cases.filter((c) => c.isReal && (c.slaState === 'At Risk' || c.slaState === '48h' || c.slaState === 'Breached')),
    [cases],
  );

  const visible = active === 'today'
    ? HARDCODED_SLA.filter((r) => r.timeColor === 'var(--red)')
    : active === 'week'
      ? HARDCODED_SLA.filter((r) => r.timeColor === 'var(--amber)')
      : HARDCODED_SLA;

  return (
    <>
      <Header title="SLA Risk" subtitle="6 cases nearing breach" onRefresh={refresh} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-2 mb-3.5 flex-wrap">
          {FILTERS.map((f) => {
            const isActive = active === f.key;
            const isBreachToday = f.key === 'today';
            return (
              <button
                key={f.key}
                onClick={() => setActive(f.key)}
                className="px-3 py-1 rounded-[16px] text-xs font-medium transition-all"
                style={{
                  background: isActive
                    ? 'var(--blue-bg)'
                    : isBreachToday
                      ? 'var(--red-bg)'
                      : 'var(--surface)',
                  color: isActive ? 'var(--blue)' : isBreachToday ? 'var(--red)' : 'var(--fg3)',
                  border: `1px solid ${isActive ? 'var(--blue-bd)' : 'var(--border)'}`,
                }}
              >
                {f.label} {f.count}
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
            }}
          >
            <option>Sort: Time left</option>
            <option>Sort: Amount</option>
          </select>
        </div>

        <Card
          className="mb-3"
          style={{ borderColor: 'var(--red)', background: 'rgba(220,38,38,0.04)' }}
        >
          <div
            className="px-4 py-3.5 text-[12px] leading-relaxed"
            style={{ color: 'var(--fg2)' }}
          >
            <b style={{ color: 'var(--red)' }}>Case Manager has paused on 2 cases.</b> Both need manager
            sign-off before it can proceed — escalation policy kicks in at the 48h mark.
          </div>
        </Card>

        {liveAtRisk.length > 0 && (
          <Card className="mb-3" style={{ borderColor: 'var(--green-bd)' }}>
            <div
              className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.5px]"
              style={{ background: 'var(--green-bg)', color: 'var(--green)' }}
            >
              Live (from UiPath) · {liveAtRisk.length}
            </div>
            <table className="w-full border-collapse">
              <tbody>
                {liveAtRisk.slice(0, 5).map((c) => (
                  <tr
                    key={c.caseInstanceId}
                    onClick={() => navigate(`/loans/${c.caseInstanceId}?folder=${c.folderKey}`)}
                    className="cursor-pointer transition-colors"
                    onMouseOver={(e) => (e.currentTarget.style.background = 'var(--hover)')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td
                      className="px-3.5 py-2.5 text-[13px] font-semibold"
                      style={{ color: 'var(--blue)', borderBottom: '1px solid var(--border)' }}
                    >
                      {c.caseId}
                    </td>
                    <td className="px-3.5 py-2.5 text-[13px]" style={{ borderBottom: '1px solid var(--border)' }}>
                      {c.borrowerName}
                    </td>
                    <td className="px-3.5 py-2.5 text-[13px]" style={{ borderBottom: '1px solid var(--border)' }}>
                      {c.stage}
                    </td>
                    <td
                      className="px-3.5 py-2.5 text-[12px] mono"
                      style={{ color: 'var(--amber)', borderBottom: '1px solid var(--border)' }}
                    >
                      ● {c.slaState}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        <Card style={{ overflow: 'auto' }}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Case ID', 'Borrower', 'Amount', 'Stage', 'SLA Metric', 'Time Left', 'Blocker'].map((h) => (
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
              {visible.map((row) => (
                <tr
                  key={row.caseId}
                  onClick={() => navigate('/queue')}
                  className="cursor-pointer transition-colors"
                  onMouseOver={(e) => (e.currentTarget.style.background = 'var(--hover)')}
                  onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td
                    className="px-3.5 py-2.5 text-[13px] font-semibold"
                    style={{ color: 'var(--blue)', borderBottom: '1px solid var(--border)' }}
                  >
                    {row.caseId}
                  </td>
                  <td className="px-3.5 py-2.5 text-[13px]" style={{ borderBottom: '1px solid var(--border)' }}>
                    {row.borrower}
                  </td>
                  <td className="px-3.5 py-2.5 text-[13px]" style={{ borderBottom: '1px solid var(--border)' }}>
                    {row.amount}
                  </td>
                  <td className="px-3.5 py-2.5 text-[13px]" style={{ borderBottom: '1px solid var(--border)' }}>
                    {row.stage}
                  </td>
                  <td className="px-3.5 py-2.5 text-[13px]" style={{ borderBottom: '1px solid var(--border)' }}>
                    {row.metric}
                  </td>
                  <td
                    className="px-3.5 py-2.5 text-[13px] font-bold"
                    style={{
                      color: row.timeColor,
                      borderBottom: '1px solid var(--border)',
                      fontWeight: row.timeColor === 'var(--red)' ? 700 : 600,
                    }}
                  >
                    {row.timeLeft}
                  </td>
                  <td className="px-3.5 py-2.5 text-[13px]" style={{ borderBottom: '1px solid var(--border)' }}>
                    {row.blocker}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
