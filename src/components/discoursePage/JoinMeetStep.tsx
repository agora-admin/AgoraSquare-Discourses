import { useContext } from "react";
import { speakerConfirmed } from "../../helper/DataHelper";
import JoinMeetCard from "../actions/meet/JoinMeetCard";
import JoinMeetCardIrl from "../actions/meet/JoinMeetCardIrl";
import AppContext from "../utils/AppContext";

const JoinMeetStep = ({data,slotConfirmed}:{data:any,slotConfirmed: (data:any) => boolean}) => {
    const { loggedIn, t_connected, t_handle } = useContext(AppContext);

    return (
        <>
        {
            slotConfirmed(data.getDiscourseById) && !data.getDiscourseById.irl &&
            <JoinMeetCard data={data.getDiscourseById} />
        }

        {
            loggedIn && t_connected && data.getDiscourseById.irl && speakerConfirmed(data.getDiscourseById, t_handle) &&
            <JoinMeetCardIrl data={data.getDiscourseById} />
        }
        </>   
    )
}

export default JoinMeetStep;