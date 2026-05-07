import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { createLoanApplication } from '../../services/loanService';

const LOAN_TYPES = ['Home', 'Conventional', 'FHA', 'VA', 'Jumbo', 'Refinance'];

// Static applicant ID for now — taken from the demo curl payload. Will be
// replaced with a real applicant lookup later.
const STATIC_APPLICANT_ID = 'b2a132a0-fb3d-f111-8ef3-00224886d158';

interface NewLoanModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function NewLoanModal({ open, onClose, onCreated }: NewLoanModalProps) {
  const { sdk } = useAuth();
  const { toast } = useToast();
  const [loanType, setLoanType] = useState('Home');
  const [loanAmount, setLoanAmount] = useState('500000');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, submitting, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const amount = Number(loanAmount);
    if (!Number.isFinite(amount) || amount < 0) {
      toast('Loan amount must be 0 or greater');
      return;
    }
    setSubmitting(true);
    try {
      await createLoanApplication(sdk, {
        loanType,
        loanAmount: amount,
        applicantId: STATIC_APPLICANT_ID,
      });
      toast(`Created ${loanType} loan application`);
      setLoanAmount('500000');
      setLoanType('Home');
      onCreated?.();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create loan application';
      toast(`Error: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        onClick={() => !submitting && onClose()}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.4)' }}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[420px] max-w-[92vw] rounded-2xl"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <div className="text-[14px] font-bold" style={{ color: 'var(--fg)' }}>
              New loan application
            </div>
            <div className="text-[11px] mt-px" style={{ color: 'var(--fg3)' }}>
              Creates a row in LoanOriginationEntity
            </div>
          </div>
          <button
            onClick={() => !submitting && onClose()}
            className="w-7 h-7 rounded-[7px] flex items-center justify-center"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--fg3)',
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <Field label="Loan type">
                <select
                  autoFocus
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-md text-[13px] outline-none"
                  style={{
                    background: 'var(--elevated)',
                    color: 'var(--fg)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {LOAN_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="flex-1">
              <Field label="Loan amount ($)" required>
                <input
                  type="number"
                  min="0"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-md text-[13px] outline-none"
                  style={{
                    background: 'var(--elevated)',
                    color: 'var(--fg)',
                    border: '1px solid var(--border)',
                  }}
                />
              </Field>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3.5 py-2 rounded-md text-[12px] font-semibold disabled:opacity-50"
              style={{
                background: 'var(--surface)',
                color: 'var(--fg2)',
                border: '1px solid var(--border)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-2 rounded-md text-[12px] font-semibold text-white disabled:opacity-60"
              style={{ background: 'var(--purple)', border: '1px solid var(--purple)' }}
            >
              {submitting ? 'Creating…' : 'Create application'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold" style={{ color: 'var(--fg3)' }}>
        {label}
        {required && <span style={{ color: 'var(--red)' }}> *</span>}
      </span>
      {children}
    </label>
  );
}
