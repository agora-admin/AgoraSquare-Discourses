import { Discourse } from "../lib/Types";
import { getTime, isPast } from "./TimeHelper";

const getUsername = (user: string) => {
    if (user.charAt(0) === '@') {
        return user;
    }
    return '@' + user.toLowerCase();
}

export const isSpeaker = (data: any, username: string) => {
    let s1_username = getUsername(data.speakers[0].username);
    let s2_username = getUsername(data.speakers[1].username);
    return s1_username === getUsername(username) || s2_username === getUsername(username);
}

export const isSpeakerWallet = (data: any, walletAddress: string) => {
    let s1_address = data.speakers[0].address;
    let s2_address = data.speakers[1].address;
    return s1_address === walletAddress || s2_address === walletAddress;
}
export const speakerConfirmed = (data : Discourse | undefined, username: string) => {   
    let i = 0;
    if (data?.speakers[1].username.replace('@','') === username.replace('@','')) {
        i = 1;
    }
    return data?.speakers[i].confirmed;
}

export const discourseConfirmed = (data : Discourse | undefined) => {
    if( data?.speakers[0].confirmed && data.speakers[1].confirmed ) {
        return true;
    }
    return false;
}

export const getSpeakerIndex = (speakers :any, address: string) => {
    var i = 0;
    if (speakers[1].address === address) {
        i = 1;
    }
    return i;
}


export const getMeetDateTS = (data : any) => {
    return data.discourse.meet_date;
}

// 0 - funding
// 1 - scheduling
// 2 - Scheduled
// 3 - finished
// 4 - terminated
// 5 - disputed
// 6 - ongoing

export enum DiscourseStateEnum{
    FUNDING,SCHEDULING,SCHEDULED,FINISHED,TERMINATED,DISPUTED,ONGOING
}

export const getStateTS = (data: any) => {
    if (data.status.terminated) {
        return DiscourseStateEnum.TERMINATED;
    } else if (data.status.disputed) {
        return DiscourseStateEnum.DISPUTED
    } else if (data.status.completed) {
        return DiscourseStateEnum.FINISHED
    }

    if(discourseConfirmed(data)){
        if(data.discourse.meet_date) {
            if (isPast(getMeetDateTS(data))) {
                return DiscourseStateEnum.ONGOING
            } else {
                return DiscourseStateEnum.SCHEDULED
            }
        } else {
            return DiscourseStateEnum.SCHEDULING
        }
    }else if(!fundingDone(data)) {
        return DiscourseStateEnum.FUNDING;
    }
    
    // if(!(now.getTime() > fDate.getTime())) {
    //     return DiscourseStateEnum.FUNDING;
    // } else {
    //     if (data.status.terminated) {
    //         return DiscourseStateEnum.TERMINATED;
    //     } else if (data.status.disputed) {
    //         return DiscourseStateEnum.DISPUTED
    //     } else if (data.status.completed) {
    //         return DiscourseStateEnum.FINISHED
    //     } else if (discourseConfirmed(data)) {
    //         if(data.discourse.room_id) {
    //             if (isPast(getMeetDateTS(data))) {
    //                 return DiscourseStateEnum.ONGOING
    //             } else {
    //                 return DiscourseStateEnum.SCHEDULED
    //             }
    //         } else {
    //             return DiscourseStateEnum.SCHEDULING
    //         }
    //     } else { // speaker didn't confirm self terminate
    //         return DiscourseStateEnum.TERMINATED
    //     }
    // }
}

export const hasWithdrawn = (data: any, address: string) => {
    if (data.status.withdrawn.find((x: string) => x === address)) { 
        return true;
    }
    return false;
}

export const fundingDone = (data: any) => {
    var fDate = getTime(+data.endTS+1468800);
    var now = new Date();
    return now.getTime() > fDate.getTime();
}

export const confirmationPeriodDone = (data: Discourse) => {
    const confirmationDate = getTime(+data.endTS);
    const now = new Date();
    return now.getTime() > confirmationDate.getTime();
}

export const slotProposed = (data : any) => {
    if (data.proposed) {
        return true;
    }
    return false;
}

export const slotConfirmed = (data : any) => {
    if (data.slots.find( (s :any) => s.accepted)) {
        return true;
    }
    return false;
}

export const getSlotString = (data : any) => {
    let slot = data.slots.find( (s :any) => s.accepted);
    if (slot) {
        return slot.timestamp;
    }
    return '';
}

export const getSlotProposer = (data : any) => {
    return data.proposer.address;
}

export const getOtherSpeaker = (data : any, walletAddress: string) => {
    if (data.getDiscourseById.speakers[0].address === walletAddress) {
        return getUsername(data.getDiscourseById.speakers[1].username);
    }
    return getUsername(data.getDiscourseById.speakers[0].username);
}

export const discouresEnded = (data : any) => {
    if (data.discourse.ended) {
        return true;
    }
    return false;
}

export const getFundClaimDate = (data : any) => {
    var date = new Date(data.discourse.meet_date);
    var endDate = new Date(date.getTime() + (3 * 24 * 60 * 60 * 1000));
    return endDate;
}

export const isPledger = (data : any, walletAddress: string) => {
    if (data.funds.find( (f :any) => f.address === walletAddress)) {
        return true;
    }
    return false;
}

export const canClaimC = (data : any, walletAddress: string) => {
    if (walletAddress === data.prop_starter) {
        return true;
    } else if (
        walletAddress === data.speakers[0].address ||
        walletAddress === data.speakers[1].address
    ) {
        return true;
    }
    return false;
}
