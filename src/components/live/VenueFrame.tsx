/**
 * `VenueFrame` — the one frame in the product (`docs/ux/04-live-shell.md` §1.1, D3).
 *
 * Contract: `docs/ux/04` §1.3 (the venue decides the content), §3 (every runtime state),
 * §6.2–6.6 (embed hygiene, the proximity mount, the mobile reality), §7 (accessibility) and
 * §9.5–9.6 (the copy deck for what a viewer reads instead of a frame).
 *
 * THE ONE RULE THIS COMPONENT EXISTS TO KEEP (D2):
 * **a box in this component is never empty.** The frame is either a `box` — a 16:9 area holding a
 * player or a poster for one that can be loaded — or a `strip`, which is a text block the height
 * of its content. There is no third shape, and there is no state in which a 16:9 area is rendered
 * without something in it: no spinner inside a 16:9 area, no skeleton shaped like a player, no
 * black rectangle standing in for video.
 *
 * WHAT IS NEVER DONE TO A THIRD-PARTY FRAME (§6.6): nothing is drawn over it, its pixels are never
 * read, its script is never injected, it is never reloaded on a timer, and none of its controls
 * (play, mute, seek, fullscreen) is reimplemented here. `autoplay` is off; play is the platform's
 * own control, one tap (D5).
 *
 * Because a cross-origin iframe that is blocked, refused or broken reports nothing to us (§3.10),
 * the frame carries no error state for those cases. The shell renders a permanent one-line escape
 * hatch beneath every mounted frame instead — that is `LiveShell`'s region R4, not this file's.
 */

import { ReactNode, useEffect, useRef, useState } from "react";
import { ArrowNE, IRLIcon, VirtualIcon } from "../utils/SvgHub";
import { VENUE_AGORA_ROOM, VENUE_IRL, VENUE_KICK, VENUE_TWITCH, VENUE_X_SPACES } from "../../helper/AgoraHelper";
import {
    COMPACT_MAX_WIDTH,
    STRIP_REASON,
    VenuePlaybackSpec,
    frameWidthAllows,
} from "./venuePlayback";

export type TemporalState = "scheduled" | "live" | "live-unconfirmed" | "ended";

export interface VenueFrameProps {
    spec: VenuePlaybackSpec;
    /** the frame's accessible name — a real description, never the venue's name alone (§7.2) */
    title: string;
    /**
     * The measured width of the frame's own column, or `null` before the browser has measured it.
     * `null` is the server render and the first client render, and it never mounts an iframe: a
     * width we have not measured cannot be asserted to satisfy the platform's minimum, and
     * guessing it is how a 393 px Twitch embed happens.
     */
    width: number | null;
    temporal: TemporalState;
    /** false mounts nothing and says so: the stream is not reachable, so we do not pretend */
    online: boolean;
    /** the `native` branch's content — our own room view, or our own recording player */
    native?: ReactNode;
    /**
     * What the `native` branch renders when it has no content: the room lane owns the room view
     * (`docs/ux/04` §11.1 dependency 8), so until it mounts, the frame states the room's real
     * state and points at the route that does hold it. Never an empty player box.
     */
    nativeFallback?: { line: string; reason: string; action?: { href: string; label: string } };
    /** one sentence under the frame's content, e.g. the externally-hosted note (§3.6) */
    note?: string;
    className?: string;
}

/**
 * The proximity mount (§6.2, D11): a live or recorded frame mounts when the shell comes within
 * 200 px of the viewport, so a viewer who never scrolls here makes zero third-party requests.
 * There is no click-to-load facade — the proximity rule already means we only pay for what is
 * about to be seen, and a facade would add a second tap and a second loading state.
 */
const useApproaching = (marginPx = 200) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [approaching, setApproaching] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node || typeof IntersectionObserver === "undefined") {
            // Without an observer the honest default is to mount: the alternative is a poster
            // that never becomes a player.
            setApproaching(true);
            return;
        }
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setApproaching(true);
                        observer.disconnect();
                    }
                });
            },
            { rootMargin: `${marginPx}px` }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [marginPx]);

    return { ref, approaching };
};

/**
 * The frame's own view of the connection. A device that is offline cannot show a stream, and the
 * honest answer is a sentence rather than an iframe that fails silently (`docs/ux/04` §3.10).
 */
