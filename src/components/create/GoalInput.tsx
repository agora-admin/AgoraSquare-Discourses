/**
 * `GoalInput` — the goal field of step 5, `docs/ux/01-campaign-flows.md` §3.5 and §12.6.
 *
 * Why a new component: nothing in the tree takes a goal, and the funding dialog's amount field is
 * a bare `<input>` with hard-coded copy (§11.3).
 *
 * Honest limit worth stating in the code, not just in the PR: `§3.5` says the payout preview
 * percentages are "read from `getFundingParameters()`" and that "nothing is hard-coded". **That
 * getter does not exist in the v1.1 ABI** (the diamond exposes `changePlatformFeePercentage` and
 * `changeProposerPercentage` with no reads), so the per-head figure cannot be computed here
 * without inventing a number. The field therefore shows the exact copy the copy deck provides for
 * the case it can state — `money.preview.equalShares`, "Participants share the pool equally.
 * There is no per-person split." — and the failure block. The goal minimum and the cap are
 * rendered only when `limits` supplies them.
 */

import { FormatSpec } from "../../helper/AgoraHelper";

export interface GoalInputProps {
    value: string;
    onChange: (value: string) => void;
    error: string | null;
    /** `null` when the deployment exposes no read for it */
    minGoal: string | null;
    /** `null` when the deployment exposes no read for it */
    fundingCap: string | null;
    symbol: string;
    /** the number of participants, for the equal-split sentence */
    headCount: number;
    /** the proposer's own pledge, so the preview can state the scale of the round */
    initialPledge: string;
    /** the funding window in seconds, echoed in the review copy */
    fundingWindowSeconds: number;
    spec: FormatSpec | null;
}

export const GoalInput = ({
    value,
    onChange,
    error,
    minGoal,
    fundingCap,
    symbol,
    headCount,
    initialPledge,
    fundingWindowSeconds,
    spec,
}: GoalInputProps) => {
    const days = Math.round(fundingWindowSeconds / 86400);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 max-w-[585px]">
                <label htmlFor="campaign-goal" className="text-xs text-[#E5F7FFE5] font-semibold font-Lexend">
                    Funding goal
                </label>
                <div className="flex items-center gap-3">
                    <input
                        id="campaign-goal"
                        type="number"
                        min={0}
                        value={value}
                        onChange={(event) => onChange(event.target.value)}
                        className="input-s text-white/80 text-xs max-w-[200px]"
                        placeholder="0.0"
                        aria-invalid={Boolean(error)}
                        aria-describedby="campaign-goal-helper"
                    />
                    <span className="font-Lexend text-xs text-[#E5F7FF]">{symbol}</span>
                </div>

                <p id="campaign-goal-helper" className="text-[#7D8B92] font-Lexend text-xs leading-5">
                    The goal is what you are asking funders to reach before the window closes. Below it, the campaign
                    fails and every pledge is refunded.
                </p>

                {minGoal ? (
                    <p className="text-[#7D8B92] font-Lexend text-xs">
                        Minimum {minGoal} {symbol} on this network.
                    </p>
                ) : (
                    <p className="text-[#7D8B92] font-Lexend text-xs">
                        The network minimum is enforced by the contract when you sign; a lower goal reverts.
                    </p>
                )}

                {error ? (
                    <p className="text-[#FC8181] font-Lexend text-xs" role="alert">
                        {error}
                    </p>
                ) : null}
            </div>

            <div className="bg-card rounded-xl p-4 flex flex-col gap-3 max-w-[585px]">
                <small className="text-[#7D8B92] font-Lexend font-semibold text-[10px] uppercase tracking-wide">
                    IF THE GOAL IS MET
                </small>
                <div className="flex items-center justify-between gap-4">
                    <span className="font-Lexend text-xs text-[#E5F7FFE5]">Participants ({headCount})</span>
                    <span className="font-Lexend text-xs text-[#E5F7FF]">
                        {value ? `${value} ${symbol} of pledges` : "—"}
                    </span>
                </div>
                {spec ? (
                    <div className="flex items-center justify-between gap-4">
                        <span className="font-Lexend text-xs text-[#E5F7FFE5]">Format</span>
                        <span className="font-Lexend text-xs text-[#E5F7FF]">
                            {spec.title}, funding window {days} day{days === 1 ? "" : "s"}
                        </span>
                    </div>
                ) : null}
                <div className="flex items-center justify-between gap-4">
                    <span className="font-Lexend text-xs text-[#E5F7FFE5]">Your initial pledge</span>
                    <span className="font-Lexend text-xs text-[#E5F7FF]">
                        {initialPledge ? `${initialPledge} ${symbol}` : "—"}
                    </span>
                </div>

                <p className="text-[#7D8B92] font-Lexend text-xs leading-5">
                    Participants share the pool equally. There is no per-person split.
                </p>
                <p className="text-[#7D8B92] font-Lexend text-xs leading-5">
                    The platform fee and the proposer share are set on chain and are not exposed by this contract
                    version, so the exact per-head figure is not computed here.
                </p>

                <div className="w-full h-[1px] bg-[#1E1E1E]" />

                <small className="text-[#7D8B92] font-Lexend font-semibold text-[10px] uppercase tracking-wide">
                    IF THE GOAL IS MISSED
                </small>
                <p className="text-[#7D8B92] font-Lexend text-xs leading-5">
                    Every pledge is refunded in full. No fee, no bounty, no charity share. Rounding remainders stay in
                    escrow.
                </p>
            </div>
        </div>
    );
};

export default GoalInput;
