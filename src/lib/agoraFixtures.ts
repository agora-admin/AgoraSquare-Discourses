/**
 * Typed fixtures for the reaction timeline.
 *
 * TODO(indexer): every export below is fixture data. The reaction service described in
 * `docs/ux/02` §9.14 supplies exactly these shapes and nothing here changes when it lands:
 * replace the `REACTION_TIMELINE_FIXTURE` import in `src/components/record/ReactionTimeline.tsx`
 * with the query result and the component is done. Until then the timeline is fed by this
 * module and every surface that renders it says so in its caption.
 *
 * The generator is deterministic (a linear congruential generator seeded with a constant), not
 * `Math.random`, so the server-rendered and client-rendered bands are byte-identical and Next
 * does not report a hydration mismatch.
 */

import { TaxonomyId } from "../helper/AgoraHelper";

export type ReactionSeries = "live" | "post";

/** Per-bucket, per-series counts for one taxonomy. Never pre-summed across series (§9.5). */
export type ReactionBucketCounts = Record<ReactionSeries, Partial<Record<TaxonomyId, number>>>;

export interface ReactionBucket {
    bucketIndex: number;
    /** offset into the session, in ms */
    startMs: number;
    /** bucket quality: the client hatches buckets below the low-n threshold (§9.14) */
    n: number;
    series: ReactionBucketCounts;
}

export interface ReactionLane {
    id: string;
    /** the diarized participant's display name */
    label: string;
    /** roster index, so a lane can be matched back to `getParticipants` */
    rosterIndex: number;
    buckets: ReactionBucket[];
}

export interface ReactionEvent {
    id: string;
    tOffsetMs: number;
    taxonomyId: TaxonomyId;
    speakerId: string;
    series: ReactionSeries;
    /** tombstones are part of the stream, never dropped (§9.14) */
    removed: boolean;
}

export interface ReactionDigest {
    sha256: string;
    /** true when the aggregate digest is covered by the record's anchor */
    anchored: boolean;
    anchoredAt: number;
}

export interface ReactionSummary {
    totalReactions: number;
    totalReactors: number;
    verifiedReactors: number;
    /** below 0.5 the band carries the unverified-participation banner (§9.14) */
    verifiedShare: number;
    lateArrival: number;
    reactionWindowDays: number;
    windowOpensAt: number;
    windowClosesAt: number;
    sealed: boolean;
    digest: ReactionDigest;
}

/**
 * The whole prop of `ReactionTimeline`. This is the indexer's response shape, verbatim.
 */
export interface ReactionTimelineData {
    propId: number;
    chainId: number;
    title: string;
    /** sessions are zero-indexed and a discourse may have several */
    sessionIndex: number;
    durationMs: number;
    /** the stored resolution is always 5 s; zooming re-buckets client-side (§9.4) */
    bucketMs: number;
    lanes: ReactionLane[];
    events: ReactionEvent[];
    summary: ReactionSummary;
}

// ---------------------------------------------------------------------------
// Deterministic generator — fixture only, deleted when the indexer lands
// ---------------------------------------------------------------------------

const lcg = (seed: number) => {
    let state = seed >>> 0;
    return () => {
        state = (state * 1664525 + 1013904223) >>> 0;
        return state / 0xffffffff;
    };
};

const BUCKET_MS = 5000;

/** Two lanes: one busy, one deliberately below the low-n threshold (§9.10 rule 5). */
const LANE_SPEC = [
    { id: "p0", label: "Prof. A. Example", rosterIndex: 0, reactions: 165 },
    { id: "p1", label: "B. Counterpoint", rosterIndex: 1, reactions: 6 },
];

