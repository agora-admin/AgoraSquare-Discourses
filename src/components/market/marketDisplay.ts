/**
 * The market display model — the one place a market's UI state and its numbers are derived
 * (`docs/ux/03-markets-and-design-system.md` §B.1.1, §B.1.3, §B.3.5, §B.4.4, §B.4.7, §B.15).
 *
 * Every value here is derived from the deployed contract's own fields. There is no display state
 * that the chain cannot support (`LOCKED` is the derived predicate `state == OPEN && now < lockTS`,
 * `REFUNDABLE` folds into `VOID`) and no label invented for something the contract does not store.
 *
 * Honesty rules carried in this file, and where they bite:
 *  - H1/H2/H3: a forecast share is never rendered on a thin pool, never rendered without the
 *    pool depth and the participant count, and never called "odds" or "probability".
 *  - H4: `CHALLENGED` and `VOID` are separate states from `SETTLED`, with separate words.
 *  - H12: nothing here reads the discussion's dispute flag; a discussion dispute is not a market
 *    dispute.
 */

import { BigNumber, ethers } from "ethers";
import { formatDate, getTimeFromDate } from "../../helper/TimeHelper";
import { MARKET_STATE } from "../../web3/agora";

export { MARKET_STATE };

/** The eight display states of §B.1.1, plus `ABSENT` for "no such market". */
export type MarketDisplayState =
    | "FORECASTING"
    | "CLOSING_SOON"
    | "CLOSED"
    | "RESULT_OVERDUE"
    | "RESULT_SUBMITTED"
    | "CHALLENGED"
    | "SETTLED"
    | "VOID"
    | "ABSENT";

/** The glyph a badge carries. Kept as a key so this module stays free of JSX. */
export type MarketGlyph = "timer" | "clock" | "warning" | "verify" | "void";

export interface DisplayStateMeta {
    /** §B.1.1 badge label; `RESULT_SUBMITTED` and `CLOSING_SOON` are refined by `displayStateLabel` */
    label: string;
    /** §B.1.1 colour token's hex */
    color: string;
    glyph: MarketGlyph;
}

export const DISPLAY_STATE_META: Record<MarketDisplayState, DisplayStateMeta> = {
    FORECASTING: { label: "Forecasting open", color: "#ABECD6", glyph: "timer" },
    CLOSING_SOON: { label: "Closing soon", color: "#FBED96", glyph: "timer" },
    CLOSED: { label: "Closed — awaiting result", color: "#7D8B92", glyph: "clock" },
    RESULT_OVERDUE: { label: "Result overdue", color: "#FBED96", glyph: "warning" },
    RESULT_SUBMITTED: { label: "Result submitted", color: "#84B9D1", glyph: "verify" },
    CHALLENGED: { label: "Challenged", color: "#fc8181", glyph: "warning" },
    SETTLED: { label: "Settled", color: "#84B9D1", glyph: "verify" },
    VOID: { label: "Void — refunds", color: "#FCB4BD", glyph: "void" },
    ABSENT: { label: "No such market", color: "#7D8B92", glyph: "clock" },
};

export interface DisplayStateInput {
    /** `MARKET_STATE.*` as read from `getAgoraMarket` */
    state: number;
    /** `isStakingOpen(marketId)`; `null` while the read is in flight, and on error */
    stakingOpen: boolean | null;
    lockTS: number;
    resolutionDeadline: number;
    challengeDeadline: number;
    /** unix seconds, injected so every surface derives from the same instant */
    nowSec: number;
}

/** §B.1.1, verbatim, against the deployed contract's fields. */
export const deriveDisplayState = (input: DisplayStateInput): MarketDisplayState => {
    const { state, stakingOpen, lockTS, resolutionDeadline, challengeDeadline, nowSec } = input;

    if (state === MARKET_STATE.NONE) {
        return "ABSENT";
    }

    if (state === MARKET_STATE.OPEN) {
        // `stakingOpen === null` is "not read yet", and the safe direction is the closed-side
        // branch: it never offers a Forecast action that the chain would refuse.
        if (stakingOpen === true && lockTS > nowSec) {
            return lockTS - nowSec <= 24 * 60 * 60 ? "CLOSING_SOON" : "FORECASTING";
        }
        return nowSec > resolutionDeadline ? "RESULT_OVERDUE" : "CLOSED";
    }

    if (state === MARKET_STATE.RESOLVED) {
        return "RESULT_SUBMITTED";
    }
    if (state === MARKET_STATE.CHALLENGED) {
        return "CHALLENGED";
    }
    if (state === MARKET_STATE.FINAL) {
        return "SETTLED";
    }
    if (state === MARKET_STATE.VOID) {
        return "VOID";
    }

    return "ABSENT";
};

