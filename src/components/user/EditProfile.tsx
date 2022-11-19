import EditProfileDialog from "../dialogs/EditProfileDialog";
import {useState} from 'react';
import { Edit2 } from "iconsax-react";

const EditProfile = () => {
    const [isOpen,setIsOpen] = useState(false);

    return (
    <>
        <button onClick={() => setIsOpen(true)}>
            <Edit2 size="14" color="white" variant="Bold" />
        </button>
        <EditProfileDialog isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

export default EditProfile;
