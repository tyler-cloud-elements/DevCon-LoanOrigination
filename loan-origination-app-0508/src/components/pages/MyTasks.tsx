import { useState } from 'react';
import { Header } from '../layout/Header';
import { useToast } from '../../hooks/useToast';

interface MyTaskRow {
  id: string;
  title: string;
  sub?: string;
  case: { name: string; id: string };
  due: string;
  dueTone?: 'overdue' | 'today' | '';
  source: 'agent' | 'stage' | 'adhoc';
  trigger?: { label: string; tone: 'red' | 'amber' | 'blue' | 'purple'; trigger?: boolean };
  titleColor?: string;
}

const URGENT: MyTaskRow[] = [
  {
    id: 'mt1',
    title: 'Decide: decline or counter-offer',
    sub: 'DTI at 47% — above policy threshold',
    case: { name: 'Priyanka Rao', id: 'LA-2026-00816' },
    due: 'Overdue 1d',
    dueTone: 'overdue',
    source: 'agent',
    trigger: { label: 'Decide', tone: 'red' },
    titleColor: 'var(--red)',
  },
  {
    id: 'mt2',
    title: 'Approve rate-lock extension',
    sub: 'Manager sign-off required — policy changed Mar 28',
    case: { name: 'Marcus Johnson', id: 'LA-2026-00839' },
    due: 'Today, 5pm',
    dueTone: 'today',
    source: 'agent',
    trigger: { label: 'Approve', tone: 'amber' },
  },
  {
    id: 'mt3',
    title: 'Review loan package for underwriting',
    sub: 'Case manager ready for your approval',
    case: { name: 'Priya Sharma', id: 'LA-2026-00847' },
    due: 'Today',
    dueTone: 'today',
    source: 'stage',
    trigger: { label: 'Review', tone: 'blue' },
  },
  {
    id: 'mt4',
    title: 'Clear gift-funds compliance flag',
    sub: 'Need signed gift letter from borrower',
    case: { name: 'David Kim', id: 'LA-2026-00845' },
    due: 'Today',
    dueTone: 'today',
    source: 'agent',
    trigger: { label: 'Resolve', tone: 'amber' },
  },
];

const WEEK: MyTaskRow[] = [
  {
    id: 'mt5',
    title: "Review Wei's self-employed income",
    sub: 'Complex — agent flagged for manual review',
    case: { name: 'Wei Zhang', id: 'LA-2026-00841' },
    due: 'Apr 23',
    source: 'agent',
    trigger: { label: 'Review', tone: 'blue' },
  },
  {
    id: 'mt6',
    title: 'Sign off closing disclosure',
    sub: 'Standard 3-day review',
    case: { name: 'Robert Hayes', id: 'LA-2026-00828' },
    due: 'Apr 24',
    source: 'stage',
    trigger: { label: 'Sign off', tone: 'blue' },
  },
  {
    id: 'mt7',
    title: "Follow up with appraiser on Zainab's comps",
    sub: 'Ad-hoc task you added Apr 18',
    case: { name: 'Zainab Ahmed', id: 'LA-2026-00824' },
    due: 'Apr 25',
    source: 'adhoc',
    trigger: { label: 'Trigger', tone: 'purple', trigger: true },
  },
];

const LATER: MyTaskRow[] = [
  {
    id: 'mt8',
    title: 'Re-run pricing for Isabella',
    sub: 'Ad-hoc task you added — trigger when ready',
    case: { name: 'Isabella Garcia', id: 'LA-2026-00832' },
    due: 'Apr 28',
    source: 'adhoc',
    trigger: { label: 'Trigger', tone: 'purple', trigger: true },
  },
];

export function MyTasks() {
  return (
    <>
      <Header title="My Tasks" subtitle="8 tasks across 6 cases" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 mb-5">
          <KpiCard label="Total Tasks" value="8" valueColor="var(--fg)" sub="Across 6 cases" />
          <KpiCard label="Overdue" value="1" valueColor="var(--red)" sub="Priyanka Rao — decide today" />
          <KpiCard label="Due Today" value="3" valueColor="var(--amber)" sub="Rate lock, decision, review" />
          <KpiCard label="This Week" value="4" valueColor="var(--blue)" sub="Normal priority" />
        </div>

        <Group label="Overdue / today" count={4} tone="urgent" rows={URGENT} />
        <Group label="Due this week" count={3} tone="today" rows={WEEK} />
        <Group label="Later" count={1} tone="" rows={LATER} />
      </div>
    </>
  );
}

function KpiCard({
  label,
  value,
  valueColor,
  sub,
}: {
  label: string;
  value: string;
  valueColor: string;
  sub: string;
}) {
  return (
    <div
      className="px-3.5 py-3 rounded-[10px]"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div
        className="text-[10px] font-semibold uppercase tracking-[0.3px]"
        style={{ color: 'var(--fg3)' }}
      >
        {label}
      </div>
      <div className="text-[22px] font-extrabold leading-none mt-0.5" style={{ color: valueColor }}>
        {value}
      </div>
      <div className="text-[10px] mt-1" style={{ color: 'var(--fg4)' }}>
        {sub}
      </div>
    </div>
  );
}

