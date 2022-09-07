import { ParticipatedIcon, ParticipateIcon, RightArrowGradient } from "../utils/SvgHub";
import { useContext, useState } from "react";
import { validateEmail } from "../../helper/StringHelper";
import { useMutation, useLazyQuery } from "@apollo/client";
import { PARTICIPATE } from "../../lib/mutations";
import { GET_DISCOURSE_BY_ID } from "../../lib/queries";
import AppContext from "../utils/AppContext";

const ParticipateCard = ({ data }: {data : any}) => {
    const [ email, setEmail ] = useState('');
    const { loggedIn, walletAddress } = useContext(AppContext);

    const [participate, { data: participateData, loading: participateLoading, error: participateError }] = useMutation(PARTICIPATE);

    const [ refetch ] = useLazyQuery(GET_DISCOURSE_BY_ID, {
        variables: {
            id: data.id
        }
    });

    const isParticipant = (data: any) => {

        if (data && walletAddress) {
            return data.participants.some((participant: any) => participant.address === walletAddress);
        }
        return false;
    }

    const getParticipatedEmail = (data: any) => {
        if (data && walletAddress) {
            return data.participants.find((participant: any) => participant.address === walletAddress).email;
        }
        return "";
    }

    const [ edit, setEdit ] = useState(false);

    const handleParticipate = () => {
        if (loggedIn) {
            if (email !== "" && validateEmail(email)) {
                participate({
                    variables: {
                        id: data.id,
                        email: email
                    },
                    onCompleted: (data) => {
                        setEdit(false);
                        refetch();
                    }
                })
                //participate
            } else {
                // show email text
            }
        } 
        // else {
        //     setOpenConnectWallet((prev: boolean) => !prev);
        // }
    }

    const handleCancel = () => {
        setEdit((prev: boolean) => !prev)
        setEmail('');
    }

    const handleEdit = () => {
        setEdit((prev: boolean) => !prev)
        setEmail(getParticipatedEmail(data));
    }
    return (
        <>
        { !isParticipant(data) && !edit && <div className="flex flex-col gap-2 bg-card rounded-xl p-4">
            <div className="flex items-center gap-2">
                <ParticipateIcon />
                <p className="text-sm font-Lexend text-gradient font-bold">Participate</p>
            </div>

            <div className="mt-4 flex items-center justify-between w-full bg-[#141515]/60 p-3 rounded-lg gap-1">
                <input value={email} onChange={(e) => setEmail(e.target.value)} className=" bg-transparent text-xs font-semibold tracking-wide outline-none border-none text-white/80 grow" type="text" placeholder="Email address" />
                <button onClick={handleParticipate} className="outline-none border-none">
                    <RightArrowGradient />
                </button>
            </div>

        </div> }

        { edit && <div className="flex flex-col gap-2 bg-card rounded-xl p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                <ParticipateIcon />
                <p className="text-sm font-Lexend text-gradient font-bold">Edit</p>
                </div>
                <button><b onClick={handleCancel} className="cursor-pointer text-xs font-Lexend font-normal text-[#1DA1F2] hover:underline"> cancel</b></button>
            </div>

            <div className="flex items-center justify-between w-full bg-[#141515]/60 p-3 rounded-lg gap-1">
                <input value={email} onChange={(e) => setEmail(e.target.value)} className=" bg-transparent text-xs font-semibold tracking-wide outline-none border-none text-white/80 grow" type="text" placeholder="Email address" />
                <button onClick={handleParticipate} className="outline-none border-none">
                    <RightArrowGradient />
                </button>
            </div>

        </div> }

        { isParticipant(data) && !edit &&
            <div className="flex flex-col gap-2 bg-card rounded-xl p-4">
            <div className="flex items-center gap-2">
                <ParticipatedIcon />
                <p className="text-sm text-gradient font-bold">Participated</p>
            </div>
            <p className="text-[10px] text-[#c6c6c6]">
                Will send the details of event to your email address. <span className="text-[#797979] tracking-wide font-semibold">{getParticipatedEmail(data)}</span> <b onClick={handleEdit} className="cursor-pointer text-[#1DA1F2] hover:underline"> edit</b>
            </p>
            </div>
        }
        </>
    );
}

export default ParticipateCard;