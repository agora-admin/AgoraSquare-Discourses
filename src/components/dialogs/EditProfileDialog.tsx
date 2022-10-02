import { Dispatch, SetStateAction, useRef,useState } from "react";
import { Dialog } from '@headlessui/react'
import { CloseCircle } from "iconsax-react";
import {  useMutation } from "@apollo/client";
import { UPDATE_BIO, UPDATE_NAME } from "../../lib/mutations";
import AppContext from "../utils/AppContext";
import {useContext} from 'react';

const EditProfileDialog = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: Dispatch<SetStateAction<boolean>> }) => {
    console.log("EditProfileDialog: Re Rendered");
    
    const buttonRef = useRef(null);
    const bioInputRef = useRef<HTMLInputElement>(null)
    const nameInputRef = useRef<HTMLInputElement>(null)

    const { bio,name } = useContext(AppContext);

    const {refresh} = useContext(AppContext)
    const [updateBio] = useMutation(UPDATE_BIO)
    const [updateName] = useMutation(UPDATE_NAME)

    const handleClose = () => {
        setIsOpen(false);
    }

    const onSave = () => {
        if(bio !== bioInputRef.current?.value)
            updateBio({
                variables: {
                    bio: bioInputRef.current?.value
                },
                onCompleted(){
                    refresh()
                }
            })
        

        if(name !== nameInputRef.current?.value){
            updateName({
                variables: {
                    name: nameInputRef.current?.value
                },
                onCompleted(){
                    refresh()
                }
            })
        }
        
        handleClose();
    }

    return (
        <Dialog as='div' open={isOpen} onClose={() => {}}
            initialFocus={buttonRef}
            className='fixed z-20 inset-0 w-screen h-screen overflow-hidden'>
            <div className="flex items-center justify-center h-screen backdrop-blur-sm overflow-hidden">
                <Dialog.Overlay className="fixed inset-0 bg-black opacity-0 w-screen h-screen overflow-hidden" />

                <div className={`${isOpen ? 'animate-dEnter': 'animate-dExit'} relative flex flex-col gap-4 bg-[#141515] border border-[#212427] rounded-lg max-w-sm w-full mx-auto p-2`}>
                    <div className="flex items-center gap-2">
                        <CloseCircle size="25" color="rgb(255 255 255/0.5)" ref={buttonRef} onClick={handleClose} className="cursor-pointer"/>
                        <span className="flex-1 text-white text-xs font-Lexend">Edit Profile</span>
                        <button onClick={onSave} className="bg-[#0B0B0B]/5 hover:bg-white/5 border-2 border-white/5 rounded-lg px-4 py-2 text-white text-[11px] font-Lexend">Save</button>
                    </div>

                    <form className="flex flex-col gap-2">
                        <input type="text" ref={nameInputRef} placeholder="Name" defaultValue={name} className="input-s w-full" />
                        <input type="text" ref={bioInputRef} placeholder="Bio" defaultValue={bio} className="input-s w-full"/>
                    </form>
                </div>
            </div>
        </Dialog>
    )
}

export default EditProfileDialog