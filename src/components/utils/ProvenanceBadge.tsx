/**
 * The three-provenance separation device — `docs/ux/02-deliberation-and-record.md` §1.2, §7.2,
 * §7.3, §7.4 and §7.5.
 *
 * One file, three exports, because the contract *between* them is the point:
 *
 *   - `AiBlock`          the rail + micro-label + icon that marks the smallest unit whose text
 *                        a model wrote (§1.2 devices 1-3). Rail is `border-l-2 border-[#D2B4FC]
 *                        pl-3`; micro-label is `font-Lexend text-[10px] uppercase tracking-wide
 *                        text-[#D2B4FC]` preceded by the AI icon and followed by the job name.
 *   - `ProvenanceBadge`  the artifact's provenance record: model, prompt pack, params, retrieval,
 *                        confidence, payload hash, anchor row (§7.2).
 *   - `VerificationBadge` the anchor chip in all seven states (§7.3) and, for
 *                        `ANCHOR_MISMATCH`, the blocking panel (§7.4) that is never dismissible,
 *                        never collapsible and never a toast.
 *
 * Why nothing existing fits: no component in `src/components/**` renders model provenance, and
 * `ChainTag` is chain-specific. `docs/ux/02` §12.2 lists this as new work; the record surfaces
 * all consume it, so its props are fixed here even where only one screen uses it today.
 *
 * The rail is `#D2B4FC` and nothing else in these surfaces may use that colour for a different
 * purpose (§1.2 S4). No state here is carried by colour alone: every chip has a text label.
 */

import { ReactNode, useState } from "react";
import { Copy, CopySuccess, DocumentText, TickCircle, Warning2 } from "iconsax-react";
import { shortHash } from "../../helper/AgoraHelper";

// ---------------------------------------------------------------------------
// The AI icon. `docs/ux/02` §12.2 asks for `AISynthesisIcon` in `SvgHub`; it is defined here
// instead of editing that shared file, and the delivery step should move it there verbatim
// (same `({ size = 16 }: SVGProp)` convention, `fill="none"`).
// ---------------------------------------------------------------------------

