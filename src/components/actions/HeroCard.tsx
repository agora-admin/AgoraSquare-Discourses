import { Add, Box2 } from "iconsax-react";
import ChainTag, { ChainIcon } from "../utils/ChainTag";
import { ArrowNE } from "../utils/SvgHub";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import AppContext from "../utils/AppContext";
import { useNetwork } from "wagmi";
import { supportedChainIds } from "../../Constants";
import { ToastTypes } from "../../lib/Types";
import { uuid } from "uuidv4";
import Link from "next/link";
import ConnectWalletDailog from "../dialogs/ConnectWalletDailog";

const HeroCard = () => {
    const route = useRouter();
    const { loggedIn, addToast } = useContext(AppContext);
    const [openConnectWallet, setOpenConnectWallet] = useState(false);
    const { activeChain } = useNetwork();


    const handleCreate = () => {
        if (loggedIn) {
            if (supportedChainIds.includes(activeChain?.id!)) {
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

    return (
        <div className="w-full flex items-center justify-between px-2 sm:px-10 py-6">
            <div className="flex flex-col w-max ">
                <h4 className="text-white font-Lexend">Introducing</h4>
                <h2 className="text-gradient font-bold text-4xl">Discourses</h2>
                <p className="text-[#c6c6c6] font-Lexend text-[10px] max-w-[50ch] mt-2">
                    Crowdfund discourse from thought leaders to dialogue on the platfrom through discourse pools!
                </p>
                {
                    !loggedIn && <ConnectWalletDailog open={openConnectWallet} setOpen={setOpenConnectWallet} />
                }
                <div className="flex items-center gap-2 mt-4">
                    <button onClick={() => handleCreate()} className="button-o flex items-center gap-2 p-3 hover:bg-[#c6c6c6]/10">
                        <Add size={16} color="#fff" />
                        <p className="text-xs text-white font-Lexend ">Create New Disourse</p>
                    </button>
                    <Link href="https://testnet.discourses.agorasquare.io" passHref >
                        <a target="_blank" className="button-t flex sm:hidden items-center gap-2 w-max p-2 ">
                            <p className="text-xs text-[#1FA2FF] font-Lexend ">Explore testnet</p>
                            <ArrowNE color="#1FA2FF" />
                        </a>
                    </Link>
                </div>
            </div>

            <div className="hidden sm:flex flex-[0.6] flex-col h-full relative px-10 justify-center">
                <div className="w-[1px] h-full bg-[#303030] absolute left-0" />
                <p className="text-[10px] font-Lexend text-[#c6c6c6]">You&apos;re currently on </p>
                <div className="py-2 px-4 bg-white/10 border-[2px] border-white/10 w-max rounded-full my-2 flex items-center gap-2">
                    <ChainIcon chainId={137} />
                    {<p className="text-[10px] text-[#7B3FE4] font-bold">Polygon Mainnet</p>}
                </div>
                <Link href="https://testnet.discourses.agorasquare.io" passHref>
                    <button className="button-t flex items-center gap-2 w-max p-0 mt-4">
                        <p className="text-xs text-[#1FA2FF] font-Lexend ">Explore testnet</p>
                        <ArrowNE color="#1FA2FF" />
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default HeroCard;