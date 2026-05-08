import { useCallback, useEffect, useState } from 'react';
import { Header } from '../layout/Header';
import { KPICard } from '../ui/KPICard';
import { Card } from '../ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import {
  fetchAnalyticsData,
  type AnalyticsData,
} from '../../services/insightsService';
import {
  AvgByGroup,
  Donut,
  Empty,
  formatCurrency,
  HighValueCard,
  PoweredByDfBadge,
  StackedBar,
  VerticalBars,
} from '../insights/widgets';

interface BarRow {
  label: string;
  value: string | number;
  pct: number;
  color: string;
  valueColor?: string;
}

const STAGE_ROWS: BarRow[] = [
  { label: 'Intake', value: 8, pct: 17, color: 'var(--blue)' },
  { label: 'Processing', value: 14, pct: 30, color: 'var(--blue)' },
  { label: 'Underwriting', value: 11, pct: 23, color: 'var(--amber)' },
  { label: 'QA/QC', value: 6, pct: 13, color: 'var(--green)' },
  { label: 'Closing', value: 5, pct: 11, color: 'var(--green)' },
  { label: 'Post Closing', value: 3, pct: 6, color: 'var(--green)' },
];

const VS_ROWS: BarRow[] = [
  { label: 'Agent', value: '72%', pct: 72, color: 'var(--purple)', valueColor: 'var(--purple)' },
  { label: 'Human', value: '28%', pct: 28, color: 'var(--fg4)' },
];

const SLA_ROWS: BarRow[] = [
  { label: 'App to Decision', value: '94%', pct: 94, color: 'var(--green)', valueColor: 'var(--green)' },
  { label: 'Decision to Close', value: '87%', pct: 87, color: 'var(--amber)', valueColor: 'var(--amber)' },
  { label: 'Task Response', value: '96%', pct: 96, color: 'var(--green)', valueColor: 'var(--green)' },
];

const TOP_AGENT: BarRow[] = [
  { label: 'Doc Verify', value: 31, pct: 100, color: 'var(--purple)' },
  { label: 'Credit Pulls', value: 28, pct: 90, color: 'var(--purple)' },
  { label: 'Employment', value: 24, pct: 77, color: 'var(--purple)' },
  { label: 'Sanctions', value: 19, pct: 61, color: 'var(--purple)' },
  { label: 'Income', value: 18, pct: 58, color: 'var(--purple)' },
];

const LOAN_TYPE: BarRow[] = [
  { label: 'Conventional', value: 29, pct: 62, color: 'var(--blue)' },
  { label: 'FHA', value: 11, pct: 23, color: 'var(--green)' },
  { label: 'VA', value: 4, pct: 9, color: 'var(--amber)' },
  { label: 'Jumbo', value: 3, pct: 6, color: 'var(--red)' },
];

const TIME_PER_STAGE: BarRow[] = [
  { label: 'Intake', value: 1.2, pct: 10, color: 'var(--green)' },
  { label: 'Processing', value: 5.8, pct: 40, color: 'var(--blue)' },
  { label: 'Underwriting', value: 7.4, pct: 55, color: 'var(--amber)' },
  { label: 'QA/QC', value: 3.1, pct: 22, color: 'var(--green)' },
  { label: 'Closing', value: 6.9, pct: 50, color: 'var(--amber)' },
  { label: 'Post Closing', value: 4.6, pct: 35, color: 'var(--blue)' },
];

function BarChart({ rows }: { rows: BarRow[] }) {
  return (
    <>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2 mb-1.5">
          <div className="text-[11px] w-[85px] flex-shrink-0" style={{ color: 'var(--fg4)' }}>
            {r.label}
          </div>
          <div
            className="flex-1 h-3 rounded overflow-hidden"
            style={{ background: 'var(--elevated)' }}
          >
            <div className="h-full rounded" style={{ width: `${r.pct}%`, background: r.color }} />
          </div>
          <div
            className="text-[11px] font-semibold w-[34px] text-right"
            style={{ color: r.valueColor ?? 'var(--fg2)' }}
          >
            {r.value}
          </div>
        </div>
      ))}
    </>
  );
}

function AnCard({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="p-4">
        <div className="flex items-baseline justify-between mb-3 gap-3">
          <div
            className="text-[11px] font-semibold uppercase tracking-[0.4px]"
            style={{ color: 'var(--fg3)' }}
          >
            {title}
          </div>
          {badge}
        </div>
        {children}
      </div>
    </Card>
  );
}

