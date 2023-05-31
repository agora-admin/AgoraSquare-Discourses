import { useContext, useState, useRef, useEffect } from 'react';
import { discourseConfirmed, DiscourseStateEnum, getStateTS, isSpeakerWallet, getSlotString, slotProposed } from "../../helper/DataHelper";
import AreYouSpeakerCard from '../actions/AreYouSpeakerCard';
import SlotCard from '../actions/SlotCard';
import Scheduler from '../actions/Scheduler';
import AppContext from "../utils/AppContext";
import ConfirmationStep from './ConfirmationStep';
import ConnectWalletCard from './ConnectWalletCard';
import FundClaimStep from './FundClaimStep';
import JoinMeetStep from './JoinMeetStep';
import { Event, ToastTypes } from '../../lib/Types';
import { CREATE_EVENT, PROPOSE_SLOT, ACCEPT_SLOT } from '../../lib/mutations';
import { GET_EVENT, GET_DISCOURSE_BY_ID } from '../../lib/queries';
import { v4 as uuid } from "uuid";
import { formatDate, getTimeFromDate } from "../../helper/TimeHelper"
import { SlotCalendarIcon } from "../utils/SvgHub";
import { usePersistedTokenStore } from '../../userToken';
import { useMutation, useQuery, useLazyQuery } from '@apollo/client';

// let mockEvent: Event = {
//     name: "",
//     address: "",
//     city: "",
//     state: "",
//     country: "",
//     zip: "",
// }

