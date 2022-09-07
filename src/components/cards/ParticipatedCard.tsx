import { ParticipatedIcon } from "../utils/SvgHub";

const ParticipatedCard = ({ email }: { email: string }) => {
    return (
        <div className="flex flex-col gap-2 bg-card rounded-xl p-4">
            <div className="flex items-center gap-2">
                <ParticipatedIcon />
                <p className="text-sm text-gradient font-bold">Participated</p>
            </div>
            <p className="text-[10px] text-[#c6c6c6]">
                Will send the details of event to your email address. <span className="text-[#797979] tracking-wide font-semibold">{email}</span>
            </p>
        </div>
    );
}

export default ParticipatedCard;