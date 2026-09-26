/**
 * `LiveShell` — the block that makes the discourse page the place you watch, react and fund.
 *
 * Contract: `docs/ux/04-live-shell.md` in full — §1 (one frame, one rail), §2.2 (it mounts between
 * `DiscourseState` and `RosterStrip`), §3 (every runtime state), §4 (the funding line, which
 * borrows the page's `handleFund` rather than reimplementing it), §5 (the rail's mount) and §6
 * (embed hygiene). The rail's interior is `docs/ux/06`'s and lives in `ReactionRail`.
 *
 * The gates, in the order the design fixes them (§3.12 and D14). Each one renders `null` rather
 * than a guess, because a shell that guesses is worse than no shell:
 *
 *   1. `getDiscourseFormat(propId) != 1`     → legacy proposal, nothing at all
 *   2. the venue read failed, or `kind > 5`  → never guess a venue
 *   3. no session was ever scheduled         → the campaign page already says everything true
 *   4. the campaign was terminated           → `DiscourseState` carries that message
 *
 * WHAT THIS FILE DOES NOT DO. It mounts no dialog: `Fund` calls the page's existing `handleFund`,
 * which already branches for the connect gate and the wrong chain, and opens the page's single
 * `FundDiscourseDialog` (D8). It adds no player: the recording comes from `RecordingPane`, which
 * is the existing `react-hls-player` path. It renders no count of anything: the only numbers in
 * the shell are the session clock, the elapsed time and the funding line's own figures.
 *
 * THE PRESENCE SIGNAL. The shell never says "live" on the strength of a schedule (§3.1). Two
 * signals can confirm a session here, and neither is a guess: our own room is live when the
 * discussion record says the room is open and not ended (a first-party fact — the same predicate
 * the page already uses), and an externally hosted session is live only when a caller passes
 * `liveSignal`, which is the seam for the platform webhook or the host's "we are live" tap
 * (`docs/ux/04` §11.1 dependency 5). With no signal, a passed start renders `live-unconfirmed`,
 * which is the honest state and deliberately the pessimistic one.
 *
 * THE VENUE REFERENCE. The chain stores `keccak256(normaliseVenueRef(ref))` and never the string
 * (`docs/media/03` §7.3), so the frame's URL needs the off-chain reference. Until the indexer
 * supplies it the shell renders the venue's strip — the name in words, no link — rather than
 * guessing a channel from a hash.
 */

import { ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Sound } from "iconsax-react";
import { useQuery } from "@apollo/client";
import AppContext from "../utils/AppContext";
import {
    ATTEST_RECORD_MANIFEST,
    VENUE_AGORA_ROOM,
    VENUE_IRL,
    formatDuration,
    getVenueSpec,
} from "../../helper/AgoraHelper";
import { fundingDone } from "../../helper/DataHelper";
import { getFundTotal } from "../../helper/FundHelper";
import { formatDate, getTime, getTimeFromDate } from "../../helper/TimeHelper";
import { getCurrencyName } from "../../Constants";
import { GET_SESSIONS } from "../../lib/queries";
import { useAgoraAttestation, useAgoraVenue, useDiscourseFormat } from "../../web3/agora";
import { ArrowNE, ClockIcon, VerifyIcon } from "../utils/SvgHub";
import VenueFrame, { TemporalState, useOnline } from "./VenueFrame";
import ReactionRail from "./ReactionRail";
import RecordingPane from "./RecordingPane";
import { playbackForTemporal, venuePlaybackSpec } from "./venuePlayback";
import type { Discourse } from "../../lib/Types";

export interface LiveShellProps {
    propId: number | string | undefined;
    chainId: number | undefined;
    /** the discourse payload the page already holds; the shell reads it, it never re-queries it */
    discourse: Discourse | undefined;
    /** the page's existing funding gate — logged out, wrong chain, and the dialog all branch there */
    onFund: () => void;
    /** the page's existing connect state */
    onConnect?: () => void;
    /** the off-chain venue reference string (`docs/media/03` §7.3). `null` renders the strip. */
    venueRef?: string | null;
    /**
     * A confirmed presence signal for an externally hosted session. Absent, a passed start
     * renders `live-unconfirmed` and never `live`.
     */
    liveSignal?: { startedAt: number; reportedBy: string } | null;
    className?: string;
}

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

