import {
    useHMSActions, 
    useHMSStore, 
    selectPeers,
    selectHMSMessages,
    
} from '@100mslive/react-sdk';
import { CloseSquare, Profile2User, Send2 } from 'iconsax-react';
import { getAgoT } from '../../../helper/TimeHelper';
import { SpeakerOneCIcon, SpeakerTwoCIcon } from '../../utils/SvgHub';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { shortAddress } from '../../../helper/StringHelper';
import { getSpeakerIndex } from '../../../helper/DataHelper';
const Chat = ({ open, setOpen, speakers } : { open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, speakers:any }) => {

    const [message, setMessage] = useState('');
    const [endRequestReceived, setEndRequestReceived] = useState(false);
    const mendRef = useRef(null);
    const hmsActions = useHMSActions();

    const allMessages = useHMSStore(selectHMSMessages);

    useEffect(() => {
        if (mendRef.current) {
            (mendRef.current as HTMLDivElement).scrollIntoView({ behavior: 'smooth' });
        }
    }, [allMessages])

    const sendBroadcast = () => {
        hmsActions.sendBroadcastMessage(message);
        setMessage('');
    }

    const onEnterSend = (e: any) => {
        if (e.key === 'Enter') {
            sendBroadcast();
        }
    }

    const endSession = () => {

    }

    const peers = useHMSStore(selectPeers);

    const handleCloseClick = () => {
        setOpen((prev) => !prev);
    }

    return (
        <div className=" absolute inset-y-0 my-10 md:right-3   lg:my-0 md:mx-0 mx-auto lg:mx-0 lg:relative w-[90vw] lg:w-full md:max-w-xs flex flex-col bg-card p-4 rounded-xl">

            <div className="w-full flex justify-between items-center pb-4">
                <p className="text-sm text-white font-Lexend">Chat </p>
                <div className='flex gap-2 items-center'>
                <p className="text-xs flex items-center gap-1 flex-row-reverse text-[#c6c6c6] font-Lexend">{peers.length} <Profile2User size="16" color="#c6c6c6" /> </p>
                <button onClick={handleCloseClick} className='button-i lg:hidden'> <CloseSquare size='20' color="#c6c6c6" /> </button>
                </div>
            </div>
            <div className="w-full h-[1px] bg-[#2b2b2b] mb-2" />
            <div className="flex flex-col flex-1 w-full gap2 overflow-x-hidden overflow-y-auto">
                <div className="flex flex-col">
                    <p className="text-xs flex items-center gap-1 font-light text-[#797979] font-Lexend">This is the start of the chat</p>
                    {
                        allMessages.map((message) => (
                            <>
                                <div className="flex flex-col py-2 gap-[2px]">
                                    <div className="flex items-center gap-2 w-full">
                                        <p className="text-[#c6c6c6] font-Lexend text-[10px] flex items-center gap-1">
                                            {message.senderRole === 'speaker' && getSpeakerIndex(speakers, message.senderUserId+"") === 1 && <SpeakerOneCIcon />} 
                                            {message.senderRole === 'speaker' && getSpeakerIndex(speakers, message.senderUserId+"") !== 1 && <SpeakerTwoCIcon />} 
                                            {shortAddress(message.senderName)}</p>
                                        <p className="text-[#797979] font-Lexend text-[10px]">{getAgoT((new Date(message.time)).toISOString())}</p>
                                    </div>
                                    <p key={message.id} className="text-xs font-Lexend text-white"><span className="text-[#c6c6c6]"></span> {message.message}</p>
                                </div>
                            </>
                        ))
                    }
                    <div className="w-full h-2" ref={mendRef}></div>
                </div>
            </div>
            <div className="flex w-full items-center gap-2">
                <input onKeyDown={onEnterSend} value={message} onChange={(e) => setMessage(e.target.value)} className="input-s flex-1 font-Lexend" type="text" placeholder="Say 'hi' to everyone.." />
                <button onClick={sendBroadcast} className="button-s  p-2"><Send2 size='20' color="#c6c6c6" /> </button>
            </div>
        </div>
    );
}

export default Chat;