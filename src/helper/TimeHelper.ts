import moment from "moment";
moment().format();

export const getTime = (timeInSeconds: number) => {
    const milli = timeInSeconds * 1000;
    const date = new Date(milli);
    return date;
}

export const getSecNow = () => {
    const now = new Date();
    const sec = Math.floor(now.getTime() / 1000);
    return sec +"";
}

export const getChatTime = (date: Date) => {
    const now = new Date();
    const sec = Math.floor(now.getTime() / 1000);
    const chatSec = Math.floor(date.getTime() / 1000);
    const diff = sec - chatSec;
    const day = Math.floor(diff / 86400);
    const hour = Math.floor((diff - (day * 86400)) / 3600);
    const min = Math.floor((diff - (day * 86400) - (hour * 3600)) / 60);
    const sec1 = diff - (day * 86400) - (hour * 3600) - (min * 60);
    const time = `${hour > 0 ? hour + 'h' : ''} ${min > 0 ? min +'m' : ''} ${sec1}s ago`;
    return time;
}

export const formatDate = (date: Date) => {
    const monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
    ];
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    return day + ' ' + monthNames[monthIndex] + ' ' + year;
}

export const getDayFromDate = (date: Date) => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return dayNames[date.getDay()];
}

export const getTimeFromDate = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const h = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    // const hrStr = hours < 10 ? "0" + hours : hours > 12 ? (hours - 12) < 10 ? "0" + ((hours - 12) === 0 ? 12 : hours - 12) : hours : hours;
    const hrStr = h < 10 ? "0" + h : h;
    const minStr = minutes < 10 ? "0" + minutes : minutes;
    const aStr = hours < 12 ? "AM" : "PM";

    return hrStr + ":" + minStr + " " + aStr;
    
}

export const getState = (initTS: number, endTS: number) => {
    const init = initTS * 1000;
    const end = endTS * 1000;
    const now = new Date().getTime();

    if (now > init && now < end) {
        // funding state
        return 0;
    }

    if (now > end && now < end + (1209600000)) {
        // funding done confirmation state
        return 1;
    }

    if (now > end + (1209600000)) {
        // after confirmation state/ scheduled if confirmed
        return 2;
    }

    return 5;
}

export const getEndDate = (endTS: number) => {
    return getTime(endTS + (1209600));
}

export const getAgo = (initTS: number) => {
    return moment(getTime(initTS)).fromNow();
}
export const getAgoT = (timestamp: string) => {
    return moment(timestamp).fromNow();
}

export const is24hrOld = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const day = Math.floor(diff / 86400000);
    return day > 1;
}

export const isPast = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    return now.getTime() > date.getTime();
}

export const isFuture = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    return now.getTime() < date.getTime();
}

export const isDisputable = (date : Date) => {
    return new Date().getTime() < date.getTime() + (3 * 24 * 60 * 60 * 1000);
}
