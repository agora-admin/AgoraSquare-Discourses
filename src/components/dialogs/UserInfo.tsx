import { Popover } from "@headlessui/react";
import { Logout, Repeat } from "iconsax-react";
import Cookies from "js-cookie";
import Link from "next/link";
import { useContext, useState } from "react";
import { uuid } from "uuidv4";
import { useBalance, useDisconnect, useNetwork } from "wagmi";
import { supportedChainIds } from "../../Constants";
import { shortAddress } from "../../helper/StringHelper";
import { ToastTypes } from "../../lib/Types";
import AppContext from "../utils/AppContext";
import { ChainIcon } from "../utils/ChainTag";
import { Twitter_x16 } from "../utils/SvgHub";

const UserInfo = () => {

    const { disconnectAsync } = useDisconnect();
    const { t_connected, walletAddress, t_handle, t_img, addToast } = useContext(AppContext);
    const { refresh } = useContext(AppContext);
    const { activeChain, switchNetworkAsync } = useNetwork();
    const [switching, setSwitching] = useState(false);
    const bal = useBalance({
        addressOrName: walletAddress,
        chainId: activeChain?.id,
        watch: true
    });

    const handleLogout = async () => {
        disconnectAsync().then(() => {
            Cookies.remove('jwt');
            refresh();
        }).catch(err => {
            console.log(err);
        })
    }

    const handleSwitch = (id: number) => {
        setSwitching(true);
        addToast({
            title: "Switching Network",
            body: 'Please check your wallet for network switch approval.',
            type: ToastTypes.wait,
            id: uuid(),
            duration: 5000
        })
        switchNetworkAsync?.(id).then(() => {
            setSwitching(false);
        }).catch(err => {
            console.log(err);
            setSwitching(false);

            addToast({
                title: "Error Switching Network",
                body: err.message,
                type: ToastTypes.error,
                id: uuid(),
                duration: 5000
            })
        })
    }

    const getBalance = () => {    
        if (bal && activeChain && supportedChainIds.includes(activeChain?.id)) {
            let val = Number(bal.data?.formatted);
            
            switch(bal.data?.symbol){
                case "ETH":
                    return val > 999999 ? 999999 + "+" : val.toFixed(3) + " " + bal.data?.symbol;
                case "rETH":
                    return val > 999999 ? 999999 + "+" : val.toFixed(3) + " " + bal.data?.symbol;
                case "MATIC":
                    return val > 9999 ? 9999 + "+" : val.toFixed(3) + " " + bal.data?.symbol;
                case "pCKB":
                    return val > 9999 ? 9999 + "+" : val.toFixed(3) + " " + "pCKB";
            }

            return val.toFixed(3) + " " + bal.data?.symbol;
        }
        return "--";
    }

    return (
        <Popover className="relative">
            {({ open }) => (
                <>
                    <Popover.Button className="flex items-center gap-3 outline-none xs2:bg-[#141414] xs2:rounded-xl xs2:px-3 xs2:py-2 cursor-pointer">
                        <img className="w-8 h-8 rounded-full " src={t_connected ? t_img : "/profile_avatar.png"} alt="Profile image"/>

                        <div className="hidden xs2:flex flex-col gap-[2px] items-start">
                            <p className='text-[#E5F7FF] text-[10px] font-Lexend'>{shortAddress(walletAddress === "" ? '' : walletAddress)}</p>
                            <p className='text-[#84B9D1] font-semibold text-[8px] sm:text-[10px]'>{getBalance()}</p>
                        </div>
                    </Popover.Button>
                
                    <Popover.Panel className={` ${open ? 'animate-dEnter' : 'animate-dExit'} shadow-2xl absolute z-20 mobile2:bottom-12 mobile:bottom-16  -right-2 mt-2 bg-card bg-[#0A0A0A] p-2 rounded-xl backdrop-blur-lg max-w-xs w-max`}>
                        <div className="flex flex-col">
                            {activeChain?.id !== supportedChainIds[0] &&
                                <button onClick={() => handleSwitch(supportedChainIds[0])} className={`w-full flex items-center mt-[2px] gap-2 button-t py-2 hover:bg-[#212427]`}>
                                    {!switching && <Repeat size={16} color="#c6c6c6" />}
                                    <p className="text-[10px] text-[#c6c6c6]">{switching ? 'Switching..' : 'Switch Chain'}</p>
                                </button>}

                            {
                                !t_connected &&
                                <Link href="/link">
                                    <a className={`w-full flex items-center mt-[2px] gap-2 button-t py-2 hover:bg-[#212427]`}>
                                        <Twitter_x16 />
                                        <p className="text-xs font-Lexend font-normal text-[#1DA1F2]">Link Twitter</p>
                                    </a>
                                </Link>
                            }
                            {
                                t_connected && 
                                <Link href={`/user/${walletAddress}`} passHref>
                                    <div className="cursor-pointer w-full flex items-center mt-[2px] gap-2 button-t py-2 hover:bg-[#212427]">
                                        <Twitter_x16 />
                                        <p className="text-xs font-Lexend font-normal text-[#1DA1F2]">@{t_handle}</p>
                                    </div>
                                </Link>
                            }
                            <button onClick={() => handleLogout()} className={`w-full flex items-center mt-[2px] gap-2 button-t py-2 hover:bg-[#212427]`}>
                                <Logout size='16' color='#fc8181' />
                                <p className="text-xs font-Lexend font-normal text-[#fc8181]">Log out</p>
                            </button>
                        </div>
                    </Popover.Panel>
                </>
            )}
        </Popover>
    );
}

export default UserInfo;