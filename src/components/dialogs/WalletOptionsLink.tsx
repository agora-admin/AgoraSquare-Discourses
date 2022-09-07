import { useLazyQuery, useMutation } from "@apollo/client";
import { Popover, Transition } from "@headlessui/react";
import { useContext, useEffect, useState } from "react";
import { Connector, useAccount, useConnect, useSignMessage } from "wagmi";
import { VERIFY_SIG } from "../../lib/mutations";
import { GET_NONCE, GET_USERDATA } from "../../lib/queries";
import AppContext from "../utils/AppContext";
import { AgoraBtnIcon, MetamaskIcon, NullWalletIcon, WalletConnectIcon } from "../utils/SvgHub";

const WalletOptionsLink = () => {
    const { refresh, loggedIn } = useContext(AppContext);
    const { connectors, connectAsync, isConnecting, isConnected, data: wData } = useConnect();
    const { data: smData, signMessageAsync } = useSignMessage();
    const [walletAddress, setWalletAddress] = useState('');
    const account = useAccount();

    const [getNonce, { data: nonceData, loading: nonceLoading, error: nonceError }] = useLazyQuery(GET_NONCE);
    const [verifySig, { data, loading: sigLoading, error: sigError }] = useMutation(VERIFY_SIG, {
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            if (data) {
                refresh();
            }
        },
        onError: (error) => {
            console.log(error);
        }
    });

    useEffect(() => {
        if (nonceData && !loggedIn) {
            signAndVerify(nonceData.getNonce.nonce);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nonceData])

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
            // setConnectingWallet(false);
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
        <Popover className="relative">
            {({ open }) => (
                <>
                    {/* <Popover.Button className={`t-all outline-none text-white text-xs ${open ? 'bg-[#212427]' : ''} hover:bg-white/10 rounded-xl font-Lexend px-4 py-2 flex items-center gap-2`}>
                        <Wallet1 size={20} />
                        <p className="hidden sm:block">{isConnecting ? 'Connecting..' : 'Connect'}</p>
                        { !isConnecting && <ArrowRight2 className={`hidden sm:block transform t-all ${open ? 'rotate-90 ' : ' rotate-0 '}`} size='16' color="#c6c6c6" />}
                    </Popover.Button> */}
                    <Popover.Button className="button-s bg-gradient w-max flex items-center gap-4 justify-center my-2">
                        <AgoraBtnIcon />
                        <p className="text-[12px] text-black font-semibold">Connect Wallet</p>
                    </Popover.Button>
                    {
                        // <Transition
                        //     show={open}
                        //     enter="transition duration-100 ease-out"
                        //     enterFrom="transform scale-95 opacity-0"
                        //     enterTo="transform scale-100 opacity-100"
                        //     leave="transition duration-75 ease-out"
                        //     leaveFrom="transform scale-100 opacity-100"
                        //     leaveTo="transform scale-95 opacity-0"
                        // >
                        <Popover.Panel className={`${open ? 'animate-dEnter': 'animate-dExit'} absolute z-20 left-0 bg-card bg-[#141515] p-4 rounded-xl backdrop-blur-lg max-w-xs w-[200px]`}>
                            <div className="flex flex-col gap-2 flex-[0.6]">
                                <h3 className="text-[#c6c6c6] text-xs">Choose provider</h3>
                                <div className="flex gap-2 items-center flex-col">
                                    {
                                        connectors.map((c, i) => (
                                            <div key={i} className="flex w-full">
                                                {<button onClick={() => handleConnectWallet(c)} disabled={!c.ready} className={`w-full flex items-center gap-2 ${c.ready ? 'button-s' : 'button-s-d'}`}>
                                                    {getIcon(c)}
                                                    <p className="text-sm font-Lexend text-[#c6c6c6]">{c.id === "injected" ? "Injected" : c.name}</p>
                                                </button>}

                                            </div>
                                        ))
                                    }
                                </div>

                            </div>
                        </Popover.Panel>
                        // </Transition>
                    }
                </>
            )}
        </Popover>
    );
}

export default WalletOptionsLink;