/**
 * `ReactionRail` — the six fixed taxonomies as six buttons, bound to one moment.
 *
 * Contract: `docs/ux/06-reaction-shell.md` §2 (the tap surface), §3 (the live moment, the three
 * pool states, corroboration), §6.4 (the anchor-state table) and §7.2 (every flux state's copy);
 * mounted by `docs/ux/04-live-shell.md` §5 as the shell's region R5.
 *
 * THE HONESTY RULES, WHICH ARE THE WHOLE POINT OF THIS COMPONENT:
 *  1. **No count, no tally, no band, no percentage, no ranking — in any state, at any width, in
 *     any accessible name** (`docs/ux/02` §9.13 rule 1). This file reads the summary for exactly
 *     two things: the pool state (empty / thin / normal) and nothing else. It never renders a
 *     number, and it never hands one to `aria-*`.
 *  2. **A tap confirms on the reader's own chip only** (rule 2 of §9.13 and §3.3). Pressed state,
 *     a bounded scale on the pressed glyph, and — where the frozen service contract supports it —
 *     the corroboration word. Nothing arrives that the reader did not ask for.
 *  3. **A thin pool renders no signal** (§3.2). Below 10 reactions the rail behaves normally and
 *     says so once, in one sentence, with no placeholder for the absent signal.
 *  4. **No motion on an incoming reaction.** The only motion is the reader's own 400 ms scale.
 *  5. **Buttons are removed from the DOM when they cannot act**, never disabled-with-no-reason:
 *     a disabled button invites a tap (§A.8.5).
 *
 * TWO DELIBERATE LIMITS, both because the frozen service contract carries less than §3.3 wants:
 *  - **No corroboration word.** "also marked" requires, per 5 s bucket and taxonomy, the count of
 *    DISTINCT reactors besides the reader (`GET …/:chainId/:propId` returns `counts: number[6]`
 *    only). A count of reactions is not a count of reactors, so rendering the word from it would
 *    be a fabricated signal. §3.3 bound 5 also floors it at 3 distinct reactors; we cannot check
 *    that floor. Absent, not approximated.
 *  - **Toggle-off is device-local once a batch has been sent.** The POST body has no tombstone
 *    field, so a reaction already accepted by the service cannot be removed through the contract.
 *    The chip clears and one muted sentence says so, rather than implying a deletion that did not
 *    happen.
 */

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { v4 as uuid } from "uuid";
import AppContext from "../utils/AppContext";
import { ToastTypes } from "../../lib/Types";
import { TAXONOMIES, TaxonomyId, formatClock } from "../../helper/AgoraHelper";
import ReactionGlyph from "../record/ReactionGlyph";
import {
    AnchorSync,
    ReactionWriteState,
    bucketIndexFor,
    poolStateOf,
    useReactionSubmit,
    useReactionSummary,
} from "../../lib/reactions";
import type { TemporalState } from "./VenueFrame";

export interface ReactionRailProps {
    chainId: number;
    propId: number | string;
    /** epoch ms of the session start: the anchor every tap is measured from */
    sessionStartedAt: number | null;
    /** `VENUE_*` kind */
    venueKind: number;
    venueLabel: string;
    /** the venue's clock quality and half-width, straight from the playback spec */
    clock: AnchorSync | "none";
    uncertaintyMs: number;
    temporal: TemporalState;
    /** the moment a tap will land on: the session clock while live, the playhead in a recording */
    momentOffsetMs: number | null;
    /** only changes the moment line's words — the anchor is the same either way */
    momentSource: "session" | "recording";
    /** the reaction window's close, when it is known */
    windowClosesAt: number | null;
    online: boolean;
    /** opens the page's existing connect gate; the rail renders no dialog of its own */
    onConnect?: () => void;
    /** the record's `#reactions` anchor, rendered only when a record exists (§5.4) */
    recordHref?: string | null;
    className?: string;
}

const OPEN_STATES: TemporalState[] = ["live", "ended"];

/** `At 00:42:11 in the session.` — hours appear only when there are hours. */
const formatMoment = (offsetMs: number): string => {
    const seconds = Math.max(0, Math.floor(offsetMs / 1000));
    const hours = Math.floor(seconds / 3600);
    const rest = formatClock(seconds % 3600);
    if (hours === 0) {
        return rest.length < 5 ? `0${rest}` : rest;
    }
    return `${hours}:${rest.length < 5 ? `0${rest}` : rest}`;
};

