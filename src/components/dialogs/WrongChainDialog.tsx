import { Dialog, Transition } from '@headlessui/react';
import { Dispatch, SetStateAction, useRef } from "react";
import { useRouter } from 'next/router';
import Web3 from "web3";
import { ethers } from "ethers";
import { useState, useEffect } from 'react';
import { useLazyQuery, useMutation, gql } from '@apollo/client';
import UseAnimations from 'react-useanimations';
import loading from 'react-useanimations/lib/loading';


const ConnectWalletDailog = ({ open, setOpen }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>> }) => {
    let buttonRef = useRef(null);

    const [minting, setMinting] = useState(false);

    const handleClose = () => {
        setOpen(false);
    }

    return (


            <Dialog as='div' open={open} onClose={handleClose}
                initialFocus={buttonRef}
                className='fixed z-20 inset-0 w-screen h-screen overflow-hidden'>
                <div className="flex items-center justify-center h-screen backdrop-blur-sm overflow-hidden">
                    <Dialog.Overlay className="fixed inset-0 bg-black opacity-0 w-screen h-screen overflow-hidden" />

                    <div className="relative bg-[#141515] border border-[#212427]  rounded-2xl max-w-sm w-full mx-auto px-6 py-4 sm:py-10 gap-4">
                        {/* Mint Post View */}
                        {!minting && <>
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
                                    connect your wallet (Metamask).</p>
                                <div className='flex items-center justify-center w-full gap-4'>
                                    <button ref={buttonRef} className='button-s font-semibold tracking-wide px-6 py-3  text-xs bg-[#212427] rounded-lg outline-none'>Connect Wallet</button>
                                </div>
                            </Dialog.Description>
                        </>
                        }
                        {/* Minting.. Post View */}
                        {minting &&
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

                                    Connecting Wallet
                                </Dialog.Title>
                                <Dialog.Description className="flex flex-col  w-full items-center  gap-4 text-center justify-between mt-4">
                                    <p className='text-[#c6c6c6] text-medium text-xs max-w-[40ch] flex-[1] '>Sign the message to <br />verify your wallet connection.</p>
                                    <div className='flex items-center justify-center gap-2'>
                                        <UseAnimations animation={loading} size={20} strokeColor="#ffffff" className='text-white' />
                                        <p className='text-sm text-white/50' >Please Wait...</p>
                                    </div>
                                </Dialog.Description>
                            </>
                        }
                        {/* Minted Post */}
                        {/* {!minting && postMinted &&
                            <>
                            <Dialog.Title className="text-white text-base  font-bold tracking-wide flex items-center gap-2 w-max self-center mx-auto ">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 21.9998H23M12.37 2.14984L21.37 5.74984C21.72 5.88984 22 6.30984 22 6.67984V9.99984C22 10.5498 21.55 10.9998 21 10.9998H3C2.45 10.9998 2 10.5498 2 9.99984V6.67984C2 6.30984 2.28 5.88984 2.63 5.74984L11.63 2.14984C11.83 2.06984 12.17 2.06984 12.37 2.14984ZM22 21.9998H2V18.9998C2 18.4498 2.45 17.9998 3 17.9998H21C21.55 17.9998 22 18.4498 22 18.9998V21.9998ZM4 17.9998V10.9998V17.9998ZM8 17.9998V10.9998V17.9998ZM12 17.9998V10.9998V17.9998ZM16 17.9998V10.9998V17.9998ZM20 17.9998V10.9998V17.9998Z" stroke="url(#paint0_linear_649_780)" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                    <defs>
                                        <linearGradient id="paint0_linear_649_780" x1="1" y1="12.0448" x2="23" y2="12.0448" gradientUnits="userSpaceOnUse">
                                            <stop stopColor="#FBED96" />
                                            <stop offset="1" stopColor="#ABECD6" />
                                        </linearGradient>
                                    </defs>
                                </svg>



                                error
                            </Dialog.Title>
                            <Dialog.Description className="flex flex-col  w-full items-center  gap-4 text-center justify-between mt-4">
                                <p className='text-[#c6c6c6] text-medium text-xs max-w-[40ch] flex-[1] '>Joining a dao utilizes follow from lens protocol. You need to approve two transactions to completely join a dao and claim delegate<br /><a className='text-gradient font-bold' href="https://docs.lens.dev/docs/follow" target="_blank" rel="noreferrer">Learn More</a></p>
                                <div className='flex items-center justify-center w-full px-10 gap-10'>
                                    <button onClick={handleClose} className='button-o px-4 text-xs text-white/60' >close</button>
                                    <a href='#' className='text-xs font-bold  text-gradient' >Joined ↗</a>
                                </div>
                            </Dialog.Description>
                            </>
                        } */}

                    </div>
                </div>
            </Dialog>
    );
}



export default ConnectWalletDailog;