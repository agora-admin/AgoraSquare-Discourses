import { NextApiRequest, NextApiResponse } from "next";
import axios from 'axios';

const chainName = (chainId:string) => {
    switch(chainId){
        case "80001":
            return "mumbai";
        case "137":
            return "polygon";
        case "71401":
            return "0x71401";
    }
}

export default async function NFT(req:NextApiRequest,res: NextApiResponse){
    const {chainId,walletAddress} = req.query;

    const result = (await axios.request({
        method: 'GET',
        url: `https://deep-index.moralis.io/api/v2/${walletAddress}/nft`,
        params: {
            chain: chainName(chainId as string),
            format: 'decimal',
            normalizeMetadata: 'false'
        },
        headers: {accept: 'application/json', 'X-API-Key': process.env.MORALIS_API_KEY}
    })).data;

    return res.send({msg: result})
}