export const AISynthesisIcon = ({ size = 12, color = "#D2B4FC" }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="3" cy="8" r="1.6" stroke={color} strokeWidth="1.2" />
        <circle cx="8" cy="3.5" r="1.6" stroke={color} strokeWidth="1.2" />
        <circle cx="8" cy="12.5" r="1.6" stroke={color} strokeWidth="1.2" />
        <circle cx="13" cy="8" r="2.1" fill={color} />
        <path d="M4.4 7.2 6.6 4.4M4.4 8.8l2.2 2.8M9.5 4.5l2.1 2.3M9.5 11.5l2.1-2.3" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The AI job names required by §1.2 device 2. Always rendered, never truncated. */
export type AiJob =
    | "CLAIM RESEARCH"
    | "EVIDENCE ORGANISATION"
    | "DISCLOSURE SURFACING"
    | "ARGUMENT COMPARISON"
    | "SYNTHESIS"
    | "LIVE ASSISTANT";

export type AnchorState =
    | "UNANCHORED"
    | "ANCHORING"
    | "ANCHORED"
    | "SUPERSEDED"
    | "REVOKED"
    | "ANCHOR_MISMATCH"
    | "CHAIN_MISMATCH";

export interface ProvenanceRecord {
    /** the configured model id, e.g. `deepseek-flash` */
    modelId: string;
    /** the vendor's own reported version — labelled as an echo, not a claim (§7.2) */
    modelVersion: string;
    promptId: string;
    promptVersion: string;
    promptTemplateHash: string;
    /** unix seconds */
    generatedAt: number;
    corpusFrozenAt: number;
    corpusId: string;
    indexPath: string;
    queryCount: number;
    /** `null` renders as "temperature off" (§7.2) */
    temperature: number | null;
    temperatureIgnored: boolean;
    thinking: boolean;
    payloadBytes: number;
    confidence?: {
        value: number;
        method: string;
        breakdown?: { label: string; weight: number; sentence: string }[];
    };
    /** `fallback/…` or `replay/…` triggers the visible degraded line (§7.2) */
    generatedBy?: string;
}

export interface AnchorRecordView {
    state: AnchorState;
    blockNumber?: number;
    txHash?: string;
    signer?: string;
    /** unix seconds */
    anchoredAt?: number;
    /** the hash committed on chain — shown in full in the mismatch panel (§7.4 rule 2) */
    committedHash?: string;
    /** the hash this page recomputes from the served bytes */
    recomputedHash?: string;
    checksumSha256?: string;
    bytes?: number;
    chainId?: number;
    chainName?: string;
    otherChainId?: number;
    otherChainName?: string;
    supersededBy?: number;
    revokedBy?: string;
    revokedAt?: number;
    revocationReason?: string;
    explorerUrl?: string;
}

export interface VerificationStep {
    label: string;
    state: "pending" | "running" | "done" | "failed";
}

export type VerificationResult = "match" | "mismatch" | "unreachable" | "offline" | "unsupported" | null;

// ---------------------------------------------------------------------------
// AiBlock — rail + micro-label (§1.2, §1.3)
// ---------------------------------------------------------------------------

export const AiBlock = ({
    job,
    children,
    footer,
    className = "",
}: {
    job: AiJob;
    children: ReactNode;
    /** on-chain facts or source chips that must sit OUTSIDE the rail (§1.2 S2) */
    footer?: ReactNode;
    className?: string;
}) => (
    <div className={`flex flex-col gap-2 ${className}`}>
        <div className="border-l-2 border-[#D2B4FC] pl-3 flex flex-col gap-1">
            <span className="flex items-center gap-1 font-Lexend text-[10px] uppercase tracking-wide text-[#D2B4FC]">
                <AISynthesisIcon size={12} />
                {`AI · ${job}`}
            </span>
            <div className="text-[#E5F7FFE5] font-Lexend text-xs leading-5">{children}</div>
        </div>
        {footer ? <div className="pl-3">{footer}</div> : null}
    </div>
);

// ---------------------------------------------------------------------------
// VerificationBadge — the seven states (§7.3)
// ---------------------------------------------------------------------------

const anchorStateStyle: Record<AnchorState, { label: string; color: string }> = {
    UNANCHORED: { label: "Not anchored", color: "#7D8B92" },
    ANCHORING: { label: "Anchoring", color: "#FBED96" },
    ANCHORED: { label: "Anchored", color: "#ABECD6" },
    SUPERSEDED: { label: "Superseded", color: "#84B9D1" },
    REVOKED: { label: "Revoked", color: "#FC8181" },
    ANCHOR_MISMATCH: { label: "Anchor mismatch", color: "#FC8181" },
    CHAIN_MISMATCH: { label: "Wrong network for this anchor", color: "#FC8181" },
};

const anchorStateCopy = (anchor: AnchorRecordView): string => {
    switch (anchor.state) {
        case "UNANCHORED":
            return "This revision has not been committed on-chain. Its contents can still change.";
        case "ANCHORING":
            return "The commitment transaction was submitted and has not been confirmed yet. Until it is, this revision can still change.";
        case "ANCHORED":
            return "The payload you are reading hashes to the value committed at this block. It has not changed since publication.";
        case "SUPERSEDED":
            return `Revision ${anchor.supersededBy ?? "?"} replaced this one. This revision is still readable at its original address and its hash is unchanged.`;
        case "REVOKED":
            return `Revoked by ${anchor.revokedBy ? shortHash(anchor.revokedBy) : "an operator"}. The on-chain commitment still exists. The content below is the revoked text.`;
        case "ANCHOR_MISMATCH":
            return "The payload served on this page does not hash to the value committed on-chain. Do not rely on this revision.";
        case "CHAIN_MISMATCH":
            return `This record is committed on ${anchor.chainName ?? "another chain"} (${anchor.chainId ?? "?"}). This page is showing ${anchor.otherChainName ?? "the current chain"} (${anchor.otherChainId ?? "?"}).`;
        default:
            return "";
    }
};

export const VerificationBadge = ({
    anchor,
    onVerify,
}: {
    anchor: AnchorRecordView;
    onVerify?: () => void;
}) => {
    const style = anchorStateStyle[anchor.state];
    const verifyDisabled = anchor.state === "UNANCHORED" || anchor.state === "ANCHORING" || !onVerify;

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
                <span
                    className="button-o flex items-center gap-1 font-Lexend text-[10px] uppercase tracking-wide"
                    style={{ color: style.color, borderColor: style.color }}>
                    {anchor.state === "ANCHORED" ? (
                        <TickCircle size={12} variant="Bold" color={style.color} />
                    ) : (
                        <Warning2 size={12} variant="Bold" color={style.color} />
                    )}
                    {style.label}
                    {anchor.state === "ANCHORED" && anchor.blockNumber ? ` · block ${anchor.blockNumber}` : ""}
                </span>

                {anchor.explorerUrl ? (
                    <a
                        href={anchor.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="button-o font-Lexend text-[10px] uppercase tracking-wide text-[#E5F7FF] focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                        Tx ↗
                    </a>
                ) : null}

                <button
                    type="button"
                    onClick={onVerify}
                    disabled={verifyDisabled}
                    className={`${verifyDisabled ? "button-s-d" : "button-s"} font-Lexend text-xs focus-visible:ring-2 focus-visible:ring-[#84B9D1]`}>
                    Verify against the chain
                </button>
            </div>
            <p className="text-[#7D8B92] font-Lexend text-xs leading-5">{anchorStateCopy(anchor)}</p>
        </div>
    );
};

// ---------------------------------------------------------------------------
// AnchorMismatchPanel — the state that must never be hidden (§7.4)
// ---------------------------------------------------------------------------

export const AnchorMismatchPanel = ({
    anchor,
    discoveredThisSession = false,
}: {
    anchor: AnchorRecordView;
    /** when the mismatch is found by a click, the region is announced once (§7.4 rule 7) */
    discoveredThisSession?: boolean;
}) => {
    const [copied, setCopied] = useState(false);

    const commands = `node -e '
  const {canonicalize}=require("canonicalize"),fs=require("fs");
  const p=JSON.parse(fs.readFileSync("payload.json","utf8"));
  const {utils}=require("ethers");
  console.log(utils.keccak256(utils.toUtf8Bytes(canonicalize(p))));
'
cast call <diamond> "getAIDeliberation(uint256,uint8)" <propId> <kind> \\
  --rpc-url <rpc>`;

    const copy = () => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(commands).then(
                () => setCopied(true),
                () => setCopied(false)
            );
        }
    };

    return (
        <div
            role={discoveredThisSession ? "alert" : undefined}
            className="bg-card rounded-xl border-l-2 border-[#FC8181] border-t-2 border-t-[#FC8181] p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <Warning2 size={16} variant="Bold" color="#FC8181" />
                <h3 className="font-Lexend font-semibold text-sm text-[#FC8181]">
                    This artifact does not match its on-chain commitment
                </h3>
            </div>

            <p className="text-[#E5F7FFE5] font-Lexend text-xs leading-5">
                The payload served on this page does not hash to the value committed on-chain. Do not rely on this
                revision.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#141414] rounded-xl p-3 flex flex-col gap-1">
                    <small className="text-[#7D8B92] font-Lexend font-semibold text-[10px] uppercase tracking-wide">
                        committed on-chain
                    </small>
                    <span className="font-Lexend tabular-nums text-xs text-[#E5F7FF] break-all">
                        {anchor.committedHash ?? "—"}
                    </span>
                    <span className="text-[#7D8B92] font-Lexend text-xs">
                        block {anchor.blockNumber ?? "—"}
                    </span>
                    <span className="text-[#7D8B92] font-Lexend text-xs break-all">
                        signer {anchor.signer ?? "—"}
                    </span>
                    {anchor.explorerUrl ? (
                        <a
                            href={anchor.explorerUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="button-o max-w-fit font-Lexend text-[10px] uppercase tracking-wide text-[#E5F7FF]">
                            View on the block explorer ↗
                        </a>
                    ) : null}
                </div>

                <div className="bg-[#141414] rounded-xl p-3 flex flex-col gap-1">
                    <small className="text-[#7D8B92] font-Lexend font-semibold text-[10px] uppercase tracking-wide">
                        recomputed just now
                    </small>
                    <span className="font-Lexend tabular-nums text-xs text-[#E5F7FF] break-all">
                        {anchor.recomputedHash ?? "—"}
                    </span>
                    <span className="text-[#7D8B92] font-Lexend text-xs">keccak256 over the canonical payload</span>
                    <span className="text-[#7D8B92] font-Lexend text-xs">{anchor.bytes ?? "—"} bytes</span>
                    {anchor.checksumSha256 ? (
                        <span className="text-[#7D8B92] font-Lexend text-xs break-all">
                            checksum sha256 {anchor.checksumSha256}
                        </span>
                    ) : null}
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <p className="text-[#E5F7FFE5] font-Lexend text-xs">
                    Three things produce this result. In order of likelihood:
                </p>
                <ol className="list-decimal list-inside text-[#E5F7FFE5] font-Lexend text-xs flex flex-col gap-1">
                    <li>The served copy was modified after it was anchored.</li>
                    <li>This page is showing a different revision than the one anchored.</li>
                    <li>The chain was reorganised, or the page is reading a different chain.</li>
                </ol>
            </div>

            <div className="flex flex-col gap-2">
                <p className="text-[#E5F7FFE5] font-Lexend text-xs">How to check without this website:</p>
                <pre className="bg-[#141414] rounded-xl p-3 overflow-x-auto text-[10px] font-mono text-[#c6c6c6]">
                    {commands}
                </pre>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <button type="button" onClick={copy} className="button-so flex items-center gap-1 font-Lexend text-xs focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                    {copied ? <CopySuccess size={14} color="#ABECD6" /> : <Copy size={14} color="#c6c6c6" />}
                    {copied ? "Copied" : "Copy the commands"}
                </button>
                {anchor.explorerUrl ? (
                    <a href={anchor.explorerUrl} target="_blank" rel="noreferrer" className="button-so font-Lexend text-xs">
                        View the chain record ↗
                    </a>
                ) : null}
                <a
                    href={`mailto:record@agorasquare.io?subject=${encodeURIComponent("Anchor mismatch report")}&body=${encodeURIComponent(
                        `artifact ref: propId ${anchor.chainId ?? ""}\ncommitted: ${anchor.committedHash ?? ""}\nrecomputed: ${
                            anchor.recomputedHash ?? ""
                        }\nblock: ${anchor.blockNumber ?? ""}`
                    )}`}
                    className="button-o font-Lexend text-xs text-[#E5F7FF]">
                    Report this
                </a>
            </div>
        </div>
    );
};

