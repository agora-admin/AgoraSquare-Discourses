/**
 * Static vocabulary for the Agora Discourses surface.
 *
 * Everything here is either (a) a constant mirrored from
 * `contracts/libraries/LibAgoraStorage.sol` / `LibAgoraRecord.sol` or (b) an exact copy
 * string from `docs/ux/01-campaign-flows.md` §12 and `docs/ux/02-deliberation-and-record.md`
 * §9/§13. No string in this file is invented; where a string was paraphrased the doc key is
 * named above it so a reviewer can diff it.
 */

// ---------------------------------------------------------------------------
// On-chain constants (LibAgoraStorage.sol)
// ---------------------------------------------------------------------------

export const FORMAT_LEGACY_DUEL = 0;
export const FORMAT_AGORA_N = 1;

export const ROLE_SPEAKER = 0;
export const ROLE_MODERATOR = 1;
export const ROLE_PANELIST = 2;
export const ROLE_INTERVIEWER = 3;
export const ROLE_INTERVIEWEE = 4;

export const KIND_DEBATE = 0;
export const KIND_INTERVIEW = 1;
export const KIND_PANEL = 2;
export const KIND_BRIEFING = 3;
export const KIND_RETROSPECTIVE = 4;

export const P_STATUS_PENDING = 0;
export const P_STATUS_CONFIRMED = 1;
export const P_STATUS_DECLINED = 2;

export const VENUE_KICK = 0;
export const VENUE_TWITCH = 1;
export const VENUE_YOUTUBE_LIVE = 2;
export const VENUE_X_SPACES = 3;
export const VENUE_IRL = 4;
export const VENUE_AGORA_ROOM = 5;

export const VENUE_ATTEST_NONE = 0;
export const VENUE_ATTEST_PENDING = 1;
export const VENUE_ATTEST_ATTESTED = 2;
export const VENUE_ATTEST_REJECTED = 3;

// LibAgoraRecord.sol
export const ATTEST_CLAIM_RESEARCH = 0;
export const ATTEST_EVIDENCE = 1;
export const ATTEST_DISCLOSURES = 2;
export const ATTEST_ARGUMENT_MAP = 3;
export const ATTEST_SYNTHESIS = 4;
export const ATTEST_RECORD_MANIFEST = 5;
export const ATTEST_TRANSCRIPT = 6;
export const ATTEST_RECORDING = 7;
export const ATTEST_RETROSPECTIVE = 8;

// ---------------------------------------------------------------------------
// Formats — docs/ux/01 §3.2, §12.2 and §12.3
// ---------------------------------------------------------------------------

/** Display token for a slot's role. Mapped to an on-chain constant only at signing time. */
export type RoleKey =
    | "speaker"
    | "moderator"
    | "panelist"
    | "host"
    | "guest"
    | "facilitator"
    | "participant"
    | "presenter"
    | "qaHost";

/** docs/ux/01 §12.3 `roster.role.*` */
export const ROLE_LABEL: Record<RoleKey, string> = {
    moderator: "Moderator",
    panelist: "Panelist",
    speaker: "Speaker",
    host: "Host",
    guest: "Guest",
    facilitator: "Facilitator",
    participant: "Participant",
    presenter: "Presenter",
    qaHost: "Q&A host",
};

/** docs/PRD.md §3.1 X5 — the only place the display vocabulary meets the on-chain one. */
export const ROLE_CONSTANT: Record<RoleKey, number> = {
    speaker: ROLE_SPEAKER,
    moderator: ROLE_MODERATOR,
    panelist: ROLE_PANELIST,
    host: ROLE_INTERVIEWER,
    guest: ROLE_INTERVIEWEE,
    facilitator: ROLE_MODERATOR,
    participant: ROLE_SPEAKER,
    presenter: ROLE_SPEAKER,
    qaHost: ROLE_MODERATOR,
};

/**
 * `refuse` shows `roster.role.twoModerators` and blocks `Continue`.
 * `swap` moves the role off the previous holder (the interview rule in §3.2).
 */
export type RoleConstraint = "none" | "refuse" | "swap";

