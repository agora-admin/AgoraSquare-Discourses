import { Link1, Warning2 } from "iconsax-react";
import { useContext, useEffect } from "react";
import { Chain, useConnect, useNetwork } from "wagmi";
import { supportedChainIds } from "../../Constants";
import TopBar from "../topbar/TopBar";
import AppContext from "../utils/AppContext";

const Layout = ({ children }: { children: any }) => {
    const { loggedIn, wrongChain, setWrongChain, setShowBetaMsg, showBetaMsg } = useContext(AppContext);
    const { activeConnector, status } = useConnect();
    const { activeChain, switchNetworkAsync } = useNetwork();

    const handleClose = () => {
        setShowBetaMsg(
            false
        );
    }

    useEffect(() => {
        if (activeConnector && status === "connected" && activeChain) {
            if (isChainOk(activeChain)) {
                setWrongChain(false);
            } else {
                setWrongChain(true);
            }
        }
        
    }, [activeChain, activeConnector, status])

    const isChainOk = (chain: Chain) => {
        if (supportedChainIds.includes(chain.id)){
            return true;
        }
        return false;
    }

    const handleSwitchChain = () => {
        switchNetworkAsync?.(supportedChainIds[0]).then(() => {
            console.log('switch', status);
            
        });
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="w-full px-3 sm:px-10 lg:px-0 max-w-5xl flex flex-col">
                {children}
            </div>
            <div className="fixed bottom-6 left-6 flex flex-col gap-2 z-50">
                {
                    wrongChain && loggedIn &&
                    <div className=" bg-card p-4 gap-2 rounded-xl z-40 max-w-sm flex flex-row">
                        <div className="flex flex-col items-center justify-between">
                            <Link1 size="24"
                                color="#fc8181"
                                variant="Broken" />
                        </div>
                        <div className="flex flex-col ">
                            <p className="text-[#fc8181] font-Lexend text-sm">Wrong Chain</p>
                            <p className="text-[#c6c6c6] font-Lexend text-[10px] max-w-[25ch] w-full gap-2 items-center">This app is only available on <b>{activeChain?.name === 'Polygon' ? 'Polygon Mumbai and GodWoken Testnet' : 'Polygon'}</b></p>
                            <span onClick={() => handleSwitchChain()} className="cursor-pointer font-regular text-blue-400 text-[10px] mt-1 font-medium">Click to change</span>
                        </div>
                    </div>
                }
                {showBetaMsg &&
                    <div className="bg-card p-4 gap-2 rounded-xl  max-w-sm flex flex-row">
                        <div className="flex flex-col items-center justify-between">
                            <Warning2 size='24' color="#6c6c6c" />
                        </div>
                        <div className="flex flex-col ">
                            <p className="text-white font-Lexend text-sm">Still in development</p>
                            <p className="text-[#c6c6c6] font-Lexend text-[10px] flex w-full justify-between gap-2 items-center">Might be buggy <span onClick={handleClose} className="cursor-pointer font-regular text-red-400 text-[10px] mt-1">close</span>  </p>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
};

export default Layout;