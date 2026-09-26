/**
 * Demo mode — the whole campaign page with dummy data and no blockchain.
 *
 * Creating a campaign needs a funded wallet and a diamond that carries the Agora facets, and the
 * lists come from an indexer that does not run locally. That makes the page impossible to *look at*
 * without standing up three pieces of infrastructure first.
 *
 * Demo mode removes exactly that: it answers the GraphQL queries from fixtures and overrides the
 * handful of chain reads the strips depend on, so the real components render against the real
 * shapes. It is not a mockup and not a parallel UI — every element on screen is the shipping
 * component; only its inputs are fixtures.
 *
 * Enabled with `NEXT_PUBLIC_DEMO=1`. **Off by default and off in any build without the flag**, so
 * nothing here can reach a real deployment by accident.
 *
 * `NEXT_PUBLIC_*` values are inlined at build time: the flag must be present before `npm run build`.
 */

import {
    ROLE_MODERATOR,
    ROLE_SPEAKER,
    KIND_PANEL,
    VENUE_KICK,
    getVenueSpec,
} from "../helper/AgoraHelper";

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO === "1";

/** The propId every demo link points at. */
export const DEMO_PROP_ID = 42;
export const DEMO_CHAIN_ID = 11155111;

/**
 * The channel the frame embeds — a real, currently-live Kick channel, chosen so the demo exercises
 * the whole loop rather than a placeholder: the API reports its liveness, the frame mounts its
 * player, and the badge is driven by a real observation instead of a fixture. Swap this for any
 * channel that is live when you look.
 */
const DEMO_VENUE_REF = "xqc";

/**
 * `?venueKind=1&venueRef=hasanabi` — point the demo at a different venue, from the link alone.
 *
 * Which venue a campaign runs from is a *data* question, not a code one: the chain stores only
 * `keccak256(normaliseVenueRef(ref))`, and the string itself arrives from the indexer, so pointing a
 * campaign at another channel is an indexer write. The demo has no indexer, so it hardcodes one
 * channel; this reads the other from the link and stands in for the answer the indexer would have
 * given. That is why aiming the demo at a Twitch channel needs no rebuild.
 *
 * Both halves are required. A kind without a channel would put a name in the wrong platform's
 * player and hand back a broken frame (`docs/ux/04` §3.12 — never a frame we cannot fill), so a
 * half-specified link is ignored and the fixture keeps answering, exactly as an unreadable venue
 * does in production.
 *
 * Pure, and only ever consulted under `DEMO_MODE`.
 */
export const parseDemoVenuePoint = (
    query: Record<string, string | string[] | undefined>
): { kind: number; ref: string } | null => {
    const first = (value: string | string[] | undefined) =>
        Array.isArray(value) ? value[0] : value;

    const rawKind = first(query.venueKind);
    const rawRef = first(query.venueRef)?.trim();
    const kind = rawKind === undefined || rawKind === "" ? NaN : Number(rawKind);

    if (!rawRef || !Number.isInteger(kind) || getVenueSpec(kind) === undefined) {
        return null;
    }
    return { kind, ref: rawRef };
};

const nowSec = Math.floor(Date.now() / 1000);

/**
 * The GraphQL payload for `GetDiscourseById`. This is the shape the indexer returns — including
 * `venue_ref`, which is the one field the frame cannot derive: the chain stores only
 * `keccak256(ref)`, so the string itself has to arrive off chain.
 */