export const useOnline = (): boolean => {
    const [online, setOnline] = useState(true);

    useEffect(() => {
        const update = () => setOnline(typeof navigator === "undefined" ? true : navigator.onLine);
        update();
        window.addEventListener("online", update);
        window.addEventListener("offline", update);
        return () => {
            window.removeEventListener("online", update);
            window.removeEventListener("offline", update);
        };
    }, []);

    return online;
};

/**
 * The venue mark, always `aria-hidden`: the venue's NAME is in the sentence beside it, always
 * (§7.2/§7.3 — no boundary and no mark is ever the carrier of meaning).
 *
 * External venues get no mark here. `SvgHub` has no Kick/Twitch/X/YouTube export yet (`docs/ux/01`
 * §11.4 specifies them; they do not exist), and drawing a platform's logo in this file would be a
 * brand claim this file has no business making. The sentence carries the venue instead.
 */
const VenueMark = ({ spec }: { spec: VenuePlaybackSpec }) => {
    if (spec.kind === VENUE_IRL) {
        return <IRLIcon size={20} />;
    }
    if (spec.kind === VENUE_AGORA_ROOM) {
        return <VirtualIcon size={20} />;
    }
    return <span aria-hidden="true" className="block w-2 h-2 rounded-full bg-[#7D8B92] mt-2" />;
};

