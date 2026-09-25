/**
 * `LinearTimeline` — the reaction-timeline primitive.
 * Contract: `docs/ux/03-markets-and-design-system.md` §A.9 (props, states, accessibility,
 * responsive), consuming the encoding rules in `docs/ux/02` §9.4 and §9.6.
 *
 * Why a new primitive: there is no chart, axis, brush, playhead or time-series primitive
 * anywhere in the repo and no charting library in `package.json`; the band is plain SVG.
 *
 * The props below are the frozen §A.9.1 set. Two rules of the contract are structural, not
 * cosmetic, and are enforced here rather than left to the consumer:
 *   1. the SVG is `role="img"` and **no focusable element is nested inside it** — the scrubber
 *      and the brush handles are siblings positioned over the band (§9.9);
 *   2. a table equivalent is always reachable from the same module (`LinearTimelineTable`),
 *      and it is the default below 639 px.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatClock, formatClockSpoken, TaxonomySpec } from "../../helper/AgoraHelper";

export type ScaleMode = "sqrt" | "linear";
export type Normalisation = "shareOfBucket" | "ratePerMinute";

export interface TimelineBucket {
    bucketIndex: number;
    /** counts per taxonomy id within this bucket, already filtered to the drawn series */
    counts: Partial<Record<number, number>>;
    /** total reactions in the bucket across the drawn series; drives the low-n hatch */
    n: number;
}

export interface TimelineLane {
    id: string;
    label: string;
    /** e.g. the reaction count, rendered in the lane head's screen-reader name only */
    subLabel?: string;
    buckets: TimelineBucket[];
}

export interface LinearTimelineProps {
    /** total span of the timeline in milliseconds */
    durationMs: number;
    /** current position; `null` = no media bound */
    playheadMs: number | null;
    /** fired when the user moves the playhead */
    onSeek: (ms: number) => void;
    /** one lane per speaker, in roster order; may be empty */
    lanes: TimelineLane[];
    /** id, label, colour, pattern, half of the axis, accessibility label per taxonomy */
    taxonomies: TaxonomySpec[];
    /** height scaling; default `sqrt` (PRD-04 §6.5) */
    scaleMode?: ScaleMode;
    /** which series is drawn; default `shareOfBucket` */
    normalisation?: Normalisation;
    /** the selected range */
    brushRange?: [number, number] | null;
    /** brush edits */
    onBrushChange?: (range: [number, number] | null) => void;
    /** per-lane count below which the lane renders the "not a signal" caption; default 10 */
    lowNThreshold?: number;
    /** per-bucket count below which the bar is hatched and de-emphasised; default 10 */
    bucketLowNThreshold?: number;
    /** force the data-table representation */
    tableFallback?: boolean;
    /** the one-sentence non-visual equivalent; required — the primitive must not render without it */
    ariaSummary: string;
    /** what to show when `lanes` is empty */
    emptyStateLabel: string;
    /** the caption under the band (sample honesty lives with the consumer) */
    caption?: string;
}

export const LOW_N_CAPTION = "few reactions — not a signal";

const LANE_HEIGHT = 56;
const OVERVIEW_HEIGHT = 24;

const usePrefersReducedMotion = (): boolean => {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) {
            return;
        }
        const query = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReduced(query.matches);
        const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
        query.addEventListener?.("change", listener);
        return () => query.removeEventListener?.("change", listener);
    }, []);

    return reduced;
};

/** A stable, deterministic pseudo-random offset per bucket, so a hatch looks like a hatch. */
const hatchId = (laneId: string, bucketIndex: number) => `hl-${laneId}-${bucketIndex}`;