export const DEMO_DISCOURSE = {
    __typename: "Discourse",
    id: `demo-${DEMO_PROP_ID}`,
    title: "Does the Inflation Reduction Act actually lower what patients pay?",
    description:
        "A panel on whether negotiated prices have changed net costs at the pharmacy counter, with the " +
        "published evidence on both sides.",
    speakers: [
        {
            __typename: "Speaker",
            name: "Dana Whitfield",
            username: "@danawhitfield",
            address: "0xab49CbE5C2C17450a254e3cc68cF99e00837297B",
            confirmed: true,
            isTwitterHandle: false,
            image_url: "",
        },
        {
            __typename: "Speaker",
            name: "Mara Okonjo",
            username: "@maraokonjo",
            address: "0x5D6595D88DB41ea19CC3b2F0ef641C2Ce3e1d9CC",
            confirmed: true,
            isTwitterHandle: false,
            image_url: "",
        },
        {
            __typename: "Speaker",
            name: "Peter Lindqvist",
            username: "@peterlindqvist",
            address: "0xEf141478931f9f83A0Ae50a76a70344c675FA6fe",
            confirmed: true,
            isTwitterHandle: false,
            image_url: "",
        },
    ],
    moderator: {
        __typename: "Moderator",
        name: "Sam Ridley",
        username: "@samridley",
        image_url: "",
    },
    propId: DEMO_PROP_ID,
    chainId: DEMO_CHAIN_ID,
    prop_description: "Dana Whitfield / Mara Okonjo / Peter Lindqvist",
    prop_starter: "0x99A869CdD2cBF9Ab6BA25DB73BEfE3FeE9D1b2db",
    charityPercent: 5,
    initTS: String(nowSec - 86400 * 3),
    endTS: String(nowSec + 86400 * 4),
    topics: ["Public policy", "Healthcare", "Economics"],
    irl: false,
    yt_link: "",
    disable: false,
    funds: [
        {
            __typename: "Fund",
            address: "0x99A869CdD2cBF9Ab6BA25DB73BEfE3FeE9D1b2db",
            // Integer wei, not ethers. `FundHelper.getFundTotal` passes this straight to
            // `ethers.utils.formatEther`, and `BigNumber.from(1.5)` throws NUMERIC_FAULT
            // (underflow) — a fractional ETH value here crashes the whole page.
            amount: "1500000000000000000",
            timestamp: String(nowSec - 86400 * 3),
            txnHash: "0x7466eb6d1e7a7b20fef6316f81ef3a9fd62c5050b0eaaa38a1312c3dddeb73f4",
        },
        {
            __typename: "Fund",
            address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
            amount: "500000000000000000",
            timestamp: String(nowSec - 86400 * 2),
            txnHash: "0xc432980489d8d2c503d5e6c15f9e9178a1cf8b7f63ee5b252b83b7f9c732ae63",
        },
    ],
    status: {
        __typename: "DiscourseStatus",
        disputed: false,
        completed: false,
        terminated: false,
        speakersConfirmation: 3,
        withdrawn: [],
    },
    txnHash: "0x7466eb6d1e7a7b20fef6316f81ef3a9fd62c5050b0eaaa38a1312c3dddeb73f4",
    discourse: {
        __typename: "DiscourseMeta",
        room_id: "",
        ended: false,
        meet_date: new Date((nowSec - 600) * 1000).toISOString(),
        confirmation: ["0xab49CbE5C2C17450a254e3cc68cF99e00837297B"],
        c_timestamp: String(nowSec - 900),
    },
    // The one field the frame cannot work without, and the reason the embed never mounted:
    // the chain has the hash, only the indexer has the string.
    venue_ref: DEMO_VENUE_REF,
};

/** `GetDiscourses` / `GetDiscoursesByChainID` — the home list. */
export const DEMO_DISCOURSES = [DEMO_DISCOURSE];

/** `GetSessions` — read by the shell to find the recording. */
export const DEMO_SESSIONS = [
    {
        __typename: "Session",
        id: `demo-session-${DEMO_PROP_ID}`,
        recordingStatus: "waiting",
        recordingUrl: null,
        createdAt: String(nowSec - 900),
    },
];

/**
 * The chain reads the strips depend on.
 *
 * `LiveShell` gates on `getDiscourseFormat === 1`, `useAgoraVenue` gates the frame, and
 * `RosterStrip` needs the roster — all three are contract calls, and the diamonds this frontend is
 * configured for revert every Agora function (`Diamond: Function does not exist`, verified on BNB
 * mainnet). Overriding them here is what lets the real components render with no chain at all.
 */
