import { ethers } from "ethers";
export const shortAddress = (address: string) => {
    if(address.length < 10) {
        return address;
    }
    return address.substring(0, 6) + "..." + address.substring(address.length - 4);
}

export const validateEmail = (email: string) => {
    return email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
}

export const keccak256 = (str: string) => {
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(str));
}