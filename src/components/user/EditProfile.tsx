import EditProfileDialog from "../dialogs/EditProfileDialog";
import {useState} from 'react';
import { Edit2 } from "iconsax-react";

const EditProfile = () => {
    const [isOpen,setIsOpen] = useState(false);

    return (
    <>
        <button onClick={() => setIsOpen(true)} className="hidden md:block bg-[#0B0B0B]/5 hover:bg-white/5 border-2 border-white/5 rounded-lg px-4 py-2 text-white text-[11px] font-Lexend">Edit profile</button>
        <button onClick={() => setIsOpen(true)} className="block md:hidden">
            <Edit2 size="14" color="white" variant="Bold" />
        </button>
        <EditProfileDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

export default EditProfile;
