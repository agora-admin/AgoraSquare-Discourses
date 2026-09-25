/**
 * `CreateReview` — step 6, S-C6 in `docs/ux/01-campaign-flows.md` §3.6 and §12.7.
 *
 * Why a new component: `VenueCard` and `DateCardTwitter` are query-bound label/value stacks and
 * neither can render an arbitrary recap or a table (§11.3). `CreateDiscourseDailog`'s success view
 * is bound to the legacy two-transaction write path.
 *
 * The review is the last screen before the only signature in the flow, so it states exactly what
 * will be written, what it costs now, and what happens if it fails. The `CreationNotice` content
 * (`create.success.*`, `create.degraded.*`) is rendered inline here rather than in a modal; the
 * modal chrome is the only part of §3.6 not built in this slice.
 */

import { ArrowNE } from "../utils/SvgHub";
import { FormatSpec, ROLE_LABEL } from "../../helper/AgoraHelper";
import { CampaignDraft } from "../../lib/agoraDraft";

export interface CreateReviewProps {
    draft: CampaignDraft;
    spec: FormatSpec;
    venueLabel: string;
    symbol: string;
    /** the funding window in seconds */
    fundingWindowSeconds: number;
    confirmationWindowSeconds: number;
    termsAccepted: boolean;
    onTermsChange: (accepted: boolean) => void;
    onCreate: () => void;
    /** the write's state, straight from `useCreateDiscussion` */
    isPending: boolean;
    isSuccess: boolean;
    error: string | null;
    hash?: string;
    /** the campaign's own propId once known, for the "Open campaign" link */
    propId?: number;
    explorerUrl?: string;
    /** `create.success.body` / `create.degraded.body` variant selector */
    notice: "none" | "success" | "degraded";
}

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
    <small className="text-[#7D8B92] font-Lexend font-semibold text-[10px] uppercase tracking-wide">{children}</small>
);

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-start gap-4">
        <span className="font-Lexend text-[10px] uppercase tracking-wide text-[#7D8B92] min-w-[104px]">{label}</span>
        <span className="font-Lexend text-xs text-[#E5F7FF] flex-1 break-words">{children}</span>
    </div>
);

