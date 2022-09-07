import { Dialog } from '@headlessui/react';
import { Dispatch, SetStateAction, useContext, useRef } from "react";
import { ethers } from "ethers";
import { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import UseAnimations from 'react-useanimations';
import loading from 'react-useanimations/lib/loading';
import { DiscourseIcon, FundDiscourseIcon } from '../utils/SvgHub';
import { FUND_UPDATE } from '../../lib/mutations';
import { GET_DISCOURSE_BY_ID } from '../../lib/queries';
import { chain, useContractWrite, useNetwork, useWaitForTransaction } from 'wagmi';
import { contractData } from '../../helper/ContractHelper';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import AppContext from '../utils/AppContext';
import { uuid } from 'uuidv4';
import { ToastTypes } from '../../lib/Types';
import { getChainName, getCurrencyName } from '../../Constants';


const FundDiscourseDialog = ({ open, setOpen, discourse }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, discourse: any }) => {
    let buttonRef = useRef(null);
    const { loggedIn, walletAddress, addToast } = useContext(AppContext);

    const [minting, setMinting] = useState(false);
    const [txn, setTxn] = useState("");
    const [funded, setFunded] = useState(false);
    const [ amount, setAmount ] = useState('0.01');
    const { activeChain } = useNetwork();
    
    const [ updateFund, { data: fData } ] = useMutation(FUND_UPDATE);

    const [ fetchD ] = useLazyQuery(GET_DISCOURSE_BY_ID, { variables: { id: discourse.id } });

    const fund = useContractWrite(
        contractData(activeChain?.id!),
        'pledgeFunds',
        {
            args: [+discourse.propId],
            overrides: { from: walletAddress, value: ethers.utils.parseEther(amount) },
            onSettled: (txn) => {
                console.log('submitted:', txn);
                addToast({
                    title: "Transaction Submitted",
                    body: `Waiting for transaction to be mined. Hash: ${txn?.hash}`,
                    type: ToastTypes.wait,
                    duration: 5000,
                    id: uuid()
                })
            },
            onError: (error) => {
                console.log('error:', error);
                addToast({
                    title: "Error Occured",
                    body: error.message,
                    type: ToastTypes.error,
                    duration: 5000,
                    id: uuid()
                })
                setMinting(false);
            }
        }
    )

    const waitForTxn = useWaitForTransaction({
        hash: fund.data?.hash,
        onSettled: (txn) => {
            console.log('settled:', txn);
            if (txn) {
                setTxn(txn?.transactionHash);
                writeFund(txn);
            }
        }
    })

    const writeFund = (txnData: TransactionReceipt) => {
        updateFund({
            variables: {
                propId: discourse.propId,
                chainId: discourse.chainId,
                amount: ethers.utils.parseEther(amount)+"",
                txn: txnData.transactionHash
            },
            onCompleted: (data) => {
                setMinting(false);
                setFunded(true);
                fetchD();
                fund.reset();
            },
            onError: (error) => {
                console.log(error);
                setMinting(false);
                addToast({
                    title: "Error Occured",
                    body: "Error in funding discourse. Try again later.",
                    type: ToastTypes.error,
                    duration: 6000,
                    id: uuid()
                })
                // error handle
            }
        })
    }

    const handleClose = () => {
        setOpen(false);
        setMinting(false);
        setFunded(false);
        setTxn("");
    }

    

    const handleFundClick = async () => {
        if (activeChain?.id === discourse.chainId) {
            addToast({
                title: "Waiting for confirmation",
                body: `Please approve the transaction on your wallet. It may take a few minutes to complete.`,
                type: ToastTypes.wait,
                duration: 5000,
                id: uuid()
            })
            setMinting(true);
            fund.write();
        } else {
            addToast({
                title: "Different Chain",
                body: `This discourse is on [${getChainName(activeChain?.id!)}]. Please use the correct chain.`,
                type: ToastTypes.error,
                duration: 5000,
                id: uuid()
            })
            
        }
    }


    return (


            <Dialog as='div' open={open} onClose={handleClose}
                initialFocus={buttonRef}
                className='fixed z-20 inset-0 w-screen h-screen overflow-hidden'>
                <div className="flex items-center justify-center h-screen backdrop-blur-sm overflow-hidden">
                    <Dialog.Overlay className="fixed inset-0 bg-black opacity-0 w-screen h-screen overflow-hidden" />

                    <div className={`${open ? 'animate-dEnter': 'animate-dExit'} relative bg-[#141515] border border-[#212427]  rounded-2xl max-w-sm w-full mx-auto px-6 py-4 sm:py-10 gap-4`}>
                        {/* Mint Post View */}
                        {!minting && !funded && <>
                            <Dialog.Title className="text-white text-base  font-bold tracking-wide flex items-center gap-2 w-max self-center mx-auto ">
                                <FundDiscourseIcon />

                                Fund Discourse
                            </Dialog.Title>
                            <Dialog.Description className="flex flex-col  w-full items-center  gap-4 text-center justify-between mt-4">
                                <p className='text-[#c6c6c6] text-medium text-xs max-w-[40ch] flex-[1] '>You are about to fund a discoures. Select the amount in {getCurrencyName(discourse.chainId)}. </p>
                                <div className='flex flex-col items-center justify-center w-full gap-4'>
                                    <label htmlFor="amount" className='relative flex items-center'>
                                        <p className='absolute text-white m-auto inset-y-0 left-3 h-max'></p>
                                        <input value={amount} onChange={(e) => setAmount(e.target.value) } type="number" id='amount' className=" input-s pl-8 text-white" placeholder='Stake Amount' />
                                    </label>
                                    <button onClick={handleFundClick} ref={buttonRef} className='button-s font-semibold tracking-wide px-6 py-3  text-xs bg-[#212427] rounded-lg outline-none'>Fund &rarr;</button>
                                </div>
                            </Dialog.Description>
                        </>
                        }
                        {/* Minting.. Post View */}
                        {minting  &&
                            <>
                                <Dialog.Title className="text-white text-base  font-bold tracking-wide flex items-center gap-2 w-max self-center mx-auto ">
                                    <FundDiscourseIcon />
                                    Funding Discourse
                                </Dialog.Title>
                                <Dialog.Description className="flex flex-col  w-full items-center  gap-4 text-center justify-between mt-4">
                                    <p className='text-[#c6c6c6] text-medium text-xs max-w-[40ch] flex-[1] '>Approve the transaction from metamask.<br /> {amount} {getCurrencyName(discourse.chainId)} will be funded to the discourse.</p>
                                    <div className='flex items-center justify-center gap-2'>
                                        <UseAnimations animation={loading} size={20} strokeColor="#ffffff" className='text-white' />
                                        <p className='text-sm text-white/50' >Please Wait...</p>
                                    </div>
                                </Dialog.Description>
                            </>
                        }
                        {/* Minted Post */}
                        {!minting && funded &&
                            <>
                            <Dialog.Title className="text-white text-base  font-bold tracking-wide flex items-center gap-2 w-max self-center mx-auto ">
                                <DiscourseIcon />

                                Funded Discourse
                            </Dialog.Title>
                            <Dialog.Description className="flex flex-col  w-full items-center  gap-4 text-center justify-between mt-4">
                                <p className='text-[#c6c6c6] text-medium text-xs max-w-[40ch] flex-[1] '>Thanks for funding the discourse. You&apos;ll get notification once the stream is scheduled and speakers confirms.</p>
                                <div className='flex items-center justify-center w-full px-10 gap-10'>
                                    <a href={`${activeChain?.blockExplorers?.default.url}/tx/${txn}`} target="_blank" className='text-xs font-bold  text-gradient' rel="noreferrer" >View Transaction ↗</a>
                                </div>
                            </Dialog.Description>
                            </>
                        }

                    </div>
                </div>
            </Dialog>
    );
}



export default FundDiscourseDialog;