/**
 * `MarketDetail` — the expanded market panel (`docs/ux/03` §B.4), rendered when a card's
 * "Details" is opened or when the page is deep-linked at `?market=<marketId>` (§B.2's route
 * decision: no new route file, one query parameter).
 *
 * The honesty rules this panel carries, and where:
 *  - H4   — `CHALLENGED` and `VOID` are never rendered as settled. A submitted outcome is only
 *           called "won" when `state == FINAL` (`RESULT` section); a void shows the pool split as
 *           a historical record, labelled as one.
 *  - H5   — the resolver, the evidence commitment, the submission time and the deadlines are
 *           rendered in every state past `FORECASTING`.
 *  - H6   — the market's `feeBpsSnapshot` is on screen before any stake action, always.
 *  - H7   — the cap and the participant count are shown wherever a share is.
 *  - H11  — the refund row is textually and visually distinct from a winning claim.
 *  - H13  — no resolution is attributed to a model anywhere; the resolver is an address.
 *  - H14  — "Unclaimed" is not rendered as an opportunity and has no action next to it.
 *  - H15  — the only timers are forecasting close, result due, challenge window and adjudication.
 *  - §B.11.4 — `claimEnabled == false` replaces the payout button with a statement, and never
 *           blocks a refund.
 *  - §B.4.6 — `syncMarketLock` is surfaced before it is used, never silently.
 */

import { useCallback, useContext, useEffect, useState } from "react";
import { BigNumber } from "ethers";
import { Copy, Timer, Warning2 } from "iconsax-react";
import { v4 as uuid } from "uuid";
import AppContext from "../utils/AppContext";
import { ToastTypes } from "../../lib/Types";
import { getChainName, getCurrencyName } from "../../Constants";
import { shortAddress } from "../../helper/StringHelper";
import { ClockIcon, MessageRemoveIcon, VerifyIcon } from "../utils/SvgHub";
import {
    useAgoraChallenge,
    useAgoraClaimable,
    useAgoraConfig,
    useAgoraHasClaimed,
    useAgoraMarket,
    useAgoraOdds,
    useAgoraPosition,
    useAgoraResolution,
    useAgoraStakingOpen,
    useAgoraWrite,
} from "../../web3/agora";
import OutcomeRow from "./OutcomeRow";
import StakeDialog from "./StakeDialog";
import {
    DISCLAIMER,
    DiscourseEligibilitySource,
    DisplayStateInput,
    DISPLAY_STATE_META,
    HASH_DEFINITION,
    LABELS_UNAVAILABLE,
    TESTNET_FUNDS_NOTE,
    TRUST_MODEL_LINE,
    deriveDisplayState,
    displayStateLabel,
    estimateIfOutcomeWins,
    forecastSuppressionReason,
    formatAbsolute,
    formatAmount,
    formatFeePercent,
    formatSharePercent,
    formatWhen,
    isTestnetChain,
    marketEligibility,
    outcomeColor,
    outcomeLabel,
    questionHeading,
    ratioBps,
    shortenHash,
    templateLine,
} from "./marketDisplay";

const ZERO_ADDRESS_LC = "0x0000000000000000000000000000000000000000";

export interface MarketDetailProps {
    marketId: string;
    chainId: number;
    /** the discussion's speakers / proposer / moderator, for the eligibility check */
    discourse: DiscourseEligibilitySource | null;
    onBack: () => void;
}


