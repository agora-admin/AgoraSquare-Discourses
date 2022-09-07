import { useRouter } from "next/router";

const TokenErrorCard = () => {
    const route = useRouter();
    return (
        <div className="flex flex-col gap-4 mt-10 grow mx-20 ">
            <div className="relative bg-card max-w-md mx-auto min-h-[150px] w-full flex flex-col p-8 rounded-2xl">
                <h3 className="text-white/70 text-xl font-semibold font-Lexend">Error getting data!</h3>
                {<p className="text-[#c6c6c6] text-xs w-[50%] my-4">Try joining again from discourse page!</p>}
                <button onClick={() => route.back()} className="text-gradient w-max text-sm font-Lexend outline-none border-none">&larr; go back</button>

                <img className="absolute h-[80%] right-2 bottom-0 z-0" src="/link_bg.svg" alt="" />


            </div>
        </div>
    );
}

export default TokenErrorCard;