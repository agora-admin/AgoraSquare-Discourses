import {v4 as uuid} from 'uuid';

const NFTS = ({nfts}:{nfts:any[]}) => {
    return (
        <div className="grid place-items-center grid-cols-2 xs2:grid-cols-nftCard gap-5">
            {nfts.map((nft) => {
                const metadata = JSON.parse(nft.metadata);
                console.log(metadata)
                return (
                    <div title={metadata?.description} key={uuid()} className="w-full h-full rounded-[32px]">
                        <img src={metadata ? metadata.image : `/nft3.png`} className="w-full h-full rounded-[32px]" alt="nft image" />
                    </div>
                )
            })}
        </div>
    )
}

export default NFTS