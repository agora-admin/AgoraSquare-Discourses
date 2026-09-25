/**
 * `MarketStrip` — the forecasts section of a discussion page (`docs/ux/03` §B.2 surface 1,
 * §B.3). Mounted additively next to the roster strip; it renders nothing unless
 * `getDiscourseFormat(propId) == 1`, so a legacy proposal's page is unchanged.
 *
 * What the strip is careful about:
 *  - §B.1.1/H4: the badge is derived once, in `marketDisplay.deriveDisplayState`, and `CHALLENGED`
 *    and `VOID` are never worded as a settled market.
 *  - §B.3.6: the share bar exists at ≥ 640px and is replaced by a stacked outcome list below it,
 *    where a three-segment bar under 320px of card width is illegible.
 *  - H2/H3: a suppressed share shows the reason instead, and pool depth and the participant count
 *    are always rendered next to it.
 *  - H12: nothing here reads `d.dispute[propId]`. A discussion's dispute is not a market's state.
 *  - §B.3.5: the disclaimer sentence is verbatim and is not dismissible.
 */

import { useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowCircleRight, Timer, Warning2 } from "iconsax-react";
import { BigNumber } from "ethers";
import {
    useAgoraConfig,
    useAgoraMarket,
    useAgoraMarketsByProposal,
    useAgoraOdds,
    useAgoraPosition,
    useAgoraResolution,
    useAgoraStakingOpen,
    useDiscourseFormat,
} from "../../web3/agora";
import AppContext from "../utils/AppContext";
import { getCurrencyName } from "../../Constants";
import { ClockIcon, MessageRemoveIcon, VerifyIcon } from "../utils/SvgHub";
import OutcomeRow from "./OutcomeRow";
import MarketDetail from "./MarketDetail";
import {
    DISCLAIMER,
    DiscourseEligibilitySource,
    DISPLAY_STATE_META,
    DisplayStateInput,
    TESTNET_FUNDS_NOTE,
    deriveDisplayState,
    displayStateLabel,
    forecastSuppressionReason,
    formatAmount,
    formatPercentOfCap,
    formatSharePercent,
    isTestnetChain,
    marketEligibility,
    outcomeColor,
    outcomeLabel,
    questionHeading,
    ratioBps,
    templateLine,
} from "./marketDisplay";

export interface MarketStripProps {
    propId: number | string;
    chainId: number;
    /** the discussion, for the eligibility check and the funding window */
    discourseData: DiscourseEligibilitySource | null;
}

/** The contract allows four markets that are not settled at a time, per discussion. */
const MAX_OPEN_MARKETS = 4;

