/**
 * The typed on-chain surface for Agora Discourses.
 *
 * Every Agora read and write the screens perform goes through a hook exported here, built on
 * the shared ABI and the shared address lookup, so a component never builds a contract call
 * by hand and a signature change is one edit in one file.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DELIVERY NOTE — `src/web3/abi/AgoraFacets.json` IS A PROVISIONAL SHIM.
 * The Agora facets are still being generated in the contracts repo, so this module imports a
 * hand-transcribed fragment set instead of the diamond's generated ABI. At delivery:
 *   1. `npx hardhat diamondABI` in the contracts repo,
 *   2. copy `diamondABI/diamond.json` over `src/web3/abi/DiscourseHub.json` (replacing it),
 *   3. delete `src/web3/abi/AgoraFacets.json` and change the import below to
 *      `import agoraAbi from "./abi/DiscourseHub.json"`.
 * Nothing else changes: the fragment names are the doc-of-record names.
 *
 * PROVISIONAL DETAIL TO RE-VERIFY AT DELIVERY — `createDiscussion` ARGUMENT ORDER.
 * `docs/eng/03` §3.3 freezes seven arguments; `docs/PRD.md` §3.1 X2 adds `uint96 _goal` and
 * X3 adds `uint8 _venueKind` + `bytes32 _venueRefHash` without restating the order.
 * `buildCreateDiscussionArgs` appends the three PRD additions after the seven eng/03
 * arguments — the only order both documents can be read as agreeing on. If the shipped facet
 * uses a different order, that function is the single edit.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useMemo } from "react";
import { BigNumber } from "ethers";
import {
    useAccount,
    useContractRead,
    useContractWrite,
    useNetwork,
    usePrepareContractWrite,
    useWaitForTransaction,
} from "wagmi";
import { revertToSentence } from "../helper/AgoraHelper";
import { getContractAddressByChainId } from "../helper/ContractHelper";
import legacyAbi from "./abi/DiscourseHub.json";
import agoraAbi from "./abi/AgoraFacets.json";

export { agoraAbi };

/** `0 = legacy two-speaker debate, 1 = Agora N-participant discussion` (LibAgoraStorage). */
export const FORMAT_LEGACY_DUEL = 0;
export const FORMAT_AGORA_N = 1;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";

// ---------------------------------------------------------------------------
// Read models — plain projections, so no component ever sees a raw tuple
// ---------------------------------------------------------------------------

export interface AgoraParticipant {
    index: number;
    addr: string;
    handleHash: string;
    role: number;
    confirmed: boolean;
    charity: string;
    withdrawn: boolean;
}

export interface AgoraAttestation {
    contentHash: string;
    metaHash: string;
    attestor: string;
    anchoredAt: number;
    revision: number;
    revoked: boolean;
    /** nothing has ever been anchored for this (propId, kind) */
    absent: boolean;
}

export interface AgoraOdds {
    pools: BigNumber[];
    impliedProbBps: number[];
    payoutPerEth: BigNumber[];
}

export interface AgoraPosition {
    stakePerOutcome: BigNumber[];
    stakedTotal: BigNumber;
    firstStakeTS: number;
}

export const mapParticipants = (raw: any): AgoraParticipant[] =>
    ((raw ?? []) as any[]).map((p, index) => ({
        index,
        addr: (p?.addr ?? p?.[0] ?? ZERO_ADDRESS) as string,
        handleHash: (p?.handleHash ?? p?.[1] ?? ZERO_HASH) as string,
        role: Number(p?.role ?? p?.[2] ?? 0),
        confirmed: Boolean(p?.confirmed ?? p?.[3] ?? false),
        charity: (p?.charity ?? p?.[4] ?? ZERO_ADDRESS) as string,
        withdrawn: Boolean(p?.withdrawn ?? p?.[5] ?? false),
    }));

export const mapAttestation = (raw: any): AgoraAttestation => {
    const contentHash = (raw?.contentHash ?? raw?.[0] ?? ZERO_HASH) as string;
    const metaHash = (raw?.metaHash ?? raw?.[1] ?? ZERO_HASH) as string;
    const attestor = (raw?.attestor ?? raw?.[2] ?? ZERO_ADDRESS) as string;
    const anchoredAt = Number(raw?.anchoredAt ?? raw?.[3] ?? 0);
    const revision = Number(raw?.revision ?? raw?.[4] ?? 0);
    const revoked = Boolean(raw?.revoked ?? raw?.[5] ?? false);

    return {
        contentHash,
        metaHash,
        attestor,
        anchoredAt,
        revision,
        revoked,
        absent: contentHash === ZERO_HASH && revision === 0 && anchoredAt === 0,
    };
};

