import { Card, CardHeader } from '../ui/Card';
import type { LoanDetailData } from '../../types/loan';

interface CommentsTabProps {
  data: LoanDetailData;
}

export function CommentsTab({ data }: CommentsTabProps) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <Card>
        <CardHeader>
          <span>Comments</span>
        </CardHeader>
        <div className="p-4">
          {data.comments.map((c) => (
            <div key={c.id} className="flex gap-2.5 mb-3.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-semibold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#1E4480,#0F9D8F)' }}
              >
                {c.initials}
              </div>
              <div>
                <div className="text-xs" style={{ color: 'var(--fg)' }}>
                  <b>{c.author}</b>
                  <span className="text-[10px] ml-1" style={{ color: 'var(--fg4)' }}>
                    {c.time}
                  </span>
                </div>
                <div className="text-[13px] leading-relaxed mt-1" style={{ color: 'var(--fg2)' }}>
                  {c.body}
                </div>
              </div>
            </div>
          ))}
          <input
            placeholder="Add a comment..."
            className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none"
            style={{
              background: 'var(--elevated)',
              border: '1px solid var(--border)',
              color: 'var(--fg)',
            }}
          />
        </div>
      </Card>
    </div>
  );
}
