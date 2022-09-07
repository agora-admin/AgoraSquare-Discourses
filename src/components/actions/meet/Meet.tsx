import DiscoursePop from "./DiscoursePop";
import {
    useHMSActions, useHMSStore, selectIsConnectedToRoom, selectPeers,
    selectCameraStreamByPeerID,
    selectHMSMessages,
    selectRoomState,
    selectIsLocalAudioEnabled,
    selectIsLocalVideoEnabled,
    useHMSNotifications,
    useCustomEvent,
    HMSNotificationTypes,
    selectPermissions
} from '@100mslive/react-sdk';
import { useEffect, useCallback, useRef, useState, useContext } from "react";
import { CallSlash, Message, MessageText1, Microphone2, MicrophoneSlash, Profile2User, Send, Send2, Video, VideoSlash } from "iconsax-react";
import Chat from "./Chat";
import { shortAddress } from "../../../helper/StringHelper";
import EndCallPop from "./EndCallPop";
import { useMutation, useLazyQuery } from "@apollo/client";
import { CHECK_STREAM, END_MEET, STOP_STREAM } from "../../../lib/mutations";
import { GET_DISCOURSE_BY_ID } from "../../../lib/queries";
import AppContext from "../../utils/AppContext";
import { ToastTypes } from "../../../lib/Types";
import { uuid } from "uuidv4";


const END_EVENT = "END_MEET_REQUEST";
const REJECT_END_EVENT = "END_MEET_REQUEST_REJECT";

