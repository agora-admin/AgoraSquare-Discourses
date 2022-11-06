import { WriteContractArgs } from '@wagmi/core'
import abi from '../web3/abi/DiscourseHub.json'
export const contractData = (chainId: number): WriteContractArgs => {
    let data : WriteContractArgs = {
        addressOrName: getContractAddressByChainId(chainId),
        contractInterface: abi
    }
    return data
}

const getContractAddressByChainId = (chainId: number) => {
    switch (chainId) {
        case 80001:
            return '0x4459B1562493Dd44346C86615d87Bf9376f130ae'
        case 71401:
            return '0x2BE1f39bCBEDde8FF59Cb29B2b3D6F7A67E0EF44'
        // case 1313161555:
        //     return '0xDdeEa46a3b23Ef146dD9E6338Dd2136fF1a1C8cc'
        // case 4:
        //     return '0x74FaD6886e8D7713053FC36C761EF11c40AD84cf'
        case 137:
            return '0x823443514C68d06811A395CA917a2B43bA9DcC64'
        default:
            return '0x823443514C68d06811A395CA917a2B43bA9DcC64'
    }
}