export const DEMO_CHAIN_STATE = {
    [DEMO_PROP_ID]: {
        format: 1,
        discussionKind: KIND_PANEL,
        venueKind: VENUE_KICK,
        venueRefHash: "0x0000000000000000000000000000000000000000000000000000000000000001",
        goal: "1500000000000000000",
        participants: [
            {
                index: 0,
                addr: "0xab49CbE5C2C17450a254e3cc68cF99e00837297B",
                handleHash: "0x32c9f360a0d71f2d669d1ff4c32502d42d319a6e8f7c1f6726b6803c6ab3afd2",
                role: ROLE_MODERATOR,
                confirmed: true,
                charity: "0x0000000000000000000000000000000000000000",
                withdrawn: false,
            },
            {
                index: 1,
                addr: "0x5D6595D88DB41ea19CC3b2F0ef641C2Ce3e1d9CC",
                handleHash: "0x15f1f6b0a24ba0a2f0b1c9a2f1f4f5e6d7c8b9a0b1c2d3e4f5a6b7c8d9e0f1a2",
                role: ROLE_SPEAKER,
                confirmed: true,
                charity: "0x0000000000000000000000000000000000000000",
                withdrawn: false,
            },
            {
                index: 2,
                addr: "0xEf141478931f9f83A0Ae50a76a70344c675FA6fe",
                handleHash: "0x26f2a7b1c35c0b3f0c2dae3f2a5f6e7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b",
                role: ROLE_SPEAKER,
                confirmed: true,
                charity: "0x0000000000000000000000000000000000000000",
                withdrawn: false,
            },
        ],
    },
} as const;

/** The chain override for a propId, or `undefined` when the demo has nothing for it. */
export const demoChainState = (propId: number | string | undefined) =>
    DEMO_MODE && propId !== undefined && propId !== null
        ? (DEMO_CHAIN_STATE as Record<number, (typeof DEMO_CHAIN_STATE)[42]>)[Number(propId)]
        : undefined;

/**
 * `getAgoraConfig() -> MarketConfig` — the module's live limits and switches.
 *
 * `poolCap` and `minDistinctPositions` are both load-bearing for the demo: the first is the
 * denominator of the 20 %-of-cap floor, the second the participation floor, and a share is only
 * rendered when both are met (`marketDisplay.forecastSuppressionReason`).
 */
export const DEMO_MARKET_CONFIG = {
    minStake: "10000000000000000",
    maxStakePerAccount: "500000000000000000",
    poolCap: "2000000000000000000",
    challengeBond: "50000000000000000",
    challengeWindow: 172800,
    resolutionWindow: 172800,
    challengeTimeout: 259200,
    minDistinctPositions: 2,
    marketFeeBps: 400,
    claimEnabled: true,
    stakingPaused: false,
};

/**
 * The market reads, per propId and in creation order.
 *
 * `MarketStrip` asks the chain for the market ids linked to a discussion, then one read per market
 * for its record, its pools, the chain's own staking-open predicate, the viewer's position and —
 * on the detail panel — the resolution, the challenge record and anything claimable. The diamonds
 * this frontend is configured for revert every Agora function, so with no fixture the section
 * renders "No forecasts on this discussion yet." on a discussion that plainly has forecasts.
 *
 * The amounts are sized so the honesty rules do not bite. `marketDisplay.forecastSuppressionReason`
 * withholds the share below 20 % of `poolCap`, without a participant count, and without a cap, so
 * the first market stakes 1.5 against a cap of 2 with 3 stated stakers: the floor is 0.4, the count
 * clears `minDistinctPositions`, and the share renders. Both of its outcomes carry a stake, so the
 * bar is two segments rather than one. The second market carries three outcomes, all staked, and
 * has closed without a result yet.
 *
 * Every hash is a well-formed `bytes32` (the ids and rules hashes are keccak256 of a demo label),
 * and each market record uses the struct's own field names from `LibAgoraMarket.sol`.
 */
