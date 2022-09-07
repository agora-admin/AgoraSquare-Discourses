import Head from "next/head";
import DiscourseLongList from "../../components/cards/DiscourseLongList";
import Layout from "../../components/layout/Layout";
import Branding from "../../components/utils/Branding";
import { useRouter } from "next/router";
import { BoxSearch, Clock, Maximize4, MoneyRecive, PathTool, Profile2User, Wallet1, Warning2 } from "iconsax-react";
import { GET_DISCOURSE_BY_ID } from "../../lib/queries";
import { PARTICIPATE, TEST } from "../../lib/mutations";
import { useMutation, useQuery } from "@apollo/client";
import { keccak256, shortAddress, validateEmail } from "../../helper/StringHelper";
import { formatDate, getAgo, getAgoT, getTime, isPast } from "../../helper/TimeHelper";
import { getFund, getFundTotal, hasFunded } from "../../helper/FundHelper";
import { useContext, useEffect, useState } from "react";
import LoadingSpinner from "../../components/utils/LoadingSpinner";
import ConnectWalletDailog from "../../components/dialogs/ConnectWalletDailog";
import TopBar from "../../components/topbar/TopBar";
import { ParticipatedIcon, ParticipateIcon, RightArrowGradient, SpeakerConfirmationIcon, TwitterIcon } from "../../components/utils/SvgHub";
import DiscourseHub from '../../web3/abi/DiscourseHub.json';
import Addresses from '../../web3/addresses.json';
import Web3 from "web3";
import FundDiscourseDialog from "../../components/dialogs/FundDiscourseDialog";
import FundsDialog from "../../components/dialogs/FundsDialog";
import Link from "next/link";
import SpeakerConfirmationCard from "../../components/actions/SpeakerConfirmationCard";
import ParticipateCard from "../../components/actions/ParticipateCard";
import ParticipatedCard from "../../components/cards/ParticipatedCard";
import { canClaimC, discouresEnded, discourseConfirmed, fundingDone, getStateTS, hasWithdrawn, isSpeaker, isSpeakerWallet, speakerConfirmed } from "../../helper/DataHelper";
import SlotCard from "../../components/actions/SlotCard";
import JoinMeetCard from "../../components/actions/meet/JoinMeetCard";
import FundClaimCardT from "../../components/actions/FundClaimCardT";
import FundClaimCardC from "../../components/actions/FundClaimCardC";
import { chain, useNetwork } from "wagmi";
import BDecoration from "../../components/utils/BDecoration";
import Cookies from 'js-cookie';
import AppContext from "../../components/utils/AppContext";
import ChainExplorer from "../../components/utils/ChainExplorer";
import { ToastTypes } from "../../lib/Types";
import { uuid } from "uuidv4";
import { getChainName, getCurrencyName } from "../../Constants";
import RecordingsCard from "../../components/actions/RecordingsCard";
import useTwitterProfile from "../../hooks/useTwitterProfile";
import EventTag from "../../components/utils/EventTag";
import VenueCard from "../../components/cards/VenueCard";

async function getDiscourseContract() {
    return await new (window as any).web3.eth.Contract(
        DiscourseHub,
        Addresses.discourse_daimond
    )
}


// export const getServerSideProps = async ({query} : { query : any}) => {
//     const discourseId = query.discourseId;
//     const { loading: Dloading, error, data } = useQuery(GET_DISCOURSE_BY_ID, {
//         variables: {
//             id: discourseId
//         },
//         nextFetchPolicy: 'network-only'
//     })
//     return {
//         props: { query }
//     }
// }

