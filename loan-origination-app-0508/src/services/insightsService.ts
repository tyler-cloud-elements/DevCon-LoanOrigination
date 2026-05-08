import {
  Entities,
  EntityAggregateFunction,
  LogicalOperator,
  QueryFilterOperator,
} from '@uipath/uipath-typescript/entities';
import type {
  EntityAggregate,
  EntityQueryFilter,
  EntityRecord,
} from '@uipath/uipath-typescript/entities';
import type { UiPath } from '@uipath/uipath-typescript/core';

const LOAN_ENTITY_ID = import.meta.env.VITE_LOAN_ENTITY_ID ?? '';

const AMOUNT_BUCKETS: { label: string; min: number; max: number | null }[] = [
  { label: '< $200K', min: 0, max: 200_000 },
  { label: '$200K – $400K', min: 200_000, max: 400_000 },
  { label: '$400K – $600K', min: 400_000, max: 600_000 },
  { label: '$600K – $800K', min: 600_000, max: 800_000 },
  { label: '$800K+', min: 800_000, max: null },
];

const HIGH_VALUE_THRESHOLD = 500_000;

export interface CountRow {
  label: string;
  value: number;
  pct: number;
}

export interface AmountBucketRow extends CountRow {
  totalVolume: number;
}

export interface AvgValueRow {
  label: string;
  count: number;
  avg: number;
  total: number;
}

export interface HighValueStats {
  threshold: number;
  count: number;
  totalVolume: number;
  avgAmount: number;
  share: number;
}

// Payload for the Analytics page — drives every chart and KPI in the
// "Powered by DataFabric" section.
export interface AnalyticsData {
  totalApplications: number;
  totalVolume: number;
  avgAmount: number;
  minAmount: number;
  maxAmount: number;
  /** Records where IsClosed = true; drives the Closing Rate KPI. */
  closedCount: number;
  avgByLoanType: AvgValueRow[];
  avgByStatus: AvgValueRow[];
  byLoanType: CountRow[];
  byAmountBucket: AmountBucketRow[];
  highValue: HighValueStats;
  hasData: boolean;
}

const COUNT_AGG: EntityAggregate = {
  function: EntityAggregateFunction.Count,
  field: 'Id',
  alias: 'total',
};

