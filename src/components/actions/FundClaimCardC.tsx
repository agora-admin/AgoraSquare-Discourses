import { ArrowCircleRight, MoneySend } from "iconsax-react";
import { getFundClaimDate, hasWithdrawn } from "../../helper/DataHelper";
import { FUND_WITHDRAWN } from "../../lib/mutations";
import { useMutation, useLazyQuery } from "@apollo/client";
import { useContext, useState } from "react";
import { GET_DISCOURSE_BY_ID } from "../../lib/queries";
import { formatDate, isPast } from "../../helper/TimeHelper";
import { useContractWrite, useNetwork, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import AppContext from "../utils/AppContext";
import { v4 as uuid } from "uuid";
import { getChainName } from "../../Constants";
import { ToastTypes } from "../../lib/Types";
import { getContractAddressByChainId } from "../../helper/ContractHelper";
import abi from "../../web3/abi/DiscourseHub.json";

const FundClaimCardC = ({ data }: { data: any }) => {

    const [loading, setLoading] = useState(false);
    const { loggedIn, walletAddress, addToast } = useContext(AppContext);
    const { chain } = useNetwork();

    const [fundWithdrawn] = useMutation(FUND_WITHDRAWN, {
        variables: {
            propId: data.propId,
            chainId: data.chainId
        },
        onCompleted: () => {
            refetch();
            addToast({
                title: "Widraw Successful",
                body: `You have successfully claimed your funds. It may take a few minutes to reflect in your wallet.`,
                type: ToastTypes.success,
                duration: 5000,
                id: uuid()
            })
        }
    })

    const [refetch] = useLazyQuery(GET_DISCOURSE_BY_ID, {
        variables: {
            id: data.id
        }, onCompleted: (data) => {
            setLoading(false);
        }
    })

    const {config: withdrawProConfig} = usePrepareContractWrite({
        address: getContractAddressByChainId(chain?.id as number),
        abi,
        functionName: 'proposerWithdraw',
        args: [data.propId],
        overrides: {
            from: walletAddress as any,
        }
    })

    const withdrawPro = useContractWrite({
        ...withdrawProConfig,
        onSettled: (txn) => {
            console.log('submitted', txn);
            addToast({
                title: "Transaction Submitted",
                body: `Waiting for transaction to be mined. Hash: ${txn?.hash}`,
                type: ToastTypes.wait,
                duration: 5000,
                id: uuid()
            })
        },
        onError: (error) => {
            setLoading(false);
            addToast({
                title: "Something went wrong",
                body: error.message,
                type: ToastTypes.wait,
                duration: 5000,
                id: uuid()
            })
        }
    })

    const {config:withdrawSpeakerConfig} = usePrepareContractWrite({
        address: getContractAddressByChainId(chain?.id as number),
        abi,
        functionName: 'speakerWithdraw',
        args: [data.propId],
        overrides: {
            from: walletAddress as any,
        }
    })

    const withdrawSpeaker = useContractWrite({
        ...withdrawSpeakerConfig,
        onSettled: (txn) => {
            console.log('submitted', txn);
            addToast({
                title: "Transaction Submitted",
                body: `Waiting for transaction to be mined. Hash: ${txn?.hash}`,
                type: ToastTypes.wait,
                duration: 5000,
                id: uuid()
            })
        },
        onError: (error) => {
            setLoading(false);
            addToast({
                title: "Something went wrong",
                body: error.message,
                type: ToastTypes.wait,
                duration: 5000,
                id: uuid()
            })
        }
    })

    const waitForTx1 = useWaitForTransaction({
        hash: withdrawPro.data?.hash,
        onSettled: (txn) => {
            console.log('settled', txn);
            fundWithdrawn();
        }
    })

    const waitForTx2 = useWaitForTransaction({
        hash: withdrawSpeaker.data?.hash,
        onSettled: (txn) => {
            console.log('settled', txn);
            fundWithdrawn();
        }
    })

    const handleClaim = async () => {
        if (chain?.id === data.chainId) {
            setLoading(true);
            addToast({
                title: "Waiting for confirmation",
                body: `Please approve the transaction on your wallet. It may take a few minutes to complete.`,
                type: ToastTypes.wait,
                duration: 5000,
                id: uuid()
            })
            if (walletAddress === data.prop_starter) {
                withdrawPro.write?.();
            } else {
                withdrawSpeaker.write?.();
            }
        } else {
            addToast({
                title: "Different Chain",
                body: `This discourse is on [${getChainName(data.chainId)}]. Please use the correct chain.`,
                type: ToastTypes.error,
                duration: 5000,
                id: uuid()
            })
        }
    }

    return (
        <div className="mobile:fixed mobile:bottom-[60px] mobile:inset-x-0 mobile:max-h-[220px] flex flex-col sm:flex-row mobile:gap-4 items-center sm:justify-between py-6 sm:py-3 sm:px-4 bg-[#141414] sm:border-[1.2px] sm:border-[#FCB4BD] rounded-t-[30px] sm:rounded-3xl">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
                <div className="mobile:hidden">
                    <MoneySend size={40} color='#FCB4BD' variant="Bulk" />
                </div>

                <div className="sm:hidden">
                    <MoneySend size={50} color='#FCB4BD' variant="Bulk" />
                </div>
                <div className="flex flex-col">
                    <h4 className="text-[#FCB4BD] font-bold text-[13px] sm:text-sm">Claim Funds</h4>
                    <small className="text-[11px] sm:text-xs text-[#E5F7FFE5] font-semibold">
                        {
                            isPast(getFundClaimDate(data).toISOString()) ?
                            "Fund can be claimed now.":
                            <>
                                You can claim funds after <b>
                                {formatDate(getFundClaimDate(data))}</b>
                            </>
                        }
                    </small>
                    {!loggedIn && <small className="text-[11px] text-[#E5F7FFE5] font-semibold">Connect your wallet to withdraw your fund.</small>}
                </div>
            </div>

            {
                isPast(getFundClaimDate(data).toISOString()) && !hasWithdrawn(data, walletAddress) && 
                <button disabled={loading} onClick={handleClaim} className="flex items-center gap-2 bg-[#FCB4BD] rounded-2xl p-3 cursor-pointer">
                    <span className="text-black text-xs font-Lexend font-medium">{loading ? "Wait..." : "Claim Funds"}</span>
                    <ArrowCircleRight color="#976C71" variant="Bulk" fill="#000"/>
                </button>
            }
        </div>
    );
}

export default FundClaimCardC;