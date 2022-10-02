import EditProfileDialog from "../dialogs/EditProfileDialog";
import {useState} from 'react';

const EditProfile = () => {
    const [isOpen,setIsOpen] = useState(false);

    return (
    <>
        <div className="absolute right-10">
            <button onClick={() => setIsOpen(true)} className="bg-[#0B0B0B]/5 hover:bg-white/5 border-2 border-white/5 rounded-lg px-4 py-2 text-white text-[11px] font-Lexend">Edit profile</button>
        </div>
        
        <EditProfileDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

export default EditProfile;
