export const supportedChainIds = [
    137, // Polygon Mainnet
    56, //BNB Smart Chain
    // 80001
]

export const getChainName = (chainId: number | undefined) => {
    switch (chainId) {
        case 80001:
            return 'Polygon Mumbai'
        case 137:
            return 'Polygon'
        case 71401:
            return 'Godwoken Testnet'
        case 56:
            return 'BNB Smart Chain'
        default:
            return 'Unknown'
    }
}

export const getCurrencyName = (chainId: number) => {
    switch (chainId) {
        case 80001:
        case 137:
            return 'matic'
        case 71401:
            return 'pCKB'
        case 56:
            return 'BNB'
        default:
            return 'eth'
    }
}

export const rpcUrl = (chainId: number) => {
    switch (chainId) {
        case 137:
            return { http: 'https://polygon-mainnet.g.alchemy.com/v2/Gqd71GlllOjZhCCq1FjqzKofdLig5Tww'}
        case 80001:
            return { http: "https://polygon-mumbai.g.alchemy.com/v2/ksqleRX25aRSLQ9uawfAwVTlQ8gKLULj" }
        case 71401:
            return { http: "https://godwoken-testnet-v1.ckbapp.dev" }
        case 56:
            return { http: "https://bsc-dataseed.binance.org" }
        default:
            return null;

    }
}

export const getSwitchNetwork = (chainId: number) => {
    switch (chainId) {
        case 80001:
            return 1313161555
        case 1313161555:
            return 80001
        default:
            return 80001
    }
}