export interface FormatSpec {
    kind: number;
    title: string;
    body: string;
    /** default role for slots 0 and 1; slots past the end reuse the last entry */
    slotRoles: RoleKey[];
    /** roles the chip offers; `null` renders static text (§3.3 rule 3) */
    roleChoices: Record<number, RoleKey[]> | null;
    constraint: RoleConstraint;
    /** the role that must appear exactly once, for `refuse`/`swap` */
    requiredRole?: RoleKey;
    min: number;
    max: number;
    defaultDurationSeconds: number;
    /** docs/ux/01 §12.3 */
    minError: string;
}

export const FORMATS: FormatSpec[] = [
    {
        kind: KIND_DEBATE,
        title: "Debate",
        body: "2 participants. Two speakers, no moderator. 60 minutes.",
        slotRoles: ["speaker", "speaker"],
        roleChoices: null,
        constraint: "none",
        min: 2,
        max: 2,
        defaultDurationSeconds: 60 * 60,
        minError: "A debate needs exactly two speakers.",
    },
    {
        kind: KIND_INTERVIEW,
        title: "Interview",
        body: "2 to 3 people. One host and one or two guests. 45 minutes.",
        slotRoles: ["host", "guest"],
        roleChoices: { 0: ["guest", "host"], 1: ["guest", "host"], 2: ["guest", "host"] },
        constraint: "swap",
        requiredRole: "host",
        min: 2,
        max: 3,
        defaultDurationSeconds: 45 * 60,
        minError: "An interview needs a host and at least one guest.",
    },
    {
        kind: KIND_PANEL,
        title: "Panel",
        body: "3 to 10 people. One moderator and the rest panelists. 60 to 90 minutes.",
        slotRoles: ["moderator", "panelist"],
        roleChoices: { 0: ["moderator", "panelist"], 1: ["moderator", "panelist"], 2: ["moderator", "panelist"] },
        constraint: "refuse",
        requiredRole: "moderator",
        min: 3,
        max: 10,
        defaultDurationSeconds: 60 * 60,
        minError: "A panel needs at least 3 participants including the moderator.",
    },
    {
        kind: KIND_BRIEFING,
        title: "Briefing",
        body: "1 to 3 people. One presenter, with an optional Q&A host. 30 to 45 minutes.",
        slotRoles: ["presenter", "qaHost"],
        roleChoices: { 0: ["presenter", "qaHost"], 1: ["qaHost", "presenter"], 2: ["qaHost", "presenter"] },
        constraint: "none",
        min: 1,
        max: 3,
        defaultDurationSeconds: 45 * 60,
        minError: "A briefing needs a presenter.",
    },
    {
        kind: KIND_RETROSPECTIVE,
        title: "Retrospective",
        body: "2 to 10 people. One facilitator and the rest participants. 45 minutes.",
        slotRoles: ["facilitator", "participant"],
        roleChoices: { 0: ["facilitator", "participant"], 1: ["facilitator", "participant"], 2: ["facilitator", "participant"] },
        constraint: "swap",
        requiredRole: "facilitator",
        min: 2,
        max: 10,
        defaultDurationSeconds: 45 * 60,
        minError: "A retrospective needs a facilitator and at least one participant.",
    },
];

/** The product-wide ceiling, independent of a format (§3.2; contract default is 12). */
export const HARD_MAX_PARTICIPANTS = 12;

export const DEFAULT_MAX_PARTICIPANTS = 12;

export const getFormatSpec = (kind: number): FormatSpec =>
    FORMATS.find((f) => f.kind === kind) ?? FORMATS[0];

/** Role a freshly added slot receives for a format. */
export const defaultRoleForSlot = (spec: FormatSpec, slotIndex: number): RoleKey => {
    if (slotIndex < spec.slotRoles.length) {
        return spec.slotRoles[slotIndex];
    }
    return spec.slotRoles[spec.slotRoles.length - 1];
};

