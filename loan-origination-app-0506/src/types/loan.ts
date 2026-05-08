export type LoanStage = 'Intake' | 'Processing' | 'Underwriting' | 'QA/QC' | 'Closing' | 'Post Closing';

export const LOAN_STAGES: LoanStage[] = [
  'Intake',
  'Processing',
  'Underwriting',
  'QA/QC',
  'Closing',
  'Post Closing',
];

export type CasePill = 'blue' | 'green' | 'amber' | 'purple' | 'red';

export interface LoanCase {
  caseInstanceId: string;
  folderKey: string;
  caseId: string;
  borrowerName: string;
  amount: number;
  loanType: string;
  stage: LoanStage;
  status: 'Active' | 'On Track' | 'At Risk' | 'Completed';
  slaState: 'On Track' | 'At Risk' | '48h' | 'Breached';
  agentIndicator: string;
  lastUpdated: string;
  runStatus?: string;
  isReal: boolean;
  startedTime?: string;
  completedTime?: string | null;
}

export interface LoanDetailData {
  caseInstanceId: string;
  caseId: string;
  borrower: Borrower;
  employment: Employment;
  property: Property;
  loanTerms: LoanTerms;
  metrics: LoanMetrics;
  stage: LoanStage;
  tasks: LoanTask[];
  documents: LoanDocument[];
  timeline: TimelineEvent[];
  comments: Comment[];
  caseManagerThread: CaseManagerMessage[];
}

export interface Borrower {
  fullName: string;
  initials: string;
  email: string;
  phone: string;
  ssnMasked: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  income: string;
  employmentYears: string;
  firstTime: boolean;
  citizenship: string;
}

export interface Employment {
  employer: string;
  title: string;
  startDate: string;
  income: string;
  type: string;
  previous: string;
}

export interface Property {
  address: string;
  type: string;
  yearBuilt: string;
  size: string;
  bedBath: string;
  purchasePrice: string;
  appraised: string;
}

export interface LoanTerms {
  type: string;
  amount: string;
  rate: string;
  monthly: string;
  pmi: string;
  rateLock: string;
  closingCosts: string;
}

export interface LoanMetrics {
  creditScore: number;
  dti: number;
  ltv: number;
  downPayment: string;
}

export interface LoanTask {
  id: string;
  title: string;
  due: string;
  assignedTo: string;
  state: 'needs-action' | 'adhoc' | 'completed';
  completedDate?: string;
  completedBy?: 'Agent' | 'Human';
  borderAccent?: 'blue' | 'purple';
  note?: string;
}

export interface LoanDocument {
  id: string;
  title: string;
  meta: string;
  status: 'Validated' | 'Extracted' | 'Pulled' | 'Delivered' | 'Noted';
  statusPill: CasePill;
  iconColor: CasePill | 'red';
}

export interface TimelineEvent {
  id: string;
  title: string;
  time: string;
  detail: string;
  dot: 'purple' | 'green' | 'blue' | 'amber';
}

export interface Comment {
  id: string;
  author: string;
  initials: string;
  time: string;
  body: string;
}

export type CaseManagerMode = 'rules' | 'agent' | null;

export interface CaseManagerMessage {
  id: string;
  kind: 'agent' | 'human' | 'stage-transition';
  time?: string;
  mode?: CaseManagerMode;
  actor?: string; // 'Case Manager' | human name
  initials?: string;
  transition?: {
    label: string;
    state: 'enter' | 'done';
  };
  body?: string; // html fragment rendered via structured pieces
  paragraphs?: (string | { bold: string; text?: string })[];
  toolCalls?: ToolCall[];
  reasoning?: string;
  actionCard?: {
    label: string;
    text: string;
    approveLabel?: string;
    secondaryLabel?: string;
    onApproveToast?: string;
  };
  whyPrompt?: string;
  whyExplanation?: string;
  thinking?: boolean;
  cursor?: boolean;
}

export interface ToolCall {
  id: string;
  label: string;
  state: 'done' | 'run' | 'wait';
  result: string;
  resultTone?: 'success' | 'neutral' | 'amber';
}
