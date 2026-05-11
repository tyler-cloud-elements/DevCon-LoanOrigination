// Shared chart primitives used by Insights and Analytics. Heavy widgets that
// only one page renders (StageFunnel, SchemaCard, DataSourceStrip, ApiBadge)
// stay co-located with their owning page.
import { useState } from 'react';
import type {
  AvgValueRow,
  CountRow,
  HighValueStats,
} from '../../services/insightsService';
import dataFabricIcon from '../../assets/datafabric.png';

const PALETTE = [
  'var(--blue)',
  'var(--purple)',
  'var(--green)',
  'var(--amber)',
  'var(--red)',
  'var(--blue)',
  'var(--purple)',
  'var(--green)',
];

export function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${Math.round(n)}`;
}

// Avg-by-X chart with a metric prop:
//   - 'avg':    bar shows AVG, secondary text is "count · total volume"
//   - 'volume': bar shows SUM, secondary text is "count loans"
export function AvgByGroup({
  rows,
  metric = 'avg',
}: {
  rows: AvgValueRow[];
  metric?: 'avg' | 'volume';
}) {
  const valueOf = (r: AvgValueRow) => (metric === 'avg' ? r.avg : r.total);
  const max = Math.max(1, ...rows.map(valueOf));
  return (
    <div>
      {rows.map((r, i) => {
        const widthPct = Math.max(2, Math.round((valueOf(r) / max) * 100));
        return (
          <div key={r.label} className="flex items-center gap-2 mb-1.5">
            <div
              className="text-[11px] w-[110px] flex-shrink-0 truncate"
              style={{ color: 'var(--fg4)' }}
              title={r.label}
            >
              {r.label}
            </div>
            <div
              className="flex-1 h-3 rounded overflow-hidden"
              style={{ background: 'var(--elevated)' }}
            >
              <div
                className="h-full rounded"
                style={{ width: `${widthPct}%`, background: PALETTE[i % PALETTE.length] }}
              />
            </div>
            <div
              className="text-[11px] font-semibold w-[140px] text-right tabular-nums"
              style={{ color: 'var(--fg2)' }}
            >
              {formatCurrency(valueOf(r))}
              <span className="text-[10px]" style={{ color: 'var(--fg4)' }}>
                {metric === 'avg'
                  ? ` · ${r.count} · ${formatCurrency(r.total)}`
                  : ` · ${r.count} loan${r.count === 1 ? '' : 's'}`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function HighValueCard({ stats }: { stats: HighValueStats }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Stat
        label="Loans"
        value={`${stats.count}`}
        sub={`${stats.share}% of portfolio`}
        accent="var(--purple)"
      />
      <Stat
        label="Volume"
        value={formatCurrency(stats.totalVolume)}
        sub="Sum of LoanAmount"
        accent="var(--blue)"
      />
      <Stat
        label="Avg Size"
        value={formatCurrency(stats.avgAmount)}
        sub="Avg of LoanAmount"
        accent="var(--green)"
      />
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div>
      <div
        className="text-[10px] font-semibold uppercase tracking-[0.3px]"
        style={{ color: 'var(--fg4)' }}
      >
        {label}
      </div>
      <div className="text-[20px] font-extrabold leading-tight" style={{ color: accent }}>
        {value}
      </div>
      <div className="text-[10px] mt-1" style={{ color: 'var(--fg4)' }}>
        {sub}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Chart variants — hand-rolled SVG so we don't pull in a charting library.
// Each one accepts tightly-typed rows so the call sites stay obvious.
// ────────────────────────────────────────────────────────────────────────────

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const startOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const startInner = polarToCartesian(cx, cy, innerR, endAngle);
  const endInner = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ');
}

export function Donut({
  rows,
  centerValue,
  centerLabel,
  size = 200,
}: {
  rows: CountRow[];
  centerValue: string | number;
  centerLabel?: string;
  size?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  const radius = size / 2;
  const innerR = radius * 0.62;

  // Pad horizontally so leader-line callouts have room to breathe; vertical
  // padding for the topmost/bottommost labels. padX is sized for the longest
  // expected label (~14 chars) at the chosen font size.
  const padX = 160;
  const padY = 16;
  const vbWidth = size + padX * 2;
  const vbHeight = size + padY * 2;
  // Donut center sits in the middle of the original size box, offset by padding.
  const cx = padX + radius;
  const cy = padY + radius;
  // Truncate long category names so they always fit inside the viewBox.
  const truncate = (s: string, n = 14) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

  let cursor = 0;
  const slices = rows
    .filter((r) => r.value > 0)
    .map((r, i) => {
      const start = (cursor / total) * 360;
      cursor += r.value;
      const end = (cursor / total) * 360;
      // SVG arcs can't draw a 360° wedge — nudge end so a single slice still
      // renders as a near-full ring.
      const safeEnd = end - start >= 360 ? start + 359.99 : end;
      const path = describeArc(cx, cy, radius, innerR, start, safeEnd);
      const pct = (r.value / total) * 100;
      const midAngle = (start + safeEnd) / 2;
      return {
        path,
        color: PALETTE[i % PALETTE.length],
        row: r,
        pct,
        midAngle,
      };
    });

  const active = hovered !== null && slices[hovered] ? slices[hovered] : null;
  const displayValue = active ? active.row.value : centerValue;
  const displaySub = active
    ? `${active.row.label} · ${active.pct.toFixed(active.pct < 10 ? 1 : 0)}%`
    : centerLabel ?? '';

  // Build callout layout. Each leader runs from the arc entry point, bends at
  // a fixed radial column on its side, then runs horizontally to the label.
  // Per-side collision avoidance pushes overlapping labels apart vertically
  // so tiny adjacent slices remain readable.
  type Callout = {
    color: string;
    row: CountRow;
    midAngle: number;
    isRight: boolean;
    arcStart: { x: number; y: number };
    bendX: number;
    stubX: number;
    labelX: number;
    naturalY: number;
    adjustedY: number;
    sliceIndex: number;
  };
  const minGap = 15;
  const callouts: Callout[] = slices.map((s, i) => {
    const isRight = s.midAngle <= 180;
    const arcStart = polarToCartesian(cx, cy, radius * 1.02, s.midAngle);
    const bendX = isRight ? cx + radius * 1.16 : cx - radius * 1.16;
    const stubX = isRight ? cx + radius * 1.28 : cx - radius * 1.28;
    const labelX = isRight ? stubX + 5 : stubX - 5;
    return {
      color: s.color,
      row: s.row,
      midAngle: s.midAngle,
      isRight,
      arcStart,
      bendX,
      stubX,
      labelX,
      naturalY: arcStart.y,
      adjustedY: arcStart.y,
      sliceIndex: i,
    };
  });

  // Per-side stagger: walk top→bottom enforcing minimum gap, then bottom→top
  // so labels never overflow the canvas.
  const minY = padY + 6;
  const maxY = vbHeight - padY - 6;
  for (const isRight of [true, false]) {
    const side = callouts
      .filter((c) => c.isRight === isRight)
      .sort((a, b) => a.naturalY - b.naturalY);
    for (let i = 1; i < side.length; i++) {
      if (side[i].adjustedY < side[i - 1].adjustedY + minGap) {
        side[i].adjustedY = side[i - 1].adjustedY + minGap;
      }
    }
    if (side.length > 0 && side[side.length - 1].adjustedY > maxY) {
      side[side.length - 1].adjustedY = maxY;
      for (let i = side.length - 2; i >= 0; i--) {
        if (side[i].adjustedY > side[i + 1].adjustedY - minGap) {
          side[i].adjustedY = side[i + 1].adjustedY - minGap;
        } else {
          break;
        }
      }
    }
    if (side.length > 0 && side[0].adjustedY < minY) {
      side[0].adjustedY = minY;
      for (let i = 1; i < side.length; i++) {
        if (side[i].adjustedY < side[i - 1].adjustedY + minGap) {
          side[i].adjustedY = side[i - 1].adjustedY + minGap;
        } else {
          break;
        }
      }
    }
  }

  return (
    <div className="flex items-center justify-center py-2">
      <svg
        width="100%"
        height={vbHeight}
        viewBox={`0 0 ${vbWidth} ${vbHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ maxWidth: vbWidth }}
      >
        {/* Slices */}
        {slices.map((s, i) => {
          const dim = hovered !== null && hovered !== i;
          return (
            <path
              key={i}
              d={s.path}
              fill={s.color}
              stroke="var(--surface)"
              strokeWidth={hovered === i ? 2 : 1.5}
              fillOpacity={dim ? 0.35 : 1}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer', transition: 'fill-opacity 120ms ease' }}
            />
          );
        })}

        {/* Leader-line callouts. Each leader: arc entry → bend column at the
            (possibly staggered) label Y → horizontal stub → label. */}
        {callouts.map((c) => {
          const dim = hovered !== null && hovered !== c.sliceIndex;
          const opacity = dim ? 0.35 : 1;
          return (
            <g
              key={`cb-${c.sliceIndex}`}
              style={{
                opacity,
                transition: 'opacity 120ms ease',
                pointerEvents: 'none',
              }}
            >
              <polyline
                points={`${c.arcStart.x},${c.arcStart.y} ${c.bendX},${c.adjustedY} ${c.stubX},${c.adjustedY}`}
                fill="none"
                stroke={c.color}
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
              />
              <circle cx={c.stubX} cy={c.adjustedY} r="2" fill={c.color} />
              <text
                x={c.labelX}
                y={c.adjustedY}
                dy="0.34em"
                textAnchor={c.isRight ? 'start' : 'end'}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  fill: 'var(--fg2)',
                }}
              >
                {truncate(c.row.label)}
              </text>
            </g>
          );
        })}

        {/* Center value */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dy="-0.1em"
          style={{
            fontSize: 26,
            fontWeight: 800,
            fill: active ? active.color : 'var(--fg)',
            transition: 'fill 120ms ease',
            pointerEvents: 'none',
          }}
        >
          {displayValue}
        </text>
        {displaySub && (
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dy="1.6em"
            style={{
              fontSize: 11,
              fill: 'var(--fg4)',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              pointerEvents: 'none',
            }}
          >
            {displaySub}
          </text>
        )}
      </svg>
    </div>
  );
}

