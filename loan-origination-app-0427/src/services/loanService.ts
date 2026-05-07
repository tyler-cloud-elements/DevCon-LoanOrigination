import { CaseInstances } from '@uipath/uipath-typescript/cases';
import type { CaseGetStageResponse, CaseInstanceGetResponse } from '@uipath/uipath-typescript/cases';
import { Entities } from '@uipath/uipath-typescript/entities';
import type { EntityInsertResponse } from '@uipath/uipath-typescript/entities';
import type { UiPath } from '@uipath/uipath-typescript/core';
import { UiPathError } from '@uipath/uipath-typescript/core';
import type { LoanCase, LoanStage } from '../types/loan';

const CASE_ID = import.meta.env.VITE_CASE_ID ?? '';
const APPROVE_WEBHOOK_URL = import.meta.env.VITE_APPROVE_WEBHOOK_URL ?? '';
const LOAN_ENTITY_ID = import.meta.env.VITE_LOAN_ENTITY_ID ?? '';

function hashSeed(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

const STAGES: LoanStage[] = ['Intake', 'Processing', 'Underwriting', 'QA/QC', 'Closing', 'Post Closing'];
const BORROWER_POOL = [
  'Priya Sharma',
  'Marcus Johnson',
  'Wei Zhang',
  'James Chen',
  'Angela Brooks',
  'Elena Rodriguez',
  'David Kim',
  'Isabella Moreno',
  'Jordan Blake',
  'Amara Okafor',
];
const LOAN_TYPE_POOL = ['Conv. 30yr Fixed', 'FHA 30yr', 'VA 30yr', 'Jumbo 30yr', 'Conv. 15yr Fixed'];

function mapInstanceToLoan(instance: CaseInstanceGetResponse): LoanCase {
  const seed = hashSeed(instance.instanceId);
  const borrowerName = instance.instanceDisplayName?.trim() || BORROWER_POOL[seed % BORROWER_POOL.length];
  const amount = 200000 + (seed % 600) * 1000;
  const loanType = LOAN_TYPE_POOL[seed % LOAN_TYPE_POOL.length];
  const runStatus = instance.latestRunStatus || 'Running';
  let stage: LoanStage;
  let status: LoanCase['status'];
  let slaState: LoanCase['slaState'];
  let agentIndicator: string;

  const runStatusLower = runStatus.toLowerCase();

  if (runStatusLower === 'completed' || runStatusLower === 'success' || runStatusLower === 'successful') {
    stage = 'Post Closing';
    status = 'Completed';
    slaState = 'On Track';
    agentIndicator = 'Complete';
  } else if (runStatusLower === 'faulted' || runStatusLower === 'cancelled' || runStatusLower === 'canceled') {
    stage = STAGES[(seed % 4) + 1];
    status = 'At Risk';
    slaState = 'At Risk';
    agentIndicator = 'Escalation';
  } else {
    stage = STAGES[(seed % 5) + 1];
    const variant = seed % 5;
    status = variant < 3 ? 'Active' : 'On Track';
    slaState = variant === 0 ? '48h' : variant === 1 ? 'At Risk' : 'On Track';
    agentIndicator =
      variant === 0
        ? 'Rate lock'
        : variant === 1
          ? 'DTI'
          : variant === 2
            ? 'Review'
            : variant === 3
              ? 'Compliance'
              : 'Handled';
  }

  return {
    caseInstanceId: instance.instanceId,
    folderKey: instance.folderKey,
    caseId: `LA-${new Date(instance.startedTime).getFullYear()}-${instance.instanceId.slice(0, 5).toUpperCase()}`,
    borrowerName,
    amount,
    loanType,
    stage,
    status,
    slaState,
    agentIndicator,
    lastUpdated: instance.completedTime || instance.startedTime || new Date().toISOString(),
    runStatus,
    isReal: true,
    startedTime: instance.startedTime,
    completedTime: instance.completedTime,
  };
}

export async function fetchLoanCases(sdk: UiPath): Promise<{ cases: LoanCase[]; usedFallback: boolean }> {
  try {
    const caseInstances = new CaseInstances(sdk);
    const result = await caseInstances.getAll({ processKey: CASE_ID, pageSize: 50 });
    const cases = result.items.map(mapInstanceToLoan);
    return { cases, usedFallback: false };
  } catch (err) {
    if (err instanceof UiPathError) {
      console.warn('Falling back to mock loans:', err.message);
    } else {
      console.warn('Falling back to mock loans:', err);
    }
    return { cases: [], usedFallback: true };
  }
}

export async function fetchLoanCaseById(
  sdk: UiPath,
  caseInstanceId: string,
  folderKey: string,
): Promise<LoanCase | null> {
  try {
    const caseInstances = new CaseInstances(sdk);
    const instance = await caseInstances.getById(caseInstanceId, folderKey);
    return mapInstanceToLoan(instance);
  } catch (err) {
    console.warn('fetchLoanCaseById failed', err);
    return null;
  }
}

// Resolves folderKey via PIMS when the URL doesn't carry it. Each instance
// in the getAll response carries its own folderKey at instances[i].folderKey,
// so we look it up by matching instanceId.
export async function fetchFolderKeyByInstanceId(
  sdk: UiPath,
  caseInstanceId: string,
): Promise<string | null> {
  try {
    const caseInstances = new CaseInstances(sdk);
    const result = await caseInstances.getAll({ processKey: CASE_ID, pageSize: 100 });
    const match = result.items.find((i) => i.instanceId === caseInstanceId);
    return match?.folderKey ?? null;
  } catch (err) {
    console.warn('fetchFolderKeyByInstanceId failed', err);
    return null;
  }
}

export async function fetchCaseStages(
  sdk: UiPath,
  caseInstanceId: string,
  folderKey: string,
): Promise<CaseGetStageResponse[] | null> {
  try {
    const caseInstances = new CaseInstances(sdk);
    const stages = await caseInstances.getStages(caseInstanceId, folderKey);
    if (import.meta.env.DEV) {
      console.debug(
        '[stages]',
        stages.map((s) => ({
          name: s.name,
          status: s.status,
          tasks: (s.tasks ?? []).flat().map((t) => ({ name: t?.name, status: t?.status })),
        })),
      );
    }
    return stages;
  } catch (err) {
    console.warn('fetchCaseStages failed', err);
    return null;
  }
}

function matchLoanStage(name: string): LoanStage | null {
  const n = name.toLowerCase().replace(/[\s_/-]+/g, '');
  if (n.includes('postclos')) return 'Post Closing';
  if (n.includes('intake')) return 'Intake';
  if (n.includes('process')) return 'Processing';
  if (n.includes('underwrit') || n === 'uw') return 'Underwriting';
  if (n.includes('qa') || n.includes('qc') || n.includes('quality')) return 'QA/QC';
  if (n.includes('clos')) return 'Closing';
  return null;
}

function normalizeStatus(status: string | undefined): string {
  return (status ?? '').toLowerCase().replace(/[^a-z]/g, '');
}

const IN_PROGRESS_STATUSES = new Set([
  'running',
  'inprogress',
  'active',
  'started',
  'starting',
  'paused',
  'waiting',
  'pending',
  'inreview',
]);

const COMPLETED_STATUSES = new Set([
  'completed',
  'complete',
  'done',
  'success',
  'successful',
  'succeeded',
  'finished',
]);

type StageState = 'notstarted' | 'inprogress' | 'completed';

function classifyStage(stage: CaseGetStageResponse): StageState {
  const stageStatus = normalizeStatus(stage.status);
  if (COMPLETED_STATUSES.has(stageStatus)) return 'completed';
  if (IN_PROGRESS_STATUSES.has(stageStatus)) return 'inprogress';

  const tasks = (stage.tasks ?? []).flat().filter(Boolean);
  if (tasks.length === 0) return 'notstarted';

  const statuses = tasks.map((t) => normalizeStatus(t?.status));
  const allCompleted = statuses.every((s) => COMPLETED_STATUSES.has(s));
  if (allCompleted) return 'completed';

  const anyStartedOrRunning = statuses.some(
    (s) => IN_PROGRESS_STATUSES.has(s) || COMPLETED_STATUSES.has(s),
  );
  if (anyStartedOrRunning) return 'inprogress';

  return 'notstarted';
}

export function deriveCurrentStage(stages: CaseGetStageResponse[] | null | undefined): LoanStage | null {
  if (!stages || stages.length === 0) return null;

  const mapped = stages
    .map((s) => ({
      stage: matchLoanStage(s.name),
      state: classifyStage(s),
    }))
    .filter((m): m is { stage: LoanStage; state: StageState } => m.stage !== null);

  if (mapped.length === 0) return null;

  // Pick the furthest-progressed stage with activity. Ad-hoc tasks defined in
  // the case JSON but never triggered stay "Not Started", so multiple earlier
  // stages can look in-progress simultaneously — the latest one is current.
  let lastInProgressIdx = -1;
  let lastCompletedIdx = -1;
  mapped.forEach((m, i) => {
    if (m.state === 'inprogress') lastInProgressIdx = i;
    if (m.state === 'completed') lastCompletedIdx = i;
  });

  if (lastInProgressIdx >= 0) return mapped[lastInProgressIdx].stage;

  if (lastCompletedIdx >= 0) {
    if (lastCompletedIdx + 1 < mapped.length) return mapped[lastCompletedIdx + 1].stage;
    return mapped[lastCompletedIdx].stage;
  }

  return mapped[0].stage;
}

export interface NewLoanApplicationInput {
  loanType: string;
  loanAmount: number;
  applicantId: string;
}

// Creates a new LoanOriginationEntity row in DataFabric. Mirrors the curl
// example in AGENTS.md — null-fills all of the per-stage boolean flags so
// the case process picks the row up in its initial state.
export async function createLoanApplication(
  sdk: UiPath,
  input: NewLoanApplicationInput,
): Promise<EntityInsertResponse> {
  if (!LOAN_ENTITY_ID) {
    throw new Error('VITE_LOAN_ENTITY_ID is not configured');
  }
  const entities = new Entities(sdk);
  const data: Record<string, unknown> = {
    LoanType: input.loanType,
    LoanAmount: input.loanAmount,
    ApplicationStatus: 'New',
    IsClosed: null,
    IsEscalated: null,
    IsRejected: null,
    IsWithdrawn: null,
    DocumentsRequested: null,
    EligibilityScreeningComplete: null,
    IntakeReviewComplete: null,
    ExtractDocsComplete: null,
    LoanPackageReviewComplete: null,
    UnderwritingReviewComplete: null,
    ComplianceComplete: null,
    FullAuditComplete: null,
    QCComplete: null,
    CDLEComparisonComplete: null,
    FundingComplete: null,
    InvestorDeliveryComplete: null,
    Applicant: { Id: input.applicantId },
    UnderwritingJobs: null,
    DisclosureDelivered: null,
    AppraisalComplete: null,
    DisclosureAcknowledged: null,
    RiskAssessmentComplete: null,
  };
  return entities.insertRecordById(LOAN_ENTITY_ID, data);
}

export async function triggerApproveWebhook(accessToken?: string): Promise<void> {
  if (!APPROVE_WEBHOOK_URL) {
    throw new Error('VITE_APPROVE_WEBHOOK_URL is not configured');
  }
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  const res = await fetch(APPROVE_WEBHOOK_URL, { method: 'GET', headers });
  if (!res.ok) {
    throw new Error(`Webhook returned ${res.status} ${res.statusText}`);
  }
}
