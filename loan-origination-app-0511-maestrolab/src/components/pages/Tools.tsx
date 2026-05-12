import { Header } from '../layout/Header';
import { Card } from '../ui/Card';

const TOOLS = [
  { icon: '🗒', title: 'Loan Calculator', detail: 'Payment, DTI, LTV calculations' },
  { icon: '🔍', title: 'Borrower Lookup', detail: 'Search by name, SSN, or case ID' },
  { icon: '📄', title: 'Document Templates', detail: 'Pre-approval, denial, condition letters' },
  { icon: '📈', title: 'Rate Checker', detail: 'Current rates & lock options' },
  { icon: '👤', title: 'Contact Directory', detail: 'Title cos, appraisers, attorneys' },
  { icon: '⚙', title: 'Settings', detail: 'Preferences, notifications, defaults' },
];

export function Tools() {
  return (
    <>
      <Header title="Tools" subtitle="Quick access to lending tools" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TOOLS.map((t) => (
            <Card key={t.title} className="cursor-pointer transition-all hover:-translate-y-px">
              <div className="p-6 text-center">
                <div className="text-[28px] mb-2">{t.icon}</div>
                <div className="text-[13px] font-semibold mb-1" style={{ color: 'var(--fg)' }}>
                  {t.title}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--fg4)' }}>
                  {t.detail}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
