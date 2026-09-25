/**
 * The typed on-chain surface for Agora Discourses.
 *
 * Every Agora read and write the screens perform goes through a hook exported here, built on
 * the shared ABI and the shared address lookup, so a component never builds a contract call
 * by hand and a signature change is one edit in one file.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * DELIVERY NOTE — the ABI is now the GENERATED one, not a shim.
 * `src/web3/abi/AgoraFacets.json` is a verbatim copy of `diamondABI/diamond.json` from the
 * contracts repo (`npx hardhat diamondABI`, 132 functions / 42 events), taken from the same
 * commit that deployed the diamond to Ethereum Sepolia at
 * `0x8FC47550FDD04D3CeF8CC87CBF05BeD2F197e704`. Regenerate it the same way whenever the
 * facets change; never hand-edit it.
 *
 * This replaced a hand-transcribed fragment set whose names and signatures had drifted from
 * what the contracts actually expose. The drift was not cosmetic: seven signatures disagreed
 * (market ids are `bytes32`, not `uint256`; `createAgoraMarket` takes a `bytes32` rules hash,
 * not a `string` URI; `getAgoraPosition` returns a tuple array and a bool) and nine functions
 * the module called did not exist on chain at all. Anything still calling a name that is not
 * in the generated ABI will fail to prepare a transaction.
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
    /** `getAgoraPool`'s second return value: the market's whole stake */
    totalStaked: BigNumber;
    /** pools[i] / totalStaked, in basis points; 0 for every outcome while the pool is empty */
    impliedProbBps: number[];
    /** parimutuel payout per unit staked on outcome i, scaled by 10 000 */
    payoutPerEth: BigNumber[];
}

export interface AgoraPosition {
    /** indexed by outcome; unset entries mean nothing staked on that outcome */
    stakePerOutcome: BigNumber[];
    stakedTotal: BigNumber;
    /** `getAgoraPosition`'s third return value — whether this account has staked at all */
    hasPosition: boolean;
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

/**
 * `AgoraMarketFacet.getAgoraPool(marketId) -> (uint96[] pools, uint256 totalStaked)`.
 * There is no on-chain odds view — the implied probability is a property of the pool, so it is
 * derived here rather than read.
 */
export const mapOdds = (raw: any): AgoraOdds => {
    const [pools, totalStaked] = (raw ?? []) as [BigNumber[] | undefined, BigNumber | undefined];
    const poolList = (pools ?? []).map((p) => BigNumber.from(p));
    const total = BigNumber.from(totalStaked ?? 0);
    const impliedProbBps = poolList.map((p) => (total.isZero() ? 0 : Number(p.mul(10000).div(total))));
    // Parimutuel: if outcome i wins, every unit staked on i receives total / pools[i].
    const payoutPerEth = poolList.map((p) => (p.isZero() ? BigNumber.from(0) : total.mul(10000).div(p)));
    return { pools: poolList, totalStaked: total, impliedProbBps, payoutPerEth };
};

/**
 * `AgoraMarketFacet.getAgoraPosition(marketId, account) -> (Position[] positions, uint256
 * stakedTotal, bool hasPosition)`, where `Position` is `{ uint8 outcome, uint96 amount }`.
 */
export const mapPosition = (raw: any): AgoraPosition => {
    const [positions, stakedTotal, hasPosition] = (raw ?? []) as [
        Array<{ outcome: BigNumber | number; amount: BigNumber }> | undefined,
        BigNumber | undefined,
        boolean | undefined
    ];
    const stakePerOutcome: BigNumber[] = [];
    for (const entry of positions ?? []) {
        stakePerOutcome[Number(entry?.outcome ?? 0)] = BigNumber.from(entry?.amount ?? 0);
    }
    return {
        stakePerOutcome,
        stakedTotal: BigNumber.from(stakedTotal ?? 0),
        hasPosition: Boolean(hasPosition),
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
        // Order verified against the generated ABI (`AgoraDiscussionFacet.createDiscussion`):
        // `uint96 _goal` comes before `uint256 _timeDuration`. The provisional shim had these two
        // the other way round, which would have written the duration into the goal field and
        // truncated it to 96 bits.
        input.goalWei,
        input.timeDurationSeconds,
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
        functionName: "getMarketIdsByProp",
        args: [BigNumber.from(propId ?? 0)],
        enabled: active,
        watch: true,
    } as any);

    // Market ids are `bytes32` question hashes, not integers — every market call takes one as its
    // first argument, so keeping the hex string is what makes the id usable downstream.
    const marketIds = useMemo(
        () =>
            active && !read.isError && read.data
                ? (read.data as unknown[]).map((id) => String(id))
                : [],
        [active, read.data, read.isError]
    );

    return { marketIds, isLoading: active && read.isLoading, isError: read.isError, refetch: read.refetch };
};

export const useAgoraOdds = (marketId: string | undefined, enabled = true) => {
    const address = useAgoraAddress();
    const active = Boolean(address) && enabled && Boolean(marketId);

    const read = useContractRead({
        address,
        abi: agoraAbi as any,
        functionName: "getAgoraPool",
        args: [marketId],
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
    marketId: string | undefined,
    account: string | undefined,
    enabled = true
) => {
    const address = useAgoraAddress();
    const active = Boolean(address) && enabled && Boolean(account) && Boolean(marketId);

    const read = useContractRead({
        address,
        abi: agoraAbi as any,
        functionName: "getAgoraPosition",
        args: [marketId, account],
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
    "setParticipantCharity",
    "createAgoraMarket",
    // "stakeOnOutcome" was not a real function; the facet's writer is `stake(bytes32,uint8)`.
    "stake",
    "syncMarketLock",
    "submitResolution",
    "challengeResolution",
    // `resolveChallenge` was a phantom: a challenge is finalised by `finalizeResolution`.
    "finalizeResolution",
    // `voidMarket` was a phantom: an unresolvable market is voided by `resolveVoid`.
    "resolveVoid",
    // `claimAgora` / `claimAgoraChallengeBond` were phantoms; these are the deployed names.
    "claim",
    "claimChallengeBond",
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
