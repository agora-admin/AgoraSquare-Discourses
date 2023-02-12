import { ArrowNE } from "../utils/SvgHub";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import AppContext from "../utils/AppContext";
import { useNetwork } from "wagmi";
import { supportedChainIds } from "../../Constants";
import { ToastTypes } from "../../lib/Types";
import { v4 as uuid } from "uuid";
import { ArrowCircleRight } from "iconsax-react";
import ConnectWalletDailog from "../dialogs/ConnectWalletDailog";

const HeroCard = () => {
    const route = useRouter();
    const { loggedIn, addToast } = useContext(AppContext);
    const [openConnectWallet, setOpenConnectWallet] = useState(false);
    const { chain } = useNetwork();
    
    const handleCreate = () => {
        if (loggedIn) {
            if (supportedChainIds.includes(chain?.id!)) {
                route.push('/create');
            } else {
                addToast({
                    title: "Chain not supported",
                    body: "Discourses only supports 'Polygon' chain. Please use correct chain",
                    type: ToastTypes.error,
                    id: uuid(),
                    duration: 6000
                })
            }
        } else {
            setOpenConnectWallet((prev: boolean) => !prev);
        }
    }

    const getChainVersion = () => {
        if(supportedChainIds.includes(80001) || supportedChainIds.includes(71401)){
            return "mainnet"
        }else {
            return "testnet"
        }
    }

    const getChainVersionLink = () => {
        if(supportedChainIds.includes(80001) || supportedChainIds.includes(71401)){
            return "https://discourses.agorasquare.xyz"
        }else {
            return "https://testnet.discourses.agorasquare.xyz"
        }
    }

    return (
        <div className="bg-[#0A0A0A] flex flex-col md:flex-row gap-4 md:gap-0 mobile:items-center md:items-center md:justify-between p-6 rounded-3xl">
            {
                !loggedIn && <ConnectWalletDailog open={openConnectWallet} setOpen={setOpenConnectWallet} />
            }
            <div className="flex flex-col mobile:items-center gap-4">
                <div className="flex flex-col mobile:items-center">
                    <small className="text-[#D2B4FC] font-Lexend font-medium">introducing</small>
                    <big className="text-white text-4xl font-bold font-Lexend -tracking-[0.07em]">discourses</big>
                    <p className="text-xs xs:text-[13px] text-[#E5F7FF] mobile:mt-1 mobile:text-center">Create crowdfunding campaigns to see thought leaders engage in dialogue.</p>
                </div>

                <div className="flex flex-col xs:flex-row items-center gap-2">
                    <a href="https://www.loom.com/share/a871f5c4e2fb40de9e4ea9c921e64d35" target="_blank" rel="noreferrer" className="text-white flex items-center cursor-pointer font-bold underline">
                        <small className="text-xs">watch tutorial</small>
                        <ArrowNE color="#FFF" />
                    </a>

                    <div className="hidden xs:block h-3 w-[1.5px] bg-white/20"/>
                    
                    <a href={getChainVersionLink()} target="_blank" rel="noreferrer" className="text-white flex items-center cursor-pointer font-bold underline">
                        <small className="text-xs">try on {getChainVersion()}</small>
                        <ArrowNE color="#FFF" />
                    </a>
                </div>
            </div>

            <div onClick={handleCreate} className="flex items-center gap-2 max-w-fit md:max-w-none bg-[#84B9D1] rounded-2xl p-3 cursor-pointer">
                <small className="text-xs font-Lexend text-black font-medium">create discourse</small>
                <ArrowCircleRight color="#4F6F7D" variant="Bold" fill="#000"/>
            </div>
        </div>
    );
}

export default HeroCard;