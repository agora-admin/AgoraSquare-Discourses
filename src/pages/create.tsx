import Layout from "../components/layout/Layout";
import Branding from "../components/utils/Branding";
import Head from 'next/head'
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { Add, Link, PercentageSquare, Timer, Timer1 } from "iconsax-react";
import { Listbox } from '@headlessui/react'
import { useRouter } from "next/router";
import TopBar from "../components/topbar/TopBar";
import FundDiscourseDialog from "../components/dialogs/FundDiscourseDialog";
import { ArrowNE, CloseIcon, Polygon16 } from "../components/utils/SvgHub";
import CreateDiscourseDialog from "../components/dialogs/CreateDiscourseDailog";
import { CreateObj, Speaker, ToastTypes } from "../lib/Types";
import AppContext from "../components/utils/AppContext";
import { uuid } from "uuidv4";
import ChainTag, { ChainIcon } from "../components/utils/ChainTag";
import { useNetwork } from "wagmi";
import BDecoration from "../components/utils/BDecoration";
import ConnectWalletDailog from "../components/dialogs/ConnectWalletDailog";
import CreateCard from "../components/create/CreateCard";
import SpeakerInput from "../components/create/SpeakerInput";
import TopicsInput from "../components/create/TopicsInput";
import FundingInput from "../components/create/FundingInput";
import CharityInput from "../components/create/CharityInput";
import TitleInput from "../components/create/TitleInput";


let mockD: CreateObj = {
    speakers: [
        {
            name: "",
            username: "",
            confirmed: false,
            isTwitterHandle: true,
            address: "0x00",
            image_url: ""
        },
        {
            name: "",
            username: "",
            confirmed: false,
            isTwitterHandle: true,
            address: "0x00",
            image_url: ""
        }
    ],
    propId: 0,
    description: "",
    title: "",
    prop_description: "",
    prop_starter: "0x00",
    charityPercent: 0,
    initTS: "",
    endTS: "",
    topics: [],
    initialFunding: "0.01",
    fundingPeriod: 0
}