export const DEMO_MARKETS = {
    [DEMO_PROP_ID]: [
        {
            // `getAgoraMarket(bytes32) -> AgoraMarket`
            market: {
                propId: DEMO_PROP_ID,
                classId: 0,
                templateId: 1,
                questionHash: "0x1bea3fb70b35f9a03fd10e10a983429fb2d39a5ae405a9d931250180c964caf7",
                outcomeCount: 2,
                // MARKET_STATE.OPEN
                state: 1,
                createdAt: nowSec - 86400 * 2,
                lockTS: nowSec + 86400 * 3,
                resolutionDeadline: nowSec + 86400 * 5,
                feeBpsSnapshot: 400,
                totalStaked: "1500000000000000000",
                distinctStakers: 3,
                rulesURIHash: "0x8f597f99b76417167e63a3e2d537858199dadc2ee71d0c77607ab6260926cdec",
            },
            // `getAgoraPool(bytes32) -> (uint96[] pools, uint256 totalStaked)`. Σ pools is the
            // market record's own `totalStaked`, which is the accounting the contract keeps.
            pools: ["1000000000000000000", "500000000000000000"],
            // `isStakingOpen(bytes32) -> bool`
            stakingOpen: true,
            // `getAgoraPosition(bytes32, address) -> (Position[], uint256, bool)`. A position
            // belongs to an account, so this only answers once a wallet is connected.
            position: {
                positions: [{ outcome: 0, amount: "400000000000000000" }],
                stakedTotal: "400000000000000000",
                hasPosition: true,
            },
            // `getAgoraResolution` / `getAgoraChallenge`: nothing is submitted while forecasting.
            resolution: null,
            challenge: null,
            // `getClaimableAmount` / `hasClaimedMarket`: nothing is due before a market is final.
            claimable: "0",
            hasClaimed: false,
        },
        {
            // `getAgoraMarket(bytes32) -> AgoraMarket`
            market: {
                propId: DEMO_PROP_ID,
                classId: 0,
                templateId: 2,
                questionHash: "0xcf61efd9aebb21d3588e2785cb1edc42d1b6ac4e1730c6b4096f9eb602f9157a",
                outcomeCount: 3,
                // MARKET_STATE.OPEN, with `lockTS` in the past: closed, awaiting a result.
                state: 1,
                createdAt: nowSec - 86400 * 5,
                lockTS: nowSec - 3600,
                resolutionDeadline: nowSec + 86400,
                feeBpsSnapshot: 400,
                totalStaked: "1500000000000000000",
                distinctStakers: 4,
                rulesURIHash: "0xfba5b42443f500d83c8328e22c22674f9a02a36aa954d227be22ef7a03fc28fa",
            },
            pools: ["500000000000000000", "500000000000000000", "500000000000000000"],
            stakingOpen: false,
            position: {
                positions: [],
                stakedTotal: "0",
                hasPosition: false,
            },
            resolution: null,
            challenge: null,
            claimable: "0",
            hasClaimed: false,
        },
    ],
};

/** The market overrides for a propId, or `undefined` when the demo has none for it. */
export const demoMarkets = (propId: number | string | undefined) =>
    DEMO_MODE && propId !== undefined && propId !== null
        ? (DEMO_MARKETS as Record<number, (typeof DEMO_MARKETS)[42]>)[Number(propId)]
        : undefined;

/**
 * The market override for one market id.
 *
 * The market reads are keyed by the `bytes32` question hash — that is what the diamond keys a
 * market by, and one discussion may carry several, which is why these hooks take an id rather than
 * a propId — so this looks up the id the caller already holds.
 */
export const demoMarket = (marketId: string | undefined) =>
    DEMO_MODE && marketId
        ? Object.values(DEMO_MARKETS)
              .flat()
              .find((entry) => entry.market.questionHash.toLowerCase() === marketId.toLowerCase())
        : undefined;