export const mapOdds = (raw: any): AgoraOdds => {
    const [pools, impliedProbBps, payoutPerEth] = (raw ?? []) as [BigNumber[], number[], BigNumber[]];
    return {
        pools: pools ?? [],
        impliedProbBps: (impliedProbBps ?? []).map((n) => Number(n)),
        payoutPerEth: payoutPerEth ?? [],
    };
};

export const mapPosition = (raw: any): AgoraPosition => {
    const [stakePerOutcome, stakedTotal, firstStakeTS] = (raw ?? []) as [
        BigNumber[],
        BigNumber,
        BigNumber | number
    ];
    return {
        stakePerOutcome: stakePerOutcome ?? [],
        stakedTotal: stakedTotal ?? BigNumber.from(0),
        firstStakeTS: Number(firstStakeTS ?? 0),
    };
};

// ---------------------------------------------------------------------------
// createDiscussion — argument assembly (docs/eng/03 §3.3 + docs/PRD.md X2/X3)
// ---------------------------------------------------------------------------

export interface CreateDiscussionRoster {
    /** the handle as typed, including the leading `@`; hashed on-chain by the facet */
    handle: string;
    /** resolved address or null; `address(0)` for every slot at create by design (§3.3) */
    address: string | null;
    /** ROLE_* constant from `src/helper/AgoraHelper.ts` */
    role: number;
}

export interface CreateDiscussionInput {
    roster: CreateDiscussionRoster[];
    description: string;
    /** KIND_* */
    discussionKind: number;
    /** 0..100 */
    charityPercent: number;
    /** funding window in seconds */
    timeDurationSeconds: number;
    goalWei: BigNumber;
    /** VENUE_* */
    venueKind: number;
    /** keccak256 of the normalised venue reference, zero when no venue was chosen */
    venueRefHash: string;
}

export const buildCreateDiscussionArgs = (input: CreateDiscussionInput) =>
    [
        input.roster.map((r) => r.handle),
        input.roster.map((r) => r.address ?? ZERO_ADDRESS),
        input.roster.map((r) => r.role),
        input.description,
        input.discussionKind,
        input.charityPercent,
        input.timeDurationSeconds,
        input.goalWei,
        input.venueKind,
        input.venueRefHash || ZERO_HASH,
    ] as const;

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export const useAgoraAddress = (): string | undefined => {
    const { chain } = useNetwork();
    return getContractAddressByChainId(chain?.id as number);
};

/**
 * The format discriminator every format-aware surface branches on.
 *
 * `format` stays `null` until a read resolves, and stays `null` on error. Surfaces must treat
 * `null` as "not a campaign" and render the legacy path, never as "format 1": claiming a
 * discussion is an Agora campaign when the read failed would send a legacy speaker to
 * `participantWithdraw`, which cannot pay them.
 */
export const useDiscourseFormat = (propId: number | string | undefined) => {
    const address = useAgoraAddress();
    const enabled = Boolean(address) && propId !== undefined && propId !== null;

    const read = useContractRead({
        address,
        abi: agoraAbi as any,
        functionName: "getDiscourseFormat",
        args: [BigNumber.from(propId ?? 0)],
        enabled,
        watch: true,
    } as any);

    const format = useMemo(() => {
        if (!enabled || read.data === undefined || read.data === null || read.isError) {
            return null;
        }
        return Number(read.data as any);
    }, [enabled, read.data, read.isError]);

    return {
        format,
        isCampaign: format === FORMAT_AGORA_N,
        isLoading: enabled && read.isLoading,
        isError: read.isError,
        refetch: read.refetch,
    };
};

