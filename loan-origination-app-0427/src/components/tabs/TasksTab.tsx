import { useState } from 'react';
import { Button } from '../ui/Button';
import { useToast } from '../../hooks/useToast';
import type { LoanDetailData, LoanTask } from '../../types/loan';

interface TasksTabProps {
  data: LoanDetailData;
}

export function TasksTab({ data }: TasksTabProps) {
  const { toast } = useToast();
  const [showAdhoc, setShowAdhoc] = useState(false);

  const needing = data.tasks.filter((t) => t.state === 'needs-action');
  const adhoc = data.tasks.filter((t) => t.state === 'adhoc');
  const completed = data.tasks.filter((t) => t.state === 'completed');

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <Button className="mb-2" onClick={() => setShowAdhoc((s) => !s)}>
        + Add Task
      </Button>

      {showAdhoc && (
        <div
          className="rounded-[10px] p-3.5 mb-2.5"
          style={{
            background: 'var(--elevated)',
            border: '2px dashed var(--purple-bd)',
          }}
        >
          <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--purple)' }}>
            New Task
          </div>
          <input
            placeholder="What needs to be done?"
            className="w-full px-2.5 py-1.5 rounded-[7px] text-xs mb-1.5 outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg)' }}
          />
          <div className="flex gap-1.5">
            <select
              className="flex-1 px-2.5 py-1.5 rounded-[7px] text-xs cursor-pointer outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg)' }}
            >
              <option>Assign: Borrower</option>
              <option>Assign: Self</option>
            </select>
            <select
              className="flex-1 px-2.5 py-1.5 rounded-[7px] text-xs cursor-pointer outline-none"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg)' }}
            >
              <option>Due: 5 days</option>
              <option>Due: 3 days</option>
            </select>
          </div>
          <div className="flex gap-1.5 justify-end mt-1.5">
            <Button onClick={() => setShowAdhoc(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowAdhoc(false);
                toast('Created.');
              }}
            >
              Create
            </Button>
          </div>
        </div>
      )}

      <TaskGroup label="Needs Action" tone="amber" count={needing.length} tasks={needing} />
      <TaskGroup label="Ad-hoc" tone="purple" count={adhoc.length} tasks={adhoc} />
      <TaskGroup label="Completed" tone="green" count={completed.length} tasks={completed} />
    </div>
  );
}

function TaskGroup({
  label,
  tone,
  count,
  tasks,
}: {
  label: string;
  tone: 'amber' | 'purple' | 'green';
  count: number;
  tasks: LoanTask[];
}) {
  const toneStyles: Record<typeof tone, { bg: string; fg: string }> = {
    amber: { bg: 'var(--amber-bg)', fg: 'var(--amber)' },
    purple: { bg: 'var(--purple-bg)', fg: 'var(--purple)' },
    green: { bg: 'var(--green-bg)', fg: 'var(--green)' },
  };
  const s = toneStyles[tone];

  return (
    <>
      <div
        className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.5px] mt-4 mb-2"
        style={{ color: 'var(--fg4)' }}
      >
        {label}
        <span
          className="text-[9px] font-semibold px-1.5 py-0 rounded-[8px]"
          style={{ background: s.bg, color: s.fg }}
        >
          {count}
        </span>
      </div>
      {tasks.map((t) => (
        <TaskItem key={t.id} task={t} />
      ))}
    </>
  );
}

function TaskItem({ task }: { task: LoanTask }) {
  const borderColor = task.borderAccent === 'blue' ? 'var(--blue)' : task.borderAccent === 'purple' ? 'var(--purple)' : 'transparent';
  return (
    <div
      className="rounded-lg px-3.5 py-3 mb-1.5"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: task.borderAccent ? `3px solid ${borderColor}` : '1px solid var(--border)',
        opacity: task.state === 'completed' ? 0.45 : 1,
      }}
    >
      <div className="text-[13px] font-semibold" style={{ color: 'var(--fg)' }}>
        {task.title}
      </div>
      <div className="text-[11px] flex gap-2.5 mt-0.5" style={{ color: 'var(--fg4)' }}>
        <span>{task.state === 'completed' ? task.due : `Due: ${task.due}`}</span>
        <span>{task.assignedTo}</span>
        {task.note && <span style={{ color: 'var(--amber)' }}>{task.note}</span>}
        {task.state === 'completed' && (
          <span style={{ color: 'var(--green)' }}>✓ {task.completedBy ?? 'Done'}</span>
        )}
      </div>
    </div>
  );
}