/**
 * The badge label, refined by the deadline the state hangs on. A badge that says the challenge
 * window is open after it has closed would be a claim about what a user can still do, so the
 * window's own value decides the wording (§B.1.1 hard rule 1).
 */
export const displayStateLabel = (state: MarketDisplayState, nowSec: number, input?: DisplayStateInput): string => {
    if (state === "CLOSING_SOON" && input) {
        return `Closes in ${formatCountdown(input.lockTS, nowSec)}`;
    }
    if (state === "RESULT_SUBMITTED" && input) {
        return input.challengeDeadline > nowSec
            ? `Result submitted — challenge window open until ${formatAbsolute(input.challengeDeadline)}`
            : `Result submitted — challenge window closed on ${formatAbsolute(input.challengeDeadline)}`;
    }
    return DISPLAY_STATE_META[state].label;
};

// ---------------------------------------------------------------------------
// Outcome colours — §B.4.7's fixed order. The same outcome keeps the same colour on every
// surface, and every one of the eight passes the 3:1 graphical-object floor on `#141515`.
// ---------------------------------------------------------------------------

export const OUTCOME_COLORS = [
    "#84B9D1",
    "#D2B4FC",
    "#ABECD6",
    "#FBED96",
    "#12D8FA",
    "#FCB4F5",
    "#FCB4BD",
    "#7D8B92",
] as const;

export const outcomeColor = (index: number): string =>
    OUTCOME_COLORS[Math.max(0, index) % OUTCOME_COLORS.length];

/** §B.4.5: labels come from the rules document; the chain stores only the count. */
export const outcomeLabel = (index: number): string => `Outcome ${index + 1}`;

// ---------------------------------------------------------------------------
// Copy (§B.3.5, §B.4.4, §B.11, §B.15). Verbatim where the spec quotes a sentence.
// ---------------------------------------------------------------------------

/** PRD §7.9 AC6, verbatim. Never paraphrased, never dismissible. */
export const DISCLAIMER =
    "Forecasts are not predictions of truth and most participants lose money. Agora does not guarantee any outcome.";

/** §B.11.2 — travels with every amount on a non-value deployment. */
export const TESTNET_FUNDS_NOTE =
    "Test network funds. These have no cash value. They cannot be cashed out from Agora.";

/** §B.11.6 — the trust model, stated rather than hidden. */
export const TRUST_MODEL_LINE =
    "Who can resolve: the platform's resolver set, controlled by the platform admin. Resolvers are not disclosed per market in advance.";

export const RESOLVER_LINE =
    "Results are submitted by the platform and can be challenged by anyone who forecast this market.";

export const SUPPRESSION = {
    /** §A.10.4 rule 2 / §B.3.5 */
    noLiquidity: "Insufficient liquidity — no forecast yet",
    fewParticipants: "Not enough participants to show a forecast",
    noCap: "Pool size not yet meaningful — no forecast shown",
    noParticipants: "Participant count unavailable — no forecast shown",
} as const;

export const LABELS_UNAVAILABLE =
    "Outcome names could not be loaded from the rules document, and the contract stores only how many outcomes a market has. Outcomes are shown by position, in the order the rules document defines.";

/** §B.4.4 hash tooltip, reused for the question hash and the evidence hash. */
export const HASH_DEFINITION =
    "This hash matches the on-chain commitment. It proves the file has not changed since it was published. It does not prove the content is true or complete.";

/**
 * The deployed contract stores no question text: the market id is the derived
 * `keccak256(classId, templateId, propId, params)` of a closed template (PRD §3.2 C-1), and the
 * rules URI is stored only as its hash. So a surface can name the commitment and the template
 * slot, and it cannot print a question sentence — inventing one would be worse than naming the
 * gap. Stated here once so every surface says the same thing.
 */
export const QUESTION_NOT_STORED =
    "The question is a closed template on chain: the market id is the hash of (class, template, discussion, parameters). The question text is generated from the template and is not stored on chain.";

export const questionHeading = (marketId: string): string => `Question ${shortenHash(marketId)}`;

export const templateLine = (classId: number, templateId: number): string =>
    `Template ${classId}.${templateId}`;

// ---------------------------------------------------------------------------
// Numbers — §B.1.3. Precision, unit and qualifier rules live here so no call site invents them.
// ---------------------------------------------------------------------------

