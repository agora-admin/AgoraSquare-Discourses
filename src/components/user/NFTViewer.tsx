import { Dialog } from "@headlessui/react";
import { Dispatch, FC, SetStateAction, useRef } from "react";

interface NFTViewerProp { 
    open: boolean, 
    setOpen: Dispatch<SetStateAction<boolean>>,
    nfts: any[],
    currentIdx: number
}

const NFTViewer:FC<NFTViewerProp> = ({ open, setOpen,nfts,currentIdx}) => {
    console.log(nfts);
    
    const buttonRef = useRef(null);
    // console.log(nfts[currentIdx]);
    
    const handleClose = () => {
        setOpen(false);
    }
    return (
        <Dialog as='div' open={open} onClose={handleClose} initialFocus={buttonRef}
                className='fixed z-20 inset-0 w-screen h-screen overflow-hidden'>
            <div className="flex items-center justify-center h-screen backdrop-blur-sm overflow-hidden">
                <Dialog.Overlay className="fixed inset-0 bg-black opacity-0 w-screen h-screen overflow-hidden" />

                <div className={`${open ? 'mobile:animate-dEnter': 'mobile:animate-dExit'} fixed inset-0 sm:relative h-full w-full p-4 flex justify-center items-center gap-3`}>
                    
                    <div className="bg-red-500 w-[500px] h-[500px] rounded-md"/>
                </div>
            </div>
        </Dialog>
    )
}

export default NFTViewer