function asNumber(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function asString(v: unknown): string {
  if (typeof v === 'string' && v.trim() !== '') return v.trim();
  return '';
}

function withPct(rows: { label: string; value: number }[]): CountRow[] {
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  return rows
    .filter((r) => r.value > 0)
    .map((r) => ({ ...r, pct: Math.round((r.value / total) * 100) }))
    .sort((a, b) => b.value - a.value);
}

function pickAggValue(row: EntityRecord, alias: string, fallbackKey?: string): number {
  const v = row[alias];
  if (v !== undefined && v !== null) return asNumber(v);
  if (fallbackKey && row[fallbackKey] !== undefined) return asNumber(row[fallbackKey]);
  return 0;
}

async function countWithFilter(
  entities: Entities,
  entityId: string,
  filters: EntityQueryFilter[],
): Promise<number> {
  const resp = await entities.queryRecordsById(entityId, {
    filterGroup: { logicalOperator: LogicalOperator.And, queryFilters: filters },
    aggregates: [COUNT_AGG],
  });
  const items = resp.items ?? [];
  if (items.length === 0) return 0;
  return pickAggValue(items[0], 'total');
}

async function fetchPortfolioStats(
  entities: Entities,
  entityId: string,
): Promise<{
  totalApplications: number;
  totalVolume: number;
  avgAmount: number;
  minAmount: number;
  maxAmount: number;
}> {
  const resp = await entities.queryRecordsById(entityId, {
    aggregates: [
      { function: EntityAggregateFunction.Count, field: 'Id', alias: 'total' },
      { function: EntityAggregateFunction.Sum, field: 'LoanAmount', alias: 'totalVolume' },
      { function: EntityAggregateFunction.Avg, field: 'LoanAmount', alias: 'avgAmount' },
      { function: EntityAggregateFunction.Min, field: 'LoanAmount', alias: 'minAmount' },
      { function: EntityAggregateFunction.Max, field: 'LoanAmount', alias: 'maxAmount' },
    ],
  });
  const row = resp.items?.[0] ?? {};
  return {
    totalApplications: pickAggValue(row, 'total'),
    totalVolume: pickAggValue(row, 'totalVolume', 'LoanAmount'),
    avgAmount: pickAggValue(row, 'avgAmount', 'LoanAmount'),
    minAmount: pickAggValue(row, 'minAmount', 'LoanAmount'),
    maxAmount: pickAggValue(row, 'maxAmount', 'LoanAmount'),
  };
}

async function fetchGroupCounts(
  entities: Entities,
  entityId: string,
  field: string,
): Promise<{ label: string; value: number }[]> {
  const resp = await entities.queryRecordsById(entityId, {
    selectedFields: [field],
    groupBy: [field],
    aggregates: [COUNT_AGG],
  });
  return (resp.items ?? []).map((row) => ({
    label: asString(row[field]) || 'Unspecified',
    value: pickAggValue(row, 'total'),
  }));
}

// groupBy <field> with COUNT(*) + SUM(LoanAmount) + AVG(LoanAmount). Used to
// surface "average loan size by loan type" / "loan volume by application
// status" in a single round trip per slice dimension.
async function fetchAvgGroup(
  entities: Entities,
  entityId: string,
  field: string,
): Promise<AvgValueRow[]> {
  const resp = await entities.queryRecordsById(entityId, {
    selectedFields: [field],
    groupBy: [field],
    aggregates: [
      COUNT_AGG,
      { function: EntityAggregateFunction.Sum, field: 'LoanAmount', alias: 'volume' },
      { function: EntityAggregateFunction.Avg, field: 'LoanAmount', alias: 'avg' },
    ],
  });
  return (resp.items ?? [])
    .map((row) => ({
      label: asString(row[field]) || 'Unspecified',
      count: pickAggValue(row, 'total'),
      total: pickAggValue(row, 'volume', 'LoanAmount'),
      avg: pickAggValue(row, 'avg', 'LoanAmount'),
    }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.total - a.total);
}

async function fetchHighValueStats(
  entities: Entities,
  entityId: string,
  totalApplications: number,
): Promise<HighValueStats> {
  const resp = await entities.queryRecordsById(entityId, {
    filterGroup: {
      logicalOperator: LogicalOperator.And,
      queryFilters: [
        {
          fieldName: 'LoanAmount',
          operator: QueryFilterOperator.GreaterThanOrEqual,
          value: String(HIGH_VALUE_THRESHOLD),
        },
      ],
    },
    aggregates: [
      COUNT_AGG,
      { function: EntityAggregateFunction.Sum, field: 'LoanAmount', alias: 'volume' },
      { function: EntityAggregateFunction.Avg, field: 'LoanAmount', alias: 'avg' },
    ],
  });
  const row = resp.items?.[0] ?? {};
  const count = pickAggValue(row, 'total');
  return {
    threshold: HIGH_VALUE_THRESHOLD,
    count,
    totalVolume: pickAggValue(row, 'volume', 'LoanAmount'),
    avgAmount: pickAggValue(row, 'avg', 'LoanAmount'),
    share: totalApplications > 0 ? Math.round((count / totalApplications) * 100) : 0,
  };
}

async function fetchAmountBuckets(
  entities: Entities,
  entityId: string,
): Promise<AmountBucketRow[]> {
  const reqs = AMOUNT_BUCKETS.map(async (b) => {
    const filters: EntityQueryFilter[] = [
      { fieldName: 'LoanAmount', operator: QueryFilterOperator.GreaterThanOrEqual, value: String(b.min) },
    ];
    if (b.max !== null) {
      filters.push({
        fieldName: 'LoanAmount',
        operator: QueryFilterOperator.LessThan,
        value: String(b.max),
      });
    }
    const resp = await entities.queryRecordsById(entityId, {
      filterGroup: { logicalOperator: LogicalOperator.And, queryFilters: filters },
      aggregates: [
        COUNT_AGG,
        { function: EntityAggregateFunction.Sum, field: 'LoanAmount', alias: 'volume' },
      ],
    });
    const row = resp.items?.[0] ?? {};
    return {
      label: b.label,
      value: pickAggValue(row, 'total'),
      totalVolume: pickAggValue(row, 'volume', 'LoanAmount'),
    };
  });
  const rows = await Promise.all(reqs);
  const totalCount = rows.reduce((s, r) => s + r.value, 0) || 1;
  return rows.map((r) => ({ ...r, pct: Math.round((r.value / totalCount) * 100) }));
}

// Powers the "Powered by DataFabric" section on the Analytics page. ~7
// parallel queries — every chart on the page derives from this one fetch.
export async function fetchAnalyticsData(sdk: UiPath): Promise<AnalyticsData> {
  if (!LOAN_ENTITY_ID) {
    throw new Error('VITE_LOAN_ENTITY_ID is not configured');
  }
  const entities = new Entities(sdk);

  // Portfolio totals first — high-value share uses totalApplications as denom.
  const portfolio = await fetchPortfolioStats(entities, LOAN_ENTITY_ID);

  const [closedCount, avgByLoanType, avgByStatus, byLoanTypeRaw, byAmountBucket, highValue] =
    await Promise.all([
      countWithFilter(entities, LOAN_ENTITY_ID, [
        { fieldName: 'IsClosed', operator: QueryFilterOperator.Equals, value: 'true' },
      ]),
      fetchAvgGroup(entities, LOAN_ENTITY_ID, 'LoanType'),
      fetchAvgGroup(entities, LOAN_ENTITY_ID, 'ApplicationStatus'),
      fetchGroupCounts(entities, LOAN_ENTITY_ID, 'LoanType'),
      fetchAmountBuckets(entities, LOAN_ENTITY_ID),
      fetchHighValueStats(entities, LOAN_ENTITY_ID, portfolio.totalApplications),
    ]);

  return {
    totalApplications: portfolio.totalApplications,
    totalVolume: portfolio.totalVolume,
    avgAmount: portfolio.avgAmount,
    minAmount: portfolio.minAmount,
    maxAmount: portfolio.maxAmount,
    closedCount,
    avgByLoanType,
    avgByStatus,
    byLoanType: withPct(byLoanTypeRaw),
    byAmountBucket,
    highValue,
    hasData: portfolio.totalApplications > 0,
  };
}