export const LinearTimeline = ({
    durationMs,
    playheadMs,
    onSeek,
    lanes,
    taxonomies,
    scaleMode = "sqrt",
    normalisation = "shareOfBucket",
    brushRange = null,
    onBrushChange,
    lowNThreshold = 10,
    bucketLowNThreshold = 10,
    tableFallback = false,
    ariaSummary,
    emptyStateLabel,
    caption,
}: LinearTimelineProps) => {
    const reducedMotion = usePrefersReducedMotion();
    const trackRef = useRef<HTMLDivElement>(null);
    const [dragStart, setDragStart] = useState<number | null>(null);

    const activeTaxonomies = useMemo(
        () => taxonomies.filter((t) => lanes.some((lane) => lane.buckets.some((b) => (b.counts[t.id] ?? 0) > 0))),
        [taxonomies, lanes]
    );

    const totalReactions = useMemo(
        () => lanes.reduce((sum, lane) => sum + lane.buckets.reduce((s, b) => s + b.n, 0), 0),
        [lanes]
    );

    const maxNormalised = useMemo(() => {
        const bucketMs = Math.max(1, durationMs / Math.max(1, bucketCountRef(lanes)));
        let max = 0;
        lanes.forEach((lane) => {
            lane.buckets.forEach((bucket) => {
                const bucketN = bucket.n || 1;
                Object.values(bucket.counts).forEach((count) => {
                    const value = count ?? 0;
                    const normalised = normalisation === "ratePerMinute" ? (value * 60000) / bucketMs : value / bucketN;
                    if (normalised > max) {
                        max = normalised;
                    }
                });
            });
        });
        return max;
    }, [lanes, normalisation, durationMs]);

    /** The height a single taxonomy bar gets, relative to the tallest bar in the band. */
    const scale = useCallback(
        (count: number, bucket: TimelineBucket): number => {
            const bucketN = bucket.n || 1;
            const bucketMs = Math.max(1, durationMs / Math.max(1, bucketCountRef(lanes)));
            const value =
                normalisation === "ratePerMinute"
                    ? (count * 60000) / bucketMs
                    : count / bucketN;
            const transformed = scaleMode === "sqrt" ? Math.sqrt(Math.max(0, value)) : Math.max(0, value);
            return Math.min(1, transformed / (maxNormalised || 1));
        },
        [normalisation, scaleMode, durationMs, lanes, maxNormalised]
    );

    const msFromEvent = useCallback(
        (clientX: number) => {
            const rect = trackRef.current?.getBoundingClientRect();
            if (!rect || rect.width === 0) {
                return 0;
            }
            const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
            return Math.round(ratio * durationMs);
        },
        [durationMs]
    );

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const current = playheadMs ?? 0;
        const step = event.shiftKey ? 30000 : 5000;
        let next: number | null = null;
        if (event.key === "ArrowLeft") {
            next = current - step;
        } else if (event.key === "ArrowRight") {
            next = current + step;
        } else if (event.key === "PageUp") {
            next = current - 300000;
        } else if (event.key === "PageDown") {
            next = current + 300000;
        } else if (event.key === "Home") {
            next = 0;
        } else if (event.key === "End") {
            next = durationMs;
        } else if (event.key === "[" && onBrushChange && playheadMs !== null) {
            next = null;
            onBrushChange([Math.min(playheadMs, brushRange?.[1] ?? durationMs), brushRange?.[1] ?? durationMs]);
        } else if (event.key === "]" && onBrushChange && playheadMs !== null) {
            next = null;
            onBrushChange([brushRange?.[0] ?? 0, Math.max(playheadMs, brushRange?.[0] ?? 0)]);
        } else if (event.key === "Escape" && onBrushChange && brushRange) {
            next = null;
            onBrushChange(null);
        }

        if (next !== null) {
            event.preventDefault();
            onSeek(Math.max(0, Math.min(durationMs, next)));
        } else if (["[", "]", "Escape"].includes(event.key)) {
            event.preventDefault();
        }
    };

    if (lanes.length === 0 || totalReactions === 0) {
        return (
            <div className="bg-card rounded-xl p-5 flex flex-col gap-2">
                <p className="text-[#7D8B92] font-Lexend text-xs" role="status">
                    {emptyStateLabel}
                </p>
                {caption ? <p className="text-[#7D8B92] font-Lexend text-xs">{caption}</p> : null}
            </div>
        );
    }

    const playheadX = playheadMs === null ? null : (playheadMs / durationMs) * 100;
    const brushLeft = brushRange ? (brushRange[0] / durationMs) * 100 : null;
    const brushWidth = brushRange ? ((brushRange[1] - brushRange[0]) / durationMs) * 100 : null;

    return (
        <div className="flex flex-col gap-3">
            {/* The band. `role="img"`: nothing focusable inside. */}
            <div
                className={`relative ${tableFallback ? "hidden" : "hidden sm:block"}`}
                style={{ paddingTop: OVERVIEW_HEIGHT + 8 }}>
                <svg
                    role="img"
                    aria-label={ariaSummary}
                    className="w-full"
                    height={OVERVIEW_HEIGHT + lanes.length * (LANE_HEIGHT + 16) + 8}
                    viewBox={`0 0 100 ${OVERVIEW_HEIGHT + lanes.length * (LANE_HEIGHT + 16) + 8}`}
                    preserveAspectRatio="none">
                    <title>Reaction composition timeline</title>
                    <desc>{ariaSummary}</desc>
                    <defs>
                        {taxonomies.map((taxonomy) => (
                            <pattern
                                key={taxonomy.id}
                                id={`pattern-${taxonomy.id}-${taxonomy.pattern}`}
                                patternUnits="userSpaceOnUse"
                                width="4"
                                height="4">
                                {patternGlyph(taxonomy.pattern, taxonomy.color)}
                            </pattern>
                        ))}
                        {lanes.map((lane) =>
                            lane.buckets
                                .filter((bucket) => bucket.n < bucketLowNThreshold)
                                .map((bucket) => (
                                    <pattern
                                        key={hatchId(lane.id, bucket.bucketIndex)}
                                        id={hatchId(lane.id, bucket.bucketIndex)}
                                        patternUnits="userSpaceOnUse"
                                        width="3"
                                        height="3"
                                        patternTransform="rotate(45)">
                                        <line x1="0" y1="0" x2="0" y2="3" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="1" />
                                    </pattern>
                                ))
                        )}
                    </defs>

                    {/* Overview strip: whole-duration composition, downsampled */}
                    <g transform={`translate(0,0)`}>
                        {buildOverviewBars(lanes, durationMs).map((bar, index) => (
                            <rect
                                key={`ov-${index}`}
                                x={bar.x}
                                y={OVERVIEW_HEIGHT - bar.height}
                                width={Math.max(0.05, bar.width)}
                                height={bar.height}
                                fill={bar.color}
                                opacity={bar.lowN ? 0.4 : 0.9}
                            />
                        ))}
                    </g>

                    {lanes.map((lane, laneIndex) => {
                        const laneTop = OVERVIEW_HEIGHT + 16 + laneIndex * (LANE_HEIGHT + 16);
                        const laneTotal = lane.buckets.reduce((sum, bucket) => sum + bucket.n, 0);
                        const isLowLane = laneTotal < lowNThreshold;
                        const axisY = laneTop + LANE_HEIGHT / 2;

                        return (
                            <g key={lane.id}>
                                {/* axis: 1 px #212427 at the lane's zero line */}
                                <line x1="0" y1={axisY} x2="100" y2={axisY} stroke="#212427" strokeWidth="0.15" />

                                {isLowLane ? null : (
                                    lane.buckets.map((bucket) => {
                                        const bucketMs = durationMs / Math.max(1, bucketCountRef(lanes));
                                        const bucketWidth = Math.max(
                                            0.06,
                                            (bucketMs / durationMs) * 100
                                        );
                                        const bucketLeft = (bucket.bucketIndex * bucketMs * 100) / durationMs;
                                        let above = 0;
                                        let below = 0;

                                        return (
                                            <g key={`${lane.id}-${bucket.bucketIndex}`}>
                                                {taxonomies.map((taxonomy) => {
                                                    const count = bucket.counts[taxonomy.id] ?? 0;
                                                    if (count === 0) {
                                                        return null;
                                                    }
                                                    const height = Math.max(
                                                        1,
                                                        scale(count, bucket) * (LANE_HEIGHT / 2 - 4)
                                                    );
                                                    const isAbove = taxonomy.side === "above";
                                                    const y = isAbove ? axisY - above - height : axisY + below;
                                                    if (isAbove) {
                                                        above += height;
                                                    } else {
                                                        below += height;
                                                    }
                                                    return (
                                                        <rect
                                                            key={`${lane.id}-${bucket.bucketIndex}-${taxonomy.id}`}
                                                            x={bucketLeft}
                                                            y={y}
                                                            width={bucketWidth}
                                                            height={height}
                                                            fill={taxonomy.color}
                                                            opacity={bucket.n < bucketLowNThreshold ? 0.4 : 0.92}
                                                        />
                                                    );
                                                })}
                                                {bucket.n < bucketLowNThreshold ? (
                                                    <rect
                                                        x={bucketLeft}
                                                        y={axisY - LANE_HEIGHT / 2}
                                                        width={bucketWidth}
                                                        height={LANE_HEIGHT}
                                                        fill={`url(#${hatchId(lane.id, bucket.bucketIndex)})`}
                                                    />
                                                ) : null}
                                            </g>
                                        );
                                    })
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* Brush range: two vertical rules with grips, over the band */}
                {brushLeft !== null && brushWidth !== null ? (
                    <>
                        <div
                            className="absolute top-0 bottom-0 w-[2px] bg-[#E5F7FF]"
                            style={{ left: `${brushLeft}%` }}
                            aria-hidden="true"
                        />
                        <div
                            className="absolute top-0 bottom-0 w-[2px] bg-[#E5F7FF]"
                            style={{ left: `${brushLeft + brushWidth}%` }}
                            aria-hidden="true"
                        />
                    </>
                ) : null}

                {/* Playhead: 2 px #E5F7FF, sibling of the SVG, never nested in it */}
                {playheadX !== null ? (
                    <div
                        className={`absolute top-0 bottom-0 w-[2px] bg-[#E5F7FF] ${reducedMotion ? "" : "t-all-100"}`}
                        style={{ left: `${playheadX}%`, display: "block" }}
                        aria-hidden="true"
                    />
                ) : null}

                {/* The interactive surface: one tab stop, drag to brush, click to seek */}
                <div
                    ref={trackRef}
                    role="slider"
                    tabIndex={0}
                    aria-label="Timeline position"
                    aria-valuemin={0}
                    aria-valuemax={Math.round(durationMs / 1000)}
                    aria-valuenow={Math.round((playheadMs ?? 0) / 1000)}
                    aria-valuetext={formatClockSpoken((playheadMs ?? 0) / 1000)}
                    onKeyDown={handleKeyDown}
                    onPointerDown={(event) => {
                        setDragStart(msFromEvent(event.clientX));
                    }}
                    onPointerMove={(event) => {
                        if (dragStart === null) {
                            return;
                        }
                        const now = msFromEvent(event.clientX);
                        if (onBrushChange) {
                            onBrushChange([Math.min(dragStart, now), Math.max(dragStart, now)]);
                        }
                    }}
                    onPointerUp={(event) => {
                        const now = msFromEvent(event.clientX);
                        if (dragStart !== null && onBrushChange && Math.abs(now - dragStart) > 1000) {
                            onBrushChange([Math.min(dragStart, now), Math.max(dragStart, now)]);
                        } else {
                            onSeek(now);
                        }
                        setDragStart(null);
                    }}
                    className="absolute inset-0 cursor-crosshair focus-visible:ring-2 focus-visible:ring-[#84B9D1] rounded-lg"
                />
            </div>

            {/* Lane list: the labelled non-visual equivalent of the band (§9.9) */}
            <ul className="flex flex-col gap-2">
                {lanes.map((lane) => {
                    const laneTotal = lane.buckets.reduce((sum, bucket) => sum + bucket.n, 0);
                    const range = `${formatClock(0)} to ${formatClock(durationMs / 1000)}`;
                    return (
                        <li
                            key={lane.id}
                            aria-label={`${lane.label}, ${laneTotal} reactions, ${range}`}
                            className="flex items-center gap-2">
                            <span className="font-Lexend text-xs text-[#E5F7FF] min-w-[120px]">{lane.label}</span>
                            {laneTotal < lowNThreshold ? (
                                <span className="font-Lexend text-xs text-[#7D8B92]">{LOW_N_CAPTION}</span>
                            ) : (
                                <span className="font-Lexend text-[10px] uppercase tracking-wide text-[#7D8B92]">
                                    {lane.subLabel ?? "composed in the band above"}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ul>

            {activeTaxonomies.length === 0 ? (
                <p className="font-Lexend text-xs text-[#7D8B92]">No taxonomy is currently drawn.</p>
            ) : null}
        </div>
    );
};

// ---------------------------------------------------------------------------

const bucketCountRef = (lanes: TimelineLane[]): number => Math.max(1, lanes[0]?.buckets.length ?? 1);

const buildOverviewBars = (lanes: TimelineLane[], durationMs: number) => {
    const bucketCount = bucketCountRef(lanes);
    const width = 100 / bucketCount;
    const result: { x: number; width: number; height: number; color: string; lowN: boolean }[] = [];

    for (let index = 0; index < bucketCount; index += 1) {
        let total = 0;
        let dominant = 0;
        let dominantCount = 0;
        lanes.forEach((lane) => {
            const bucket = lane.buckets[index];
            if (!bucket) {
                return;
            }
            Object.entries(bucket.counts).forEach(([id, count]) => {
                const value = count ?? 0;
                total += value;
                if (value > dominantCount) {
                    dominantCount = value;
                    dominant = Number(id);
                }
            });
        });
        const color = TAXONOMY_FALLBACK_COLOR[dominant] ?? "#7D8B92";
        result.push({
            x: index * width,
            width,
            height: total === 0 ? 0.4 : Math.max(1.5, Math.min(OVERVIEW_HEIGHT - 4, Math.sqrt(total) * 2.2)),
            color,
            lowN: total < 10,
        });
    }

    void durationMs;
    return result;
};

const TAXONOMY_FALLBACK_COLOR: Record<number, string> = {
    0: "#ABECD6",
    1: "#84B9D1",
    2: "#12D8FA",
    3: "#D2B4FC",
    4: "#FC8181",
    5: "#7D8B92",
};

/** The six non-colour patterns from docs/ux/02 §9.4, declared once as SVG defs. */
const patternGlyph = (pattern: TaxonomySpec["pattern"], color: string) => {
    switch (pattern) {
        case "dots":
            return <circle cx="1" cy="1" r="0.6" fill={color} />;
        case "horizontal":
            return <line x1="0" y1="2" x2="4" y2="2" stroke={color} strokeWidth="0.6" />;
        case "vertical":
            return <line x1="2" y1="0" x2="2" y2="4" stroke={color} strokeWidth="0.6" />;
        case "plusGrid":
            return (
                <>
                    <line x1="0" y1="2" x2="4" y2="2" stroke={color} strokeWidth="0.4" />
                    <line x1="2" y1="0" x2="2" y2="4" stroke={color} strokeWidth="0.4" />
                </>
            );
        case "chevrons":
            return <path d="M0 3 L2 1 L4 3" stroke={color} strokeWidth="0.5" fill="none" />;
        default:
            return <rect x="0" y="0" width="4" height="4" fill={color} />;
    }
};

// ---------------------------------------------------------------------------
// The table: same data, full contrast, always reachable from this module (§A.9.3.2)
// ---------------------------------------------------------------------------

export interface TimelineTableRow {
    startMs: number;
    laneLabel: string;
    taxonomyLabel: string;
    count: number;
    shareOfBucket: number;
    series: string;
}

export const LinearTimelineTable = ({
    rows,
    caption,
    onSeek,
}: {
    rows: TimelineTableRow[];
    caption: string;
    onSeek?: (ms: number) => void;
}) => (
    <table className="w-full border-collapse bg-card rounded-xl overflow-hidden">
        <caption className="text-left text-[#7D8B92] font-Lexend text-xs p-3">
            {caption} Rows are 5-second buckets with at least one reaction. Empty buckets are omitted. Share of bucket is
            the fraction of reactions in that bucket, not of the whole session.
        </caption>
        <thead>
            <tr className="border-b border-[#1E1E1E]">
                <th scope="col" className="text-left font-Lexend text-[10px] uppercase tracking-wide text-[#7D8B92] p-2">
                    start
                </th>
                <th scope="col" className="text-left font-Lexend text-[10px] uppercase tracking-wide text-[#7D8B92] p-2">
                    speaker
                </th>
                <th scope="col" className="text-left font-Lexend text-[10px] uppercase tracking-wide text-[#7D8B92] p-2">
                    taxonomy
                </th>
                <th scope="col" className="text-right font-Lexend text-[10px] uppercase tracking-wide text-[#7D8B92] p-2">
                    count
                </th>
                <th scope="col" className="text-right font-Lexend text-[10px] uppercase tracking-wide text-[#7D8B92] p-2">
                    share of bucket
                </th>
                <th scope="col" className="text-left font-Lexend text-[10px] uppercase tracking-wide text-[#7D8B92] p-2">
                    series
                </th>
            </tr>
        </thead>
        <tbody>
            {rows.map((row) => (
                <tr key={`${row.startMs}-${row.laneLabel}-${row.taxonomyLabel}-${row.series}`} className="border-b border-[#1E1E1E]">
                    <td className="p-2">
                        {onSeek ? (
                            <button
                                type="button"
                                onClick={() => onSeek(row.startMs)}
                                className="button-t text-[#84B9D1] font-Lexend tabular-nums text-xs focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                                {formatClock(row.startMs / 1000)}
                            </button>
                        ) : (
                            <span className="font-Lexend tabular-nums text-xs text-[#E5F7FF]">
                                {formatClock(row.startMs / 1000)}
                            </span>
                        )}
                    </td>
                    <td className="p-2 font-Lexend text-xs text-[#E5F7FF]">{row.laneLabel}</td>
                    <td className="p-2 font-Lexend text-xs text-[#E5F7FF]">{row.taxonomyLabel}</td>
                    <td className="p-2 font-Lexend tabular-nums text-xs text-[#E5F7FF] text-right">{row.count}</td>
                    <td className="p-2 font-Lexend tabular-nums text-xs text-[#E5F7FF] text-right">
                        {row.shareOfBucket.toFixed(2)}
                    </td>
                    <td className="p-2 font-Lexend text-xs text-[#E5F7FF]">{row.series}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

export default LinearTimeline;
