import { UserInfo } from "@uauth/js";
import { createContext, Dispatch } from "react";
import { Toast } from "../../lib/Types";

export interface ContextType {
    unstoppableLoggedIn: boolean,
    setUnstoppableLoggedIn: Dispatch<boolean>,
    loggedIn: boolean;
    setLoggedIn: Dispatch<boolean>;
    unstoppableUser: UserInfo | null;
    setUnstoppableUser: Dispatch<UserInfo | null>;
    walletAddress: string;
    setWalletAddress: Dispatch<string>;
    username: string;
    name: string;
    bio: string;
    t_connected: boolean;
    t_id: string;
    t_img: string;
    t_handle: string;
    t_name: string;
    // --------------ui state
    showBetaMsg: boolean;
    setShowBetaMsg: Dispatch<boolean>;
    wrongChain: boolean;
    setWrongChain: Dispatch<boolean>;
    refresh: () => void;

    // --------------meet state
    propId: number;
    dId: string;
    timeStamp: string;
    setMPropId: Dispatch<number>;
    setMTimeStamp: Dispatch<string>;


    // --------------notifs
    addToast: (toast: Toast) => void;
}

const AppContext = createContext<ContextType>({
    unstoppableLoggedIn: false,
    setUnstoppableLoggedIn: () => {},
    loggedIn: false,
    setLoggedIn: () => {},
    unstoppableUser: null,
    setUnstoppableUser: () => {},
    walletAddress: "",
    setWalletAddress: () => {},
    username: "",
    name: "",
    bio: "",
    t_connected: false,
    t_id: "",
    t_img: "",
    t_handle: "",
    t_name: "",
    showBetaMsg: true,
    setShowBetaMsg: () => {},
    wrongChain: false,
    setWrongChain: () => {},
    refresh: () => {},
    propId: 0,
    dId: "",
    timeStamp: "",
    setMPropId: () => {},
    setMTimeStamp: () => {},
    addToast: () => {},
})

export default AppContext;