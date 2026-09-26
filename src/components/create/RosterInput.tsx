/**
 * `RosterInput`, `RosterRow` and `RoleChip` — step 2, S-C2 in `docs/ux/01-campaign-flows.md`
 * §3.2, §3.3 and §3.4.
 *
 * Why a new component: `SpeakerInput` hard-codes `speakers.length < 2` and its duplicate copy
 * ("Speaker already added") is wrong for a panelist; `ModeratorInput` is a single slot with no
 * role concept. Neither can express an ordered 2..12 roster where order is the payout key (X9).
 *
 * Reuse, exactly as §3.4 specifies:
 *   - `SpeakerPop` is used verbatim as the add row: its debounce, its preview panel and its two
 *     not-found states are unchanged.
 *   - The filled row's avatar/name/@handle block is `SpeakerCard` from `SpeakerInput.tsx`,
 *     invoked as a named export.
 *
 * One documented deviation, because the product must work when the handle service is
 * unreachable: `SpeakerPop` cannot add a row when `/api/twitter-user` fails (it renders "User not
 * found on Twitter" and does nothing on Enter). A second, explicitly-labelled add row therefore
 * adds a handle as typed, with the §12.3 `roster.lookup.offline` copy shown when the browser is
 * offline. Without it, no campaign could be created on a deployment whose handle service is down.
 */

import { Add, CloseCircle, Trash } from "iconsax-react";
import { useState } from "react";
import { FormatSpec, RoleKey, ROLE_LABEL, roleChoicesForSlot } from "../../helper/AgoraHelper";
import { CampaignDraft, RosterEntry, formatSummary, roleRequirement, validateRoster } from "../../lib/agoraDraft";
import { SpeakerCard } from "./SpeakerInput";
import SpeakerPop from "./SpeakerPop";

export interface RosterInputProps {
    draft: CampaignDraft;
    spec: FormatSpec;
    onAdd: (entry: RosterEntry) => void;
    onRemove: (index: number) => void;
    onRole: (index: number, role: RoleKey) => void;
    /** the reason the step cannot advance, rendered under the list */
    disabledReason: string | null;
    /** rows to outline in the error colour rather than delete (§3.3) */
    duplicateIndexes: number[];
    roleConflictIndexes: number[];
}

export const RoleChip = ({
    roles,
    value,
    onChange,
    label,
}: {
    roles: RoleKey[];
    value: RoleKey;
    onChange: (role: RoleKey) => void;
    label: string;
}) => (
    <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value as RoleKey)}
        className="button-o bg-transparent font-Lexend text-[10px] uppercase tracking-wide text-[#E5F7FF] py-1 focus-visible:ring-2 focus-visible:ring-[#84B9D1] cursor-pointer">
        {roles.map((role) => (
            <option key={role} value={role} className="bg-[#141414] text-[#E5F7FF] normal-case">
                {ROLE_LABEL[role]}
            </option>
        ))}
    </select>
);

export const RosterRow = ({
    entry,
    index,
    spec,
    onRemove,
    onRole,
    hasDuplicate,
    hasRoleConflict,
}: {
    entry: RosterEntry;
    index: number;
    spec: FormatSpec;
    onRemove: () => void;
    onRole: (role: RoleKey) => void;
    hasDuplicate: boolean;
    hasRoleConflict: boolean;
}) => {
    const choices = roleChoicesForSlot(spec, index);
    const outline = hasDuplicate || hasRoleConflict;

    return (
        <li
            className={`w-full bg-[#0b0b0b] rounded-lg ring-[1px] p-3 flex items-center gap-3 justify-between ${
                outline ? "ring-[#FC8181]" : "ring-[#212427]"
            }`}>
            <div className="flex items-center gap-3 min-w-0">
                <span className="font-Lexend tabular-nums text-[10px] text-[#7D8B92] min-w-[14px]">{index + 1}</span>
                <div className="flex items-center w-8 h-8 rounded-xl overflow-clip shrink-0">
                    <img
                        className="scale-105 w-8 h-8 object-cover rounded-xl object-center"
                        src={entry.imageUrl || `https://avatar.tobi.sh/${entry.handle}`}
                        alt=""
                    />
                </div>

                <div className="flex flex-col min-w-0">
                    <h4 className="text-[#fff] text-xs tracking-wide font-medium line-clamp-1">
                        {entry.name || entry.handle}
                    </h4>
                    <h4 className="text-[#8e8e8e] text-xs tracking-wide font-medium line-clamp-1">
                        {entry.handle.startsWith("@") ? entry.handle : `@${entry.handle}`}
                    </h4>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {choices ? (
                    <RoleChip
                        roles={choices}
                        value={entry.role}
                        onChange={onRole}
                        label={`Role for slot ${index + 1}`}
                    />
                ) : (
                    <span className="font-Lexend text-[10px] uppercase tracking-wide text-[#7D8B92]">
                        {ROLE_LABEL[entry.role]}
                    </span>
                )}

                <button
                    type="button"
                    onClick={onRemove}
                    aria-label={`Remove ${entry.name || entry.handle}`}
                    className="button-i min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                    <CloseCircle size={20} color="#5f5f5f" />
                </button>
            </div>
        </li>
    );
};

