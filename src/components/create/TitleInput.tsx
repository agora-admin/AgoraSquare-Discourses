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
            if(data.checkTitle) {
                setTitle(val);
                setError("");
            } else {
                setError("Error: Discourse with same title exist");
                setTitle("");
            }
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
        <input value={val} onChange={(e) => setVal(e.target.value)} className="max-w-full input-s py-3" id="title" type="text" placeholder="Title" />
        {error && <p className="text-xs font-Lexend text-red-400">{error}</p>}
        </>

    );
}

export default TitleInput;