/** The strip: a bordered text block, content height, at most one action (§1.1). */
const Strip = ({
    spec,
    line,
    reason,
    action,
}: {
    spec: VenuePlaybackSpec;
    /** the first sentence: what is or is not there, in the venue's name */
    line: string;
    reason: string;
    /** an optional action that replaces the venue's own link out (the room, for the native case) */
    action?: { href: string; label: string };
}) => {
    const link = action ?? (spec.liveUrl ? { href: spec.liveUrl, label: linkLabel(spec) } : null);
    return (
        <div className="flex flex-col gap-2 bg-[#141414] border border-[#212427] rounded-2xl p-3">
            <div className="flex items-start gap-3">
                <span aria-hidden="true" className="shrink-0 flex items-center">
                    <VenueMark spec={spec} />
                </span>
                <div className="flex flex-col gap-1 min-w-0">
                    <p className="font-Lexend text-xs text-[#E5F7FF] leading-5">{line}</p>
                    <p className="font-Lexend text-xs text-[#c6c6c6] leading-5">{reason}</p>
                </div>
            </div>

            {link ? (
                <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-o w-max flex items-center gap-2 font-Lexend text-xs text-[#E5F7FF] focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                    <span>{link.label}</span>
                    <ArrowNE color="#E5F7FF" size={10} />
                </a>
            ) : spec.linkExpected ? (
                // The copy deck's sentence for an unreadable reference, and ONLY where a reference
                // is a real expectation: an in-person session has no link to be missing.
                <p className="font-Lexend text-xs text-[#7D8B92]">
                    The venue link has not been published for this session.
                </p>
            ) : null}
        </div>
    );
};

/** `Open in X` for a Space, `Watch on …` everywhere a player exists (§9.6). */
const linkLabel = (spec: VenuePlaybackSpec): string =>
    spec.kind === VENUE_X_SPACES ? "Open in X" : `Watch on ${spec.venueLabel}`;

/** The poster: the same 16:9 area, a venue mark and one real statement. Never a spinner. */
const Poster = ({ spec }: { spec: VenuePlaybackSpec }) => (
    <div className="w-full aspect-video bg-[#141414] border border-[#212427] rounded-xl flex items-center justify-center">
        <div className="flex items-center gap-3">
            <VenueMark spec={spec} />
            {/* `aria-hidden` because the statement is also rendered as real text in the sentence
                above the box; a decorative area is not an accessible name. */}
            <span aria-hidden="true" className="font-Lexend text-xs text-[#7D8B92]">
                {`Streaming from ${spec.venueLabel}.`}
            </span>
        </div>
    </div>
);

export const VenueFrame = ({
    spec,
    title,
    width,
    temporal,
    online,
    native,
    nativeFallback,
    note,
    className = "",
}: VenueFrameProps) => {
    const { ref, approaching } = useApproaching();

    const noteLine = note ? <p className="font-Lexend text-xs text-[#7D8B92] leading-5">{note}</p> : null;

    if (!online) {
        return (
            <div ref={ref} className={`flex flex-col gap-2 ${className}`}>
                <Strip spec={spec} line={`Streaming from ${spec.venueLabel}.`} reason={STRIP_REASON.offline} />
            </div>
        );
    }

    // ---- native: our own room, or our own recording. No iframe, no minimum width, no parent.
    if (spec.mode === "native") {
        return (
            <div ref={ref} className={`flex flex-col gap-2 ${className}`}>
                {native ? (
                    <div className="w-full aspect-video bg-[#141414] border border-[#212427] rounded-xl overflow-hidden">
                        {native}
                    </div>
                ) : (
                    <Strip
                        spec={spec}
                        line={nativeFallback?.line ?? `The ${spec.venueLabel.toLowerCase()} is not open here yet.`}
                        reason={
                            nativeFallback?.reason ??
                            (temporal === "ended"
                                ? STRIP_REASON.roomProcessing
                                : "The room opens for participants at the scheduled time.")
                        }
                        action={nativeFallback?.action}
                    />
                )}
                {noteLine}
            </div>
        );
    }

    // ---- strip: nothing to play, or nothing we are willing to mount. Never a video-shaped box.
    if (spec.mode === "strip") {
        const line =
            temporal === "ended"
                ? `This discussion took place on ${spec.venueLabel}.`
                : `Streaming from ${spec.venueLabel}.`;
        return (
            <div ref={ref} className={`flex flex-col gap-2 ${className}`}>
                <Strip
                    spec={spec}
                    line={spec.kind === VENUE_IRL && temporal === "ended" ? "This session took place in person." : line}
                    reason={spec.reason ?? STRIP_REASON.endedNoCopy}
                />
                {noteLine}
            </div>
        );
    }

    // ---- iframe. Each gate below refuses the mount rather than rendering a blank frame.
    const narrow = width !== null && width <= COMPACT_MAX_WIDTH;
    const allowed = width !== null && frameWidthAllows(spec, width);

    if (width === null) {
        // Not measured yet. A strip, not a poster: we cannot yet claim a frame is imminent, and
        // on a 393 px viewport a Twitch frame never is (a poster there would be the lie D2 stops).
        return (
            <div ref={ref} className={`flex flex-col gap-2 ${className}`}>
                <Strip
                    spec={spec}
                    line={`Streaming from ${spec.venueLabel}.`}
                    reason={
                        temporal === "ended"
                            ? "The recording is hosted on this venue."
                            : "The player opens here when the session starts."
                    }
                />
                {noteLine}
            </div>
        );
    }

    if (!allowed) {
        const narrowReason =
            narrow && spec.kind === VENUE_TWITCH
                ? STRIP_REASON.narrowTwitch
                : narrow && spec.kind === VENUE_KICK
                ? STRIP_REASON.narrowKick
                : spec.reason ?? STRIP_REASON.endedNoCopy;
        return (
            <div ref={ref} className={`flex flex-col gap-2 ${className}`}>
                <Strip spec={spec} line={`Streaming from ${spec.venueLabel}.`} reason={narrowReason} />
                {noteLine}
            </div>
        );
    }

    if (!approaching) {
        // The state is resolved, the venue is embeddable, and the only missing input is
        // proximity. The poster says where the stream is; it is not a spinner and not a lie.
        return (
            <div ref={ref} className={`flex flex-col gap-2 ${className}`}>
                <Poster spec={spec} />
                {noteLine}
            </div>
        );
    }

    return (
        <div ref={ref} className={`flex flex-col gap-2 ${className}`}>
            <div className="w-full aspect-video bg-[#141414] border border-[#212427] rounded-xl overflow-hidden">
                <iframe
                    src={spec.url}
                    title={title}
                    className="w-full h-full"
                    // Fullscreen is the platform's own control and the viewer's escape from a
                    // small frame. It is present in every venue and never replaced by a wrapper.
                    allowFullScreen
                    // Only what a player needs. A broad `allow="*"` on a third-party frame is an
                    // unnecessary grant.
                    allow="autoplay; fullscreen; picture-in-picture"
                    // A second net under the proximity rule; the proximity rule is the primary one.
                    loading="lazy"
                    // No `sandbox`: a sandbox that breaks the platform's player produces exactly
                    // the blank frame the honesty rules exist to prevent.
                />
            </div>
            {noteLine}
        </div>
    );
};

export default VenueFrame;
