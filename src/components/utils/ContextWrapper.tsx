import { useQuery } from "@apollo/client";
import { CloseCircle, Information, Verify, Warning2 } from "iconsax-react";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { Dispatch, FC, ReactNode, useEffect, useState } from "react";
import { uuid } from "uuidv4";
import { useConnect, useDisconnect } from "wagmi";
import { GET_USERDATA } from "../../lib/queries";
import { Toast, ToastTypes } from "../../lib/Types";
import ToastCard from "../cards/ToastCard";
import LoadingScreen from "../screens/LoadingScreen";
import AppContext from "./AppContext";

interface Props {
    children: ReactNode;
}

const ContextWrapper: FC<Props> = ({ children }) => {

    const [loading, setLoading] = useState(true);
    const [loggedIn, setLoggedIn] = useState(false);
    const [walletAddress, setWalletAddress] = useState("");
    const [wrongChain, setWrongChain] = useState(false);
    const [showBetaMsg, setShowBetaMsg] = useState(true);
    const [propId, setPropId] = useState(0);
    const [timeStamp, setTimeStamp] = useState("");
    const [toasts, setToasts] = useState<Toast[]>([]);

    const { activeConnector, status, data: aData } = useConnect();
    const { disconnectAsync } = useDisconnect();

    const route = useRouter();
    
    // useEffect(() => {
    //     if (route.asPath.includes('/create')) {
    //         handleAddToast({
    //             title: "Choose Chain",
    //             body: "Discourses only supports 'Polygon' chain. Please use propper chain to create a discourse",
    //             type: ToastTypes.info,
    //             id: uuid(),
    //             duration: 20000
    //         })
    //     }
    // }, [route.asPath])

    useEffect(() => {
        console.log('status:', status);
        
        if (!activeConnector && status !== "reconnecting" && status !== "connecting") {
            Cookies.remove("jwt");
            setWalletAddress("");
            setLoggedIn(false);
            console.log("no active connector");
        }

        if (status === "disconnected" && loggedIn) {
            handleAddToast({
                title: "Wallet Disconnected",
                body: "Sometimes switching networks can cause a disconnection. Please try reconnecting.",
                type: ToastTypes.error,
                duration: 5000,
                id: uuid()
            })
            Cookies.remove("jwt");
            setWalletAddress("");
            setLoggedIn(false);
        }

        if (activeConnector) {
            console.log("active connector");
        }
        if (status === "connected") {
            refetch();
        }
        // console.log('s',status);

    }, [activeConnector, status])

    // console.log('s', status);

    useEffect(() => {
        if (window && window !== undefined) {
            hydrateStorage();
        }
    }, [])

    const hydrateStorage = () => {
        let sB = localStorage.getItem('showBetaMsg');
        if (sB === null) {
            localStorage.setItem('showBetaMsg', 'true');
        } else {
            setShowBetaMsg(sB === 'true');
        }
        let wC = localStorage.getItem('wrongChain');
        if (wC === null) {
            localStorage.setItem('wrongChain', 'false');
        } else {
            setWrongChain(wC === 'true');
        }
    }

    const handleShowBetaMsg: Dispatch<boolean> = (bool) => {
        setShowBetaMsg(bool);
        localStorage.setItem('showBetaMsg', bool.toString());
    }
    const handleWrongChain: Dispatch<boolean> = (bool) => {
        setWrongChain(bool);
        localStorage.setItem('wrongChain', bool.toString());
    }

    const { data, loading: qLoading, error, refetch } = useQuery(GET_USERDATA,
        {
            fetchPolicy: "network-only",
            nextFetchPolicy: 'network-only',
            notifyOnNetworkStatusChange: true,
            onCompleted: (data) => {
                console.log('completed req');
                
                if (data) {
                    console.log('got data');
                    
                    if (data?.getUserData && status === "connected") {
                        console.log('got getUserData');
                        setLoggedIn(true);
                        setWalletAddress(data.getUserData.walletAddress);
                    } else {
                        console.log('getUserData undefined');
                        setLoggedIn(false);
                        setWalletAddress("");
                    }
    
                    setTimeout(() => {
                        setLoading(false);
                    }, 2000);
                } else {
                    console.log('data undefined');
                }
            },
            onError: (error) => {
                setLoggedIn(false);
                setWalletAddress("");

                setTimeout(() => {
                    setLoading(false);
                }, 2000);
            }
        }
    );

    useEffect(() => {
        if (data) {
            console.log('data fetched');
        }
    }, [data])

    const username = data?.getUserData?.username + "";
    const t_connected = data?.getUserData?.twitterConnected;
    const t_id = data?.getUserData?.twitter?.twitter_id + "";
    const t_img = data?.getUserData?.twitter?.image_url + "";
    const t_handle = data?.getUserData?.twitter?.twitter_handle + "";

    const handleAddToast = (notification: Toast) => {
        if (!toastAvailable(notification)) {
            setToasts((prev) => [...prev, notification]);
            setTimeout(() => {
                removeToast(notification.id);
            }, notification.duration ? notification.duration : 5000);
        }
    }

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter(n => n.id !== id));
    }

    const toastAvailable = (toast: Toast ) => {
        if(toasts.find(t => t.title === toast.title && t.body === toast.body)){
            return true;
        } 
        return false;
    }

    const injectedContext = {
        loggedIn,
        setLoggedIn,
        walletAddress,
        setWalletAddress,
        username: username,
        t_connected: t_connected,
        t_id: t_id,
        t_img: t_img,
        t_handle: t_handle,
        showBetaMsg: showBetaMsg,
        setShowBetaMsg: handleShowBetaMsg,
        wrongChain: wrongChain,
        setWrongChain: handleWrongChain,
        refresh: refetch,
        propId: propId,
        dId: "",
        timeStamp: timeStamp,
        setMPropId: setPropId,
        setMTimeStamp: setTimeStamp,
        addToast: handleAddToast
    }


    if (loading) {
        return <LoadingScreen />
    }

    return (
        <AppContext.Provider value={injectedContext}>
            <div className="fixed pointer-events-none z-40 max-w-xs flex flex-col-reverse sm:flex-col h-full items-end inset-y-0 my-auto w-full right-0 p-6 gap-4 t-all">
                {
                    toasts.map(t => (
                        <ToastCard data={t} key={t.id} close={removeToast} />
                    ))
                }
            </div>
            {children}
        </AppContext.Provider>
    );
}

export default ContextWrapper;