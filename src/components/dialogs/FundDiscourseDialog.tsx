import { Dialog } from '@headlessui/react';
import { Dispatch, SetStateAction, useContext, useRef } from "react";
import { ethers } from "ethers";
import { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import UseAnimations from 'react-useanimations';
import loading from 'react-useanimations/lib/loading';
import { FundDiscourseIcon2 } from '../utils/SvgHub';
import { FUND_UPDATE } from '../../lib/mutations';
import { GET_DISCOURSE_BY_ID } from '../../lib/queries';
import { useContractWrite, useNetwork, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { getContractAddressByChainId } from '../../helper/ContractHelper';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import AppContext from '../utils/AppContext';
import { v4 as uuid } from 'uuid';
import { ToastTypes } from '../../lib/Types';
import { getChainName, getCurrencyName } from '../../Constants';
import { ArrowCircleRight, CloseCircle, TickSquare } from 'iconsax-react';
import abi from '../../web3/abi/DiscourseHub.json';
import { usePersistedTokenStore } from '../../userToken';

const FundDiscourseDialog = ({ open, setOpen, discourse }: { open: boolean, setOpen: Dispatch<SetStateAction<boolean>>, discourse: any }) => {
    let buttonRef = useRef(null);
    const { walletAddress, addToast } = useContext(AppContext);

    const [minting, setMinting] = useState(false);
    const [txn, setTxn] = useState("");
    const [funded, setFunded] = useState(false);
    const [ amount, setAmount ] = useState('1.0');
    const [acceptTerms,setAcceptTerms] = useState(false);
    const { chain } = useNetwork();
    const token = usePersistedTokenStore(state => state.token);
    
    const [ updateFund ] = useMutation(FUND_UPDATE);

    const [ fetchD ] = useLazyQuery(GET_DISCOURSE_BY_ID, { variables: { id: discourse.id } });

    const {config:fundConfig} = usePrepareContractWrite({
        address: getContractAddressByChainId(chain?.id as number),
        abi,
        functionName: 'pledgeFunds',
        args: [+discourse.propId],
        overrides: { 
            from: walletAddress as any,
            value: ethers.utils.parseEther(amount || '0.0')
        }
    })

    const fund = useContractWrite({
        ...fundConfig,
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
    })

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
            context: { 
                headers: {
                    'Authorization': 'Bearer ' + token,
                } 
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
        if (chain?.id === discourse.chainId) {
            if(acceptTerms){
                addToast({
                    title: "Waiting for confirmation",
                    body: `Please approve the transaction on your wallet. It may take a few minutes to complete.`,
                    type: ToastTypes.wait,
                    duration: 5000,
                    id: uuid()
                })
                setMinting(true);
                fund.write?.();
            }else{
                addToast({
                    title: "Accept Terms and Conditions",
                    body: `Please accept terms and conditions to fund a discourse`,
                    type: ToastTypes.info,
                    duration: 5000,
                    id: uuid()
                })
            }
        } else {
            addToast({
                title: "Different Chain",
                body: `This discourse is on [${getChainName(chain?.id!)}]. Please use the correct chain.`,
                type: ToastTypes.error,
                duration: 5000,
                id: uuid()
            })
        }
    }

    return (
            <Dialog as='div' open={open} onClose={() => {}} initialFocus={buttonRef}
                className='fixed z-20 inset-0 w-screen h-screen overflow-hidden'>
                <div className="flex items-center justify-center h-screen backdrop-blur-sm overflow-hidden">
                    <Dialog.Overlay className="fixed inset-0 bg-black opacity-0 w-screen h-screen overflow-hidden" />

                    <div className={`${open ? 'animate-dEnter': 'animate-dExit'} fixed inset-0 xs2:relative bg-[#0A0A0A] xs2:rounded-3xl xs2:max-w-sm w-full p-4 flex flex-col gap-3`}>
                        {/* Fund Post View */}
                        {!minting && !funded && <>
                        <div className="absolute top-3 right-3 cursor-pointer" onClick={handleClose}>
                            <CloseCircle size={23} color="#6C6C6C" variant='Bulk' />
                        </div>

                        <section className="flex flex-col gap-2">
                            <header className="flex items-center gap-2">
                                <FundDiscourseIcon2 />
                                <h3 className="font-bold text-white text-sm">Fund Discourse</h3>
                            </header>

                            <p className='text-[#E5F7FFE5] text-[13px]'>You are about to fund a discourse. Select the amount in MATIC (no minimum value).</p>

                            <input type="number" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            placeholder="Stake amount" 
                            className="bg-[#141414] border-2 border-[#1E1E1E] outline-none text-[#7D8B92] text-[13px] font-semibold py-2 px-3 rounded-lg "
                            />
                        </section>

                        <div className="w-full h-[1.2px] bg-[#1E1E1E]" />

                        <section className='flex flex-col gap-3'>
                            <div className='flex items-center justify-between'>
                                <p className='font-Lexend font-semibold text-xs text-[#E5F7FF] max-w-[230px]'>I agree with <a href="/disclamer" target="_blank" rel="noreferrer" className='underline text-[#6A8BFF] cursor-pointer'>terms & conditions</a>, and wish to Proceed.</p>
                                
                                <div onClick={() => setAcceptTerms(prev => !prev)} className="cursor-pointer">
                                    {acceptTerms ? <TickSquare size={24} color="white" /> : 
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H15C20.43 1.25 22.75 3.57 22.75 9V15C22.75 20.43 20.43 22.75 15 22.75ZM9 2.75C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V9C21.25 4.39 19.61 2.75 15 2.75H9Z" fill="white"/>
                                        </svg>
                                    }
                                </div>
                            </div>

                            <button onClick={handleFundClick} ref={buttonRef} className="mx-auto bg-[#D2B4FC] min-w-[112px] rounded-2xl p-3 cursor-pointer flex justify-center text-xs font-Lexend text-black font-medium">
                                Fund
                            </button>
                        </section>
                        </>}


                        {/* Funding View */}
                        {minting && <>
                            <header className="flex items-center gap-2">
                                <FundDiscourseIcon2 />
                                <h3 className="font-bold text-white text-sm">Funding Discourse</h3>
                            </header> 

                            <div className="flex flex-col w-full text-center gap-4">
                                    <div className="flex flex-col gap-1">
                                        <p className='text-[#E5F7FFE5] text-medium text-xs w-full'>Approve the transaction from metamask.</p>
                                        <p className='text-[#E5F7FFE5] text-medium text-xs w-full'>{amount} {getCurrencyName(discourse.chainId)} will be funded to the discourse.</p>
                                    </div>
                                    <div className='flex items-center justify-center gap-2'>
                                        <UseAnimations animation={loading} size={20} strokeColor="#ffffff" className='text-white' />
                                        <p className='text-sm text-[#E5F7FFE5] font-semibold' >Please Wait...</p>
                                    </div>
                            </div> 
                        </>}


                        {/* Funded View */}
                        {!minting && funded &&
                            <>
                            <header className="flex items-center gap-2">
                                <FundDiscourseIcon2 />
                                <h3 className="font-bold text-white text-sm">Funded Discourse</h3>
                                <div className="absolute top-3 right-3 cursor-pointer" onClick={handleClose}>
                            <CloseCircle size={23} color="#6C6C6C" variant='Bulk' />
                        </div>
                
                            </header> 
                            <div className="flex flex-col w-full items-center gap-4 text-center justify-between">
                                <p className='text-[#E5F7FFE5] text-semibold text-xs'>Thanks for funding the discourse.</p>
                                <a href={`${chain?.blockExplorers?.default.url}/tx/${txn}`} target="_blank" rel="noreferrer" className='mx-auto bg-[#D2B4FC] min-w-[112px] rounded-2xl p-2 cursor-pointer flex items-center gap-2'>
                                    <span className='text-[11px] font-Lexend text-black font-medium'>View Transaction</span>
                                    <ArrowCircleRight color="#7E6C97" variant="Bold" />
                                </a>
                            </div>
                            </>
                        }
                    </div>
                </div>
            </Dialog>
    );
}

export default FundDiscourseDialog;