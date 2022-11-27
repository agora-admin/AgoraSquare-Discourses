import {useState,useEffect,useContext} from "react"
import { useQuery } from "@apollo/client"
import Head from "next/head"
import { useRouter } from "next/router"
import Layout from "../../components/layout/Layout"
import TopBar from "../../components/topbar/TopBar"
import AppContext from "../../components/utils/AppContext"
import { GET_DISCOURSE_BY_ID } from "../../lib/queries"
import LoadingSpinner from "../../components/utils/LoadingSpinner"
import ClaimMessageDialogBox from "../../components/dialogs/ClaimMessageDialogBox"
import { useContractWrite, useNetwork, useWaitForTransaction } from "wagmi"
import { contractData } from "../../helper/ContractHelper"
import { ToastTypes } from "../../lib/Types"
import {v4 as uuid} from "uuid"

const NFTClaimPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [txn, setTxn] = useState("");
    const [openClaimMessageBox,setOpenClaimMessageBox] = useState(false);
    const [claiming,setClaiming] = useState(false);

    const { discourseId } = router.query;
    const { loggedIn,walletAddress,addToast } = useContext(AppContext);
    const { activeChain } = useNetwork();

    const { loading: Dloading, error, data } = useQuery(GET_DISCOURSE_BY_ID, {
        variables: {
            id: discourseId
        },
        nextFetchPolicy: 'network-only'
    })

    const claim = useContractWrite(
        contractData(activeChain?.id!),
        'mintSpeakerNFT',
        {
            args: [+2],
            overrides: { from: walletAddress },
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
                setClaiming(false);
            }
        }
    )

    const waitForTxn = useWaitForTransaction({
        hash: claim.data?.hash,
        onSettled: (txn) => {
            console.log('settled:', txn);
            if (txn) {
                setTxn(txn?.transactionHash);
            }
        }
    })

    const handleClaim = () => {
        setClaiming(true);
        setOpenClaimMessageBox(true);
        claim.write();
    }

    useEffect(() => {
        setLoading(Dloading);
    }, [Dloading, data])

    return (
        <div className="w-full h-screen overflow-x-clip">
                <Head>
                    <title>Claim NFT | AGORA SQUARE</title>
                    <meta name="description" content="Generated by create next app" />
                    <link rel="icon" href="/discourse_logo_fav.svg" />
                </Head>

                <Layout>
                    <TopBar onDiscoursePage={false} />
                    <ClaimMessageDialogBox open={openClaimMessageBox} setOpen={setOpenClaimMessageBox} />
                    <div className='w-full min-h-screen relative flex flex-col items-center py-4 sm:py-5 mobile:pb-[80px] gap-3 sm:gap-4 z-10'>
                        {
                            loading &&
                            <div className='flex-1 flex justify-center items-center'>
                                <LoadingSpinner strokeColor='#ffffff' />
                            </div>
                        }

                        {
                            error && 
                            <div className='w-full py-4 flex items-center justify-center mt-10'>
                                <img className='w-48' src="/404_dis.png" alt="404 not found" />
                            </div>
                        }

                        {!loading && data && !error &&
                            <>
                                {/* About Discourse*/}
                                <header className="flex flex-col items-center">
                                    <h5 className="text-[#D2B4FC] font-Lexend font-medium text-sm">thank you for funding</h5>
                                    <h1 className="max-w-md text-center font-Lexend font-semibold text-white text-4xl -tracking-[0.08em] leading-9 lowercase">{data.getDiscourseById.title}</h1>
                                    <small className="mt-1 max-w-sm text-center font-semibold text-sm text-[#E5F7FFE5] lowercase">claim a proof of funding NFt for your contribution to this discourse</small>
                                </header>

                                {/* NFT image */}
                                <div className="w-[481px] h-[481px] nft-shadow bg-transparent rounded-[52px]">
                                    <img src="/discourse_nft1.png" className="" />
                                </div>

                                {/* Claim Button */}
                                <button onClick={handleClaim} className="max-w-[481px] font-Lexend font-medium text-black text-sm w-full py-3 rounded-2xl bg-[#D2B4FC] border-2 border-[#1E1E1E]">Claim Now</button>
                            </>
                        }
                    </div>
                </Layout>
            </div>
    )
}

export default NFTClaimPage