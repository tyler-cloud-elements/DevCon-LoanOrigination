import { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { triggerApproveWebhook } from '../../services/loanService';
import { buildCaseManagerThread } from '../../data/stageContent';
import type { CaseManagerMessage, LoanDetailData, LoanStage, ToolCall } from '../../types/loan';

interface CaseManagerTabProps {
  data: LoanDetailData;
  stage: LoanStage;
}

const SUGGESTED_CHIPS = [
  "What's the current DTI?",
  'Add a task',
  'Show similar cases',
  'Summarize all conditions',
];

type IconKind = 'rules' | 'done' | 'decision' | 'human' | 'think' | 'wait';

interface TimelineRow {
  id: string;
  kind: 'row';
  time: string;
  icon: IconKind;
  who?: string;
  mode?: 'rules' | 'reason' | 'human';
  line: React.ReactNode;
  chips?: ToolCall[];
  chipsLabel?: string;
  reasoning?: string;
  recommendation?: { text: string; approveLabel?: string; secondaryLabel?: string };
  whyPrompt?: string;
  whyExplanation?: string;
  stageCompleted?: boolean;
}

interface StageMarker {
  id: string;
  kind: 'stage';
  label: string;
  state: 'enter' | 'done';
}

type TimelineItem = TimelineRow | StageMarker;

function buildTimeline(messages: CaseManagerMessage[]): TimelineItem[] {
  const items: TimelineItem[] = [];

  for (const m of messages) {
    if (m.kind === 'stage-transition' && m.transition) {
      items.push({
        id: m.id,
        kind: 'stage',
        label: m.transition.label,
        state: m.transition.state,
      });
      continue;
    }

    const time = m.time?.replace(/^[A-Z][a-z]{2,} \d+,?\s*/, '') ?? '';
    const isHuman = m.kind === 'human';
    let icon: IconKind = 'rules';
    if (isHuman) icon = 'human';
    else if (m.thinking) icon = 'think';
    else if (m.mode === 'agent') icon = 'decision';
    else if (m.toolCalls?.some((c) => c.state === 'wait')) icon = 'wait';
    else if (m.actionCard || (m.toolCalls && m.toolCalls.length > 0)) icon = 'done';

    const lineParts: React.ReactNode[] = [];
    m.paragraphs?.forEach((p, idx) => {
      if (typeof p === 'string') lineParts.push(<span key={idx}>{p} </span>);
      else
        lineParts.push(
          <span key={idx}>
            <b>{p.bold}</b>
            {p.text ?? ''}{' '}
          </span>,
        );
    });

    items.push({
      id: m.id,
      kind: 'row',
      time,
      icon,
      who: m.actor,
      mode: isHuman ? 'human' : m.mode === 'agent' ? 'reason' : 'rules',
      line: <>{lineParts}</>,
      chips: m.toolCalls,
      chipsLabel:
        m.toolCalls && m.toolCalls.length > 0
          ? icon === 'done'
            ? 'Intake results'
            : 'Progress so far'
          : undefined,
      reasoning: m.reasoning,
      recommendation: m.actionCard
        ? {
            text: m.actionCard.text,
            approveLabel: m.actionCard.approveLabel,
            secondaryLabel: m.actionCard.secondaryLabel,
          }
        : undefined,
      whyPrompt: m.whyPrompt,
      whyExplanation: m.whyExplanation,
    });
  }

  let lastDoneIdx = -1;
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    if (it.kind === 'stage' && it.state === 'done') {
      lastDoneIdx = i;
      break;
    }
  }
  if (lastDoneIdx >= 0) {
    for (let i = 0; i < lastDoneIdx; i++) {
      const it = items[i];
      if (it.kind === 'row') it.stageCompleted = true;
    }
  }

  return items;
}

