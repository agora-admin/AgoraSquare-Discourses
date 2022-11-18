import { Box2 } from "iconsax-react";
import { Polygon16 } from "./SvgHub";

const ChainTag = ({ chainId, chainName }: { chainId: number, chainName? : string }) => {
    if (chainId === 137) {
        return (
            <div className="flex items-center bg-[#7B3FE4]/20 rounded-lg px-2 py-1 transition-all">
                <Polygon16 />
                <p className="text-[10px] font-medium text-[#7B3FE4] font-Lexend ml-2 mr-1">{chainName ? chainName : 'Polygon'}</p>
            </div>
        );
        
    }

    return (
        <div className="flex items-center bg-[#c6c6c6]/20 rounded-lg px-2 py-1 transition-all">
            <Box2 size={16} color="#c6c6c6" />
            <p className="text-[10px] font-medium text-[#c6c6c6] font-Lexend ml-2 mr-1">{chainName ? chainName : 'Unsupported'}</p>
        </div>
    );

}

export const SChainTag = () => {
    return (
        <div title="Polygon" className="relative h-max flex items-center bg-[#7B3FE4]/20 rounded-lg p-1 transition-all">
            <Polygon16 />
        </div>
    );
}

export const IChainTag = ({ chainId }: { chainId: number }) => {
    if (chainId === 80001 || chainId === 137) {
        return (
            <div className="relative h-max flex justify-center p-[4px] items-center border border-[#212427] bg-[#141515] rounded-lg transition-all">
                <Polygon16 />
            </div>
        );
    }

    return (
        <div className="relative h-max flex justify-center p-[4px] items-center border border-[#212427] bg-[#141515] rounded-lg transition-all">
            <Box2 size={16} color="#c6c6c6" />
        </div>
    );
}

export const ChainIcon = ({chainId,size}:{chainId: number,size?: number}) => {
    switch(chainId){
        case 80001:
        case 137:
            return <Polygon16 size={size} />
        default:
            return <Box2 size={16} color="#c6c6c6" />
    }
}

export default ChainTag;