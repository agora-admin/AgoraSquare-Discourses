export type CreateObj = {
    speakers: Array<any>;
    moderator: any;
    propId: number;
    description: string;
    title: string;
    prop_description: string;
    prop_starter: string;
    charityPercent: number;
    initTS: string;
    endTS: string;
    topics: Array<any>;
    initialFunding: string;
    confirmationPeriod: number;
    yt_link: string;
    disable: boolean;
    irl: boolean;
    event: Event | null;
}

export type Event = {
    timestamp: string,
    name: string,
    address: string,
    city: string,
    state: string,
    country: string,
    zip: string
}

export enum ToastTypes {
    success = "success",
    error = "error",
    info = "info",
    warning = "warning",
    event = "event",
    wait = "wait",
}

export type Toast = {
    title: string;
    body: string;
    type: ToastTypes;
    id: string;
    duration?: number;
}

export interface SpeakerInputType {
    screen_name: string;
    name: string;
    profile_image_url: string;
}

export interface Moderator extends SpeakerInputType{}

export interface Speaker{
    name: string;
    username: string;
    address: string;
    confirmed: boolean;
    isTwitterHandle: boolean;
    image_url: string;
}

export interface Fund{
    address: string;
    amount: number;
    timestamp: string;
    txnHash: string;
}

export interface DiscourseStatus{
    disputed: boolean;
    completed: boolean;
    terminated: boolean;
    speakersConfirmation: number;
    withdrawn: string[];
}

export interface Discourse {
    id: string;
    title: string;
    description: string;
    speakers: Speaker[];
    moderator: { name: string; username: string; image_url: string; }
    propId: number;
    chainId: number;
    prop_description: string;
    prop_starter: string;
    charityPercent: number;
    initTS: string;
    endTS: string;
    topics: string[];
    irl: boolean;
    yt_link: string;
    disable: boolean;
    funds: Fund[];
    status: DiscourseStatus
    txnHash: string;
    discourse: {
        room_id: string;
        ended: boolean;
        meet_date: string;
        confirmation: string[];
        c_timestamp: string;
    }
}