export const MarketDetail = ({ marketId, chainId, discourse, onBack }: MarketDetailProps) => {
    const { loggedIn, walletAddress, addToast } = useContext(AppContext);
    const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000));
    const [stakeOpen, setStakeOpen] = useState(false);
    const [stakeOutcome, setStakeOutcome] = useState(0);
    const [challengeOpen, setChallengeOpen] = useState(false);
    const [challengeAcknowledged, setChallengeAcknowledged] = useState(false);
    const [rulesOpen, setRulesOpen] = useState(false);
    const [inlineMessage, setInlineMessage] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 60_000);
        return () => clearInterval(timer);
    }, []);

    const { market, refetch: refetchMarket } = useAgoraMarket(marketId);
    const { config } = useAgoraConfig();
    // The market's snapshotted fee must reach the payout maths, or the indicative return is gross.
    const { odds, refetch: refetchOdds } = useAgoraOdds(marketId, true, market?.feeBpsSnapshot ?? 0);
    const { position, refetch: refetchPosition } = useAgoraPosition(marketId, walletAddress || undefined);
    const { resolution } = useAgoraResolution(marketId);
    const { challenge, refetch: refetchChallenge } = useAgoraChallenge(marketId);
    const { stakingOpen } = useAgoraStakingOpen(marketId);
    const { amount: claimable, refetch: refetchClaimable } = useAgoraClaimable(marketId, walletAddress || undefined);
    const { claimed } = useAgoraHasClaimed(marketId, walletAddress || undefined);

    const challengeTx = useAgoraWrite(
        "challengeResolution",
        challengeOpen && challengeAcknowledged ? [marketId] : undefined,
        config ? config.challengeBond : undefined
    );
    const finalizeTx = useAgoraWrite("finalizeResolution", [marketId]);
    const claimTx = useAgoraWrite("claim", [marketId]);
    const refundTx = useAgoraWrite("refundVoid", [marketId]);
    const bondTx = useAgoraWrite("claimChallengeBond", [marketId]);

    const currency = getCurrencyName(chainId);
    const testnet = isTestnetChain(chainId);
    const eligibility = marketEligibility(discourse, walletAddress);

    const refreshAll = useCallback(() => {
        refetchMarket();
        refetchOdds();
        refetchPosition();
        refetchChallenge();
        refetchClaimable();
    }, [refetchMarket, refetchOdds, refetchPosition, refetchChallenge, refetchClaimable]);

    useEffect(() => {
        const failure = challengeTx.error || finalizeTx.error || claimTx.error || refundTx.error || bondTx.error;
        if (failure) {
            setInlineMessage(failure);
            addToast({
                title: "The transaction was not completed",
                body: failure,
                type: ToastTypes.error,
                duration: 6000,
                id: uuid(),
            });
        }
    }, [challengeTx.error, finalizeTx.error, claimTx.error, refundTx.error, bondTx.error, addToast]);

    useEffect(() => {
        if (challengeTx.isSuccess) {
            addToast({
                title: "Challenge posted",
                body: "The platform now reviews this result. The result is not final until the review ends.",
                type: ToastTypes.success,
                duration: 6000,
                id: uuid(),
            });
            setChallengeOpen(false);
            setChallengeAcknowledged(false);
            refreshAll();
        }
    }, [challengeTx.isSuccess, addToast, refreshAll]);

    useEffect(() => {
        if (claimTx.isSuccess || refundTx.isSuccess || bondTx.isSuccess) {
            addToast({
                title: "Claim confirmed",
                body: "It may take a few minutes to show in your wallet.",
                type: ToastTypes.success,
                duration: 5000,
                id: uuid(),
            });
            refreshAll();
        }
    }, [claimTx.isSuccess, refundTx.isSuccess, bondTx.isSuccess, addToast, refreshAll]);

    useEffect(() => {
        if (finalizeTx.isSuccess) {
            addToast({
                title: "Market finalised",
                body: "The market is final. No further stakes or challenges are possible.",
                type: ToastTypes.success,
                duration: 6000,
                id: uuid(),
            });
            refreshAll();
        }
    }, [finalizeTx.isSuccess, addToast, refreshAll]);

    const displayStateInput: DisplayStateInput | null = market
        ? {
              state: market.state,
              stakingOpen,
              lockTS: market.lockTS,
              resolutionDeadline: market.resolutionDeadline,
              challengeDeadline: resolution?.challengeDeadline ?? 0,
              nowSec,
          }
        : null;

    const displayState = displayStateInput ? deriveDisplayState(displayStateInput) : "ABSENT";
    const badge = DISPLAY_STATE_META[displayState];

    const suppression = forecastSuppressionReason({
        poolCap: config?.poolCap ?? null,
        totalStaked: odds?.totalStaked ?? market?.totalStaked ?? null,
        participants: market ? market.distinctStakers : null,
        minDistinctPositions: config?.minDistinctPositions ?? 2,
    });

    const pools = odds?.pools ?? null;
    const totalStaked = odds?.totalStaked ?? market?.totalStaked ?? BigNumber.from(0);
    const shareBps = pools ? pools.map((pool) => ratioBps(pool, totalStaked)) : null;
    const splitIsRecord = displayState === "VOID";

    const winningOutcome = resolution?.winningOutcome ?? null;
    const myWinningStake =
        winningOutcome !== null && position?.stakePerOutcome
            ? position.stakePerOutcome[winningOutcome] ?? BigNumber.from(0)
            : BigNumber.from(0);
    const myBackedOutcome = position?.stakePerOutcome
        ? position.stakePerOutcome.findIndex((value) => value && value.gt(0))
        : -1;

    const challengeAdjudicationDeadline =
        resolution && config ? resolution.challengeDeadline + config.challengeTimeout : 0;
    const canFinalizeNow =
        Boolean(resolution && resolution.submittedAt > 0) &&
        ((market?.state === 2 && nowSec > (resolution?.challengeDeadline ?? 0)) ||
            (market?.state === 3 && nowSec > challengeAdjudicationDeadline));
    const challengeWindowOpen = Boolean(resolution && resolution.challengeDeadline > nowSec);
    const alreadyChallenged = Boolean(challenge && challenge.challenger !== ZERO_ADDRESS_LC);
    const canChallenge =
        loggedIn &&
        Boolean(position?.hasPosition) &&
        market?.state === 2 &&
        challengeWindowOpen &&
        !alreadyChallenged;

    const copy = async (value: string, what: string) => {
        try {
            await navigator.clipboard.writeText(value);
            addToast({
                title: "Copied",
                body: `Copied the ${what}.`,
                type: ToastTypes.info,
                duration: 3000,
                id: uuid(),
            });
        } catch {
            addToast({
                title: "Copy failed",
                body: `Select the ${what} manually. The browser blocked the clipboard.`,
                type: ToastTypes.warning,
                duration: 4000,
                id: uuid(),
            });
        }
    };

    if (!market || displayState === "ABSENT") {
        return (
            <div className="bg-card rounded-xl p-4 flex flex-col gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="button-o w-fit font-Lexend text-xs focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                    Back to discussion
                </button>
                <p className="font-Lexend text-xs text-[#7D8B92]">
                    This market could not be read. It may not exist on {getChainName(chainId)}.
                </p>
            </div>
        );
    }

    const outcomeCount = market.outcomeCount;
    const alwaysShowReturn = outcomeCount === 2;
    const capLine = config?.poolCap && !config.poolCap.isZero() ? formatAmount(config.poolCap) : null;
    const capUsedBps = config?.poolCap && !config.poolCap.isZero() ? ratioBps(totalStaked, config.poolCap) : null;

    // A row is only interactive while forecasting is open AND the viewer may take part
    // (§B.4.5). The reason is rendered once when it is a fact about the whole market, and inside
    // the row when it is a fact about that row only — which is exactly the one-side rule.
    const forecastingOpen = displayState === "FORECASTING" || displayState === "CLOSING_SOON";
    const marketForecastBlock = !forecastingOpen
        ? null
        : !loggedIn
        ? "Connect your wallet to place a forecast."
        : !eligibility.eligible
        ? `${eligibility.reason} ${eligibility.detail ?? ""}`
        : config?.stakingPaused
        ? "New forecasts are paused. Existing forecasts are unaffected and refunds still work."
        : null;
    const oneSideReason =
        position?.hasPosition && myBackedOutcome >= 0
            ? `You already forecast ${outcomeLabel(myBackedOutcome)} in this market. You can forecast only one outcome in a market.`
            : null;

    const shareBarLabel = `Forecast share: ${Array.from({ length: outcomeCount })
        .map((_, index) =>
            shareBps && suppression === null
                ? `${outcomeLabel(index)} ${formatSharePercent(shareBps[index] ?? 0).replace("%", " percent")}`
                : outcomeLabel(index)
        )
        .join(", ")}.`;

    return (
        <div className="bg-card rounded-xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <button
                    type="button"
                    onClick={onBack}
                    className="button-o font-Lexend text-xs text-[#E5F7FF] min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                    Back to discussion
                </button>
                <span className="flex items-center gap-2">
                    {badge.glyph === "verify" ? <VerifyIcon size={16} /> : null}
                    {badge.glyph === "void" ? <MessageRemoveIcon size={16} /> : null}
                    {badge.glyph === "clock" ? <ClockIcon size={16} /> : null}
                    {badge.glyph === "warning" ? <Warning2 size={14} color={badge.color} aria-hidden="true" /> : null}
                    {badge.glyph === "timer" ? <Timer size={14} color={badge.color} aria-hidden="true" /> : null}
                    <span className="font-Lexend text-[10px] uppercase tracking-wide" style={{ color: badge.color }}>
                        {displayStateInput ? displayStateLabel(displayState, nowSec, displayStateInput) : badge.label}
                    </span>
                </span>
            </div>

            <div className="flex flex-col gap-2">
                <h2 className="font-Lexend font-semibold text-sm text-[#E5F7FF]">{questionHeading(marketId)}</h2>
                <p className="font-Lexend text-[10px] text-[#7D8B92]">
                    Question text is fixed at creation and cannot be changed. {templateLine(market.classId, market.templateId)}.{" "}
                    This market is bound to discussion #{market.propId}.
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        type="button"
                        onClick={() => copy(marketId, "question hash")}
                        aria-label={`Copy the question hash, ${shortenHash(marketId)}`}
                        className="button-i-f flex items-center gap-1 p-2 font-Lexend text-[10px] text-[#E5F7FF] focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                        <Copy size={12} aria-hidden="true" />
                        hash {shortenHash(marketId)}
                    </button>
                    <span className="font-Lexend text-[10px] text-[#7D8B92]">{HASH_DEFINITION}</span>
                </div>
            </div>

            <div className="w-full h-[1px] bg-[#1E1E1E]" />

            {/* ---------------- FORECAST ---------------- */}
            <section className="flex flex-col gap-3">
                <h3 className="font-Lexend font-semibold text-[10px] uppercase tracking-wide text-[#7D8B92]">
                    {splitIsRecord ? "How the pool was split when forecasting closed" : "Forecast"}
                </h3>

                {shareBps && suppression === null ? (
                    <div
                        role="img"
                        aria-label={shareBarLabel}
                        className="hidden sm:flex w-full h-3 rounded-full overflow-hidden">
                        {Array.from({ length: outcomeCount }).map((_, index) => (
                            <span
                                key={index}
                                aria-hidden="true"
                                className="h-full"
                                style={{
                                    width: `${Math.max((shareBps[index] ?? 0) / 100, 1)}%`,
                                    backgroundColor: outcomeColor(index),
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <p role="status" className="hidden sm:block font-Lexend text-[10px] xs:text-xs text-[#7D8B92]">
                        {suppression}
                    </p>
                )}

                {marketForecastBlock ? (
                    <p role="status" className="font-Lexend text-[10px] xs:text-xs text-[#7D8B92]">
                        {marketForecastBlock}
                    </p>
                ) : null}

                <ul className="flex flex-col">
                    {Array.from({ length: outcomeCount }).map((_, index) => {
                        const myStake = position?.stakePerOutcome?.[index] ?? null;
                        const rowBlocked = marketForecastBlock ? null : oneSideReason && !myStake?.gt(0) ? oneSideReason : null;
                        return (
                            <OutcomeRow
                                key={index}
                                index={index}
                                poolWei={pools?.[index] ?? null}
                                shareBps={suppression === null ? shareBps?.[index] ?? null : null}
                                suppressionReason={suppression}
                                payoutPerUnit={odds?.payoutPerEth?.[index] ?? null}
                                currency={currency}
                                myStakeWei={myStake}
                                alwaysShowReturn={alwaysShowReturn}
                                onForecast={
                                    forecastingOpen && !rowBlocked
                                        ? () => {
                                              setStakeOutcome(index);
                                              setStakeOpen(true);
                                          }
                                        : undefined
                                }
                                forecastDisabledReason={rowBlocked}
                                splitLabel={
                                    splitIsRecord && shareBps
                                        ? "Recorded split at close — not a result."
                                        : null
                                }
                                testnet={testnet}
                            />
                        );
                    })}
                </ul>

                <p className="font-Lexend text-xs text-[#c6c6c6]">
                    Pool <span className="text-[#E5F7FF] tabular-nums">{formatAmount(totalStaked)} {currency}</span>
                    {" · "}
                    <span className="text-[#E5F7FF] tabular-nums">{market.distinctStakers}</span> participant
                    {market.distinctStakers === 1 ? "" : "s"}
                    {" · "}
                    {capLine ? (
                        <>
                            Cap <span className="text-[#E5F7FF] tabular-nums">{capLine} {currency}</span>
                            {capUsedBps !== null ? ` (${Math.round(capUsedBps / 100)}% used)` : null}
                        </>
                    ) : (
                        "No cap configured"
                    )}
                    <span className="block text-[10px] text-[#7D8B92]">
                        Pool: everything staked on this market, on every outcome. Participants: distinct addresses that
                        have staked, each counted once. The participant count is read from the market itself.
                    </span>
                </p>

                <p className="font-Lexend text-xs text-[#c6c6c6]">
                    {market.feeBpsSnapshot === 0 ? (
                        "No fee on winnings"
                    ) : (
                        <>
                            Fee on winnings{" "}
                            <span className="text-[#E5F7FF] tabular-nums">{formatFeePercent(market.feeBpsSnapshot)}</span>
                        </>
                    )}
                    <span className="block text-[10px] text-[#7D8B92]">
                        The fee is fixed when the market opens, applies only to winnings, and has no effect on a refund.
                    </span>
                </p>

                <p className="font-Lexend text-xs text-[#c6c6c6]">
                    {market.lockTS > nowSec
                        ? `Timing: forecasting closes ${formatWhen(market.lockTS, nowSec)} — on ${formatAbsolute(
                              market.lockTS
                          )}.`
                        : `Timing: forecasting closed on ${formatAbsolute(market.lockTS)}.`}
                </p>
            </section>

            <div className="w-full h-[1px] bg-[#1E1E1E]" />

            {/* ---------------- RULES ---------------- */}
            <section className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="font-Lexend font-semibold text-[10px] uppercase tracking-wide text-[#7D8B92]">
                        Rules and resolution
                    </h3>
                    <button
                        type="button"
                        onClick={() => setRulesOpen((previous) => !previous)}
                        aria-expanded={rulesOpen}
                        className="button-o font-Lexend text-[10px] uppercase tracking-wide text-[#E5F7FF] focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                        {rulesOpen ? "Collapse" : "Expand"}
                    </button>
                </div>
                <p className="font-Lexend text-xs text-[#c6c6c6]">
                    Outcome labels, the resolution source and the void conditions are in the rules document for this
                    market. All three are fixed before forecasting opens.
                </p>
                {rulesOpen ? (
                    <div className="flex flex-col gap-2">
                        <p className="font-Lexend text-[10px] text-[#7D8B92]">{LABELS_UNAVAILABLE}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-Lexend text-[10px] text-[#7D8B92]">
                                Rules document commitment {shortenHash(market.rulesURIHash)}
                            </span>
                            <button
                                type="button"
                                onClick={() => copy(market.rulesURIHash, "rules document hash")}
                                aria-label={`Copy the rules document hash, ${shortenHash(market.rulesURIHash)}`}
                                className="button-i p-2 focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                                <Copy size={12} color="#c6c6c6" aria-hidden="true" />
                            </button>
                        </div>
                        <p className="font-Lexend text-[10px] text-[#7D8B92]">
                            The contract stores the hash of the rules document URI, not the URI, so this surface cannot
                            link to the document from chain data alone.
                        </p>
                    </div>
                ) : null}
            </section>

            <div className="w-full h-[1px] bg-[#1E1E1E]" />

            {/* ---------------- YOUR FORECAST ---------------- */}
            <section className="flex flex-col gap-3">
                <h3 className="font-Lexend font-semibold text-[10px] uppercase tracking-wide text-[#7D8B92]">
                    Your forecast
                </h3>

                {!loggedIn ? (
                    <p className="font-Lexend text-xs text-[#7D8B92]">
                        Connect your wallet to see your forecast and any amount you can claim.
                    </p>
                ) : !position?.hasPosition ? (
                    <p className="font-Lexend text-xs text-[#7D8B92]">You have no forecast in this market.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {(position.stakePerOutcome ?? []).map((stake, index) =>
                            stake && stake.gt(0) ? (
                                <div key={index} className="flex items-center gap-2 flex-wrap">
                                    <span
                                        aria-hidden="true"
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: outcomeColor(index) }}
                                    />
                                    <span className="font-Lexend text-xs text-[#E5F7FF]">{outcomeLabel(index)}</span>
                                    <span className="font-Lexend text-xs text-[#c6c6c6] tabular-nums">
                                        {formatAmount(stake)} {currency} of {formatAmount(totalStaked)} {currency} pool
                                    </span>
                                </div>
                            ) : null
                        )}

                        <p className="font-Lexend text-[10px] text-[#7D8B92]">
                            The contract records your stake per outcome, not a per-stake history, so the panel shows the
                            totals it can read.
                        </p>

                        {market.state === 4 ? (
                            myWinningStake.gt(0) ? (
                                <p className="font-Lexend text-xs text-[#c6c6c6]">
                                    Settled — {outcomeLabel(winningOutcome ?? 0)} won.
                                    {claimable ? (
                                        <>
                                            {" "}
                                            Your payout is {formatAmount(claimable)} {currency}, after the{" "}
                                            {formatFeePercent(market.feeBpsSnapshot)} fee on winnings.
                                        </>
                                    ) : (
                                        " Your payout is being read from the chain."
                                    )}
                                </p>
                            ) : (
                                <p className="font-Lexend text-xs text-[#c6c6c6]">
                                    Your forecast did not win. Nothing is returned. The pool went to{" "}
                                    {outcomeLabel(winningOutcome ?? 0)}.
                                </p>
                            )
                        ) : myBackedOutcome >= 0 && pools ? (
                            <p className="font-Lexend text-xs text-[#c6c6c6]">
                                If this outcome stands: indicative{" "}
                                <span className="text-[#E5F7FF] tabular-nums">
                                    {formatAmount(
                                        estimateIfOutcomeWins(
                                            position.stakePerOutcome?.[myBackedOutcome],
                                            pools,
                                            myBackedOutcome,
                                            totalStaked,
                                            market.feeBpsSnapshot
                                        )
                                    ) ?? "—"}{" "}
                                    {currency}
                                </span>
                                , of which {formatFeePercent(market.feeBpsSnapshot)} fee. If it does not stand: nothing
                                is returned.
                            </p>
                        ) : null}

                        <p className="font-Lexend text-[10px] text-[#7D8B92]">
                            Your stake stays in the pool until the market settles. There is no way to withdraw it early
                            and positions cannot be transferred.
                        </p>

                        {/* Void refund — never gated (§B.11.4). */}
                        {market.state === 5 && !claimed ? (
                            <div className="flex flex-col gap-2 border border-[#FCB4BD] rounded-xl p-3">
                                <span className="flex items-center gap-2">
                                    <MessageRemoveIcon size={16} />
                                    <span className="font-Lexend text-xs text-[#FCB4BD]">Void — refunds</span>
                                </span>
                                <p className="font-Lexend text-xs text-[#c6c6c6]">
                                    Refund{" "}
                                    <span className="text-[#E5F7FF] tabular-nums">
                                        {formatAmount(claimable ?? position.stakedTotal ?? BigNumber.from(0))} {currency}
                                    </span>
                                    {testnet ? <span className="text-[#7D8B92]"> · test network funds</span> : null}
                                </p>
                                <button
                                    type="button"
                                    disabled={refundTx.isPending || !refundTx.write}
                                    onClick={() => refundTx.write?.()}
                                    className={`${
                                        refundTx.isPending || !refundTx.write ? "button-s-d" : "button-s"
                                    } font-Lexend text-xs w-full focus-visible:ring-2 focus-visible:ring-[#84B9D1]`}>
                                    {refundTx.isPending ? "Claiming…" : "Claim refund"}
                                </button>
                                <p className="font-Lexend text-[10px] text-[#7D8B92]">
                                    Refunds are returned to the address that staked. They are not winnings and are not
                                    affected by whether payouts are enabled.
                                </p>
                            </div>
                        ) : null}

                        {market.state === 5 && claimed ? (
                            <p className="font-Lexend text-xs text-[#7D8B92]" role="status">
                                Refunded. The principal was returned to the address that staked it.
                            </p>
                        ) : null}

                        {/* Winning payout — gated by `claimEnabled` on chain, and said so (C-2, §B.11.4). */}
                        {market.state === 4 && myWinningStake.gt(0) && !claimed ? (
                            config?.claimEnabled ? (
                                <div className="flex flex-col gap-2">
                                    <p className="font-Lexend text-xs text-[#ABECD6]">
                                        Claimable{" "}
                                        <span className="text-[#E5F7FF] tabular-nums">
                                            {formatAmount(claimable ?? BigNumber.from(0))} {currency}
                                        </span>
                                    </p>
                                    <button
                                        type="button"
                                        disabled={claimTx.isPending || !claimTx.write}
                                        onClick={() => claimTx.write?.()}
                                        className={`${
                                            claimTx.isPending || !claimTx.write ? "button-s-d" : "button-s"
                                        } font-Lexend text-xs w-full focus-visible:ring-2 focus-visible:ring-[#84B9D1]`}>
                                        {claimTx.isPending
                                            ? "Claiming…"
                                            : `Claim ${formatAmount(claimable ?? BigNumber.from(0))} ${currency}`}
                                    </button>
                                    <p className="font-Lexend text-[10px] text-[#7D8B92]">
                                        Claiming does not change the record. The result stays as submitted.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    <p className="font-Lexend text-xs text-[#FBED96]" role="status">
                                        Recorded, not claimable:{" "}
                                        <span className="tabular-nums">
                                            {formatAmount(claimable ?? BigNumber.from(0))} {currency}
                                        </span>
                                    </p>
                                    <p className="font-Lexend text-[10px] text-[#7D8B92]">
                                        Winnings are recorded but cannot be claimed in this version. Settlement is on-chain
                                        and permanent. When payouts are enabled, this amount stays claimable by the same
                                        address. Refunds are not affected by payouts being disabled.
                                    </p>
                                </div>
                            )
                        ) : null}

                        {market.state === 4 && claimed ? (
                            <p className="font-Lexend text-xs text-[#7D8B92]" role="status">
                                Claimed.
                            </p>
                        ) : null}

                        {/* Challenge bond, in its own row (§B.6.2). */}
                        {challenge && challenge.challenger.toLowerCase() === (walletAddress || "").toLowerCase() ? (
                            challenge.refundable ? (
                                <div className="flex flex-col gap-2">
                                    <p className="font-Lexend text-xs text-[#c6c6c6]">
                                        Challenge bond claimable{" "}
                                        <span className="text-[#E5F7FF] tabular-nums">
                                            {formatAmount(challenge.bond)} {currency}
                                        </span>
                                    </p>
                                    <button
                                        type="button"
                                        disabled={bondTx.isPending || !bondTx.write}
                                        onClick={() => bondTx.write?.()}
                                        className={`${
                                            bondTx.isPending || !bondTx.write ? "button-s-d" : "button-s"
                                        } font-Lexend text-xs w-full focus-visible:ring-2 focus-visible:ring-[#84B9D1]`}>
                                        {bondTx.isPending ? "Claiming…" : "Claim bond"}
                                    </button>
                                </div>
                            ) : market.state === 4 ? (
                                <p className="font-Lexend text-xs text-[#7D8B92]">
                                    Your challenge was dismissed and the bond was not returned. It was added to the losing
                                    pool, which the winners shared. The platform does not keep it.
                                </p>
                            ) : null
                        ) : null}
                    </div>
                )}
            </section>

            <div className="w-full h-[1px] bg-[#1E1E1E]" />

            {/* ---------------- RESULT ---------------- */}
            <section className="flex flex-col gap-3">
                <h3 className="font-Lexend font-semibold text-[10px] uppercase tracking-wide text-[#7D8B92]">Result</h3>

                {displayState === "VOID" ? (
                    <div className="flex flex-col gap-2">
                        <span className="flex items-center gap-2">
                            <MessageRemoveIcon size={16} />
                            <span className="font-Lexend text-xs text-[#FCB4BD]">
                                This market was voided. Every stake is refunded in full. No fee is taken.
                            </span>
                        </span>
                        <p className="font-Lexend text-xs text-[#c6c6c6]">
                            Voided by the platform&apos;s resolver, which is the only account the contract allows to void a
                            market. The contract records the void and the state it was voided from in its event log, and
                            stores no reason code — so this page names the facts it can read instead of guessing a
                            trigger.
                        </p>
                        <p className="font-Lexend text-[10px] text-[#7D8B92]">
                            Void does not mean the forecasters were wrong. It means the question was not answered.
                        </p>
                        {market.distinctStakers === 0 ? (
                            <p className="font-Lexend text-xs text-[#7D8B92]">
                                Nobody placed a forecast, so there is nothing to refund.
                            </p>
                        ) : null}
                    </div>
                ) : market.state === 4 ? (
                    <div className="flex flex-col gap-2">
                        <span className="flex items-center gap-2">
                            <VerifyIcon size={16} />
                            <span className="font-Lexend text-xs text-[#84B9D1]">
                                {outcomeLabel(winningOutcome ?? 0)} won. Result submitted by{" "}
                                {shortAddress(resolution?.resolver ?? "")} on{" "}
                                {formatAbsolute(resolution?.submittedAt ?? 0)}.
                            </span>
                        </span>
                        <p className="font-Lexend text-xs text-[#c6c6c6]">
                            Pool {formatAmount(totalStaked)} {currency} · Fee {formatFeePercent(market.feeBpsSnapshot)} ·
                            Participants {market.distinctStakers}
                        </p>
                        <p className="font-Lexend text-[10px] text-[#7D8B92]">
                            This market is final. No further stakes or challenges are possible.
                        </p>
                    </div>
                ) : market.state === 3 ? (
                    <div className="flex flex-col gap-2">
                        <span className="flex items-center gap-2" role="alert">
                            <Warning2 size={14} color="#fc8181" aria-hidden="true" />
                            <span className="font-Lexend text-xs text-[#fc8181]">
                                Challenged by {shortAddress(challenge?.challenger ?? "")}. Bond{" "}
                                {formatAmount(challenge?.bond ?? BigNumber.from(0))} {currency}. The outcome is not final.
                            </span>
                        </span>
                        <p className="font-Lexend text-xs text-[#c6c6c6]">
                            The submitted result is {outcomeLabel(resolution?.winningOutcome ?? 0)}. This result has been
                            challenged and is not final. The platform decides the outcome by{" "}
                            {formatAbsolute(challengeAdjudicationDeadline)}. If no decision is made by then, anyone can
                            finalise this market and the submitted result stands; the bond then goes to the losing pool,
                            which the winners share and the platform does not keep.
                        </p>
                        {myWinningStake.gt(0) ? (
                            <p className="font-Lexend text-[10px] text-[#7D8B92]">
                                You are on the side the submitted result favours. It still is not final.
                            </p>
                        ) : position?.hasPosition ? (
                            <p className="font-Lexend text-[10px] text-[#7D8B92]">
                                You are on the other side of the submitted result. Any staker may challenge, whichever
                                side they are on.
                            </p>
                        ) : null}
                    </div>
                ) : market.state === 2 ? (
                    <div className="flex flex-col gap-2">
                        <span className="flex items-center gap-2">
                            <VerifyIcon size={16} />
                            <span className="font-Lexend text-xs text-[#84B9D1]">
                                Result submitted —{" "}
                                {challengeWindowOpen
                                    ? `challenge window open until ${formatAbsolute(resolution?.challengeDeadline ?? 0)}`
                                    : `challenge window closed on ${formatAbsolute(resolution?.challengeDeadline ?? 0)}`}
                            </span>
                        </span>
                        <dl className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <dt className="font-Lexend text-[10px] text-[#7D8B92] min-w-[104px]">
                                    Submitted outcome
                                </dt>
                                <dd className="font-Lexend text-xs text-[#E5F7FF]">
                                    {outcomeLabel(resolution?.winningOutcome ?? 0)}
                                </dd>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <dt className="font-Lexend text-[10px] text-[#7D8B92] min-w-[104px]">Submitted by</dt>
                                <dd className="flex items-center gap-2">
                                    <span className="font-Lexend text-xs text-[#E5F7FF]">
                                        {shortAddress(resolution?.resolver ?? "")} (resolver)
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => copy(resolution?.resolver ?? "", "resolver address")}
                                        aria-label={`Copy the resolver address, ${shortAddress(resolution?.resolver ?? "")}`}
                                        className="button-i p-2 focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                                        <Copy size={12} color="#c6c6c6" aria-hidden="true" />
                                    </button>
                                </dd>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <dt className="font-Lexend text-[10px] text-[#7D8B92] min-w-[104px]">Submitted at</dt>
                                <dd className="font-Lexend text-xs text-[#E5F7FF]">
                                    {formatAbsolute(resolution?.submittedAt ?? 0)}
                                </dd>
                            </div>
                            <div className="flex items-start gap-2 flex-wrap">
                                <dt className="font-Lexend text-[10px] text-[#7D8B92] min-w-[104px]">Evidence</dt>
                                <dd className="font-Lexend text-xs text-[#E5F7FF]">
                                    hash {shortenHash(resolution?.evidenceURIHash ?? "")}
                                    <span className="block text-[10px] text-[#7D8B92]">{HASH_DEFINITION}</span>
                                    <span className="block text-[10px] text-[#7D8B92]">
                                        The contract stores the hash of the evidence URI, not the URI, so there is no link
                                        to open from chain data alone.
                                    </span>
                                </dd>
                            </div>
                        </dl>
                        <p className="font-Lexend text-xs text-[#c6c6c6]">
                            This result is not final. A staker can challenge it until the window closes. If nobody
                            challenges it, anyone can finalise it after the window and the result above stands.
                        </p>
                    </div>
                ) : displayState === "RESULT_OVERDUE" ? (
                    <div className="flex flex-col gap-2">
                        <span className="flex items-center gap-2" role="alert">
                            <Warning2 size={14} color="#FBED96" aria-hidden="true" />
                            <span className="font-Lexend text-xs text-[#FBED96]">
                                The result was due by {formatAbsolute(market.resolutionDeadline)} and has not been
                                submitted.
                            </span>
                        </span>
                        <p className="font-Lexend text-xs text-[#c6c6c6]">
                            Every stake is refunded in full once this market is voided. On this deployment only the
                            platform&apos;s resolver can void a market, so this page states the state rather than offering a
                            button that would be refused.
                        </p>
                    </div>
                ) : displayState === "CLOSED" ? (
                    <div className="flex flex-col gap-2">
                        <span className="flex items-center gap-2">
                            <ClockIcon size={16} />
                            <span className="font-Lexend text-xs text-[#7D8B92]">
                                Closed — awaiting result. The result is due by{" "}
                                {formatAbsolute(market.resolutionDeadline)}.
                            </span>
                        </span>
                        <p className="font-Lexend text-[10px] text-[#7D8B92]">
                            If nobody placed a forecast in this market, there is nothing at stake and it will be voided.
                        </p>
                    </div>
                ) : (
                    <p className="font-Lexend text-xs text-[#7D8B92]">
                        The result will be submitted after forecasting closes on{" "}
                        {formatAbsolute(market.lockTS)}.
                    </p>
                )}

                {/* Permissionless liveness: finalise after a lapsed window (§B.1.2). */}
                {canFinalizeNow ? (
                    <div className="flex flex-col gap-2">
                        <p className="font-Lexend text-xs text-[#c6c6c6]">
                            {market.state === 2
                                ? "The challenge window has closed with no challenge, so anyone can finalise this market."
                                : "The challenge was not decided in time, so anyone can finalise this market to the submitted result."}
                        </p>
                        <button
                            type="button"
                            disabled={finalizeTx.isPending || !finalizeTx.write}
                            onClick={() => finalizeTx.write?.()}
                            className={`${
                                finalizeTx.isPending || !finalizeTx.write ? "button-s-d" : "button-s"
                            } font-Lexend text-xs w-full focus-visible:ring-2 focus-visible:ring-[#84B9D1]`}>
                            {finalizeTx.isPending ? "Finalising…" : "Finalise this market"}
                        </button>
                    </div>
                ) : null}

                {/* Challenge (§B.8), as an inline confirmation rather than a fifth surface. */}
                {canChallenge ? (
                    challengeOpen ? (
                        <div className="flex flex-col gap-2 border border-[#212427] rounded-xl p-3">
                            <p className="font-Lexend text-xs text-[#E5F7FF]">Challenge this result</p>
                            <p className="font-Lexend text-xs text-[#c6c6c6]">
                                Submitted: {outcomeLabel(resolution?.winningOutcome ?? 0)}. You forecast:{" "}
                                {outcomeLabel(myBackedOutcome)}.
                            </p>
                            <p className="font-Lexend text-xs text-[#c6c6c6]">
                                Challenge window closes {formatAbsolute(resolution?.challengeDeadline ?? 0)} (
                                {formatWhen(resolution?.challengeDeadline ?? 0, nowSec)}).
                            </p>
                            <p className="font-Lexend text-xs text-[#c6c6c6]">
                                Bond{" "}
                                <span className="text-[#E5F7FF] tabular-nums">
                                    {formatAmount(config?.challengeBond ?? BigNumber.from(0))} {currency}
                                </span>{" "}
                                (fixed for this market, not editable).
                            </p>
                            <p className="font-Lexend text-[10px] text-[#7D8B92]">
                                Bond rule: if the market is voided, the bond is refundable to you. If the challenge lapses
                                without a decision, the market is finalised to the submitted result and the bond is added
                                to the losing pool, which the winners share. The platform never keeps the bond.
                            </p>
                            <div className="flex items-start gap-2">
                                <input
                                    id="challenge-acknowledgement"
                                    type="checkbox"
                                    checked={challengeAcknowledged}
                                    onChange={(event) => setChallengeAcknowledged(event.target.checked)}
                                    className="mt-1 w-4 h-4 shrink-0 accent-[#84B9D1] focus-visible:ring-2 focus-visible:ring-[#84B9D1]"
                                />
                                <label
                                    htmlFor="challenge-acknowledgement"
                                    id="challenge-acknowledgement-label"
                                    className="font-Lexend text-xs text-[#c6c6c6]">
                                    I have read the submitted evidence and I believe the outcome is wrong.
                                </label>
                            </div>
                            <button
                                type="button"
                                disabled={!challengeAcknowledged || challengeTx.isPending || !challengeTx.write}
                                aria-describedby={!challengeAcknowledged ? "challenge-acknowledgement-label" : undefined}
                                onClick={() => challengeTx.write?.()}
                                className={`${
                                    challengeAcknowledged && !challengeTx.isPending && challengeTx.write
                                        ? "button-s"
                                        : "button-s-d"
                                } font-Lexend text-xs w-full focus-visible:ring-2 focus-visible:ring-[#84B9D1]`}>
                                {challengeTx.isPending ? "Posting…" : "Post bond and challenge"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setChallengeOpen(false)}
                                className="button-o font-Lexend text-xs focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setChallengeOpen(true)}
                            className="button-o flex items-center gap-2 w-fit font-Lexend text-xs text-[#E5F7FF] min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                            <Warning2 size={14} color="#FCB4BD" aria-hidden="true" />
                            Challenge this result
                        </button>
                    )
                ) : null}

                {!loggedIn ? (
                    <p className="font-Lexend text-[10px] text-[#7D8B92]">
                        Connect your wallet to see whether you can challenge this result.
                    </p>
                ) : market.state === 2 && !position?.hasPosition ? (
                    <p className="font-Lexend text-[10px] text-[#7D8B92]">
                        Only people who forecast this market can challenge a result.
                    </p>
                ) : null}

                <p className="font-Lexend text-[10px] text-[#7D8B92]">{TRUST_MODEL_LINE}</p>
            </section>

            {inlineMessage ? (
                <p role="alert" className="font-Lexend text-xs text-[#fc8181]">
                    {inlineMessage}
                </p>
            ) : null}

            {testnet ? <p className="font-Lexend text-[10px] text-[#FBED96]">{TESTNET_FUNDS_NOTE}</p> : null}

            {/* H14: "Unclaimed" is a pool fact with no adjacent action. */}
            {market.state === 4 ? (
                <p className="font-Lexend text-[10px] text-[#7D8B92]">
                    Unclaimed amounts stay in the market contract and can be claimed by the address that staked, at any
                    time. Nobody else can claim them and there is no deadline.
                </p>
            ) : null}

            <p className="font-Lexend text-[10px] text-[#7D8B92]">{DISCLAIMER}</p>

            <StakeDialog
                open={stakeOpen}
                setOpen={setStakeOpen}
                marketId={marketId}
                market={market}
                config={config}
                odds={odds}
                position={position}
                outcomeIndex={stakeOutcome}
                chainId={chainId}
                discourse={discourse}
                suppressionReason={suppression}
                nowSec={nowSec}
                onStaked={refreshAll}
            />
        </div>
    );
};

export default MarketDetail;
