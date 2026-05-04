import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { ToastProvider } from './hooks/useToast';
import { LoanCasesProvider } from './hooks/useLoanCases';
import { AssistantProvider } from './hooks/useAssistant';
import { AssistantPanel } from './components/assistant/AssistantPanel';
import type { UiPathSDKConfig } from '@uipath/uipath-typescript/core';
import { AppShell } from './components/layout/AppShell';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/pages/Dashboard';
import { AllCases } from './components/pages/AllCases';
import { NeedsInput } from './components/pages/NeedsInput';
import { Analytics } from './components/pages/Analytics';
import { KnowledgeBase } from './components/pages/KnowledgeBase';
import { Tools } from './components/pages/Tools';
import { LoanDetail } from './components/pages/LoanDetail';
import { SLARisk } from './components/pages/SLARisk';
import { AgentHandled } from './components/pages/AgentHandled';
import { MyTasks } from './components/pages/MyTasks';

const authConfig: UiPathSDKConfig = {
  clientId: import.meta.env.VITE_UIPATH_CLIENT_ID,
  orgName: import.meta.env.VITE_UIPATH_ORG_NAME,
  tenantName: import.meta.env.VITE_UIPATH_TENANT_NAME,
  baseUrl: import.meta.env.VITE_UIPATH_BASE_URL,
  redirectUri: window.location.origin + window.location.pathname,
  scope: import.meta.env.VITE_UIPATH_SCOPES,
};

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        className="h-screen flex items-center justify-center text-sm"
        style={{ background: 'var(--bg)', color: 'var(--fg3)' }}
      >
        Initializing UiPath SDK…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <LoanCasesProvider>
      <AssistantProvider>
        <AppShell>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/cases" element={<AllCases />} />
            <Route path="/queue" element={<NeedsInput />} />
            <Route path="/sla-risk" element={<SLARisk />} />
            <Route path="/agent-handled" element={<AgentHandled />} />
            <Route path="/my-tasks" element={<MyTasks />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/kb" element={<KnowledgeBase />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/loans/:caseInstanceId" element={<LoanDetail />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppShell>
        <AssistantPanel />
      </AssistantProvider>
    </LoanCasesProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider config={authConfig}>
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
