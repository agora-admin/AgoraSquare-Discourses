/**
 * `OutcomeRow` — one outcome of a 2–8 outcome market (`docs/ux/03` §B.4.5), shared by the market
 * detail panel and, below `mobile`, by the strip card (which replaces its share bar with this row
 * list per §B.3.6).
 *
 * The rules this component is the only place to get wrong, and does not:
 *  - §B.4.5 / §A.10.4: the share is rendered by `marketDisplay.formatSharePercent` and only when
 *    the caller passes `shareBps`. A suppressed share renders the reason, in words, instead.
 *  - §B.4.5: the share never appears alone — the pool amount and the participant count live in the
 *    same visual block, and the accessible name is one sentence, not six fragments.
 *  - §B.4.5: the indicative return is always visible on a 2-outcome market and behind an explicit
 *    expansion on a market with 3 or more, because it is the number most easily read as a quote.
 *  - §B.4.7: the colour comes from the fixed order, so the same outcome keeps its colour
 *    everywhere.
 *  - §A.8.5: a row that cannot be acted on is not silently dimmed; it states why.
 */

import { useState } from "react";
import { ArrowCircleRight, ArrowDown2, ArrowUp2, Warning2 } from "iconsax-react";
import { BigNumber } from "ethers";
import { VerifyIcon } from "../utils/SvgHub";
import {
    formatAmount,
    formatSharePercent,
    outcomeColor,
    outcomeLabel,
} from "./marketDisplay";

export interface OutcomeRowProps {
    index: number;
    /** wei staked on this outcome, or `null` while the read is in flight */
    poolWei: BigNumber | null;
    /** the share in basis points, or `null` when it is suppressed */
    shareBps: number | null;
    /** why the share is suppressed; required whenever `shareBps` is `null` */
    suppressionReason: string | null;
    /** parimutuel payout per unit staked, scaled by 10 000 */
    payoutPerUnit: BigNumber | null;
    currency: string;
    /** the viewer's own stake on this outcome */
    myStakeWei?: BigNumber | null;
    /** §B.4.5: true when `outcomeCount == 2` */
    alwaysShowReturn: boolean;
    /** false on the strip card, where a per-row return control would be noise */
    showReturnControl?: boolean;
    /** omitted when the row is not interactive (forecasting closed, or the viewer is ineligible) */
    onForecast?: () => void;
    /** §A.8.5 — the reason the row's action is unavailable, shown in text next to it */
    forecastDisabledReason?: string | null;
    /** set on a VOID market: the split is a record, not a forecast (§B.4.2) */
    splitLabel?: string | null;
    /** §B.11.2 — the valueless marker travels with every amount on a non-value deployment */
    testnet: boolean;
    /** compact rendering for the strip card's stacked list */
    compact?: boolean;
}