/** The session start, as an epoch in ms, from whichever field the record actually carries. */
export const sessionStartMs = (discourse: Discourse | undefined): number | null => {
    const raw = discourse?.discourse?.meet_date;
    if (!raw) {
        return null;
    }
    const parsed = Date.parse(raw);
    return Number.isNaN(parsed) ? null : parsed;
};

/** The temporal axis (`docs/ux/04` §3.1). `live` is only ever returned on a named signal. */
export const resolveTemporal = (
    discourse: Discourse | undefined,
    liveSignal: { startedAt: number; reportedBy: string } | null | undefined,
    now: number
): { temporal: TemporalState; startedAt: number | null; reportedBy: string | null } => {
    const scheduledAt = sessionStartMs(discourse);
    if (discourse?.discourse?.ended) {
        return { temporal: "ended", startedAt: scheduledAt, reportedBy: null };
    }
    if (scheduledAt === null) {
        return { temporal: "scheduled", startedAt: null, reportedBy: null };
    }
    if (scheduledAt > now) {
        return { temporal: "scheduled", startedAt: scheduledAt, reportedBy: null };
    }
    // Ours: the room is open and the discussion has not ended. That is a first-party fact.
    if (discourse?.discourse?.room_id) {
        return { temporal: "live", startedAt: scheduledAt, reportedBy: "our room" };
    }
    if (liveSignal) {
        return { temporal: "live", startedAt: liveSignal.startedAt, reportedBy: liveSignal.reportedBy };
    }
    return { temporal: "live-unconfirmed", startedAt: scheduledAt, reportedBy: null };
};

/** The funding window's close, from the same expression `fundingDone` uses. */
const fundingClosesAt = (discourse: Discourse | undefined): Date | null => {
    if (!discourse?.endTS) {
        return null;
    }
    return getTime(+discourse.endTS + 1468800);
};

