import { Box2 } from "iconsax-react";
import { useState } from "react";
import { Aurora16, Ethereum16, Polygon16 } from "./SvgHub";

const ChainTag = ({ chainId, chainName }: { chainId: number, chainName? : string }) => {

    // if (chainId === 1313161555) {
    //     return (
    //         <div className="flex items-center bg-[#78D64B]/20 rounded-lg px-2 py-1 transition-all">
    //             <Aurora16 />
    //             <p className="text-[10px] font-medium text-[#78D64B] font-Lexend ml-2 mr-1">Aurora</p>
    //         </div>
    //     );
    // }

    if (chainId === 137) {
        return (
            <div className="flex items-center bg-[#7B3FE4]/20 rounded-lg px-2 py-1 transition-all">
                <Polygon16 />
                <p className="text-[10px] font-medium text-[#7B3FE4] font-Lexend ml-2 mr-1">{chainName ? chainName : 'Polygon'}</p>
            </div>
        );
        
    }
    // if (chainId === 4) {
    //     return (
    //         <div className="flex items-center bg-[#716B94]/20 rounded-lg px-2 py-1 transition-all">
    //         <Ethereum16 />
    //         <p className="text-[10px] font-medium text-[#716B94] font-Lexend ml-2 mr-1">Rinkeby</p>
    //         </div>
    //     );
    // }

    return (
        <div className="flex items-center bg-[#c6c6c6]/20 rounded-lg px-2 py-1 transition-all">
            <Box2 size={16} color="#c6c6c6" />
            <p className="text-[10px] font-medium text-[#c6c6c6] font-Lexend ml-2 mr-1">{chainName ? chainName : 'Unsupported'}</p>
        </div>
    );

}

export const SChainTag = ({ chainId }: { chainId: number }) => {

    const [hovering, setHovering] = useState(false);

    const handleStart = () => {
        setHovering(true);
    }
    const handleEnd = () => {
        setHovering(false);
    }

    // if (chainId === 1313161555) {
    //     return (
    //         <div onMouseEnter={() => handleStart()} onMouseLeave={() => handleEnd()} className="relative h-max flex items-center bg-[#78D64B]/20 rounded-lg p-1 ring-0 transition-all">
    //             <Aurora16 />
    //             <p className={` ${hovering ? 'block' : 'hidden'} t-all absolute pointer-events-none bg-card px-2 py-1 rounded-lg overflow-clip w-max m-auto right-0 translate-x-full translate-y-[50%] text-[10px] font-medium text-[#c6c6c6] font-Lexend ml-2 mr-1`}>Aurora</p>
    //         </div>
    //     );
    // }
    if (chainId === 137) {
        return (
            <div onMouseEnter={() => handleStart()} onMouseLeave={() => handleEnd()} className="relative h-max flex items-center bg-[#716B94]/20 rounded-lg p-1 ring-0 transition-all">
                <Ethereum16 />
                <p className={` ${hovering ? 'block' : 'hidden'} t-all absolute pointer-events-none bg-card px-2 py-1 rounded-lg overflow-clip w-max m-auto right-0 translate-x-full translate-y-[50%] text-[10px] font-medium text-[#c6c6c6] font-Lexend ml-2 mr-1`}>Rinkeby</p>
            </div>
        );
    }

    return (
        <div onMouseEnter={() => handleStart()} onMouseLeave={() => handleEnd()} className="relative h-max flex items-center bg-[#7B3FE4]/20 rounded-lg p-1 transition-all">
            <Polygon16 />
            <p className={` ${hovering ? 'block' : 'hidden'} t-all absolute pointer-events-none bg-card px-2 py-1 rounded-lg overflow-clip w-max m-auto right-0 translate-x-full translate-y-[50%] text-[10px] font-medium text-[#c6c6c6] font-Lexend ml-2 mr-1`}>Polygon</p>
        </div>
    );
}
export const IChainTag = ({ chainId }: { chainId: number }) => {

    // if (chainId === 1313161555) {
    //     return (
    //         <div className="relative h-max flex items-center p-[4px] border border-[#212427] bg-[#141515] rounded-lg ring-0 transition-all">
    //             <Aurora16 />
    //         </div>
    //     );
    // }

    // if (chainId === 80001) {
    //     return (
    //         <div className="relative h-max flex justify-center p-[4px] items-center border border-[#212427] bg-[#141515] rounded-lg transition-all">
    //             <Polygon16 />
    //         </div>
    //     );
    // }
    if (chainId === 137) {
        return (
            <div className="relative h-max flex justify-center p-[4px] items-center border border-[#212427] bg-[#141515] rounded-lg transition-all">
                <Polygon16 />
            </div>
        );
    }
    // if (chainId === 4) {
    //     return (
    //         <div className="relative h-max flex justify-center p-[4px] items-center border border-[#212427] bg-[#141515] rounded-lg transition-all">
    //             <Ethereum16 />
    //         </div>
    //     );
    // }

    return (
        <div className="relative h-max flex justify-center p-[4px] items-center border border-[#212427] bg-[#141515] rounded-lg transition-all">
            <Box2 size={16} color="#c6c6c6" />
        </div>
    );
}

export const ChainIcon = ({ chainId }: { chainId: number }) => {

    // if (chainId === 1313161555) {
    //     return (
    //         <Aurora16 />
    //     );
    // }

    if (chainId === 137) {
        return (
            <Polygon16 />
        );
    }
    // if (chainId === 80001) {
    //     return (
    //         <Polygon16 />
    //     );
    // }

    // if (chainId === 4) {
    //     return (
    //         <Ethereum16 />
    //     );
    // }

    return (
        <Box2 size={16} color="#c6c6c6" />
    );
}

export default ChainTag;