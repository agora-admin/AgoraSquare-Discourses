import { ethers } from "ethers";
export const getFundTotal = (funds: Array<any>) => {

    let sum: number = 0;

    for (let i = 0; i < funds.length; i++) {
        sum += +ethers.utils.formatEther(funds[i].amount);
    }

    return sum.toFixed(5);
}

export const getFund = (fund: number) => {
    return ethers.utils.formatEther(fund);
}

export const hasFunded = (funds: Array<any>, address: string) => {
    for (let i = 0; i < funds.length; i++) {
        if (funds[i].address === address) {
            return true;
        }
    }
    return false;
}