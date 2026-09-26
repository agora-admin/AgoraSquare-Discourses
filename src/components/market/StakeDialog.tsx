/**
 * `StakeDialog` — place a forecast (`docs/ux/03` §B.5).
 *
 * The dialog is a guard, not a form (§B.5.2). Its job is to make the four pre-flight checks and
 * the live amount checks *fail in words before anything is signed*, because the contract's reverts
 * for those conditions are all states a user can see coming:
 *
 *   1 Chain           `chain?.id === chainId`            → the "Different chain" sentence + switch
 *   2 Connected       `AppContext.loggedIn`             → handled by the caller (§B.5.2: the
 *                                                          invoking control is replaced by the
 *                                                          connect-wallet affordance)
 *   3 Eligibility     speaker / proposer address        → blocked, with the reason, and the copy
 *                                                          says it is an application rule because
 *                                                          the deployed `stake` has no such guard
 *   4 One side        `getAgoraPosition().stakePerOutcome` → blocked, with the reason
 *
 * Then: empty → minimum → per-account cap → pool cap → balance → the acknowledgement. The submit
 * button is never merely dimmed (§A.8.5): whenever it is unavailable, the sentence that says why
 * is on screen.
 *
 * Nothing here is gated on a client guess about the chain: `stake` itself requires OPEN, not
 * paused, `now < lockTS`, `msg.value >= minStake`, the caps, and the one-side rule, and this dialog
 * mirrors exactly those conditions.
 */

import { Dispatch, SetStateAction, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "@headlessui/react";
import { BigNumber, ethers } from "ethers";
import { CloseCircle, Timer, Warning2 } from "iconsax-react";
import { useBalance, useNetwork, useSwitchNetwork } from "wagmi";
import { v4 as uuid } from "uuid";
import AppContext from "../utils/AppContext";
import { ToastTypes } from "../../lib/Types";
import { getChainName, getCurrencyName } from "../../Constants";
import { VerifyIcon } from "../utils/SvgHub";
import {
    AgoraMarketConfig,
    AgoraMarketView,
    AgoraOdds,
    AgoraPosition,
    useAgoraWrite,
} from "../../web3/agora";
import {
    DiscourseEligibilitySource,
    QUESTION_NOT_STORED,
    RESOLVER_LINE,
    TESTNET_FUNDS_NOTE,
    formatAmount,
    formatFeePercent,
    formatSharePercent,
    formatWhen,
    isTestnetChain,
    marketEligibility,
    outcomeLabel,
    questionHeading,
    templateLine,
} from "./marketDisplay";

export interface StakeDialogProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    marketId: string;
    market: AgoraMarketView;
    config: AgoraMarketConfig | null;
    odds: AgoraOdds | null;
    position: AgoraPosition | null;
    outcomeIndex: number;
    chainId: number;
    /** the discussion's speakers / proposer, for the eligibility check */
    discourse: DiscourseEligibilitySource | null;
    /** the reason the share is suppressed, so the preview never fabricates a percentage */
    suppressionReason: string | null;
    nowSec: number;
    /** refetch the market's numbers after a confirmed stake */
    onStaked: () => void;
}