/** Roles the chip offers for a slot. `null` means "static text, no control" (§3.3 rule 3). */
export const roleChoicesForSlot = (spec: FormatSpec, slotIndex: number): RoleKey[] | null => {
    if (!spec.roleChoices) {
        return null;
    }
    return spec.roleChoices[slotIndex] ?? spec.roleChoices[2] ?? spec.roleChoices[1] ?? null;
};

/** `roster.role.noModerator` / `roster.role.noFacilitator` (docs/ux/01 §12.3). */
export const missingRequiredRoleCopy = (spec: FormatSpec): string | null => {
    if (spec.constraint === "none" || !spec.requiredRole) {
        return null;
    }
    if (spec.requiredRole === "moderator") {
        return "A panel needs one moderator. Set a role to Moderator.";
    }
    if (spec.requiredRole === "facilitator") {
        return "A retrospective needs one facilitator. Set a role to Facilitator.";
    }
    return null;
};

// ---------------------------------------------------------------------------
// Venues — docs/ux/01 §9.1 and §12.5
// ---------------------------------------------------------------------------

export interface VenueSpec {
    kind: number;
    label: string;
    /** the field label for the reference the user supplies */
    fieldLabel: string;
    helper: string;
    /** the attestation ceiling this venue can reach */
    ceiling: "declared" | "handleLinked" | "observed" | "verifiedLive";
    usedByLegacyIrlFlag: boolean;
}

export const VENUES: VenueSpec[] = [
    {
        kind: VENUE_KICK,
        label: "Kick",
        fieldLabel: "Channel URL",
        helper: "Paste the channel you will stream from.",
        ceiling: "handleLinked",
        usedByLegacyIrlFlag: false,
    },
    {
        kind: VENUE_TWITCH,
        label: "Twitch",
        fieldLabel: "Channel URL",
        helper: "Paste the channel you will stream from.",
        ceiling: "handleLinked",
        usedByLegacyIrlFlag: false,
    },
    {
        kind: VENUE_YOUTUBE_LIVE,
        label: "YouTube Live",
        fieldLabel: "Broadcast link",
        helper: "Paste the link you will stream to. If the broadcast is not created yet, paste the channel and we bind it when you go live.",
        ceiling: "verifiedLive",
        usedByLegacyIrlFlag: true,
    },
    {
        kind: VENUE_X_SPACES,
        label: "X Spaces",
        fieldLabel: "Space link or Space id",
        helper: "Paste the Space link. Spaces are captured while they are live, so the link has to work on the day.",
        ceiling: "observed",
        usedByLegacyIrlFlag: false,
    },
    {
        kind: VENUE_IRL,
        label: "In person",
        fieldLabel: "Venue address",
        helper: "An in-person venue cannot be verified automatically. It is declared, and the campaign page says so.",
        ceiling: "declared",
        usedByLegacyIrlFlag: true,
    },
    {
        kind: VENUE_AGORA_ROOM,
        label: "Agora room",
        fieldLabel: "Room reference",
        helper: "A room is created for this campaign. Participants and backers get a join link. Verification is automatic - the room is ours.",
        ceiling: "verifiedLive",
        usedByLegacyIrlFlag: false,
    },
];

export const getVenueSpec = (kind: number): VenueSpec | undefined =>
    VENUES.find((v) => v.kind === kind);

/** `venue.resolve.declaredOnly` — the line shown after the reference is captured. */
export const VENUE_DECLARED_ONLY = "The campaign starts as Declared. It becomes Verified when we see the stream.";

export const VENUE_NORMALISATION_HELPER =
    "Lowercase, the leading @ removed, the scheme and any trailing slash stripped. What you type is what gets hashed.";

/**
 * docs/ux/01 §9.1: "Lowercase, the leading @ removed, the scheme and any trailing slash
 * stripped. What you type is what gets hashed."
 * The hash itself is `keccak256(utf8(normalised))` — the same expression
 * `StringHelper.keccak256` uses, matching the v1 handle convention
 * (`keccak256(abi.encodePacked(handle))`).
 */
export const normaliseVenueRef = (raw: string): string =>
    raw
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/^@/, "")
        .replace(/\/+$/, "");

