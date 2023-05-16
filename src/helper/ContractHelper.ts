export const getContractAddressByChainId = (chainId: number) => {
    switch (chainId) {
        case 80001:
            return '0xEC8E35e9db6E0e6D014398c483CccDBcfC8B4904'
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