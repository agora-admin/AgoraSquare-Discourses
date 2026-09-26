/**
 * The campaign builder's draft model and its validation.
 *
 * All validation lives here rather than in the step components so a rule is stated once and the
 * message is the exact string from the copy deck (`docs/ux/01-campaign-flows.md` §3.3, §3.5,
 * §12.3, §12.5, §12.6). Every message below is copied verbatim; the doc key is named next to it.
 *
 * The draft is a UI object. It is never signed: `createDiscussion` is built from it once, at
 * step 6, by `buildCreateDiscussionArgs` in `src/web3/agora.ts`.
 */

import {
    FormatSpec,
    HARD_MAX_PARTICIPANTS,
    RoleKey,
    defaultRoleForSlot,
    getFormatSpec,
    missingRequiredRoleCopy,
    roleChoicesForSlot,
} from "../helper/AgoraHelper";

export interface RosterEntry {
    /** the handle as typed, `@` optional; hashed on-chain */
    handle: string;
    /** display name from the handle lookup; never sent on chain */
    name: string;
    /** avatar URL from the handle lookup; never sent on chain */
    imageUrl: string;
    role: RoleKey;
}

export interface VenueDraft {
    /** VENUE_* or null while nothing is chosen */
    kind: number | null;
    /** the raw reference the user typed; normalised and hashed at signing time */
    reference: string;
}

export interface CampaignDraft {
    /** KIND_* or null until step 1 is answered */
    kind: number | null;
    roster: RosterEntry[];
    title: string;
    summary: string;
    /** the tier-1 category, written as `topics[0]` (docs/ux/01 §3.5) */
    category: string;
    subTopics: string[];
    venue: VenueDraft;
    /** the goal as a decimal string, exactly as typed */
    goal: string;
    /** the funding window in seconds */
    fundingWindowSeconds: number;
    /** the confirmation window in seconds */
    confirmationWindowSeconds: number;
    charityPercent: number;
    /** the proposer's own initial pledge as a decimal string */
    initialPledge: string;
}

export const emptyDraft = (): CampaignDraft => ({
    kind: null,
    roster: [],
    title: "",
    summary: "",
    category: "",
    subTopics: [],
    venue: { kind: null, reference: "" },
    goal: "",
    // `money.window` / `money.confirmWindow` defaults from docs/ux/01 §3.5 (7d / 14d)
    fundingWindowSeconds: 7 * 24 * 60 * 60,
    confirmationWindowSeconds: 14 * 24 * 60 * 60,
    charityPercent: 0,
    initialPledge: "",
});

export const DRAFT_STORAGE_KEY = "agora.campaign.draft.v1";

/** docs/ux/01 §3.5 — the seven-button category row. */
export const CATEGORIES = [
    "Public policy",
    "Geopolitics",
    "Technology",
    "Science",
    "Finance",
    "Culture",
    "Community",
];

// ---------------------------------------------------------------------------
// Roster
// ---------------------------------------------------------------------------

export const normaliseHandle = (handle: string): string =>
    handle.trim().replace(/^@+/, "").toLowerCase();

export const isDuplicateHandle = (roster: RosterEntry[], handle: string): boolean => {
    const target = normaliseHandle(handle);
    return roster.filter((entry) => normaliseHandle(entry.handle) === target).length > 1;
};

export interface RosterValidation {
    /** `null` when the roster may advance */
    reason: string | null;
    /** rows that must be fixed before continuing (duplicates) */
    duplicateIndexes: number[];
    /** rows carrying a role conflict, so the row can mark itself */
    roleConflictIndexes: number[];
}