export function CaseManagerTab({ data, stage }: CaseManagerTabProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, []);

  const thread = useMemo(
    () => buildCaseManagerThread(stage, data.caseManagerThread),
    [stage, data.caseManagerThread],
  );
  const items = buildTimeline(thread);

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
        <div className="flex flex-col gap-0">
          {items.map((item) =>
            item.kind === 'stage' ? (
              <StageDivider key={item.id} item={item} />
            ) : (
              <Row key={item.id} row={item} />
            ),
          )}
        </div>
      </div>
      <div
        className="flex-shrink-0 px-6 py-3.5"
        style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
      >
        <div
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[12px]"
          style={{ background: 'var(--elevated)', border: '1px solid var(--border)' }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about this case or give instructions..."
            className="flex-1 bg-transparent border-none outline-none text-[13px]"
            style={{ color: 'var(--fg)' }}
          />
          <button
            onClick={() => setDraft('')}
            className="w-7 h-7 rounded-[7px] text-white flex items-center justify-center"
            style={{ background: 'var(--purple)' }}
            aria-label="Send"
          >
            ↑
          </button>
        </div>
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {SUGGESTED_CHIPS.map((c) => (
            <button
              key={c}
              onClick={() => setDraft(c)}
              className="px-3 py-1 rounded-[14px] text-[11px] cursor-pointer"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg3)' }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StageDivider({ item }: { item: StageMarker }) {
  const isDone = item.state === 'done';
  return (
    <div className="flex items-center gap-2 py-2.5 my-1">
      <span
        className="text-[10px] font-bold uppercase tracking-[0.5px] px-2.5 py-0.5 rounded-[10px]"
        style={{
          background: isDone ? 'var(--green-bg)' : 'var(--blue-bg)',
          color: isDone ? 'var(--green)' : 'var(--blue)',
          border: `1px solid ${isDone ? 'rgba(16,185,129,0.25)' : 'var(--blue-bd)'}`,
        }}
      >
        ● {item.label}
      </span>
      <span className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  );
}

function Row({ row }: { row: TimelineRow }) {
  const { toast } = useToast();
  const { sdk } = useAuth();
  const [whyOpen, setWhyOpen] = useState(false);
  const [approveState, setApproveState] = useState<'idle' | 'spinning' | 'done'>('idle');

  const onApprove = async () => {
    if (approveState !== 'idle') return;
    setApproveState('spinning');
    const hideTimer = window.setTimeout(() => setApproveState('done'), 2000);
    try {
      await triggerApproveWebhook(sdk.getToken?.());
      toast('Approved.');
    } catch (err) {
      window.clearTimeout(hideTimer);
      setApproveState('idle');
      toast(err instanceof Error ? `Webhook failed: ${err.message}` : 'Webhook failed');
    }
  };

  const showActionButtons = !row.stageCompleted && approveState !== 'done';

  return (
    <div
      className="grid gap-2.5 py-2 relative"
      style={{
        gridTemplateColumns: '74px 18px minmax(0, 1fr)',
        alignItems: 'flex-start',
      }}
    >
      <div
        className="text-[10px] font-medium pt-0.5 uppercase tracking-[0.2px]"
        style={{ color: 'var(--fg4)' }}
      >
        {row.time}
      </div>
      <RowIcon kind={row.icon} />
      <div className="min-w-0">
        <div className="text-[13px] leading-snug" style={{ color: 'var(--fg)' }}>
          {row.line}
        </div>
        {(row.who || row.mode) && (
          <div className="text-[10px] mt-1 flex items-center gap-1.5" style={{ color: 'var(--fg4)' }}>
            {row.who && (
              <span className="font-semibold" style={{ color: 'var(--fg3)' }}>
                {row.who}
              </span>
            )}
            {row.mode && <ModeTag mode={row.mode} />}
          </div>
        )}
        {row.chips && row.chips.length > 0 && (
          <div
            className="mt-2 px-3 py-2.5 rounded-lg max-w-[560px]"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-[0.4px] mb-1.5"
              style={{ color: 'var(--fg4)' }}
            >
              {row.chipsLabel ?? 'Tool calls'}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {row.chips.map((c) => (
                <Chip key={c.id} call={c} />
              ))}
            </div>
          </div>
        )}
        {row.reasoning && (
          <div
            className="mt-1.5 px-3 py-2 text-[12px] leading-relaxed max-w-[560px] rounded-r-md"
            style={{
              background: 'var(--purple-bg)',
              borderLeft: '2px solid var(--purple)',
              color: 'var(--fg2)',
            }}
          >
            <b style={{ color: 'var(--purple)' }}>Plan:</b>{' '}
            {row.reasoning.replace(/^Plan:\s*/, '')}
          </div>
        )}
        {row.recommendation && (
          <div
            className="mt-2 px-3 py-2.5 max-w-[560px] rounded-lg"
            style={{
              background: 'linear-gradient(135deg, var(--purple-bg), transparent)',
              border: '1px solid var(--purple-bd)',
            }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-[0.4px] mb-1"
              style={{ color: 'var(--purple)' }}
            >
              Recommendation
            </div>
            <div className="text-[12.5px] leading-relaxed" style={{ color: 'var(--fg)' }}>
              {row.recommendation.text}
            </div>
            {showActionButtons && (
              <div className="flex gap-1.5 mt-2">
                <button
                  onClick={onApprove}
                  disabled={approveState === 'spinning'}
                  className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-white disabled:opacity-80 inline-flex items-center gap-1.5"
                  style={{ background: 'var(--green)' }}
                >
                  {approveState === 'spinning' && (
                    <span
                      className="inline-block w-3 h-3 rounded-full border-2 border-white border-t-transparent"
                      style={{ animation: 'lp-spin 0.8s linear infinite' }}
                      aria-hidden
                    />
                  )}
                  {approveState === 'spinning'
                    ? 'Approving…'
                    : row.recommendation.approveLabel ?? 'Approve & advance'}
                </button>
                {row.recommendation.secondaryLabel && (
                  <button
                    onClick={() => toast('Showing analysis')}
                    disabled={approveState === 'spinning'}
                    className="px-2.5 py-1 rounded-md text-[11px] font-semibold disabled:opacity-60"
                    style={{
                      background: 'var(--surface)',
                      color: 'var(--fg2)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {row.recommendation.secondaryLabel}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {row.whyPrompt && row.whyExplanation && (
          <>
            <div
              onClick={() => setWhyOpen((o) => !o)}
              className="text-[10.5px] cursor-pointer mt-1.5 select-none"
              style={{ color: 'var(--purple)' }}
            >
              {whyOpen ? 'Hide' : row.whyPrompt}
            </div>
            {whyOpen && (
              <div
                className="mt-1.5 px-2.5 py-1.5 text-[11.5px] leading-relaxed rounded-md max-w-[560px]"
                style={{
                  background: 'var(--bg)',
                  border: '1px dashed var(--border)',
                  color: 'var(--fg3)',
                }}
              >
                {row.whyExplanation}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function RowIcon({ kind }: { kind: IconKind }) {
  if (kind === 'wait') {
    return (
      <span
        className="w-2.5 h-2.5 rounded-full"
        style={{
          marginTop: 4,
          border: '2px solid var(--amber)',
          background: 'transparent',
          boxShadow: '0 0 0 3px rgba(245,158,11,0.1)',
        }}
      />
    );
  }
  const styles: Record<Exclude<IconKind, 'wait'>, React.CSSProperties> = {
    rules: {
      background: '#F59E0B',
      borderRadius: 3,
      boxShadow: '0 0 0 3px rgba(245,158,11,0.12)',
    },
    done: {
      background: 'var(--green)',
      borderRadius: 3,
      boxShadow: '0 0 0 3px rgba(16,185,129,0.12)',
    },
    decision: {
      background: 'linear-gradient(135deg,#0F9D8F,#5EEAD4)',
      borderRadius: 3,
      transform: 'rotate(45deg) scale(0.78)',
      boxShadow: '0 0 0 3px rgba(15,157,143,0.16)',
    },
    human: {
      background: 'var(--blue)',
      borderRadius: '50%',
      boxShadow: '0 0 0 3px rgba(59,130,246,0.14)',
    },
    think: {
      background: 'linear-gradient(135deg,#5EEAD4,#0F9D8F)',
      borderRadius: '50%',
      boxShadow: '0 0 0 3px rgba(15,157,143,0.2)',
      animation: 'lp-pulse 2s infinite',
    },
  };
  return <span className="w-3.5 h-3.5" style={{ marginTop: 2, ...styles[kind] }} />;
}

function ModeTag({ mode }: { mode: 'rules' | 'reason' | 'human' }) {
  const styles: Record<typeof mode, { bg: string; fg: string; label: string }> = {
    rules: { bg: 'rgba(245,158,11,0.12)', fg: '#D97706', label: 'Rules' },
    reason: { bg: 'var(--purple-bg)', fg: 'var(--purple)', label: 'Reasoning' },
    human: { bg: 'var(--blue-bg)', fg: 'var(--blue)', label: 'You' },
  };
  const s = styles[mode];
  return (
    <span
      className="px-1.5 py-px rounded-sm text-[9px] font-semibold uppercase tracking-[0.3px]"
      style={{ background: s.bg, color: s.fg }}
    >
      {s.label}
    </span>
  );
}

function Chip({ call }: { call: ToolCall }) {
  const iconClass: Record<ToolCall['state'], { bg: string; ch: string }> = {
    done: { bg: 'var(--green)', ch: '✓' },
    run: { bg: 'var(--purple)', ch: '⚡' },
    wait: { bg: 'var(--amber)', ch: '⏳' },
  };
  const ic = iconClass[call.state];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium"
      style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        color: 'var(--fg2)',
      }}
    >
      <span
        className="w-3 h-3 rounded-sm flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
        style={{ background: ic.bg }}
      >
        {ic.ch}
      </span>
      {call.label}
      {call.resultTone === 'success' && call.result && (
        <span
          className="text-[10px] font-bold px-1 rounded-sm"
          style={{ background: 'var(--green-bg)', color: 'var(--green)' }}
        >
          {call.result.length > 30 ? '✓' : call.result}
        </span>
      )}
    </span>
  );
}
