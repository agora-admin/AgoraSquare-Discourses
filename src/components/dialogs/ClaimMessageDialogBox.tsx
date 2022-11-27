import { useRef,Dispatch,SetStateAction } from "react";
import { Dialog } from "@headlessui/react"

const ClaimMessageDialogBox = ({ open, setOpen }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>>}) => {
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
                        <p className="text-white font-Lexend font-medium">Claiming...</p>  
                    </div>
                </div>
        </Dialog>
    )
}

export default ClaimMessageDialogBox