/** docs/ux/01 §3.3 state table + §12.3 copy. */
export const validateRoster = (draft: CampaignDraft): RosterValidation => {
    const duplicateIndexes: number[] = [];
    const roleConflictIndexes: number[] = [];

    if (draft.kind === null) {
        return { reason: "Pick a format to continue.", duplicateIndexes, roleConflictIndexes };
    }

    const spec = getFormatSpec(draft.kind);
    const roster = draft.roster;

    const seen = new Set<string>();
    roster.forEach((entry, index) => {
        const handle = normaliseHandle(entry.handle);
        if (seen.has(handle)) {
            duplicateIndexes.push(index);
        }
        seen.add(handle);
    });

    if (duplicateIndexes.length > 0) {
        return { reason: "This handle is already on the roster.", duplicateIndexes, roleConflictIndexes };
    }

    if (roster.length < spec.min) {
        return { reason: spec.minError, duplicateIndexes, roleConflictIndexes };
    }

    if (roster.length > spec.max) {
        return {
            reason: `Changing to ${spec.title} allows ${spec.min} to ${spec.max} participants. Remove ${
                roster.length - spec.max
            } to continue.`,
            duplicateIndexes,
            roleConflictIndexes,
        };
    }

    if (spec.constraint === "refuse" && spec.requiredRole) {
        const holders = roster
            .map((entry, index) => ({ entry, index }))
            .filter(({ entry }) => entry.role === spec.requiredRole);
        if (holders.length === 0) {
            return { reason: missingRequiredRoleCopy(spec), duplicateIndexes, roleConflictIndexes };
        }
        if (holders.length > 1) {
            roleConflictIndexes.push(
                ...holders.slice(1).map(({ index }) => index)
            );
            return {
                reason: "Only one moderator per panel. This participant needs a different role.",
                duplicateIndexes,
                roleConflictIndexes,
            };
        }
    }

    return { reason: null, duplicateIndexes, roleConflictIndexes };
};

/**
 * Applies a role to a slot, honouring the format's constraint.
 * Returns the reason a `refuse` constraint rejected the change, or `null` when it applied.
 */
export const applyRole = (
    draft: CampaignDraft,
    slotIndex: number,
    role: RoleKey
): { roster: RosterEntry[]; reason: string | null } => {
    const spec = getFormatSpec(draft.kind ?? 0);
    const roster = draft.roster.map((entry) => ({ ...entry }));

    if (roster[slotIndex]) {
        roster[slotIndex].role = role;
    }

    if (spec.constraint === "refuse" && spec.requiredRole && role === spec.requiredRole) {
        const others = roster.filter((entry, index) => index !== slotIndex && entry.role === spec.requiredRole);
        if (others.length > 0) {
            return { roster: draft.roster, reason: "Only one moderator per panel. This participant needs a different role." };
        }
    }

    if (spec.constraint === "swap" && spec.requiredRole && role === spec.requiredRole) {
        // The interview rule (§3.2): choosing Host moves the existing host to Guest rather than
        // creating two hosts. Retrospective uses the same shape for its facilitator.
        const demoted: RoleKey = spec.requiredRole === "host" ? "guest" : "participant";
        roster.forEach((entry, index) => {
            if (index !== slotIndex && entry.role === spec.requiredRole) {
                entry.role = demoted;
            }
        });
    }

    return { roster, reason: null };
};

/** Shrinks or re-roles a roster when the format changes, without ever deleting a filled row. */
export const reconcileRoster = (draft: CampaignDraft, kind: number): CampaignDraft => {
    const spec = getFormatSpec(kind);
    const roster = draft.roster.map((entry, index) => {
        const allowed = roleChoicesForSlot(spec, index);
        const role = allowed && allowed.includes(entry.role) ? entry.role : defaultRoleForSlot(spec, index);
        return { ...entry, role };
    });

    return {
        ...draft,
        kind,
        roster: roster.slice(0, Math.min(roster.length, HARD_MAX_PARTICIPANTS)),
    };
};

export const addRosterEntry = (draft: CampaignDraft, entry: RosterEntry): CampaignDraft => ({
    ...draft,
    roster: [...draft.roster, entry],
});

/**
 * Removing a middle row renumbers the slots after it, and slot order is the payout order
 * (docs/PRD.md X9), so the UI confirms first with `roster.remove.middle`.
 */
export const removeRosterEntry = (draft: CampaignDraft, index: number): CampaignDraft => ({
    ...draft,
    roster: draft.roster.filter((_, i) => i !== index),
});

export const removalRenumbersLaterSlots = (draft: CampaignDraft, index: number): boolean =>
    index < draft.roster.length - 1;

export const removalWarning = (draft: CampaignDraft, index: number): string => {
    const handle = draft.roster[index]?.handle ?? "";
    return `Removing ${handle} renumbers the participants after them. Payout slots change. Continue?`;
};

// ---------------------------------------------------------------------------
// Money (§3.5, §12.6)
// ---------------------------------------------------------------------------

/** `null` means "not readable on this deployment" — the rule is then left to the chain. */
export interface FundingLimits {
    minGoal: string | null;
    minInitialFunds: string | null;
    fundingCap: string | null;
}

export interface MoneyValidation {
    goal: string | null;
    fundingWindow: string | null;
    confirmationWindow: string | null;
    charity: string | null;
    pledge: string | null;
}

const parseAmount = (value: string): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