/** 3 decimals with a thousands separator. `null` when there is nothing to show. */
export const formatAmount = (wei: BigNumber | null | undefined, precision = 3): string | null => {
    if (wei === null || wei === undefined) {
        return null;
    }
    const asNumber = Number(ethers.utils.formatEther(wei));
    if (!Number.isFinite(asNumber)) {
        return null;
    }
    return asNumber.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: precision,
    });
};

/** Basis points of a whole, as an integer, for a *pool split* rather than a forecast share. */
export const ratioBps = (part: BigNumber | null | undefined, whole: BigNumber | null | undefined): number => {
    if (!part || !whole || whole.isZero() || part.isZero()) {
        return 0;
    }
    return Number(part.mul(10000).div(whole));
};

/**
 * §A.10.4 rules 3 and 5: integer percent, and 0%/100% clamped for display so a one-sided pool
 * never reads as certainty.
 */
export const formatSharePercent = (bps: number): string => {
    const clamped = Math.min(9900, Math.max(100, bps));
    return `${Math.round(clamped / 100)}%`;
};

/** The unclamped value, for a pool split that is being shown as a historical record. */
export const formatSplitPercent = (bps: number): string => `${Math.round(bps / 100)}%`;

/** `payoutPerEth` is scaled by 10 000: 14 200 → "1.42×". */
export const formatMultiplier = (scaled: BigNumber | null | undefined): string | null => {
    if (!scaled || scaled.isZero()) {
        return null;
    }
    return `${(Number(scaled.toString()) / 10000).toFixed(2)}×`;
};

/** `feeBps` → "4%" (§B.1.3). */
export const formatFeePercent = (feeBps: number): string => `${Math.round(feeBps) / 100}%`;

/** Cap used, as an integer percent of the configured cap. `null` when there is no cap. */
export const formatPercentOfCap = (
    totalStaked: BigNumber | null | undefined,
    poolCap: BigNumber | null | undefined
): string | null => {
    if (!poolCap || poolCap.isZero()) {
        return null;
    }
    const bps = ratioBps(totalStaked ?? BigNumber.from(0), poolCap);
    return `${Math.round(bps / 100)}%`;
};

/**
 * What a position would return if its outcome won, at the pools as they are right now.
 *
 * This is `LibAgoraMarket.payoutShare` transcribed: `p + (D - W) * p / W`, with `D = T - fee`.
 * It returns `null` rather than a number whenever that formula has no meaning — an empty winning
 * pool, or a winning pool that does not fit inside the distributable pool (the contract refuses
 * such a resolution and forces a void, so a number here would describe a payout that cannot
 * happen).
 */
export const estimateIfOutcomeWins = (
    position: BigNumber | null | undefined,
    pools: BigNumber[] | null | undefined,
    outcomeIndex: number,
    totalStaked: BigNumber | null | undefined,
    feeBps: number
): BigNumber | null => {
    if (!position || position.isZero() || !pools || !totalStaked || totalStaked.isZero()) {
        return null;
    }
    const winningPool = pools[outcomeIndex] ?? BigNumber.from(0);
    if (winningPool.isZero()) {
        return null;
    }
    const feeAmount = totalStaked.mul(feeBps).div(10000);
    const distributable = totalStaked.sub(feeAmount);
    if (winningPool.gt(distributable)) {
        return null;
    }
    return position.add(distributable.sub(winningPool).mul(position).div(winningPool));
};

export const isTestnetChain = (chainId: number | undefined): boolean =>
    chainId !== undefined && !VALUE_CHAIN_IDS.includes(chainId);

/** §B.11: chains where the funds are value, not play money. Everything else is labelled. */
export const VALUE_CHAIN_IDS = [137, 56];

// ---------------------------------------------------------------------------
// Time — §A.6.7: `diff_hours` rounds to whole hours and clamps negatives, so it cannot express
// "closes in 47 minutes" or a passed deadline. These two formatters are the shared replacement.
// ---------------------------------------------------------------------------

/** "3 d 4 h" / "47 m" / "4 m" — the countdown form, which `diff_hours` cannot produce. */
export const formatCountdown = (targetSec: number, nowSec: number): string => {
    const diff = targetSec - nowSec;
    if (diff <= 0) {
        return "0 m";
    }
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    if (days > 0) {
        return `${days} d ${hours} h`;
    }
    if (hours > 0) {
        return `${hours} h ${minutes} m`;
    }
    return `${minutes} m`;
};

/** "4 October 2026, 18:00" — absolute, and the only form used for a date over 48 h away. */
export const formatAbsolute = (unixSeconds: number): string => {
    if (!unixSeconds) {
        return "—";
    }
    const date = new Date(unixSeconds * 1000);
    return `${formatDate(date)}, ${getTimeFromDate(date)}`;
};

