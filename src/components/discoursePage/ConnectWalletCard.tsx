import { ArrowCircleRight } from "iconsax-react";
import Link from "next/link";
import { WalletIcon } from "../utils/SvgHub";

const ConnectWalletCard = () => {
    return (
        <div className="mobile:fixed mobile:bottom-[60px] mobile:inset-x-0 mobile:max-h-[220px] flex flex-col sm:flex-row mobile:gap-4 items-center sm:justify-between py-6 sm:py-3 sm:px-4 bg-[#141414] sm:border-[1.2px] sm:border-[#84B9D1] rounded-t-[30px] sm:rounded-3xl">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <div className="mobile:hidden">
                    <WalletIcon size={30}/>
                </div>

                <div className="sm:hidden">
                    <WalletIcon size={40}/>
                </div>

                <div className="flex flex-col">
                    <h4 className="text-[#84B9D1] font-bold text-[13px] sm:text-sm">Connect Wallet To Fund Discourse</h4>
                </div>
            </div>

            <Link href="/link" passHref>
                <button className="flex items-center gap-2 bg-[#84B9D1] rounded-2xl p-3 cursor-pointer">
                    <span className="text-black text-xs font-Lexend font-medium">Connect Wallet</span>
                    <ArrowCircleRight variant="Bulk" fill="#000"/>
                </button>
            </Link>
        </div>
    )
}

export default ConnectWalletCard;