import { Dialog } from '@headlessui/react';
import { Dispatch, FC, SetStateAction, useContext, useRef } from "react";
import { useRouter } from 'next/router';
import { BigNumber, ethers } from "ethers";
import { useState, useEffect } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import UseAnimations from 'react-useanimations';
import loading from 'react-useanimations/lib/loading';
import { DiscourseIcon, FundDiscourseIcon, FundDiscourseIcon2 } from '../utils/SvgHub';
import DiscourseHub from '../../web3/abi/DiscourseHub.json';
import { CREATE_DISCOURSE } from '../../lib/mutations';
import { getSecNow } from '../../helper/TimeHelper';
import { GET_DISCOURSES } from '../../lib/queries';
import { useContractRead, useContractWrite, useNetwork, useWaitForTransaction } from 'wagmi';
import { contractData } from '../../helper/ContractHelper';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import AppContext from '../utils/AppContext';
import { getCurrencyName, supportedChainIds } from '../../Constants';
import { ToastTypes } from '../../lib/Types';
import { uuid } from 'uuidv4';
import { CloseCircle, TickSquare } from 'iconsax-react';

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    data: any;
}

const CreateDiscourseDialog: FC<Props> = ({ open, setOpen, data }) => {
    let buttonRef = useRef(null);
    const { walletAddress, addToast } = useContext(AppContext);

    const [acceptTerms,setAcceptTerms] = useState(false);
    const [minting, setMinting] = useState(false);
    const [txn, setTxn] = useState("");
    const [funded, setFunded] = useState(false);
    const [error, setError] = useState({});
    const [amount, setAmount] = useState('0.01');
    const [discourseId, setDiscourseId] = useState('');
    const { activeChain } = useNetwork();

    const route = useRouter();

    const abi = DiscourseHub;
    const [refetch] = useLazyQuery(GET_DISCOURSES);
    const [createDiscourse, { data: cData }] = useMutation(CREATE_DISCOURSE, {
        onCompleted: (data) => {
            refetch();
        }
    })

    const handleClose = () => {
        setOpen(false);
    }

    useEffect(() => {
        if (cData) {
            setMinting(false);
            setFunded(true);
        }
    }, [cData])

    // console.log(BigNumber.from(txData).toString());

    const { refetch: getCount } = useContractRead(
        contractData(activeChain?.id!),
        'getTotalProposals',
        {
            enabled: false
        }
    )

    const fund = useContractWrite(
        contractData(activeChain?.id!),
        'createProposalNoAddresses',
        {
            args: [
                data?.speakers[0]?.username,
                data?.speakers[1]?.username,
                data?.title,
                +data?.charityPercent,
                +data?.fundingPeriod
            ],
            overrides: { from: walletAddress, value: ethers.utils.parseEther(amount || '0.0') },
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
            console.log('waited:', txn);
            if (txn) {
                setTxn(txn?.transactionHash);
                writeDiscourse(txn);
            }
        }
    })

    const getEndTS = (fundingSec: number) => {
        let now = new Date();
        return now.getTime() / 1000 + fundingSec;
    }

    const writeDiscourse = (txnD: TransactionReceipt) => {
        getCount().then((tData) => {
            console.log({tData});
            const temp = BigNumber.from(tData.data);
            console.log({temp});
            console.log("To Number: ",temp.toNumber());
            
            let count = BigNumber.from(tData.data).toNumber();
            createDiscourse({
                variables: {
                    discourseInput: {
                        speakers: data.speakers,
                        moderator: data.moderator,
                        propId: count,
                        chainId: activeChain?.id,
                        description: data.description,
                        title: data.title,
                        prop_description: data.title,
                        prop_starter: walletAddress,
                        charityPercent: +data.charityPercent,
                        initTS: getSecNow(),
                        endTS: getEndTS(data.fundingPeriod) + "",
                        topics: data.topics,
                        initialFunding: ethers.utils.parseEther(amount) + "",
                        txnHash: txnD.transactionHash
                    }
                },
                onError: (error) => {
                    console.log(error);
                    setError({
                        message: "Error in registering discourse. Please contact admin",
                        error: true
                    })
                    addToast({
                        title: "Error Occured",
                        body: "Error in registering discourse. Please contact admin",
                        type: ToastTypes.error,
                        duration: 6000,
                        id: uuid()
                    })
                    setMinting(false);
                },
                onCompleted: (data) => {
                    setMinting(false);
                    setFunded(true);
                    setDiscourseId(data.createDiscourse.id);
                }
            })
        })
    }


    const handleFundClick = async () => {
        if (supportedChainIds.includes(activeChain?.id!)) {
            if(acceptTerms){
                addToast({
                    title: "Waiting for confirmation",
                    body: `Please approve the transaction on your wallet. It may take a few minutes to complete.`,
                    type: ToastTypes.wait,
                    duration: 5000,
                    id: uuid()
                })
                setMinting(true);
                fund.write();
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
                title: "Unsupported Chain",
                body: "This chain is not supported. Please use a supported chain.",
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

                            <p className='text-[#E5F7FFE5] text-[13px]'>This is initial funding of the discourse required from creator. Need to fund min 1 {getCurrencyName(activeChain?.id!)}</p>

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
                                        <p className='text-[#E5F7FFE5] text-medium text-xs w-full'>{amount} {getCurrencyName(data.getDiscourseById.chainId)} will be funded to the discourse.</p>
                                    </div>
                                    <div className='flex items-center justify-center gap-2'>
                                        <UseAnimations animation={loading} size={20} strokeColor="#ffffff" className='text-white' />
                                        <p className='text-sm text-[#E5F7FFE5] font-semibold' >Please Wait...</p>
                                    </div>
                            </div> 
                        </>}
                        
                    {/* Minted Post */}
                    {!minting && funded &&
                        <>
                            <Dialog.Title className="text-white text-base  font-bold tracking-wide flex items-center gap-2 w-max self-center mx-auto ">
                                <DiscourseIcon />

                                Discourse Created
                            </Dialog.Title>
                            <Dialog.Description className="flex flex-col  w-full items-center  gap-4 text-center justify-between mt-4">
                                <p className='text-[#c6c6c6] text-medium text-xs max-w-[40ch] flex-[1] '>Discourse created! Click Discourse button below to go to the discourse page.</p>
                                <div className='flex items-center justify-center w-full gap-10'>
                                    <a href={`${activeChain?.blockExplorers?.default.url}/tx/${txn}`} target="_blank" className='text-xs text-green-300  ' rel="noreferrer" >Transaction ↗</a>
                                    {discourseId !== "" && <button onClick={() => route.push(`/${discourseId}`)} className='text-xs font-bold  text-gradient' >Discourse &rarr;</button>}
                                </div>
                            </Dialog.Description>
                        </>
                    }

                </div>
            </div>
        </Dialog>
    );
}



export default CreateDiscourseDialog;