export const validateMoney = (
    draft: CampaignDraft,
    limits: FundingLimits,
    symbol: string
): MoneyValidation => {
    const goal = parseAmount(draft.goal);
    const pledge = parseAmount(draft.initialPledge);
    const errors: MoneyValidation = {
        goal: null,
        fundingWindow: null,
        confirmationWindow: null,
        charity: null,
        pledge: null,
    };

    if (!draft.goal.trim() || goal <= 0) {
        errors.goal = "Set a funding goal.";
    } else if (limits.minGoal && goal < parseAmount(limits.minGoal)) {
        errors.goal = `The goal must be at least ${limits.minGoal} ${symbol}.`;
    } else if (limits.fundingCap && goal > parseAmount(limits.fundingCap)) {
        errors.goal = `The goal cannot exceed the platform cap of ${limits.fundingCap} ${symbol}.`;
    }

    if (draft.fundingWindowSeconds < 60) {
        errors.fundingWindow = "The funding window must be at least 60 seconds.";
    }

    if (draft.confirmationWindowSeconds < 3600) {
        errors.confirmationWindow = "The confirmation window must be at least one hour.";
    }

    if (draft.charityPercent < 0 || draft.charityPercent > 100) {
        errors.charity = "The charity share must be between 0 and 100.";
    }

    if (!draft.initialPledge.trim() || pledge <= 0) {
        errors.pledge = "Your initial pledge must be at least 1 unit of the network token.";
    } else if (limits.minInitialFunds && pledge < parseAmount(limits.minInitialFunds)) {
        errors.pledge = `Your initial pledge must be at least ${limits.minInitialFunds} ${symbol}.`;
    } else if (limits.fundingCap && pledge > parseAmount(limits.fundingCap)) {
        errors.pledge = `Your pledge cannot exceed the platform cap of ${limits.fundingCap} ${symbol}.`;
    }

    return errors;
};

export const moneyHasErrors = (validation: MoneyValidation): boolean =>
    Object.values(validation).some((value) => value !== null);

// ---------------------------------------------------------------------------
// Subject (§3.5, §12.4)
// ---------------------------------------------------------------------------

export interface SubjectValidation {
    title: string | null;
    category: string | null;
    subTopics: string | null;
}

export const validateSubject = (draft: CampaignDraft): SubjectValidation => ({
    title: draft.title.trim().length === 0 ? "Please add a title" : null,
    category: draft.category.length === 0 ? "One category. It is what people browse by." : null,
    subTopics:
        draft.subTopics.length < 3
            ? "Please add at least 3 sub-topics"
            : draft.subTopics.length > 12
            ? "That is 12 sub-topics. More than that is harder to fund."
            : null,
});

// ---------------------------------------------------------------------------
// Venue (§9, §12.5)
// ---------------------------------------------------------------------------

export const validateVenue = (draft: CampaignDraft): string | null => {
    if (draft.venue.kind === null) {
        return "Pick where this discussion happens.";
    }
    if (draft.venue.reference.trim().length === 0) {
        return "Add the venue reference so it can be hashed.";
    }
    return null;
};

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

export const BUILDER_STEPS = ["format", "roster", "subject", "where", "money", "review"] as const;
export type BuilderStep = (typeof BUILDER_STEPS)[number];

export const STEP_LABEL: Record<BuilderStep, string> = {
    format: "Format",
    roster: "Who",
    subject: "Subject",
    where: "Where",
    money: "Money",
    review: "Review",
};

/** The step a deep link may land on: never past the first unanswered one (§3.7). */
export const firstUnansweredStep = (draft: CampaignDraft): BuilderStep => {
    if (draft.kind === null) {
        return "format";
    }
    if (validateRoster(draft).reason !== null) {
        return "roster";
    }
    const subject = validateSubject(draft);
    if (subject.title || subject.category || subject.subTopics) {
        return "subject";
    }
    if (validateVenue(draft) !== null) {
        return "where";
    }
    return "money";
};

export const formatSummary = (spec: FormatSpec, roleRequirement: string, count: number): string =>
    `${spec.title} - ${spec.min} to ${spec.max} participants - ${roleRequirement} - you have ${count}`;

export const roleRequirement = (spec: FormatSpec): string => {
    if (spec.constraint === "refuse" && spec.requiredRole === "moderator") {
        return "one moderator required";
    }
    if (spec.constraint === "swap" && spec.requiredRole === "facilitator") {
        return "one facilitator required";
    }
    return "no role restriction";
};
