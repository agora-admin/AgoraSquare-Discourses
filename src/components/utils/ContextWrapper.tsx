import { useQuery } from "@apollo/client";
import Cookies from "js-cookie";
import { UserInfo } from "@uauth/js";
import { Dispatch, FC, ReactNode, useEffect, useState } from "react";
import { uuid } from "uuidv4";
import { useAccount } from "wagmi";
import { Magic, MagicSDKExtensionsOption } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth";
import { GET_USERDATA } from "../../lib/queries";
import { Toast, ToastTypes } from "../../lib/Types";
import ToastCard from "../cards/ToastCard";
import LoadingScreen from "../screens/LoadingScreen";
import AppContext from "./AppContext";
import { usePersistedTokenStore } from "../../userToken";

interface Props {
	children: ReactNode;
}

const ContextWrapper: FC<Props> = ({ children }) => {
	const [loading, setLoading] = useState(true);
	const [loggedIn, setLoggedIn] = useState(false);
	const [unstoppableLoggedIn, setUnstoppableLoggedIn] = useState(false);
	const [unstoppableUser, setUnstoppableUser] = useState<UserInfo | null>(null);
	const [walletAddress, setWalletAddress] = useState("");
	const [wrongChain, setWrongChain] = useState(false);
	const [showBetaMsg, setShowBetaMsg] = useState(true);
	const [propId, setPropId] = useState(0);
	const [timeStamp, setTimeStamp] = useState("");
	const [toasts, setToasts] = useState<Toast[]>([]);
	const token = usePersistedTokenStore((state) => state.token);
	const setToken = usePersistedTokenStore((state) => state.setToken);
	const magicKey = process.env.NEXT_PUBLIC_MAGIC_API_KEY;
	if (!magicKey) {
		throw new Error("Magic Link Key not found");
	}

	const createMagic = (): Magic | null => {
		if (typeof window !== "undefined") {
			return new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY, {
				extensions: [new OAuthExtension()],
			}) as Magic;
		}
		return null;
	};

	const magic = createMagic();

	const { connector: activeConnector, status } = useAccount();

	useEffect(() => {
		if (
			!activeConnector &&
			status !== "reconnecting" &&
			status !== "connecting"
		) {
			setToken("");
			setWalletAddress("");
			setLoggedIn(false);
		}

		if (status === "disconnected" && loggedIn) {
			handleAddToast({
				title: "Wallet Disconnected",
				body: "Sometimes switching networks can cause a disconnection. Please try reconnecting.",
				type: ToastTypes.error,
				duration: 5000,
				id: uuid(),
			});
			setToken("");
			setWalletAddress("");
			setLoggedIn(false);
		}

		if (status === "connected") {
			refetch();
		}
	}, [activeConnector, status]);

	useEffect(() => {
		if (window && window !== undefined) {
			hydrateStorage();
		}
	}, []);

	const hydrateStorage = () => {
		let sB = localStorage.getItem("showBetaMsg");
		if (sB === null) {
			localStorage.setItem("showBetaMsg", "true");
		} else {
			setShowBetaMsg(sB === "true");
		}
		let wC = localStorage.getItem("wrongChain");
		if (wC === null) {
			localStorage.setItem("wrongChain", "false");
		} else {
			setWrongChain(wC === "true");
		}
	};

	const handleShowBetaMsg: Dispatch<boolean> = (bool) => {
		setShowBetaMsg(bool);
		localStorage.setItem("showBetaMsg", bool.toString());
	};
	const handleWrongChain: Dispatch<boolean> = (bool) => {
		setWrongChain(bool);
		localStorage.setItem("wrongChain", bool.toString());
	};

	const {
		data,
		loading: qLoading,
		error,
		refetch,
	} = useQuery(GET_USERDATA, {
		fetchPolicy: "network-only",
		nextFetchPolicy: "network-only",
		notifyOnNetworkStatusChange: true,
		onCompleted: (data) => {
			if (data) {
				if (data?.getUserData && status === "connected") {
					setLoggedIn(true);
					setWalletAddress(data.getUserData.walletAddress);
				} else {
					setLoggedIn(false);
					setWalletAddress("");
				}

				setTimeout(() => {
					setLoading(false);
				}, 2000);
			} else {
				console.log("data undefined");
			}
		},
		context: {
			headers: {
				Authorization: "Bearer " + token,
			},
		},
		onError: (error) => {
			setLoggedIn(false);
			setWalletAddress("");

			setTimeout(() => {
				setLoading(false);
			}, 2000);
		},
	});

	const name = data?.getUserData?.name + "";
	const username = data?.getUserData?.username + "";
	const bio = data?.getUserData?.bio + "";
	const t_connected = data?.getUserData?.twitterConnected;
	const t_id = data?.getUserData?.twitter?.twitter_id + "";
	const t_img = data?.getUserData?.twitter?.image_url + "";
	const t_handle = data?.getUserData?.twitter?.twitter_handle + "";
	const t_name = data?.getUserData?.twitter?.twitter_name + "";

	const handleAddToast = (notification: Toast) => {
		if (!toastAvailable(notification)) {
			setToasts((prev) => [...prev, notification]);
			setTimeout(
				() => {
					removeToast(notification.id);
				},
				notification.duration ? notification.duration : 5000
			);
		}
	};

	const removeToast = (id: string) => {
		setToasts((prev) => prev.filter((n) => n.id !== id));
	};

	const toastAvailable = (toast: Toast) => {
		if (toasts.find((t) => t.title === toast.title && t.body === toast.body)) {
			return true;
		}
		return false;
	};

	const injectedContext = {
		unstoppableLoggedIn,
		setUnstoppableLoggedIn,
		unstoppableUser,
		setUnstoppableUser,
		loggedIn,
		setLoggedIn,
		walletAddress,
		setWalletAddress,
		username,
		name,
		bio,
		t_connected,
		t_id,
		t_img,
		t_handle,
		t_name,
		showBetaMsg,
		setShowBetaMsg: handleShowBetaMsg,
		wrongChain,
		setWrongChain: handleWrongChain,
		refresh: refetch,
		propId,
		dId: "",
		timeStamp,
		setMPropId: setPropId,
		setMTimeStamp: setTimeStamp,
		addToast: handleAddToast,
		magic,
	};

	if (loading) {
		return <LoadingScreen />;
	}

	return (
		<AppContext.Provider value={injectedContext}>
			<div className="fixed pointer-events-none z-40 max-w-xs flex flex-col h-full items-end inset-y-0 my-auto w-full right-0 p-6 gap-4 t-all">
				{toasts.map((t) => (
					<ToastCard data={t} key={t.id} close={removeToast} />
				))}
			</div>
			{children}
		</AppContext.Provider>
	);
};

export default ContextWrapper;