export const StakeDialog = ({
    open,
    setOpen,
    marketId,
    market,
    config,
    odds,
    position,
    outcomeIndex,
    chainId,
    discourse,
    suppressionReason,
    nowSec,
    onStaked,
}: StakeDialogProps) => {
    const { loggedIn, walletAddress, addToast } = useContext(AppContext);
    const { chain } = useNetwork();
    const { switchNetwork } = useSwitchNetwork();
    const amountRef = useRef<HTMLInputElement>(null);

    const [amount, setAmount] = useState("");
    const [acknowledged, setAcknowledged] = useState(false);
    const [attempted, setAttempted] = useState(false);
    const [touched, setTouched] = useState(false);
    const [reportedError, setReportedError] = useState<string | null>(null);

    const currency = getCurrencyName(chainId);
    const testnet = isTestnetChain(chainId);
    const wrongChain = Boolean(chain?.id) && chain?.id !== chainId;
    const label = outcomeLabel(outcomeIndex);

    const { data: balance } = useBalance({
        address: walletAddress ? (walletAddress as `0x${string}`) : undefined,
        enabled: Boolean(walletAddress),
    });

    const myStakeOnOtherOutcome = useMemo(() => {
        const perOutcome = position?.stakePerOutcome ?? [];
        if ((perOutcome[outcomeIndex] ?? BigNumber.from(0)).gt(0)) {
            return null;
        }
        const otherIndex = perOutcome.findIndex((value) => value && value.gt(0));
        return otherIndex >= 0 ? otherIndex : null;
    }, [position, outcomeIndex]);

    const eligibility = marketEligibility(discourse, walletAddress);
    const stakingClosed = market.lockTS > 0 && nowSec >= market.lockTS;
    const paused = Boolean(config?.stakingPaused);

    const parsedAmount = useMemo(() => {
        const trimmed = amount.trim();
        if (!trimmed) {
            return null;
        }
        try {
            const value = ethers.utils.parseEther(trimmed);
            return value.gt(0) ? value : null;
        } catch {
            return null;
        }
    }, [amount]);

    const minStake = config?.minStake ?? null;
    const accountCap = config?.maxStakePerAccount ?? null;
    const poolCap = config?.poolCap ?? null;
    const stakedByMe = position?.stakedTotal ?? BigNumber.from(0);
    const poolTotal = odds?.totalStaked ?? market.totalStaked;

    const accountCapRemaining =
        accountCap && !accountCap.isZero()
            ? accountCap.sub(stakedByMe).gt(0)
                ? accountCap.sub(stakedByMe)
                : BigNumber.from(0)
            : null;
    const poolCapRemaining =
        poolCap && !poolCap.isZero() ? (poolCap.sub(poolTotal).gt(0) ? poolCap.sub(poolTotal) : BigNumber.from(0)) : null;

    const amountError = useMemo(() => {
        if (!parsedAmount) {
            return amount.trim() ? "Enter a valid amount." : "Enter an amount.";
        }
        if (minStake && parsedAmount.lt(minStake)) {
            return `The minimum is ${formatAmount(minStake)} ${currency}.`;
        }
        if (accountCap && !accountCap.isZero() && stakedByMe.add(parsedAmount).gt(accountCap)) {
            return `This would take you past your cap of ${formatAmount(accountCap)} ${currency}. You have already staked ${formatAmount(
                stakedByMe
            )} ${currency} in this market.`;
        }
        if (poolCap && !poolCap.isZero() && poolTotal.add(parsedAmount).gt(poolCap)) {
            return `This would take the pool past its cap of ${formatAmount(poolCap)} ${currency}. The largest amount that fits right now is ${formatAmount(
                poolCapRemaining
            )} ${currency}.`;
        }
        if (balance && balance.value.lt(parsedAmount)) {
            return `You do not have enough ${currency} for this stake plus gas.`;
        }
        return null;
    }, [parsedAmount, amount, minStake, accountCap, poolCap, currency, stakedByMe, poolTotal, poolCapRemaining, balance]);

    const shareNowBps = odds ? odds.impliedProbBps[outcomeIndex] ?? null : null;
    const shareAfterBps = useMemo(() => {
        if (!parsedAmount || poolTotal.isZero() || shareNowBps === null) {
            return null;
        }
        const poolOnOutcome = odds?.pools[outcomeIndex] ?? BigNumber.from(0);
        const nextTotal = poolTotal.add(parsedAmount);
        if (nextTotal.isZero()) {
            return null;
        }
        return Number(poolOnOutcome.add(parsedAmount).mul(10000).div(nextTotal));
    }, [parsedAmount, poolTotal, odds, outcomeIndex, shareNowBps]);

    const indicativeReturn = odds?.payoutPerEth[outcomeIndex] ?? null;
    const returnText =
        indicativeReturn && !indicativeReturn.isZero()
            ? `${(Number(indicativeReturn.toString()) / 10000).toFixed(2)}×`
            : null;

    // The one condition that must never be predicted wrongly: the chain refuses a stake while the
    // module is paused or the market's lock has passed, so the dialog says the same thing instead.
    const blockedState = paused
        ? "New forecasts are paused. Existing forecasts are unaffected and refunds still work."
        : stakingClosed
        ? `Forecasting closed on ${formatWhen(market.lockTS, nowSec, "past")}. It cannot be extended.`
        : !eligibility.eligible
        ? eligibility.reason
        : myStakeOnOtherOutcome !== null
        ? `You already forecast ${outcomeLabel(myStakeOnOtherOutcome)} in this market.`
        : null;

    const canSubmit =
        !wrongChain &&
        !blockedState &&
        !amountError &&
        Boolean(parsedAmount) &&
        acknowledged &&
        loggedIn;

    // §B.5.2: the button is disabled and the reason is on screen. The acknowledgement's own line is
    // its reason, so it needs no extra sentence.
    const disabledReason = blockedState
        ? blockedState
        : amountError
        ? amountError
        : !acknowledged
        ? "Tick the acknowledgement above to place the forecast."
        : wrongChain
        ? `Switch to ${getChainName(chainId)} to place a forecast.`
        : null;

    // The write is prepared only when every pre-flight check has passed, so a blocked dialog never
    // even asks the wallet for a signature.
    const tx = useAgoraWrite(
        "stake",
        canSubmit && parsedAmount ? [marketId, outcomeIndex] : undefined,
        canSubmit && parsedAmount ? parsedAmount : undefined
    );

    useEffect(() => {
        if (tx.error) {
            setReportedError(tx.error);
            addToast({
                title: "Forecast not placed",
                body: tx.error,
                type: ToastTypes.error,
                duration: 6000,
                id: uuid(),
            });
        }
    }, [tx.error, addToast]);

    useEffect(() => {
        if (tx.isSuccess) {
            onStaked();
        }
    }, [tx.isSuccess, onStaked]);
    const handleClose = () => {
        setOpen(false);
        setAmount("");
        setAcknowledged(false);
        setAttempted(false);
        setTouched(false);
        setReportedError(null);
        tx.reset();
    };

    const handleSubmit = () => {
        setAttempted(true);
        setTouched(true);
        if (!canSubmit || !tx.write) {
            return;
        }
        setReportedError(null);
        addToast({
            title: "Waiting for confirmation",
            body: "Please approve the transaction on your wallet. It may take a few minutes to complete.",
            type: ToastTypes.wait,
            duration: 5000,
            id: uuid(),
        });
        tx.write();
    };

    const showError = (touched || attempted) && Boolean(amountError);
    const busy = tx.isPending;
    const waitingForWallet = busy && !tx.hash;

    return (
        <Dialog
            as="div"
            open={open}
            onClose={handleClose}
            initialFocus={amountRef}
            aria-labelledby="stake-dialog-title"
            aria-describedby={showError ? "stake-dialog-error" : "stake-dialog-subtitle"}
            className="fixed z-20 inset-0 w-screen h-screen overflow-hidden">
            <div className="flex items-center justify-center h-screen backdrop-blur-sm overflow-hidden">
                <Dialog.Overlay className="fixed inset-0 bg-black opacity-0 w-screen h-screen overflow-hidden" />

                <div
                    className={`${
                        open ? "animate-dEnter" : "animate-dExit"
                    } fixed inset-0 xs2:relative bg-[#0A0A0A] xs2:rounded-3xl xs2:max-w-sm w-full p-4 flex flex-col gap-3 overflow-y-auto`}>
                    <div className="flex items-start justify-between gap-3">
                        <h3 id="stake-dialog-title" className="font-Lexend font-semibold text-sm text-white">
                            Place a forecast
                        </h3>
                        <button
                            type="button"
                            onClick={handleClose}
                            aria-label="Close"
                            className="button-i p-2 -m-1 focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                            <CloseCircle size={23} color="#6C6C6C" variant="Bulk" aria-hidden="true" />
                        </button>
                    </div>

                    {/* Success view (§B.5.3) */}
                    {tx.isSuccess ? (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <VerifyIcon size={16} />
                                <h4 className="font-Lexend font-semibold text-sm text-[#ABECD6]">Forecast placed</h4>
                            </div>
                            <p className="font-Lexend text-xs text-[#E5F7FF]">
                                {amount} {currency} on {label}
                            </p>
                            {tx.hash ? (
                                <p className="font-Lexend text-[10px] text-[#7D8B92] break-all">Transaction {tx.hash}</p>
                            ) : null}
                            <p className="font-Lexend text-[10px] text-[#7D8B92]">
                                Your stake stays in the pool until the market settles. It cannot be withdrawn early and
                                it cannot be transferred.
                            </p>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="button-s font-Lexend text-xs focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                                Done
                            </button>
                        </div>
                    ) : (
                        <>
                            <p id="stake-dialog-subtitle" className="font-Lexend text-xs text-[#c6c6c6]">
                                Outcome {outcomeIndex + 1} of {market.outcomeCount} · &ldquo;{label}&rdquo;
                            </p>
                            <p className="font-Lexend text-[10px] text-[#7D8B92]">
                                {questionHeading(marketId)} · {templateLine(market.classId, market.templateId)}.{" "}
                                {QUESTION_NOT_STORED}
                            </p>

                            <div className="w-full h-[1px] bg-[#1E1E1E]" />

                            {wrongChain ? (
                                <div className="flex flex-col gap-3">
                                    <p className="font-Lexend text-xs text-[#fc8181]">
                                        This discussion is on {getChainName(chainId)}. Please switch networks to place a
                                        forecast.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => switchNetwork?.(chainId)}
                                        className="button-s font-Lexend text-xs focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                                        Switch to {getChainName(chainId)}
                                    </button>
                                </div>
                            ) : blockedState ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-start gap-2">
                                        {eligibility.eligible ? (
                                            <Timer size={16} color="#FBED96" aria-hidden="true" />
                                        ) : (
                                            <Warning2 size={16} color="#FBED96" aria-hidden="true" />
                                        )}
                                        <div className="flex flex-col gap-1">
                                            <p className="font-Lexend text-xs text-[#FBED96]" role="status">
                                                {blockedState}
                                            </p>
                                            {eligibility.detail ? (
                                                <p className="font-Lexend text-[10px] text-[#7D8B92]">
                                                    {eligibility.detail}
                                                </p>
                                            ) : null}
                                            {myStakeOnOtherOutcome !== null ? (
                                                <p className="font-Lexend text-[10px] text-[#7D8B92]">
                                                    You can forecast only one outcome in a market. Your stake on{" "}
                                                    {outcomeLabel(myStakeOnOtherOutcome)} can still be added to.
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="button-o font-Lexend text-xs focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col gap-2">
                                        <label
                                            htmlFor="stake-amount"
                                            className="font-Lexend font-semibold text-[10px] uppercase tracking-wide text-[#7D8B92]">
                                            Amount
                                        </label>
                                        <div className="flex items-end gap-2">
                                            <input
                                                id="stake-amount"
                                                ref={amountRef}
                                                value={amount}
                                                onChange={(event) => {
                                                    setAmount(event.target.value);
                                                    setReportedError(null);
                                                    tx.reset();
                                                }}
                                                onBlur={() => setTouched(true)}
                                                inputMode="decimal"
                                                aria-invalid={showError}
                                                aria-describedby={showError ? "stake-dialog-error" : "stake-amount-helper"}
                                                aria-label={`Amount in ${currency}`}
                                                className="input-s w-full font-Lexend text-[#E5F7FF] focus-visible:ring-2 focus-visible:ring-[#84B9D1]"
                                                placeholder="0.0"
                                            />
                                            <span className="font-Lexend text-xs text-[#E5F7FF] pb-3">{currency}</span>
                                        </div>
                                        <p id="stake-amount-helper" className="font-Lexend text-[10px] text-[#7D8B92]">
                                            {minStake && !minStake.isZero()
                                                ? `Minimum ${formatAmount(minStake)} ${currency}`
                                                : "No minimum beyond an amount above zero"}
                                            {accountCapRemaining
                                                ? ` · Your cap remaining ${formatAmount(accountCapRemaining)} ${currency}`
                                                : accountCap && !accountCap.isZero()
                                                ? " · Your cap is fully used"
                                                : " · No per-account cap"}
                                        </p>
                                    </div>

                                    {showError && amountError ? (
                                        <p
                                            id="stake-dialog-error"
                                            role="alert"
                                            className="font-Lexend text-xs text-[#fc8181]">
                                            {amountError}
                                        </p>
                                    ) : null}

                                    {shareNowBps !== null && shareAfterBps !== null ? (
                                        <p className="font-Lexend text-xs text-[#c6c6c6]">
                                            Forecast share now{" "}
                                            <span className="text-[#E5F7FF] tabular-nums">
                                                {formatSharePercent(shareNowBps)}
                                            </span>{" "}
                                            → your stake makes it about{" "}
                                            <span className="text-[#E5F7FF] tabular-nums">
                                                {formatSharePercent(shareAfterBps)}
                                            </span>
                                            <span className="block text-[10px] text-[#7D8B92]">
                                                This is a pool share, not a probability of the outcome happening.
                                            </span>
                                        </p>
                                    ) : suppressionReason ? (
                                        <p role="status" className="font-Lexend text-[10px] text-[#7D8B92]">
                                            {suppressionReason} — no share is shown for this market.
                                        </p>
                                    ) : null}

                                    <p className="font-Lexend text-xs text-[#c6c6c6]">
                                        {returnText ? (
                                            <>
                                                Indicative return{" "}
                                                <span className="text-[#E5F7FF] tabular-nums">{returnText}</span>{" "}
                                                <span className="text-[#7D8B92]">
                                                    (indicative — moves as the pool changes, not a quote)
                                                </span>
                                            </>
                                        ) : (
                                            "The indicative return appears when the pool has stake on this outcome."
                                        )}
                                    </p>

                                    <p className="font-Lexend text-xs text-[#c6c6c6]">
                                        Fee on winnings{" "}
                                        <span className="text-[#E5F7FF] tabular-nums">
                                            {formatFeePercent(market.feeBpsSnapshot)}
                                        </span>
                                        <span className="block text-[10px] text-[#7D8B92]">
                                            The fee is fixed when the market opens and has no effect on a refund.
                                        </span>
                                    </p>

                                    <p className="font-Lexend text-[10px] text-[#7D8B92]">{RESOLVER_LINE}</p>

                                    <p className="font-Lexend text-[10px] text-[#7D8B92]">
                                        One side only. You can forecast one outcome in this market.
                                    </p>

                                    <div className="w-full h-[1px] bg-[#1E1E1E]" />

                                    <div className="flex items-start gap-2">
                                        <input
                                            id="stake-acknowledgement"
                                            type="checkbox"
                                            checked={acknowledged}
                                            onChange={(event) => setAcknowledged(event.target.checked)}
                                            className="mt-1 w-4 h-4 shrink-0 accent-[#84B9D1] focus-visible:ring-2 focus-visible:ring-[#84B9D1]"
                                        />
                                        <label
                                            htmlFor="stake-acknowledgement"
                                            id="stake-acknowledgement-label"
                                            className="font-Lexend text-xs text-[#c6c6c6]">
                                            I understand this is a forecast, not a prediction. Most participants lose
                                            money, and this stake cannot be withdrawn before settlement.
                                        </label>
                                    </div>

                                    {reportedError ? (
                                        <p role="alert" className="font-Lexend text-xs text-[#fc8181]">
                                            {reportedError}
                                        </p>
                                    ) : null}

                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={!canSubmit || busy}
                                        aria-describedby={!acknowledged ? "stake-acknowledgement-label" : undefined}
                                        className={`${
                                            canSubmit && !busy ? "button-s" : "button-s-d"
                                        } font-Lexend text-xs flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#84B9D1]`}>
                                        {waitingForWallet ? "Waiting for your wallet" : busy ? "Placing…" : "Place forecast"}
                                    </button>

                                    {disabledReason ? (
                                        <p role="status" className="font-Lexend text-[10px] text-[#7D8B92]">
                                            {disabledReason}
                                        </p>
                                    ) : null}

                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="button-o font-Lexend text-xs focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                                        Cancel
                                    </button>
                                </>
                            )}
                        </>
                    )}

                    {testnet ? (
                        <p className="font-Lexend text-[10px] text-[#FBED96] mt-auto">{TESTNET_FUNDS_NOTE}</p>
                    ) : null}
                </div>
            </div>
        </Dialog>
    );
};

export default StakeDialog;
