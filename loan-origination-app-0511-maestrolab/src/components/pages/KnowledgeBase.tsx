import { useState } from 'react';
import { Header } from '../layout/Header';
import { Card } from '../ui/Card';

interface KBItem {
  id: string;
  tone: 'blue' | 'green' | 'amber' | 'purple';
  icon: string;
  title: string;
  body: string;
  meta: string;
  category: 'Guidelines' | 'Compliance' | 'Agent Training' | 'Policies';
}

const ITEMS: KBItem[] = [
  {
    id: 'k1',
    tone: 'blue',
    icon: '📚',
    title: 'FHA Handbook 4000.1',
    body:
      'Complete FHA single-family housing policy. DTI thresholds, compensating factors, MIP requirements, property standards.',
    meta: 'Updated Apr 2026 · Referenced by agent 34 times this month',
    category: 'Guidelines',
  },
  {
    id: 'k2',
    tone: 'green',
    icon: '📚',
    title: 'Fannie Mae Selling Guide',
    body: 'Conventional loan eligibility, LTV limits, credit requirements, PMI policies, investor delivery guidelines.',
    meta: 'Updated Mar 2026 · Referenced 28 times',
    category: 'Guidelines',
  },
  {
    id: 'k3',
    tone: 'amber',
    icon: '⚠',
    title: 'TRID / TILA-RESPA Compliance',
    body: 'Loan Estimate and Closing Disclosure tolerance rules, timing requirements, re-disclosure triggers.',
    meta: 'Updated Feb 2026 · Referenced 19 times',
    category: 'Compliance',
  },
  {
    id: 'k4',
    tone: 'purple',
    icon: '★',
    title: 'Agent Guardrails & Policies',
    body:
      'What the case manager can/cannot do autonomously. Approval thresholds, escalation rules, compliance boundaries.',
    meta: 'Updated Apr 2026',
    category: 'Agent Training',
  },
  {
    id: 'k5',
    tone: 'blue',
    icon: '📚',
    title: 'Rate Lock & Extension Policy',
    body: 'Lock periods, extension fees, re-lock procedures. 15-day extensions require VP approval (updated Mar 28).',
    meta: 'Updated Mar 2026 · Referenced 12 times',
    category: 'Policies',
  },
  {
    id: 'k6',
    tone: 'green',
    icon: '✓',
    title: 'Employment Gap Handling',
    body: 'Agent now auto-handles employment gaps <60 days. Gaps >60 days require manual review with explanatory letter.',
    meta: 'New · Apr 2026',
    category: 'Agent Training',
  },
];

const FILTERS = ['All', 'Guidelines', 'Compliance', 'Agent Training', 'Policies'];

const ICON_STYLES: Record<KBItem['tone'], { bg: string; fg: string }> = {
  blue: { bg: 'var(--blue-bg)', fg: 'var(--blue)' },
  green: { bg: 'var(--green-bg)', fg: 'var(--green)' },
  amber: { bg: 'var(--amber-bg)', fg: 'var(--amber)' },
  purple: { bg: 'var(--purple-bg)', fg: 'var(--purple)' },
};

export function KnowledgeBase() {
  const [filter, setFilter] = useState<string>('All');
  const list = filter === 'All' ? ITEMS : ITEMS.filter((i) => i.category === filter);

  return (
    <>
      <Header title="Knowledge Base" subtitle="Guidelines, policies & agent training" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1 rounded-[16px] text-xs font-medium transition-all"
                style={{
                  background: active ? 'var(--blue-bg)' : 'var(--surface)',
                  color: active ? 'var(--blue)' : 'var(--fg3)',
                  border: `1px solid ${active ? 'var(--blue-bd)' : 'var(--border)'}`,
                }}
              >
                {f}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map((it) => {
            const style = ICON_STYLES[it.tone];
            return (
              <Card key={it.id}>
                <div className="p-4 flex gap-3 items-start">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: style.bg, color: style.fg }}
                  >
                    {it.icon}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold mb-1" style={{ color: 'var(--fg)' }}>
                      {it.title}
                    </div>
                    <div className="text-xs leading-relaxed" style={{ color: 'var(--fg3)' }}>
                      {it.body}
                    </div>
                    <div className="text-[10px] mt-1.5" style={{ color: 'var(--fg4)' }}>
                      {it.meta}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
