import { ArrowCircleRight, ArrowRight, Video, VideoOctagon } from "iconsax-react";
import Link from "next/link";
const RecordingsCard = ({data}: {data: any}) => {
    return (
        <div className="bg-card rounded-xl py-3 px-4 flex justify-between">
            <div className="flex items-center gap-2">
                <Video size='16' color="#c6c6c6" />
                <p className="text-[#c6c6c6] font-Lexend text-xs">Check Recordings</p>
            </div>
            <Link href={`/watch/${data.id}`} passHref>
            <button className="flex button-i">
                <ArrowRight size='16' color="#c6c6c6" className="-rotate-45"/>
            </button>
            </Link>
        </div>
    );
}

export default RecordingsCard;