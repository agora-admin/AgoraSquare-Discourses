import { chain } from "wagmi";
import { ArrowNE,Polygon16 } from "./SvgHub";

const ChainExplorer = ({data} : {data:any}) => {
    const handlePolyscan = () => {
        window.open(`${chain.polygon.blockExplorers?.default.url}/tx/${data.txnHash}`, '_blank');
    }

    return (
        <button onClick={() => handlePolyscan()} className="flex items-center outline-none border-none max-w-fit xs:max-w-none bg-transparent rounded-lg px-2 py-1 hover:ring-[1px] ring-[#7B3FE4]/50 transition-all">
            <Polygon16 />
            <p className="text-[10px] font-medium text-[#7B3FE4] font-Lexend ml-2 mr-1">Polygon</p>
            <ArrowNE color="#7B3FE4" />
        </button>
    );
    
}

export default ChainExplorer;