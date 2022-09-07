import { Dialog } from '@headlessui/react';
import { Dispatch, SetStateAction, useRef } from "react";
import { getCurrencyName } from '../../Constants';
import { getFund } from '../../helper/FundHelper';
import { shortAddress } from '../../helper/StringHelper';
import { getAgoT } from '../../helper/TimeHelper';

const FundsDialog = ({ open, setOpen, funds, chainId }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, funds: Array<any>, chainId: number }) => {
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

                <div className={`${open ? 'animate-dEnter': 'animate-dExit'} relative bg-[#141515] border border-[#212427] max-h-[60vh]  rounded-2xl max-w-sm w-full mx-auto py-4 sm:py-6 gap-4 overflow-hidden`}>
                    {/* Mint Post View */}
                    {<>
                        <Dialog.Title className="text-white text-base  font-bold tracking-wide flex items-center gap-2 w-max px-6">
                            Fundings
                        </Dialog.Title>
                        <Dialog.Description as='div' className="flex flex-col w-full text-center justify-between mt-4 flex-1 px-6 overflow-y-auto max-h-[50vh] ">
                            <div className='flex flex-col w-full'>

                                {
                                    funds
                                    .sort((a: any, b: any) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
                                    .map((item: any, index: number) => (
                                        <div key={index} className="flex flex-col gap-2 py-2">
                                            <div className='flex items-center gap-2 text-[#616162] text-sm font-semibold'>
                                                <div className='bg-gradient-g w-6 h-6 rounded-xl overflow-clip' >
                                                    <img className="w-full h-full object-cover rounded-xl object-center" src={`https://avatar.tobi.sh/${item.address}`} alt="" />
                                                </div>
                                                <p className='text-white/60 text-xs'>{shortAddress(item.address)}</p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-gradient text-sm font-bold">{getFund(item.amount)} {getCurrencyName(chainId)}</p>
                                                <p className="text-white/40 text-[10px] ">{getAgoT(item.timestamp)}</p>
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

export default FundsDialog;