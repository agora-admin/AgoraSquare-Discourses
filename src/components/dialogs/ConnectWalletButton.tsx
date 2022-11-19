import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Popover } from "@headlessui/react";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { Connector, useAccount, useConnect, useSignMessage } from "wagmi";
import { VERIFY_SIG } from "../../lib/mutations";
import { GET_NONCE, GET_USERDATA } from "../../lib/queries";
import MobileConnectWallet from "../topbar/MobileConnectWallet";
import AppContext from "../utils/AppContext";
import { MetamaskIcon, NullWalletIcon, WalletConnectIcon, WalletIcon } from "../utils/SvgHub";

const ConnectWalletButton = () => {
    const route = useRouter();
	const { refresh, loggedIn } = useContext(AppContext);
    const { connectors, connectAsync, isConnecting, isConnected, data: wData } = useConnect();
    const { data: smData, signMessageAsync } = useSignMessage();
    const [walletAddress, setWalletAddress] = useState('');
	const account = useAccount();

    const [isOpenMobileConnectMenu,setIsOpenMobileConnectMenu] = useState(false);

	const { refetch } = useQuery(GET_USERDATA);
    const [getNonce] = useLazyQuery(GET_NONCE, {
        fetchPolicy: "no-cache",
        onCompleted: (data) => {
            if (data && !loggedIn) {
                signAndVerify(data.getNonce.nonce);
            }
        }
    });
	const [verifySig] = useMutation(VERIFY_SIG, {
		fetchPolicy: 'no-cache',
		onCompleted: (data) => {
            refresh();
		},
		onError: (error) => {
			console.log(error);
            refresh();
		}
	});

    const signAndVerify = async (nonce: string) => {
		const sigData = await signNonce(nonce)
			.catch(err => {
				console.log(err);
				return;
			});

		if (sigData?.signature && !loggedIn) {
			verifySig({
				variables: {
					signature: sigData.signature,
					walletAddress: sigData.address
				}
			});
		}
	}

    const signNonce = async (nonce: string) => {
		try {
            let signature = await signMessageAsync({ message: nonce }).then((data) => {
                return data;
            }).catch((err) => {
                console.log(err);
            })
			
			return {
				signature,
				address: account?.data?.address
			}
		} catch (error) {
			console.log(error);
		}
	}

    const getIcon = (connector: any) => {
        if (connector.id === 'walletConnect') {
            return <WalletConnectIcon />
        } else if (connector.id === 'metaMask') {
            return <MetamaskIcon />
        } else {
            return <NullWalletIcon />
        }
    }

    const handleConnectWallet = async (connector: Connector) => {
		if (isConnected && account.data?.address) {
			setWalletAddress(account.data?.address);
			getNonce({ variables: { address: account.data?.address } });
		} else {
			await connectAsync(connector).then(({ account }) => {
				setWalletAddress(account);
				getNonce({ variables: { address: account } });
			}).catch((err) => {
				console.log(err);
			});
		}
    }

    return (
        <>
            <Popover className="relative mobile:hidden">
                {({ open }) => (
                    <>
                        <Popover.Button className="flex items-center gap-2 outline-none bg-[#141414] rounded-full px-3 py-2 cursor-pointer">
                            <WalletIcon size={24}/>
                            <span className="text-white font-Lexend text-xs">connect wallet</span>
                        </Popover.Button>

                        {
                            <Popover.Panel  className={`${open ? 'animate-dEnter': 'animate-dExit'} absolute z-20 right-0 mt-1 bg-card bg-[#141515] p-4 rounded-xl backdrop-blur-lg max-w-xs w-[200px]`}>
                                <div className="flex flex-col gap-2 flex-[0.6]">
                                    <h3 className="text-white text-xs font-medium">Choose a provider</h3>
                                    <div className="flex gap-2 items-center flex-col">
                                        {
                                            connectors.map((c, i) => (
                                                <div key={i} className="flex w-full">
                                                    {
                                                        <button onClick={() => handleConnectWallet(c)} disabled={!c.ready} className={`w-full flex items-center gap-2 ${c.ready ? 'button-s': 'button-s-d'}`}>
                                                            {getIcon(c)}
                                                            <p className="text-sm font-Lexend text-[#c6c6c6]">{c.id === "injected" ? "Injected" : c.name}</p>
                                                        </button>
                                                    }    
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </Popover.Panel>
                        }
                    </>
                )}
            </Popover>

            {/* Mobile Btn */}
            <div onClick={() => {
                setIsOpenMobileConnectMenu(prev => !prev);
            }} className="block bg-[#141414] p-2 rounded-full sm:hidden">
                <WalletIcon size={24}/>
            </div>

            <MobileConnectWallet 
                isOpenMobileConnectMenu={isOpenMobileConnectMenu} 
                setIsOpenMobileConnectMenu={setIsOpenMobileConnectMenu} 
                connectors={connectors} 
                getIcon={getIcon} 
                handleConnectWallet={handleConnectWallet} 
            />
        </>
    );
}

export default ConnectWalletButton;