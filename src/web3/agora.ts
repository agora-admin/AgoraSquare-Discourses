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
import { DEMO_MARKET_CONFIG, DEMO_MODE, demoChainState, demoMarket, demoMarkets } from "../lib/demoMode";
import { useDemoVenuePoint } from "../hooks/useDemoVenuePoint";
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
 * `getVenue(uint256) -> (uint8 kind, bytes32 refHash)` — the venue consultation table's on-chain
 * half (`docs/ux/04-live-shell.md` §1.3, §8.2). `kind` is a `VENUE_*` constant; `refHash` is
 * `keccak256(normaliseVenueRef(ref))` and is deliberately NOT a reference string — the chain never
 * holds the paste, so a surface that needs a player URL must take the string from the off-chain
 * record (`docs/media/03` §7.3).
 */
export interface AgoraVenue {
    kind: number;
    refHash: string;
}

export const mapVenue = (raw: any): AgoraVenue => {
    const kind = raw?.kind ?? raw?.[0] ?? 0;
    const refHash = raw?.refHash ?? raw?.[1] ?? ZERO_HASH;
    return { kind: Number(kind), refHash: String(refHash) };
};

/**
 * `AgoraMarketFacet.getAgoraPool(marketId) -> (uint96[] pools, uint256 totalStaked)`.
 * There is no on-chain odds view — the implied probability is a property of the pool, so it is
 * derived here rather than read.
 */
export const mapOdds = (raw: any, feeBps = 0): AgoraOdds => {
    const [pools, totalStaked] = (raw ?? []) as [BigNumber[] | undefined, BigNumber | undefined];
    const poolList = (pools ?? []).map((p) => BigNumber.from(p));
    const total = BigNumber.from(totalStaked ?? 0);
    const impliedProbBps = poolList.map((p) => (total.isZero() ? 0 : Number(p.mul(10000).div(total))));
    // Parimutuel, matching `LibAgoraMarket.payoutShare` exactly: if outcome i wins, every unit
    // staked on i receives `1 + (T - fee - W) / W`, i.e. `(T - fee) / W` where `W = pools[i]` and
    // `fee = T * feeBps / 10000`. The fee must be subtracted before the division — computing plain
    // `T / W` reports the gross return and overstates the payout by exactly the fee (on a 4 %
    // market with a 4:1 pool, 4.00x instead of the 3.84x the chain actually pays). `feeBps` comes
    // from `getAgoraMarket().feeBpsSnapshot`, which is snapshotted at creation.
    const fee = total.mul(BigNumber.from(feeBps)).div(10000);
    const distributable = total.sub(fee);
    const payoutPerEth = poolList.map((p) =>
        p.isZero() ? BigNumber.from(0) : distributable.mul(10000).div(p)
    );
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
    const demo = demoChainState(propId);

    const read = useContractRead({
        address,
        abi: agoraAbi as any,
        functionName: "getDiscourseFormat",
        args: [BigNumber.from(propId ?? 0)],
        enabled,
        watch: true,
    } as any);

    const format = useMemo(() => {
        // Demo mode answers this from the fixture. The hook above still runs, so the rules of hooks
        // hold and a build without `NEXT_PUBLIC_DEMO` takes the identical production path.
        if (demo) return demo.format;
        if (!enabled || read.data === undefined || read.data === null || read.isError) {
            return null;
        }
        return Number(read.data as any);
    }, [demo, enabled, read.data, read.isError]);

    return {
        format,
        isCampaign: format === FORMAT_AGORA_N,
        isLoading: enabled && read.isLoading,
        isError: read.isError,
        refetch: read.refetch,
    };
};

/**
 * The venue a campaign actually runs from. `venue` stays `null` until a read resolves, and stays
 * `null` on error: a surface must treat that as "we do not know the venue" and render nothing
 * rather than defaulting to a venue kind (`docs/ux/04` §3.12 — never a guess at a venue).
 */
