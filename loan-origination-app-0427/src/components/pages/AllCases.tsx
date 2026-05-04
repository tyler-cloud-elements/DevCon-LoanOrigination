import { useNavigate } from 'react-router-dom';
import { Header } from '../layout/Header';
import { Card } from '../ui/Card';
import { Pill } from '../ui/Pill';
import { StageMiniBar } from '../ui/StageMiniBar';
import { useLoanCases } from '../../hooks/useLoanCases';
import type { LoanCase } from '../../types/loan';

function statusPillTone(status: LoanCase['status']) {
  if (status === 'At Risk') return 'amber' as const;
  if (status === 'Completed') return 'green' as const;
  if (status === 'On Track') return 'green' as const;
  return 'blue' as const;
}

function slaText(sla: LoanCase['slaState']) {
  if (sla === '48h') return { color: 'var(--amber)', label: '● 48h' };
  if (sla === 'At Risk') return { color: 'var(--amber)', label: '● At Risk' };
  if (sla === 'Breached') return { color: 'var(--red)', label: '● Breached' };
  return { color: 'var(--green)', label: '● On Track' };
}

function agentIndicatorColor(ind: string) {
  if (ind === 'Handled') return { color: 'var(--purple)', prefix: '★' };
  return { color: 'var(--amber)', prefix: '⚠' };
}

function currency(n: number) {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function AllCases() {
  const navigate = useNavigate();
  const { cases, isLoading, refresh, usedFallback } = useLoanCases();

  return (
    <>
      <Header
        title="All Cases"
        subtitle={`${cases.length} active loans${usedFallback ? ' · Demo data' : ''}`}
        onRefresh={refresh}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-2 mb-3.5 flex-wrap">
          <select
            className="px-2.5 py-1 rounded-lg text-xs cursor-pointer"
            style={{
              background: 'var(--surface)',
              color: 'var(--fg2)',
              border: '1px solid var(--border)',
              fontFamily: 'inherit',
            }}
          >
            <option>All Stages</option>
            <option>Intake</option>
            <option>Processing</option>
            <option>Underwriting</option>
            <option>QA/QC</option>
            <option>Closing</option>
            <option>Post Closing</option>
          </select>
          <select
            className="px-2.5 py-1 rounded-lg text-xs cursor-pointer"
            style={{
              background: 'var(--surface)',
              color: 'var(--fg2)',
              border: '1px solid var(--border)',
              fontFamily: 'inherit',
            }}
          >
            <option>All Status</option>
            <option>On Track</option>
            <option>At Risk</option>
          </select>
          <select
            className="px-2.5 py-1 rounded-lg text-xs cursor-pointer"
            style={{
              background: 'var(--surface)',
              color: 'var(--fg2)',
              border: '1px solid var(--border)',
              fontFamily: 'inherit',
            }}
          >
            <option>All</option>
            <option>Agent Handled</option>
            <option>Needs Input</option>
          </select>
          <div className="flex-1" />
          <span className="text-[11px]" style={{ color: 'var(--fg4)' }}>
            {cases.length} cases
          </span>
        </div>

        <Card style={{ overflow: 'auto' }}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Case ID', 'Borrower', 'Amount', 'Stage', 'Progress', 'Status', 'SLA', 'Agent'].map((h) => (
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
                  <td
                    colSpan={8}
                    className="px-3.5 py-6 text-center text-[13px]"
                    style={{ color: 'var(--fg3)' }}
                  >
                    Loading loans…
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3.5 py-6 text-center text-[13px]"
                    style={{ color: 'var(--fg3)' }}
                  >
                    No loans found.
                  </td>
                </tr>
              ) : (
                cases.map((c) => {
                  const sla = slaText(c.slaState);
                  const agent = agentIndicatorColor(c.agentIndicator);
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
                        {currency(c.amount)}
                      </td>
                      <td className="px-3.5 py-2.5 text-[13px]" style={{ borderBottom: '1px solid var(--border)' }}>
                        {c.stage}
                      </td>
                      <td className="px-3.5 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                        <StageMiniBar stage={c.stage} />
                      </td>
                      <td className="px-3.5 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                        <Pill tone={statusPillTone(c.status)}>{c.status}</Pill>
                      </td>
                      <td
                        className="px-3.5 py-2.5 text-[13px]"
                        style={{ color: sla.color, borderBottom: '1px solid var(--border)' }}
                      >
                        {sla.label}
                      </td>
                      <td
                        className="px-3.5 py-2.5 text-[13px]"
                        style={{ color: agent.color, borderBottom: '1px solid var(--border)' }}
                      >
                        {agent.prefix} {c.agentIndicator}
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
