/**
 * `RecordingPane` — our own recording, inline, on the page it belongs to.
 *
 * `docs/ux/05-recording-and-dashboard.md` §2.6 and `docs/ux/04-live-shell.md` §3.5: there is
 * exactly ONE playback path in this product and this adds none. `react-hls-player` is imported
 * the way `HLSPlayerDailog.tsx:5-8` imports it — dynamically, with SSR disabled — and the pane
 * exposes the same `RefObject<HTMLVideoElement>` contract that dialog already passes to it, so a
 * playhead, a timeline and a transcript can all drive the same element.
 *
 * `HLSPlayerDailog` itself is untouched: it stays the modal for `/watch`. This pane exists
 * because a modal cannot be scrolled beside a transcript and cannot hold a persistent playhead.
 *
 * The recording is never autoplayed with sound (§2.6): it mounts paused on every arrival,
 * including a deep link.
 */

import { RefObject, useRef } from "react";
import dynamic from "next/dynamic";

const ReactHlsPlayer = dynamic(() => import("react-hls-player"), { ssr: false });

export interface RecordingPaneProps {
    /** the HLS master for the session; the same value `GET_SESSIONS` already returns */
    src: string;
    /** the element the caller may seek — the whole coupling between the band and the video */
    playerRef?: RefObject<HTMLVideoElement>;
    className?: string;
}

export const RecordingPane = ({ src, playerRef, className = "" }: RecordingPaneProps) => {
    const localRef = useRef<HTMLVideoElement>(null);
    const ref = playerRef ?? localRef;

    return (
        <div className={`w-full h-full bg-[#0A0A0A] ${className}`}>
            <ReactHlsPlayer
                src={src}
                autoPlay={false}
                width="100%"
                height="100%"
                controls
                playerRef={ref}
            />
        </div>
    );
};

export default RecordingPane;
