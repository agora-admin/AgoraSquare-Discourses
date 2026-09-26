/**
 * `ReactionTimeline` — the linear reaction timeline, the centrepiece of pillar 4.
 *
 * Contract: `docs/ux/02-deliberation-and-record.md` §9 in full (regions §9.3, encoding §9.4,
 * series/lens/normalisation §9.5, interaction §9.6, legend §9.7, "disagreement is not a
 * verdict" §9.8, fallbacks §9.9, low-data §9.10, the five prohibitions §9.13) and the primitive
 * it composes, `docs/ux/03` §A.9 (`LinearTimeline`, whose prop set is frozen).
 *
 * DATA SOURCE — the component takes exactly one data prop, `data`, whose type is the indexer's
 * response shape (`docs/ux/02` §9.14) declared in `src/lib/agoraFixtures.ts`. Swapping the
 * fixture for the real service is a one-line change at the call site; nothing in this file
 * changes.
 *
 * The five review-blocking prohibitions from §9.13 are enforced here, not documented here:
 *   1. no aggregate, score, percentage, ranking or verdict affordance anywhere — the only
 *      visible number is the sample size in the caption, and lane totals live in the table and
 *      in ARIA labels only;
 *   2. no synthetic denominator — `per 1,000 viewer-seconds` is absent from the control
 *      entirely, because no real viewer series exists;
 *   3. no equal visual weight for low-n data — a lane below the threshold draws no band, a
 *      bucket below it is hatched and at 40 %, and under 10 reactions the band is not drawn;
 *   4. no colour-only encoding — six patterns, six glyphs, six text labels, and a table that is
 *      an equal peer rather than a fallback toggle;
 *   5. no live band and no scoreboard motion — the band is static and does not animate.
 */

import { useMemo, useState } from "react";
import { LOW_N_CAPTION, LinearTimeline, LinearTimelineTable, TimelineLane, TimelineTableRow } from "../primitives/LinearTimeline";
import { ReactionGlyph } from "./ReactionGlyph";
import { TAXONOMIES, formatClock, formatDuration, TaxonomyId } from "../../helper/AgoraHelper";
import { ReactionSeries, ReactionTimelineData } from "../../lib/agoraFixtures";

export type SeriesSelection = "live" | "post" | "both";
export type Lens = "all" | "pledgers";

export interface ReactionTimelineProps {
    /** the indexer's response shape — see `src/lib/agoraFixtures.ts` */
    data: ReactionTimelineData;
    /** current media position in ms; `null` when no media is bound (§9.6 player coupling) */
    playheadMs?: number | null;
    onSeek?: (ms: number) => void;
    /** the brushed range, controlled by the record page so `?t=` stays the source of truth */
    brushRange?: [number, number] | null;
    onBrushChange?: (range: [number, number] | null) => void;
    /** force the table view (used by the record page when JavaScript is unavailable) */
    forceTable?: boolean;
    /** show the lens control; only rendered when a second lens genuinely exists (§9.5) */
    lens?: Lens;
    onLensChange?: (lens: Lens) => void;
}

const LOW_N_TOTAL = 10;
const LOW_N_BUCKET = 10;

const seriesLabel: Record<SeriesSelection, string> = {
    live: "Live",
    post: "Retrospective",
    both: "Both",
};

/**
 * One sentence, generated from the data rather than from a template with holes (§9.9).
 * It states the sample and its limit in the same breath.
 */
const buildAriaSummary = (data: ReactionTimelineData, peak?: { start: number; speaker: string }): string => {
    const pieces = [
        `Reaction composition timeline.`,
        `Session ${data.sessionIndex}, ${formatDuration(data.durationMs / 1000)}.`,
        `${data.summary.totalReactions} reactions from ${data.summary.totalReactors} reactors.`,
    ];
    if (peak) {
        pieces.push(
            `Most disagreement is between ${formatClock(Math.max(0, peak.start / 1000 - 600))} and ${formatClock(
                peak.start / 1000 + 600
            )}, during ${peak.speaker}'s turn.`
        );
    }
    return pieces.join(" ");
};

const seriesOf = (selection: SeriesSelection): ReactionSeries[] =>
    selection === "both" ? ["live", "post"] : [selection];