const Meet = ({ dData }: { dData: any }) => {
    const hmsActions = useHMSActions();
    const [username, setUsername] = useState('');
    const [token, setToken] = useState('');
    const [showChat, setShowChat] = useState(false);
    const [showPing, setShowPing] = useState(false);
    const [endEventRequest, setEndEventRequest] = useState(false);
    const [endEventRequested, setEndEventRequested] = useState(false);

    const { addToast } = useContext(AppContext);

    const notification = useHMSNotifications();

    const isConnected = useHMSStore(selectIsConnectedToRoom);
    const audioEnabled = useHMSStore(selectIsLocalAudioEnabled);
    const videoEnabled = useHMSStore(selectIsLocalVideoEnabled);

    // onEvent to end
    const onEndEvent = useCallback((msg) => {

        if (msg.type === REJECT_END_EVENT) {
            setEndEventRequested(false);
            setEndEventRequest(false);
        } else if (msg.type === END_EVENT && msg.by !== getLocalPeer()?.id) {
            setEndEventRequest(true);
        }
    }, [])

    const { sendEvent } = useCustomEvent({
        onEvent: onEndEvent,
        type: END_EVENT
    });


    useEffect(() => {
    }, [isConnected, audioEnabled, videoEnabled]);


    useEffect(() => {
        if (!notification) {
            return;
        }

        if (notification.type === HMSNotificationTypes.PEER_JOINED) {
            addToast({
                title: 'New User Joined',
                body: shortAddress(notification.data?.customerUserId),
                type: ToastTypes.event,
                id: uuid(),
                duration: 3000
            })
        }
        if (notification.type === HMSNotificationTypes.PEER_LEFT) {
            addToast({
                title: 'User Left',
                body: shortAddress(notification.data?.customerUserId),
                type: ToastTypes.event,
                id: uuid(),
                duration: 3000
            })
        }

        if (notification.type === HMSNotificationTypes.NEW_MESSAGE) {
            if (!showChat && notification.data.type === "chat") {
                setShowPing(true);
            }
        }

        if (notification.type === HMSNotificationTypes.ROOM_ENDED) {
        }
    }, [notification])


    const peers = useHMSStore(selectPeers);
    const roomState = useHMSStore(selectRoomState);

    const [stopRec] = useMutation(STOP_STREAM, {
        variables: {
            id: dData.id
        }, onError: (error) => {
            console.log(error);
        }
    });
    const [checkS] = useMutation(CHECK_STREAM, {
        variables: {
            id: dData.id
        }
    });

    const getViewers = () => {
        return peers.filter((peer: any) => peer.roleName === 'viewer');
    }
    const getSpeakers = () => {
        return peers.filter((peer: any) => peer.roleName === 'speaker');
    }

    useEffect(() => {
        if (getSpeakers().length > 0) {
            if (getLocalPeer()?.roleName === 'speaker') {
                checkS();
            }
        } else {
            stopRec();
        }
        console.log(peers);
        

    }, [peers])

    const handleChatClick = () => {
        if (showChat) {
            setShowChat(false);
        } else {
            setShowChat(true);
            setShowPing(false);
        }
    }

    const getLocalPeer = () => {
        return peers.find((peer: any) => peer.isLocal === true);
    }

    const toggleVideo = async () => {
        await hmsActions.setLocalVideoEnabled(!videoEnabled);
    }
    const toggleAudio = async () => {
        await hmsActions.setLocalAudioEnabled(!audioEnabled);
    }

    const [endMeet] = useMutation(END_MEET, {
        variables: {
            propId: dData.propId,
            chainId: dData.chainId,
        }
    })

    const [refetch] = useLazyQuery(GET_DISCOURSE_BY_ID, {
        variables: {
            id: dData.id
        }
    })


    const handleEndCall = async () => {
        sendEvent({
            type: END_EVENT,
            by: getLocalPeer()?.id
        });
        setEndEventRequested(true);
    }

    const rejectEndCall = () => {
        sendEvent({
            type: REJECT_END_EVENT,
            by: getLocalPeer()?.id
        })
    }

    const endCall = () => {
        try {
            const lock = true;
            const reason = 'Discourse finished';
            hmsActions.endRoom(lock, reason);

            endMeet();
            refetch();
        } catch (error) {
            console.log(error);
            rejectEndCall();
        }
    }

    return (
        <>
            <div className="flex flex-col w-full items-center md:min-w-4xl sm:relative gap-4 t-all">

                <div className={` w-full justify-between flex-1 grow gap-4 ${getSpeakers().length === 0 ? 'min-h-[60vh] w-full max-w-[80vw] h-full' : ''} flex flex-col bg-card p-4 rounded-xl`}>

                    <div className="w-full flex items-center justify-between">
                        <div>
                            <DiscoursePop data={dData} />
                        </div>

                        {getLocalPeer()?.roleName !== 'speaker' && <button onClick={() => hmsActions.leave()} className="text-sm button-i px-4 flex items-center gap-2 font-Lexend text-[#fc8181]"> <CallSlash size='20' color="#fc8181" /> Leave </button>}
                        {getLocalPeer()?.roleName === 'speaker' &&
                            <>
                                {endEventRequested && <button disabled className="opacity-50 text-sm button-i-d px-4 flex items-center gap-2 font-Lexend text-[#fc8181]"> <CallSlash size='20' color="#fc8181" /> Requested </button>}
                                {endEventRequest &&
                                    <div className="flex items-center gap-1">
                                        <EndCallPop rejectEndCall={rejectEndCall} endRoom={endCall} />
                                        {/* <button onClick={rejectEndCall} className="text-sm button-i px-4 flex items-center gap-2 font-Lexend text-[#fc8181]"> <CallSlash size='20' color="#fc8181" /> Reject Call </button> */}
                                    </div>
                                }
                                {!endEventRequested && !endEventRequest && <button onClick={handleEndCall} className="text-sm button-i px-4 flex items-center gap-2 font-Lexend text-[#fc8181]"> <CallSlash size='20' color="#fc8181" /> End Call </button>}
                            </>
                        }
                    </div>

                    {
                        peers.filter(p => p.roleName === "speaker").length === 0 &&
                        <div className="inset-0 mx-auto my-auto w-full flex flex-col items-center justify-center">
                            <p className="text-sm text-[#c6c6c6] font-Lexend "> Waiting for speakers to join..</p>
                        </div>
                    }

                    <div className=" flex flex-col sm:grid sm:grid-cols-2 grid-flow-row w-full gap-2">
                        {
                            peers.filter(p => p.roleName === "speaker").slice(0, 2).map((peer) => (
                                <VideoTile key={peer.id} peer={peer} />
                            ))
                        }

                        {
                            peers.filter(p => p.roleName === "speaker").length === 1 &&
                            <div className="w-full h-full flex flex-col col-span-1 row-span-1 items-center justify-center">
                                <p className="text-sm text-[#c6c6c6] font-Lexend "> Waiting for other speaker </p>
                            </div>
                        }
                    </div>
                    <div className="w-full flex justify-center items-center pb-2">
                        {/* <div className="flex items-center gap-2">
                                            <p className="text-xs flex items-center gap-1 flex-row-reverse text-[#c6c6c6] font-Lexend">{getSpeakers().length} <Microphone2 size="16" color="#c6c6c6" /> </p>
                                            <div className="w-[2px] h-[12px] bg-[#212427]" />
                                            <p className="text-sm text-white font-Lexend">Demo Meet </p>
                                        </div> */}
                        <div className="flex items-center gap-2 self-center">
                            {getLocalPeer()?.roleName === "speaker" &&
                                <button onClick={() => toggleVideo()} className={`text-sm ${videoEnabled ? 'button-i-f' : 'button-i-f-e bg-[#fc8181]'}`}>
                                    {!videoEnabled && <VideoSlash size='20' color="#000000" />}
                                    {videoEnabled && <Video size='20' color="#c6c6c6" />}
                                </button>
                            }
                            {getLocalPeer()?.roleName === "speaker" &&
                                <button onClick={() => toggleAudio()} className={`text-sm ${audioEnabled ? 'button-i-f' : 'button-i-f-e bg-[#fc8181]'}`}>
                                    {!audioEnabled && <MicrophoneSlash size='20' color="#000000" />}
                                    {audioEnabled && <Microphone2 size='20' color="#c6c6c6" />}
                                </button>
                            }
                            <button onClick={() => handleChatClick()} className={`text-sm relative ${showChat ? 'button-i-f-e bg-blue-400' : 'button-i-f'}`}>
                                {!showChat && showPing && <div className="absolute animate-ping w-2 h-2 top-[-4px] right-0 rounded-full bg-red-400" />}
                                {!showChat && showPing && <div className="absolute  w-2 h-2 top-[-4px] right-0 rounded-full bg-red-400" />}
                                {!showChat && <Message size='20' color="#c6c6c6" />}
                                {showChat && <MessageText1 size='20' color="#000000" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {showChat && <Chat speakers={dData.speakers} open={showChat} setOpen={setShowChat} />}
        </>
    );
}

const VideoTile = ({ peer }: { peer: any }) => {
    const videoRef = useRef(null);
    const hmsActions = useHMSActions();
    const videoTrack = useHMSStore(selectCameraStreamByPeerID(peer.id));

    // console.log(peer);

    useEffect(() => {
        if (videoRef.current && videoTrack) {
            if (videoTrack.enabled) {
                hmsActions.attachVideo(videoTrack.id, videoRef.current);
            } else {
                hmsActions.detachVideo(videoTrack.id, videoRef.current);
            }
        }
    }, [videoTrack, hmsActions])


    return (
        <div className="flex relative rounded-xl overflow-clip bg-[#212427] items-center justify-center">
            <video className="min-w-[30vw] sm:min-w-[480px] aspect-[4/3] object-cover" ref={videoRef} autoPlay muted playsInline ></video>
            <div className="absolute bottom-2 left-2 bg-card border-none z-10 text-white px-2 py-1 flex items-center gap-2 rounded-md overflow-clip">
                <p className="text-[10px] sm:text-xs font-Lexend">{shortAddress(peer.customerUserId)}</p>
                <p className="text-[10px] sm:text-xs text-[#c6c6c6] font-Lexend">{peer.roleName}</p>
            </div>
        </div>
    )
}

export default Meet;