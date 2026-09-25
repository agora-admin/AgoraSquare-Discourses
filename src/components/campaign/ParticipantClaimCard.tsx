/**
 * `ParticipantClaimCard` — S-X1 in `docs/ux/01-campaign-flows.md` §7.1.
 *
 * Index-keyed payouts. The legacy `FundClaimCardC` branches on `prop_starter` and calls
 * `speakerWithdraw` / `proposerWithdraw`, which are **deliberately unreachable** for an Agora
 * campaign (`docs/eng/03` §3.1 F4 zeroes the legacy speaker slots), so reusing it for format 1
 * would call a function that can never pay a roster participant. This card calls
 * `participantWithdraw(propId, index)` instead, and `src/components/discoursePage/FundClaimStep.tsx`
 * keeps the legacy card for format 0 exactly as it is.
 *
 * The slot is found by address, not by index-supplied-by-the-user: the card reads
 * `getParticipants(propId)` and matches the connected wallet to a slot, which is why the
 * "not a participant" state renders nothing at all.
 *
 * Known gap, reported rather than papered over: `d.unlockingFundsDelay[propId]` — the timestamp
 * the "before the window" copy needs — has **no public getter** in the v1.1 ABI, so the caller
 * passes `claimOpensAt` (the indexer's `meet_date + 3 days`, the same source `FundClaimCardC`
 * already uses). Pass `undefined` and the button is rendered and left to the chain's own gate.
 */

import { useContext, useMemo, useState } from "react";
import { MoneySend, ArrowCircleRight } from "iconsax-react";
import { BigNumber, ethers } from "ethers";
import AppContext from "../utils/AppContext";
import { useDiscourseFormat, useAgoraParticipants, useParticipantWithdraw, useParticipantWithdrawAmount } from "../../web3/agora";
import { ROLE_LABEL, RoleKey } from "../../helper/AgoraHelper";
import { useNetwork, useWaitForTransaction } from "wagmi";
import { getChainName, getCurrencyName } from "../../Constants";
import { formatDate } from "../../helper/TimeHelper";
import { shortAddress } from "../../helper/StringHelper";

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

/** 1.060000000000000000 → "1.06"; 2.000000000000000000 → "2". */
const trimAmount = (value: string): string => {
    const [whole, fraction = ""] = value.split(".");
    const trimmed = fraction.replace(/0+$/, "").slice(0, 4);
    return trimmed.length > 0 ? `${whole}.${trimmed}` : whole;
};

export interface ParticipantClaimCardProps {
    propId: number | string;
    chainId: number;
    /** unix seconds the claim window opens; `undefined` leaves the timing to the chain */
    claimOpensAt?: number;
    /** true while `d.dispute[propId]` holds, from the caller */
    disputed?: boolean;
    /** index → plaintext handle, when the indexer supplies one */
    handles?: Record<number, string>;
}

