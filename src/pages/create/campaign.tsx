/**
 * `/create/campaign` — the campaign builder route.
 *
 * A sibling route, not a mode of `/create` (docs/ux/01 §16.2 item 1): the legacy page's validators
 * (`speakers.length >= 2`, `topics.length >= 3`) and its two-transaction flow stay exactly as they
 * are, and this page mounts the six-step builder that writes a campaign in one transaction.
 *
 * The page is deep-linkable with `?step=format|roster|subject|where|money|review`; the builder
 * refuses to land on a step the draft cannot satisfy and sends the user to the first unanswered
 * one instead.
 */

import Head from "next/head";
import Layout from "../../components/layout/Layout";
import TopBar from "../../components/topbar/TopBar";
import CampaignBuilder from "../../components/create/CampaignBuilder";

const CampaignBuilderPage = () => (
    <div className="w-full">
        <Head>
            <title>New Campaign | Discourses</title>
            <meta name="description" content="Build a multi-participant Agora campaign" />
            <link rel="icon" href="/discourse_logo_fav.svg" />
        </Head>

        <Layout>
            <TopBar onDiscoursePage={false} />

            <div className="w-full min-h-screen flex flex-col py-4 sm:py-5 gap-8 sm:gap-10 z-10 mobile:pb-[100px]">
                <div className="flex flex-col">
                    <h4 className="text-[#D2B4FC] font-Lexend font-medium text-sm">start a new</h4>
                    <h2 className="text-white font-semibold text-4xl font-Lexend -tracking-[0.07em]">campaign</h2>
                    <p className="text-[#E5F7FF] text-xs font-semibold max-w-[50ch] mt-1">
                        crowdfund a discussion with up to twelve participants, a named venue and a funding goal.
                    </p>
                </div>

                <CampaignBuilder />
            </div>
        </Layout>
    </div>
);

export default CampaignBuilderPage;
