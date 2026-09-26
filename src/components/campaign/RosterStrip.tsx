/**
 * `RosterStrip` — the N-participant roster and the readiness line.
 * Contract: `docs/ux/01-campaign-flows.md` §5.2 (layout, the `{confirmed} of {N}` arithmetic,
 * the tick/wait pairing) and §10.2 (the avatar idiom it borrows from `DiscourseCard`).
 *
 * Why a new component: `DiscourseCard` hard-codes exactly two images and is explicitly not to be
 * rewritten, and the thread's two-speaker `SpeakerCard`/`speakers[i]` model cannot express a
 * roster. This component is a read: it renders nothing unless `getDiscourseFormat(propId) == 1`,
 * so a legacy proposal's page is untouched.
 *
 * Handles: the chain stores `keccak256(handle)` and never the plaintext (docs/eng/03 §3.2), so a
 * slot without an indexer-supplied handle shows its address, not an invented name. The optional
 * `handles` prop is the indexer's map, and nothing else changes when it arrives.
 */

import { useState } from "react";
import { ArrowDown2, ArrowUp2 } from "iconsax-react";
import { useAgoraParticipants, useDiscourseFormat } from "../../web3/agora";
import { ROLE_LABEL, RoleKey, shortHash } from "../../helper/AgoraHelper";
import { shortAddress } from "../../helper/StringHelper";
import { ClockIcon, VerifyIcon } from "../utils/SvgHub";

/** `ROLE_*` constant → display token. The inverse of `ROLE_CONSTANT` in AgoraHelper. */
const roleKeyFromConstant = (role: number): RoleKey => {
    switch (role) {
        case 0:
            return "speaker";
        case 1:
            return "moderator";
        case 2:
            return "panelist";
        case 3:
            return "host";
        case 4:
            return "guest";
        default:
            return "participant";
    }
};

const ZERO = "0x0000000000000000000000000000000000000000";

export interface RosterStripProps {
    propId: number | string;
    /** index → plaintext handle, when the indexer supplies one */
    handles?: Record<number, string>;
    className?: string;
}

export const RosterStrip = ({ propId, handles, className = "" }: RosterStripProps) => {
    const { format } = useDiscourseFormat(propId);
    const { participants, isLoading, isError } = useAgoraParticipants(propId, format === 1);
    const [open, setOpen] = useState(false);

    // A legacy proposal, an unreadable format, or a read error renders nothing: the legacy
    // page already carries the two-speaker information.
    if (format !== 1) {
        return null;
    }

    if (isLoading && participants.length === 0) {
        return (
            <div className={`bg-card rounded-xl p-4 flex flex-col gap-2 ${className}`}>
                <small className="text-[#7D8B92] font-Lexend font-semibold text-[10px] uppercase tracking-wide">
                    participants
                </small>
                <p className="text-[#7D8B92] font-Lexend text-xs">Reading the roster…</p>
            </div>
        );
    }

    if (isError || participants.length === 0) {
        return (
            <div className={`bg-card rounded-xl p-4 flex flex-col gap-2 ${className}`}>
                <small className="text-[#7D8B92] font-Lexend font-semibold text-[10px] uppercase tracking-wide">
                    participants
                </small>
                <p className="text-[#7D8B92] font-Lexend text-xs">
                    The roster could not be read from the chain right now. This is a read failure, not an empty roster.
                </p>
            </div>
        );
    }

    const confirmed = participants.filter((p) => p.confirmed).length;
    const total = participants.length;

    return (
        <div className={`bg-card rounded-xl p-4 flex flex-col gap-3 ${className}`}>
            <div className="flex items-center justify-between gap-3">
                <small className="text-[#7D8B92] font-Lexend font-semibold text-[10px] uppercase tracking-wide">
                    participants
                </small>
                <small className="text-[#E5F7FF] font-Lexend font-semibold text-[10px] uppercase tracking-wide">
                    {confirmed} of {total} confirmed
                </small>
            </div>

            {/* The overlapping-avatar idiom, but N-deep (docs/ux/01 §10.2) */}
            <div className="flex items-center gap-3">
                <div className="flex items-center">
                    {participants.slice(0, 8).map((participant, index) => (
                        <img
                            key={participant.index}
                            src={`https://avatar.tobi.sh/${participant.addr || `slot-${participant.index}`}`}
                            alt=""
                            className="w-8 h-8 rounded-xl object-cover border border-[#141414]"
                            style={{ marginLeft: index === 0 ? 0 : -10, zIndex: 8 - index }}
                        />
                    ))}
                    {participants.length > 8 ? (
                        <span className="font-Lexend text-xs text-[#7D8B92] ml-2">+{participants.length - 8}</span>
                    ) : null}
                </div>

                <button
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    aria-expanded={open}
                    className="button-o flex items-center gap-1 font-Lexend text-[10px] uppercase tracking-wide text-[#E5F7FF] focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                    {open ? "Hide the roster" : "Show the roster"}
                    {open ? <ArrowUp2 size={12} /> : <ArrowDown2 size={12} />}
                </button>
            </div>

            <ul className={`flex flex-col gap-2 ${open ? "" : "hidden sm:flex"}`}>
                {participants.map((participant) => {
                    const handle = handles?.[participant.index];
                    return (
                        <li key={participant.index} className="flex items-center gap-3 flex-wrap">
                            <span className="font-Lexend tabular-nums text-[10px] text-[#7D8B92] min-w-[16px]">
                                {participant.index + 1}
                            </span>
                            <span className="font-Lexend text-xs text-[#E5F7FF] min-w-[92px]">
                                {ROLE_LABEL[roleKeyFromConstant(participant.role)]}
                            </span>
                            <span className="font-Lexend text-xs text-[#E5F7FF]">
                                {handle
                                    ? handle.startsWith("@")
                                        ? handle
                                        : `@${handle}`
                                    : participant.addr && participant.addr !== ZERO
                                    ? shortAddress(participant.addr)
                                    : "wallet not linked yet"}
                            </span>
                            {!handle && participant.addr && participant.addr !== ZERO ? null : (
                                <span
                                    className="font-Lexend text-[10px] text-[#7D8B92]"
                                    title={participant.handleHash}>
                                    handle {shortHash(participant.handleHash)}
                                </span>
                            )}
                            <span className="flex items-center gap-1 ml-auto">
                                {participant.confirmed ? (
                                    <>
                                        <VerifyIcon size={14} />
                                        <span className="font-Lexend text-[10px] uppercase tracking-wide text-[#ABECD6]">
                                            confirmed
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <ClockIcon size={14} />
                                        <span className="font-Lexend text-[10px] uppercase tracking-wide text-[#7D8B92]">
                                            waiting
                                        </span>
                                    </>
                                )}
                            </span>
                        </li>
                    );
                })}
            </ul>

            <p className="text-[#7D8B92] font-Lexend text-xs">
                Slot order is the payout order and cannot change after creation.
            </p>
        </div>
    );
};

export default RosterStrip;
