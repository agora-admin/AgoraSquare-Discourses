/**
 * `CampaignBuilder` — the six-step campaign builder shell.
 * Contract: `docs/ux/01-campaign-flows.md` §3 in full (steps, validation, copy) and §3.7
 * (builder-wide states).
 *
 * Why a new component: there is no stepper, no draft model and no step routing in the codebase.
 * `user/Tabs.tsx` switches two read-only panels and has no ordering, no validation and no draft
 * (docs/ux/01 §11.3).
 *
 * The single on-chain write is `createDiscussion` at step 6 — one transaction, one signature
 * (docs/PRD.md X1). Steps 1 to 5 make no contract call, which is why the wallet gate is
 * informational until the review.
 *
 * Post-signing verification (§3.6 "Degraded success"): after the receipt the builder reads the
 * proposal count, then `getDiscourseFormat(propId)` for the proposal the transaction created. If
 * the format is not 1 the user is told the campaign did not attach **before** they fund it, which
 * is the whole point of the check.
 *
 * The two inline confirmations (format change, middle-row removal) are rendered in place rather
 * than in dialogs: a dialog shell would be a 14th hand-rolled headlessui copy (docs/ux/03 §A.7
 * GAP-10), and neither question needs focus trapping.
 */

import { SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useAccount, useNetwork } from "wagmi";
import { BigNumber, ethers } from "ethers";
import AppContext from "../utils/AppContext";
import ConnectWalletButton from "../dialogs/ConnectWalletButton";
import ChainBar from "../actions/ChainBar";
import TopicsInput from "./TopicsInput";
import CharityInput from "./CharityInput";
import ConfirmationPeriodInput from "./ConfirmationPeriodInput";
import FormatPicker from "./FormatPicker";
import RosterInput from "./RosterInput";
import GoalInput from "./GoalInput";
import VenuePicker from "./VenuePicker";
import CreateReview from "./CreateReview";
import { supportedChainIds, getChainName, getCurrencyName } from "../../Constants";
import { ToastTypes } from "../../lib/Types";
import { v4 as uuid } from "uuid";
import {
    ROLE_CONSTANT,
    RoleKey,
    getFormatSpec,
    getVenueSpec,
    normaliseVenueRef,
} from "../../helper/AgoraHelper";
import { keccak256 } from "../../helper/StringHelper";
import {
    BUILDER_STEPS,
    BuilderStep,
    CATEGORIES,
    CampaignDraft,
    DRAFT_STORAGE_KEY,
    RosterEntry,
    STEP_LABEL,
    addRosterEntry,
    applyRole,
    emptyDraft,
    firstUnansweredStep,
    moneyHasErrors,
    reconcileRoster,
    removalRenumbersLaterSlots,
    removalWarning,
    removeRosterEntry,
    validateMoney,
    validateRoster,
    validateSubject,
    validateVenue,
} from "../../lib/agoraDraft";
import { CreateDiscussionInput, useCreateDiscussion, useDiscourseFormat, useTotalProposals } from "../../web3/agora";

const labelCSS = "text-[14px] text-[#E5F7FFE5] font-semibold capitalize";
const optionContainerCSS = "flex flex-col gap-2";

export interface CampaignBuilderProps {
    /**
     * Policy limits. `null` means "this deployment exposes no read for it":
     * `getFundingParameters()` (docs/ux/01 §3.5) does not exist in the v1.1 ABI, so the builder
     * never invents a number and leaves that rule to the contract.
     */
    minGoal?: string | null;
    minInitialFunds?: string | null;
    fundingCap?: string | null;
}

const explorerUrlFor = (chainId: number | undefined, hash: string | undefined): string | undefined => {
    if (!hash) {
        return undefined;
    }
    switch (chainId) {
        case 137:
            return `https://polygonscan.com/tx/${hash}`;
        case 80001:
            return `https://mumbai.polygonscan.com/tx/${hash}`;
        case 56:
            return `https://bscscan.com/tx/${hash}`;
        default:
            return undefined;
    }
};

/** The existing create inputs are typed `Dispatch<SetStateAction<T>>`; this bridges them. */
const resolveAction = <T,>(action: SetStateAction<T>, current: T): T =>
    typeof action === "function" ? (action as (prev: T) => T)(current) : action;

