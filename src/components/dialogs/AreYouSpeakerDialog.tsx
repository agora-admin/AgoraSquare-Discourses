import { Dispatch, SetStateAction, useRef } from "react";
import { Dialog } from '@headlessui/react'
import { TickSquare } from "iconsax-react";
import { useRouter } from "next/router";

const AreYouSpeakerDialog = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: Dispatch<SetStateAction<boolean>> }) => {
    const route = useRouter();

    let buttonRef = useRef(null);
    const handleClose = () => {
        setIsOpen(false);
    }

    return (
        <Dialog as='div' open={isOpen} onClose={() => {}}
            initialFocus={buttonRef}
            className='fixed z-20 inset-0 w-screen h-screen overflow-hidden'>
            <div className="flex items-center justify-center h-screen backdrop-blur-sm overflow-hidden">
                <Dialog.Overlay className="fixed inset-0 bg-black opacity-0 w-screen h-screen overflow-hidden" />

                <div className={`${isOpen ? 'animate-dEnter': 'animate-dExit'} relative bg-[#141515] border border-[#212427] rounded-lg max-w-sm w-full mx-auto px-6 py-4 sm:py-10`}>
                    
                        <Dialog.Title className="text-white text-base font-bold tracking-wide flex items-center gap-2 w-max self-center mx-auto ">
                            {/* <TickSquare size="32" color="#fff"/> */}
                            Are you a speaker
                        </Dialog.Title>
                        <Dialog.Description className="flex flex-col w-full items-center gap-4 text-center justify-between mt-2">
                            <p className='text-[#c6c6c6] font-medium text-xs max-w-[40ch] flex-1 '>To proceed further please
                                connect your twitter</p>
                            <div className='flex items-center justify-center w-full gap-4'>
                                <button ref={buttonRef} onClick={() => route.push('/link')} className='button-s font-semibold tracking-wide px-6 py-3 text-xs bg-[#212427] rounded-lg outline-none'>Connect</button>
                                <button ref={buttonRef} onClick={handleClose} className='button-s font-semibold tracking-wide px-6 py-3 text-xs bg-[#212427] rounded-lg outline-none'>Close</button>
                            </div>
                        </Dialog.Description>
                    
                </div>
            </div>
        </Dialog>
    )
}

export default AreYouSpeakerDialog