const formatWindowDate = (ms: number): string => {
    const date = new Date(ms);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export const ReactionRail = ({
    chainId,
    propId,
    sessionStartedAt,
    venueKind,
    venueLabel,
    clock,
    uncertaintyMs,
    temporal,
    momentOffsetMs,
    momentSource,
    windowClosesAt,
    online,
    onConnect,
    recordHref,
    className = "",
}: ReactionRailProps) => {
    const { loggedIn, walletAddress, addToast } = useContext(AppContext);

    const active = sessionStartedAt !== null && OPEN_STATES.includes(temporal);
    const windowClosed = windowClosesAt !== null && Date.now() > windowClosesAt;

    const summary = useReactionSummary(chainId, propId, { enabled: active, pollMs: temporal === "live" ? 15000 : 0 });
    const submit = useReactionSubmit(chainId, propId, sessionStartedAt ?? 0, venueKind, { actor: walletAddress });

    /** One entry per pressed (bucket, taxonomy): the key is what a toggle matches on. */
    const [pressed, setPressed] = useState<Record<string, string>>({});
    const [notice, setNotice] = useState<string | null>(null);
    const lastWriteState = useRef<ReactionWriteState>("idle");

    /** A refusal is a sentence on the status line and one toast — the reader is looking at the
     *  button, so a toast is correct here and only here (§7.2). */
    useEffect(() => {
        if (submit.writeState === "refused" && lastWriteState.current !== "refused") {
            addToast({
                title: "Error!",
                body: submit.sentence ?? "Your reaction was not saved. Try again.",
                type: ToastTypes.error,
                duration: 6000,
                id: uuid(),
            });
        }
        lastWriteState.current = submit.writeState;
    }, [submit.writeState, submit.sentence, addToast]);

    useEffect(() => {
        if (submit.sentence) {
            setNotice(submit.sentence);
        }
    }, [submit.sentence]);

    const pool = poolStateOf(summary.summary);
    const bucket = momentOffsetMs === null ? null : bucketIndexFor(momentOffsetMs);

    const distinctInBucket = useMemo(() => {
        if (bucket === null) {
            return 0;
        }
        return Object.keys(pressed).filter((key) => key.startsWith(`${bucket}:`)).length;
    }, [pressed, bucket]);

    const capReached = distinctInBucket >= 3;

    /**
     * The tap. `tapMs` is captured at pointer-down by the caller and never re-read at send time,
     * so network latency cannot move a reaction on the timeline — that is the design point that
     * makes a live tap and a retrospective one the same event shape.
     */
    const register = useCallback(
        (taxonomyId: TaxonomyId, tapMs: number) => {
            if (!active || bucket === null) {
                return;
            }
            if (!loggedIn) {
                onConnect?.();
                return;
            }
            const key = `${bucket}:${taxonomyId}`;
            setNotice(null);

            if (pressed[key]) {
                // Second tap in the same bucket: the chip clears. While the event is still in the
                // batch window nothing was sent, so this is exactly what the reader sees.
                submit.untap(pressed[key]);
                setPressed((prev) => {
                    const next = { ...prev };
                    delete next[key];
                    return next;
                });
                return;
            }

            if (capReached) {
                setNotice("Up to 3 reactions per moment.");
                return;
            }

            const eventId = submit.tap(taxonomyId, tapMs);
            setPressed((prev) => ({ ...prev, [key]: eventId }));
        },
        [active, bucket, loggedIn, onConnect, pressed, capReached, submit]
    );

    const onPointerDown = (taxonomyId: TaxonomyId) => (event: ReactPointerEvent<HTMLButtonElement>) => {
        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }
        register(taxonomyId, Date.now());
    };

    /** Keyboard activation fires a click with `detail === 0`; a pointer click is captured above. */
    const onClick = (taxonomyId: TaxonomyId) => (event: ReactMouseEvent<HTMLButtonElement>) => {
        if (event.detail === 0) {
            register(taxonomyId, Date.now());
        }
    };

    const momentLine =
        momentOffsetMs === null
            ? null
            : momentSource === "recording"
            ? `At ${formatMoment(momentOffsetMs)} in the recording.`
            : `At ${formatMoment(momentOffsetMs)} in the session.`;

    const uncertaintyCaption =
        clock === "estimated"
            ? `Times are approximate (±${Math.round((uncertaintyMs || 10000) / 1000)} s) — this venue gives us no clock to measure against.`
            : clock === "measured"
            ? "Times are placed from the venue's own player clock."
            : null;

    /** The rail's own status sentence, in the fixed vocabulary of §3.2 and §2.9. */
    const statusLine = ((): string => {
        if (!online) {
            return "You are offline. Reactions are not sent while you are offline.";
        }
        if (windowClosed) {
            return `The reaction window closed on ${formatWindowDate(windowClosesAt ?? 0)}.`;
        }
        if (temporal === "scheduled") {
            return "Reactions open when the session starts.";
        }
        if (temporal === "live-unconfirmed") {
            return "Reactions open when the session is confirmed live.";
        }
        if (clock === "none") {
            return "Reactions open when the recording is published. This venue has no player, so there is no moment to react to yet.";
        }
        if (temporal === "ended" && momentOffsetMs === null) {
            // No player and no live clock: there is no moment a tap could be placed at, and an
            // unplaceable reaction is refused before the tap rather than after it (§4.5).
            return "The session has ended. The timeline appears when the record is published.";
        }
        if (!loggedIn) {
            return "Connect a wallet to react. Reactions are counted once per wallet, with no weighting by pledge amount.";
        }
        if (submit.writeState === "offline" || submit.writeState === "service-unreachable") {
            return "Kept on this device. Will be sent when you are back.";
        }
        if (pool === "empty") {
            return "No reactions yet.";
        }
        if (pool === "thin") {
            return "Fewer than 10 reactions so far. Nothing is shown as a signal yet.";
        }
        return momentSource === "recording"
            ? "Reactions placed while watching the recording are counted as retrospective."
            : "Reactions are being recorded. Nothing is shown until the session ends.";
    })();

    // Buttons are removed from the DOM — never rendered disabled — when they cannot act (§5.3).
    const buttonsRendered =
        active && !windowClosed && clock !== "none" && momentOffsetMs !== null;

    return (
        <div className={`flex flex-col gap-3 ${className}`} role="group" aria-label="React to this moment">
            <small className="text-[#7D8B92] font-Lexend font-semibold text-[10px] uppercase tracking-wide">
                {momentSource === "recording" ? "React to a moment" : "React to this moment"}
            </small>

            {momentLine ? (
                <p role="status" aria-live="polite" className="font-Lexend text-xs text-[#E5F7FF] leading-5">
                    {momentLine}
                </p>
            ) : null}

            {buttonsRendered ? (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {TAXONOMIES.map((taxonomy) => {
                            const key = bucket === null ? "" : `${bucket}:${taxonomy.id}`;
                            const isPressed = Boolean(pressed[key]);
                            const unavailable = capReached && !isPressed;
                            return (
                                <button
                                    key={taxonomy.id}
                                    type="button"
                                    // A chip is a toggle, not a selection: `aria-pressed` carries the
                                    // state and the group is not a radiogroup (§2.5).
                                    aria-pressed={isPressed}
                                    aria-disabled={unavailable || !online}
                                    // The accessible name is the label PLUS the tooltip: `Off-topic`
                                    // alone is not self-describing (§7.2).
                                    aria-label={`${taxonomy.label}. ${taxonomy.tooltip}`}
                                    title={taxonomy.tooltip}
                                    disabled={!online}
                                    onPointerDown={onPointerDown(taxonomy.id)}
                                    onClick={onClick(taxonomy.id)}
                                    className={`${
                                        isPressed ? "button-i-f-e" : unavailable ? "button-i-d" : "button-i-f"
                                    } min-h-[44px] min-w-[44px] flex flex-col items-center justify-center gap-1 px-1 py-2 focus-visible:ring-2 focus-visible:ring-[#84B9D1] t-all-100 ${
                                        !online ? "opacity-50" : ""
                                    }`}>
                                    <span
                                        className={`t-all-100 ${isPressed ? "scale-[1.08]" : "scale-100"}`}
                                        aria-hidden="true">
                                        <ReactionGlyph
                                            taxonomyId={taxonomy.id}
                                            size={18}
                                            color={taxonomy.color}
                                        />
                                    </span>
                                    <span className="font-Lexend text-[11px] leading-4 text-[#E5F7FF] text-center">
                                        {taxonomy.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <p className="font-Lexend text-xs text-[#7D8B92] leading-5">
                        {capReached ? "Up to 3 reactions per moment." : "Up to 3 reactions per moment. One per type."}
                    </p>
                </>
            ) : null}

            {momentLine && uncertaintyCaption && buttonsRendered ? (
                <p className="font-Lexend text-xs text-[#7D8B92] leading-5">{uncertaintyCaption}</p>
            ) : null}

            <p role="status" aria-live="polite" className="font-Lexend text-xs text-[#c6c6c6] leading-5">
                {statusLine}
            </p>

            {notice ? <p className="font-Lexend text-xs text-[#FBED96] leading-5">{notice}</p> : null}

            {submit.source === "local" ? (
                <p className="font-Lexend text-xs text-[#7D8B92] leading-5">
                    No reaction service is connected on this deployment. Your reactions are kept in this browser
                    only — they are not sent anywhere and nobody else can see them.
                </p>
            ) : null}

            {windowClosesAt !== null && !windowClosed && buttonsRendered ? (
                <p className="font-Lexend text-xs text-[#7D8B92] leading-5">
                    {`Reactions are open until ${formatWindowDate(windowClosesAt)}.`}
                </p>
            ) : null}

            {recordHref ? (
                <a
                    href={recordHref}
                    className="button-t w-max font-Lexend text-xs text-[#E5F7FF] underline focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                    See the reactions on the record
                </a>
            ) : null}
        </div>
    );
};

export default ReactionRail;
