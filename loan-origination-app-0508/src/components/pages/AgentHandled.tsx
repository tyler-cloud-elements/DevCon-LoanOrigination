import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../layout/Header';
import { Card } from '../ui/Card';
import { useLoanCases } from '../../hooks/useLoanCases';

interface HandledRow {
  caseId: string;
  borrower: string;
  amount: string;
  stage: string;
  activity: string;
  isLive: boolean;
  lastAction: string;
}

const HARDCODED_HANDLED: HandledRow[] = [
  { caseId: 'LA-2026-00853', borrower: 'Angela Brooks', amount: '$320K', stage: 'Processing', activity: 'Extracting pay stubs', isLive: true, lastAction: '2m ago' },
  { caseId: 'LA-2026-00857', borrower: 'Carlos Martinez', amount: '$395K', stage: 'Processing', activity: 'Classifying income', isLive: true, lastAction: '4m ago' },
  { caseId: 'LA-2026-00860', borrower: 'Sophia Patel', amount: '$520K', stage: 'Intake', activity: 'Credit pull', isLive: true, lastAction: '7m ago' },
  { caseId: 'LA-2026-00862', borrower: "Liam O'Brien", amount: '$680K', stage: 'Intake', activity: 'Sanctions screening', isLive: true, lastAction: '12m ago' },
  { caseId: 'LA-2026-00851', borrower: 'James Chen', amount: '$485K', stage: 'Underwriting', activity: 'Awaiting VOE callback', isLive: false, lastAction: '38m ago' },
  { caseId: 'LA-2026-00865', borrower: 'Nadia Haddad', amount: '$410K', stage: 'Underwriting', activity: 'Running DTI ratios', isLive: false, lastAction: '1h ago' },
  { caseId: 'LA-2026-00855', borrower: 'Elena Rodriguez', amount: '$275K', stage: 'QA/QC', activity: 'Compliance checks running', isLive: false, lastAction: '1h ago' },
  { caseId: 'LA-2026-00868', borrower: 'Ravi Krishnan', amount: '$340K', stage: 'Processing', activity: 'Title search ordered', isLive: false, lastAction: '2h ago' },
  { caseId: 'LA-2026-00871', borrower: 'Beatrice Lang', amount: '$295K', stage: 'Closing', activity: 'Generating closing disclosure', isLive: false, lastAction: '2h ago' },
  { caseId: 'LA-2026-00883', borrower: 'Hana Suzuki', amount: '$515K', stage: 'QA/QC', activity: 'QC package assembled', isLive: false, lastAction: '3h ago' },
  { caseId: 'LA-2026-00886', borrower: 'Oliver Bennett', amount: '$290K', stage: 'Underwriting', activity: 'Automated approval decision', isLive: false, lastAction: '4h ago' },
  { caseId: 'LA-2026-00877', borrower: 'Grace Okafor', amount: '$380K', stage: 'Post Closing', activity: 'Investor delivery packet', isLive: false, lastAction: 'Yesterday' },
];

const FILTERS = [
  { key: 'all', label: 'All', count: 34 },
  { key: 'live', label: 'Working now', count: 7 },
  { key: 'paused', label: 'Paused', count: 2 },
  { key: 'waiting', label: 'Waiting', count: 5 },
];

export function AgentHandled() {
  const navigate = useNavigate();
  const { cases, refresh } = useLoanCases();
  const [active, setActive] = useState('all');

  const liveCases = useMemo(() => cases.filter((c) => c.isReal), [cases]);

  const visible = active === 'live' ? HARDCODED_HANDLED.filter((r) => r.isLive) : HARDCODED_HANDLED;

  return (
    <>
      <Header title="Agent Handled" subtitle="34 cases progressing autonomously" onRefresh={refresh} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-2 mb-3.5 flex-wrap">
          {FILTERS.map((f) => {
            const isActive = active === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActive(f.key)}
                className="px-3 py-1 rounded-[16px] text-xs font-medium transition-all"
                style={{
                  background: isActive ? 'var(--blue-bg)' : 'var(--surface)',
                  color: isActive ? 'var(--blue)' : 'var(--fg3)',
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
            <option>Sort: Recent activity</option>
            <option>Sort: Stage</option>
          </select>
        </div>

        <Card
          className="mb-3"
          style={{ borderColor: 'var(--purple-bd)', background: 'var(--purple-bg)' }}
        >
          <div
            className="px-4 py-3.5 text-[12px] leading-relaxed"
            style={{ color: 'var(--fg2)' }}
          >
            <b style={{ color: 'var(--purple)' }}>34 of 47 cases</b> are progressing autonomously. No human
            input needed right now — you'll be pinged if the case manager hits a guardrail.
          </div>
        </Card>

        {liveCases.length > 0 && (
          <Card className="mb-3" style={{ borderColor: 'var(--green-bd)' }}>
            <div
              className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.5px]"
              style={{ background: 'var(--green-bg)', color: 'var(--green)' }}
            >
              ● Live (from UiPath) · {liveCases.length}
            </div>
            <table className="w-full border-collapse">
              <tbody>
                {liveCases.slice(0, 5).map((c) => (
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
                      <span className="live-dot" />
                      {c.caseId}
                    </td>
                    <td className="px-3.5 py-2.5 text-[13px]" style={{ borderBottom: '1px solid var(--border)' }}>
                      {c.borrowerName}
                    </td>
                    <td className="px-3.5 py-2.5 text-[13px]" style={{ borderBottom: '1px solid var(--border)' }}>
                      {c.stage}
                    </td>
                    <td
                      className="px-3.5 py-2.5 text-[13px]"
                      style={{ color: 'var(--purple)', borderBottom: '1px solid var(--border)' }}
                    >
                      {c.runStatus ?? '—'}
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
                {['Case ID', 'Borrower', 'Amount', 'Stage', 'Current Activity', 'Last Action'].map((h) => (
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
                  onClick={() => navigate('/cases')}
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
                  <td
                    className="px-3.5 py-2.5 text-[13px]"
                    style={{ color: row.isLive ? 'var(--purple)' : 'var(--fg2)', borderBottom: '1px solid var(--border)' }}
                  >
                    {row.isLive && <span className="live-dot" />}
                    {row.activity}
                  </td>
                  <td
                    className="px-3.5 py-2.5 text-[13px]"
                    style={{ color: 'var(--fg3)', borderBottom: '1px solid var(--border)' }}
                  >
                    {row.lastAction}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <div className="mt-2.5 text-center text-[12px]" style={{ color: 'var(--fg4)' }}>
          <a href="#" style={{ color: 'var(--purple)', textDecoration: 'none' }}>
            Show all 34 →
          </a>
        </div>
      </div>
    </>
  );
}