export const useAgoraParticipants = (
    propId: number | string | undefined,
    enabled = true
) => {
    const address = useAgoraAddress();
    const active = Boolean(address) && enabled && propId !== undefined && propId !== null;

    const read = useContractRead({
        address,
        abi: agoraAbi as any,
        functionName: "getParticipants",
        args: [BigNumber.from(propId ?? 0)],
        enabled: active,
        watch: true,
    } as any);

    const participants = useMemo(
        () => (active && !read.isError && read.data ? mapParticipants(read.data) : []),
        [active, read.data, read.isError]
    );

    return {
        participants,
        isLoading: active && read.isLoading,
        isError: read.isError,
        refetch: read.refetch,
    };
};

export const useParticipantWithdrawAmount = (
    propId: number | string | undefined,
    index: number | undefined,
    enabled = true
) => {
    const address = useAgoraAddress();
    const active =
        Boolean(address) && enabled && propId !== undefined && index !== undefined && index !== null;

    const read = useContractRead({
        address,
        abi: agoraAbi as any,
        functionName: "getParticipantWithdrawAmount",
        args: [BigNumber.from(propId ?? 0), BigNumber.from(index ?? 0)],
        enabled: active,
    } as any);

    return {
        amount: active && !read.isError && read.data ? BigNumber.from(read.data as any) : null,
        isLoading: active && read.isLoading,
        isError: read.isError,
        refetch: read.refetch,
    };
};

/** `getAttestation(propId, kind)` — the anchor record the record page verifies against. */
export const useAgoraAttestation = (
    propId: number | string | undefined,
    kind: number,
    enabled = true
) => {
    const address = useAgoraAddress();
    const active = Boolean(address) && enabled && propId !== undefined && propId !== null;

    const read = useContractRead({
        address,
        abi: agoraAbi as any,
        functionName: "getAttestation",
        args: [BigNumber.from(propId ?? 0), kind],
        enabled: active,
        watch: true,
    } as any);

    const attestation = useMemo(
        () => (active && !read.isError && read.data ? mapAttestation(read.data) : null),
        [active, read.data, read.isError]
    );

    return {
        attestation,
        isLoading: active && read.isLoading,
        isError: read.isError,
        refetch: read.refetch,
    };
};

export const useAgoraMarketsByProposal = (
    propId: number | string | undefined,
    enabled = true
) => {
    const address = useAgoraAddress();
    const active = Boolean(address) && enabled && propId !== undefined && propId !== null;

    const read = useContractRead({
        address,
        abi: agoraAbi as any,
        functionName: "getAgoraMarketsByProposal",
        args: [BigNumber.from(propId ?? 0)],
        enabled: active,
        watch: true,
    } as any);

    const marketIds = useMemo(
        () =>
            active && !read.isError && read.data
                ? (read.data as any[]).map((id) => Number(id))
                : [],
        [active, read.data, read.isError]
    );

    return { marketIds, isLoading: active && read.isLoading, isError: read.isError, refetch: read.refetch };
};

export const useAgoraOdds = (marketId: number | undefined, enabled = true) => {
    const address = useAgoraAddress();
    const active = Boolean(address) && enabled && marketId !== undefined && marketId !== null;

    const read = useContractRead({
        address,
        abi: agoraAbi as any,
        functionName: "getAgoraOdds",
        args: [BigNumber.from(marketId ?? 0)],
        enabled: active,
        watch: true,
    } as any);

    const odds = useMemo(
        () => (active && !read.isError && read.data ? mapOdds(read.data) : null),
        [active, read.data, read.isError]
    );

    return { odds, isLoading: active && read.isLoading, isError: read.isError, refetch: read.refetch };
};

export const useAgoraPosition = (
    marketId: number | undefined,
    account: string | undefined,
    enabled = true
) => {
    const address = useAgoraAddress();
    const active = Boolean(address) && enabled && Boolean(account) && marketId !== undefined;

    const read = useContractRead({
        address,
        abi: agoraAbi as any,
        functionName: "getAgoraPosition",
        args: [BigNumber.from(marketId ?? 0), account as `0x${string}`],
        enabled: active,
        watch: true,
    } as any);

    const position = useMemo(
        () => (active && !read.isError && read.data ? mapPosition(read.data) : null),
        [active, read.data, read.isError]
    );

    return { position, isLoading: active && read.isLoading, isError: read.isError, refetch: read.refetch };
};

