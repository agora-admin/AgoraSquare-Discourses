import { polygon } from "wagmi/chains";
import { ArrowNE,Polygon16 } from "./SvgHub";

const ChainExplorer = ({data} : {data:any}) => {
    const handlePolyscan = () => {
        window.open(`${polygon.blockExplorers?.default.url}/tx/${data.txnHash}`, '_blank');
    }

    return (
        <button onClick={() => handlePolyscan()} className="flex items-center outline-none border-none bg-[#7B3FE4]/20 rounded-lg px-2 py-1 hover:ring-[1px] ring-[#7B3FE4]/50 transition-all">
            <Polygon16 />
            <p className="text-[10px] font-medium text-[#7B3FE4] font-Lexend ml-2 mr-1">Polygon</p>
            <ArrowNE color="#7B3FE4" />
        </button>
    );
    
}

export default ChainExplorer;