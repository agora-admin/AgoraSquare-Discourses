import { Dialog } from '@headlessui/react';
import { Dispatch, SetStateAction, useRef } from "react";

const ConnectWalletDailog = ({ open, setOpen }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) => {
    let buttonRef = useRef(null);

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <Dialog as='div' open={open} onClose={handleClose}
            initialFocus={buttonRef}
            className='fixed z-20 inset-0 w-screen h-screen overflow-hidden'>
            <div className="flex items-center justify-center h-screen backdrop-blur-sm overflow-hidden">
                <Dialog.Overlay className="fixed inset-0 bg-black opacity-0 w-screen h-screen overflow-hidden" />

                <div className={`${open ? 'animate-dEnter': 'animate-dExit'} relative bg-[#141515] border border-[#212427]  rounded-2xl max-w-sm w-full mx-auto px-6 py-4 sm:py-10 gap-4`}>
                    <>
                        <Dialog.Title className="text-white text-base  font-bold tracking-wide flex items-center gap-2 w-max self-center mx-auto ">
                            <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.125 12V17C22.125 20 20.125 22 17.125 22H7.125C4.125 22 2.125 20 2.125 17V12C2.125 9.28 3.765 7.38 6.315 7.06C6.575 7.02 6.845 7 7.125 7H17.125C17.385 7 17.635 7.01 17.875 7.05C20.455 7.35 22.125 9.26 22.125 12Z" stroke="url(#paint0_linear_588_2690)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M22.1249 12.5H19.1249C18.0249 12.5 17.1249 13.4 17.1249 14.5C17.1249 15.6 18.0249 16.5 19.1249 16.5H22.1249M17.8759 7.04996C17.6359 7.00996 17.3859 6.99996 17.1259 6.99996H7.12592C6.84592 6.99996 6.57592 7.01996 6.31592 7.05996C6.45592 6.77996 6.65592 6.51996 6.89592 6.27996L10.1459 3.01996C10.8059 2.36654 11.6972 2 12.6259 2C13.5547 2 14.4459 2.36654 15.1059 3.01996L16.8559 4.78996C17.4959 5.41996 17.8359 6.21996 17.8759 7.04996V7.04996Z" stroke="url(#paint1_linear_588_2690)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <defs>
                                    <linearGradient id="paint0_linear_588_2690" x1="2.125" y1="10.5556" x2="22.6867" y2="14.5354" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#84B9D1" />
                                        <stop offset="1" stopColor="#D2B4FC" />
                                    </linearGradient>
                                    <linearGradient id="paint1_linear_588_2690" x1="6.31592" y1="5.43703" x2="22.7658" y2="8.04057" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#84B9D1" />
                                        <stop offset="1" stopColor="#D2B4FC" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            Wallet not connected
                        </Dialog.Title>
                        <Dialog.Description className="flex flex-col  w-full items-center  gap-4 text-center justify-between mt-4">
                            <p className='text-[#c6c6c6] text-medium text-xs max-w-[40ch] flex-[1] '>To proceed further please
                                connect your wallet using connect button on top.</p>
                            <div className='flex items-center justify-center w-full gap-4'>
                                <button ref={buttonRef} onClick={handleClose} className='button-s font-semibold tracking-wide px-6 py-3  text-xs bg-[#212427] rounded-lg outline-none'>Okay</button>
                            </div>
                        </Dialog.Description>
                    </>
                    


                </div>
            </div>
        </Dialog>
    );
}



export default ConnectWalletDailog;