/**
 * Relative under 48 hours, absolute over it, "passed" after it (§B.1.3).
 * `direction` labels the two uses: a future deadline reads "in 3 h 12 m", a past one "3 h 12 m ago".
 */
export const formatWhen = (unixSeconds: number, nowSec: number, direction: "future" | "past" = "future"): string => {
    if (!unixSeconds) {
        return "—";
    }
    const diff = unixSeconds - nowSec;
    if (direction === "future") {
        if (diff <= 0) {
            return "passed";
        }
        return diff <= 48 * 60 * 60 ? `in ${formatCountdown(unixSeconds, nowSec)}` : formatAbsolute(unixSeconds);
    }
    if (diff >= 0) {
        return formatAbsolute(unixSeconds);
    }
    return -diff <= 48 * 60 * 60 ? `${formatCountdown(nowSec, unixSeconds)} ago` : formatAbsolute(unixSeconds);
};

/** §B.1.3: hashes render as first 10 + last 6 characters, never as 66 characters of hex. */
export const shortenHash = (hash: string): string => {
    if (!hash || hash.length <= 18) {
        return hash || "—";
    }
    return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
};

// ---------------------------------------------------------------------------
// Suppression — §B.1.1/§B.4.5, §A.10.4 rule 1, PRD §3.2 C-5.
//
// A thin pool is not a signal. The percentage is withheld, in this order, whenever any of the
// four bounds below cannot be met, and the surface shows pool depth and participant count
// instead. The honest failure direction is to show less.
// ---------------------------------------------------------------------------

export interface SuppressionInput {
    /** `getAgoraConfig().poolCap`; `null` while unread */
    poolCap: BigNumber | null;
    /** `getAgoraPool().totalStaked` */
    totalStaked: BigNumber | null;
    /** `getAgoraMarket().distinctStakers`, or `null` when the participant count is unavailable */
    participants: number | null;
    /** `getAgoraConfig().minDistinctPositions`; markets below it must void */
    minDistinctPositions: number;
}

/** `null` means "the share may be shown". A string is the reason it may not. */
export const forecastSuppressionReason = (input: SuppressionInput): string | null => {
    const { poolCap, totalStaked, participants, minDistinctPositions } = input;

    if (participants === null) {
        return SUPPRESSION.noParticipants;
    }
    // No cap configured means there is no computable fraction of it, so the 20% of cap rule
    // (PRD §3.2 C-5) cannot be evaluated and no percentage is published.
    if (!poolCap || poolCap.isZero()) {
        return SUPPRESSION.noCap;
    }
    if (!totalStaked || totalStaked.lt(poolCap.div(5))) {
        return SUPPRESSION.noLiquidity;
    }
    if (participants < Math.max(2, minDistinctPositions)) {
        return SUPPRESSION.fewParticipants;
    }
    return null;
};

// ---------------------------------------------------------------------------
// Eligibility — §B.5.2 check 3 (PRD S9). The deployed `stake` has no participant-exclusion
// guard, so this is an application rule and the copy says so rather than claiming on-chain
// enforcement the contract does not have.
// ---------------------------------------------------------------------------

export interface DiscourseEligibilitySource {
    prop_starter?: string;
    speakers?: Array<{ address?: string; name?: string }>;
    moderator?: { address?: string; name?: string; username?: string; image_url?: string } | null;
    /** the discussion's funding deadline, as the page already holds it */
    endTS?: string;
}

export interface EligibilityResult {
    eligible: boolean;
    reason: string | null;
    detail: string | null;
}

export const ELIGIBILITY_REASON = "You cannot forecast on this discussion.";
export const ELIGIBILITY_DETAIL =
    "The discussion's speakers and its proposer cannot forecast on it here. The contract has no such rule, so this is a restriction of this application, not an approval step on chain.";

export const marketEligibility = (
    discourse: DiscourseEligibilitySource | null | undefined,
    walletAddress: string | null | undefined
): EligibilityResult => {
    if (!discourse || !walletAddress) {
        return { eligible: true, reason: null, detail: null };
    }

    const me = walletAddress.toLowerCase();
    const addresses = [
        discourse.prop_starter,
        ...(discourse.speakers ?? []).map((speaker) => speaker?.address),
        discourse.moderator?.address,
    ]
        .filter((address): address is string => Boolean(address))
        .map((address) => address.toLowerCase());

    if (addresses.includes(me)) {
        return { eligible: false, reason: ELIGIBILITY_REASON, detail: ELIGIBILITY_DETAIL };
    }

    return { eligible: true, reason: null, detail: null };
};
