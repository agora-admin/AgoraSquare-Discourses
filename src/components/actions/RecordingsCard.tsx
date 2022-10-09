import { ArrowRight, Video, Youtube } from "iconsax-react";
import Link from "next/link";

const RecordingsCard = ({data}: {data: any}) => {
    return (
        <>
        <Link href={data.irl ? data.yt_link : `/watch/${data.id}`} passHref>
            <div className="bg-card rounded-xl py-3 px-4 flex justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                    {data.irl ? <Youtube size="16" color="#FF0000" variant="Bold" /> : <Video size='16' color="#c6c6c6" />}
                    <p className="text-[#c6c6c6] font-Lexend text-xs">{data.irl ? "Watch the event" : "Check Recordings"}</p>
                </div>
            
                <button className="flex button-i">
                    <ArrowRight size='16' color="#c6c6c6" className="-rotate-45"/>
                </button>
            </div>
        </Link>
        </>
    );
}

export default RecordingsCard;