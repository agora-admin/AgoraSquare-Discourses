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
            return '0xd05655443394E2600E47dFF79CF4D11376988c91'
        // case 1313161555:
        //     return '0xDdeEa46a3b23Ef146dD9E6338Dd2136fF1a1C8cc'
        // case 4:
        //     return '0x74FaD6886e8D7713053FC36C761EF11c40AD84cf'
        case 137:
            return '0x4ddECbb3AD68C0f084Fb5BE98A612EbC71c95f0C'
        default:
            return '0x823443514C68d06811A395CA917a2B43bA9DcC64'
    }
}