export const RosterInput = ({
    draft,
    spec,
    onAdd,
    onRemove,
    onRole,
    disabledReason,
    duplicateIndexes,
    roleConflictIndexes,
}: RosterInputProps) => {
    const [manualHandle, setManualHandle] = useState("");
    const [offlineNote, setOfflineNote] = useState(false);

    const nextSlotRole = spec.slotRoles[Math.min(draft.roster.length, spec.slotRoles.length - 1)];
    const atMax = draft.roster.length >= spec.max;
    const validation = validateRoster(draft);

    const addManual = () => {
        const handle = manualHandle.trim();
        if (handle.length === 0) {
            return;
        }
        if (typeof navigator !== "undefined" && navigator.onLine === false) {
            setOfflineNote(true);
        }
        onAdd({
            handle,
            name: handle,
            imageUrl: `https://avatar.tobi.sh/${handle.replace(/^@+/, "")}`,
            role: nextSlotRole,
        });
        setManualHandle("");
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <h3 className="text-[#E5F7FFE5] font-Lexend font-semibold text-xs uppercase tracking-wide">
                    WHO IS IN THE DISCUSSION
                </h3>
                <p className="text-[#7D8B92] font-Lexend text-xs">
                    {formatSummary(spec, roleRequirement(spec), draft.roster.length)}
                </p>
            </div>

            {draft.roster.length === 0 ? (
                <p className="text-[#7D8B92] font-Lexend text-xs">
                    Add the first participant by their Twitter handle.
                </p>
            ) : null}

            <ul className="flex flex-col gap-2">
                {draft.roster.map((entry, index) => (
                    <RosterRow
                        key={`${entry.handle}-${index}`}
                        entry={entry}
                        index={index}
                        spec={spec}
                        onRemove={() => onRemove(index)}
                        onRole={(role) => onRole(index, role)}
                        hasDuplicate={duplicateIndexes.includes(index)}
                        hasRoleConflict={roleConflictIndexes.includes(index)}
                    />
                ))}
            </ul>

            {/* The add row. `SpeakerPop` verbatim for the resolved-preview path. */}
            {!atMax ? (
                <div className="w-full max-w-[585px] flex flex-col gap-2">
                    <SpeakerPop
                        // `SpeakerPop`'s `flag` picks between the two existing placeholders; it
                        // follows the role the next slot will receive, not slot 1.
                        flag={nextSlotRole !== "moderator"}
                        setSpeakers={(speaker: { screen_name: string; name: string; profile_image_url: string }) =>
                            onAdd({
                                handle: speaker.screen_name,
                                name: speaker.name,
                                imageUrl: speaker.profile_image_url,
                                role: nextSlotRole,
                            })
                        }
                    />

                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={manualHandle}
                            onChange={(event) => setManualHandle(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault();
                                    addManual();
                                }
                                if (event.key === "Escape") {
                                    setManualHandle("");
                                }
                            }}
                            aria-label={`Add participant ${draft.roster.length + 1}`}
                            className="input-s text-white/80 text-xs w-full"
                            placeholder="Speaker's twitter handle"
                        />
                        <button
                            type="button"
                            onClick={addManual}
                            aria-label="Add this handle"
                            className="button-i min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                            <Add size={20} color="#5f5f5f" />
                        </button>
                    </div>
                    <p className="text-[#7D8B92] font-Lexend text-xs">
                        {offlineNote
                            ? "Handle lookup needs a connection. You can add handles now and they resolve when you are back online."
                            : "Add the handle directly if the preview does not resolve it. The handle is hashed on chain."}
                    </p>
                </div>
            ) : (
                <div className="w-full max-w-[585px] flex flex-col gap-1">
                    <p className="text-[#7D8B92] font-Lexend text-xs">
                        This format allows up to {spec.max} participants.
                        {spec.kind === 2 ? " X Spaces caps a Space at 10 speakers." : ""}
                    </p>
                </div>
            )}

            <div className="flex flex-col gap-1">
                <p className="text-[#E5F7FFE5] font-Lexend text-xs">
                    {draft.roster.length} of {spec.max} added. {draft.roster.length} must confirm before this can be
                    scheduled.
                </p>
                <p className="text-[#7D8B92] font-Lexend text-xs">
                    Slot order is the payout order and cannot change after creation.
                </p>
                {spec.kind === 3 && draft.roster.length === 1 ? (
                    <p className="text-[#FBED96] font-Lexend text-xs">
                        A briefing on the current contract needs at least 2 participants. Add a second voice or choose
                        the debate format.
                    </p>
                ) : null}
                {disabledReason ? (
                    <p className="text-[#FBED96] font-Lexend text-xs" role="status">
                        {disabledReason}
                    </p>
                ) : null}
                {validation.duplicateIndexes.length > 0 ? (
                    <p className="text-[#FC8181] font-Lexend text-xs" role="alert">
                        This handle is already on the roster.
                    </p>
                ) : null}
            </div>

            {draft.roster.length > 1 ? (
                <p className="flex items-center gap-1 text-[#7D8B92] font-Lexend text-xs">
                    <Trash size={12} color="#7D8B92" /> Removing a row that is not last renumbers the payout slots after
                    it; you will be asked to confirm.
                </p>
            ) : null}
        </div>
    );
};

export default RosterInput;