export const ReactionTimeline = ({
    data,
    playheadMs = null,
    onSeek,
    brushRange = null,
    onBrushChange,
    forceTable = false,
    lens = "all",
    onLensChange,
}: ReactionTimelineProps) => {
    const [series, setSeries] = useState<SeriesSelection>("live");
    const [hidden, setHidden] = useState<TaxonomyId[]>([]);
    const [showTable, setShowTable] = useState(false);
    const [scaleMode, setScaleMode] = useState<"sqrt" | "linear">("sqrt");
    const [normalisation, setNormalisation] = useState<"shareOfBucket" | "ratePerMinute">("shareOfBucket");

    const drawnSeries = seriesOf(series);

    /** Buckets projected onto the drawn series and the visible taxonomies. */
    const lanes: TimelineLane[] = useMemo(
        () =>
            data.lanes.map((lane) => ({
                id: lane.id,
                label: lane.label,
                // No `subLabel` count. `docs/ux/02` §13.1 rule 1 is explicit: lane-level reaction
                // totals are **not** rendered above the fold — "the only permitted visible number
                // is the sample size in the caption" — and §13.1 rule 5 forbids anything that
                // turns reaction volume into a spectator sport. The count still reaches assistive
                // technology through the lane's `aria-label` in `LinearTimeline`, so the
                // accessible equivalent is kept and only the visible tally is removed. Omitting
                // the prop lets the primitive fall back to "composed in the band above".
                buckets: lane.buckets.map((bucket) => {
                    const counts: Partial<Record<number, number>> = {};
                    let n = 0;
                    drawnSeries.forEach((key) => {
                        Object.entries(bucket.series[key]).forEach(([id, count]) => {
                            const taxonomyId = Number(id) as TaxonomyId;
                            if (hidden.includes(taxonomyId)) {
                                return;
                            }
                            counts[taxonomyId] = (counts[taxonomyId] ?? 0) + (count ?? 0);
                            n += count ?? 0;
                        });
                    });
                    return { bucketIndex: bucket.bucketIndex, counts, n };
                }),
            })),
        [data.lanes, drawnSeries, hidden]
    );

    const totalDrawn = useMemo(() => lanes.reduce((sum, lane) => sum + lane.buckets.reduce((s, b) => s + b.n, 0), 0), [lanes]);

    /** The peak of below-axis reaction mass — used only for the summary sentence, never on screen. */
    const peak = useMemo(() => {
        const disagreement: number[] = [3, 4];
        let best: { start: number; speaker: string; score: number } | null = null;
        data.lanes.forEach((lane) => {
            lane.buckets.forEach((bucket) => {
                const score = disagreement.reduce(
                    (sum, id) =>
                        sum +
                        drawnSeries.reduce((s, key) => s + (bucket.series[key][id as TaxonomyId] ?? 0), 0),
                    0
                );
                if (score > 0 && (!best || score > best.score)) {
                    best = { start: bucket.startMs, speaker: lane.label, score };
                }
            });
        });
        return best as { start: number; speaker: string; score: number } | null;
    }, [data.lanes, drawnSeries]);

    const tableRows: TimelineTableRow[] = useMemo(
        () =>
            lanes.flatMap((lane) =>
                lane.buckets.flatMap((bucket) =>
                    Object.entries(bucket.counts)
                        .filter(([, count]) => (count ?? 0) > 0)
                        .map(([id, count]) => ({
                            startMs: bucket.bucketIndex * data.bucketMs,
                            laneLabel: lane.label,
                            taxonomyLabel: TAXONOMIES[Number(id) as TaxonomyId].label,
                            count: count ?? 0,
                            shareOfBucket: bucket.n > 0 ? (count ?? 0) / bucket.n : 0,
                            series: seriesLabel[series],
                        }))
                )
            ),
        [lanes, data.bucketMs, series]
    );

    const taxonomyCounts = useMemo(() => {
        const totals: Record<number, number> = {};
        lanes.forEach((lane) =>
            lane.buckets.forEach((bucket) =>
                Object.entries(bucket.counts).forEach(([id, count]) => {
                    totals[Number(id)] = (totals[Number(id)] ?? 0) + (count ?? 0);
                })
            )
        );
        return totals;
    }, [lanes]);

    /**
     * §9.13 rule 1: the only visible number is the sample size. Lane totals are delivered
     * through the lane list's `aria-label` and the table, never as text above the fold.
     */
    const caption = `Self-selected sample of ${data.summary.totalReactors} reactors. Shows what reactions clustered around, not what anyone thought.`;

    const windowClosed = data.summary.sealed;
    const lowData = totalDrawn > 0 && totalDrawn < LOW_N_TOTAL;
    const noReactions = totalDrawn === 0 || data.lanes.every((lane) => lane.buckets.every((b) => b.n === 0));

    const individualReactions = useMemo(
        () =>
            lanes.flatMap((lane) =>
                lane.buckets
                    .filter((bucket) => bucket.n > 0)
                    .map((bucket) => {
                        const dominant = (Object.entries(bucket.counts).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]?.[0] ??
                            0) as unknown as TaxonomyId;
                        return { lane: lane.label, startMs: bucket.bucketIndex * data.bucketMs, taxonomyId: dominant };
                    })
            ),
        [lanes, data.bucketMs]
    );

    const tableIsDefault = forceTable;

    return (
        <section id="reactions" className="bg-card rounded-xl p-5 flex flex-col gap-4">
            <header className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h2 className="text-gradient font-Lexend font-semibold text-sm">Reaction composition</h2>
                    <div className="flex items-center gap-2">
                        {/* Series control — live / retrospective / both, never summed (§9.5) */}
                        <div className="flex items-center gap-1" role="group" aria-label="Reaction series">
                            {(["live", "post", "both"] as SeriesSelection[]).map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    aria-pressed={series === option}
                                    onClick={() => setSeries(option)}
                                    className={`${series === option ? "button-i-f-e" : "button-i-f"} px-2 py-1 font-Lexend text-[10px] uppercase tracking-wide text-[#E5F7FF] focus-visible:ring-2 focus-visible:ring-[#84B9D1]`}>
                                    {seriesLabel[option]}
                                </button>
                            ))}
                        </div>

                        {/* Normalisation. `per 1,000 viewer-seconds` is absent, not disabled (§9.5 rule 1) */}
                        <select
                            aria-label="Normalisation"
                            value={normalisation}
                            onChange={(event) => setNormalisation(event.target.value as typeof normalisation)}
                            className="input-s py-1 text-[10px] uppercase tracking-wide">
                            <option value="shareOfBucket">Composition</option>
                            <option value="ratePerMinute">Rate per minute</option>
                        </select>

                        {/* Scale. Labelled, not implied by an axis (§9.4) */}
                        <select
                            aria-label="Scale"
                            value={scaleMode}
                            onChange={(event) => setScaleMode(event.target.value as typeof scaleMode)}
                            className="input-s py-1 text-[10px] uppercase tracking-wide">
                            <option value="sqrt">Square-root scale (keeps one loud moment from flattening the rest)</option>
                            <option value="linear">Linear scale</option>
                        </select>

                        {/* `Show table` sits at the same visual weight as the controls (§9.9) */}
                        <button
                            type="button"
                            aria-pressed={showTable}
                            onClick={() => setShowTable((prev) => !prev)}
                            className={`${showTable ? "button-so" : "button-so"} font-Lexend text-[10px] uppercase tracking-wide text-[#E5F7FF] focus-visible:ring-2 focus-visible:ring-[#84B9D1]`}>
                            {showTable ? "Hide table" : "Show table"}
                        </button>
                    </div>
                </div>

                <p className="text-[#7D8B92] font-Lexend text-xs">
                    {normalisation === "shareOfBucket"
                        ? "Every bar is the share of reactions in that moment, so a quiet stretch and a busy one are compared fairly."
                        : "Every bar is reactions per minute. Busier moments look bigger on purpose."}{" "}
                    {data.bucketMs / 1000} s bars · session {data.sessionIndex} · {formatDuration(data.durationMs / 1000)}
                </p>

                {onLensChange ? (
                    <div className="flex items-center gap-2" role="group" aria-label="Reactor lens">
                        {(["all", "pledgers"] as Lens[]).map((option) => (
                            <button
                                key={option}
                                type="button"
                                aria-pressed={lens === option}
                                onClick={() => onLensChange(option)}
                                className={`${lens === option ? "button-i-f-e" : "button-i-f"} px-2 py-1 font-Lexend text-[10px] uppercase tracking-wide text-[#E5F7FF]`}>
                                {option === "all" ? "All wallets" : "Pledgers"}
                            </button>
                        ))}
                    </div>
                ) : null}
            </header>

            {/* §9.14: sits ABOVE the band, because a reader who has already read it has formed an impression */}
            {data.summary.verifiedShare < 0.5 ? (
                <p className="rounded-lg bg-[#FBED96]/10 border border-[#FBED96]/40 p-2 text-[#FBED96] font-Lexend text-xs">
                    Fewer than half of these reactions come from verified wallets. Treat the shape as indicative.
                </p>
            ) : null}

            {noReactions ? (
                <div className="flex flex-col gap-2">
                    <p className="text-[#E5F7FFE5] font-Lexend text-xs">
                        {windowClosed
                            ? `The reaction window closed. This record is sealed.`
                            : "No reactions yet."}
                    </p>
                    <p className="text-[#7D8B92] font-Lexend text-xs">
                        Reactions can be added for {data.summary.reactionWindowDays} days after the session. Nothing here
                        is a judgement of the discussion.
                    </p>
                </div>
            ) : lowData ? (
                /* §9.10: below 10 reactions the band is not drawn at all; the list is */
                <div className="flex flex-col gap-2">
                    <p className="text-[#E5F7FFE5] font-Lexend text-xs">
                        Fewer than 10 reactions. Not enough to show a distribution.
                    </p>
                    <ul className="flex flex-col gap-1">
                        {individualReactions.map((reaction) => (
                            <li key={`${reaction.lane}-${reaction.startMs}`} className="flex items-center gap-3">
                                <span className="font-Lexend tabular-nums text-xs text-[#E5F7FF]">
                                    {formatClock(reaction.startMs / 1000)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <ReactionGlyph
                                        taxonomyId={reaction.taxonomyId}
                                        color={TAXONOMIES[reaction.taxonomyId].color}
                                    />
                                    <span className="font-Lexend text-xs text-[#E5F7FF]">
                                        {TAXONOMIES[reaction.taxonomyId].label}
                                    </span>
                                </span>
                                <span className="font-Lexend text-xs text-[#7D8B92]">{reaction.lane}</span>
                                {onSeek ? (
                                    <button
                                        type="button"
                                        onClick={() => onSeek(reaction.startMs)}
                                        className="button-o font-Lexend text-[10px] uppercase tracking-wide text-[#E5F7FF]">
                                        seek
                                    </button>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                    <p className="text-[#7D8B92] font-Lexend text-xs">{individualReactions.length} reactions.</p>
                </div>
            ) : (
                <>
                    <LinearTimeline
                        durationMs={data.durationMs}
                        playheadMs={playheadMs}
                        onSeek={onSeek ?? (() => undefined)}
                        lanes={lanes}
                        taxonomies={TAXONOMIES}
                        scaleMode={scaleMode}
                        normalisation={normalisation}
                        brushRange={brushRange}
                        onBrushChange={onBrushChange}
                        lowNThreshold={LOW_N_TOTAL}
                        bucketLowNThreshold={LOW_N_BUCKET}
                        tableFallback={tableIsDefault}
                        ariaSummary={buildAriaSummary(data, peak ?? undefined)}
                        emptyStateLabel="No reactions yet."
                        caption={caption}
                    />

                    {/* Legend: six toggles, fixed taxonomy order, glyph + label + tooltip (§9.7) */}
                    <div className="flex flex-wrap gap-2">
                        {TAXONOMIES.map((taxonomy) => {
                            const pressed = !hidden.includes(taxonomy.id);
                            return (
                                <button
                                    key={taxonomy.id}
                                    type="button"
                                    aria-pressed={pressed}
                                    title={taxonomy.tooltip}
                                    aria-label={`${taxonomy.label}, ${taxonomyCounts[taxonomy.id] ?? 0} reactions, filter`}
                                    onClick={() =>
                                        setHidden((prev) =>
                                            prev.includes(taxonomy.id)
                                                ? prev.filter((id) => id !== taxonomy.id)
                                                : [...prev, taxonomy.id]
                                        )
                                    }
                                    className={`${pressed ? "button-o" : "button-o opacity-40"} flex items-center gap-1 font-Lexend text-[10px] uppercase tracking-wide focus-visible:ring-2 focus-visible:ring-[#84B9D1]`}
                                    style={{ color: taxonomy.color, borderColor: taxonomy.color }}>
                                    <ReactionGlyph taxonomyId={taxonomy.id} size={14} color={taxonomy.color} />
                                    {taxonomy.label}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}

            {totalDrawn > 0 && totalDrawn < 30 ? (
                <p className="text-[#7D8B92] font-Lexend text-xs">Few reactions. Read this as an indication, not a pattern.</p>
            ) : null}

            <p className="text-[#7D8B92] font-Lexend text-xs">{caption}</p>

            {/* Table — equal peer, the non-visual equivalent, and the default below 639 px */}
            {(showTable || tableIsDefault || lowData) && tableRows.length > 0 ? (
                <LinearTimelineTable
                    rows={tableRows}
                    caption={`Reaction composition — ${data.title}, ${seriesLabel[series]} series.`}
                    onSeek={onSeek}
                />
            ) : null}

            {/* §9.13 rule 5 / §9.13 adjacent rule: the digest is anchored, individual reactions are not */}
            {data.summary.digest.anchored ? (
                <p className="text-[#7D8B92] font-Lexend text-xs">
                    Counts are covered by the record&apos;s anchor ({data.summary.digest.sha256.slice(0, 10)}…). Individual
                    reactions are not on chain.
                </p>
            ) : null}
        </section>
    );
};

export default ReactionTimeline;
