import { useContext, useState } from "react";
import { uuid } from "uuidv4";
import { useNetwork } from "wagmi";
import { supportedChainIds } from "../../Constants";
import { ToastTypes } from "../../lib/Types";
import AppContext from "../utils/AppContext";
import { ChainIcon, IChainTag } from "../utils/ChainTag";

const ChainBar = () => {

    const [ switching, setSwitching ] = useState(false);
    const { addToast } = useContext(AppContext)
    const { activeChain, switchNetworkAsync } = useNetwork()

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

    if (switching) {
        return <div className="flex items-center w-full justify-center gap-2 py-2">
            {
                Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className={`w-1 h-1 rounded-full bg-[#212427] animate-pulse t-all duration-100 `} />
                ))
            }
        </div>
    }

    return (
        <div className="w-full flex gap-2 justify-between">
            {
                supportedChainIds.map(chainId => (
                    // <IChainTag chainId={chainId} key={chainId} />
                    <button key={chainId} onClick={() => handleSwitch(chainId)} className={`outline-none t-all p-1 rounded-lg border ${activeChain?.id === chainId ? ' border-[#212427] cursor-default' : 'border-transparent contrast-0 grayscale hover:bg-[#c6c6c6]/10 '}`}>
                        <ChainIcon chainId={chainId} />
                    </button>
                ))
            }
        </div>
    );
}

export default ChainBar;