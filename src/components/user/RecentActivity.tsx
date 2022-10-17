import { Clock, MessageAdd1, MoneyRecive, Polygon } from "iconsax-react"
import { FC } from "react"
import { uuid } from "uuidv4"
import { getChainName } from "../../Constants"
import { InviteMessageIcon } from "../utils/SvgHub"

const Type = [1,2,3,3,2,1]
const Message = ["Invited to participate as Speaker for Rinkeby Test #1","Funding",
                 "Received a Discourse NFT","Attended the Discourse NFT","Funding",
                 "Invited to participate as Speaker for Rinkeby Test #1"]
const ChainID = [137,137,undefined,undefined,137,137]
const date = [new Date("20 April 2022"),new Date("20 April 2022"),undefined,undefined,new Date("20 April 2022"),new Date("20 April 2022")]

const RecentActivity = () => {
    return (
        <div className="w-[90%] flex flex-col gap-4">
            {Array(5).fill(0).map((_,idx) => (
                <Activity key={uuid()} 
                type={Type[idx]} 
                msg={Message[idx]} 
                chainId={ChainID[idx]}
                date={date[idx]}
                />
            ))}
        </div>
    )
}

export default RecentActivity

enum ActivityType{
    Invite=1,Funding,Received
}

interface ActivityProps{
    type: ActivityType,
    msg: string,
    chainId?: number,
    date?: Date
}

const getIcon = (type: ActivityType) => {
    switch(type){
        case ActivityType.Invite:
            return <InviteMessageIcon color="#797979" width={27} height={27} />
        case ActivityType.Funding:
            return <MoneyRecive color="#797979" size={27} variant="Outline" />
        case ActivityType.Received:
            return <MessageAdd1 size={27} color="#797979" variant="Outline" />
    }
}

const Activity: FC<ActivityProps> = ({type,msg,chainId,date}) => {
    return (
        <div className="flex gap-4 bg-[#0B0B0B] rounded-xl px-5 py-4 border-2 border-white/5 items-center">
            {getIcon(type)}

            <div className="flex-1 flex flex-col gap-2">
                <h3 className="text-white font-Lexend text-xs sm:text-sm font-light">{msg}</h3>
                {
                    type !== ActivityType.Received && 
                        <div className="flex items-center gap-4">
                            <div className="bg-[#7B3FE433]/20 rounded-3xl px-2 py-1 flex gap-1 items-center ">
                                <Polygon color="#7B3FE4" size={15} />
                                <span className="text-[#7B3FE4] text-[8px] sm:text-[10px] font-bold">{getChainName(chainId as number)}</span>
                            </div>

                            <div className="flex items-center gap-1">
                                <Clock size="15" color="#6A6A6A" variant="Bold"/>
                                <span className="text-[#6A6A6A] text-[8px] sm:text-[10px] font-bold">{date?.toDateString()}</span>
                            </div>
                        </div>
                }
            </div>
        </div>
    )
} 