export const useAgoraMarketCount = () => {
    const address = useAgoraAddress();
    const read = useContractRead({
        address,
        abi: agoraAbi as any,
        functionName: "getAgoraMarketCount",
        args: [],
        enabled: Boolean(address),
    } as any);

    return {
        count: read.data === undefined ? null : Number(read.data as any),
        isLoading: read.isLoading,
        isError: read.isError,
        refetch: read.refetch,
    };
};

// ---------------------------------------------------------------------------
// Legacy envelope reads, needed by the create flow's post-signing check and by the record page.
// They use the diamond's existing ABI; nothing here is an Agora fragment.
// ---------------------------------------------------------------------------

export const useTotalProposals = (enabled = true) => {
    const address = useAgoraAddress();
    const read = useContractRead({
        address,
        abi: legacyAbi as any,
        functionName: "getTotalProposals",
        args: [],
        enabled: Boolean(address) && enabled,
        watch: true,
    } as any);

    return {
        total: read.data === undefined ? null : Number(read.data as any),
        isLoading: read.isLoading,
        isError: read.isError,
        refetch: read.refetch,
    };
};

export interface ProposalEnvelope {
    description: string;
    starter: string;
    endTS: number;
    charityPercent: number;
}

/**
 * The title/starter/deadline of any proposal, read from the chain so a surface does not depend on
 * the indexer to render a heading. For a format-1 campaign the roster comes from `getParticipants`
 * and the plaintext handles come from the indexer; this is the envelope only.
 */
export const useProposalEnvelope = (propId: number | string | undefined, enabled = true) => {
    const address = useAgoraAddress();
    const active = Boolean(address) && enabled && propId !== undefined && propId !== null;

    const description = useContractRead({
        address,
        abi: legacyAbi as any,
        functionName: "getDescription",
        args: [BigNumber.from(propId ?? 0)],
        enabled: active,
    } as any);

    const starter = useContractRead({
        address,
        abi: legacyAbi as any,
        functionName: "getProposalStarter",
        args: [BigNumber.from(propId ?? 0)],
        enabled: active,
    } as any);

    const endTS = useContractRead({
        address,
        abi: legacyAbi as any,
        functionName: "getEndTS",
        args: [BigNumber.from(propId ?? 0)],
        enabled: active,
    } as any);

    const charityPercent = useContractRead({
        address,
        abi: legacyAbi as any,
        functionName: "getcharityPercent",
        args: [BigNumber.from(propId ?? 0)],
        enabled: active,
    } as any);

    const envelope: ProposalEnvelope | null =
        active && !description.isError && description.data !== undefined
            ? {
                  description: String(description.data ?? ""),
                  starter: String(starter.data ?? ""),
                  endTS: Number(endTS.data ?? 0),
                  charityPercent: Number(charityPercent.data ?? 0),
              }
            : null;

    return {
        envelope,
        isLoading: active && (description.isLoading || starter.isLoading || endTS.isLoading),
        isError: description.isError,
        refetch: description.refetch,
    };
};

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export interface AgoraTxState {
    hash?: string;
    /** signing or mining */
    isPending: boolean;
    isSuccess: boolean;
    /** the mapped sentence, never a raw revert string */
    error: string | null;
    write: (() => void) | undefined;
    ready: boolean;
    reset: () => void;
}

/**
 * `createDiscussion` — one payable call for the whole campaign (docs/PRD.md X1).
 * `msg.value` is the proposer's own initial pledge.
 */
export const useCreateDiscussion = (
    input: CreateDiscussionInput | null,
    pledgeWei: BigNumber | null
): AgoraTxState => {
    const address = useAgoraAddress();
    const { address: account } = useAccount();

    const args = input ? buildCreateDiscussionArgs(input) : undefined;

    const { config, error: prepareError } = usePrepareContractWrite({
        address,
        abi: agoraAbi as any,
        functionName: "createDiscussion",
        args: args as any,
        overrides: {
            from: account,
            value: pledgeWei ?? undefined,
        },
        enabled: Boolean(address) && Boolean(input) && Boolean(pledgeWei),
    } as any);

    const write = useContractWrite({
        ...config,
        onError: () => {
            /* sentence is derived below from `write.error` */
        },
    } as any);

    const wait = useWaitForTransaction({ hash: write.data?.hash });

    return {
        hash: write.data?.hash,
        isPending: write.isLoading || wait.isLoading,
        isSuccess: wait.isSuccess,
        error: write.error || wait.error || prepareError ? mapWriteError(write.error || wait.error || prepareError) : null,
        write: write.write,
        ready: Boolean(config) && Boolean(write.write),
        reset: write.reset,
    };
};