// ---------------------------------------------------------------------------
// Revert → sentence. docs/ux/01 §12.9 and docs/ux/03 §B.13.12
// ---------------------------------------------------------------------------

export const REVERT_COPY: Record<string, string> = {
    // campaign create
    "Agora: participant arrays length mismatch": "The participant list is incomplete. Reload the page and try again.",
    "Agora: at least 2 participants": "This format needs at least 2 participants on the current contract.",
    "Agora: too many participants": "This format allows up to 12 participants.",
    "Agora: duplicate participant handle": "The same handle is on the roster twice. Each participant can appear once.",
    "Agora: invalid discussion kind": "That format is not available. Pick a format and try again.",
    "Agora: campaign not failed": "This campaign cannot be closed out yet.",
    "Agora: not a multi-participant discourse": "This action is only available for campaigns, not for two-speaker discussions.",
    "DPropFactoryFacet: minInitialFunds not met": "Your initial pledge is below the minimum for this network.",
    "DPropFactory: Description already used": "A campaign with this title already exists. Titles have to be unique.",
    "DPropFactory: percentage cannot be greater than 100": "The charity share must be between 0 and 100.",
    // payouts
    "AgoraPayout: already withdrawn": "You have already withdrawn your share.",
    "DPropTreasury: Must be greater than zero": "Enter an amount greater than zero.",
    "DPropTreasury: Funds still locked": "The refund is not open yet. It opens on {date}.",
    "DPropTreasury: disputed": "This campaign is under dispute. Payouts are paused until it is resolved.",
    "DPropTreasury: No funds to withdraw": "There is nothing to withdraw from this campaign.",
    "DPropTreasury: Proposal does not exist": "This campaign was not found on chain.",
    // admin / infrastructure
    "LibAppStorage: not admin": "Only an Agora operator can do this.",
    "Diamond: Function does not exist": "This action is not available on the current contract version. Reload the page.",
    // wallet / rpc (client-side, no revert string)
    WALLET_REJECTED: "Transaction rejected in your wallet. Nothing was created.",
    RPC_FAILURE: "The network is busy. Nothing was charged. Try again in a moment.",
};

export const UNMAPPED_REVERT_COPY =
    "Something went wrong. Nothing was changed. If it keeps happening, contact an operator with this transaction hash.";

/** Turns any thrown error into a sentence. Raw revert strings never reach the reader. */
export const revertToSentence = (error: unknown): string => {
    const message =
        typeof error === "string"
            ? error
            : (error as any)?.shortMessage ?? (error as any)?.reason ?? (error as any)?.message ?? "";

    if (typeof message === "string") {
        for (const key of Object.keys(REVERT_COPY)) {
            if (key !== "WALLET_REJECTED" && key !== "RPC_FAILURE" && message.includes(key)) {
                return REVERT_COPY[key];
            }
        }
        if (/user rejected|user denied|rejected the request/i.test(message)) {
            return REVERT_COPY.WALLET_REJECTED;
        }
        if (/nonce|gas|network|timeout|fetch/i.test(message)) {
            return REVERT_COPY.RPC_FAILURE;
        }
    }
    return UNMAPPED_REVERT_COPY;
};

// ---------------------------------------------------------------------------
// Reaction taxonomy — docs/ux/02 §9.4 and §9.7 (fixed, ordered, never sorted)
// ---------------------------------------------------------------------------

export type TaxonomyId = 0 | 1 | 2 | 3 | 4 | 5;

export interface TaxonomySpec {
    id: TaxonomyId;
    label: string;
    tooltip: string;
    color: string;
    pattern: "solid" | "dots" | "horizontal" | "vertical" | "plusGrid" | "chevrons";
    side: "above" | "below";
}