const ConfirmInline = ({
    question,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
}: {
    question: string;
    confirmLabel: string;
    cancelLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
}) => (
    <div className="bg-card rounded-xl p-4 flex flex-col gap-3">
        <p className="text-[#E5F7FFE5] font-Lexend text-xs" role="alertdialog" aria-label={question}>
            {question}
        </p>
        <div className="flex items-center gap-3">
            <button type="button" onClick={onConfirm} className="button-s font-Lexend text-xs">
                {confirmLabel}
            </button>
            <button type="button" onClick={onCancel} className="button-o font-Lexend text-xs text-[#E5F7FF]">
                {cancelLabel}
            </button>
        </div>
    </div>
);

export const CampaignBuilder = ({
    minGoal = null,
    minInitialFunds = null,
    fundingCap = null,
}: CampaignBuilderProps) => {
    const route = useRouter();
    const { addToast } = useContext(AppContext);
    const { chain } = useNetwork();
    const { isConnected } = useAccount();

    const [draft, setDraft] = useState<CampaignDraft>(emptyDraft);
    const [step, setStep] = useState<BuilderStep>("format");
    const [restored, setRestored] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const [pendingFormat, setPendingFormat] = useState<number | null>(null);
    const [pendingRemoval, setPendingRemoval] = useState<number | null>(null);
    const [roleError, setRoleError] = useState<string | null>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [submitted, setSubmitted] = useState<CampaignDraft | null>(null);
    const [createdPropId, setCreatedPropId] = useState<number | null>(null);
    const [notice, setNotice] = useState<"none" | "success" | "degraded">("none");

    // ---- draft persistence -------------------------------------------------
    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        try {
            const raw = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as CampaignDraft;
                setDraft({ ...emptyDraft(), ...parsed });
                setRestored(true);
            }
        } catch {
            // A draft that cannot be parsed is discarded silently: nothing is signed from it.
        }
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated || typeof window === "undefined") {
            return;
        }
        try {
            window.sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        } catch {
            // Storage blocked or full: the draft simply does not survive the session.
        }
    }, [draft, hydrated]);

    // ---- ?step= routing ----------------------------------------------------
    useEffect(() => {
        const requested = typeof route.query.step === "string" ? route.query.step : undefined;
        if (requested && (BUILDER_STEPS as readonly string[]).includes(requested)) {
            // The server render has no `?step=`, so the step is only adopted after hydration.
            setStep(requested as BuilderStep);
        }
    }, [route.query.step]);

    const goTo = useCallback(
        (next: BuilderStep) => {
            setStep(next);
            route.replace({ pathname: route.pathname, query: { ...route.query, step: next } }, undefined, {
                shallow: true,
            });
        },
        [route]
    );

    // A deep link never lands on a step the draft cannot satisfy (§3.7).
    useEffect(() => {
        if (!hydrated) {
            return;
        }
        const allowed = firstUnansweredStep(draft);
        if (BUILDER_STEPS.indexOf(step) > BUILDER_STEPS.indexOf(allowed)) {
            goTo(allowed);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hydrated]);

    // ---- derived -----------------------------------------------------------
    const spec = getFormatSpec(draft.kind ?? 0);
    const venueSpec = draft.venue.kind === null ? null : getVenueSpec(draft.venue.kind);
    const symbol = getCurrencyName(chain?.id as number);

    const rosterValidation = validateRoster(draft);
    const subjectValidation = validateSubject(draft);
    const venueError = validateVenue(draft);
    const moneyValidation = validateMoney(draft, { minGoal, minInitialFunds, fundingCap }, symbol);

    const firstMoneyError =
        moneyValidation.goal ??
        moneyValidation.fundingWindow ??
        moneyValidation.confirmationWindow ??
        moneyValidation.charity ??
        moneyValidation.pledge;

    const stepBlocker = (current: BuilderStep): string | null => {
        switch (current) {
            case "format":
                return draft.kind === null ? "Pick a format to continue." : null;
            case "roster":
                return rosterValidation.reason;
            case "subject":
                return subjectValidation.title ?? subjectValidation.category ?? subjectValidation.subTopics;
            case "where":
                return venueError;
            case "money":
                return firstMoneyError;
            default:
                return null;
        }
    };

    const buildInput = useMemo<CreateDiscussionInput | null>(() => {
        if (draft.kind === null) {
            return null;
        }
        let goalWei: BigNumber;
        try {
            goalWei = ethers.utils.parseEther(draft.goal || "0");
        } catch {
            return null;
        }
        return {
            roster: draft.roster.map((entry: RosterEntry) => ({
                handle: entry.handle.startsWith("@") ? entry.handle : `@${entry.handle}`,
                address: null,
                role: ROLE_CONSTANT[entry.role],
            })),
            description: draft.title,
            discussionKind: draft.kind,
            charityPercent: draft.charityPercent,
            timeDurationSeconds: draft.fundingWindowSeconds,
            goalWei,
            venueKind: draft.venue.kind ?? 0,
            venueRefHash: draft.venue.reference
                ? keccak256(normaliseVenueRef(draft.venue.reference))
                : ethers.constants.HashZero,
        };
    }, [draft]);

    const pledgeWei = useMemo<BigNumber | null>(() => {
        if (!draft.initialPledge) {
            return null;
        }
        try {
            return ethers.utils.parseEther(draft.initialPledge);
        } catch {
            return null;
        }
    }, [draft.initialPledge]);

    const canSign = step === "review" && buildInput !== null && pledgeWei !== null && termsAccepted && isConnected;

    const createTx = useCreateDiscussion(canSign ? buildInput : null, canSign ? pledgeWei : null);

    const { total: totalProposals } = useTotalProposals(createTx.isSuccess);

    // After the receipt, take the new proposal id once the watched counter has caught up, then
    // read its format. `2.5 s` is a poll allowance, not a claim about finality.
    useEffect(() => {
        if (!createTx.isSuccess || createdPropId !== null) {
            return;
        }
        const timer = setTimeout(() => {
            if (totalProposals) {
                setCreatedPropId(totalProposals);
            }
        }, 2500);
        return () => clearTimeout(timer);
    }, [createTx.isSuccess, totalProposals, createdPropId]);

    const { format: createdFormat } = useDiscourseFormat(createdPropId ?? undefined);

    useEffect(() => {
        if (createdPropId === null || createdFormat === null) {
            return;
        }
        if (createdFormat === 1) {
            setNotice("success");
            setDraft(emptyDraft());
            setRestored(false);
            if (typeof window !== "undefined") {
                try {
                    window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
                } catch {
                    // ignore
                }
            }
            addToast({
                title: "Campaign created",
                body: "The funding window is open. Participants have been asked to link a wallet.",
                type: ToastTypes.success,
                duration: 6000,
                id: uuid(),
            });
        } else {
            setNotice("degraded");
        }
    }, [createdPropId, createdFormat, addToast]);

    // ---- roster actions ----------------------------------------------------
    const handleAdd = (entry: RosterEntry) => {
        if (draft.roster.length >= spec.max) {
            return;
        }
        setDraft((prev) => addRosterEntry(prev, entry));
    };

    const requestRemoval = (index: number) => {
        if (removalRenumbersLaterSlots(draft, index)) {
            setPendingRemoval(index);
            return;
        }
        setDraft((prev) => removeRosterEntry(prev, index));
    };

    const handleRole = (index: number, role: RoleKey) => {
        const applied = applyRole(draft, index, role);
        setRoleError(applied.reason);
        setDraft(applied.reason ? draft : { ...draft, roster: applied.roster });
    };

    const handleFormatSelect = (kind: number) => {
        if (draft.roster.length > 0 && draft.kind !== null && draft.kind !== kind) {
            setPendingFormat(kind);
            return;
        }
        setDraft((prev) => reconcileRoster(prev, kind));
    };

    const currentIndex = BUILDER_STEPS.indexOf(step);
    const blocker = stepBlocker(step);
    const wrongChain = Boolean(chain?.id) && !supportedChainIds.includes(chain?.id as number);

    // The review keeps rendering from a snapshot after success, because the live draft is cleared
    // the moment the campaign is confirmed and the notice must survive that.
    const reviewDraft = submitted ?? draft;
    const reviewSpec = getFormatSpec(reviewDraft.kind ?? 0);
    const reviewVenueSpec = reviewDraft.venue.kind === null ? null : getVenueSpec(reviewDraft.venue.kind);

    return (
        <div className="w-full flex flex-col gap-6">
            <nav aria-label="Campaign builder steps" className="flex items-center gap-2 flex-wrap">
                {BUILDER_STEPS.map((builderStep, index) => {
                    const isCurrent = builderStep === step;
                    const isDone = index < currentIndex;
                    const reachable = index <= BUILDER_STEPS.indexOf(firstUnansweredStep(draft));
                    return (
                        <button
                            key={builderStep}
                            type="button"
                            aria-current={isCurrent ? "step" : undefined}
                            disabled={!reachable && notice === "none"}
                            onClick={() => goTo(builderStep)}
                            className={`font-Lexend text-[10px] uppercase tracking-wide px-2 py-1 rounded-lg t-all focus-visible:ring-2 focus-visible:ring-[#84B9D1] ${
                                isCurrent
                                    ? "text-[#0A0A0A] bg-[#D2B4FC]"
                                    : isDone
                                    ? "text-[#84B9D1]"
                                    : "text-[#7D8B92]"
                            }`}>
                            {index + 1} {STEP_LABEL[builderStep]}
                        </button>
                    );
                })}
            </nav>

            {restored && notice === "none" ? (
                <div className="flex items-center gap-3">
                    <p className="text-[#7D8B92] font-Lexend text-xs">Draft restored from this session.</p>
                    <button
                        type="button"
                        onClick={() => {
                            setDraft(emptyDraft());
                            setRestored(false);
                            goTo("format");
                        }}
                        className="button-t text-border font-Lexend text-xs text-[#E5F7FF] focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                        start over
                    </button>
                </div>
            ) : null}

            {!isConnected ? (
                <div className="bg-card rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <p className="text-[#E5F7FFE5] font-Lexend text-xs flex-1">
                        You can draft the whole campaign without a wallet. Nothing is signed until the review step.
                    </p>
                    <ConnectWalletButton />
                </div>
            ) : null}

            {wrongChain ? (
                <div className="bg-card rounded-xl p-4 flex flex-col gap-3">
                    <p className="text-[#FBED96] font-Lexend text-xs">
                        You are on {getChainName(chain?.id)}. Campaigns are created on{" "}
                        {getChainName(supportedChainIds[0])}.
                    </p>
                    <ChainBar />
                </div>
            ) : null}

            {step === "format" && notice === "none" ? (
                <FormatPicker selected={draft.kind} onSelect={handleFormatSelect} />
            ) : null}

            {step === "roster" && notice === "none" ? (
                <>
                    <RosterInput
                        draft={draft}
                        spec={spec}
                        onAdd={handleAdd}
                        onRemove={requestRemoval}
                        onRole={handleRole}
                        disabledReason={rosterValidation.reason}
                        duplicateIndexes={rosterValidation.duplicateIndexes}
                        roleConflictIndexes={rosterValidation.roleConflictIndexes}
                    />
                    {roleError ? (
                        <p className="text-[#FC8181] font-Lexend text-xs" role="alert">
                            {roleError}
                        </p>
                    ) : null}
                </>
            ) : null}

            {step === "subject" && notice === "none" ? (
                <div className="flex flex-col gap-6">
                    <div className={optionContainerCSS}>
                        <label className={labelCSS} htmlFor="title">
                            Topic For Discussion
                        </label>
                        {/*
                          * DEVIATION FROM docs/ux/01 §3.4, stated here on purpose. §3.4 says
                          * `TitleInput` is "reused verbatim" because it calls `CHECK_TITLE`, which
                          * is what preserves global title uniqueness. `CHECK_TITLE` is an indexer
                          * query and `TitleInput` only publishes its value from that query's
                          * `onCompleted` — with no indexer reachable the field never yields a
                          * title and the entire create flow is dead. Global uniqueness is still
                          * enforced: the contract reverts `DPropFactory: Description already used`,
                          * which this screen maps to "A campaign with this title already exists.
                          * Titles have to be unique." (§12.9). The early warning is the only thing
                          * lost, so the field is local and the check moves to the review step once
                          * the indexer exists.
                          */}
                        <input
                            id="title"
                            type="text"
                            value={draft.title}
                            onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                            className="max-w-[585px] input-s"
                            placeholder="Title"
                            aria-invalid={Boolean(subjectValidation.title)}
                        />
                        {subjectValidation.title ? (
                            <p className="text-[#FC8181] font-Lexend text-xs">{subjectValidation.title}</p>
                        ) : null}
                    </div>

                    <div className={optionContainerCSS}>
                        <label className={labelCSS} htmlFor="summary">
                            Description for the discussion
                        </label>
                        <div className="flex relative max-w-[585px]">
                            <textarea
                                id="summary"
                                value={draft.summary}
                                onChange={(event) =>
                                    setDraft((prev) => ({ ...prev, summary: event.target.value.slice(0, 256) }))
                                }
                                rows={6}
                                maxLength={256}
                                className="w-full input-s"
                                placeholder="What is the goal of the discussion?"
                            />
                            <p className="text-[10px] absolute bottom-2 right-3 text-[#c6c6c6]">
                                {draft.summary.length} <span className="text-[#8e8e8e]">/ 256</span>
                            </p>
                        </div>
                    </div>

                    <div className={optionContainerCSS}>
                        <label className={labelCSS}>Category</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    aria-pressed={draft.category === category}
                                    onClick={() => setDraft((prev) => ({ ...prev, category }))}
                                    className={`rounded-lg text-[10px] sm:text-xs font-semibold border-2 border-[#1E1E1E] px-3 py-2 focus-visible:ring-2 focus-visible:ring-[#84B9D1] ${
                                        draft.category === category
                                            ? "bg-[#D2B4FC] !text-black !font-bold"
                                            : "text-[#7D8B92]"
                                    }`}>
                                    {category}
                                </button>
                            ))}
                        </div>
                        <p className="text-[#7D8B92] font-Lexend text-xs">One category. It is what people browse by.</p>
                    </div>

                    <div className={optionContainerCSS}>
                        <label className={labelCSS}>
                            To keep the conversation active, please enter at least 3 sub-topics
                        </label>
                        <TopicsInput
                            topics={draft.subTopics}
                            addTopic={(topic: string) =>
                                setDraft((prev) => ({ ...prev, subTopics: [...prev.subTopics, topic] }))
                            }
                            removeTopic={(topic: string) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    subTopics: prev.subTopics.filter((entry) => entry !== topic),
                                }))
                            }
                        />
                        {subjectValidation.subTopics ? (
                            <p className="text-[#FC8181] font-Lexend text-xs">{subjectValidation.subTopics}</p>
                        ) : null}
                    </div>
                </div>
            ) : null}

            {step === "where" && notice === "none" ? (
                <VenuePicker
                    venue={draft.venue}
                    onChange={(venue) => setDraft((prev) => ({ ...prev, venue }))}
                    error={venueError}
                />
            ) : null}

            {step === "money" && notice === "none" ? (
                <div className="flex flex-col gap-6">
                    <GoalInput
                        value={draft.goal}
                        onChange={(goal) => setDraft((prev) => ({ ...prev, goal }))}
                        error={moneyValidation.goal}
                        minGoal={minGoal}
                        fundingCap={fundingCap}
                        symbol={symbol}
                        headCount={draft.roster.length}
                        initialPledge={draft.initialPledge}
                        fundingWindowSeconds={draft.fundingWindowSeconds}
                        spec={spec}
                    />

                    <div className={optionContainerCSS}>
                        <label className={labelCSS}>Funding window</label>
                        <ConfirmationPeriodInput
                            confirmationPeriod={draft.fundingWindowSeconds}
                            setConfirmationPeriod={(action) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    fundingWindowSeconds: resolveAction(action, prev.fundingWindowSeconds),
                                }))
                            }
                        />
                        <p className="text-[#7D8B92] font-Lexend text-xs">
                            How long people can pledge. It starts the moment you sign.
                        </p>
                        {moneyValidation.fundingWindow ? (
                            <p className="text-[#FC8181] font-Lexend text-xs">{moneyValidation.fundingWindow}</p>
                        ) : null}
                    </div>

                    <div className={optionContainerCSS}>
                        <label className={labelCSS}>Confirmation window</label>
                        <ConfirmationPeriodInput
                            confirmationPeriod={draft.confirmationWindowSeconds}
                            setConfirmationPeriod={(action) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    confirmationWindowSeconds: resolveAction(action, prev.confirmationWindowSeconds),
                                }))
                            }
                        />
                        <p className="text-[#7D8B92] font-Lexend text-xs">
                            How long participants have to accept after the window closes. Someone who never accepts
                            blocks the campaign and it is refunded.
                        </p>
                        {moneyValidation.confirmationWindow ? (
                            <p className="text-[#FC8181] font-Lexend text-xs">{moneyValidation.confirmationWindow}</p>
                        ) : null}
                    </div>

                    <div className={optionContainerCSS}>
                        <label className={labelCSS}>Charity share</label>
                        <CharityInput
                            charityPercentage={draft.charityPercent}
                            setCharityPercentage={(action) =>
                                setDraft((prev) => ({
                                    ...prev,
                                    charityPercent: resolveAction(action, prev.charityPercent),
                                }))
                            }
                        />
                        {moneyValidation.charity ? (
                            <p className="text-[#FC8181] font-Lexend text-xs">{moneyValidation.charity}</p>
                        ) : null}
                    </div>

                    <div className={optionContainerCSS}>
                        <label className={labelCSS} htmlFor="initial-pledge">
                            Your initial pledge
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                id="initial-pledge"
                                type="number"
                                min={0}
                                value={draft.initialPledge}
                                onChange={(event) =>
                                    setDraft((prev) => ({ ...prev, initialPledge: event.target.value }))
                                }
                                className="input-s text-white/80 text-xs max-w-[200px]"
                                placeholder="0.0"
                                aria-invalid={Boolean(moneyValidation.pledge)}
                            />
                            <span className="font-Lexend text-xs text-[#E5F7FF]">{symbol}</span>
                        </div>
                        <p className="text-[#7D8B92] font-Lexend text-xs">
                            This is your own pledge and it counts toward the goal.
                        </p>
                        {moneyValidation.pledge ? (
                            <p className="text-[#FC8181] font-Lexend text-xs">{moneyValidation.pledge}</p>
                        ) : null}
                    </div>
                </div>
            ) : null}

            {step === "review" ? (
                <>
                    <CreateReview
                        draft={reviewDraft}
                        spec={reviewSpec}
                        venueLabel={
                            reviewVenueSpec
                                ? `${reviewVenueSpec.label} - ${
                                      normaliseVenueRef(reviewDraft.venue.reference) || "no reference"
                                  } - Declared`
                                : "Not set"
                        }
                        symbol={symbol}
                        fundingWindowSeconds={reviewDraft.fundingWindowSeconds}
                        confirmationWindowSeconds={reviewDraft.confirmationWindowSeconds}
                        termsAccepted={termsAccepted}
                        onTermsChange={setTermsAccepted}
                        onCreate={() => {
                            setSubmitted(draft);
                            createTx.write?.();
                        }}
                        isPending={createTx.isPending}
                        isSuccess={createTx.isSuccess}
                        error={createTx.error}
                        hash={createTx.hash}
                        // The campaign page is addressed by the indexer's id, which does not exist
                        // yet for a campaign that was just created; `/record/{propId}` is the
                        // propId-addressable surface, so the link goes there.
                        propId={createdPropId ?? undefined}
                        explorerUrl={explorerUrlFor(chain?.id as number, createTx.hash)}
                        notice={notice}
                    />

                    {notice === "none" && termsAccepted && !isConnected ? (
                        <p className="text-[#FBED96] font-Lexend text-xs">Connect your wallet to sign the campaign.</p>
                    ) : null}
                </>
            ) : null}

            {notice === "none" ? (
                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        type="button"
                        onClick={() => goTo(BUILDER_STEPS[Math.max(0, currentIndex - 1)])}
                        disabled={currentIndex === 0}
                        className={`${currentIndex === 0 ? "button-s-d" : "button-so"} font-Lexend text-xs focus-visible:ring-2 focus-visible:ring-[#84B9D1]`}>
                        Back
                    </button>

                    {step !== "review" ? (
                        <button
                            type="button"
                            onClick={() => goTo(BUILDER_STEPS[Math.min(BUILDER_STEPS.length - 1, currentIndex + 1)])}
                            disabled={Boolean(blocker)}
                            className={`${blocker ? "button-s-d" : "button-s"} font-Lexend text-xs focus-visible:ring-2 focus-visible:ring-[#84B9D1]`}>
                            Continue
                        </button>
                    ) : null}

                    {blocker ? (
                        <span className="font-Lexend text-xs text-[#7D8B92]" role="status">
                            {blocker}
                        </span>
                    ) : null}
                </div>
            ) : null}

            {pendingFormat !== null ? (
                <ConfirmInline
                    question="Changing the format keeps the participants you have added and adjusts the roles. Continue?"
                    confirmLabel="Change format"
                    cancelLabel="Keep editing"
                    onCancel={() => setPendingFormat(null)}
                    onConfirm={() => {
                        setDraft((prev) => reconcileRoster(prev, pendingFormat));
                        setPendingFormat(null);
                    }}
                />
            ) : null}

            {pendingRemoval !== null ? (
                <ConfirmInline
                    question={removalWarning(draft, pendingRemoval)}
                    confirmLabel="Remove"
                    cancelLabel="Keep them"
                    onCancel={() => setPendingRemoval(null)}
                    onConfirm={() => {
                        setDraft((prev) => removeRosterEntry(prev, pendingRemoval));
                        setPendingRemoval(null);
                    }}
                />
            ) : null}
        </div>
    );
};

export default CampaignBuilder;
