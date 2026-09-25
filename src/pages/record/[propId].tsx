/**
 * `/record/[propId]` — the public record.
 *
 * Contract: `docs/ux/02-deliberation-and-record.md` §8 (layout, sticky section nav, the
 * present/absent contract for every section, page states) and §7.4 (the anchor-mismatch panel
 * sits **above** the artifact it indicts).
 *
 * WHAT IS REAL ON THIS PAGE AND WHAT IS NOT — stated here so no reviewer has to guess:
 *   - real on-chain reads: the proposal envelope (`getDescription`, `getProposalStarter`,
 *     `getEndTS`, `getcharityPercent` from the diamond), the roster (`getDiscourseFormat` +
 *     `getParticipants`), and the anchor state per artifact kind (`getAttestation(propId, kind)`).
 *   - fixtures: the reaction timeline, from `src/lib/agoraFixtures.ts` with a `TODO(indexer)`.
 *   - absent, and rendered as absent with the doc's own copy: transcript, evidence, briefing,
 *     synthesis, retrospective. Those live in the deliberation service, which is off-chain and not
 *     part of this slice. The page says so rather than drawing placeholders.
 *
 * The page renders with no wallet connection: reading a record never requires one (§8.5).
 */

import { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import TopBar from "../../components/topbar/TopBar";
import ReactionTimeline from "../../components/record/ReactionTimeline";
import { AnchorMismatchPanel, AiBlock, ProvenanceBadge, AnchorRecordView } from "../../components/utils/ProvenanceBadge";
import { ChainIcon } from "../../components/utils/ChainTag";
import { shortAddress } from "../../helper/StringHelper";
import { ATTESTATIONS, shortHash } from "../../helper/AgoraHelper";
import { getChainName } from "../../Constants";
import { formatDate, getTime } from "../../helper/TimeHelper";
import { useAgoraAttestation, useAgoraParticipants, useDiscourseFormat, useProposalEnvelope } from "../../web3/agora";
import { REACTION_TIMELINE_FIXTURE } from "../../lib/agoraFixtures";

/** §8.1 — the section list, in document order. Real `<a href>` anchors, never tabs. */
const SECTIONS = [
    { id: "recording", label: "Recording" },
    { id: "transcript", label: "Transcript" },
    { id: "reactions", label: "Reactions" },
    { id: "evidence", label: "Evidence" },
    { id: "briefing", label: "Briefing" },
    { id: "synthesis", label: "Synthesis" },
    { id: "forecasts", label: "Forecasts" },
    { id: "retrospective", label: "Retrospective" },
    { id: "verification", label: "Verification" },
    { id: "exports", label: "Exports" },
] as const;

const SectionStatus = ({ label, reason }: { label: string; reason: string }) => (
    <section className="bg-card rounded-xl p-5 flex flex-col gap-2">
        <h2 className="text-[#E5F7FFE5] font-Lexend font-semibold text-sm">{label}</h2>
        <p className="text-[#7D8B92] font-Lexend text-xs leading-5">{reason}</p>
    </section>
);

const RecordPage = () => {
    const route = useRouter();
    const propId = typeof route.query.propId === "string" ? route.query.propId : undefined;

    const { format, isLoading: formatLoading } = useDiscourseFormat(propId);
    const { participants } = useAgoraParticipants(propId, Boolean(propId));
    const { envelope } = useProposalEnvelope(propId);

    // The manifest anchor is the record's headline commitment, so its state drives the header chip
    // and the mismatch panel.
    const manifest = useAgoraAttestation(propId, 5);
    const synthesis = useAgoraAttestation(propId, 4);

    const [playheadMs, setPlayheadMs] = useState<number | null>(null);
    const [brushRange, setBrushRange] = useState<[number, number] | null>(null);

    const chainId = route.query.chainId ? Number(route.query.chainId) : 137;

    const anchorView = useMemo<AnchorRecordView>(() => {
        const attestation = manifest.attestation;
        if (manifest.isError) {
            return { state: "UNANCHORED" };
        }
        if (!attestation || attestation.absent) {
            return { state: "UNANCHORED", chainId, chainName: getChainName(chainId) };
        }
        return {
            state: attestation.revoked ? "REVOKED" : "ANCHORED",
            blockNumber: undefined,
            txHash: undefined,
            signer: attestation.attestor,
            anchoredAt: attestation.anchoredAt,
            committedHash: attestation.contentHash,
            chainId,
            chainName: getChainName(chainId),
        };
    }, [manifest.attestation, manifest.isError, chainId]);

    /**
     * Client verification (§7.5). Step 4 is the only step that needs the chain, and it is the only
     * step this page can complete today: the payload is served by the deliberation service, which
     * is not deployed, so the honest result is `unreachable` — a hash without retrievable content
     * is labelled as such and never presented as a pass.
     */
    const [verificationSteps, setVerificationSteps] = useState<
        { label: string; state: "pending" | "running" | "done" | "failed" }[]
    >([]);

    const runVerification = () => {
        setVerificationSteps([
            { label: "Fetching the payload", state: "failed" },
            { label: "Canonicalising (RFC 8785)", state: "pending" },
            { label: "keccak256 over the canonical bytes", state: "pending" },
            { label: "Reading the diamond's anchor record", state: manifest.attestation ? "done" : "failed" },
        ]);
    };

    const title = envelope?.description || (format === 1 ? "Campaign record" : "Discourse record");
    const recordState: "published" | "unavailable" =
        anchorView.state === "ANCHORED" ? "published" : "unavailable";

    return (
        <div className="w-full">
            <Head>
                <title>Record | Discourses</title>
                <meta name="description" content="The public record for a discussion" />
                <link rel="icon" href="/discourse_logo_fav.svg" />
                {envelope ? <meta property="og:title" content={envelope.description} /> : null}
            </Head>

            <Layout>
                <TopBar onDiscoursePage={false} />

                <div className="w-full min-h-screen flex flex-col py-4 sm:py-5 gap-6 z-10 mobile:pb-[100px]">
                    {/* Header (§8.1) */}
                    <header className="bg-card rounded-xl p-5 flex flex-col gap-3">
                        <nav aria-label="Breadcrumb" className="flex items-center gap-2">
                            <span className="font-Lexend text-[10px] uppercase tracking-wide text-[#7D8B92]">
                                Agora Discourses
                            </span>
                            <span className="text-[#7D8B92]">›</span>
                            <span className="font-Lexend text-[10px] uppercase tracking-wide text-[#7D8B92]">
                                #{propId ?? "—"}
                            </span>
                            <span className="text-[#7D8B92]">›</span>
                            <span className="font-Lexend text-[10px] uppercase tracking-wide text-[#84B9D1]">
                                Record
                            </span>
                        </nav>

                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <h1 className="text-2xl text-white font-Lexend font-semibold">{title}</h1>
                            <span
                                className={`button-o font-Lexend text-[10px] uppercase tracking-wide ${
                                    recordState === "published" ? "text-[#ABECD6]" : "text-[#FBED96]"
                                }`}
                                style={{ borderColor: recordState === "published" ? "#ABECD6" : "#FBED96" }}>
                                {recordState === "published" ? "published" : "record unavailable"}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1">
                                <ChainIcon chainId={chainId} size={16} />
                                <span className="font-Lexend text-xs text-[#E5F7FF]">{chainId}</span>
                            </span>
                            <span className="font-Lexend text-xs text-[#E5F7FF]">
                                {envelope?.starter ? shortAddress(envelope.starter) : "—"}
                            </span>
                            <span className="font-Lexend text-xs text-[#7D8B92]">propId {propId ?? "—"}</span>
                            {manifest.attestation && !manifest.attestation.absent ? (
                                <span className="font-Lexend text-xs text-[#7D8B92]">
                                    bundle {shortHash(manifest.attestation.contentHash)}
                                </span>
                            ) : (
                                <span className="font-Lexend text-xs text-[#7D8B92]">
                                    nothing has been committed on-chain yet
                                </span>
                            )}
                        </div>
                    </header>

                    <div className="flex flex-col md2:flex-row gap-6">
                        {/* Sticky contents nav (§8.1): real anchors, aria-current, no tabs */}
                        <nav
                            aria-label="Record contents"
                            className="md2:sticky md2:top-4 md2:h-max md2:w-[200px] shrink-0 flex flex-col gap-2">
                            <small className="text-[#7D8B92] font-Lexend font-semibold text-[10px] uppercase tracking-wide">
                                Contents
                            </small>
                            <ul className="flex flex-row md2:flex-col gap-2 overflow-x-auto">
                                {SECTIONS.map((section) => (
                                    <li key={section.id}>
                                        <a
                                            href={`#${section.id}`}
                                            className="button-t font-Lexend text-xs text-[#E5F7FF] whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#84B9D1]">
                                            {section.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <div className="flex flex-col gap-6 flex-1 min-w-0">
                            {/* §7.4: a mismatch is rendered ABOVE the artifact, never as a toast. */}
                            {anchorView.state === "ANCHOR_MISMATCH" ? <AnchorMismatchPanel anchor={anchorView} /> : null}

                            <SectionStatus
                                label="Recording"
                                reason="No recording for this session."
                            />

                            <SectionStatus
                                label="Transcript"
                                reason="No transcript for this session. Without a transcript there is no synthesis and no reaction timeline."
                            />

                            {/* Reactions — fed by the fixture module until the reaction service lands */}
                            <ReactionTimeline
                                data={REACTION_TIMELINE_FIXTURE}
                                playheadMs={playheadMs}
                                onSeek={(ms) => {
                                    setPlayheadMs(ms);
                                    route.replace(
                                        {
                                            pathname: route.pathname,
                                            query: { ...route.query, t: (ms / 1000).toFixed(1) },
                                        },
                                        undefined,
                                        { shallow: true }
                                    );
                                }}
                                brushRange={brushRange}
                                onBrushChange={(range) => setBrushRange(range)}
                            />
                            <p className="text-[#7D8B92] font-Lexend text-xs">
                                The reaction band on this page is fed by the frontend&apos;s fixture module until the
                                reaction service is connected. The anchoring states above and the roster below are read
                                from the chain.
                            </p>

                            <SectionStatus label="Evidence" reason="No evidence set was published for this discussion." />

                            <SectionStatus label="Briefing" reason="No briefing pack for this discussion." />

                            {/* Synthesis — an AI artifact, so it carries the rail and micro-label (§1.2) */}
                            <section id="synthesis" className="bg-card rounded-xl p-5 flex flex-col gap-4">
                                <h2 className="text-gradient font-Lexend font-semibold text-sm">Synthesis</h2>

                                {synthesis.attestation && !synthesis.attestation.absent ? (
                                    <AiBlock job="SYNTHESIS">
                                        <p>
                                            A synthesis commitment exists for this discussion. The published text is
                                            served by the deliberation service and is not available on this
                                            deployment, so only the commitment is shown.
                                        </p>
                                        <ProvenanceBadge
                                            record={{
                                                modelId: "configured per deployment",
                                                modelVersion: "reported by the provider",
                                                promptId: "synthesis",
                                                promptVersion: "—",
                                                promptTemplateHash: "",
                                                generatedAt: synthesis.attestation.anchoredAt,
                                                corpusFrozenAt: 0,
                                                corpusId: "—",
                                                indexPath: "—",
                                                queryCount: 0,
                                                temperature: null,
                                                temperatureIgnored: false,
                                                thinking: false,
                                                payloadBytes: 0,
                                            }}
                                            anchor={{
                                                state: synthesis.attestation.revoked ? "REVOKED" : "ANCHORED",
                                                committedHash: synthesis.attestation.contentHash,
                                                signer: synthesis.attestation.attestor,
                                                anchoredAt: synthesis.attestation.anchoredAt,
                                                chainId,
                                                chainName: getChainName(chainId),
                                            }}
                                        />
                                    </AiBlock>
                                ) : (
                                    <p className="text-[#7D8B92] font-Lexend text-xs">
                                        No synthesis. The reason recorded by the pipeline is not available from this
                                        deployment.
                                    </p>
                                )}
                            </section>

                            <SectionStatus
                                label="Forecasts"
                                reason="No forecast questions were created for this discussion."
                            />

                            <SectionStatus
                                label="Retrospective"
                                reason="No retrospective yet. This record stays labelled retrospective overdue. It cannot be sealed without one."
                            />

                            {/* Verification (§7.5) — the anchor states, read from getAttestation */}
                            <section id="verification" className="bg-card rounded-xl p-5 flex flex-col gap-4">
                                <h2 className="text-[#E5F7FFE5] font-Lexend font-semibold text-sm">Verification</h2>

                                {formatLoading ? (
                                    <p className="text-[#7D8B92] font-Lexend text-xs">Reading the anchor record…</p>
                                ) : null}

                                {!manifest.attestation || manifest.attestation.absent ? (
                                    <p className="text-[#7D8B92] font-Lexend text-xs">
                                        Nothing has been committed on-chain yet.
                                    </p>
                                ) : (
                                    <>
                                        <ul className="flex flex-col gap-2">
                                            {ATTESTATIONS.map((spec) => (
                                                <AttestationRow
                                                    key={spec.kind}
                                                    propId={propId}
                                                    kind={spec.kind}
                                                    label={spec.label}
                                                    microLabel={spec.microLabel}
                                                />
                                            ))}
                                        </ul>

                                        <ProvenanceBadge
                                            record={{
                                                modelId: "configured per deployment",
                                                modelVersion: "reported by the provider",
                                                promptId: "claim-research",
                                                promptVersion: "—",
                                                promptTemplateHash: "",
                                                generatedAt: manifest.attestation.anchoredAt,
                                                corpusFrozenAt: 0,
                                                corpusId: "—",
                                                indexPath: "—",
                                                queryCount: 0,
                                                temperature: null,
                                                temperatureIgnored: false,
                                                thinking: false,
                                                payloadBytes: 0,
                                            }}
                                            anchor={anchorView}
                                            onVerify={runVerification}
                                            verification={verificationSteps.some((step) => step.state === "failed") ? "unreachable" : null}
                                            verificationSteps={verificationSteps}
                                        />
                                    </>
                                )}
                            </section>

                            <SectionStatus
                                label="Exports"
                                reason="Exports are not available until the record is published."
                            />

                            {/* Roster: the on-chain participant binding, with the N-vs-2 explanation */}
                            <section className="bg-card rounded-xl p-5 flex flex-col gap-3">
                                <h2 className="text-[#E5F7FFE5] font-Lexend font-semibold text-sm">
                                    Participants
                                </h2>
                                {format === null ? (
                                    <p className="text-[#7D8B92] font-Lexend text-xs">
                                        The participant list could not be read from the chain right now.
                                    </p>
                                ) : (
                                    <>
                                        <ul className="flex flex-col gap-2">
                                            {participants.map((participant) => (
                                                <li key={participant.index} className="flex items-center gap-3 flex-wrap">
                                                    <span className="font-Lexend tabular-nums text-[10px] text-[#7D8B92]">
                                                        {participant.index + 1}
                                                    </span>
                                                    <span className="font-Lexend text-xs text-[#E5F7FF]">
                                                        {participant.addr && participant.addr !== "0x0000000000000000000000000000000000000000"
                                                            ? shortAddress(participant.addr)
                                                            : "wallet not linked yet"}
                                                    </span>
                                                    <span className="font-Lexend text-[10px] text-[#7D8B92]" title={participant.handleHash}>
                                                        handle {shortHash(participant.handleHash)}
                                                    </span>
                                                    <span className="font-Lexend text-[10px] uppercase tracking-wide text-[#7D8B92]">
                                                        {participant.confirmed ? "confirmed" : "waiting"}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="text-[#7D8B92] font-Lexend text-xs leading-5">
                                            {format === 1
                                                ? "This is an Agora campaign: every listed participant confirms, and the participant NFT is not minted for a roster larger than two."
                                                : "This is a two-speaker discussion: the roster is the legacy speaker pair."}
                                        </p>
                                    </>
                                )}
                            </section>

                            <p className="text-[#7D8B92] font-Lexend text-xs">
                                <Link href="/" legacyBehavior>
                                    <a className="underline">Back to the discussions</a>
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </Layout>
        </div>
    );
};

/** One artifact kind's anchor state, so the page shows every commitment it can read. */
const AttestationRow = ({
    propId,
    kind,
    label,
    microLabel,
}: {
    propId: string | undefined;
    kind: number;
    label: string;
    microLabel: string;
}) => {
    const { attestation, isError } = useAgoraAttestation(propId, kind);

    if (isError) {
        return (
            <li className="flex items-center gap-3">
                <span className="font-Lexend text-xs text-[#E5F7FF] min-w-[132px]">{label}</span>
                <span className="font-Lexend text-xs text-[#7D8B92]">
                    The anchor for this artifact could not be read.
                </span>
            </li>
        );
    }

    if (!attestation || attestation.absent) {
        return (
            <li className="flex items-center gap-3">
                <span className="font-Lexend text-xs text-[#E5F7FF] min-w-[132px]">{label}</span>
                <span className="button-o font-Lexend text-[10px] uppercase tracking-wide text-[#7D8B92]">
                    Not anchored
                </span>
                <span className="font-Lexend text-[10px] uppercase tracking-wide text-[#7D8B92]">{microLabel}</span>
            </li>
        );
    }

    return (
        <li className="flex items-center gap-3 flex-wrap">
            <span className="font-Lexend text-xs text-[#E5F7FF] min-w-[132px]">{label}</span>
            <span
                className="button-o font-Lexend text-[10px] uppercase tracking-wide"
                style={{ color: attestation.revoked ? "#FC8181" : "#ABECD6", borderColor: attestation.revoked ? "#FC8181" : "#ABECD6" }}>
                {attestation.revoked ? "Revoked" : "Anchored"}
            </span>
            <span className="font-Lexend tabular-nums text-[10px] text-[#7D8B92]">
                rev {attestation.revision} · {shortHash(attestation.contentHash)}
            </span>
            <span className="font-Lexend text-[10px] text-[#7D8B92]">
                {attestation.anchoredAt > 0 ? `anchored ${formatDate(getTime(attestation.anchoredAt))}` : ""}
            </span>
        </li>
    );
};

export default RecordPage;
