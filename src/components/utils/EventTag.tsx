import { Coffee, Wifi } from "iconsax-react";
import { FC } from "react";

interface Props {
    irl?: boolean;
}

const EventTag: FC<Props> = ({irl = false}) => {

    if (irl) {
        return (
            <div className="flex items-center bg-[#FF8A65]/20 rounded-lg px-2 py-1 transition-all">
                    <Coffee size={16} color="#FF8A65" />
                    <p className="text-[10px] font-medium text-[#FF8A65] font-Lexend ml-2 mr-1">IRL</p>
            </div>
        );
    }

    return (
        <div className="flex items-center bg-[#6499FF]/20 rounded-lg px-2 py-1 transition-all">
            <Wifi size={16} color="#6499FF" />
            <p className="text-[10px] font-medium text-[#6499FF] font-Lexend ml-2 mr-1">Virtual</p>
    </div>
    )
}

export default EventTag;