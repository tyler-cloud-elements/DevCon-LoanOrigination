import { useAuth } from '../hooks/useAuth';

export function LoginScreen() {
  const { login, isLoading, error } = useAuth();

  return (
    <div
      className="h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="w-full max-w-md rounded-[14px] p-8"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="hero-logo w-11 h-11 rounded-[12px] flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#0E2A47,#1E4480)' }}
          />
          <div>
            <div className="text-lg font-bold" style={{ color: 'var(--fg)' }}>
              Accrual Bank
            </div>
            <div className="text-xs" style={{ color: 'var(--fg3)' }}>
              It all adds up · Loan origination workspace
            </div>
          </div>
        </div>

        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--fg2)' }}>
          Sign in with UiPath to access your loan pipeline, case manager agent, and pending reviews.
        </p>

        <button
          onClick={login}
          disabled={isLoading}
          className="w-full py-3 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#0E2A47,#1E4480)' }}
        >
          {isLoading ? 'Signing in…' : 'Sign in with UiPath'}
        </button>

        {error && (
          <div
            className="mt-4 px-3 py-2 rounded-lg text-xs"
            style={{
              background: 'var(--red-bg)',
              color: 'var(--red)',
              border: '1px solid rgba(220,38,38,0.2)',
            }}
          >
            {error}
          </div>
        )}

        <div className="mt-6 pt-4 text-[11px]" style={{ color: 'var(--fg4)', borderTop: '1px solid var(--border)' }}>
          Connected to <span className="mono">staging.uipath.com</span> · org{' '}
          <span className="mono">fusionmaestrodemo</span>
        </div>
      </div>
    </div>
  );
}
