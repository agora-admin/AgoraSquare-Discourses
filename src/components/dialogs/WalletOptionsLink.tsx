import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Popover } from "@headlessui/react";
import { useContext, useState } from "react";
import { Connector, useAccount, useConnect, useSignMessage } from "wagmi";
import { VERIFY_SIG } from "../../lib/mutations";
import { GET_NONCE, GET_USERDATA } from "../../lib/queries";
import uauth from "../../web3/Connectors";
import MobileConnectWallet from "../topbar/MobileConnectWallet";
import AppContext from "../utils/AppContext";
import { AgoraBtnIcon, MetamaskIcon, NullWalletIcon, UnstoppableIcon, WalletConnectIcon, WalletIcon } from "../utils/SvgHub";
import { usePersistedTokenStore } from "../../userToken";

const WalletOptionsLink = () => {
    const { refresh, loggedIn,setUnstoppableLoggedIn,setUnstoppableUser } = useContext(AppContext);
    // Unstoppable domain Connector
    async function handleUnstoppableLogin() {
        try {
            const authorization = await uauth.loginWithPopup()
            
            uauth.user().then(user => {
                if(user){
                    setUnstoppableUser(user);
                    setUnstoppableLoggedIn(true);
                }
            })

          } catch (error) {
            console.error(error)
          }
    }
      
    // Wagmi Connect 
    const { connectors, connectAsync } = useConnect();
    const {isConnected,address} = useAccount();
    const { data: smData, signMessageAsync } = useSignMessage();

    const [isOpenMobileConnectMenu,setIsOpenMobileConnectMenu] = useState(false);
    
    const token = usePersistedTokenStore(state => state.token);
    const setToken = usePersistedTokenStore(state => state.setToken);

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
		onCompleted: (data: any) => {
            setToken(data.verifySignature.token);
            refresh();
            location.reload();
		},
        context: { 
            headers: {
                'Authorization': 'Bearer ' + token,
            } 
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
				address
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

    const handleConnectWallet = async (connector:Connector) => {
		if (isConnected && address) {
			getNonce({ variables: { address } });
		} else {
			await connectAsync({connector}).then(({ account }) => {
				getNonce({ variables: { address: account } });
			}).catch((err) => {
				console.log(err);
			});
		}
    }

    return (
        <>
            <Popover className="relative">
                {({ open }) => (
                    <>
                        <Popover.Button className="button-s bg-gradient w-max flex items-center gap-4 justify-center my-2">
                            <AgoraBtnIcon/>
                            <p className="text-[12px] text-black font-semibold">Connect Wallet</p>
                        </Popover.Button>

                        {
                            <Popover.Panel  className={`${open ? 'animate-dEnter': 'animate-dExit'} absolute z-20 left-0 bg-card bg-[#141515] p-4 rounded-xl backdrop-blur-lg max-w-xs w-[200px]`}>
                                <div className="flex flex-col gap-2 flex-[0.6]">
                                    <h3 className="text-[#c6c6c6] text-xs">Choose a provider</h3>
                                    <div className="flex gap-2 items-center flex-col">
                                        {
                                            connectors.map((connector, i) => (
                                                <div key={i} className="flex w-full">
                                                    <button onClick={() => handleConnectWallet(connector)} disabled={!connector.ready} className={`w-full flex items-center gap-2 ${connector.ready ? 'button-s': 'button-s-d'}`}>
                                                        {getIcon(connector)}
                                                        <p className="text-sm font-Lexend text-[#c6c6c6]">{connector.id === "injected" ? "Injected" : connector.name}</p>
                                                    </button>
                                                </div>
                                            ))
                                        }

                                        <div className="flex w-full">
                                            <button onClick={handleUnstoppableLogin} className={`w-full flex items-center gap-2 ${true ? 'button-s': 'button-s-d'}`}>
                                                <UnstoppableIcon />
                                                <p className="text-sm font-Lexend text-[#c6c6c6]">Unstoppable</p>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Popover.Panel>
                        }
                    </>
                )}
            </Popover>

            {/* Mobile Btn */}
            {/* <div onClick={() => {
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
                handleUnstoppableLogin={handleUnstoppableLogin}
            /> */}
        </>
    );
}

export default WalletOptionsLink;