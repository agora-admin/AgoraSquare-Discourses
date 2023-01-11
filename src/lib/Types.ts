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
    fundingPeriod: number;
    yt_link: string;
    link: string;
    disable: boolean;
    irl: boolean;
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

export interface Speaker {
    screen_name: string;
    name: string;
    profile_image_url: string;
}

export interface Moderator extends Speaker{}