// ---------------------------------------------------------------------------
// ProvenanceBadge (§7.2)
// ---------------------------------------------------------------------------

const utcStamp = (seconds?: number): string => {
    if (!seconds) {
        return "—";
    }
    const date = new Date(seconds * 1000);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()} ${pad(
        date.getUTCHours()
    )}:${pad(date.getUTCMinutes())} UTC`;
};

const ParamLine = ({ label, children }: { label: string; children: ReactNode }) => (
    <div className="flex items-start gap-2">
        <span className="border-l-2 border-[#D2B4FC] pl-2 font-Lexend text-[10px] uppercase tracking-wide text-[#7D8B92] min-w-[86px]">
            {label}
        </span>
        <span className="font-Lexend text-xs text-[#E5F7FFE5] flex-1">{children}</span>
    </div>
);

export const ProvenanceBadge = ({
    record,
    anchor,
    onVerify,
    onViewPrompt,
    onShowQueries,
    onViewHistory,
    verification = null,
    verificationSteps,
}: {
    record: ProvenanceRecord;
    anchor: AnchorRecordView;
    onVerify?: () => void;
    onViewPrompt?: () => void;
    onShowQueries?: () => void;
    onViewHistory?: () => void;
    verification?: VerificationResult;
    verificationSteps?: VerificationStep[];
}) => {
    const [showBreakdown, setShowBreakdown] = useState(false);

    const degraded =
        Boolean(record.generatedBy) &&
        (record.generatedBy!.startsWith("fallback/") || record.generatedBy!.startsWith("replay/"));

    return (
        <div className="bg-card rounded-xl p-3 flex flex-col gap-3">
            {degraded ? (
                <p className="w-full rounded-lg bg-[#FBED96]/10 border border-[#FBED96]/40 p-2 text-[#FBED96] font-Lexend text-xs">
                    Generated by an extractive fallback, not by a language model. It selects sentences; it does not
                    reason.
                </p>
            ) : null}

            <ParamLine label="Model">
                {record.modelId} · {record.modelVersion}
                <span className="text-[#7D8B92]"> (reported by the provider)</span> ·{" "}
                {record.thinking ? "thinking on" : "thinking off"} ·{" "}
                {record.temperature === null
                    ? record.temperatureIgnored
                        ? "requested 0.7, ignored by the provider"
                        : "temperature off"
                    : `temperature ${record.temperature}`}
            </ParamLine>

            <ParamLine label="Prompt">
                {record.promptId} @ {record.promptVersion}
                <span className="text-[#7D8B92]"> template sha256 {shortHash(record.promptTemplateHash)}</span>
                {onViewPrompt ? (
                    <button
                        type="button"
                        onClick={onViewPrompt}
                        className="button-o ml-2 font-Lexend text-[10px] uppercase tracking-wide text-[#E5F7FF] focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                        View the prompt
                    </button>
                ) : null}
            </ParamLine>

            <ParamLine label="Generated">
                {utcStamp(record.generatedAt)}
                <span className="text-[#7D8B92]"> corpus frozen {utcStamp(record.corpusFrozenAt)}</span>
            </ParamLine>

            <ParamLine label="Retrieval">
                {record.corpusId} · {record.indexPath} · {record.queryCount} queries
                {onShowQueries ? (
                    <button
                        type="button"
                        onClick={onShowQueries}
                        className="button-o ml-2 font-Lexend text-[10px] uppercase tracking-wide text-[#E5F7FF] focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                        Show the queries
                    </button>
                ) : null}
            </ParamLine>

            {record.confidence ? (
                <div className="flex flex-col gap-2">
                    <ParamLine label="Confidence">
                        {record.confidence.value.toFixed(2)} · {record.confidence.method}
                        <button
                            type="button"
                            onClick={() => setShowBreakdown((prev) => !prev)}
                            className="button-o ml-2 font-Lexend text-[10px] uppercase tracking-wide text-[#E5F7FF] focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                            {showBreakdown ? "Hide breakdown" : "Breakdown"}
                        </button>
                    </ParamLine>
                    {showBreakdown && record.confidence.breakdown ? (
                        <ul className="pl-3 flex flex-col gap-1">
                            {record.confidence.breakdown.map((part) => (
                                <li key={part.label} className="flex items-start gap-2">
                                    <span className="border-l-2 border-[#D2B4FC] pl-2 font-Lexend text-[10px] uppercase tracking-wide text-[#7D8B92] min-w-[86px]">
                                        {part.label} {part.weight}
                                    </span>
                                    <span className="font-Lexend text-xs text-[#E5F7FFE5] flex-1">{part.sentence}</span>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            ) : null}

            <div className="w-full h-[1px] bg-[#1E1E1E]" />

            <ParamLine label="Payload hash">
                <span className="font-Lexend tabular-nums">
                    {anchor.committedHash ? shortHash(anchor.committedHash) : "—"}
                </span>
                <span className="text-[#7D8B92]"> · {anchor.bytes ?? record.payloadBytes} bytes</span>
            </ParamLine>

            <VerificationBadge anchor={anchor} onVerify={onVerify} />

            {verificationSteps && verificationSteps.length > 0 ? (
                <ol className="flex flex-col gap-1">
                    {verificationSteps.map((step, index) => (
                        <li key={step.label} className="flex items-center gap-2 font-Lexend text-xs">
                            <span className="text-[#7D8B92]">{index + 1}</span>
                            <span className="text-[#E5F7FFE5] flex-1">{step.label}</span>
                            <span
                                className={
                                    step.state === "failed"
                                        ? "text-[#FC8181]"
                                        : step.state === "done"
                                        ? "text-[#ABECD6]"
                                        : "text-[#7D8B92]"
                                }>
                                {step.state === "done"
                                    ? "done"
                                    : step.state === "running"
                                    ? "running"
                                    : step.state === "failed"
                                    ? "failed"
                                    : "waiting"}
                            </span>
                        </li>
                    ))}
                </ol>
            ) : null}

            {/*
              * §7.5: the limitations render on success too. They are as prominent as the check,
              * because "the hash matches" is a much smaller claim than it sounds.
              */}
            {verification === "match" ? (
                <div className="flex flex-col gap-1">
                    <p className="text-[#ABECD6] font-Lexend text-xs">
                        The payload has not changed since it was committed.
                    </p>
                    <p className="text-[#7D8B92] font-Lexend text-xs">What this does not prove:</p>
                    <ul className="list-disc list-inside flex flex-col gap-1">
                        <li className="text-[#7D8B92] font-Lexend text-xs">
                            that the sources say what is quoted — they can change; only the archived copy is fixed
                        </li>
                        <li className="text-[#7D8B92] font-Lexend text-xs">
                            that the transcript is complete, or that the recording was not edited before it was committed
                        </li>
                        <li className="text-[#7D8B92] font-Lexend text-xs">
                            that the model reasoned well. The chain proves integrity and time, not truth.
                        </li>
                    </ul>
                </div>
            ) : null}

            {verification === "unreachable" ? (
                <p className="text-[#FBED96] font-Lexend text-xs">
                    The payload could not be fetched. The hash still exists on-chain, so the artifact&apos;s existence and
                    time are provable; its content is not available right now.
                </p>
            ) : null}

            {onViewHistory ? (
                <button
                    type="button"
                    onClick={onViewHistory}
                    className="button-so max-w-fit flex items-center gap-1 font-Lexend text-xs focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                    <DocumentText size={14} color="#c6c6c6" />
                    View full history
                </button>
            ) : null}
        </div>
    );
};

export default ProvenanceBadge;
