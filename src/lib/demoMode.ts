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
    VENUE_TWITCH,
} from "../helper/AgoraHelper";

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO === "1";

/** The propId every demo link points at. */
export const DEMO_PROP_ID = 42;
export const DEMO_CHAIN_ID = 11155111;

/** The channel the frame embeds. Any real Twitch channel works. */
const DEMO_VENUE_REF = "agoradiscourses";

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
            amount: 1.5,
            timestamp: String(nowSec - 86400 * 3),
            txnHash: "0x7466eb6d1e7a7b20fef6316f81ef3a9fd62c5050b0eaaa38a1312c3dddeb73f4",
        },
        {
            __typename: "Fund",
            address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
            amount: 0.5,
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
        venueKind: VENUE_TWITCH,
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
