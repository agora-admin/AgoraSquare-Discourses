import { useLazyQuery, useMutation } from "@apollo/client";
import { Popover } from "@headlessui/react";
import { useContext, useEffect, useState } from "react";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import { VERIFY_SIG } from "../../lib/mutations";
import { GET_NONCE } from "../../lib/queries";
import AppContext from "../utils/AppContext";
import { AgoraBtnIcon, MetamaskIcon, NullWalletIcon, WalletConnectIcon } from "../utils/SvgHub";

const WalletOptionsLink = () => {
    const { refresh, loggedIn } = useContext(AppContext);
    const { connectors, connectAsync, data: wData } = useConnect();
    const { isConnected,address } = useAccount();
    const { data: smData, signMessageAsync } = useSignMessage();
    const [walletAddress, setWalletAddress] = useState('');

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
                address: data?.address
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

    const handleConnectWallet = async (connector) => {
        if (isConnected && address) {
            setWalletAddress(address);
            getNonce({ variables: { address: address } });
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
                    <Popover.Button className="button-s bg-gradient w-max flex items-center gap-4 justify-center my-2">
                        <AgoraBtnIcon />
                        <p className="text-[12px] text-black font-semibold">Connect Wallet</p>
                    </Popover.Button>
                    {
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
                    }
                </>
            )}
        </Popover>
    );
}

export default WalletOptionsLink;