export const ParticipantClaimCard = ({
    propId,
    chainId,
    claimOpensAt,
    disputed = false,
    handles,
}: ParticipantClaimCardProps) => {
    const { loggedIn, walletAddress } = useContext(AppContext);
    const { chain } = useNetwork();

    const { format } = useDiscourseFormat(propId);
    const { participants } = useAgoraParticipants(propId, format === 1);

    const mySlot = useMemo(
        () =>
            participants.find(
                (participant) =>
                    walletAddress && participant.addr.toLowerCase() === walletAddress.toLowerCase()
            ) ?? null,
        [participants, walletAddress]
    );

    const { amount } = useParticipantWithdrawAmount(propId, mySlot?.index, Boolean(mySlot));
    const withdraw = useParticipantWithdraw(propId, mySlot?.index, Boolean(mySlot) && format === 1);
    const [submitted, setSubmitted] = useState(false);

    useWaitForTransaction({
        hash: withdraw.hash as `0x${string}` | undefined,
        onSuccess: () => setSubmitted(true),
    });

    // Format 0 is the legacy card's job, and a viewer who holds no slot gets no card.
    if (format !== 1 || !mySlot) {
        return null;
    }

    const symbol = getCurrencyName(chainId);
    const roleLabel = ROLE_LABEL[roleKeyFromConstant(mySlot.role)];
    const slotLabel = `slot ${mySlot.index + 1} of ${participants.length}`;
    const handle = handles?.[mySlot.index];
    const who = handle ? (handle.startsWith("@") ? handle : `@${handle}`) : shortAddress(mySlot.addr);

    const claimAmount = amount ? trimAmount(ethers.utils.formatEther(amount)) : null;

    const windowOpen = claimOpensAt === undefined ? true : Date.now() / 1000 >= claimOpensAt;
    const withdrawn = mySlot.withdrawn || submitted || withdraw.isSuccess;
    const wrongChain = Boolean(chain?.id) && chain?.id !== chainId;
    const busy = withdraw.isPending;
    const zeroShare = amount !== null && amount.isZero();

    const card = "mobile:fixed mobile:bottom-[71px] mobile:inset-x-0 flex flex-col sm:flex-row mobile:gap-4 items-center sm:justify-between py-6 sm:py-3 sm:px-4 bg-[#141414] sm:border-[1.2px] sm:border-[#FCB4BD] rounded-t-[30px] sm:rounded-3xl";

    return (
        <div className={card}>
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                <div className="mobile:hidden">
                    <MoneySend size={40} color="#FCB4BD" variant="Bulk" />
                </div>
                <div className="sm:hidden">
                    <MoneySend size={50} color="#FCB4BD" variant="Bulk" />
                </div>

                <div className="flex flex-col">
                    <h4 className="text-[#FCB4BD] font-bold text-[13px] sm:text-sm">
                        {withdrawn ? "Claimed" : "Claim your share"}
                    </h4>

                    {withdrawn ? (
                        <small className="text-xs text-[#E5F7FFE5] font-semibold">
                            {claimAmount
                                ? `Claimed ${claimAmount} ${symbol} on ${formatDate(new Date())}.`
                                : "You have already withdrawn your share."}
                        </small>
                    ) : disputed ? (
                        <small className="text-xs text-[#E5F7FFE5] font-semibold">
                            Payouts are paused while this campaign is disputed. This card will update on its own.
                        </small>
                    ) : zeroShare ? (
                        <small className="text-xs text-[#E5F7FFE5] font-semibold">
                            There is nothing to claim for this slot.
                        </small>
                    ) : !loggedIn ? (
                        <small className="text-xs text-[#E5F7FFE5] font-semibold">
                            Connect your wallet to withdraw your share.
                        </small>
                    ) : (
                        <small className="text-xs text-[#E5F7FFE5] font-semibold">
                            {`You are ${slotLabel}, ${roleLabel}${handle ? ` (${who})` : ""}. `}
                            {windowOpen
                                ? claimAmount
                                    ? `Your share is ${claimAmount} ${symbol} of the participant pool.`
                                    : "Your share is being read from the chain."
                                : `You can claim after ${formatDate(
                                      new Date((claimOpensAt as number) * 1000)
                                  )}, once the three-day dispute window has passed.`}
                        </small>
                    )}

                    {withdraw.error ? (
                        <small className="text-xs text-[#FC8181] font-semibold" role="alert">
                            {withdraw.error}
                        </small>
                    ) : null}
                </div>
            </div>

            {!withdrawn && !disputed && !zeroShare && loggedIn ? (
                wrongChain ? (
                    <span className="button-s-d text-xs font-Lexend">
                        {`Switch to ${getChainName(chainId)} to claim.`}
                    </span>
                ) : !windowOpen ? null : (
                    <button
                        type="button"
                        disabled={busy || !withdraw.ready}
                        onClick={() => withdraw.write?.()}
                        className={`${busy || !withdraw.ready ? "button-s-d" : ""} flex items-center gap-2 bg-[#FCB4BD] rounded-2xl p-3 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#84B9D1]`}>
                        <span className="text-black text-xs font-Lexend font-medium">
                            {busy
                                ? "Please wait..."
                                : claimAmount
                                ? `Claim ${claimAmount} ${symbol}`
                                : "Claim your share"}
                        </span>
                        <ArrowCircleRight color="#976C71" variant="Bulk" fill="#000" />
                    </button>
                )
            ) : null}
        </div>
    );
};

export default ParticipantClaimCard;
