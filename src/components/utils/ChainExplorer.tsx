import { chain } from "wagmi";
import { ArrowNE, Aurora16, Ethereum16, Polygon16 } from "./SvgHub";

const ChainExplorer = ({data} : {data:any}) => {

    const handlePolyscan = () => {
        window.open(`${chain.polygon.blockExplorers?.default.url}/tx/${data.txnHash}`, '_blank');
    }

    const handleAuroraScan = () => {
        window.open(`https://testnet.aurorascan.dev/tx/${data.txnHash}`, '_blank');
    }

    const handleRinkebyScan = () => {
        window.open(`https://rinkeby.etherscan.io/tx/${data.txnHash}`, '_blank');
    }

    // if (data.chainId === 1313161555) {
    //     return (
    //         <button onClick={() => handleAuroraScan()} className="flex items-center outline-none border-none bg-[#78D64B]/20 rounded-lg px-2 py-1 ring-0 hover:ring-[1px] ring-[#78D64B]/50 transition-all">
    //             <Aurora16 />
    //             <p className="text-[10px] font-medium text-[#78D64B] font-Lexend ml-2 mr-1">Aurora</p>
    //             <ArrowNE color="#78D64B" />
    //         </button>
    //     );
    // }
    // if (data.chainId === 4) {
    //     return (
    //         <button onClick={() => handleRinkebyScan()} className="flex items-center outline-none border-none bg-[#716B94]/20 rounded-lg px-2 py-1 ring-0 hover:ring-[1px] ring-[#716B94]/50 transition-all">
    //             <Ethereum16 />
    //             <p className="text-[10px] font-medium text-[#716B94] font-Lexend ml-2 mr-1">Rinkeby</p>
    //             <ArrowNE color="#716B94" />
    //         </button>
    //     );
    // }

    return (
        <button onClick={() => handlePolyscan()} className="flex items-center outline-none border-none bg-[#7B3FE4]/20 rounded-lg px-2 py-1 ring-0 hover:ring-[1px] ring-[#7B3FE4]/50 transition-all">
            <Polygon16 />
            <p className="text-[10px] font-medium text-[#7B3FE4] font-Lexend ml-2 mr-1">Polygon</p>
            <ArrowNE color="#7B3FE4" />
        </button>
    );
    
}

export default ChainExplorer;