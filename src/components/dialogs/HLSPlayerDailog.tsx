import { Dialog } from '@headlessui/react';
import { CloseCircle, Video } from 'iconsax-react';
import dynamic from 'next/dynamic';
import { Dispatch, SetStateAction, useRef } from "react";
const ReactHlsPlayer = dynamic(
    () => import('react-hls-player'),
    {ssr: false}
)

const HLSPlayerDailog = ({ open, setOpen, data }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, data: any }) => {
    let buttonRef = useRef(null);

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <Dialog as='div' open={open} onClose={handleClose}
            initialFocus={buttonRef}
            className='fixed z-20 inset-0 w-screen h-screen overflow-hidden'>
            <div className="flex items-center justify-center h-screen backdrop-blur-sm overflow-hidden ">
                <Dialog.Overlay className="fixed inset-0 bg-black opacity-0 w-screen h-screen overflow-hidden" />
                <div className={`${open ? 'animate-dEnter' : 'animate-dExit'} relative bg-[#141515] border border-[#212427]  rounded-2xl max-w-lg w-full mx-auto `}>
                    { data && <>
                        <Dialog.Title className="w-full pt-2 flex justify-between px-4">
                            <div className='flex items-center gap-2'>
                                <Video size={20} color="#fff" />
                                <p className='text-xs text-white'>{(data?.id)}</p>
                            </div>
                            <button onClick={() => handleClose()} className='button-i'>
                                <CloseCircle size={20} color="#fff" />
                            </button>
                        </Dialog.Title>
                        <Dialog.Description className="flex flex-col  w-full items-center  gap-4 text-center justify-between">
                            <ReactHlsPlayer src={data.recordingUrl} autoPlay={true} width="100%" height="auto" controls={true} playerRef={buttonRef} />
                        </Dialog.Description>
                    </>}

                </div>
            </div>
        </Dialog>
    );
}



export default HLSPlayerDailog;