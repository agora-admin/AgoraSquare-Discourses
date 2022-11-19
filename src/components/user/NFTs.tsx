import {uuid} from 'uuidv4';

const NFTS = () => {
    return (
        <div className="grid place-items-center grid-cols-2 xs2:grid-cols-nftCard gap-5">
            {Array(4).fill(0).map((_,idx) => (
                <div key={uuid()} className="w-full h-full rounded-[32px]">
                    <img src={`/nft${idx+1}.png`} className="w-full h-full rounded-[32px]" alt="nft image" />
                </div>
            ))}
        </div>
    )
}

export default NFTS