export function Analytics() {
  const { sdk } = useAuth();
  const { toast } = useToast();
  const [dfData, setDfData] = useState<AnalyticsData | null>(null);
  const [dfLoading, setDfLoading] = useState(true);
  const [dfError, setDfError] = useState<string | null>(null);

  const loadDf = useCallback(async () => {
    setDfLoading(true);
    setDfError(null);
    try {
      const d = await fetchAnalyticsData(sdk);
      setDfData(d);
    } catch (err) {
      console.error('fetchAnalyticsData failed', err);
      const msg = err instanceof Error ? err.message : 'Failed to load DataFabric analytics';
      setDfError(msg);
      toast(`DataFabric load failed: ${msg}`);
    } finally {
      setDfLoading(false);
    }
  }, [sdk, toast]);

  useEffect(() => {
    loadDf();
  }, [loadDf]);

  return (
    <>
      <Header title="Analytics" subtitle="Portfolio & business KPIs" onRefresh={loadDf} />
      <div className="flex-1 overflow-y-auto p-6">
        <CaseManagerImpactStrip />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <KPICard label="Avg. Close Time" value="30d" accent="blue" subLabel="Down 17d" />
          <KPICard label="Automation Rate" value="72%" accent="purple" subLabel="Agent resolved" />
          <KPICard label="Cost per Loan" value="$847" accent="green" subLabel="-38%" />
          <KPICard label="Revenue at Risk" value="$1.2M" accent="amber" subLabel="3 rate locks" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3.5">
          <AnCard title="Cases by Stage">
            <BarChart rows={STAGE_ROWS} />
          </AnCard>
          <AnCard title="Agent vs Human">
            <BarChart rows={VS_ROWS} />
            <div className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--fg3)' }}>
              <b style={{ color: 'var(--fg)' }}>142 tasks</b> auto-resolved in 7 days.
            </div>
          </AnCard>
          <AnCard title="SLA Performance">
            <BarChart rows={SLA_ROWS} />
          </AnCard>
          <AnCard title="Business Impact">
            <div className="mb-2.5">
              <div className="text-[10px]" style={{ color: 'var(--fg4)' }}>
                Revenue Throughput
              </div>
              <div className="text-[22px] font-extrabold" style={{ color: 'var(--blue)' }}>
                $18.4M <span className="text-[11px]" style={{ color: 'var(--green)' }}>+23%</span>
              </div>
            </div>
            <div className="mb-2.5">
              <div className="text-[10px]" style={{ color: 'var(--fg4)' }}>
                Loans Closed (Month)
              </div>
              <div className="text-[22px] font-extrabold" style={{ color: 'var(--fg)' }}>
                34 <span className="text-[11px]" style={{ color: 'var(--green)' }}>+8</span>
              </div>
            </div>
            <div>
              <div className="text-[10px]" style={{ color: 'var(--fg4)' }}>
                Days Saved per Loan
              </div>
              <div className="text-[22px] font-extrabold" style={{ color: 'var(--purple)' }}>
                17
              </div>
            </div>
          </AnCard>
        </div>

        <DataFabricSection
          data={dfData}
          loading={dfLoading}
          error={dfError}
          onRetry={loadDf}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3.5">
          <AnCard title="Top Agent Actions (7d)">
            <BarChart rows={TOP_AGENT} />
          </AnCard>
          <AnCard title="Loan Type Distribution">
            <BarChart rows={LOAN_TYPE} />
          </AnCard>
          <AnCard title="Exception Stages">
            <div className="flex flex-col gap-2 text-[13px]">
              <Row l="Pending with Customer" v="4" color="var(--amber)" />
              <Row l="Escalation" v="2" color="var(--red)" />
              <Row l="Withdrawn" v="1" color="var(--fg3)" />
              <Row l="Rejected" v="0" color="var(--fg3)" />
            </div>
            <div
              className="mt-2.5 pt-2 text-[11px]"
              style={{ borderTop: '1px solid var(--border)', color: 'var(--fg4)' }}
            >
              Avg. pending resolution: 3.2 days
            </div>
          </AnCard>
        </div>

        <TaskAutomationBreakdown />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AnCard title="Avg. Time per Stage (days)">
            <BarChart rows={TIME_PER_STAGE} />
          </AnCard>
          <AnCard title="Loan Officer Leaderboard">
            <div className="flex flex-col gap-2 text-[13px]">
              <LOfficer ini="TT" color="#1E4480,#0F9D8F" name="Tyler Toth" stats="12 active · 94%" />
              <LOfficer ini="AJ" color="#EC4899,#F43F5E" name="Alex Johnson" stats="10 active · 96%" />
              <LOfficer ini="DL" color="#F59E0B,#EF4444" name="David Lee" stats="8 active · 91%" />
              <LOfficer ini="MK" color="#10B981,#059669" name="Mira Kim" stats="9 active · 98%" />
            </div>
          </AnCard>
        </div>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Case Manager Impact Strip — purple-gradient banner with 4 agent KPIs
// ────────────────────────────────────────────────────────────────────────────
function CaseManagerImpactStrip() {
  return (
    <div
      className="grid gap-3 mb-4 p-3.5 rounded-[10px]"
      style={{
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        border: '1px solid var(--purple-bd)',
        background: 'linear-gradient(135deg, var(--purple-bg), transparent 60%)',
      }}
    >
      <div className="col-span-4 flex items-center gap-2 mb-0.5">
        <span
          className="w-5 h-5 rounded-full relative"
          style={{
            background: 'linear-gradient(135deg,#5EEAD4,#0F9D8F)',
            boxShadow: '0 0 0 3px rgba(15,157,143,0.18)',
          }}
        >
          <span
            className="absolute top-1 right-[3px] w-1.5 h-1.5 bg-white rounded-full"
            style={{ opacity: 0.85 }}
          />
        </span>
        <span
          className="text-xs font-bold uppercase tracking-[0.5px]"
          style={{ color: 'var(--purple)' }}
        >
          Case Manager Impact
        </span>
        <span className="text-[11px] ml-auto" style={{ color: 'var(--fg4)' }}>
          Last 30 days · across 47 active loans
        </span>
      </div>
      <ImpactKpi label="Cases Managed" value="34" valueSuffix="/47" sub="72% of portfolio orchestrated end-to-end" />
      <ImpactKpi label="Hours Saved" value="187" valueSuffix="h" sub="~5.5h per loan · vs. pre-agent baseline" />
      <ImpactKpi label="Autonomous Decisions" value="142" sub="Rules + reasoning, no human in loop" />
      <ImpactKpi
        label="Human Interventions"
        value="28"
        valueSuffix=" · 17%"
        sub="Policy exceptions & edge cases escalated"
        valueColor="var(--amber)"
      />
    </div>
  );
}

function ImpactKpi({
  label,
  value,
  valueSuffix,
  sub,
  valueColor,
}: {
  label: string;
  value: string;
  valueSuffix?: string;
  sub: string;
  valueColor?: string;
}) {
  return (
    <div className="p-0.5">
      <div
        className="text-[10px] font-semibold uppercase tracking-[0.3px]"
        style={{ color: 'var(--fg3)' }}
      >
        {label}
      </div>
      <div
        className="text-[24px] font-extrabold mt-0.5 leading-none"
        style={{ color: valueColor ?? 'var(--purple)' }}
      >
        {value}
        {valueSuffix && (
          <small className="text-[13px] font-semibold" style={{ color: 'var(--fg3)' }}>
            {valueSuffix}
          </small>
        )}
      </div>
      <div className="text-[10px] mt-1" style={{ color: 'var(--fg4)' }}>
        {sub}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Task Automation Breakdown — stacked horizontal bars per task type
// ────────────────────────────────────────────────────────────────────────────
type SegKind = 'rules' | 'auto' | 'reason' | 'human';

interface TaSegment {
  kind: SegKind;
  pct: number;
  label?: string;
}

interface TaRow {
  label: string;
  segments: TaSegment[];
  count: string;
}

const TA_ROWS: TaRow[] = [
  { label: 'Eligibility screening', segments: [{ kind: 'rules', pct: 100, label: '100% rules' }], count: '47 / 47' },
  { label: 'Credit pull', segments: [{ kind: 'auto', pct: 100, label: '100% automated' }], count: '47 / 47' },
  { label: 'Sanctions screening', segments: [{ kind: 'rules', pct: 100, label: '100% rules' }], count: '47 / 47' },
  { label: 'Loan estimate', segments: [{ kind: 'auto', pct: 100, label: '100% automated' }], count: '47 / 47' },
  {
    label: 'Document extraction',
    segments: [
      { kind: 'auto', pct: 96, label: '96%' },
      { kind: 'human', pct: 4 },
    ],
    count: '45 / 47',
  },
  {
    label: 'Income classification',
    segments: [
      { kind: 'auto', pct: 88, label: '88%' },
      { kind: 'reason', pct: 12, label: '12%' },
    ],
    count: '41 / 47',
  },
  {
    label: 'Employment verification',
    segments: [
      { kind: 'auto', pct: 72, label: '72%' },
      { kind: 'reason', pct: 16, label: '16%' },
      { kind: 'human', pct: 12 },
    ],
    count: '41 / 47',
  },
  {
    label: 'Title search',
    segments: [
      { kind: 'auto', pct: 68, label: '68%' },
      { kind: 'human', pct: 32, label: '32%' },
    ],
    count: '32 / 47',
  },
  {
    label: 'Appraisal review',
    segments: [
      { kind: 'reason', pct: 55, label: '55%' },
      { kind: 'human', pct: 45, label: '45%' },
    ],
    count: '26 / 47',
  },
  {
    label: 'Underwriting decision',
    segments: [
      { kind: 'reason', pct: 42, label: '42%' },
      { kind: 'human', pct: 58, label: '58%' },
    ],
    count: '20 / 47',
  },
  {
    label: 'Condition clearance',
    segments: [
      { kind: 'auto', pct: 60, label: '60%' },
      { kind: 'reason', pct: 25, label: '25%' },
      { kind: 'human', pct: 15 },
    ],
    count: '28 / 47',
  },
  {
    label: 'Closing disclosure',
    segments: [
      { kind: 'auto', pct: 85, label: '85%' },
      { kind: 'human', pct: 15 },
    ],
    count: '40 / 47',
  },
];

const SEG_COLORS: Record<SegKind, string> = {
  rules: '#F59E0B',
  auto: 'var(--green)',
  reason: 'var(--purple)',
  human: 'var(--fg4)',
};

function TaskAutomationBreakdown() {
  return (
    <div className="mt-3.5 mb-3.5">
      <Card>
        <div className="p-4">
          <div
            className="text-[11px] font-semibold mb-3 uppercase tracking-[0.4px] flex items-center justify-between"
            style={{ color: 'var(--fg3)' }}
          >
            Task Automation &amp; Agentification
            <span className="text-[10px] font-normal" style={{ color: 'var(--fg4)' }}>
              How the Case Manager resolves each task type
            </span>
          </div>
          {TA_ROWS.map((row) => (
            <div
              key={row.label}
              className="grid gap-2.5 items-center py-1.5 text-xs"
              style={{ gridTemplateColumns: '140px minmax(0, 1fr) 60px' }}
            >
              <div className="font-medium" style={{ color: 'var(--fg2)' }}>
                {row.label}
              </div>
              <div
                className="h-3.5 flex rounded-md overflow-hidden"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
              >
                {row.segments.map((seg, idx) => (
                  <div
                    key={idx}
                    className="h-full flex items-center justify-center text-[9px] text-white font-semibold"
                    style={{ background: SEG_COLORS[seg.kind], width: `${seg.pct}%` }}
                  >
                    {seg.label ?? ''}
                  </div>
                ))}
              </div>
              <div className="text-[11px] font-semibold text-right" style={{ color: 'var(--fg3)' }}>
                {row.count}
              </div>
            </div>
          ))}
          <div
            className="flex flex-wrap gap-2.5 mt-2.5 pt-2.5 text-[10px]"
            style={{ borderTop: '1px solid var(--border)', color: 'var(--fg3)' }}
          >
            <Legend kind="rules" label="Deterministic rules" />
            <Legend kind="auto" label="Automation (bots, APIs)" />
            <Legend kind="reason" label="Agent reasoning" />
            <Legend kind="human" label="Human-in-the-loop" />
          </div>
        </div>
      </Card>
    </div>
  );
}

function Legend({ kind, label }: { kind: SegKind; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="w-2 h-2 rounded-sm"
        style={{ background: SEG_COLORS[kind] }}
      />
      {label}
    </span>
  );
}

function Row({ l, v, color }: { l: string; v: string; color: string }) {
  return (
    <div className="flex justify-between items-center">
      <span style={{ color: 'var(--fg2)' }}>{l}</span>
      <span className="font-bold" style={{ color }}>
        {v}
      </span>
    </div>
  );
}

function LOfficer({ ini, color, name, stats }: { ini: string; color: string; name: string; stats: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="flex items-center gap-1.5">
        <span
          className="w-5 h-5 inline-flex items-center justify-center rounded-full text-white text-[9px] font-semibold"
          style={{ background: `linear-gradient(135deg,${color})` }}
        >
          {ini}
        </span>
        {name}
      </span>
      <span className="font-semibold" style={{ color: 'var(--fg2)' }}>
        {stats}
      </span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Powered by DataFabric — KPIs and charts driven by live aggregate/groupBy
// queries on LoanOriginationEntity. Sits between Business Impact and the Top
// Agent Actions row.
// ────────────────────────────────────────────────────────────────────────────
function DataFabricSection({
  data,
  loading,
  error,
  onRetry,
}: {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <>
      {loading && !data && <DfLoading />}
      {error && !loading && <DfError message={error} onRetry={onRetry} />}
      {data && <DfCharts data={data} />}
      {!loading && !error && !data?.hasData && <DfEmpty />}
    </>
  );
}

function DfCharts({ data }: { data: AnalyticsData }) {
  const closingRate =
    data.totalApplications > 0
      ? Math.round((data.closedCount / data.totalApplications) * 100)
      : 0;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3.5">
        <KPICard
          label="Loan Applications"
          value={data.totalApplications}
          accent="blue"
          subLabel="COUNT(Id)"
          badge={<PoweredByDfBadge />}
        />
        <KPICard
          label="Total Volume"
          value={formatCurrency(data.totalVolume)}
          accent="purple"
          subLabel="SUM(LoanAmount)"
          badge={<PoweredByDfBadge />}
        />
        <KPICard
          label="Avg Loan Size"
          value={formatCurrency(data.avgAmount)}
          accent="green"
          subLabel={`Min ${formatCurrency(data.minAmount)} · Max ${formatCurrency(data.maxAmount)}`}
          badge={<PoweredByDfBadge />}
        />
        <KPICard
          label="Closing Rate"
          value={`${closingRate}%`}
          accent="amber"
          subLabel={`${data.closedCount} of ${data.totalApplications} closed`}
          badge={<PoweredByDfBadge />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3.5">
        <AnCard title="Avg Loan Size by Loan Type" badge={<PoweredByDfBadge />}>
          {data.avgByLoanType.length === 0 ? (
            <Empty msg="No loan types yet" />
          ) : (
            <AvgByGroup rows={data.avgByLoanType} metric="avg" />
          )}
        </AnCard>
        <AnCard title="Loan Volume by Application Status" badge={<PoweredByDfBadge />}>
          {data.avgByStatus.length === 0 ? (
            <Empty msg="No status data" />
          ) : (
            <StackedBar
              rows={data.avgByStatus.map((r) => ({ label: r.label, value: r.total }))}
              totalLabel="Pipeline volume"
            />
          )}
        </AnCard>
      </div>

      <div className="mb-3.5">
        <AnCard
          title={`High-Value Loans (≥ ${formatCurrency(data.highValue.threshold)})`}
          badge={<PoweredByDfBadge />}
        >
          <HighValueCard stats={data.highValue} />
        </AnCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3.5">
        <AnCard title="Loan Type Distribution" badge={<PoweredByDfBadge />}>
          {data.byLoanType.length === 0 ? (
            <Empty msg="No loan types yet" />
          ) : (
            <Donut
              rows={data.byLoanType}
              centerValue={data.byLoanType.reduce((s, r) => s + r.value, 0)}
              centerLabel="loans"
            />
          )}
        </AnCard>
        <AnCard title="Loan Amount Buckets" badge={<PoweredByDfBadge />}>
          {data.byAmountBucket.every((r) => r.value === 0) ? (
            <Empty msg="No loan amounts yet" />
          ) : (
            <VerticalBars
              rows={data.byAmountBucket.map((r) => ({
                label: r.label,
                value: r.value,
                sub: r.totalVolume > 0 ? formatCurrency(r.totalVolume) : undefined,
              }))}
            />
          )}
        </AnCard>
      </div>

    </>
  );
}

function DfLoading() {
  return (
    <div
      className="flex items-center justify-center gap-3 py-8 mb-3.5 rounded-[10px]"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div
        className="w-6 h-6 rounded-full"
        style={{
          border: '2.5px solid var(--border)',
          borderTopColor: '#0F9D8F',
          animation: 'lp-spin 0.8s linear infinite',
        }}
      />
      <div className="text-[12px]" style={{ color: 'var(--fg3)' }}>
        Aggregating DataFabric records…
      </div>
    </div>
  );
}

function DfError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card>
      <div className="p-5 text-center mb-3.5">
        <div className="text-[13px] font-bold mb-1" style={{ color: 'var(--red)' }}>
          DataFabric load failed
        </div>
        <div className="text-[12px] mb-3" style={{ color: 'var(--fg3)' }}>
          {message}
        </div>
        <button
          onClick={onRetry}
          className="px-3 py-1.5 rounded-md text-[12px] font-semibold text-white"
          style={{ background: '#0F9D8F' }}
        >
          Retry
        </button>
      </div>
    </Card>
  );
}

function DfEmpty() {
  return (
    <Card>
      <div className="p-6 text-center mb-3.5">
        <div className="text-[13px] font-bold mb-1" style={{ color: 'var(--fg)' }}>
          No DataFabric records yet
        </div>
        <div className="text-[11px]" style={{ color: 'var(--fg3)' }}>
          Create a loan from the Dashboard to populate these aggregates.
        </div>
      </div>
    </Card>
  );
}
