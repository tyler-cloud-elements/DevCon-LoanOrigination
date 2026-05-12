import { Card, CardHeader } from '../ui/Card';
import type { LoanDetailData } from '../../types/loan';

interface DetailsTabProps {
  data: LoanDetailData;
}

export function DetailsTab({ data }: DetailsTabProps) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <MetricCard
          label="Credit Score"
          value={String(data.metrics.creditScore)}
          valueColor="var(--green)"
          pct={Math.min(100, (data.metrics.creditScore / 850) * 100)}
          barColor="var(--green)"
          range="Min 620 · Excellent 740+"
        />
        <MetricCard
          label="DTI Ratio"
          value={`${data.metrics.dti}%`}
          valueColor="var(--green)"
          pct={(data.metrics.dti / 43) * 100}
          barColor="var(--green)"
          range="Max 43% · Ideal <36%"
        />
        <MetricCard
          label="LTV"
          value={`${data.metrics.ltv}%`}
          valueColor="var(--amber)"
          pct={data.metrics.ltv}
          barColor="var(--amber)"
          range="PMI required >80%"
        />
        <MetricCard
          label="Down Payment"
          value={data.metrics.downPayment}
          pct={15}
          barColor="var(--blue)"
          range="15% of $500K"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card>
          <CardHeader>
            <span>Applicant</span>
          </CardHeader>
          <div className="p-4">
            <DR l="Name" v={data.borrower.fullName} />
            <DR l="Email" v={data.borrower.email} />
            <DR l="Phone" v={data.borrower.phone} />
            <DR l="SSN" v={data.borrower.ssnMasked} />
            <DR l="DOB" v={data.borrower.dob} />
            <DR l="Address" v={data.borrower.address} />
            <DR l="Citizenship" v={data.borrower.citizenship} />
          </div>
        </Card>
        <Card>
          <CardHeader>
            <span>Employment</span>
          </CardHeader>
          <div className="p-4">
            <DR l="Employer" v={data.employment.employer} />
            <DR l="Title" v={data.employment.title} />
            <DR l="Start" v={data.employment.startDate} />
            <DR l="Income" v={data.employment.income} />
            <DR l="Type" v={data.employment.type} />
            <DR l="Previous" v={data.employment.previous} />
          </div>
        </Card>
        <Card>
          <CardHeader>
            <span>Property</span>
          </CardHeader>
          <div className="p-4">
            <DR l="Address" v={data.property.address} />
            <DR l="Type" v={data.property.type} />
            <DR l="Year Built" v={data.property.yearBuilt} />
            <DR l="Size" v={data.property.size} />
            <DR l="Bed/Bath" v={data.property.bedBath} />
            <DR l="Purchase Price" v={data.property.purchasePrice} />
            <DR l="Appraised" v={data.property.appraised} />
          </div>
        </Card>
        <Card>
          <CardHeader>
            <span>Loan Terms</span>
          </CardHeader>
          <div className="p-4">
            <DR l="Type" v={data.loanTerms.type} />
            <DR l="Amount" v={data.loanTerms.amount} />
            <DR l="Rate" v={data.loanTerms.rate} />
            <DR l="Monthly" v={data.loanTerms.monthly} />
            <DR l="PMI" v={data.loanTerms.pmi} valueColor="var(--amber)" />
            <DR l="Rate Lock" v={data.loanTerms.rateLock} />
            <DR l="Closing Costs" v={data.loanTerms.closingCosts} />
          </div>
        </Card>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  valueColor?: string;
  pct: number;
  barColor: string;
  range: string;
}

function MetricCard({ label, value, valueColor, pct, barColor, range }: MetricCardProps) {
  return (
    <div
      className="p-3.5 rounded-[10px]"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="text-[10px] mb-1" style={{ color: 'var(--fg3)' }}>
        {label}
      </div>
      <div className="text-xl font-bold mb-1.5" style={{ color: valueColor ?? 'var(--fg)' }}>
        {value}
      </div>
      <div className="h-1 rounded" style={{ background: 'var(--border)' }}>
        <div className="h-full rounded" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <div className="text-[9px] mt-1" style={{ color: 'var(--fg4)' }}>
        {range}
      </div>
    </div>
  );
}

function DR({ l, v, valueColor }: { l: string; v: React.ReactNode; valueColor?: string }) {
  return (
    <div className="flex justify-between py-2 text-[13px]" style={{ borderBottom: '1px solid var(--border)' }}>
      <span style={{ color: 'var(--fg3)' }}>{l}</span>
      <span className="font-medium text-right" style={{ color: valueColor ?? 'var(--fg2)' }}>
        {v}
      </span>
    </div>
  );
}
