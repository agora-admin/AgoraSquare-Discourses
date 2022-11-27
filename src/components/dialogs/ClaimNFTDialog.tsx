import { Dialog } from '@headlessui/react';
import { CloseCircle } from 'iconsax-react';
import {useRef,Dispatch,SetStateAction} from 'react';
import { ClaimNFTIcon } from '../utils/SvgHub';
import {v4 as uuid} from 'uuid'

const ClaimNFTDialog = ({ open, setOpen }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>>}) => {
    const buttonRef = useRef(null);

    const handleClose = () => {
        setOpen(false);
    }
    return (
        <Dialog as='div' open={open} onClose={handleClose} initialFocus={buttonRef}
                className='fixed z-20 inset-0 w-screen h-screen overflow-hidden'>
            <div className="flex items-center justify-center h-screen backdrop-blur-sm overflow-hidden">
                <Dialog.Overlay className="fixed inset-0 bg-black opacity-0 w-screen h-screen overflow-hidden" />

                <div className={`${open ? 'mobile:animate-dEnter': 'mobile:animate-dExit'} fixed inset-0 sm:relative bg-[#0A0A0A] rounded-t-3xl sm:rounded-3xl sm:max-w-md w-full p-4 flex flex-col gap-3`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ClaimNFTIcon />
                            <h3 className="font-bold text-sm text-white">Claim NFTs</h3>
                        </div>

                        <button onClick={handleClose} className="">
                            <CloseCircle size={23} color="#6C6C6C" variant='Bulk' />
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="w-full h-[1.2px] bg-[#1E1E1E]" />

                    {/* NFTs List */}
                    <ul className="flex flex-col gap-2 max-h-full sm:max-h-[410px] overflow-y-scroll">
                        {Array(4).fill(0).map((_,idx) => (
                            <div key={uuid()} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <img src={`/nft${idx+1}.png`} alt="NFT image" className="w-20 h-24 object-cover rounded-2xl bg-red-500" />
                                    <small className="text-white font-Lexend font-medium text-xs xs:text-sm">Direct vs delegate democracy</small>
                                </div>
                                <button className="text-[#E5F7FFE5] font-Lexend font-medium text-sm text-border pb-1 after:border-b-[#E5F7FFE5] after:bottom-0">Claim</button>
                            </div>
                        ))}
                    </ul>
                </div>
            </div>
        </Dialog>
    )
}

export default ClaimNFTDialog