import Layout from "../components/layout/Layout";
import Head from 'next/head'
import { useContext,useEffect,useState,useRef } from "react";
import { useRouter } from "next/router";
import TopBar from "../components/topbar/TopBar";
import CreateDiscourseDialog from "../components/dialogs/CreateDiscourseDailog";
import { CreateObj, SpeakerInputType,Moderator, ToastTypes, Event } from "../lib/Types";
import AppContext from "../components/utils/AppContext";
import { v4 as uuid } from "uuid";
import CreateCard from "../components/create/CreateCard";
import SpeakerInput from "../components/create/SpeakerInput";
import TopicsInput from "../components/create/TopicsInput";
import TitleInput from "../components/create/TitleInput";
import ModeratorInput from "../components/create/ModeratorInput";
import { InfoIcon } from "../components/utils/SvgHub";
import CharityInput from "../components/create/CharityInput";
import ConfirmationPeriodInput from "../components/create/ConfirmationPeriodInput";

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
    moderator: {},
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
    confirmationPeriod: 0,
    yt_link: "",
    disable: false,
    irl: false,
    // event: null,
}

const labelCSS = "text-[14px] text-[#E5F7FFE5] font-semibold capitalize";
const optionContainerCSS = "flex flex-col gap-2" 

const CreateDiscoursePage = () => {
    const route = useRouter();
    const [openFundDialog, setOpenFundDialog] = useState(false);
    const [formError, setFormError] = useState("");
    const [newDiscourse, setNewDiscourse] = useState<CreateObj>(mockD);
    const [openFundingTip,setOpenFundingTip] = useState(false);
    const [openCharityTip,setOpenCharityTip] = useState(false);
    const { addToast, loggedIn } = useContext(AppContext);

    useEffect(() => {
        if (!loggedIn) {
            route.push("/");
        }
    }, [loggedIn, route])

    const handleSubmit = () => {
        if (speakers.length >= 2 && title.length > 0 && topics.length >= 3 && description.length > 0 && confirmationPeriod >= 60) {
            setNewDiscourse(getData());
            setOpenFundDialog(true)
        } else if (speakers.length < 2) {
            setFormError("Please add speakers")
        } else if (title.length === 0) {
            setFormError("Please add a title")
        } else if (topics.length < 3) {
            setFormError("Please add at least 3 sub-topics")
        } else if (confirmationPeriod < 60) {
            setFormError("Please add a funding period.")
        }else{
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
    }, [addToast, formError]);

    // Form values states
    const [speakers, setSpeakers] = useState<Array<SpeakerInputType>>([]);
    const [moderator,setModerator] = useState<Moderator | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [charityPercent, setCharityPercent] = useState(0);
    const [confirmationPeriod, setConfirmationPeriod] = useState(0);
    const [topics, setTopics] = useState<Array<string>>([]);
    const [irl,setIRL] = useState(false);
    const eventTimeRef = useRef<HTMLInputElement>(null);
    const eventNameRef = useRef<HTMLInputElement>(null);
    const eventAddressRef = useRef<HTMLInputElement>(null);
    const eventCityRef = useRef<HTMLInputElement>(null);
    const eventStateRef = useRef<HTMLInputElement>(null);
    const eventCountryRef = useRef<HTMLInputElement>(null);
    const eventZipRef = useRef<HTMLInputElement>(null);

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
            moderator: {
                name: moderator?.name,
                username: moderator?.screen_name,
                image_url: moderator?.profile_image_url
            },
            propId: 0,
            description,
            title: title,
            prop_description: title,
            prop_starter: "0x00",
            charityPercent,
            initTS: "",
            endTS: "",
            topics: topics,
            initialFunding: "1",
            confirmationPeriod,
            yt_link: "",
            disable: false,
            irl,
            // event: {
            //     // timestamp: eventTimeRef.current?.value as string,
            //     name: eventNameRef.current?.value as string,
            //     address: eventAddressRef.current?.value as string,
            //     city: eventCityRef.current?.value as string,
            //     state: eventStateRef.current?.value as string,
            //     country: eventCountryRef.current?.value as string,
            //     zip: eventZipRef.current?.value as string
            // }
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
                <TopBar onDiscoursePage={false} />
                <div className='w-full min-h-screen flex flex-col py-4 sm:py-5 gap-8 sm:gap-10 z-10 mobile:pb-[100px] '>
                    <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-0">
                        <div className="flex flex-col">
                            <h4 className="text-[#D2B4FC] font-Lexend font-medium text-sm">start a new</h4>
                            <h2 className="text-white font-semibold text-4xl font-Lexend -tracking-[0.07em]">discourse</h2>
                            <p className="text-[#E5F7FF] text-xs font-semibold max-w-[50ch] mt-1">
                                crowdfund discourse from thought leaders to dialogue on the platfrom through discourse pools!
                            </p>
                        </div>

                        <CreateCard speakers={speakers} title={title} />
                    </div>

                    <CreateDiscourseDialog open={openFundDialog} setOpen={setOpenFundDialog} discourseData={newDiscourse} />

                    <div className="flex flex-col gap-6">
                        {/* Title input */}
                        <div className={optionContainerCSS}>
                            <label className={labelCSS} htmlFor="title">Topic For Discussion</label>
                            <TitleInput setTitle={setTitle} />
                        </div>

                        {/* Speaker input */}
                        <div className={optionContainerCSS}>
                            <label className={labelCSS} htmlFor="speaker1">Invite Speakers For Discussion</label>
                            <SpeakerInput speakers={speakers} setSpeakers={setSpeakers} />
                        </div>

                        {/* Suggest a Moderator(Optional) */}
                        <div className={optionContainerCSS}>
                            <label className={labelCSS} htmlFor="moderator">Suggest a Moderator (Optional)</label>
                            <ModeratorInput moderator={moderator} setModerator={setModerator} />
                        </div>

                        {/* Description */}
                        <div className={optionContainerCSS}>
                            <label className={labelCSS} htmlFor="description">Description for the discussion</label>
                            <div className="flex relative max-w-[585px]">
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} maxLength={256} className="w-full input-s" id="description" placeholder="What is goal for the discussion?" />
                                <p className="text-[10px] absolute bottom-2 right-3 text-[#c6c6c6]">{description.length} <span className="text-[#8e8e8e]"> / 256</span> </p>
                            </div>
                        </div>

                        {/* Topics */}
                        <div className={optionContainerCSS}>
                            <label className={labelCSS}>To keep the conversation active, please enter atleast 3 sub-topic</label>
                            <TopicsInput topics={topics} addTopic={handleAddTopic} removeTopic={handleRemoveTopic} />
                        </div>

                        {/* Funding Period Input */}
                        <div className={optionContainerCSS}>
                            <div className="flex items-center gap-1 relative">
                                <label className={labelCSS}>Confirmation Period</label>
                                <div className="cursor-pointer" onClick={() => {
                                    setOpenFundingTip(prev => !prev);
                                }}>
                                    <InfoIcon size={19} />
                                </div>

                                {/* Tip Box */}
                                <div className={`absolute left-[13ch] mobile:top-4 mobile:left-0 ${!openFundingTip && "-z-30"} ${openFundingTip && "z-30"} flex flex-col sm:flex-row sm:items-center`}>
                                    <div className={`${!openFundingTip && "scale-0 -translate-y-[50%] sm:-translate-x-[50%]"} ${openFundingTip && "scale-100"} mobile:relative left-[11ch] arrow_left mobile:arrow_up`}></div>
                                    <div className={`${!openFundingTip && "scale-0 sm:-translate-x-[50%]"} ${openFundingTip && "scale-100"} bg-[#0A0A0A] text-[#E5F7FFE5] text-[11px] border-2 border-white/10 rounded-xl p-3 w-60 xs:w-80 max-w-xs shadow-2xl transition-all`}>
                                        <p>Confirmation period is the time till which both the speakers can confirm. It needs to be in seconds.</p>
                                    </div>
                                </div>

                                {/* Transparent overlay */}
                                {openFundingTip && <div onClick={() => setOpenFundingTip(false)} className={`fixed inset-0 bg-transparent z-20`} />}
                            </div>
                            <ConfirmationPeriodInput confirmationPeriod={confirmationPeriod} setConfirmationPeriod={setConfirmationPeriod} />
                        </div>

                        {/* Charity Percent Input */}
                        <div className={optionContainerCSS}>
                            <div className="flex items-center gap-1 relative">
                                <label className={labelCSS}>charity percentage</label>
                                <div className="cursor-pointer" onClick={() => {
                                    setOpenCharityTip(prev => !prev);
                                }}>
                                    <InfoIcon size={19} />
                                </div>

                                {/* Tip Box */}
                                <div className={`absolute left-[16ch] mobile:top-4 mobile:left-0 ${!openCharityTip && "-z-30"} ${openCharityTip && "z-30"} flex flex-col sm:flex-row sm:items-center`}>
                                    <div className={`${!openCharityTip && "scale-0 -translate-y-[50%] sm:-translate-x-[50%]"} ${openCharityTip && "scale-100"} mobile:relative left-[13.5ch] arrow_left mobile:arrow_up`}></div>
                                    <div className={`${!openCharityTip && "scale-0 sm:-translate-x-[50%]"} ${openCharityTip && "scale-100"} bg-[#0A0A0A] text-[#E5F7FFE5] text-[11px] border-2 border-white/10 rounded-xl p-3 w-60 xs:w-80 max-w-xs shadow-2xl transition-all`}>
                                        <p>Charity percentage is the percentage of the funding that will be donated to the charities of speaker&apos;s choice. Each speaker can select a charity of their choice. Leave this field empty for non-charity discourses.</p>
                                    </div>
                                </div>

                                {/* Transparent overlay */}
                                {openCharityTip && <div onClick={() => setOpenCharityTip(false)} className={`fixed inset-0 bg-transparent z-20`} />}
                            </div>
                            <CharityInput charityPercentage={charityPercent} setCharityPercentage={setCharityPercent} />
                        </div>

                        {/* Type of event */}
                        <div className={optionContainerCSS}>
                            <label className={labelCSS}>type of event</label>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setIRL(false)} className={"cursor-pointer rounded-lg text-[#7D8B92] font-semibold text-[10px] sm:text-xs border-2 border-[#1E1E1E] px-3 py-2 "+(!irl && "bg-[#D2B4FC] !text-black !font-bold")}>TWITTER SPACES</button>
                                <button onClick={() => setIRL(true)} className={"cursor-pointer rounded-lg text-[#7D8B92] font-semibold text-[10px] sm:text-xs border-2 border-[#1E1E1E] px-3 py-2 " + (irl && "bg-[#D2B4FC] !text-black !font-bold")}>IRL</button>
                            </div>

                            {/* {
                                irl &&
                                <div className="mt-4 flex flex-col relative max-w-[585px] gap-6">
                                    <div className={optionContainerCSS}>
                                        <label htmlFor="datetime-picker" className={labelCSS}>Event Time</label>
                                        <input type="datetime-local" ref={eventTimeRef} id="datetime-picker" className="max-w-[585px] input-s" placeholder="TimeStamp" />
                                    </div>

                                    <div className={optionContainerCSS}>
                                        <label htmlFor="event-name" className={labelCSS}>Event Name</label>
                                        <input type="text" ref={eventNameRef} id="event-name" className="max-w-[585px] input-s" placeholder="Event Name" />
                                    </div>

                                    <div className={optionContainerCSS}>
                                        <label htmlFor="event-address" className={labelCSS}>Address</label>
                                        <input type="text" ref={eventAddressRef} id="event-address" className="max-w-[585px] input-s" placeholder="Event Address" />
                                    </div>

                                    <div className={optionContainerCSS}>
                                        <label htmlFor="event-city" className={labelCSS}>City</label>
                                        <input type="text" ref={eventCityRef} id="event-city" className="max-w-[585px] input-s" placeholder="City" />
                                    </div>

                                    <div className={optionContainerCSS}>
                                        <label htmlFor="event-state" className={labelCSS}>State</label>
                                        <input type="text" ref={eventStateRef} id="event-state" className="max-w-[585px] input-s" placeholder="State" />
                                    </div>

                                    <div className={optionContainerCSS}>
                                        <label htmlFor="event-country" className={labelCSS}>Country</label>
                                        <input type="text" ref={eventCountryRef} id="event-country" className="max-w-[585px] input-s" placeholder="Country" />
                                    </div>

                                    <div className={optionContainerCSS}>
                                        <label htmlFor="event-zip" className={labelCSS}>Zip Code</label>
                                        <input type="text" ref={eventZipRef} id="event-zip" className="max-w-[585px] input-s" placeholder="Zip Code" />
                                    </div>
                                </div>
                            } */}
                        </div>
                    </div>

                    <button onClick={handleSubmit} className="bg-[#D2B4FC] rounded-xl max-w-[585px] font-Lexend font-medium text-xs sm:text-sm px-4 py-3">
                        Continue & fund
                    </button>
                </div>
            </Layout>
        </div>
    );
}

export default CreateDiscoursePage;