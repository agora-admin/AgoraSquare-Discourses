import { useLazyQuery } from "@apollo/client";
import { Dispatch, FC, SetStateAction, useState } from "react";
import { useDebounce } from "react-use";
import { CHECK_TITLE } from "../../lib/queries";

interface Props {
    setTitle: Dispatch<SetStateAction<string>>;
}

const TitleInput: FC<Props> = ({ setTitle }) => {
    const [val, setVal] = useState("");
    const [error, setError] = useState("");
    const [fetch] = useLazyQuery(CHECK_TITLE,{
        onCompleted(data) {
            console.log("Inside TitleInput: ",{data});
            
            if(data.checkTitle) {
                setTitle(val);
                setError("");
            } else if(val !== "") {
                setError("Error: A discourse with the same title already exists.");
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
            <input value={val} onChange={(e) => setVal(e.target.value)} className="max-w-[585px] input-s" id="title" type="text" placeholder="Title" />
            {error && <p className="text-xs font-Lexend text-red-400">{error}</p>}
        </>

    );
}

export default TitleInput;