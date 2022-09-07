import { Dialog } from '@headlessui/react';
import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { getFund } from '../../helper/FundHelper';
import { shortAddress } from '../../helper/StringHelper';
import { getAgoT } from '../../helper/TimeHelper';
import DatePicker, { getSpanishDate } from '../actions/DatePickerButton';
import { useState } from 'react';
import { Add } from 'iconsax-react';

const slotsData =[
    8,9,10,11,12,13,14,15,16,17,18,19,20,21,22
]

const TimePickerDialog = ({ open, setOpen, index, dates, slots, setSlots }: 
    { open: boolean, setOpen: (index: number, val: boolean) => void , index: number, dates: Array<Date>, slots :Array<any>, setSlots: Dispatch<SetStateAction<any>>}) => {
    let buttonRef = useRef(null);

    const getSlots = () => {
        let s = slots.find((s: any) => s.date === (dates[index] as Date).toISOString());
        if (!s) {
            return [];
        }

        return s.slots;
    }
    const [ selectedSlots, setSelectedSlots ] = useState<Array<number>>(getSlots());

    // console.log('hr', selectedSlots);
    

    const handleClose = () => {
        setOpen(index, false);
    }


    const handleClick = (slot: number) => {
        if(selectedSlots.includes(slot)){
            let newSlots = selectedSlots.filter(s => s !== slot);
            setSelectedSlots(newSlots);
        } else {
            if (selectedSlots.length >= 3) {
                return;
            }
            let newSlots = [...selectedSlots];
            newSlots.push(slot);
            setSelectedSlots(newSlots);
        }
    }

    const slotAvailable = (date: Date) => {
        const s = slots.find(s => s.date === date.toISOString());
        if (!s) {
            return false;
        }
        return true;
    }

    const isToday = (date: Date) => {
        var today = new Date();
        if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
            return true;
        }
        return false;
    }

    const getSlotData = () => {
        var today = new Date();
        if(isToday(dates[index])){
            return slotsData.filter(s => s > today.getHours());
        }
        return slotsData;
    }

    const updateSlots = () => {
        if (selectedSlots.length < 3) {
            return;
        }
        let newSlots = [...slots];
        if (newSlots.find(s => s.date === dates[index].toISOString())) {
            newSlots = newSlots.filter(s => s.date !== dates[index].toISOString());
        }
        newSlots.push({
            date: dates[index].toISOString(),
            slots: selectedSlots
        });
        setSlots(newSlots);
        handleClose();
    }

    const getDisplaySlot = (slot: number) => {
        let slotString = '';
        if(slot < 12){
            if (slot < 10) {
                slotString = '0' + slot + ':00';
            } else {
                slotString = slot + ':00';
            }
        }else{
            let s = slot - 12;
            if (s < 10) {
                slotString = '0' + s + ':00';
            } else {
                slotString = s + ':00';
            }

            if (s === 0) {
                slotString = '12:00';
            }
        }
        return slotString;
    }

    const getAMPM = (slot: number) => {
        let ampm = '';
        if(slot < 12){
            ampm = 'AM';
        }else{
            ampm = 'PM';
        }
        return ampm;
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
                        <Dialog.Title className="text-white/40 text-base  tracking-wide flex flex-col gap-2 w-max px-6">
                            <p className='text-xs text-white/60 font-Lexend '>Select 3 slots for respective date</p>
                            <p className='text-xs font-Lexend '>{getSpanishDate(dates[index])}</p>
                        </Dialog.Title>
                        <Dialog.Description as='div' className="flex mt-2 flex-col w-full text-center justify-between flex-1 px-6 overflow-y-auto max-h-[75vh] ">
                            <div className='self-center grid grid-cols-5 grid-flow-row justify-center gap-4 my-2 w-max items-center'>
                                {
                                    getSlotData().map((h,i) => (
                                        <div onClick={() => handleClick(h)} className={` w-[50px] h-[50px] rounded-lg flex flex-col items-start justify-between p-2
                                            ${selectedSlots.includes(h) ? 'bg-blue-500 cursor-pointer' : selectedSlots.length >= 3 ? 'bg-[#212427] opacity-30 cursor-default' : 'bg-[#212427] hover:bg-blue-200/30 cursor-pointer'}`} key={i}>
                                            <p className={`text-xs font-medium ${selectedSlots.includes(h) ? 'text-white' : 'text-[#c6c6c6]'}`}>{getDisplaySlot(h)}</p>
                                            <p className={`text-[10px] font-Lexend font-medium ${selectedSlots.includes(h) ? 'text-[#c6c6c6]' : 'text-[#797979]'} `}>{getAMPM(h)}</p>
                                        </div>
                                    ))
                                }
                            </div>

                            <button ref={buttonRef} onClick={updateSlots} className=' mt-2 button-s font-semibold tracking-wide px-6 py-3  text-xs bg-[#212427] rounded-lg outline-none'>Confirm</button>

                        </Dialog.Description>
                    </>
                    }
                </div>
            </div>
        </Dialog>
    );
}

export default TimePickerDialog;