export const TAXONOMIES: TaxonomySpec[] = [
    {
        id: 0,
        label: "Evidence added",
        tooltip: "This added a source, a dataset, or a first-hand account",
        color: "#ABECD6",
        pattern: "solid",
        side: "above",
    },
    {
        id: 1,
        label: "Compelling",
        tooltip: "This was well argued and moved me, even if I disagree",
        color: "#84B9D1",
        pattern: "dots",
        side: "above",
    },
    {
        id: 2,
        label: "Agree",
        tooltip: "I share this position",
        color: "#12D8FA",
        pattern: "horizontal",
        side: "above",
    },
    {
        id: 3,
        label: "Unclear",
        tooltip: "I could not follow this, or it needs clarification",
        color: "#D2B4FC",
        pattern: "vertical",
        side: "below",
    },
    {
        id: 4,
        label: "Disagree",
        tooltip: "I do not share this position",
        color: "#FC8181",
        pattern: "plusGrid",
        side: "below",
    },
    {
        id: 5,
        label: "Off-topic",
        tooltip: "This is not responsive to the topic",
        color: "#7D8B92",
        pattern: "chevrons",
        side: "below",
    },
];

export const taxonomyLabel = (id: number): string =>
    TAXONOMIES[id]?.label ?? "Unknown";

export const taxonomyTooltip = (id: number): string =>
    TAXONOMIES[id]?.tooltip ?? "";

// ---------------------------------------------------------------------------
// Attestation kinds — LibAgoraRecord.sol
// ---------------------------------------------------------------------------

export interface AttestationSpec {
    kind: number;
    label: string;
    /** the AI job name used by the provenance micro-label (§1.2 device 2) */
    microLabel: string;
}

export const ATTESTATIONS: AttestationSpec[] = [
    { kind: ATTEST_CLAIM_RESEARCH, label: "Claim research", microLabel: "AI · CLAIM RESEARCH" },
    { kind: ATTEST_EVIDENCE, label: "Evidence", microLabel: "AI · EVIDENCE ORGANISATION" },
    { kind: ATTEST_DISCLOSURES, label: "Disclosures", microLabel: "AI · DISCLOSURE SURFACING" },
    { kind: ATTEST_ARGUMENT_MAP, label: "Arguments", microLabel: "AI · ARGUMENT COMPARISON" },
    { kind: ATTEST_SYNTHESIS, label: "Synthesis", microLabel: "AI · SYNTHESIS" },
    { kind: ATTEST_RECORD_MANIFEST, label: "Record manifest", microLabel: "AI · RECORD MANIFEST" },
    { kind: ATTEST_TRANSCRIPT, label: "Transcript", microLabel: "AI · TRANSCRIPT" },
    { kind: ATTEST_RECORDING, label: "Recording", microLabel: "AI · RECORDING REFERENCE" },
    { kind: ATTEST_RETROSPECTIVE, label: "Retrospective", microLabel: "AI · RETROSPECTIVE" },
];

export const getAttestationSpec = (kind: number): AttestationSpec | undefined =>
    ATTESTATIONS.find((a) => a.kind === kind);

// ---------------------------------------------------------------------------
// Small formatters owned by this feature (TimeHelper is untouched)
// ---------------------------------------------------------------------------

/** mm:ss with no leading zero on minutes — docs/ux/02 §12.2 (`formatClock`). */
export const formatClock = (totalSeconds: number): string => {
    const safe = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

/** "12 minutes 30 seconds" — the `aria-valuetext` form required by §9.9. */
export const formatClockSpoken = (totalSeconds: number): string => {
    const safe = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(safe / 60);
    const seconds = safe % 60;
    const parts: string[] = [];
    if (minutes > 0) {
        parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
    }
    if (seconds > 0 || minutes === 0) {
        parts.push(`${seconds} second${seconds === 1 ? "" : "s"}`);
    }
    return parts.join(" ");
};

/** Duration of a session as "1 h 32 m" / "46 m" — the record header line. */
export const formatDuration = (totalSeconds: number): string => {
    const safe = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    if (hours > 0) {
        return minutes > 0 ? `${hours} h ${minutes} m` : `${hours} h`;
    }
    return `${minutes} m`;
};

export const shortHash = (hash: string): string => {
    if (!hash || hash.length < 14) {
        return hash;
    }
    return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
};

/** One decimal, always — the `t` parameter grammar in docs/ux/02 §8.3. */
export const formatSecondsOneDecimal = (ms: number): string => (ms / 1000).toFixed(1);