const LiveShell = ({
    propId,
    chainId,
    discourse,
    onFund,
    onConnect,
    venueRef,
    liveSignal = null,
    className = "",
}: LiveShellProps) => {
    const { loggedIn } = useContext(AppContext);
    const { format } = useDiscourseFormat(propId);
    const { venue } = useAgoraVenue(propId);
    const manifest = useAgoraAttestation(propId, ATTEST_RECORD_MANIFEST, format === 1);

    const { data: sessionsData } = useQuery(GET_SESSIONS, {
        variables: { id: discourse?.id },
        skip: !discourse?.id,
    });

    const [now, setNow] = useState(() => Date.now());
    const online = useOnline();
    const [shellWidth, setShellWidth] = useState<number | null>(null);
    const [playheadMs, setPlayheadMs] = useState<number | null>(null);
    const shellRef = useRef<HTMLDivElement | null>(null);
    const playerRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        // Once a minute: the clock line is text and is never announced (`docs/ux/04` §7.2). The
        // reaction anchor does not depend on this — a tap is placed at pointer-down.
        const timer = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const node = shellRef.current;
        if (!node) {
            return;
        }
        const measure = () => setShellWidth(node.clientWidth);
        measure();
        if (typeof ResizeObserver === "undefined") {
            window.addEventListener("resize", measure);
            return () => window.removeEventListener("resize", measure);
        }
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    const resolved = useMemo(() => resolveTemporal(discourse, liveSignal, now), [discourse, liveSignal, now]);

    /** The off-chain reference, from the prop first and only then from the payload. */
    const ref = useMemo(() => {
        if (typeof venueRef === "string" && venueRef.trim().length > 0) {
            return venueRef;
        }
        const loose = discourse as any;
        const candidates = [loose?.venue_ref, loose?.venueRef, loose?.venue_reference];
        const found = candidates.find((value) => typeof value === "string" && value.trim().length > 0);
        return typeof found === "string" ? found : null;
    }, [venueRef, discourse]);

    const spec = useMemo(
        () => (venue ? playbackForTemporal(venuePlaybackSpec(venue.kind, ref), resolved.temporal) : null),
        [venue, ref, resolved.temporal]
    );

    const session = (sessionsData?.getSessions ?? [])[0] as
        | { recordingUrl?: string; recordingStatus?: string }
        | undefined;
    const hasRecording = Boolean(session?.recordingUrl) && session?.recordingStatus !== "waiting";

    const recordingAvailable = resolved.temporal === "ended" && hasRecording;

    /**
     * While a recording is playing, the moment is the player's own `currentTime` — the only mode
     * that may be presented without qualification (`docs/media/03` §5.2 rule 3). One second is
     * enough for a moment line; the anchor itself is read at pointer-down.
     */
    useEffect(() => {
        if (!recordingAvailable) {
            setPlayheadMs(null);
            return;
        }
        const timer = setInterval(() => {
            const position = playerRef.current?.currentTime;
            if (typeof position === "number" && Number.isFinite(position)) {
                setPlayheadMs(Math.round(position * 1000));
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [recordingAvailable]);

    // ---- The gates. Each one renders nothing rather than a guess.
    if (format !== 1 || !discourse || !propId) {
        return null;
    }
    if (!venue || venue.kind > VENUE_AGORA_ROOM) {
        // A venue we could not read is never guessed at: no block, because the page already says
        // everything that is true. (The operator's signal is the missing block itself.)
        return null;
    }
    if (discourse.status?.terminated) {
        return null;
    }
    if (sessionStartMs(discourse) === null && !discourse.discourse?.ended) {
        return null;
    }
    if (!spec) {
        return null;
    }

    const temporal = resolved.temporal;
    const venueLabel = getVenueSpec(venue.kind)?.label ?? spec.venueLabel;
    const isOurs = venue.kind === VENUE_AGORA_ROOM;

    // The frame column: at ≥ 900 px it is 60 % of the shell; if that would put it under the
    // venue's documented minimum, the frame takes the full shell width first and only renders a
    // strip if that is still too narrow (`docs/ux/04` §6.5/§7.5).
    const split = shellWidth !== null && shellWidth >= 900;
    const splitWidth = shellWidth === null ? null : Math.floor(shellWidth * 0.6);
    const splitTooNarrow = split && splitWidth !== null && spec.minWidth > 0 && splitWidth < spec.minWidth;
    const stacked = !split || splitTooNarrow;
    const frameWidth = shellWidth === null ? null : stacked ? shellWidth : (splitWidth as number);

    const startedAt = resolved.startedAt;

    // ---- Region R1/R2: the state line and the clock line.
    const stateLine = ((): { glyph: ReactNode; text: string; seconds: string | null } => {
        if (temporal === "scheduled") {
            const stamp =
                startedAt === null ? "" : `${formatDate(new Date(startedAt))}, ${getTimeFromDate(new Date(startedAt))}`;
            const under1h = startedAt !== null && startedAt - now < 60 * 60 * 1000;
            const under24h = startedAt !== null && startedAt - now < 24 * 60 * 60 * 1000;
            return {
                glyph: <ClockIcon size={16} />,
                text: under1h
                    ? `Starts in under an hour · ${stamp}`
                    : under24h
                    ? `Starts in under 24 hours · ${stamp}`
                    : `Scheduled for ${stamp}`,
                seconds: null,
            };
        }
        if (temporal === "live-unconfirmed") {
            return {
                glyph: <ClockIcon size={16} />,
                text: "The scheduled start has passed. This session is not confirmed live.",
                seconds:
                    startedAt === null
                        ? null
                        : `scheduled for ${formatDate(new Date(startedAt))}, ${getTimeFromDate(new Date(startedAt))}`,
            };
        }
        if (temporal === "live") {
            const elapsed =
                startedAt === null ? null : Math.max(0, (now - startedAt) / 1000);
            return {
                glyph: <Sound color="#12D8FA" size={18} variant="Bold" />,
                text:
                    venue.kind === VENUE_IRL
                        ? "Happening now · in person"
                        : `Live now · reported by ${resolved.reportedBy ?? venueLabel}`,
                seconds:
                    startedAt === null || elapsed === null
                        ? null
                        : `started ${getTimeFromDate(new Date(startedAt))} · ${formatDuration(elapsed)} elapsed`,
            };
        }
        const endedAt = startedAt === null ? null : `${formatDate(new Date(startedAt))}`;
        return {
            glyph: <VerifyIcon size={16} />,
            text: endedAt ? `Ended ${endedAt}` : "Ended",
            seconds: null,
        };
    })();

    // ---- Region R6: the funding line. One line, one optional action, never a second control at
    // ≤ 639 px, where `TopBar`'s fixed bottom bar already carries `Fund`.
    const total = getFundTotal(discourse.funds ?? []);
    const backers = (discourse.funds ?? []).length;
    const currency = getCurrencyName(chainId ?? discourse.chainId);
    const closed = fundingDone(discourse);
    const closesAt = fundingClosesAt(discourse);
    const closingSoon = closesAt !== null && !closed && closesAt.getTime() - now < 60 * 60 * 1000;
    const deadline = closesAt === null ? null : `${formatDate(closesAt)}, ${getTimeFromDate(closesAt)}`;
    const money = `${total.toFixed(3)} ${currency}`;
    const backersText = `${backers} backer${backers === 1 ? "" : "s"}`;
    const fundingDetail = closed
        ? `closed${deadline ? ` ${deadline}` : ""} · ${money} pledged by ${backersText}`
        : `${money} pledged by ${backersText} · ${
              closingSoon ? "closing in under an hour" : deadline ? `closes ${deadline}` : "no deadline published"
          }`;

    // ---- The frame's content. `native` is our own bytes; everything else is the venue's, or the
    // honest absence of both.
    const effectiveSpec = recordingAvailable ? { ...spec, mode: "native" as const } : spec;
    const frameTitle = recordingAvailable
        ? `Recording of ${discourse.title}`
        : isOurs
        ? `Agora room for ${discourse.title}`
        : `Live stream from ${venueLabel}`;
    const escapeLine = effectiveSpec.mode === "iframe" ? effectiveSpec.liveUrl : null;

    const liveMomentMs = startedAt === null ? null : Math.max(0, now - startedAt);
    /**
     * The moment a tap lands on (`docs/ux/04` §5.2). While live it is the session clock; while a
     * recording is mounted it is the player's own `currentTime`, which is the only mode that may
     * be presented without qualification. An ended session with NO player deliberately passes
     * `null` rather than `now − start`: after the session has ended that arithmetic produces an
     * ever-growing offset that places a reaction at a moment nobody is watching, and the rail's
     * rule is that an unplaceable reaction is refused before the tap, not after it.
     */
    const momentOffsetMs = recordingAvailable ? playheadMs : temporal === "live" ? liveMomentMs : null;
    // The reaction window opens at the session's end, so a live session has a closing date but not
    // a stated one: the rail only says "open until …" once the session has ended.
    const windowClosesAt =
        temporal === "ended" && startedAt !== null ? startedAt + TWO_WEEKS_MS : null;

    return (
        <section
            aria-labelledby="live-shell-h2"
            className={`bg-card rounded-xl p-4 sm:p-5 flex flex-col gap-4 ${className}`}>
            <h2
                id="live-shell-h2"
                className="font-Lexend font-semibold text-[10px] uppercase tracking-wide text-[#7D8B92]">
                session
            </h2>

            <div ref={shellRef} className={stacked ? "flex flex-col gap-4" : "flex flex-row gap-5"}>
                {/* R1–R4: what is happening, where, and whether it can be played here. */}
                <div className={stacked ? "flex flex-col gap-3" : "flex flex-col gap-3 flex-[0.6] min-w-0"}>
                    <p
                        role="status"
                        aria-live="polite"
                        className="flex items-center gap-2 font-Lexend text-xs text-[#E5F7FF] leading-5">
                        <span aria-hidden="true" className="shrink-0 flex items-center">
                            {stateLine.glyph}
                        </span>
                        <span>{stateLine.text}</span>
                    </p>

                    {stateLine.seconds ? (
                        <p className="font-Lexend text-xs text-[#7D8B92] leading-5">{stateLine.seconds}</p>
                    ) : null}

                    <VenueFrame
                        spec={effectiveSpec}
                        title={frameTitle}
                        width={frameWidth}
                        temporal={temporal}
                        online={online}
                        native={recordingAvailable ? <RecordingPane src={session?.recordingUrl as string} playerRef={playerRef} /> : undefined}
                        nativeFallback={
                            isOurs
                                ? {
                                      line:
                                          temporal === "live"
                                              ? "This room is open to participants and backers of this campaign."
                                              : temporal === "ended"
                                              ? "This room has ended."
                                              : "The room is not open yet.",
                                      reason:
                                          temporal === "live"
                                              ? "The room view is not mounted inside this page yet."
                                              : temporal === "ended"
                                              ? "The recording appears here when it is processed."
                                              : "It opens for participants at the scheduled time.",
                                      action:
                                          temporal === "live"
                                              ? { href: `/live/${propId}`, label: "Open the room" }
                                              : undefined,
                                  }
                                : undefined
                        }
                        note={
                            temporal === "ended" && effectiveSpec.mode === "iframe"
                                ? `Hosted on ${venueLabel}. Agora does not hold these bytes, so this video is not the record.`
                                : undefined
                        }
                    />

                    {/* R4 — a permanent standing offer under every mounted frame, never an error
                        state, because an iframe that fails reports nothing we can read (§3.10). */}
                    {escapeLine ? (
                        <p>
                            <a
                                href={escapeLine}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-Lexend text-xs text-[#7D8B92] underline flex items-center gap-1 w-max focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                                <span>{`Nothing showing? Watch on ${venueLabel}`}</span>
                                <ArrowNE color="#7D8B92" size={10} />
                            </a>
                        </p>
                    ) : null}
                </div>

                {/* R5–R6: the rail and the funding line. */}
                <div className={stacked ? "flex flex-col gap-3" : "flex flex-col gap-3 flex-[0.4] min-w-0 max-w-[400px]"}>
                    <ReactionRail
                        chainId={chainId ?? discourse.chainId}
                        propId={propId}
                        sessionStartedAt={startedAt}
                        venueKind={venue.kind}
                        venueLabel={venueLabel}
                        clock={spec.clock}
                        uncertaintyMs={spec.uncertaintyMs}
                        temporal={temporal}
                        momentOffsetMs={momentOffsetMs}
                        momentSource={recordingAvailable ? "recording" : "session"}
                        windowClosesAt={windowClosesAt}
                        online={online}
                        onConnect={onConnect}
                        recordHref={
                            manifest.attestation && !manifest.attestation.absent && !manifest.attestation.revoked
                                ? `/record/${propId}#reactions`
                                : null
                        }
                    />

                    <div className="w-full h-[1px] bg-[#1E1E1E]" />

                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <p className="font-Lexend text-xs text-[#c6c6c6] leading-5">
                            <span className="font-Lexend font-semibold text-[10px] uppercase tracking-wide text-[#7D8B92] mr-2">
                                funding
                            </span>
                            {fundingDetail}
                        </p>

                        {/* One funding control per viewport: `TopBar` owns the smallest screens
                            permanently, so the shell's action is tablet-and-up only (§4.3). */}
                        {!closed && loggedIn ? (
                            <button
                                type="button"
                                onClick={onFund}
                                className="hidden sm:flex items-center gap-2 bg-[#D2B4FC] rounded-2xl px-4 py-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                                <span className="text-xs font-Lexend text-black font-medium">Fund</span>
                            </button>
                        ) : null}

                        {!closed && !loggedIn ? (
                            <button
                                type="button"
                                onClick={onConnect}
                                className="button-o font-Lexend text-[10px] uppercase tracking-wide text-[#E5F7FF]">
                                Connect a wallet
                            </button>
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LiveShell;