const CreateDiscoursePage = () => {

    const route = useRouter();
    const [topicCount, setTopicCount] = useState(3)
    const [openFundDialog, setOpenFundDialog] = useState(false);
    const [formError, setFormError] = useState("");
    const [newDiscourse, setNewDiscourse] = useState<CreateObj>(mockD);
    const { addToast, loggedIn } = useContext(AppContext);
    const [notified, setNotified] = useState(false);
    const { activeChain } = useNetwork();

    useEffect(() => {
        if (!loggedIn) {
            route.push("/");
        }
    }, [loggedIn, route])

    const handleSubmit = () => {
        if (speakers.length >= 2 && title.length > 0 && topics.length >= 3 && description.length > 0 && fundingPeriod >= 60) {
            setNewDiscourse(getData());
            setOpenFundDialog(true)
        } else if (speakers.length < 2) {
            setFormError("Please add speakers")
        } else if (title.length === 0) {
            setFormError("Please add a title")
        } else if (topics.length < 3) {
            setFormError("Please add at least 3 sub-topics")
        } else if (fundingPeriod < 60) {
            setFormError("Please add a funding period.")
        }
        else{
            setFormError("Please fill all the details")
        }
    }

    useEffect(() => {
        var timerTask = setTimeout(() => {
            setFormError("")
        }, 6000);
        if (formError === "") {
            clearTimeout(timerTask)
        }

        if (formError) {
            addToast({
                title: "Error",
                body: formError,
                type: ToastTypes.error,
                duration: 6000,
                id: uuid()
            })
        }
    }, [formError]);


    // Form values states
    const [speakers, setSpeakers] = useState<Array<Speaker>>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [charityPercent, setCharityPercent] = useState(0);
    const [fundingPeriod, setFundingPeriod] = useState(0);
    const [topics, setTopics] = useState<Array<string>>([]);

    const handleAddTopic = (topic: string) => {
        setTopics(prev => [...prev, topic])
    }

    const handleRemoveTopic = (topic: string) => {
        setTopics(prev => prev.filter((t) => t !== topic))
    }

    const getData = () => {
        let data: CreateObj = {
            speakers: [
                {
                    name: speakers[0].name,
                    username: speakers[0].screen_name,
                    confirmed: false,
                    isTwitterHandle: true,
                    address: "0x00",
                    image_url: speakers[0].profile_image_url
                },
                {
                    name: speakers[1].name,
                    username: speakers[1].screen_name,
                    confirmed: false,
                    isTwitterHandle: true,
                    address: "0x00",
                    image_url: speakers[1].profile_image_url
                }
            ],
            propId: 0,
            description: description,
            title: title,
            prop_description: title,
            prop_starter: "0x00",
            charityPercent: charityPercent,
            initTS: "",
            endTS: "",
            topics: topics,
            initialFunding: "0.01",
            fundingPeriod: fundingPeriod
        }
        return data;
    }

    return (
        <div className="w-full">
            <Head>
                <title>New Discourse</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/discourse_logo_fav.svg" />
            </Head>
            <Layout>

                <BDecoration />

                <div className='w-full min-h-screen flex flex-col py-10 gap-4 z-10 '>
                    {/* TopSection */}

                    <TopBar />

                    <div className="flex flex-col w-full self-center md:justify-between px-6 sm:px-10 mx-10 lg:mx-0 gap-4">
                        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between py-10">
                            <div className="flex flex-col w-full sm:w-max  ">
                                <h4 className="text-white font-Lexend">Start a new</h4>
                                <h2 className="text-gradient font-bold text-4xl">Discourse</h2>
                                <p className="text-[#c6c6c6] font-Lexend text-[10px] max-w-[50ch] mt-2">
                                    Crowdfund discourse from thought leaders to dialogue on the platfrom through discourse pools!
                                </p>
                            </div>

                            <CreateCard speakers={speakers} title={title} />
                        </div>

                        <CreateDiscourseDialog open={openFundDialog} setOpen={setOpenFundDialog} data={newDiscourse} />

                        {/* Title input */}
                        <label className="text-[14px] text-white/60 font-Lexend" htmlFor="title">Topic For Discussion</label>
                        <TitleInput title={title} setTitle={setTitle} />

                        {/* Speaker input */}
                        <label className="text-[14px] text-white/60 font-Lexend" htmlFor="speaker1">Invite speakers for discussion</label>
                        <SpeakerInput speakers={speakers} setSpeakers={setSpeakers} />
                        {/* Discription */}
                        <label className="text-[14px] text-white/60 font-Lexend" htmlFor="description">Description for the discussion</label>
                        <div className="flex relative w-full">
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={256} className="max-w-full w-full input-s" id="description" placeholder="maybe global warming or is god real" />
                            <p className="text-[10px] absolute bottom-2 right-2 text-[#c6c6c6]">{description.length} <span className="text-[#8e8e8e]"> / 256</span> </p>
                        </div>

                        {/* Topics */}
                        <label className="text-[14px] font-Lexend text-white/60">To keep the conversation active, please enter atleast 3 sub-topic</label>
                        <TopicsInput topics={topics} addTopic={handleAddTopic} removeTopic={handleRemoveTopic} />

                        {/* Funding Period Input */}
                        <label className="text-[14px] font-Lexend text-white/60">Funding Period</label>
                        <FundingInput fundingPeriod={fundingPeriod} setFundingPeriod={setFundingPeriod} />

                        {/* Charity Percent Input */}
                        <label className="text-[14px] font-Lexend text-white/60">Charity Percentage</label>
                        <CharityInput charityPercentage={charityPercent} setCharityPercentage={setCharityPercent} />

                        <div className="w-full h-[1px] bg-[#303030] my-2" />

                        <button onClick={handleSubmit} className="button-s w-max font-Lexend text-sm px-4 py-3">
                            Continue & fund
                        </button>

                    </div>
                </div>
            </Layout>
        </div>
    );
}

export default CreateDiscoursePage;