export const useAgoraVenue = (propId: number | string | undefined, enabled = true) => {
    const address = useAgoraAddress();
    const active = Boolean(address) && enabled && propId !== undefined && propId !== null;
    const demo = demoChainState(propId);
    const demoPoint = useDemoVenuePoint();

    const read = useContractRead({
        address,
        abi: agoraAbi as any,
        functionName: "getVenue",
        args: [BigNumber.from(propId ?? 0)],
        enabled: active,
        watch: true,
    } as any);

    const venue = useMemo(() => {
        // See `useDiscourseFormat`: the fixture answers, the hook still runs. A demo link that named
        // its own venue answers for the kind, since no fixture can know which one it meant.
        if (demo) {
            return {
                kind: demoPoint?.kind ?? demo.venueKind,
                refHash: demo.venueRefHash,
            };
        }
        return active && !read.isError && read.data ? mapVenue(read.data) : null;
    }, [demo, demoPoint, active, read.data, read.isError]);

    return { venue, isLoading: active && read.isLoading, isError: read.isError, refetch: read.refetch };
};

export const useAgoraParticipants = (
    propId: number | string | undefined,
    enabled = true
) => {
    const address = useAgoraAddress();
    const active = Boolean(address) && enabled && propId !== undefined && propId !== null;
    const demo = demoChainState(propId);

    const read = useContractRead({
        address,
        abi: agoraAbi as any,
        functionName: "getParticipants",
        args: [BigNumber.from(propId ?? 0)],
        enabled: active,
        watch: true,
    } as any);

    const participants = useMemo(() => {
        // See `useDiscourseFormat`: the fixture answers, the hook above still runs.
        if (demo) return demo.participants as unknown as AgoraParticipant[];
        return active && !read.isError && read.data ? mapParticipants(read.data) : [];
    }, [demo, active, read.data, read.isError]);

    return {
        participants,
        isLoading: active && read.isLoading,
        isError: demo ? false : read.isError,
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
    const demo = demoMarkets(propId);

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
    const marketIds = useMemo(() => {
        // See `useDiscourseFormat`: the fixture answers, the hook above still runs.
        if (demo) return demo.map((entry) => entry.market.questionHash);
        return active && !read.isError && read.data
            ? (read.data as unknown[]).map((id) => String(id))
            : [];
    }, [demo, active, read.data, read.isError]);

    return { marketIds, isLoading: active && read.isLoading, isError: demo ? false : read.isError, refetch: read.refetch };
};

/**
 * `feeBps` must be the market's `feeBpsSnapshot`. It defaults to 0 so a caller that has not read
 * the market yet still gets a value, but the payout is then overstated by the fee — pass it.
 */
export const useAgoraOdds = (marketId: string | undefined, enabled = true, feeBps = 0) => {
    const address = useAgoraAddress();
    const active = Boolean(address) && enabled && Boolean(marketId);
    const demo = demoMarket(marketId);

    const read = useContractRead({
        address,
        abi: agoraAbi as any,
        functionName: "getAgoraPool",
        args: [marketId],
        enabled: active,
        watch: true,
    } as any);

    const odds = useMemo(() => {
        // See `useDiscourseFormat`: the fixture answers, the hook above still runs.
        if (demo) return mapOdds([demo.pools, demo.market.totalStaked], feeBps);
        return active && !read.isError && read.data ? mapOdds(read.data, feeBps) : null;
    }, [demo, active, read.data, read.isError, feeBps]);

    return { odds, isLoading: active && read.isLoading, isError: demo ? false : read.isError, refetch: read.refetch };
};

export const useAgoraPosition = (
    marketId: string | undefined,
    account: string | undefined,
    enabled = true
) => {
    const address = useAgoraAddress();
    const active = Boolean(address) && enabled && Boolean(account) && Boolean(marketId);
    const demo = demoMarket(marketId);

    const read = useContractRead({
        address,
        abi: agoraAbi as any,
        functionName: "getAgoraPosition",
        args: [marketId, account],
        enabled: active,
        watch: true,
    } as any);

    const position = useMemo(() => {
        // See `useDiscourseFormat`: the fixture answers, the hook above still runs. A position
        // belongs to an account, so the fixture only answers when there is one to be asked about.
        if (demo && account)
            return mapPosition([demo.position.positions, demo.position.stakedTotal, demo.position.hasPosition]);
        return active && !read.isError && read.data ? mapPosition(read.data) : null;
    }, [demo, account, active, read.data, read.isError]);

    return {
        position,
        isLoading: active && read.isLoading,
        isError: demo && account ? false : read.isError,
        refetch: read.refetch,
    };
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
// Market reads. Added for the markets surfaces (docs/ux/03 §B.3–§B.5): the four
// hooks above cover markets-by-proposal, pools, positions and the market count, and these
// add the market record, the module config, the resolution record, the challenge record,
// the claimable amount and the chain's own staking-open predicate. Every one of them is a
// read of the generated ABI, so no component builds a contract call by hand.
// ---------------------------------------------------------------------------

/** `MarketState` from `LibAgoraMarket.sol`. `LOCKED` is deliberately not a stored state. */
export const MARKET_STATE = {
    NONE: 0,
    OPEN: 1,
    RESOLVED: 2,
    CHALLENGED: 3,
    FINAL: 4,
    VOID: 5,
} as const;

/** `MarketConfig` from `LibAgoraMarket.sol` — the module's live risk limits and switches. */
export interface AgoraMarketConfig {
    /** wei; 0 leaves only the `msg.value > 0` floor in place */
    minStake: BigNumber;
    /** wei; 0 = no per-account cap */
    maxStakePerAccount: BigNumber;
    /** wei; 0 = no cap at all (and therefore no computable liquidity fraction) */
    poolCap: BigNumber;
    /** wei; 0 makes challenging free */
    challengeBond: BigNumber;
    challengeWindow: number;
    resolutionWindow: number;
    challengeTimeout: number;
    /** a market resolving with fewer distinct stakers must void */
    minDistinctPositions: number;
    /** the fee new markets snapshot; existing markets carry their own `feeBpsSnapshot` */
    marketFeeBps: number;
    /** gates `claim` only — never `refundVoid`, never `claimChallengeBond` */
    claimEnabled: boolean;
    /** blocks new stakes only — never claims, refunds or resolution */
    stakingPaused: boolean;
}

export const mapMarketConfig = (raw: any): AgoraMarketConfig => {
    const r = raw ?? {};
    const amount = (v: any) => BigNumber.from(v ?? 0);
    return {
        minStake: amount(r.minStake ?? r[0]),
        maxStakePerAccount: amount(r.maxStakePerAccount ?? r[1]),
        poolCap: amount(r.poolCap ?? r[2]),
        challengeBond: amount(r.challengeBond ?? r[3]),
        challengeWindow: Number(r.challengeWindow ?? r[4] ?? 0),
        resolutionWindow: Number(r.resolutionWindow ?? r[5] ?? 0),
        challengeTimeout: Number(r.challengeTimeout ?? r[6] ?? 0),
        minDistinctPositions: Number(r.minDistinctPositions ?? r[7] ?? 0),
        marketFeeBps: Number(r.marketFeeBps ?? r[8] ?? 0),
        claimEnabled: Boolean(r.claimEnabled ?? r[9] ?? false),
        stakingPaused: Boolean(r.stakingPaused ?? r[10] ?? false),
    };
};

export const useAgoraConfig = () => {
    const address = useAgoraAddress();
    const read = useContractRead({
        address,
        abi: agoraAbi as any,
        functionName: "getAgoraConfig",
        args: [],
        enabled: Boolean(address),
        watch: true,
    } as any);

    const config = useMemo(() => {
        // See `useDiscourseFormat`: the fixture answers, the hook above still runs.
        if (DEMO_MODE) return mapMarketConfig(DEMO_MARKET_CONFIG);
        return read.data && !read.isError ? mapMarketConfig(read.data) : null;
    }, [read.data, read.isError]);

    return { config, isLoading: read.isLoading, isError: DEMO_MODE ? false : read.isError, refetch: read.refetch };
};

/**
 * `getAgoraMarket(bytes32) -> AgoraMarket`. A market that does not exist returns a zeroed
 * record whose `state` is `MARKET_STATE.NONE`, which is why `state` is checked before anything
 * else is believed. There is no `winningOutcome` here: the submitted outcome lives in the
 * resolution record and is only meaningful once `state == FINAL`.
 */
export interface AgoraMarketView {
    propId: number;
    classId: number;
    templateId: number;
    /** the derived question hash, i.e. the market id */
    questionHash: string;
    /** 2..8; the ordered labels live in the rules document, never on chain */
    outcomeCount: number;
    state: number;
    createdAt: number;
    /** staking closes here; only ever moves earlier */
    lockTS: number;
    resolutionDeadline: number;
    /** the fee frozen at creation, in basis points */
    feeBpsSnapshot: number;
    totalStaked: BigNumber;
    /** distinct accounts that have staked — the on-chain participant count */
    distinctStakers: number;
    /** keccak256 of the rules document URI; the URI itself is never stored */
    rulesURIHash: string;
}

export const mapMarket = (raw: any): AgoraMarketView => {
    const r = raw ?? {};
    return {
        propId: Number(r.propId ?? r[0] ?? 0),
        classId: Number(r.classId ?? r[1] ?? 0),
        templateId: Number(r.templateId ?? r[2] ?? 0),
        questionHash: String(r.questionHash ?? r[3] ?? ZERO_HASH),
        outcomeCount: Number(r.outcomeCount ?? r[4] ?? 0),
        state: Number(r.state ?? r[5] ?? 0),
        createdAt: Number(r.createdAt ?? r[6] ?? 0),
        lockTS: Number(r.lockTS ?? r[7] ?? 0),
        resolutionDeadline: Number(r.resolutionDeadline ?? r[8] ?? 0),
        feeBpsSnapshot: Number(r.feeBpsSnapshot ?? r[9] ?? 0),
        totalStaked: BigNumber.from(r.totalStaked ?? r[10] ?? 0),
        distinctStakers: Number(r.distinctStakers ?? r[11] ?? 0),
        rulesURIHash: String(r.rulesURIHash ?? r[12] ?? ZERO_HASH),
    };
};

export const useAgoraMarket = (marketId: string | undefined, enabled = true) => {
    const address = useAgoraAddress();
    const active = Boolean(address) && enabled && Boolean(marketId);
    const demo = demoMarket(marketId);

    const read = useContractRead({
        address,
        abi: agoraAbi as any,
        functionName: "getAgoraMarket",
        args: [marketId],
        enabled: active,
        watch: true,
    } as any);

    const market = useMemo(() => {
        // See `useDiscourseFormat`: the fixture answers, the hook above still runs.
        if (demo) return mapMarket(demo.market);
        return active && !read.isError && read.data ? mapMarket(read.data) : null;
    }, [demo, active, read.data, read.isError]);

    return { market, isLoading: active && read.isLoading, isError: demo ? false : read.isError, refetch: read.refetch };
};

/** `getAgoraResolution(bytes32) -> Resolution`. `winningOutcome` is a submission until FINAL. */
export interface AgoraResolutionView {
    resolver: string;
    winningOutcome: number;
    submittedAt: number;
    challengeDeadline: number;
    /** keccak256 of the evidence URI; non-zero by construction once submitted */
    evidenceURIHash: string;
}

export const mapResolution = (raw: any): AgoraResolutionView => {
    const r = raw ?? {};
    return {
        resolver: String(r.resolver ?? r[0] ?? ZERO_ADDRESS),
        winningOutcome: Number(r.winningOutcome ?? r[1] ?? 0),
        submittedAt: Number(r.submittedAt ?? r[2] ?? 0),
        challengeDeadline: Number(r.challengeDeadline ?? r[3] ?? 0),
        evidenceURIHash: String(r.evidenceURIHash ?? r[4] ?? ZERO_HASH),
    };
};

export const useAgoraResolution = (marketId: string | undefined, enabled = true) => {
    const address = useAgoraAddress();
    const active = Boolean(address) && enabled && Boolean(marketId);
    const demo = demoMarket(marketId);

    const read = useContractRead({
        address,
        abi: agoraAbi as any,
        functionName: "getAgoraResolution",
        args: [marketId],
        enabled: active,
        watch: true,
    } as any);

    const resolution = useMemo(() => {
        // See `useDiscourseFormat`: the fixture answers, the hook above still runs.
        if (demo) return demo.resolution ? mapResolution(demo.resolution) : null;
        return active && !read.isError && read.data ? mapResolution(read.data) : null;
    }, [demo, active, read.data, read.isError]);

    return {
        resolution,
        isLoading: active && read.isLoading,
        isError: demo ? false : read.isError,
        refetch: read.refetch,
    };
};

/** `getAgoraChallenge(bytes32) -> (challenger, bond, challengeDeadline, refundable)`. */
export interface AgoraChallengeView {
    challenger: string;
    bond: BigNumber;
    challengeDeadline: number;
    /** whether `claimChallengeBond` would succeed right now — only true on a VOID market */
    refundable: boolean;
}

export const mapChallenge = (raw: any): AgoraChallengeView => {
    const r = raw ?? [];
    return {
        challenger: String(r.challenger ?? r[0] ?? ZERO_ADDRESS),
        bond: BigNumber.from(r.bond ?? r[1] ?? 0),
        challengeDeadline: Number(r.challengeDeadline ?? r[2] ?? 0),
        refundable: Boolean(r.refundable ?? r[3] ?? false),
    };
};

export const useAgoraChallenge = (marketId: string | undefined, enabled = true) => {
    const address = useAgoraAddress();
    const active = Boolean(address) && enabled && Boolean(marketId);
    const demo = demoMarket(marketId);

    const read = useContractRead({
        address,
        abi: agoraAbi as any,
        functionName: "getAgoraChallenge",
        args: [marketId],
        enabled: active,
        watch: true,
    } as any);

    const challenge = useMemo(() => {
        // See `useDiscourseFormat`: the fixture answers, the hook above still runs.
        if (demo) return demo.challenge ? mapChallenge(demo.challenge) : null;
        return active && !read.isError && read.data ? mapChallenge(read.data) : null;
    }, [demo, active, read.data, read.isError]);

    return {
        challenge,
        isLoading: active && read.isLoading,
        isError: demo ? false : read.isError,
        refetch: read.refetch,
    };
};

/**
 * `isStakingOpen(bytes32) -> bool` — the chain's own `state == OPEN && now < lockTS` predicate.
 * Read rather than derived from the browser clock, so a skewed client clock cannot render a
 * market as open after it has closed.
 */
export const useAgoraStakingOpen = (marketId: string | undefined, enabled = true) => {
    const address = useAgoraAddress();
    const active = Boolean(address) && enabled && Boolean(marketId);
    const demo = demoMarket(marketId);

    const read = useContractRead({
        address,
        abi: agoraAbi as any,
        functionName: "isStakingOpen",
        args: [marketId],
        enabled: active,
        watch: true,
    } as any);

    return {
        stakingOpen: demo
            ? demo.stakingOpen
            : active && !read.isError && read.data !== undefined
            ? Boolean(read.data)
            : null,
        isLoading: active && read.isLoading,
        isError: demo ? false : read.isError,
        refetch: read.refetch,
    };
};

/** `getClaimableAmount(bytes32, address)` — 0 when nothing is due, already claimed, or unsettled. */
export const useAgoraClaimable = (
    marketId: string | undefined,
    account: string | undefined,
    enabled = true
) => {
    const address = useAgoraAddress();
    const active = Boolean(address) && enabled && Boolean(account) && Boolean(marketId);
    const demo = demoMarket(marketId);

    const read = useContractRead({
        address,
        abi: agoraAbi as any,
        functionName: "getClaimableAmount",
        args: [marketId, account],
        enabled: active,
        watch: true,
    } as any);

    return {
        amount:
            // See `useDiscourseFormat`: the fixture answers, the hook above still runs. An amount is
            // owed to an account, so the fixture only answers when there is one to be asked about.
            demo && account
                ? BigNumber.from(demo.claimable)
                : active && !read.isError && read.data !== undefined
                ? BigNumber.from(read.data as any)
                : null,
        isLoading: active && read.isLoading,
        isError: demo && account ? false : read.isError,
        refetch: read.refetch,
    };
};

/** `hasClaimedMarket(bytes32, address)` — one claim per market per address, ever. */
export const useAgoraHasClaimed = (
    marketId: string | undefined,
    account: string | undefined,
    enabled = true
) => {
    const address = useAgoraAddress();
    const active = Boolean(address) && enabled && Boolean(account) && Boolean(marketId);
    const demo = demoMarket(marketId);

    const read = useContractRead({
        address,
        abi: agoraAbi as any,
        functionName: "hasClaimedMarket",
        args: [marketId, account],
        enabled: active,
        watch: true,
    } as any);

    return {
        claimed:
            // See `useAgoraClaimable`: a claim is per account, so the fixture needs one.
            demo && account
                ? demo.hasClaimed
                : active && !read.isError && read.data !== undefined
                ? Boolean(read.data)
                : null,
        isLoading: active && read.isLoading,
        isError: demo && account ? false : read.isError,
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
    // The deployed claim facet splits the two entitlements in two functions: `claim` pays a
    // FINAL market's winners and is the only path gated by `claimEnabled`, while `refundVoid`
    // returns a VOID market's principal and is never gated (docs/ux/03 §B.11.4). A refund
    // therefore cannot be routed through `claim`, which reverts on a VOID market.
    "claim",
    "refundVoid",
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
