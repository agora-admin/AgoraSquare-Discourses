import Head from "next/head";
import Layout from "../../components/layout/Layout";
import { useRouter } from "next/router";
import { ArrowCircleRight } from "iconsax-react";
import { GET_DISCOURSE_BY_ID } from "../../lib/queries";
import { useQuery } from "@apollo/client";
import { getProfileImageUrl, shortAddress } from "../../helper/StringHelper";
import { getAgo, getAgoT } from "../../helper/TimeHelper";
import { getFund, getFundTotal } from "../../helper/FundHelper";
import { useContext, useEffect, useState } from "react";
import LoadingSpinner from "../../components/utils/LoadingSpinner";
import TopBar from "../../components/topbar/TopBar";
import { ArrowNE, EditIcon, IRLIcon, RecordingIcon, VirtualIcon} from "../../components/utils/SvgHub";
import FundDiscourseDialog from "../../components/dialogs/FundDiscourseDialog";
import Link from "next/link";
import { canClaimC, discourseConfirmed, DiscourseStateEnum, fundingDone, getStateTS, hasWithdrawn, isSpeaker, speakerConfirmed } from "../../helper/DataHelper";
import { useNetwork } from "wagmi";
import AppContext from "../../components/utils/AppContext";
import { Discourse, Fund, ToastTypes } from "../../lib/Types";
import { v4 as uuid } from "uuid";
import { getChainName, getCurrencyName } from "../../Constants";
import VenueCard from "../../components/cards/VenueCard";
import DateCardTwitter from "../../components/cards/DateCardTwitter";
import { ChainIcon } from "../../components/utils/ChainTag";
import DiscourseState from "../../components/discoursePage/DiscourseState";

