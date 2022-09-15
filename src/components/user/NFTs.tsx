import {uuid} from 'uuidv4';

const NFTS = () => {
    return (
        <div className="grid grid-cols-2 gap-6">
            {Array(4).fill(0).map(() => (
                <NFT key={uuid()} />
            ))}
        </div>
    )
}

export default NFTS

const NFT = () => {
    return (
        <div className="bg-[linear-gradient(90deg, #FFEEEE 0%, #DDEFBB 100%)] flex flex-col h-80 border-2 rounded-xl border-white/5 overflow-hidden">
            <div className="bg-[#b0afaf] h-[90%]" />
            
            <small className="text-center text-white font-Lexend text-xs px-5 py-3">
                What is the best blockchain for NFTs?
                <br/> <span className="text-white/40">Dan VS Arsh</span>
            </small>
        </div>
    )
}