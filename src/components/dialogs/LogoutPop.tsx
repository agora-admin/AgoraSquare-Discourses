import { Popover, Transition } from "@headlessui/react";
import { Wallet1, ArrowRight2, Logout, Refresh, I3DRotate, Repeat } from "iconsax-react";
import Cookies from "js-cookie";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { uuid } from "uuidv4";
import { useBalance, useDisconnect, useFeeData, useNetwork } from "wagmi";
import { getSwitchNetwork, supportedChainIds } from "../../Constants";
import { shortAddress } from "../../helper/StringHelper";
import { ToastTypes } from "../../lib/Types";
import ChainBar from "../actions/ChainBar";
import AppContext from "../utils/AppContext";
import ChainTag, { ChainIcon, IChainTag, SChainTag } from "../utils/ChainTag";
import { Twitter_x10, Twitter_x16 } from "../utils/SvgHub";

const LogoutPop = () => {

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
            if (bal.data?.symbol === "ETH") {
                return val > 999999 ? 999999 + "+" : val.toFixed(3) + " " + bal.data?.symbol;
            }
            if (bal.data?.symbol === "rETH") {
                return val > 999999 ? 999999 + "+" : val.toFixed(3) + " " + bal.data?.symbol;
            }

            if (bal.data?.symbol === "MATIC") {
                return val > 9999 ? 9999 + "+" : val.toFixed(3) + " " + bal.data?.symbol;
            }

            return val.toFixed(3) + " " + bal.data?.symbol;
        }
        return "--";
    }


    return (
        <Popover className="relative">
            {({ open }) => (
                <>
                    <Popover.Button className={`t-all outline-none text-white text-xs ${open ? 'bg-[#212427]' : ''} hover:bg-white/10 group rounded-xl font-Lexend px-4 py-2 flex items-center gap-2`}>
                        <div className='hidden relative sm:flex items-center  w-6 h-6 ' >
                            <div className={`absolute flex bottom-0 right-0 inset-y-0 h-max my-auto  ${open ? '-translate-x-[25%]' : '-translate-x-[70%]'} group-hover:-translate-x-[25%] rounded-xl t-all`}>
                                <IChainTag chainId={activeChain?.id!} />
                            </div>
                            <img className="w-6 h-6 z-10 object-cover rounded-lg object-center" src={t_connected ? t_img :`https://avatar.tobi.sh/${walletAddress}`} alt="Profile image" />
                        </div>
                        <div className="flex flex-col justify-center items-start">
                            <p className='text-white text-[10px] font-Lexend sm:text-xs'>{shortAddress(walletAddress === "" ? '' : walletAddress)}</p>
                            <p className='text-[#c6c6c6] text-[8px] font-Lexend sm:text-[10px]'>{getBalance()}</p>
                        </div>
                    </Popover.Button>
                
                    <Popover.Panel className={` ${open ? 'animate-dEnter' : 'animate-dExit'} shadow-2xl absolute z-20 -right-2 mt-2 bg-card bg-[#141515] p-2 rounded-xl backdrop-blur-lg max-w-xs w-max`}>
                        <div className="flex flex-col">
                            {activeChain?.id !== supportedChainIds[0] &&
                                <button onClick={() => handleSwitch(supportedChainIds[0])} className={`w-full flex items-center mt-[2px] gap-2 button-t py-2 hover:bg-[#212427]`}>
                                    {!switching && <Repeat size={16} color="#c6c6c6" />}
                                    <p className="text-[10px] text-[#c6c6c6]">{switching ? 'Switching..' : 'Switch Chain'}</p>
                                </button>}

                            {
                            activeChain?.id === supportedChainIds[0] &&
                                <div className={`w-full flex items-center mt-[2px] gap-2 button-t py-2 `}>
                                    {!switching && <ChainIcon chainId={activeChain?.id!} />}
                                    <p className="text-[10px] text-[#7B3FE4] font-bold">{activeChain?.name}</p>
                                </div>
                            }
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

export default LogoutPop;