export const CreateReview = ({
    draft,
    spec,
    venueLabel,
    symbol,
    fundingWindowSeconds,
    confirmationWindowSeconds,
    termsAccepted,
    onTermsChange,
    onCreate,
    isPending,
    isSuccess,
    error,
    hash,
    propId,
    explorerUrl,
    notice,
}: CreateReviewProps) => {
    const fundingDays = Math.round(fundingWindowSeconds / 86400);
    const confirmDays = Math.round(confirmationWindowSeconds / 86400);

    return (
        <div className="flex flex-col gap-6">
            <h3 className="text-[#E5F7FFE5] font-Lexend font-semibold text-xs uppercase tracking-wide">REVIEW</h3>

            {notice === "success" ? (
                <div className="bg-card rounded-xl p-4 flex flex-col gap-2 border-l-2 border-[#ABECD6]">
                    <h4 className="font-Lexend font-semibold text-sm text-[#ABECD6]">Campaign created</h4>
                    <p className="text-[#E5F7FFE5] font-Lexend text-xs">
                        The funding window is open. Participants have been asked to link a wallet.
                    </p>
                    <p className="text-[#7D8B92] font-Lexend text-xs">
                        The campaign page may take a minute to appear. It is already on chain.
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                        {propId ? (
                            <a href={`/campaign/${propId}`} className="button-s font-Lexend text-xs">
                                Open campaign
                            </a>
                        ) : null}
                        {explorerUrl ? (
                            <a
                                href={explorerUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="button-so flex items-center gap-1 font-Lexend text-xs">
                                Transaction <ArrowNE />
                            </a>
                        ) : null}
                    </div>
                </div>
            ) : null}

            {notice === "degraded" ? (
                <div className="bg-card rounded-xl p-4 flex flex-col gap-2 border-l-2 border-[#FC8181]">
                    <h4 className="font-Lexend font-semibold text-sm text-[#FC8181]">Campaign not attached</h4>
                    <p className="text-[#E5F7FFE5] font-Lexend text-xs">
                        The creation transaction succeeded but the campaign data did not attach. Do not fund this
                        campaign. Contact an operator with transaction {hash ?? "—"}.
                    </p>
                </div>
            ) : null}

            <div className="bg-card rounded-xl p-4 flex flex-col gap-3">
                <SectionHeading>WHAT WILL BE WRITTEN ON CHAIN</SectionHeading>

                <Row label="Title">{draft.title || "—"}</Row>
                <Row label="Format">
                    {spec.title} - {draft.roster.length} participant{draft.roster.length === 1 ? "" : "s"} - kind{" "}
                    {spec.kind}
                </Row>
                <Row label="Participants">
                    <span className="flex flex-col gap-1">
                        {draft.roster.map((entry, index) => (
                            <span key={`${entry.handle}-${index}`} className="font-Lexend tabular-nums text-xs">
                                {index + 1} {"  "}
                                <span className="text-[#E5F7FF]">{ROLE_LABEL[entry.role]}</span>
                                {"  "}
                                <span className="text-[#E5F7FF]">
                                    {entry.handle.startsWith("@") ? entry.handle : `@${entry.handle}`}
                                </span>
                                <span className="text-[#7D8B92]"> (address not set)</span>
                            </span>
                        ))}
                    </span>
                </Row>
                <Row label="Venue">{venueLabel}</Row>
                <Row label="Category">{draft.category || "—"}</Row>
                <Row label="Sub-topics">{draft.subTopics.join(", ") || "—"}</Row>
                <Row label="Funding goal">
                    {draft.goal || "—"} {symbol}, window {fundingDays} day{fundingDays === 1 ? "" : "s"}, confirmation{" "}
                    {confirmDays} day{confirmDays === 1 ? "" : "s"}
                </Row>
                <Row label="Charity">
                    {draft.charityPercent} percent
                </Row>
                <Row label="Your pledge">
                    {draft.initialPledge || "—"} {symbol}
                </Row>
            </div>

            <div className="bg-card rounded-xl p-4 flex flex-col gap-3">
                <SectionHeading>WHAT THIS COSTS YOU NOW</SectionHeading>
                <p className="text-[#E5F7FFE5] font-Lexend text-xs">
                    {draft.initialPledge || "—"} {symbol} pledged, plus the network fee shown in your wallet.
                </p>
            </div>

            <div className="bg-card rounded-xl p-4 flex flex-col gap-3">
                <SectionHeading>WHAT HAPPENS NEXT</SectionHeading>
                <p className="text-[#E5F7FFE5] font-Lexend text-xs leading-5">
                    Funders pledge for {fundingDays} day{fundingDays === 1 ? "" : "s"}. If the goal is reached, all{" "}
                    {draft.roster.length} participants are asked to confirm within {confirmDays} day
                    {confirmDays === 1 ? "" : "s"}. If everyone confirms, an operator schedules the discussion. If the
                    goal is missed or someone does not confirm, every pledge is refunded in full.
                </p>
                {spec.kind === 3 && draft.roster.length === 1 ? (
                    <p className="text-[#FBED96] font-Lexend text-xs">
                        One presenter. No second voice. Funders see this before they pledge.
                    </p>
                ) : null}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) => onTermsChange(event.target.checked)}
                    className="mt-1"
                />
                <span className="font-Lexend text-xs text-[#E5F7FFE5] leading-5">
                    I agree with terms &amp; conditions, and I understand that my initial pledge is returned in full if
                    this campaign fails.
                </span>
            </label>

            {isPending ? (
                <p className="text-[#FBED96] font-Lexend text-xs" role="status" aria-live="polite">
                    {hash ? "Waiting for confirmation." : "Approve the transaction in your wallet."}
                </p>
            ) : null}

            {error ? (
                <p className="text-[#FC8181] font-Lexend text-xs" role="alert" tabIndex={-1}>
                    {error}
                </p>
            ) : null}

            <div className="flex items-center gap-3">
                <button
                    type="button"
                    disabled={isPending || isSuccess}
                    onClick={onCreate}
                    className={`${isPending || !termsAccepted || isSuccess ? "button-s-d" : "button-s"} font-Lexend text-xs focus-visible:ring-2 focus-visible:ring-[#84B9D1]`}>
                    Create campaign
                </button>
                {!termsAccepted ? (
                    <span className="font-Lexend text-xs text-[#7D8B92]">Accept the terms to continue.</span>
                ) : null}
            </div>
        </div>
    );
};

export default CreateReview;
