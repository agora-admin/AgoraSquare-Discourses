import { useState } from "react"
import NFTS from "./NFTs"
import RecentActivity from "./RecentActivity"

const ClassString = "text-[#BABABA] font-Lexend text-sm cursor-pointer py-2 px-4 transition-all rounded-3xl "
const SelectedClassString = "bg-[#0B0B0B] border-2 border-white/5 "
const NonSelectedClassString = " hover:bg-[#0B0B0B] hover:border-2 hover:border-white/5"

const Tabs = () => {
    const [currentTab,setCurrentTab] = useState(0)

    return (
        <div className="w-full flex flex-col gap-8 items-center">
            <div className="flex gap-4 items-center">
                <span onClick={() => setCurrentTab(0)} className={ClassString+(currentTab === 0 && SelectedClassString)+(currentTab !== 0 && NonSelectedClassString)}>NFTs</span>
                <span onClick={() => setCurrentTab(1)} className={ClassString+(currentTab === 1 && SelectedClassString)+(currentTab !== 1 && NonSelectedClassString)}>Recent Activities</span>
            </div>

            {currentTab === 0 ? <NFTS /> : <RecentActivity />}
        </div>
    )
}

export default Tabs