import { createContext, Dispatch } from "react";
import { Toast } from "../../lib/Types";

export interface ContextType {
    loggedIn: boolean;
    setLoggedIn: Dispatch<boolean>;
    walletAddress: string;
    setWalletAddress: Dispatch<string>;
    username: string;
    t_connected: boolean;
    t_id: string;
    t_img: string;
    t_handle: string;
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
    loggedIn: false,
    setLoggedIn: () => {},
    walletAddress: "",
    setWalletAddress: () => {},
    username: "",
    t_connected: false,
    t_id: "",
    t_img: "",
    t_handle: "",
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