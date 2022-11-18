import { useLazyQuery, useQuery } from "@apollo/client";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { useDebounce } from "react-use";
import { CHECK_TITLE } from "../../lib/queries";

interface Props {
    title: string;
    setTitle: Dispatch<SetStateAction<string>>;
}

const TitleInput: FC<Props> = ({ title, setTitle }) => {

    const [val, setVal] = useState("");
    const [error, setError] = useState("");
    const [ fetch, { data }] = useLazyQuery(CHECK_TITLE,{
        onCompleted(data) {
            console.log("Inside TitleInput: ",{data});
            
            if(data.checkTitle) {
                setTitle(val);
                setError("");
            } else if(val !== "") {
                setError("Error: Discourse with same title exist");
                setTitle("");
            }else setError("");
        },
    });

    const [, cancel] = useDebounce(
        () => {
            fetch({ variables: { title: val } });
        },
        1000,
        [val]
    )

    return (
        <>
        <input value={val} onChange={(e) => setVal(e.target.value)} className="max-w-[585px] input-s" id="title" type="text" placeholder="title" />
        {error && <p className="text-xs font-Lexend text-red-400">{error}</p>}
        </>

    );
}

export default TitleInput;