function Group({
  label,
  count,
  tone,
  rows,
}: {
  label: string;
  count: number;
  tone: 'urgent' | 'today' | '';
  rows: MyTaskRow[];
}) {
  const countStyle: Record<typeof tone, { bg: string; fg: string }> = {
    urgent: { bg: 'var(--red-bg)', fg: 'var(--red)' },
    today: { bg: 'var(--amber-bg)', fg: 'var(--amber)' },
    '': { bg: 'var(--elevated)', fg: 'var(--fg3)' },
  };
  const c = countStyle[tone];

  return (
    <div className="mb-5">
      <div
        className="text-[11px] font-bold uppercase tracking-[0.5px] mb-2 flex items-center gap-2"
        style={{ color: 'var(--fg3)' }}
      >
        {label}
        <span
          className="px-2 py-px rounded-[10px] text-[10px] font-semibold"
          style={{ background: c.bg, color: c.fg }}
        >
          {count}
        </span>
      </div>
      {rows.map((row) => (
        <TaskRow key={row.id} row={row} />
      ))}
    </div>
  );
}

function TaskRow({ row }: { row: MyTaskRow }) {
  const { toast } = useToast();
  const [done, setDone] = useState(false);

  const dueColor =
    row.dueTone === 'overdue' ? 'var(--red)' : row.dueTone === 'today' ? 'var(--amber)' : 'var(--fg3)';
  const dueWeight = row.dueTone === 'overdue' ? 700 : row.dueTone === 'today' ? 600 : 500;

  const sourcePill: Record<MyTaskRow['source'], { bg: string; fg: string; label: string }> = {
    agent: { bg: 'var(--purple-bg)', fg: 'var(--purple)', label: 'From Agent' },
    stage: { bg: 'var(--blue-bg)', fg: 'var(--blue)', label: 'Stage task' },
    adhoc: { bg: 'var(--amber-bg)', fg: 'var(--amber)', label: 'Ad-hoc' },
  };
  const sp = sourcePill[row.source];

  const triggerBg: Record<NonNullable<MyTaskRow['trigger']>['tone'], string> = {
    red: 'var(--red)',
    amber: 'var(--amber)',
    blue: 'var(--blue)',
    purple: 'var(--purple)',
  };

  return (
    <div
      className="grid gap-2.5 px-3.5 py-3 mb-2 rounded-[9px] cursor-pointer text-[13px] transition-all"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        gridTemplateColumns: '22px minmax(0,1fr) 150px 100px 90px 98px',
        alignItems: 'center',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'var(--purple-bd)';
        e.currentTarget.style.background = 'var(--hover)';
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.background = 'var(--surface)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        className="w-4 h-4 rounded-md cursor-pointer transition-all"
        style={{ border: '1.8px solid var(--border)', background: 'var(--bg)' }}
      />
      <div className="min-w-0">
        <div className="font-medium" style={{ color: row.titleColor ?? 'var(--fg)', fontWeight: row.titleColor ? 600 : 500 }}>
          {row.title}
        </div>
        {row.sub && (
          <div className="text-[11px] mt-0.5" style={{ color: 'var(--fg4)' }}>
            {row.sub}
          </div>
        )}
      </div>
      <div className="text-[11.5px] flex items-center gap-1.5" style={{ color: 'var(--fg3)' }}>
        <span>{row.case.name}</span>
        <span className="mono text-[10.5px]" style={{ color: 'var(--fg4)' }}>
          {row.case.id}
        </span>
      </div>
      <div className="text-[11.5px]" style={{ color: dueColor, fontWeight: dueWeight }}>
        {row.due}
      </div>
      <div
        className="text-[10px] font-semibold px-2 py-0.5 rounded-[10px] text-center"
        style={{ background: sp.bg, color: sp.fg }}
      >
        {sp.label}
      </div>
      {row.trigger && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (done) return;
            setDone(true);
            toast(`Triggered: ${row.title}`);
          }}
          className="rounded-[7px] px-3 py-1.5 text-[11px] font-semibold inline-flex items-center gap-1 justify-self-end whitespace-nowrap text-white transition-all"
          style={{
            background: done ? 'var(--green)' : triggerBg[row.trigger.tone],
            border: 'none',
            cursor: done ? 'default' : 'pointer',
          }}
        >
          {done ? '✓ Triggered' : (
            <>
              {row.trigger.trigger && <span className="text-[9px]">▶</span>}
              {row.trigger.label}
            </>
          )}
        </button>
      )}
    </div>
  );
}