// Single horizontal bar, segmented by share. The bar carries the visual
// proportion — the legend below names each segment with its absolute value.
// No percentages on either side (the bar is the percentage).
export function StackedBar({
  rows,
  totalLabel,
}: {
  rows: { label: string; value: number; color?: string }[];
  totalLabel?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = rows.reduce((s, r) => s + r.value, 0) || 1;
  return (
    <div>
      <div
        className="flex h-7 rounded overflow-hidden"
        style={{ background: 'var(--elevated)', border: '1px solid var(--border)' }}
      >
        {rows.map((r, i) => {
          const widthPct = (r.value / total) * 100;
          if (widthPct < 0.5) return null;
          const color = r.color ?? PALETTE[i % PALETTE.length];
          const dim = hovered !== null && hovered !== i;
          return (
            <div
              key={r.label}
              style={{
                width: `${widthPct}%`,
                background: color,
                opacity: dim ? 0.45 : 1,
                cursor: 'pointer',
                transition: 'opacity 120ms ease',
              }}
              title={`${r.label}: ${formatCurrency(r.value)}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-1 gap-y-0.5 text-[11px]">
        {rows.map((r, i) => {
          const color = r.color ?? PALETTE[i % PALETTE.length];
          const isHovered = hovered === i;
          const dim = hovered !== null && !isHovered;
          return (
            <div
              key={r.label}
              className="flex items-center gap-2 px-1.5 py-1 rounded cursor-pointer"
              style={{
                background: isHovered ? 'var(--elevated)' : 'transparent',
                opacity: dim ? 0.55 : 1,
                transition: 'background 120ms ease, opacity 120ms ease',
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
              <span className="flex-1 truncate" style={{ color: 'var(--fg3)' }} title={r.label}>
                {r.label}
              </span>
              <span className="font-semibold tabular-nums" style={{ color: 'var(--fg2)' }}>
                {formatCurrency(r.value)}
              </span>
            </div>
          );
        })}
        {totalLabel && (
          <div
            className="mt-1.5 pt-1.5 px-1.5 flex items-center text-[10.5px]"
            style={{ borderTop: '1px solid var(--border)', color: 'var(--fg4)' }}
          >
            <span className="flex-1 uppercase tracking-[0.4px] font-semibold">{totalLabel}</span>
            <span className="font-semibold tabular-nums" style={{ color: 'var(--fg2)' }}>
              {formatCurrency(total)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Vertical bar histogram — natural for amount/range distributions. Hover dims
// other bars so the focused one stands out. With no footer, the bar zone
// expands to use the full widget height.
export function VerticalBars({
  rows,
  height = 280,
}: {
  rows: { label: string; value: number; sub?: string; color?: string }[];
  height?: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(1, ...rows.map((r) => r.value));
  // Reserve room for the count number above + label/sub below; the rest is
  // pure bar zone. With the footer gone we hand most of the card to the bars.
  const barAreaHeight = height - 60;

  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {rows.map((r, i) => {
        const heightPct = r.value === 0 ? 0 : Math.max(3, (r.value / max) * 100);
        const color = r.color ?? PALETTE[i % PALETTE.length];
        const isHovered = hovered === i;
        const dim = hovered !== null && !isHovered;
        return (
          <div
            key={r.label}
            className="flex-1 flex flex-col items-stretch gap-1.5 min-w-0 cursor-pointer h-full"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className="text-[12px] font-bold text-center tabular-nums leading-none"
              style={{
                color: isHovered ? color : 'var(--fg)',
                transition: 'color 120ms ease',
              }}
            >
              {r.value}
            </div>
            <div className="flex items-end" style={{ height: barAreaHeight }}>
              <div
                className="w-full rounded-t-md"
                style={{
                  height: `${heightPct}%`,
                  background: r.value === 0 ? 'var(--elevated)' : color,
                  minHeight: r.value === 0 ? 2 : 4,
                  border: r.value === 0 ? '1px dashed var(--border)' : 'none',
                  opacity: dim ? 0.4 : 1,
                  boxShadow: isHovered ? `0 0 0 2px ${color}40` : 'none',
                  transition: 'opacity 120ms ease, box-shadow 120ms ease',
                }}
              />
            </div>
            <div
              className="text-[10px] font-semibold text-center truncate uppercase tracking-[0.2px]"
              style={{
                color: isHovered ? 'var(--fg2)' : 'var(--fg3)',
                transition: 'color 120ms ease',
              }}
              title={r.label}
            >
              {r.label}
            </div>
            {r.sub && (
              <div
                className="text-[9.5px] text-center truncate tabular-nums"
                style={{ color: 'var(--fg4)' }}
              >
                {r.sub}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Small mark identifying a widget as DataFabric-powered.
export function PoweredByDfBadge() {
  return (
    <img
      src={dataFabricIcon}
      alt="Powered by DataFabric"
      title="Powered by DataFabric — live aggregate / groupBy queries via @uipath/uipath-typescript"
      width={16}
      height={16}
      className="inline-block align-middle"
      style={{ objectFit: 'contain' }}
    />
  );
}

export function Empty({ msg }: { msg: string }) {
  return (
    <div className="text-[12px] py-4 text-center" style={{ color: 'var(--fg4)' }}>
      {msg}
    </div>
  );
}