export const MarketStrip = ({ propId, chainId, discourseData }: MarketStripProps) => {
    const { walletAddress } = useContext(AppContext);
    const router = useRouter();
    const { format } = useDiscourseFormat(propId);
    const { marketIds, isLoading, isError, refetch } = useAgoraMarketsByProposal(propId, format === 1);
    const { config } = useAgoraConfig();
    const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000));

    useEffect(() => {
        const timer = setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 60_000);
        return () => clearInterval(timer);
    }, []);

    const openMarketId = typeof router.query.market === "string" ? router.query.market : null;
    const selected = useMemo(
        () => (openMarketId ? marketIds.find((id) => id.toLowerCase() === openMarketId.toLowerCase()) ?? null : null),
        [openMarketId, marketIds]
    );

    // A legacy proposal, an unreadable format, or a read error on the format renders nothing at
    // all: this section only exists for an Agora discussion.
    if (format !== 1) {
        return null;
    }

    const currency = getCurrencyName(chainId);
    const testnet = isTestnetChain(chainId);
    const fundingOver = Boolean(discourseData?.endTS) && Number(discourseData?.endTS) < nowSec;

    const openDetail = (marketId: string) => {
        router.push({ pathname: router.pathname, query: { ...router.query, market: marketId } }, undefined, {
            shallow: true,
        });
    };

    const closeDetail = () => {
        const { market, ...rest } = router.query;
        router.push({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
    };

    return (
        <section aria-labelledby="market-strip-heading" className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h2
                        id="market-strip-heading"
                        className="font-Lexend font-semibold text-[10px] uppercase tracking-wide text-[#E5F7FF]">
                        Forecasts
                    </h2>
                    {marketIds.length >= MAX_OPEN_MARKETS ? (
                        <small className="font-Lexend text-[10px] text-[#7D8B92]">
                            {marketIds.length} forecasts on this discussion. The contract allows {MAX_OPEN_MARKETS} markets
                            that are not settled at a time.
                        </small>
                    ) : null}
                </div>
                <p className="font-Lexend text-[10px] xs:text-xs text-[#7D8B92]">
                    A forecast is made before the discussion starts. It cannot be changed or cashed out.
                </p>
                {config?.stakingPaused ? (
                    <p role="status" className="font-Lexend text-[10px] xs:text-xs text-[#FBED96]">
                        New forecasts are paused. Existing forecasts are unaffected and refunds still work.
                    </p>
                ) : null}
                {testnet ? (
                    <p className="font-Lexend text-[10px] text-[#FBED96]">{TESTNET_FUNDS_NOTE}</p>
                ) : null}
            </div>

            {selected ? (
                <MarketDetail
                    marketId={selected}
                    chainId={chainId}
                    discourse={discourseData}
                    onBack={closeDetail}
                />
            ) : isLoading && marketIds.length === 0 ? (
                <div className="flex flex-col gap-3" aria-live="polite">
                    {[0, 1, 2].map((row) => (
                        <div
                            key={row}
                            className="bg-card rounded-xl p-4 h-16 animate-pulse motion-reduce:animate-none"
                            aria-hidden="true"
                        />
                    ))}
                    <p className="font-Lexend text-xs text-[#7D8B92]">Reading the forecasts…</p>
                </div>
            ) : isError ? (
                <div className="bg-card rounded-xl p-4 flex flex-col gap-3">
                    <p role="alert" className="font-Lexend text-xs text-[#fc8181]">
                        Forecasts could not be loaded.
                    </p>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="button-o w-fit font-Lexend text-xs text-[#E5F7FF] min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                        Try again
                    </button>
                </div>
            ) : marketIds.length === 0 ? (
                <div className="bg-card rounded-xl p-4 flex flex-col gap-2">
                    <p className="font-Lexend text-xs text-[#E5F7FF]">
                        {fundingOver
                            ? "No forecasts were opened on this discussion."
                            : "No forecasts on this discussion yet."}
                    </p>
                    {!fundingOver ? (
                        <p className="font-Lexend text-[10px] text-[#7D8B92]">
                            Forecasts can be opened by the discussion&apos;s backers while funding is open.
                        </p>
                    ) : null}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {marketIds.map((marketId) => (
                        <MarketCard
                            key={marketId}
                            marketId={marketId}
                            chainId={chainId}
                            currency={currency}
                            testnet={testnet}
                            discourse={discourseData}
                            configPoolCap={config?.poolCap ?? null}
                            minDistinctPositions={config?.minDistinctPositions ?? 2}
                            stakingPaused={Boolean(config?.stakingPaused)}
                            nowSec={nowSec}
                            onDetails={() => openDetail(marketId)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

interface MarketCardProps {
    marketId: string;
    chainId: number;
    currency: string;
    testnet: boolean;
    discourse: DiscourseEligibilitySource | null;
    configPoolCap: BigNumber | null;
    minDistinctPositions: number;
    stakingPaused: boolean;
    nowSec: number;
    onDetails: () => void;
}

const MarketCard = ({
    marketId,
    chainId,
    currency,
    testnet,
    discourse,
    configPoolCap,
    minDistinctPositions,
    stakingPaused,
    nowSec,
    onDetails,
}: MarketCardProps) => {
    const { loggedIn, walletAddress } = useContext(AppContext);

    const { market } = useAgoraMarket(marketId);
    // The market's snapshotted fee must reach the payout maths, or the indicative return is gross.
    const { odds } = useAgoraOdds(marketId, true, market?.feeBpsSnapshot ?? 0);
    const { stakingOpen } = useAgoraStakingOpen(marketId);
    const { position } = useAgoraPosition(marketId, walletAddress || undefined);
    const { resolution } = useAgoraResolution(marketId);

    const eligibility = marketEligibility(discourse, walletAddress);

    if (!market) {
        return (
            <div className="bg-card rounded-xl p-4">
                <p className="font-Lexend text-xs text-[#7D8B92]">Reading this forecast…</p>
            </div>
        );
    }

    const displayStateInput: DisplayStateInput = {
        state: market.state,
        stakingOpen,
        lockTS: market.lockTS,
        resolutionDeadline: market.resolutionDeadline,
        challengeDeadline: resolution?.challengeDeadline ?? 0,
        nowSec,
    };
    const displayState = deriveDisplayState(displayStateInput);
    const badge = DISPLAY_STATE_META[displayState];

    const totalStaked = odds?.totalStaked ?? market.totalStaked;
    const pools = odds?.pools ?? null;
    const suppression = forecastSuppressionReason({
        poolCap: configPoolCap,
        totalStaked,
        participants: market.distinctStakers,
        minDistinctPositions,
    });
    const shareBps = pools && !totalStaked.isZero() ? pools.map((pool) => ratioBps(pool, totalStaked)) : null;
    const capLine = configPoolCap && !configPoolCap.isZero() ? formatAmount(configPoolCap) : null;
    const capUsed = configPoolCap && !configPoolCap.isZero() ? formatPercentOfCap(totalStaked, configPoolCap) : null;

    const forecastingOpen = displayState === "FORECASTING" || displayState === "CLOSING_SOON";
    const canForecast = forecastingOpen && loggedIn && eligibility.eligible && !stakingPaused;

    const shareBarLabel = `Forecast share: ${Array.from({ length: market.outcomeCount })
        .map((_, index) =>
            shareBps && suppression === null
                ? `${outcomeLabel(index)} ${formatSharePercent(shareBps[index] ?? 0).replace("%", " percent")}`
                : outcomeLabel(index)
        )
        .join(", ")}.`;

    const myBackedOutcome = position?.stakePerOutcome
        ? position.stakePerOutcome.findIndex((value) => value && value.gt(0))
        : -1;

    return (
        <article
            role="group"
            aria-labelledby={`market-card-${marketId}`}
            className="bg-card rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="flex items-center gap-2">
                    {badge.glyph === "verify" ? <VerifyIcon size={16} /> : null}
                    {badge.glyph === "void" ? <MessageRemoveIcon size={16} /> : null}
                    {badge.glyph === "clock" ? <ClockIcon size={16} /> : null}
                    {badge.glyph === "warning" ? <Warning2 size={14} color={badge.color} aria-hidden="true" /> : null}
                    {badge.glyph === "timer" ? <Timer size={14} color={badge.color} aria-hidden="true" /> : null}
                    <span className="font-Lexend text-[10px] uppercase tracking-wide" style={{ color: badge.color }}>
                        {displayStateLabel(displayState, nowSec, displayStateInput)}
                    </span>
                </span>
                <small className="font-Lexend text-[10px] text-[#7D8B92]">{templateLine(market.classId, market.templateId)}</small>
            </div>

            <div className="flex flex-col gap-1">
                <h3 id={`market-card-${marketId}`} className="font-Lexend font-semibold text-xs text-[#E5F7FF]">
                    {questionHeading(marketId)}
                </h3>
                <small className="font-Lexend text-[10px] text-[#7D8B92]">
                    The question text is generated from the closed template this market was opened with, and is not
                    stored on chain.
                </small>
            </div>

            {/* ≥ 640px: the share bar. Below `mobile` it is replaced by the outcome list (§B.3.6). */}
            {suppression === null && shareBps ? (
                <div
                    role="img"
                    aria-label={shareBarLabel}
                    className="hidden sm:flex w-full h-3 rounded-full overflow-hidden">
                    {Array.from({ length: market.outcomeCount }).map((_, index) => (
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
            ) : null}

            {suppression !== null ? (
                <p role="status" className="hidden sm:block font-Lexend text-[10px] xs:text-xs text-[#7D8B92]">
                    {suppression}
                </p>
            ) : null}

            <ul className="flex flex-col sm:hidden">
                {Array.from({ length: market.outcomeCount }).map((_, index) => (
                    <OutcomeRow
                        key={index}
                        index={index}
                        poolWei={pools?.[index] ?? null}
                        shareBps={suppression === null ? shareBps?.[index] ?? null : null}
                        suppressionReason={suppression}
                        payoutPerUnit={odds?.payoutPerEth?.[index] ?? null}
                        currency={currency}
                        myStakeWei={position?.stakePerOutcome?.[index] ?? null}
                        alwaysShowReturn={false}
                        showReturnControl={false}
                        testnet={testnet}
                        compact
                    />
                ))}
            </ul>

            <p className="font-Lexend text-[10px] xs:text-xs text-[#c6c6c6]">
                {formatAmount(totalStaked)} {currency} pool · {market.distinctStakers} participant
                {market.distinctStakers === 1 ? "" : "s"}
                <span className="block text-[10px] text-[#7D8B92]">
                    {capLine ? `Cap ${capLine} ${currency} · ${capUsed} used` : "No cap configured"}
                </span>
            </p>

            {myBackedOutcome >= 0 ? (
                <p className="font-Lexend text-[10px] text-[#ABECD6]">
                    You forecast {outcomeLabel(myBackedOutcome)} in this market.
                </p>
            ) : null}

            <div className="flex items-center gap-3 flex-wrap">
                {canForecast ? (
                    <button
                        type="button"
                        onClick={onDetails}
                        className="button-s flex items-center gap-2 font-Lexend text-xs min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                        Forecast
                        <ArrowCircleRight size={14} variant="Bulk" aria-hidden="true" />
                    </button>
                ) : null}
                <button
                    type="button"
                    onClick={onDetails}
                    className="button-o font-Lexend text-xs text-[#E5F7FF] min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                    Details
                </button>
            </div>

            {/* Where the action would be, say why it is not: §B.11.1's placement rule. */}
            {!canForecast && forecastingOpen && loggedIn ? (
                <p role="status" className="font-Lexend text-[10px] text-[#7D8B92]">
                    {stakingPaused
                        ? "New forecasts are paused. Existing forecasts are unaffected and refunds still work."
                        : !eligibility.eligible
                        ? `${eligibility.reason} ${eligibility.detail ?? ""}`
                        : null}
                </p>
            ) : null}

            {!loggedIn && forecastingOpen ? (
                <Link href="/link" passHref>
                    <a className="button-s w-fit font-Lexend text-xs min-h-[44px] flex items-center focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                        Connect wallet to forecast
                    </a>
                </Link>
            ) : null}

            <p className="font-Lexend text-[10px] text-[#7D8B92] mt-auto">{DISCLAIMER}</p>
        </article>
    );
};

export default MarketStrip;
