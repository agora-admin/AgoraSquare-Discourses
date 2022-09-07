import { Dialog, Transition } from '@headlessui/react';
import { Dispatch, FC, SetStateAction, useContext, useRef } from "react";
import { useRouter } from 'next/router';
import Web3 from "web3";
import { BigNumber, ethers } from "ethers";
import { useState, useEffect } from 'react';
import { useLazyQuery, useMutation, gql } from '@apollo/client';
import UseAnimations from 'react-useanimations';
import loading from 'react-useanimations/lib/loading';
import { DiscourseIcon, FundDiscourseIcon } from '../utils/SvgHub';
import DiscourseHub from '../../web3/abi/DiscourseHub.json';
import { CREATE_DISCOURSE } from '../../lib/mutations';
import { getSecNow } from '../../helper/TimeHelper';
import { GET_DISCOURSES } from '../../lib/queries';
import { chain, useContractRead, useContractWrite, useNetwork, useWaitForTransaction } from 'wagmi';
import { contractData } from '../../helper/ContractHelper';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import AppContext from '../utils/AppContext';
import { getCurrencyName, supportedChainIds } from '../../Constants';
import { ToastTypes } from '../../lib/Types';
import { uuid } from 'uuidv4';

interface Props {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    data: any;
}

const CreateDiscourseDialog: FC<Props> = ({ open, setOpen, data }) => {
    let buttonRef = useRef(null);
    const { loggedIn, walletAddress, addToast } = useContext(AppContext);

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
            let count = BigNumber.from(tData.data).toNumber();
            createDiscourse({
                variables: {
                    discourseInput: {
                        speakers: data.speakers,
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

                <div className={`${open ? 'animate-dEnter': 'animate-dExit'} relative bg-[#141515] border border-[#212427]  rounded-2xl max-w-sm w-full mx-auto px-6 py-4 sm:py-10 gap-4`}>
                    {/* Mint Post View */}
                    {!minting && !funded && <>
                        <Dialog.Title className="text-white text-base  font-bold tracking-wide flex items-center gap-2 w-max self-center mx-auto ">
                            <FundDiscourseIcon />

                            Fund Discourse
                        </Dialog.Title>
                        <Dialog.Description className="flex flex-col  w-full items-center  gap-4 text-center justify-between mt-4">
                            <p className='text-[#c6c6c6] text-medium text-xs max-w-[40ch] flex-[1] '>This is initial funding of the discourse required from creator. Need to fund min 0.01 {getCurrencyName(activeChain?.id!)}</p>
                            <div className='flex flex-col items-center justify-center w-full gap-4'>
                                <label htmlFor="amount" className='relative flex items-center'>
                                    <p className='absolute text-white m-auto inset-y-0 left-3 h-max'></p>
                                    <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" id='amount' className=" input-s pl-8 text-white" placeholder='Stake Amount' />
                                </label>
                                <button ref={buttonRef} onClick={handleFundClick} className='button-s font-semibold tracking-wide px-6 py-3  text-xs bg-[#212427] rounded-lg outline-none'>Fund &rarr;</button>
                            </div>
                        </Dialog.Description>
                    </>
                    }
                    {/* Minting.. Post View */}
                    {minting &&
                        <>
                            <Dialog.Title className="text-white text-base  font-bold tracking-wide flex items-center gap-2 w-max self-center mx-auto ">
                                <FundDiscourseIcon />
                                Creating Discourse
                            </Dialog.Title>
                            <Dialog.Description className="flex flex-col  w-full items-center  gap-4 text-center justify-between mt-4">
                                <p className='text-[#c6c6c6] text-medium text-xs max-w-[40ch] flex-[1] '>Approve the transaction from metamask.<br /> {amount} {getCurrencyName(activeChain?.id!)} will be funded to the discourse.</p>
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