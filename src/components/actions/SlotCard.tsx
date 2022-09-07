import { Calendar1, CalendarTick, Clock } from "iconsax-react";
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { getOtherSpeaker, getSlotProposer, getSlotString, slotConfirmed } from "../../helper/DataHelper";
import { SlotCalendarIcon, SlotItemIcon } from "../utils/SvgHub";
import DatePicker from '../actions/DatePickerButton';
import DatePickerDialog from "../dialogs/DatePickerDialog";
import TimePickerDialog from "../dialogs/TimePickerDialog";
import { formatDate, getEndDate, getTimeFromDate } from "../../helper/TimeHelper";
import { useLazyQuery, useMutation } from "@apollo/client";
import { ACCEPT_SLOT, PROPOSE_SLOT } from "../../lib/mutations";
import { GET_DISCOURSE_BY_ID } from "../../lib/queries";
import AppContext from "../utils/AppContext";

const SlotCard = ({endTS, data, propId, chainId, id } : {endTS: number, data:any, propId: number, chainId: number, id: string}) => {

    const [ openDateDialog, setOpenDateDialog ] = useState(false);
    const [ openTimeDialog, setOpenTimeDialog ] = useState(false);

    const slots = [
        {
            "start_hr": 10,
            "end_hr": 12,
            "timestamp": "timestamp1",
            "accepted": false
        },
        {
            "start_hr": 12,
            "end_hr": 14,
            "timestamp": "timestamp1",
            "accepted": true
        },
        {
            "start_hr": 14,
            "end_hr": 16,
            "timestamp": "timestamp1",
            "accepted": false
        }
    ]

    const [selectedSlot, setSelectedSlot] = useState(-1);
    const [ sSlots, setSSlots ] = useState([]);
    const [ dates, setDates ] = useState([]);
    const { loggedIn, walletAddress } = useContext(AppContext);

    const [ refetch ] = useLazyQuery(GET_DISCOURSE_BY_ID, {
        variables: {
            id: id
        }
    });
    const [ proposeSlots ] = useMutation(PROPOSE_SLOT, {
        onCompleted: (data) => {
            refetch();
        }
    })

    const [ acceptSlot ] = useMutation(ACCEPT_SLOT, {
        onCompleted: (data) => {
            refetch();
        }
    })

    useEffect(() => {
        if (selectedSlot >= 0) {
            console.log(data.slots[selectedSlot].timestamp);
        }
    }, [selectedSlot])
    

    const handleAcceptSlot = () => {
        let newData = data;
        newData.slots[selectedSlot].accepted = true;

        let slotsData = newData.slots.map((slot:any) => {
            return {
                timestamp: slot.timestamp,
                accepted: slot.accepted
            }
        })

        acceptSlot({
            variables: {
                slotInput: {
                    propId: propId,
                    chainId: chainId,
                    slots: slotsData
                }
            }
        })
        
    }

    const handleSubmit = () => {

        let slots: any[] = [];
        let pSlot = [...sSlots];
        for (let i = 0; i < pSlot.length; i++) {

            let slot: any = pSlot[i];
            for (let j = 0; j < slot.slots.length; j++) {
                const date: Date = new Date((sSlots as any)[i].date);
                date.setHours((sSlots as any)[i].slots[j]);
                slots.push({
                    timestamp: date.toISOString(),
                    accepted: false
                });
            }
        }
        let slotInput = {
            propId: propId,
            chainId: chainId,
            slots: slots
        }

        proposeSlots({
            variables: {
                slotInput: slotInput
            }
        })
    }

    return (
        <>
            <div className="bg-card rounded-xl flex flex-col p-4 w-[80%] max-w-xs md:max-w-[80%] mt-8 gap-2">
                <div className="flex items-center gap-2">
                    <SlotCalendarIcon />
                    { !slotConfirmed(data) && !data.proposed && <p className="text-sm text-gradient font-semibold">Schedule a date and time</p>}
                    { !slotConfirmed(data) && data.proposed && <p className="text-sm text-gradient font-semibold">Schedule a date and time</p>}
                    { slotConfirmed(data) && data.proposed && 
                        <div className="flex items-center justify-between w-full">
                        <p className="text-sm text-gradient font-semibold">{formatDate(new Date(getSlotString(data)))} • {getTimeFromDate(new Date(getSlotString(data)))}
                        </p>

                        {/* <button className="button-o">Join</button> */}
                        </div>
                    }
                </div>
                {/* when no proposals are there */}
                { !data.proposed && <>
                    <p className="text-[10px] text-[#c6c6c6]">
                        Pick 3 date and time options for the discoures before <span className="tracking-wide font-semibold">{formatDate(getEndDate(endTS))}</span>
                    </p>

                    
                        <button onClick={() => setOpenDateDialog((prev) => !prev)} className="button-s w-max flex items-center gap-2">
                            { sSlots.length !== 3 &&
                                <Calendar1 size='16' color='#c6c6c6' />}
                            { sSlots.length === 3 &&
                                <CalendarTick size='16' color='#c6c6c6' />}
                            <p className="text-xs text-[#c6c6c6] font-Lexend">{
                                sSlots.length !== 3 ? "Select dates" : "Click to edit"
                            }</p>
                        </button>
                    

                    {/* <TimePickerDialog open={openTimeDialog} setOpen={setOpenTimeDialog} /> */}

                    <DatePickerDialog dates={dates} setDates={setDates} slots={sSlots} setSlots={setSSlots} endTS={endTS} open={openDateDialog} setOpen={setOpenDateDialog} />

                    { sSlots.length === 3 && <button onClick={handleSubmit} className="button-s bg-gradient w-max mt-2">
                        <p className="text-xs text-[#212427] font-Lexend">Submit &rarr;</p>
                    </button>}
                </>}

                { data.proposed && getSlotProposer(data) !== walletAddress && !slotConfirmed(data) && <>
                    <p className="text-[10px] text-[#c6c6c6]">
                        Pick any one slot to confirm the date and time before <span className="tracking-wide font-semibold">{formatDate(getEndDate(endTS))}</span>
                    </p>

                    <div className="flex flex-col gap-2">
                        {
                            data.slots.map((s: any ,index : number) => (
                                <SlotItem key={index} data={s}  i={index} selected={selectedSlot} setSelected={setSelectedSlot} />
                            ))
                        }
                    </div>

                    { selectedSlot !== -1 && <button onClick={handleAcceptSlot} disabled={selectedSlot === -1 ? true : false} className={`button-s  ${selectedSlot !=-1 ? 'bg-gradient' : ' button-s-d' } w-max mt-2`}>
                        <p className={`text-xs ${selectedSlot === -1 ? 'text-[#212427]': 'text-[#212427]'}  font-Lexend`}>Submit &rarr;</p>
                    </button>}
                </>}

                {
                    data.proposed && getSlotProposer(data) === walletAddress && !slotConfirmed(data) &&
                    <>
                        <p className="text-[10px] text-[#c6c6c6]">
                            Waiting for <span className="tracking-wide font-semibold">{}</span> other speaker to confirm the slot you recommended.
                        </p>
                    </>
                }
            </div>

        </>
    );
}

const SlotItem = ({ i, selected, setSelected, data } : { i:number, selected: number, setSelected: Dispatch<SetStateAction<number>>, data: any }) => {

    const handleClick = () => {
        setSelected(i);
    }

    let date: Date = new Date(data.timestamp);

    return (
        <div onClick={handleClick} className={`flex items-center gap-2 px-4 rounded-xl py-4 ${selected === i ? 'border border-[#212427]':'cursor-pointer hover:ring-[1px] ring-[#212427] '}  w-max`}>
            <SlotItemIcon active={selected === i ? true : false} />
            <div className="divd" />
            <p className={`text-xs ${selected === i ? 'text-gradient font-semibold': 'text-[#c6c6c6]' }  font-Lexend`}>{formatDate(date)} <b className="text-[#797979]">•</b> {getTimeFromDate(date)}</p>
        </div>
    )
}

export default SlotCard;