/** `participantWithdraw(propId, index)` — one slot, one claim, ever. */
export const useParticipantWithdraw = (
    propId: number | string | undefined,
    index: number | undefined,
    enabled = true
): AgoraTxState => {
    const address = useAgoraAddress();
    const { address: account } = useAccount();
    const active =
        Boolean(address) && enabled && propId !== undefined && index !== undefined && index !== null;

    const { config, error: prepareError } = usePrepareContractWrite({
        address,
        abi: agoraAbi as any,
        functionName: "participantWithdraw",
        args: [BigNumber.from(propId ?? 0), BigNumber.from(index ?? 0)],
        overrides: { from: account },
        enabled: active,
    } as any);

    const write = useContractWrite(config as any);
    const wait = useWaitForTransaction({ hash: write.data?.hash });

    return {
        hash: write.data?.hash,
        isPending: write.isLoading || wait.isLoading,
        isSuccess: wait.isSuccess,
        error: write.error || wait.error || prepareError ? mapWriteError(write.error || wait.error || prepareError) : null,
        write: write.write,
        ready: Boolean(config) && Boolean(write.write),
        reset: write.reset,
    };
};

/** `confirmParticipant(propId)` — the caller must be the roster slot's resolved address. */
export const useConfirmParticipant = (propId: number | string | undefined, enabled = true) => {
    const address = useAgoraAddress();
    const { address: account } = useAccount();
    const active = Boolean(address) && enabled && propId !== undefined;

    const { config, error: prepareError } = usePrepareContractWrite({
        address,
        abi: agoraAbi as any,
        functionName: "confirmParticipant",
        args: [BigNumber.from(propId ?? 0)],
        overrides: { from: account },
        enabled: active,
    } as any);

    const write = useContractWrite(config as any);
    const wait = useWaitForTransaction({ hash: write.data?.hash });

    return {
        hash: write.data?.hash,
        isPending: write.isLoading || wait.isLoading,
        isSuccess: wait.isSuccess,
        error: write.error || wait.error || prepareError ? mapWriteError(write.error || wait.error || prepareError) : null,
        write: write.write,
        ready: Boolean(config) && Boolean(write.write),
    };
};

/**
 * The generic Agora write for the market and record facets. It exists so a surface added
 * later does not reach for `useContractWrite` with the raw ABI: pass the fragment name from
 * `AGORA_WRITE_NAMES` and its arguments.
 */
export const AGORA_WRITE_NAMES = [
    "setCampaignVenue",
    "markCampaignFailed",
    "createAgoraMarket",
    "stakeOnOutcome",
    "syncMarketLock",
    "submitResolution",
    "challengeResolution",
    "resolveChallenge",
    "finalizeResolution",
    "voidMarket",
    "claimAgora",
    "claimAgoraChallengeBond",
] as const;

export type AgoraWriteName = (typeof AGORA_WRITE_NAMES)[number];

export const useAgoraWrite = (
    functionName: AgoraWriteName,
    args: unknown[] | undefined,
    value?: BigNumber
): AgoraTxState => {
    const address = useAgoraAddress();
    const { address: account } = useAccount();

    const { config, error: prepareError } = usePrepareContractWrite({
        address,
        abi: agoraAbi as any,
        functionName,
        args: args as any,
        overrides: { from: account, value },
        enabled: Boolean(address) && Boolean(args),
    } as any);

    const write = useContractWrite(config as any);
    const wait = useWaitForTransaction({ hash: write.data?.hash });

    return {
        hash: write.data?.hash,
        isPending: write.isLoading || wait.isLoading,
        isSuccess: wait.isSuccess,
        error: write.error || wait.error || prepareError ? mapWriteError(write.error || wait.error || prepareError) : null,
        write: write.write,
        ready: Boolean(config) && Boolean(write.write),
        reset: write.reset,
    };
};

// ---------------------------------------------------------------------------

/**
 * Every write error goes through the doc-of-record revert→sentence map
 * (docs/ux/01 §12.9, docs/ux/03 §B.13): a raw revert string is never rendered.
 */
const mapWriteError = (error: unknown): string => revertToSentence(error);
