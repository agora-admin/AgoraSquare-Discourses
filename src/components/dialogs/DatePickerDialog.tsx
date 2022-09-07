import { Dialog } from '@headlessui/react';
import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { getFund } from '../../helper/FundHelper';
import { shortAddress } from '../../helper/StringHelper';
import { getAgoT } from '../../helper/TimeHelper';
import DatePicker, { getSpanishDate } from '../actions/DatePickerButton';
import { useState } from 'react';
import { Add, Clock } from 'iconsax-react';
import TimePickerDialog from './TimePickerDialog';

interface Slots {
    date: string,
    slots: [number]
}

const DatePickerDialog = ({ open, setOpen, endTS, slots, setSlots, dates, setDates }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>> , endTS: number, slots :Array<any>, setSlots: Dispatch<SetStateAction<any>>, dates: Array<any>, setDates: Dispatch<SetStateAction<any>>}) => {
    let buttonRef = useRef(null);

    // const [ dates, setDates ] = useState([])
    // const [ slots, setSlots ] = useState([])

    const [ openTimePicker, setOpenTimePicker ] = useState([false, false, false]);

    const setOpenTPicker = (index: number, val: boolean) => {
        let newOpen = [...openTimePicker];
        newOpen[index] = val;
        setOpenTimePicker(newOpen);
    }


    // { date: ISOString, slots: [number] }
    // console.log('slots', slots);
    

    const handleClose = () => {
        setOpen(false);
    }

    const removeDate = (index: number) => {
        let newDates = [...dates];
        newDates.splice(index, 1);
        
        let newSlots = [...slots];
        newSlots = newSlots.filter((s : any) => s.date !== (dates[index] as Date).toISOString());
        setSlots(newSlots);
        setDates(newDates);
    }

    const slotSlected = (index: number) => {
        let s = slots.find((s: any) => s.date === (dates[index] as Date).toISOString());
        if (!s) {
            return false;
        }

        return true;
    }
    
    return (
        <Dialog as='div' open={open} onClose={handleClose}
            initialFocus={buttonRef}
            className='fixed z-20 inset-0 w-screen h-screen overflow-hidden'>
            <div className="flex items-center justify-center h-screen backdrop-blur-sm overflow-hidden">
                <Dialog.Overlay className="fixed inset-0 bg-black opacity-0 w-screen h-screen overflow-hidden" />

                <div className={`${open ? 'animate-dEnter': 'animate-dExit'} relative bg-[#141515] border border-[#212427] max-h-[80vh]  rounded-2xl max-w-sm w-full mx-auto py-4 sm:py-6 gap-4 overflow-hidden`}>
                    {/* Mint Post View */}
                    {<>
                        <Dialog.Title as="div" className="text-white/40 text-base w-full tracking-wide flex items-center gap-2 px-6 justify-between">
                            <div className='flex flex-col'>
                                <p className='text-sm text-white/60 font-Lexend '>Select 3 dates</p>
                                <p className='text-xs font-Lexend '>Click on clock icon for time slot</p>
                            </div>
                            { slots.length ==3 && <button onClick={handleClose} className='text-white/60 text-xs button-s'>Done</button>}
                        </Dialog.Title>
                        <Dialog.Description as='div' className="flex flex-col w-full text-center justify-between flex-1 px-6 overflow-y-auto max-h-[70vh] ">
                            <div className='flex flex-col w-full items-center'>
                                <DatePicker endTS={endTS} dates={dates} setDates={setDates} />
                            </div>

                            <div className='flex flex-col w-full gap-2'>
                                {
                                    dates.map((date : Date, index) => (
                                        <div key={index} className='w-full flex items-center p-2 border justify-between border-[#212427] rounded-lg'>
                                            <div className='flex items-center'>
                                            <p className='text-xs text-[#797979] p-1 mr-2'>{index+1}</p>
                                            <p className='text-white/60 text-sm font-medium font-Lexend'>{getSpanishDate(date)}</p>
                                            </div>
                                            <div className='flex items-center'>
                                                <button onClick={() => setOpenTPicker(index, !openTimePicker[index])} className='button-i'>
                                                    <div className='rotate-45'>
                                                    { slotSlected(index) && <Clock size='16' color="#34d399" />}
                                                    { !slotSlected(index) && <Clock size='16' color="#f87171" />}
                                                    </div>
                                                </button>
                                                <TimePickerDialog open={openTimePicker[index]} setOpen={setOpenTPicker} index={index} dates={dates} slots={slots} setSlots={setSlots} />
                                                <button onClick={() => removeDate(index)} className='button-i'>
                                                    <div className='rotate-45'>
                                                    <Add size='16' color="#797979" />
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>

                            <button ref={buttonRef} className='hidden button-s font-semibold tracking-wide px-6 py-3  text-xs bg-[#212427] rounded-lg outline-none'>Connect Wallet</button>

                        </Dialog.Description>
                    </>
                    }
                </div>
            </div>
        </Dialog>
    );
}

export default DatePickerDialog;