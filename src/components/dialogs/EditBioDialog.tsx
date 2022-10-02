import { Dialog } from "@headlessui/react";
import { Edit } from "iconsax-react";
import {Dispatch,SetStateAction,useRef} from "react"

const EditProfileDialog = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: Dispatch<SetStateAction<boolean>> }) => {
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
                            <Edit size="20" color="#FFFF"/>
                            Please set a bio
                        </Dialog.Title>
                        <Dialog.Description className="flex flex-col w-full items-center gap-4 text-center justify-between mt-2">
                            <textarea></textarea>
                            <div className='flex items-center justify-center w-full gap-4'>
                                <button ref={buttonRef} className='button-s font-semibold tracking-wide px-6 py-3 text-xs bg-[#212427] rounded-lg outline-none'>Update Your Bio</button>
                            </div>
                        </Dialog.Description>
                </div>
            </div>
        </Dialog>
  )
}

export default EditProfileDialog