export const OutcomeRow = ({
    index,
    poolWei,
    shareBps,
    suppressionReason,
    payoutPerUnit,
    currency,
    myStakeWei,
    alwaysShowReturn,
    showReturnControl = true,
    onForecast,
    forecastDisabledReason,
    splitLabel,
    testnet,
    compact = false,
}: OutcomeRowProps) => {
    const [showReturn, setShowReturn] = useState(false);

    const label = outcomeLabel(index);
    const color = outcomeColor(index);
    const amount = formatAmount(poolWei);
    const shareText = shareBps === null ? null : formatSharePercent(shareBps);
    const returnText =
        payoutPerUnit && !payoutPerUnit.isZero()
            ? `${(Number(payoutPerUnit.toString()) / 10000).toFixed(2)}×`
            : null;
    const returnVisible = (alwaysShowReturn || showReturn) && Boolean(shareText);
    const myStake = myStakeWei && !myStakeWei.isZero() ? formatAmount(myStakeWei) : null;
    const hasMyStake = Boolean(myStake);

    // §B.4.5: one utterance for the whole row.
    const accessibleName = [
        label,
        shareText ? `forecast share ${shareText.replace("%", " percent")}` : suppressionReason ?? "forecast share not shown",
        amount ? `${amount} ${currency} in the pool` : "pool not readable",
        returnVisible && returnText ? `indicative return ${returnText.replace("×", " times")}` : null,
        hasMyStake ? `you forecast ${myStake} ${currency} on this outcome` : null,
    ]
        .filter(Boolean)
        .join(", ");

    return (
        <li
            aria-label={accessibleName}
            className={`flex flex-col gap-2 ${compact ? "py-2" : "py-3"} border-b border-[#1E1E1E] last:border-b-0`}>
            <div className="flex items-center gap-3 flex-wrap">
                <span
                    aria-hidden="true"
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                />
                <span className="font-Lexend text-xs sm:text-sm text-[#E5F7FF] min-w-[64px]">{label}</span>

                {shareText ? (
                    <span className="font-Lexend text-sm text-[#E5F7FF] tabular-nums">{shareText}</span>
                ) : (
                    <span role="status" className="font-Lexend text-[10px] xs:text-xs text-[#7D8B92]">
                        {suppressionReason}
                    </span>
                )}

                <span className="font-Lexend text-xs text-[#c6c6c6] tabular-nums ml-auto sm:ml-0">
                    {amount ? `${amount} ${currency}` : "—"}
                    {testnet ? <span className="text-[#7D8B92]"> · test network funds</span> : null}
                </span>

                {myStake ? (
                    <span className="flex items-center gap-1">
                        <VerifyIcon size={14} />
                        <span className="font-Lexend text-[10px] uppercase tracking-wide text-[#ABECD6]">
                            You forecast this outcome
                        </span>
                    </span>
                ) : null}
            </div>

            {splitLabel && !compact ? (
                <span className="font-Lexend text-[10px] text-[#7D8B92]">{splitLabel}</span>
            ) : null}

            <div className="flex items-center gap-3 flex-wrap">
                {showReturnControl && alwaysShowReturn ? (
                    returnVisible && returnText ? (
                        <span className="font-Lexend text-xs text-[#c6c6c6]">
                            indicative return <span className="text-[#E5F7FF] tabular-nums">{returnText}</span>
                            <span className="text-[#7D8B92]"> — moves as the pool changes. Not a quote.</span>
                        </span>
                    ) : null
                ) : showReturnControl ? (
                    <button
                        type="button"
                        onClick={() => setShowReturn((previous) => !previous)}
                        aria-expanded={showReturn}
                        className="button-o flex items-center gap-1 font-Lexend text-[10px] uppercase tracking-wide text-[#E5F7FF] focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                        {showReturn ? "Hide the indicative return" : "Show the indicative return"}
                        {showReturn ? <ArrowUp2 size={12} /> : <ArrowDown2 size={12} />}
                    </button>
                ) : null}

                {showReturn && returnText && !alwaysShowReturn ? (
                    <span className="font-Lexend text-xs text-[#c6c6c6]">
                        indicative <span className="text-[#E5F7FF] tabular-nums">{returnText}</span>
                        <span className="text-[#7D8B92]"> — moves as the pool changes. Not a quote.</span>
                    </span>
                ) : null}

                {onForecast && !forecastDisabledReason ? (
                    <button
                        type="button"
                        onClick={onForecast}
                        className="button-o flex items-center gap-1 font-Lexend text-xs text-[#E5F7FF] min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                        Forecast
                        <ArrowCircleRight size={14} variant="Bulk" aria-hidden="true" />
                    </button>
                ) : null}

                {forecastDisabledReason ? (
                    <span className="flex items-start gap-2">
                        <Warning2 size={14} color="#7D8B92" aria-hidden="true" />
                        {/* §A.8.5: a disabled control states its reason in text. */}
                        <span className="font-Lexend text-[10px] xs:text-xs text-[#7D8B92]">
                            {forecastDisabledReason}
                        </span>
                    </span>
                ) : null}
            </div>
        </li>
    );
};

export default OutcomeRow;