const DiscoursePage = () => {
    const route = useRouter();
    const [loading, setLoading] = useState(true);
    const [openConnectWallet, setOpenConnectWallet] = useState(false);
    const [openFund, setOpenFund] = useState(false);
    
    const { discourseId } = route.query;
    
    const { loggedIn, walletAddress, t_connected, t_handle, addToast } = useContext(AppContext);
    
    const { loading: Dloading, error, data: discourseData } = useQuery<{getDiscourseById: Discourse}>(GET_DISCOURSE_BY_ID, {
        variables: {
            id: discourseId
        },
        nextFetchPolicy: 'network-only'
    })

    useEffect(() => {
        setLoading(Dloading);
    }, [Dloading, discourseData])

    const handleFund = async () => {
        console.log("handleFund");
        console.log({loggedIn});
        
        
        if (loggedIn) {
            if (chain?.id === discourseData?.getDiscourseById.chainId) {
                setOpenFund((prev: boolean) => !prev);
            } else {
                addToast({
                    title: "Different Chain Error",
                    body: `This discourse is on [ ${getChainName(discourseData?.getDiscourseById.chainId)} ]. Please use the correct chain.`,
                    type: ToastTypes.error,
                    duration: 6000,
                    id: uuid()
                })
            }
        } else {
            setOpenConnectWallet((prev: boolean) => !prev);
        }
    }

    const isMeetHappening = (data: any) => {
        let d = data.getDiscourseById.discourse;

        if (d.room_id !== "" && !d.ended) {
            return true;
        }
        return false;
    }

    const slotConfirmed = (data: any) => {
        let d = data.discourse;
        if (d.meet_date !== "") {
            return true;
        }
        return false;
    }

    const getChainExplorerUrl = () => {
        switch(discourseData?.getDiscourseById.chainId){
            case 137:
                return "https://polygonscan.com/tx/"+discourseData?.getDiscourseById.txnHash;
            case 80001:
                return "https://mumbai.polygonscan.com/tx/"+discourseData?.getDiscourseById.txnHash;
            case 71401:
                return "https://v1.testnet.gwscan.com/tx/"+discourseData?.getDiscourseById.txnHash;
            case 56:
                return "https://bscscan.com/tx/"+discourseData?.getDiscourseById.txnHash;
            default:
                return "https://etherscan.io/tx/"+discourseData?.getDiscourseById.txnHash;
        }
    }

    const checkNeedForPadding = () => {
        if(!discourseConfirmed(discourseData?.getDiscourseById) && fundingDone(discourseData?.getDiscourseById))
            return true;
        if(getStateTS(discourseData?.getDiscourseById) === DiscourseStateEnum.FINISHED && canClaimC(discourseData?.getDiscourseById, walletAddress) && !hasWithdrawn(discourseData?.getDiscourseById, walletAddress))
            return true;
        
        if(!fundingDone(discourseData?.getDiscourseById) && loggedIn && t_connected && isSpeaker(discourseData?.getDiscourseById, t_handle) && !speakerConfirmed(discourseData?.getDiscourseById, t_handle) && !slotConfirmed(discourseData?.getDiscourseById))
            return true;
        
        return false;
    }

    const { chain } = useNetwork();

    return (
        <div className="w-full h-screen overflow-x-clip">
            <Head>
                <title>Discourses | AGORA SQUARE</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/discourse_logo_fav.svg" />
                {discourseData && <meta property="og:title" content={discourseData?.getDiscourseById.title} />}
                {discourseData && <meta property="og:description" content={discourseData?.getDiscourseById.description} />}
            </Head>

            <Layout>
                {!loading && discourseData && !error && <TopBar onDiscoursePage discourseData={discourseData?.getDiscourseById} handleFund={handleFund}/>}
                <div className='w-full min-h-screen flex flex-col pt-3 gap-4 z-10'>
                    {
                        loading &&
                        <div className='flex-1 flex justify-center items-center'>
                            <LoadingSpinner strokeColor='#ffffff' />
                        </div>
                    }

                    {/* Body */}
                    {
                        error &&
                        <div className='w-full py-4 flex items-center justify-center mt-10'>
                            <img className='w-48' src="/404_dis.png" alt="404 not found" />
                        </div>
                    }

                    {!loading && discourseData && !error &&
                    <div className={`flex flex-col gap-3 pb-20 ${checkNeedForPadding() && "!pb-72"} sm:pb-5`}>
                        <DiscourseState discourseData={discourseData} propId={discourseData?.getDiscourseById.propId} chainId={discourseData?.getDiscourseById.chainId} slotConfirmed={slotConfirmed} />

                        <div className="flex flex-col gap-5">
                            {/* Top Section */}
                            <div className="w-full flex items-center justify-between sm:px-8">
                                <div className="flex items-center">
                                    <div className="relative flex items-center">
                                        <img className="w-11 h-11 object-cover rounded-2xl" src={getProfileImageUrl(discourseData?.getDiscourseById.speakers[0]?.image_url)} alt="user profile image" />
                                        <img className="relative top-0 right-3 w-11 h-11 object-cover rounded-2xl" src={getProfileImageUrl(discourseData?.getDiscourseById.speakers[1]?.image_url)} alt="user profile image" />
                                    </div>
                                
                                    <div className="flex flex-col gap-[6px]">
                                        <small className="font-Lexend text-base !leading-3 text-[#E5F7FF] font-medium lowercase">{discourseData?.getDiscourseById.speakers[0]?.name}</small>
                                        <small className="font-Lexend text-base !leading-3 text-[#E5F7FF] font-medium lowercase">{discourseData?.getDiscourseById.speakers[1]?.name}</small>
                                    </div>
                                </div>

                                {/* Check Recording Button */}
                                {
                                    (getStateTS(discourseData?.getDiscourseById) === DiscourseStateEnum.FINISHED) &&
                                    <>
                                        <Link href={discourseData?.getDiscourseById.irl ? discourseData?.getDiscourseById.yt_link : `/watch/${discourseData?.getDiscourseById.id}`} passHref>
                                            <div className="mobile:hidden flex items-center gap-2 bg-[#84B9D1] rounded-2xl p-3 cursor-pointer">
                                                <small className="text-xs font-Lexend text-black font-medium">Check recordings</small>
                                                <ArrowCircleRight color="#4F6F7D" variant="Bold"/>
                                            </div>
                                        </Link>

                                        <Link href={discourseData?.getDiscourseById.irl ? discourseData?.getDiscourseById.yt_link : `/watch/${discourseData?.getDiscourseById.id}`} passHref>
                                            <div className="sm:hidden bg-[#84B9D1] rounded-full p-2">
                                                <RecordingIcon size={20} />
                                            </div>
                                        </Link>
                                    </>
                                }

                                {/* Funding Button */}
                                {
                                    loggedIn && !fundingDone(discourseData?.getDiscourseById) && 
                                    <div onClick={handleFund} className="mobile2:hidden flex items-center gap-2 bg-[#D2B4FC] rounded-2xl px-4 py-2 cursor-pointer">
                                        <span className="text-xs font-Lexend text-black font-medium">Fund</span>
                                        <ArrowCircleRight color="#7E6C97" variant="Bulk" />
                                    </div>
                                }

                                {
                                    loggedIn && !fundingDone(discourseData?.getDiscourseById) &&
                                    <FundDiscourseDialog open={openFund} setOpen={setOpenFund} discourse={discourseData.getDiscourseById} />
                                }
                            </div>

                            {/* Discourse Content Section */}
                            <div className="bg-[#141414] rounded-3xl flex flex-col gap-3 p-5 px-7 mobile_discourse_content">
                                {/* Part 1 */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col  xs:flex-row xs:items-center gap-2 sm:gap-4">
                                        <div className="flex items-center gap-1">
                                            {discourseData?.getDiscourseById.irl ? <IRLIcon size={20} /> : <VirtualIcon size={20} /> }
                                            {discourseData?.getDiscourseById.irl ? <span className="font-Lexend font-medium text-xs text-[#FCB4BD]">IRL</span> :
                                            <span className="font-Lexend font-medium text-xs text-[#FCB4F5]">VIRTUAL</span>} 
                                        </div>

                                        <div className="hidden xs:block w-[1.5px] h-3 bg-white/20"/>

                                        <div className="flex items-center gap-1">
                                            <ChainIcon chainId={discourseData?.getDiscourseById.chainId} size={20} />
                                            <span className="font-Lexend font-medium text-xs text-[#714FE0]">{getChainName(discourseData?.getDiscourseById.chainId)}</span>
                                        </div>

                                        <div className="hidden xs:block w-[1.5px] h-3 bg-white/20"/>

                                        <a href={getChainExplorerUrl()} target="_blank" rel="noreferrer" className="flex items-center gap-1 cursor-pointer">
                                            <EditIcon size={18} />
                                            <span className="font-Lexend font-medium text-xs underline text-[#E5F7FF]">{shortAddress(discourseData?.getDiscourseById.prop_starter)}</span>
                                            <ArrowNE />
                                        </a>
                                    </div>

                                    <div>
                                        <h1 className="text-2xl text-white lowercase -tracking-[0.08em] font-Lexend font-semibold">{discourseData?.getDiscourseById.title}</h1>
                                        <small className="text-[#7D8B92] text-xs font-Lexend font-semibold">{getAgo(discourseData?.getDiscourseById.initTS)}</small>
                                    </div>

                                    <p className="text-[#E5F7FFE5] font-semibold text-[11px] xs:text-xs">{discourseData?.getDiscourseById.description}</p>
                                </div>

                                {/* Divider */}
                                <div className="bg-[#1E1E1E] w-full h-[1.5px]" />

                                {/* Part 2 */}
                                <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-6">
                                    {/* Topics List */}
                                    <div className="flex-[0.6] md2:flex-auto flex flex-col gap-2 min-w-0 md2:min-w-[60%]">
                                        <small className="text-[#7D8B92] font-Lexend font-semibold">sub-topics</small>
                                        <ul className="list-inside flex flex-col gap-3 pl-4">
                                            {
                                                discourseData?.getDiscourseById.topics.map((item: string, index: number) => (
                                                    <li className="text-white text-xs" key={index}>{item}</li>
                                                ))
                                            }
                                        </ul>
                                    </div>

                                    {
                                        discourseData?.getDiscourseById.irl &&
                                        <> 
                                            {/* Divider */}
                                            <div className="w-full h-[1.5px] sm:w-[3px] sm:h-28 bg-[#1E1E1E]" />
                                            <div className="flex-[0.4] md2:flex-auto">
                                                <VenueCard propId={+discourseData?.getDiscourseById.propId} chainId={+discourseData?.getDiscourseById.chainId} />
                                            </div>
                                        </>
                                    }
                                    {
                                        !discourseData?.getDiscourseById.irl &&
                                        <> 
                                            {/* Divider */}
                                            <div className="w-full h-[1.5px] sm:w-[3px] sm:h-28 bg-[#1E1E1E]" />
                                            <a href="https://twitter.com/agora_square" target="_blank" rel="noreferrer">
                                            <div className="flex items-center gap-2 max-w-fit md:max-w-none bg-[#84B9D1] rounded-2xl p-3 cursor-pointer">
                                                    <small className="text-xs font-Lexend text-black font-medium">Agora Square Twitter</small>
                                                    <ArrowCircleRight color="#4F6F7D" variant="Bold" fill="#000"/>
                                                </div>
                                            </a>
                                        </>
                                    }
                                </div>
                            </div>

                            {/* Stats Section */}
                            <div className="flex flex-col gap-4 sm:px-8">
                                <div className="flex items-center gap-4">
                                    {/* Total Stake */}
                                    <div className="flex flex-col ">
                                        <small className="text-[#7D8B92] font-Lexend font-semibold text-xs xs:text-sm">total pledged</small>
                                        <small className="text-[#D2B4FC] font-Lexend font-semibold text-lg sm:text-xl">{getFundTotal(discourseData?.getDiscourseById.funds).toFixed(3)} <span className="text-xs">{getCurrencyName(discourseData?.getDiscourseById.chainId)}</span></small>
                                    </div>

                                    <div className="w-[1.5px] h-10 bg-white/20" />

                                    {/* Total pledger */}
                                    <div className="flex flex-col ">
                                        <small className="text-[#7D8B92] font-Lexend font-semibold text-xs xs:text-sm">total plegers</small>
                                        <small className="text-[#D2B4FC] font-Lexend font-semibold text-lg sm:text-xl">{discourseData?.getDiscourseById.funds.length}</small>
                                    </div>
                                </div>

                                <div className="w-full h-[1px] bg-[#1E1E1E]" />

                                {/* Funders list */}
                                <div className="flex flex-col gap-3">
                                    {
                                        ([] as Fund[]).concat(discourseData?.getDiscourseById.funds)
                                            .sort((a: any, b: any) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
                                            .map((item: any, index: number) => (
                                                <div key={uuid()} className="flex items-center gap-4">
                                                    <img src={`https://avatar.tobi.sh/${item.address}`} alt="profile image" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl" />

                                                    <div className="flex flex-col">
                                                        <div className="flex gap-2">
                                                            <span className="font-semibold text-[#7D8B92] text-[10px]">{shortAddress(item.address)}</span>
                                                            <span className="font-semibold text-[#7D8B92] text-[10px]">{getAgoT(item.timestamp)}</span>
                                                        </div>

                                                        <div className="font-Lexend font-semibold text-xs xs:text-sm sm:text-lg text-[#E5F7FFE5]">{getFund(item.amount)} {getCurrencyName(discourseData?.getDiscourseById.chainId)}</div>
                                                    </div>
                                                </div>
                                            ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    } 
                </div>
            </Layout>

        </div>
    );
}

export default DiscoursePage;