const buildFixture = (): ReactionTimelineData => {
    const durationMs = 92 * 60 * 1000; // 1 h 32 m, the wireframe session in §9.2
    const bucketCount = Math.ceil(durationMs / BUCKET_MS);
    const rand = lcg(20260925);

    const lanes: ReactionLane[] = [];
    const allEvents: ReactionEvent[] = [];

    LANE_SPEC.forEach((spec, laneIndex) => {
        const perBucket: ReactionBucketCounts[] = Array.from({ length: bucketCount }, () => ({
            live: {},
            post: {},
        }));
        const nPerBucket: number[] = new Array(bucketCount).fill(0);

        for (let i = 0; i < spec.reactions; i += 1) {
            // Concentrate reactions in three windows so the band has shape, not noise.
            const window = i % 3;
            const centre = window === 0 ? 0.18 : window === 1 ? 0.52 : 0.82;
            const spread = 0.06;
            const offset = Math.min(
                bucketCount - 1,
                Math.max(0, Math.floor((centre + (rand() - 0.5) * spread) * bucketCount))
            );
            const taxonomyId = Math.floor(rand() * 6) as TaxonomyId;
            // The quiet lane is retrospective-only, which exercises the series control.
            const series: ReactionSeries = laneIndex === 1 ? "post" : rand() < 0.78 ? "live" : "post";

            const bucket = perBucket[offset];
            bucket[series][taxonomyId] = (bucket[series][taxonomyId] ?? 0) + 1;
            nPerBucket[offset] += 1;
            allEvents.push({
                id: `${spec.id}-${i}`,
                tOffsetMs: offset * BUCKET_MS + Math.floor(rand() * BUCKET_MS),
                taxonomyId,
                speakerId: spec.id,
                series,
                removed: false,
            });
        }

        lanes.push({
            id: spec.id,
            label: spec.label,
            rosterIndex: spec.rosterIndex,
            buckets: perBucket.map((series, bucketIndex) => ({
                bucketIndex,
                startMs: bucketIndex * BUCKET_MS,
                n: nPerBucket[bucketIndex],
                series,
            })),
        });
    });

    return {
        propId: 42,
        chainId: 137,
        title: "US pharmaceutical pricing and the IRA",
        sessionIndex: 0,
        durationMs,
        bucketMs: BUCKET_MS,
        lanes,
        events: allEvents,
        summary: {
            totalReactions: LANE_SPEC.reduce((sum, lane) => sum + lane.reactions, 0),
            totalReactors: 41,
            verifiedReactors: 18,
            // Deliberately below 0.5 so the unverified-participation banner renders and is
            // reviewed rather than discovered later.
            verifiedShare: 18 / 41,
            lateArrival: 9,
            reactionWindowDays: 14,
            windowOpensAt: 1759500000,
            windowClosesAt: 1759500000 + 14 * 24 * 60 * 60,
            sealed: false,
            digest: {
                sha256: "0x8c21f09d7b44c1e3a59c2f7e1b0d4a86c0f9e5b2d17a34c6b8e0f1a2d3c4b5a69",
                anchored: true,
                anchoredAt: 1759584000,
            },
        },
    };
};

export const REACTION_TIMELINE_FIXTURE: ReactionTimelineData = buildFixture();

/**
 * The individual-reaction list used below the low-data threshold (§9.10 rule 2), derived from
 * the same events. Kept here so the swap to the indexer covers both renderings.
 */
export const reactionEventsFor = (data: ReactionTimelineData): ReactionEvent[] =>
    data.lanes.flatMap((lane) =>
        lane.buckets.flatMap((bucket) =>
            (["live", "post"] as ReactionSeries[]).flatMap((series) =>
                Object.entries(bucket.series[series]).flatMap(([taxonomyId, count]) =>
                    Array.from({ length: count ?? 0 }, (_, i) => ({
                        id: `${lane.id}-${bucket.bucketIndex}-${series}-${taxonomyId}-${i}`,
                        tOffsetMs: bucket.startMs + (i * BUCKET_MS) / Math.max(1, count ?? 1),
                        taxonomyId: Number(taxonomyId) as TaxonomyId,
                        speakerId: lane.id,
                        series,
                        removed: false,
                    }))
                )
            )
        )
    );