const DiscoursePage = () => {

    const route = useRouter();
    const [loading, setLoading] = useState(true);
    const [openConnectWallet, setOpenConnectWallet] = useState(false);
    const [openFund, setOpenFund] = useState(false);
    const [openViewFunds, setOpenViewFunds] = useState(false);

    const { discourseId } = route.query;

    const { loggedIn, walletAddress, t_connected, t_handle, addToast } = useContext(AppContext);

    const { loading: Dloading, error, data } = useQuery(GET_DISCOURSE_BY_ID, {
        variables: {
            id: discourseId
        },
        nextFetchPolicy: 'network-only'
    })

    useEffect(() => {
        setLoading(Dloading);
    }, [Dloading, data])

    const handleFund = async () => {
        if (loggedIn) {
            if (activeChain?.id === data.getDiscourseById.chainId) {
                setOpenFund((prev: boolean) => !prev);
            } else {
                addToast({
                    title: "Different Chain Error",
                    body: `This discourse is on [ ${getChainName(data.getDiscourseById.chainId)} ]. Please use the correct chain.`,
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
        let d = data.getDiscourseById.discourse;
        if (d.meet_date !== "") {
            return true;
        }
        return false;
    }

    const { activeChain, chains, switchNetworkAsync } = useNetwork();

    return (
        <div className="w-full h-screen overflow-x-clip">
            <Head>
                <title>Discourses by AGORA SQUARE</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/discourse_logo_fav.svg" />
                {data && <meta property="og:title" content={data.getDiscourseById.title} />}
                {data && <meta property="og:description" content={data.getDiscourseById.description} />}
                {/* TODO: <meta property="og:url" content="https://www.imdb.com/title/tt0117500/" /> */}
            </Head>

            <Layout >
                <BDecoration />

                <div className='w-full min-h-screen flex flex-col py-10 gap-4 z-10'>
                    {/* TopSection */}

                    <TopBar />

                    {/* Body */}
                    <div className="flex flex-col md:flex-row md:justify-between mt-10 mx-10 lg:mx-0">
                        {/* left section */}
                        {error && <div className='w-full py-4 flex items-center justify-center mt-10'>
                            <img className='w-48' src="/404_dis.png" alt="" />
                        </div>}
                        {!loading && data && !error &&
                            <div className="flex flex-col gap-2 w-full md:flex-[0.6]">
                                <h3 className="text-white font-semibold text-2xl">{data.getDiscourseById.title}</h3>
                                <div className="flex gap-2 items-center">
                                    <EventTag irl={data.getDiscourseById.irl} />
                                    <ChainExplorer data={data.getDiscourseById} />
                                    {/* <div className="h-1/2 rounded-xl w-[2px] bg-[#212427]" /> */}
                                    <PathTool size="16" color="#6a6a6a" />
                                    <div className='flex items-center gap-2 text-[#616162] text-sm font-semibold'>
                                        {/* <div className='bg-gradient-g w-4 h-4 rounded-xl' /> */}
                                        <p className='text-white/60 text-xs'>{shortAddress(data.getDiscourseById.prop_starter)}</p>
                                    </div>
                                    <p className="text-white/40 text-[10px] ">{getAgo(data?.getDiscourseById?.initTS)}</p>

                                </div>
                                <p className=" mt-4 w-full text-white/60 text-sm leading-5 tracking-wide">{data.getDiscourseById.description}</p>
                                <div className="bg-card flex flex-col gap-2 p-6 rounded-xl w-full md:max-w-[80%] mt-2">
                                    <h4 className="text-sm text-white/40">Topics :</h4>
                                    <ul className="list-inside">
                                        {
                                            data.getDiscourseById.topics.map((item: string, index: number) => (
                                                <li className="text-white/40 text-sm list-disc" key={index}>{item}</li>
                                            ))
                                        }
                                    </ul>
                                </div>

                                <div className="flex items-center gap-4 mt-8">
                                    <div className="flex flex-col">
                                        <p className=" w-full text-white/60 text-sm leading-5 tracking-wide">Total Stake:</p>
                                        <h3 className="text-white/80 text-lg font-bold tracking-wider">{getFundTotal(data.getDiscourseById.funds)} {getCurrencyName(data.getDiscourseById.chainId)}</h3>
                                    </div>
                                    {!fundingDone(data.getDiscourseById) && <div className="h-[80%] w-[2px] bg-[#212427]" />}
                                    {!fundingDone(data.getDiscourseById) && <div className='flex flex-col gap-1'>
                                        <div className='flex items-end gap-2'>
                                            <Wallet1 size="16" color="#68D391" variant='Bold' />
                                            <p className='uppercase text-[10px] text-[#68D391] tracking-wider font-medium'>funding</p>
                                        </div>
                                        <div className='flex items-end gap-2'>
                                            <Clock size="16" color="#6a6a6a" />
                                            <p className='uppercase text-[10px] text-[#6a6a6a] tracking-wider font-semibold'>{formatDate(getTime(data.getDiscourseById.endTS))}</p>
                                        </div>
                                    </div>}
                                </div>

                                {/* Condition to check the funding period */}
                                { !data.getDiscourseById.irl && data.getSlotById && fundingDone(data.getDiscourseById) && discourseConfirmed(data.getDiscourseById) && isSpeakerWallet(data, walletAddress) && getStateTS(data.getDiscourseById) === 1 &&
                                    <SlotCard id={data.getDiscourseById.id} propId={+data.getDiscourseById.propId} chainId={+data.getDiscourseById.chainId} endTS={+data.getDiscourseById.endTS} data={data.getSlotById} />
                                }

                            </div>}

                        {/* Right section */}
                        <div className="flex flex-col gap-4 flex-[0.3] mt-10 max-w-xs md:mt-0">
                            {/* Card Speakers */}
                            {
                                loading &&
                                <div className='w-full py-4 flex items-center justify-center'>
                                    <LoadingSpinner strokeColor='#ffffff' />
                                </div>
                            }
                            {!loading && data && !error &&
                                <>
                                    
                                    {
                                        !discourseConfirmed(data.getDiscourseById) && fundingDone(data.getDiscourseById) &&
                                        <FundClaimCardT data={data.getDiscourseById} />
                                    }

                                    {
                                        getStateTS(data.getDiscourseById) === 3 && canClaimC(data.getDiscourseById, walletAddress) && !hasWithdrawn(data.getDiscourseById, walletAddress) &&
                                        <FundClaimCardC data={data.getDiscourseById} />
                                    }

                                    {
                                        getStateTS(data.getDiscourseById) === 3 &&
                                        <RecordingsCard data={data.getDiscourseById} />
                                    }

                                    {
                                        slotConfirmed(data) && !data.getDiscourseById.irl &&
                                        <JoinMeetCard data={data.getDiscourseById} />
                                    }
                                    {/* Speaker message */}
                                    {!fundingDone(data.getDiscourseById) && <>
                                        {
                                            loggedIn && t_connected && isSpeaker(data, t_handle) && !speakerConfirmed(data, t_handle) &&
                                            !slotConfirmed(data) &&
                                            <SpeakerConfirmationCard data={data.getDiscourseById} />
                                        }
                                        {
                                            loggedIn && t_connected && isSpeaker(data, t_handle) && speakerConfirmed(data, t_handle) &&
                                            !slotConfirmed(data) &&
                                            <div className="bg-gradient rounded-xl p-4 flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <SpeakerConfirmationIcon />
                                                    <p className="text-[#212221] font-Lexend font-semibold text-sm">You&apos;ve confirmed</p>
                                                </div>
                                                {/* { !isParticipant(data.getDiscourseById) && <p className="text-[#212221] font-medium text-[10px] mt-2">
                                            Please participate by providing email below to get access to meet.
                                        </p>} */}
                                            </div>
                                        }
                                    </>}
                                    {
                                        loggedIn && !t_connected && getStateTS(data.getDiscourseById) === 0 &&
                                        <div className="bg-card rounded-xl p-4 flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <TwitterIcon />
                                                <p className="text-gradient font-Lexend font-bold text-sm">Are you a speaker?</p>
                                            </div>
                                            <p className="text-[#c6c6c6] text-[10px] mt-2">
                                                Connect you wallet with twitter account get the speakers previleges for the discourse you&apos;re invited to.
                                                <Link href="/link">
                                                    <a className="text-[#1DA1F2]"> Click here to link</a>
                                                </Link>
                                            </p>
                                        </div>
                                    }
                                    {/* {
                                        
                                        <div className="bg-card rounded-xl p-4 flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <p className="text-gradient font-Lexend font-bold text-sm">Test</p>
                                            </div>
                                            <button onClick={() => handleHi()} className="button-s text-xs">Mighty Button</button>
                                        </div>
                                    } */}

                                    {/* Participation card
                                    {user.isLoggedIn && 
                                        <ParticipateCard data={data?.getDiscourseById} />
                                    } */}

                                    <div className="flex flex-col gap-2 bg-card rounded-xl p-4">
                                        <div className="flex items-center gap-2">
                                            <Profile2User size="18" color="#797979" />
                                            <p className="font-medium text-sm font-Lexend text-[#797979]">Speakers</p>
                                        </div>

                                        <div className='flex items-center gap-1 mt-2'>
                                            {/* avatar */}
                                            <div className='flex items-center w-16 h-8 relative'>
                                                <div className='flex items-center w-8 h-8 rounded-xl ring-[3px] ring-[#141515] overflow-clip'>
                                                    <img className="scale-105 w-8 h-8 object-cover rounded-xl object-center" src={data.getDiscourseById.speakers[0]?.image_url} alt="" />
                                                </div>
                                                <div className='flex items-center absolute left-[35%] w-8 h-8 rounded-xl ring-[3px] ring-[#141515] overflow-clip'>
                                                    <img className="scale-105 w-8 h-8 object-cover rounded-xl object-center" src={data.getDiscourseById.speakers[1]?.image_url} alt="" />
                                                </div>
                                            </div>
                                            <div className='flex flex-col'>
                                                <a href={`https://twitter.com/${data.getDiscourseById.speakers[0]?.username}`} className='hover:text-white/60 text-white/30 text-xs tracking-wide font-medium'>{data.getDiscourseById.speakers[0]?.name}</a>
                                                <a href={`https://twitter.com/${data.getDiscourseById.speakers[1]?.username}`} className='hover:text-white/60 text-white/30 text-xs tracking-wide font-medium'>{data.getDiscourseById.speakers[1]?.name}</a>
                                            </div>
                                        </div>

                                        {!loggedIn &&
                                            <ConnectWalletDailog open={openConnectWallet} setOpen={setOpenConnectWallet} />
                                        }

                                        {
                                            loggedIn && !fundingDone(data.getDiscourseById) &&
                                            <FundDiscourseDialog open={openFund} setOpen={setOpenFund} discourse={data?.getDiscourseById} />
                                        }

                                        {loggedIn && !fundingDone(data.getDiscourseById) && <button onClick={handleFund} className='button-s w-max px-6 text-sm font-medium mt-4'>
                                            Fund
                                        </button>}
                                        {
                                            !loggedIn && !fundingDone(data.getDiscourseById) &&
                                            <p className="text-yellow-200/70 text-[10px] font-medium bg-yellow-200/10 px-2 rounded-md mt-2 py-1">You need to connect wallet to fund or participate.</p>
                                        }
                                    </div>

                                    {
                                        data.getDiscourseById.irl && 
                                        <VenueCard propId={+data.getDiscourseById.propId} chainId={+data.getDiscourseById.chainId} />
                                    }

                                    {/* Card funding */}
                                    <div className="flex flex-col gap-2 bg-card rounded-xl p-6">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <MoneyRecive size="18" color="#797979" />
                                                <p className="font-medium font-Lexend text-sm text-[#797979]">Recent Funding</p>
                                            </div>
                                            <button onClick={() => setOpenViewFunds((prev: boolean) => !prev)} className="button-i">
                                                <Maximize4 size="16" color="#797979" />
                                            </button>
                                        </div>

                                        {
                                            data.getDiscourseById.funds.length !== 0 &&
                                            <FundsDialog chainId={data.getDiscourseById.chainId} open={openViewFunds} setOpen={setOpenViewFunds} funds={data.getDiscourseById.funds} />
                                        }

                                        {/* list */}
                                        <div className="flex flex-col gap-1">

                                            {
                                                [].concat(data.getDiscourseById.funds)
                                                    .sort((a: any, b: any) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
                                                    .slice(0, data.getDiscourseById.funds.length > 3 ? 3 : data.getDiscourseById.funds.length)
                                                    .map((item: any, index: number) => (
                                                        <div key={index} className="flex flex-col gap-2 py-2">
                                                            <div className='flex items-center gap-2 text-[#616162] text-sm font-semibold'>
                                                                <div className='bg-gradient-g w-4 h-4 rounded-xl overflow-clip' >
                                                                    <img className="w-full h-full object-cover rounded-xl object-center" src={`https://avatar.tobi.sh/${item.address}`} alt="" />
                                                                </div>
                                                                <p className='text-white/60 text-xs'>{shortAddress(item.address)}</p>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-gradient text-sm font-bold">{getFund(item.amount)} {getCurrencyName(data.getDiscourseById.chainId)}</p>
                                                                <p className="text-white/40 text-[10px] ">{getAgoT(item.timestamp)}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                            }
                                        </div>
                                    </div>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </Layout>

        </div>
    );
}

export default DiscoursePage;