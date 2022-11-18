import { uuid } from "uuidv4"
import { ArrowNE, NotificationIcon, Polygon16 } from "../utils/SvgHub" 

const RecentActivity = () => {
    return (
        <div className="w-full flex flex-col gap-4">
            {Array(5).fill(0).map((_) => (
                <Activity key={uuid()} />
            ))}
        </div>
    )
}

export default RecentActivity

const Activity = () => {
    return (
        <div className="flex cursor-pointer gap-4 bg-[#0A0A0A] rounded-xl px-3 py-2 sm:px-5 sm:py-4 border-2 border-[#1E1E1E] sm:items-center">
            <NotificationIcon size={23} />

            <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <h3 className="flex-1 text-white font-Lexend text-xs sm:text-sm font-light">Invited to participate as speaker for rinkeby test#1</h3>
            
                <div className="flex mobile:self-end items-center gap-2 sm:gap-4">
                    <Polygon16 />
                    <div className="w-[1.2px] h-4 bg-[#1E1E1E]" />
                    <span className="text-[#7D8B92] font-medium text-[10px]">Apr 22, 2022</span>
                    <ArrowNE size={12} />
                </div>
            </div>
        </div>
    )
} 