const DiscourseState = ({ discourseData, propId, chainId, slotConfirmed }: { discourseData: any, propId: any, chainId: any, slotConfirmed: (data: any) => boolean }) => {
    
    const { loggedIn, walletAddress, t_connected, addToast } = useContext(AppContext);
    const [scheduler, setScheduler] = useState(false);
    const [scheduled, setScheduled] = useState(false);
    const [formError, setFormError] = useState("");
    const token = usePersistedTokenStore(state => state.token);
    // const [newEvent, setNewEvent] = useState<Event>(mockEvent);

    const eventNameRef = useRef<HTMLInputElement>(null);
    const eventAddressRef = useRef<HTMLInputElement>(null);
    const eventCityRef = useRef<HTMLInputElement>(null);
    const eventStateRef = useRef<HTMLInputElement>(null);
    const eventCountryRef = useRef<HTMLInputElement>(null);
    const eventZipRef = useRef<HTMLInputElement>(null);

    const eventTimeRef = useRef<HTMLInputElement>(null);

    const { data, loading, error } = useQuery(GET_EVENT, {
        variables: { propId, chainId }
    })

    const [ refetch ] = useLazyQuery(GET_DISCOURSE_BY_ID, {
        variables: {
            id: discourseData.getDiscourseById.id
        }
    });

    const [ proposeSlotDynamic ] = useMutation(PROPOSE_SLOT, {
        onCompleted: (data) => {
            refetch();
        },
        context: { 
            headers: {
                'Authorization': 'Bearer ' + token,
            } 
        },
    })

    const [ acceptSlotDynamic ] = useMutation(ACCEPT_SLOT, {
        onCompleted: (data) => {
            refetch();
        },
        context: { 
            headers: {
                'Authorization': 'Bearer ' + token,
            } 
        },
    })

    const handleClick = () => {
        setScheduler(true);
    }

    const handleSubmit = () => {
        setScheduled(true);
    }

    const handleEventSubmitScheduler = () => {
        if (eventNameRef.current?.value != "" && eventAddressRef.current?.value != "" && eventCityRef.current?.value != "" && eventStateRef.current?.value != "" && eventCountryRef.current?.value != "" && eventZipRef.current?.value != "") {
            addToast({
                title: "Please Wait",
                body: "Waiting for form to submit.",
                type: ToastTypes.wait,
                duration: 6000,
                id: uuid()
            })
            createNewEvent({
                variables: {
                    eventInput: {
                        discourseId: discourseData?.getDiscourseById.id,
                        // eventTimestamp: discourseData.event?.timestamp,
                        venue: {
                            name: eventNameRef.current?.value as string,
                            address: eventAddressRef.current?.value as string,
                            city: eventCityRef.current?.value as string,
                            state: eventStateRef.current?.value as string,
                            country: eventCountryRef.current?.value as string,
                            zip: eventZipRef.current?.value as string
                        },
                    }
                },
                onCompleted: () => {
                    location.reload();
                }
            })
        }
        else {
            setFormError("Please fill all details.");
        }
    }

    const handleVirtualScheduled = () => {
        addToast({
            title: "Please Wait",
            body: "Waiting for form to submit.",
            type: ToastTypes.wait,
            duration: 6000,
            id: uuid()
        })
        const dateString = eventTimeRef.current?.value as any;
        const date = new Date(dateString);
        console.log(date);
        let slots: any[] = [];
        slots.push({
            timestamp: date.toISOString(),
            accepted: true
        })
        let slotInput = {
            propId: propId,
            chainId: chainId,
            slots: slots
        }

        proposeSlotDynamic({
            variables: {
                slotInput: slotInput
            },
            onCompleted: () => {
                let slotsData = {
                    timestamp: date.toISOString(),
                    accepted: true
                }
                acceptSlotDynamic({
                    variables: {
                        slotInput: {
                            propId: propId,
                            chainId: chainId,
                            slots: slotsData
                        }
                    },
                    onCompleted: () => {
                        location.reload();
                    },
                    context: { 
                        headers: {
                            'Authorization': 'Bearer ' + token,
                        } 
                    },
                })
            },
            context: { 
                headers: {
                    'Authorization': 'Bearer ' + token,
                } 
            },
        })
    }

    const handleEventSubmit = () => {
        // setNewEvent(getData());
        if (eventTimeRef.current?.value != "" && eventNameRef.current?.value != "" && eventAddressRef.current?.value != "" && eventCityRef.current?.value != "" && eventStateRef.current?.value != "" && eventCountryRef.current?.value != "" && eventZipRef.current?.value != "") {
            addToast({
                title: "Please Wait",
                body: "Waiting for form to submit.",
                type: ToastTypes.wait,
                duration: 6000,
                id: uuid()
            })
            const dateString = eventTimeRef.current?.value as any;
            const date = new Date(dateString);
            console.log(date);
            let slots: any[] = [];
            slots.push({
                timestamp: date.toISOString(),
                accepted: true
            })
            let slotInput = {
                propId: propId,
                chainId: chainId,
                slots: slots
            }

            proposeSlotDynamic({
                variables: {
                    slotInput: slotInput
                },
                onCompleted: () => {
                    let slotsData = {
                        timestamp: date.toISOString(),
                        accepted: true
                    }
                    acceptSlotDynamic({
                        variables: {
                            slotInput: {
                                propId: propId,
                                chainId: chainId,
                                slots: slotsData
                            }
                        },
                        onCompleted : () => {
                            createNewEvent({
                                variables: {
                                    eventInput: {
                                        discourseId: discourseData?.getDiscourseById.id,
                                        // eventTimestamp: discourseData.event?.timestamp,
                                        venue: {
                                            name: eventNameRef.current?.value as string,
                                            address: eventAddressRef.current?.value as string,
                                            city: eventCityRef.current?.value as string,
                                            state: eventStateRef.current?.value as string,
                                            country: eventCountryRef.current?.value as string,
                                            zip: eventZipRef.current?.value as string
                                        },
                                    }
                                },
                                onCompleted: () => {
                                    location.reload();
                                }
                            })
                        },
                        context: { 
                            headers: {
                                'Authorization': 'Bearer ' + token,
                            } 
                        },
                    })
                },
                context: { 
                    headers: {
                        'Authorization': 'Bearer ' + token,
                    } 
                },
            })
        }
        else{
            setFormError("Please fill all details.");
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

    const [createNewEvent] = useMutation(CREATE_EVENT);

    // const getData = () => {
    //     let data: Event = {
    //         name: eventNameRef.current?.value as string,
    //         address: eventAddressRef.current?.value as string,
    //         city: eventCityRef.current?.value as string,
    //         state: eventStateRef.current?.value as string,
    //         country: eventCountryRef.current?.value as string,
    //         zip: eventZipRef.current?.value as string
    //     }
    //     return data;
    // }

    return (
        <div className='sm:mb-6 flex flex-col gap-6'>
            {!loggedIn && <ConnectWalletCard />}

            {
                loggedIn && !t_connected && getStateTS(discourseData.getDiscourseById) !== DiscourseStateEnum.TERMINATED &&
                <AreYouSpeakerCard />
            } 

            <ConfirmationStep discourseData={discourseData} slotConfirmed={slotConfirmed} />
            {!scheduler && !scheduled &&
                discourseConfirmed(discourseData.getDiscourseById) && isSpeakerWallet(discourseData.getDiscourseById, walletAddress) && getStateTS(discourseData.getDiscourseById) === DiscourseStateEnum.SCHEDULING &&
                <>
                    <div className="bg-card rounded-xl flex flex-col p-4 gap-2">
                        {/* tab for dynamic scheduling */}
                        {<>
                        {!data && !slotProposed(discourseData.getSlotById) && <p className="text-[10px] text-[#c6c6c6]">
                            Has the discourse already been scheduled? <span className="tracking-wide font-semibold"></span>
                        </p>
                        }

                        {(data || slotProposed(discourseData.getSlotById)) &&
                            <p className="text-[10px] text-[#c6c6c6]">
                                Please use the Time Slot Selector to continue scheduling a time & date <span className="tracking-wide font-semibold"></span>
                            </p>
                        }

                        <div className="flex items-center gap-2">
                            {!data && !slotProposed(discourseData.getSlotById) && <button onClick={handleSubmit} className="button-s w-max flex items-center gap-2">
                                <p className="text-xs text-[#c6c6c6] font-Lexend">Already Scheduled</p>
                            </button>
                            }

                                {<button onClick={handleClick} className="button-s bg-gradient w-max">
                                    <p className="text-xs text-[#212427] font-Lexend">Go to Scheduler</p>
                                </button>
                                }
                            </div>
                        </>}
                    </div>

                </>
            }

            {/* For Scheduling The Discourse */}

            {
            slotConfirmed(discourseData.getDiscourseById) && discourseData.getSlotById.proposed &&
                <div className="bg-card rounded-xl flex flex-col p-4 mt-8 gap-2">
                    <div className="flex items-center gap-2">
                    <SlotCalendarIcon />
                        <div className="flex items-center justify-between w-full">
                            <p className="text-sm text-gradient font-semibold">{formatDate(new Date(getSlotString(discourseData.getSlotById)))} • {getTimeFromDate(new Date(getSlotString(discourseData.getSlotById)))}</p>
                        </div>
                    </div>
                </div>
            }
            {
                discourseConfirmed(discourseData.getDiscourseById) && isSpeakerWallet(discourseData.getDiscourseById, walletAddress) && getStateTS(discourseData.getDiscourseById) === DiscourseStateEnum.SCHEDULING && scheduler &&
                <SlotCard id={discourseData.getDiscourseById.id} propId={+discourseData.getDiscourseById.propId} chainId={+discourseData.getDiscourseById.chainId} endTS={+discourseData.getDiscourseById.endTS} data={discourseData.getSlotById} />
            }
            {
                discourseConfirmed(discourseData.getDiscourseById) && isSpeakerWallet(discourseData.getDiscourseById, walletAddress) && !data && getStateTS(discourseData.getDiscourseById) === DiscourseStateEnum.SCHEDULING && discourseData.getDiscourseById.irl && scheduler &&
                <>
                    <div className="bg-card rounded-xl flex flex-col p-4 gap-2">
                        <p className="text-sm text-gradient font-semibold">Enter venue details below</p>
                        <p className="text-[10px] text-[#c6c6c6]">
                            Event Name <span className="tracking-wide font-semibold"></span>
                        </p>
                        <div className="flex items-center gap-2">
                            <input type="text" ref={eventNameRef} id="event-name" className="max-w-[585px] input-s" placeholder="Event Name" />
                        </div>
                        <p className="text-[10px] text-[#c6c6c6]">
                            Address <span className="tracking-wide font-semibold"></span>
                        </p>
                        <div className="flex items-center gap-2">
                            <input type="text" ref={eventAddressRef} id="event-address" className="max-w-[585px] input-s" placeholder="Event Address" />
                        </div>
                        <p className="text-[10px] text-[#c6c6c6]">
                            City <span className="tracking-wide font-semibold"></span>
                        </p>
                        <div className="flex items-center gap-2">
                            <input type="text" ref={eventCityRef} id="event-city" className="max-w-[585px] input-s" placeholder="City" />
                        </div>
                        <p className="text-[10px] text-[#c6c6c6]">
                            State <span className="tracking-wide font-semibold"></span>
                        </p>
                        <div className="flex items-center gap-2">
                            <input type="text" ref={eventStateRef} id="event-state" className="max-w-[585px] input-s" placeholder="State" />
                        </div>
                        <p className="text-[10px] text-[#c6c6c6]">
                            Country <span className="tracking-wide font-semibold"></span>
                        </p>
                        <div className="flex items-center gap-2">
                            <input type="text" ref={eventCountryRef} id="event-country" className="max-w-[585px] input-s" placeholder="Country" />
                        </div>
                        <p className="text-[10px] text-[#c6c6c6]">
                            Zip Code <span className="tracking-wide font-semibold"></span>
                        </p>
                        <div className="flex items-center gap-2">
                            <input type="text" ref={eventZipRef} id="event-zip" className="max-w-[585px] input-s" placeholder="Zip Code" />
                        </div>
                        <button onClick={handleEventSubmitScheduler} className="button-s bg-gradient w-max">
                            <p className="text-xs text-[#212427] font-Lexend">Submit</p>
                        </button>
                    </div>

                </>
            }
                        {
                discourseConfirmed(discourseData.getDiscourseById) && isSpeakerWallet(discourseData.getDiscourseById, walletAddress) && data && !loading && !error && getStateTS(discourseData.getDiscourseById) === DiscourseStateEnum.SCHEDULING && scheduler &&
                <>
                    <div className="bg-card rounded-xl flex flex-col p-4 gap-2">
                        <p className="text-sm text-gradient font-semibold">Venue details entered successfully.</p>
                    </div>
                </>
            }


             {/* Event detail tab below for virtual*/}
             {
                discourseConfirmed(discourseData.getDiscourseById) && isSpeakerWallet(discourseData.getDiscourseById, walletAddress) && getStateTS(discourseData.getDiscourseById) === DiscourseStateEnum.SCHEDULING && !discourseData.getDiscourseById.irl && scheduled &&
                <>
                    <div className="bg-card rounded-xl flex flex-col p-4 gap-2">
                        <p className="text-[10px] text-[#c6c6c6]">
                            Event Time <span className="tracking-wide font-semibold"></span>
                        </p>
                        <div className="flex items-center gap-2">
                            <input type="datetime-local" ref={eventTimeRef} id="datetime-picker" className="max-w-[585px] input-s" placeholder="TimeStamp" />

                            <button onClick={handleVirtualScheduled} className="button-s bg-gradient w-max">
                                <p className="text-xs text-[#212427] font-Lexend">Submit</p>
                            </button>
                        </div>
                    </div>

                </>
            }
            {/* Event detail tab below for irl*/}
            {
                discourseConfirmed(discourseData.getDiscourseById) && isSpeakerWallet(discourseData.getDiscourseById, walletAddress) && getStateTS(discourseData.getDiscourseById) === DiscourseStateEnum.SCHEDULING && discourseData.getDiscourseById.irl && !data && scheduled &&
                <>
                    <div className="bg-card rounded-xl flex flex-col p-4 gap-2">
                        <p className="text-[10px] text-[#c6c6c6]">
                            Event Time <span className="tracking-wide font-semibold"></span>
                        </p>
                        <div className="flex items-center gap-2">
                            <input type="datetime-local" ref={eventTimeRef} id="datetime-picker" className="max-w-[585px] input-s" placeholder="TimeStamp" />
                        </div>
                        <p className="text-[10px] text-[#c6c6c6]">
                            Event Name <span className="tracking-wide font-semibold"></span>
                        </p>
                        <div className="flex items-center gap-2">
                            <input type="text" ref={eventNameRef} id="event-name" className="max-w-[585px] input-s" placeholder="Event Name" />
                        </div>
                        <p className="text-[10px] text-[#c6c6c6]">
                            Address <span className="tracking-wide font-semibold"></span>
                        </p>
                        <div className="flex items-center gap-2">
                            <input type="text" ref={eventAddressRef} id="event-address" className="max-w-[585px] input-s" placeholder="Event Address" />
                        </div>
                        <p className="text-[10px] text-[#c6c6c6]">
                            City <span className="tracking-wide font-semibold"></span>
                        </p>
                        <div className="flex items-center gap-2">
                        <input type="text" ref={eventCityRef} id="event-city" className="max-w-[585px] input-s" placeholder="City"/>
                        </div>
                        <p className="text-[10px] text-[#c6c6c6]">
                            State <span className="tracking-wide font-semibold"></span>
                        </p>
                        <div className="flex items-center gap-2">
                        <input type="text" ref={eventStateRef} id="event-state" className="max-w-[585px] input-s" placeholder="State"/>
                        </div>
                        <p className="text-[10px] text-[#c6c6c6]">
                            Country <span className="tracking-wide font-semibold"></span>
                        </p>
                        <div className="flex items-center gap-2">
                        <input type="text" ref={eventCountryRef} id="event-country" className="max-w-[585px] input-s" placeholder="Country"/>
                        </div>
                        <p className="text-[10px] text-[#c6c6c6]">
                            Zip Code <span className="tracking-wide font-semibold"></span>
                        </p>
                        <div className="flex items-center gap-2">
                        <input type="text" ref={eventZipRef} id="event-zip" className="max-w-[585px] input-s" placeholder="Zip Code"/>
                        </div>
                        <button onClick={handleEventSubmit} className="button-s bg-gradient w-max">
                            <p className="text-xs text-[#212427] font-Lexend">Submit</p>
                        </button>
                    </div>

                </>
            }
            {/* { getStateTS(discourseData.getDiscourseById) === DiscourseStateEnum.SCHEDULED && <JoinMeetStep data={discourseData} slotConfirmed={slotConfirmed}/> } */}
            <FundClaimStep data={discourseData} />
        </div>
    );
};

export default DiscourseState;
